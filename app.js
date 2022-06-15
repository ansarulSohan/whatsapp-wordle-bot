const { Client, LocalAuth, NoAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { connectDB } = require('./db');

const { Score } = require('./models/score');

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

// async function action() {}
client.on('message', async (message) => {
  try {
    const {
      body,
      _data: { notifyName: username },
    } = message;
    const chat = await message.getChat();
    const { isGroup, id } = chat;
    const userId = isGroup ? message.author : chat.id._serialized;
    const groupId = isGroup ? id._serialized : null;
    const groupName = isGroup ? chat.name : null;
    console.log(body, username, isGroup, userId, groupId);
    // console.log('*********');
    // console.log(message);
    console.log('------------');
    // console.log(chat);
    const values = body.match(
      /Wordle\s(?<game>\d+)\s(?<score>[1-6]{1})\/6(?:\r?\n){2}(?<attempts>(?:(?:⬜|🟨|⬛|🟩|🟦){5}(?:\r?\n)){0,5}(?:⬜|🟨|⬛|🟩|🟦){5})/
    );
    if (values) {
      const { game, score, attempts } = values.groups;
      const squares = attempts;
      const scoreObj = {
        userId,
        username,
        isGroup,
        groupId,
        groupName,
        gameNumber: parseInt(game),
        score: parseInt(score),
        squares,
      };
      const scoreDoc = new Score(scoreObj);
      await scoreDoc.save();
      console.log('saved');
      message.reply(`Saved ${score}/${game}`);
    }
    // message
    //   .getChat()
    //   .then((chat) => {
    //     const { isGroup, id } = chat;
    //     const { user: userId } = id;
    //     // const {}
    //     if (chat.isGroup) {
    //       const groupId = chat.id.user;
    //     }
    //   })
    //   .catch((err) => {
    //     console.log(err);
    //   });
  } catch (error) {
    console.log(error);
  }
});

// Initate the client
client.initialize();
