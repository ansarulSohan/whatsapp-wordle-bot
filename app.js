const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { connectDB } = require('./db');

// Create an instance of the Client
const client = new Client({
  authStrategy: new LocalAuth(),
});

// Upon generating a QR code, display it to the terminal for login
client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
});

// If the client is authenticated, display a success message
client.on('authenticated', () => {
  console.log('Client is authenticated');
});

// When the client is on ready, connect to db and log a success message
client.on('ready', () => {
  connectDB();
  console.log('Client is ready');
});

client.on('message', (message) => {
  message
    .getChat()
    .then((chat) => {
      if (chat.isGroup) {
        chat.getContact().then((contacts) => {
          console.log(contacts);
        });
      }
      console.log(chat);
    })
    .catch((err) => {
      console.log(err);
    });
  if (message.body === '!ping') {
    message.reply('pong');
  }
  if (message.body === '!help') {
    message.reply('!ping - pong');
  }
});

// Initate the client
client.initialize();
