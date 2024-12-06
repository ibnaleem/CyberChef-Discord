const { 
    SlashCommandBuilder, 
    ActionRowBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('base64-decode')
        .setDescription("Decode a Base64 encoded string into normal text"),

    base64Field: new TextInputBuilder({
        customId: 'base64-field',
        label: "Base64 Encoded String",
        placeholder: 'Enter the Base64 string to decode',
        style: TextInputStyle.Paragraph,
        required: true,
    }),

    async execute(interaction) {

        const firstActionRow = new ActionRowBuilder().addComponents(this.base64Field);
        const modal = new ModalBuilder({
            customId: `base64-field-${interaction.user.id}`,
            title: 'Base64 Decoder',
        });

        modal.addComponents(firstActionRow);

        try {
            await interaction.showModal(modal);
        } catch (error) {
            interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
            console.error(error);
            return;
        }

        const filter = (i) => i.customId === `base64-field-${interaction.user.id}`;

        interaction.awaitModalSubmit({ filter, time: 300_000 })
            .then(async ModalSubmitInteraction => {
                const base64String = ModalSubmitInteraction.fields.getTextInputValue('base64-field');
                
                try {
                    const base64Decoded = atob(base64String);
                    await ModalSubmitInteraction.reply({base64Decoded});
                } catch (error) {
                    await ModalSubmitInteraction.reply({ content: 'Invalid Base64 string.', ephemeral: true });
                }
            })
    },
};