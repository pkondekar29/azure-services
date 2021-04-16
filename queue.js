const { QueueServiceClient, StorageSharedKeyCredential } = require("@azure/storage-queue");

// Enter your storage account name and shared key
const account = "demoi353403";
const accountKey = "";

// Use StorageSharedKeyCredential with storage account and account key
// StorageSharedKeyCredential is only available in Node.js runtime, not in browsers
const sharedKeyCredential = new StorageSharedKeyCredential(account, accountKey);

const queueServiceClient = new QueueServiceClient(
    `https://${account}.queue.core.windows.net`,
    sharedKeyCredential,
    {
        retryOptions: { maxTries: 4 }, // Retry options
        telemetry: { value: "BasicSample/V11.0.0" } // Customized telemetry string
    }
);

async function listQueues() {
    let iter1 = queueServiceClient.listQueues();
    let i = 1;
    for await (const item of iter1) {
        console.log(`Queue${i}: ${item.name}`);
        i++;
    }
}

const queueName = "demo";

async function sendMessageToQueue() {
    const queueClient = queueServiceClient.getQueueClient(queueName);
    // Send a message into the queue using the sendMessage method.
    const sendMessageResponse = await queueClient.sendMessage("Hello World!");
    console.log(
        `Sent message successfully, service assigned message Id: ${sendMessageResponse.messageId}, service assigned request Id: ${sendMessageResponse.requestId}`
    );
}

async function peekMessages() {
    const queueClient = queueServiceClient.getQueueClient(queueName);
    const peekMessagesResponse = await queueClient.peekMessages();
    console.log(`The peeked message is: ${peekMessagesResponse.peekedMessageItems[0].messageText}`);
}

async function pollMessages() {
    const queueClient = queueServiceClient.getQueueClient(queueName);
    const response = await queueClient.receiveMessages();
    if (response.receivedMessageItems.length == 1) {
        const receivedMessageItem = response.receivedMessageItems[0];
        console.log(`Processing & deleting message with content: ${receivedMessageItem.messageText}`);
        const deleteMessageResponse = await queueClient.deleteMessage(
            receivedMessageItem.messageId,
            receivedMessageItem.popReceipt
        );
        console.log(
            `Delete message successfully, service assigned request Id: ${deleteMessageResponse.requestId}`
        );
    }
}

listQueues();
sendMessageToQueue();
peekMessages();
pollMessages();