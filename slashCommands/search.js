const jikanjs = require("@mateoaranda/jikanjs");
const { EmbedBuilder } = require("discord.js");
const axios = require("axios"); 

module.exports = {
    name: "search",
    description: "Search for anime, manga, or a character",
    options: [
        {
            name: "type",
            description: "The type of search to perform",
            type: 3,
            required: true,
            choices: [
                { name: "Anime", value: "anime" },
                { name: "Manga", value: "manga" },
                { name: "Character", value: "character" }
            ]
        },
        {
            name: "query",
            description: "The query to search for",
            type: 3,
            required: true
        }
    ],
    async execute(interaction) {
        const type = interaction.options.getString("type");
        const query = interaction.options.getString("query");

        if (type === "manga") {
           const reply = await interaction.reply("Finding Manga");
            const results = await jikanjs.search("manga", query, 1);
            const id = results.data[0].mal_id;
            const images = await axios.get(`https://api.jikan.moe/v4/manga/${id}/full`).then(res => res.data);
            const jsonData = results.data[0];


            let authors = " ";

            for(let i = 0; i < jsonData.authors.length; i++) {
                authors += jsonData.authors[i].name + " ";
            }

            const fields = [
                { name: 'Japanese Name', value: jsonData.title_japanese + `(${jsonData.title}}` || 'N/A' ,inline: true},
                { name: 'English Name', value: jsonData.title_english || 'N/A', inline:true },
                { name: 'Authors', value: authors || 'N/A', inline:true },
                { name: 'Type', value: jsonData.type || 'N/A' , inline: true},
                { name: 'Volumes', value: String(jsonData.volumes) || 'N/A', inline: true },
                { name: 'Chapters', value: String(jsonData.chapters) || 'N/A',inline: true },
                { name: 'Status', value: jsonData.status || 'N/A',inline: true },
                { name: 'Rank', value: String(jsonData.rank) || 'N/A',inline: true },
                { name: 'Popularity', value: String(jsonData.popularity) || 'N/A',inline: true },

            ]
            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(jsonData.title)
                .setURL(jsonData.url)
                .setImage(images.data.images.jpg.image_url)
                .setDescription(jsonData.synopsis || 'No description available.');
                embed.addFields(fields);
                await interaction.editReply({ embeds: [embed], content: "" });
        } else if (type === "anime") {
            const reply = await interaction.reply("Finding Anime");
            const results = await jikanjs.search("anime", query, 1);
            const id = results.data[0].mal_id;
            const images = await axios.get(`https://api.jikan.moe/v4/anime/${id}/full`).then(res => res.data);
            const jsonData = results.data[0];


            const fields = [
                { name: 'Japanese Name', value: jsonData.title_japanese + `(${jsonData.title}}` || 'N/A',inline: true },
                { name: 'English Name', value: String(jsonData.title_english) || 'N/A',inline: true },
                { name: 'Type', value: String(jsonData.type) || 'N/A' ,inline: true},
                { name: 'Episodes', value: String(jsonData.episodes) || 'N/A' ,inline: true},
                { name: 'Status', value: String(jsonData.status) || 'N/A' ,inline: true},
                { name: 'Rank', value: String(jsonData.rank) || 'N/A',inline: true },
                { name: 'Popularity', value: String(jsonData.popularity) || 'N/A',inline: true },
            ]

            const embed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle(jsonData.title)
                .setURL(jsonData.url)
                .setDescription(jsonData.synopsis || 'No description available.')
                .setImage(images.data.images.jpg.image_url);
                embed.addFields(fields);
                await interaction.editReply({ embeds: [embed], content: "" });
            


        } else if (type === "character") {
            try {
                const reply = await interaction.reply("Finding Character");
                const results = await jikanjs.search("characters", query, 1);
                console.log(results);
                const data = results.data[0];
                console.log(data);
                const id = data.mal_id;
                console.log(id);
                const jsonData = await axios.get(`https://api.jikan.moe/v4/characters/${id}/full`).then(res => res.data);
                const fields = [
                    { name: 'Kanji Name', value: jsonData.data.name_kanji || 'N/A' },
                ];

                const embed = new EmbedBuilder()
                    .setColor('#3498db')
                    .setTitle(jsonData.data.name)
                    .setURL(jsonData.data.url)
                    .setDescription(jsonData.data.about || 'No description available.');

                embed.setImage(jsonData.data.images.jpg.image_url);

                embed.addFields(fields);

                await interaction.editReply({ embeds: [embed], content: "" });
                return;
            } catch (error) {
                console.error(error);
                await interaction.followUp("An error occurred while fetching character information.");
            }
        }
    }
}
