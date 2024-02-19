const { Client, GatewayIntentBits, Collection, SlashCommandBuilder, ActivityType } = require('discord.js');
const { readdirSync } = require('node:fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent, GatewayIntentBits.GuildPresences]
});

const baseURL = "https://nyaaapi.onrender.com/nyaa";

//https://nyaaapi.onrender.com/nyaa?q=ragna%20crimson&category=manga&sub_category=eng&page=1

const search = async (query) => {
    const response = await fetch(`${baseURL}?q=${query}`);
    const data = await response.json();
    return data;
}


client.commands = new Collection();

const commandFiles = readdirSync('/home/leaf/manga-bot/slashCommands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`/home/leaf/manga-bot/slashCommands/${file}`);
  client.commands.set(command.name, command);
}

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
    client.user.setPresence({
       activities: [{ name: `Nyaa`, type: ActivityType.Streaming }],
       status: 'dnd',
    });
    

    client.application.commands.set(client.commands);

})


client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;


  
    const { commandName } = interaction;
  
    const command = client.commands.get(commandName);
  
    if (!command) return;
  
    if(interaction.isAutocomplete()) {
      try {
        await command.autocomplete(interaction);
      } catch (error) {
        console.error(error);
      }
    }


    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
  });


  client.login('TOKEN HERE');
