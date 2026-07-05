const amqp = require('amqplib');

let channel = null;

async function connectQueue() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://jbooking-rabbitmq');
    channel = await connection.createChannel();
    await channel.assertQueue('email_queue', { durable: true });
    console.log('Payment Service: Connected to RabbitMQ');
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    setTimeout(connectQueue, 5000);
  }
}

async function sendEmailJob(email, transactionData) {
  if (!channel) return false;
  try {
    const payload = Buffer.from(JSON.stringify({ email, transactionData }));
    channel.sendToQueue('email_queue', payload, { persistent: true });
    return true;
  } catch (err) {
    console.error('Error pushing to email_queue:', err);
    return false;
  }
}

module.exports = { connectQueue, sendEmailJob };
