const { 
    SlashCommandBuilder, 
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64-encode')
        .setDescription("Encode your message into Base64"),

    messageField: new TextInputBuilder({
            customId: 'message-field',
            label: "Message",
            placeholder: 'The message you want to encode to Base64',
            style: TextInputStyle.Paragraph,
            required: true,
        }),

    async execute(interaction) {

        const firstActionRow = new ActionRowBuilder().addComponents(this.messageField);
        const modal = new ModalBuilder({
            customId: `message-field-${interaction.user.id}`,
            title: 'Base64 Encoder',
        });

        modal.addComponents(firstActionRow);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            console.error(error);
            return;
        }

        const filter = (i) => i.customId === `message-field-${interaction.user.id}`;

        interaction.awaitModalSubmit({ filter, time: 300_000})
            .then(async ModalSubmitInteraction => {
                const message = ModalSubmitInteraction.fields.getTextInputValue('message-field');
                
                base64Encoded = btoa(message);
                await ModalSubmitInteraction.reply(base64Encoded);
            })
    },
};