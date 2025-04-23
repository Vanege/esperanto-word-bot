// https://docs.google.com/spreadsheets/d/1V-kUyTMjvDA2XVk0DgBdAC3J8qvuq11KIcSqDmxvSOs/edit?gid=0#gid=0
const url = 'https://docs.google.com/spreadsheets/d/1V-kUyTMjvDA2XVk0DgBdAC3J8qvuq11KIcSqDmxvSOs/gviz/tq?sheet=Sheet1&tqx=out:json';

/**
 * Fetches data from a URL using native fetch
 * @param {string} url - The URL to fetch
 * @returns {Promise<string>} The response data
 */
async function fetchData(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return await response.text();
}

/**
 * Processes the raw response and extracts questions
 * @param {string} rawData - The raw response from Google Sheets
 * @returns {string[]} Array of questions
 */
function extractQuestions(rawData) {
  // Extract the JSON part from the response
  // The response format is: /*O_o*/ google.visualization.Query.setResponse({...});
  const jsonStr = rawData.substring(rawData.indexOf('{'), rawData.lastIndexOf('}') + 1);
  const parsedData = JSON.parse(jsonStr);

  // Extract questions into an array
  const questions = [];
  const rows = parsedData.table.rows;

  for (const row of rows) {
    if (row.c && row.c[0] && row.c[0].v) {
      questions.push(row.c[0].v);
    }
  }

  return questions;
}

/**
 * Selects a question based on the current date
 * @param {string[]} questions - Array of questions
 * @returns {object} Object containing the selected question and its index
 */
function selectDailyQuestion(questions) {
  // Get current date
  const today = new Date();

  // Base date: April 23, 2025
  const baseDate = new Date(2025, 3, 23); // Month is 0-indexed (3 = April)

  // Calculate days since April 23, 2025
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const daysSinceBase = Math.floor((today - baseDate) / millisecondsPerDay);

  // If today is before base date, use first question
  if (daysSinceBase < 0) {
    console.log('Today is before April 23, 2025 - using the first question');
    return {
      question: questions[0],
      index: 0
    };
  }

  // Calculate which question to use (looping if we reach the end)
  const selectedIndex = daysSinceBase % questions.length;

  return {
    question: questions[selectedIndex],
    index: selectedIndex
  };
}

///////////////////// discord bot

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

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, async () => {
  if (process.env.DISCORD_DEMANDO_DE_LA_TAGO_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(process.env.DISCORD_DEMANDO_DE_LA_TAGO_CHANNEL_ID);
      if (channel) {

        const data = await fetchData(url);

        // Extract questions
        const questions = extractQuestions(data);
        console.log(`Extracted ${questions.length} questions:`, questions);

        // Select today's question
        const result = selectDailyQuestion(questions);

        // Calculate reference data for explanation
        const baseDate = new Date(2025, 3, 23);
        const today = new Date();
        const millisecondsPerDay = 24 * 60 * 60 * 1000;
        const daysSinceBase = Math.floor((today - baseDate) / millisecondsPerDay);

        // Log results
        console.log(`Today's date: ${today.toDateString()}`);
        console.log(`Base date (April 23, 2025): ${baseDate.toDateString()}`);
        console.log(`Days since April 23, 2025: ${daysSinceBase}`);
        console.log(`Total questions available: ${questions.length}`);
        console.log(`Selected question index: ${result.index}`);
        console.log(`Today's Question: ${result.question}`);
        console.log(`Ready to use question: "${result.question}"`);

        await channel.send(`**${result.question}**`);
        console.log(`Sent question "${result.question}" to channel #${channel.name}`);
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