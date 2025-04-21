require('dotenv').config();
const fetch = require('node-fetch');
const TelegramBot = require('node-telegram-bot-api');

const BOT_TOKEN = process.env.BOT_TOKEN;
const CHAT_ID = process.env.CHAT_ID;

const bot = new TelegramBot(BOT_TOKEN);

async function getRandomWords() {
  const response = await fetch('https://raw.githubusercontent.com/Vanege/esperanto-frequency-list-tekstaro/main/EO%2015000%20Tekstaro%20filtered%20with%20ESPDIC.json');
  const words = await response.json();

  const randomWords = [];
  for (let i = 0; i < 3; i++) {
    const randomIndex = Math.floor(Math.random() * words.length);
    randomWords.push(words[randomIndex]);
  }

  return randomWords;
}

async function sendMessage() {
  try {
    const words = await getRandomWords();
    const message = `Today's random words:\n1. ${words[0]}\n2. ${words[1]}\n3. ${words[2]}`;
    await bot.sendMessage(CHAT_ID, message);
    console.log('Message sent successfully');
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

sendMessage();