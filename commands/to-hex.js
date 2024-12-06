const { 
  SlashCommandBuilder, 
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('to-hex')
      .setDescription("Converts the input string to hexadecimal bytes, separated by the specified delimiter"),

  messageField: new TextInputBuilder({
      customId: 'message-field',
      label: "Message",
      placeholder: 'The message you want to convert to hexadecimal',
      style: TextInputStyle.Paragraph,
      required: true,
  }),

  delimiterField: new TextInputBuilder({
      customId: 'delimiter-field',
      label: "Delimiter",
      placeholder: 'Types: Space, Percent, Comma, Semi-colon, Line feed, 0x or 0x, \\x',
      style: TextInputStyle.Short,
      required: false,
  }),

  async execute(interaction) {

      const firstActionRow = new ActionRowBuilder().addComponents(this.messageField);
      const secondActionRow = new ActionRowBuilder().addComponents(this.delimiterField);
      const modal = new ModalBuilder({
          customId: `to-hex-modal-${interaction.user.id}`,
          title: 'Text to Hexadecimal Converter',
      });

      modal.addComponents(firstActionRow, secondActionRow);

      try {
          await interaction.showModal(modal);
      } catch (error) {
          interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
          console.error(error);
          return;
      }

      const filter = (i) => i.customId === `to-hex-modal-${interaction.user.id}`;

      interaction.awaitModalSubmit({ filter, time: 300_000 })
          .then(async ModalSubmitInteraction => {
              const message = ModalSubmitInteraction.fields.getTextInputValue('message-field');
              let delimiter = ModalSubmitInteraction.fields.getTextInputValue('delimiter-field') || '';

              const hexString = Buffer.from(message, 'utf8').toString('hex');
              const hexBytes = hexString.match(/.{1,2}/g);

              if (delimiter.toLowerCase() === "space") {
                 delimiter =' ';
              } else if (delimiter.toLowerCase() === "semi-colon" || "semicolon" || "semi colon") {
                 delimiter = ';';
              } else if (delimiter.toLowerCase() === "colon") {
                 delimiter = ':';
              } else if (delimiter.toLowerCase() === "percent") {
                 delimiter = '%';
              } else if (delimiter.toLowerCase() === "comma") {
                 delimiter = ',';
              } else if (delimiter.toLowerCase() === "line feed" || "line-feed" || "newline" || "new-line" || "new line") {
                 delimiter = '\n';
              } else if (delimiter.toLowerCase() === "0x with comma" || "0x-with-comma" || "0x with ,") {
                 delimiter = '0x,';
              }

              let output;
              if (delimiter === '0x' || delimiter === '0x,') {
                  output = hexBytes.map(byte => `0x${byte}`).join(delimiter === '0x,' ? ',' : '');
              } else if (delimiter === '\\x') {
                  output = hexBytes.map(byte => `\\x${byte}`).join('');
              } else {
                  output = hexBytes.join(delimiter);
              }

  
              await ModalSubmitInteraction.reply(output);
          });
  },
};