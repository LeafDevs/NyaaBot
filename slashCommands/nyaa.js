const { ActionRowBuilder, ButtonBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  name: "nyaa",
  description: "Search nyaa.si",
  options: [
    {
      name: "manga",
      description: "Search manga",
      type: 1,
      options: [
        {
          name: "query",
          description: "Search query",
          type: 3,
          required: true
        }
      ]
    },
    {
      name: "anime",
      description: "Search anime",
      type: 1,
      options: [
        {
          name: "query",
          description: "Search query",
          type: 3,
          required: true
        }
      ]
    }
  ],
  async execute(interaction) {
    const query = interaction.options.getString('query');
    const baseUrl = 'https://nyaaapi.onrender.com/nyaa';
    const category = interaction.options.getSubcommand();
    const subCategory = 'eng';
    let currentPage = 1;
    let totalResults = [];

    const reply = await interaction.reply("Fetching Results!")

    async function fetchData(page) {
      const url = `${baseUrl}?q=${encodeURIComponent(query)}&category=${category}&sub_category=${subCategory}&sort=size&page=${page}`;
      const response = await axios.get(url);
      return response.data;
    }
    async function sendEmbed(index) {
      if (totalResults.length == 0) {
        await reply.edit("No results found.")
        return;
      }
      const torrent = totalResults[index];

      const embed = new EmbedBuilder()
        .setTitle(String(torrent.title))
        .setColor('#3498db')
        .addFields(
          { name: 'Size', value: String(torrent.size), inline: false },
          { name: 'Seeders', value: String(torrent.seeders), inline: false },
          { name: 'Leechers', value: String(torrent.leechers), inline: false },
          { name: 'Downloads', value: String(torrent.downloads), inline: false }
        )
        .setURL(torrent.link)
        .setTimestamp(new Date(torrent.time));

      const row = new ActionRowBuilder() // Updated to MessageActionRow
        .addComponents(
          new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(1),
          new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(1),
          new ButtonBuilder().setCustomId('magnet').setLabel('Magnet').setStyle(3),
          new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(2)
        );

      await reply.edit({ content: `Page: ${embedIndex + 1}/${totalResults.length}`, embeds: [embed], components: [row] });
    }

    async function fetchAllResults() {
      while (true) {
        const data = await fetchData(currentPage);

        if (!data || data.count === 0) {
          break;
        }

        totalResults.push(...data.data);
        currentPage++;

        if (data.count < 15) {
          break;
        }
      }
    }

    await fetchAllResults();
    let embedIndex = 0;
    await sendEmbed(embedIndex);

    const collector = interaction.channel.createMessageComponentCollector({
      filter: (i) =>
        i.isButton() &&
        i.user.id === interaction.user.id &&
        (i.customId === 'previous' || i.customId === 'next' || i.customId === 'magnet' || i.customId === 'close'),
      time: 60000, // 5 minutes
    });

    collector.on('collect', async (i) => {
      try {
        if (i.customId === 'previous' && embedIndex > 0) {
          embedIndex--;
        } else if (i.customId === 'next' && embedIndex < totalResults.length - 1) {
          embedIndex++;
        } else if (i.customId === 'magnet') {
          const magnetLink = totalResults[embedIndex].magnet;
          await i.reply({
            content: `${magnetLink}`,
            ephemeral: true,
          });
          return;
        }

        const torrent = totalResults[embedIndex];

        const embed = new EmbedBuilder()
          .setTitle(torrent.title)
          .setColor('#3498db')
          .addFields(
            { name: 'Size', value: String(torrent.size), inline: false },
            { name: 'Seeders', value: String(torrent.seeders), inline: false },
            { name: 'Leechers', value: String(torrent.leechers), inline: false },
            { name: 'Downloads', value: String(torrent.downloads), inline: false }
          )
          .setURL(torrent.link)
          .setTimestamp(new Date(torrent.time));

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder().setCustomId('previous').setLabel('Previous').setStyle(1),
            new ButtonBuilder().setCustomId('next').setLabel('Next').setStyle(1),
            new ButtonBuilder().setCustomId('magnet').setLabel('Magnet').setStyle(2),
            new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(3)
          );

        await i.update({ content: `Page: ${embedIndex + 1}/${totalResults.length}`, embeds: [embed], components: [row] });
      } catch (error) {
        return;
      }
    });

    collector.on('end', async () => {
      const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setCustomId('close').setLabel('Close').setStyle(3)
      );

      await reply.edit({ components: [row] }).catch(console.error);
    });
  },
}

