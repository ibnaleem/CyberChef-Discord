const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64-encode')
        .setDescription("Encode your message into Base64")
        .addStringOption(option => option.setName('message').setDescription("the message you want to Base64 encode").setRequired(true)),

    async execute(interaction) {

        const message = interaction.options.getString('message')

        base64Encoded = btoa(message);
        
		await interaction.reply(base64Encoded);
    },
};