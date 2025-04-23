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

function isFriday(date = new Date()) {
  return date.getDay() === 5;
}

client.once(Events.ClientReady, async () => {
  console.log(`Logged in as ${client.user.tag}!`);

  // Send random words to the specified channel
  if (isFriday() && process.env.DISCORD_FOTO_DE_LA_SEMAJNO_CHANNEL_ID) {
    try {
      const channel = await client.channels.fetch(process.env.DISCORD_FOTO_DE_LA_SEMAJNO_CHANNEL_ID);
      if (channel) {
        // Format the message with no line breaks
        const message = `**Estas vendredo! Sendu foton (aŭ bildon) kiun vi faris aŭ trovis en la lastaj 7 tagoj! Ne hezitu komenti la fotojn aŭ bildojn de aliaj!**`;
        await channel.send(message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }

    // Exit the process after sending the word
    console.log('Message sent! Exiting process...');
    client.destroy();
    process.exit(0);
  } else {
    console.log('Not friday or no CHANNEL_ID provided in .env file');
    client.destroy();
    process.exit(1);
  }
});

// Log in to Discord with your client's token
client.login(process.env.DISCORD_TOKEN);