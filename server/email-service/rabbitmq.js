const amqp = require('amqplib');
const { sendBookingEmail } = require('./sendMail');

async function startEmailConsumer() {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://jbooking-rabbitmq');
    const channel = await connection.createChannel();
    await channel.assertQueue('email_queue', { durable: true });

    console.log('Email Service: Connected to RabbitMQ, waiting for jobs...');

    channel.consume('email_queue', async (msg) => {
      if (msg !== null) {
        try {
          const { email, transactionData } = JSON.parse(msg.content.toString());
          console.log(`Processing email job for ${email}`);
          await sendBookingEmail(email, transactionData);
          channel.ack(msg);
          console.log(`Email sent successfully to ${email}`);
        } catch (err) {
          console.error('Failed to process email job:', err);
          // If the error is fatal/malformed, you might want to ack to discard or nack to retry.
          // We'll reject it so it doesn't loop forever, or we could add retry logic later.
          channel.reject(msg, false); 
        }
      }
    });
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    setTimeout(startEmailConsumer, 5000);
  }
}

module.exports = { startEmailConsumer };
