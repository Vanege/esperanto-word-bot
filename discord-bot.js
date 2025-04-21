const { Client, GatewayIntentBits, Channels, Events } = require('discord.js');
require('dotenv').config();

// Create new client instance
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ]
});

const WORD_LIST_URL = 'https://raw.githubusercontent.com/Vanege/esperanto-frequency-list-tekstaro/refs/heads/main/EO%2015000%20Tekstaro%20filtered%20with%20ESPDIC.txt';
let wordList = [];

// Function to fetch and parse the word list
async function fetchWordList() {
  try {
    console.log('Fetching Esperanto word list...');
    const response = await fetch(WORD_LIST_URL);
    const data = await response.text();
    const allWords = data.split('\r\n').filter(word => word.trim());
    // Only use the first 5000 words
    wordList = allWords.slice(0, 5000);
    console.log(`Successfully loaded ${wordList.length} Esperanto words (limited to first 5000)!`);
  } catch (error) {
    console.error('Error fetching word list:', error);
  }
}

// Function to get a random word
function getRandomWord() {
  if (wordList.length === 0) {
    return 'No words loaded yet!';
  }
  const randomIndex = Math.floor(Math.random() * wordList.length);
  return wordList[randomIndex];
}

// Function to get two different random words
function getTwoRandomWords() {
  if (wordList.length < 2) {
    return ['No words loaded yet!', 'No words loaded yet!'];
  }

  const firstIndex = Math.floor(Math.random() * wordList.length);
  let secondIndex;

  do {
    secondIndex = Math.floor(Math.random() * wordList.length);
  } while (secondIndex === firstIndex);

  return [wordList[firstIndex], wordList[secondIndex]];
}

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Load the word list when the bot starts
  await fetchWordList();

  // Send random words to the specified channel
  if (process.env.DISCORD_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
      if (channel) {
        const [word1, word2] = getTwoRandomWords();

        // Format the message with no line breaks
        const message = `La vortoj de la tago estas **${word1}** kaj **${word2}**. Provu fari frazon per ili. Vi rajtas konjugacii kaj aldoni -j kaj -n.\n<https://vortaro.net/#${word1}_kd>\n<https://vortaro.net/#${word2}_kd>`;
        await channel.send(message);
        console.log(`Sent words "${word1}" and "${word2}" to channel #${channel.name}`);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Exit the process after sending the word
    console.log('Message sent! Exiting process...');
    client.destroy();
    process.exit(0);
  } else {
    console.log('No CHANNEL_ID provided in .env file');
    client.destroy();
    process.exit(1);
  }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);