const { exec } = require('child_process');

module.exports = {
  name: 'restart',
  description: 'Restart the manga service',
  async execute(interaction) {
    if(interaction.user.id != '922861688359899146') {
        await interaction.reply('You do not have permission to restart the bot.');
    }
    await interaction.reply({ content: 'Restarting manga service...', ephemeral: true })
    exec('sudo systemctl restart manga.service', (error) => {
      if (error) {
        console.error(`Error restarting manga service: ${error.message}`);
        return;
      }
    });
  },
};
