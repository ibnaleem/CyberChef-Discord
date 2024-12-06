const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64-decode')
        .setDescription("Decode a Base64 encoded string into normal text")
        .addStringOption(option => option.setName('base64').setDescription("the Base64 encoded string you want to decode").setRequired(true)),

    async execute(interaction) {

        const message = interaction.options.getString('base64')

        base64Decoded = atob(message);
        
		await interaction.reply(base64Decoded);
    },
};