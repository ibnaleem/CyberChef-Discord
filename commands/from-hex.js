const { 
  SlashCommandBuilder, 
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('from-hex')
      .setDescription("Converts hexadecimal bytes into readable text, automatically detecting the delimiters"),

  hexadecimalField: new TextInputBuilder({
      customId: 'hexadecimal-field',
      label: "Hexadecimal String",
      placeholder: 'Enter the hexadecimal string you want to decode',
      style: TextInputStyle.Paragraph,
      required: true,
  }),

  async execute(interaction) {

      const firstActionRow = new ActionRowBuilder().addComponents(this.hexadecimalField);
      const modal = new ModalBuilder({
          customId: `hexadecimal-field-${interaction.user.id}`,
          title: 'Hexadecimal Decoder',
      });

      modal.addComponents(firstActionRow);

      try {
          await interaction.showModal(modal);
      } catch (error) {
          interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
          console.error(error);
          return;
      }

      const filter = (i) => i.customId === `hexadecimal-field-${interaction.user.id}`;

      interaction.awaitModalSubmit({ filter, time: 300_000 })
          .then(async ModalSubmitInteraction => {
              const hexadecimal = ModalSubmitInteraction.fields.getTextInputValue('hexadecimal-field');

              const delimiters = [
                  { name: 'Space', value: ' ' },
                  { name: 'Percent', value: '%' },
                  { name: 'Comma', value: ',' },
                  { name: 'Semi-colon', value: ';' },
                  { name: '0x', value: '0x' },
                  { name: '0x with comma', value: '0x,' },
                  { name: '\\x', value: '\\x' }
              ];

    
              let delimiter = '';
              for (const delim of delimiters) {
                  if (hexadecimal.includes(delim.value)) {
                      delimiter = delim.value;
                      break;
                  }
              }

              let hexValues = [];

              if (delimiter) {
                  hexValues = hexadecimal.split(delimiter).map(item => item.trim()).filter(item => item.length > 0);
              } else {
                  const hexPairs = hexadecimal.match(/.{2}/g);
                  if (hexPairs) {
                      hexValues = hexPairs;
                  } else {
                      await ModalSubmitInteraction.reply("Invalid hexadecimal format.");
                  }
              }

        
              let decodedText = hexValues.map(hex => {
                  if (hex.startsWith('0x') || hex.startsWith('\\x')) {
                      hex = hex.slice(2); // Remove '0x' or '\\x' prefix
                  }
                  return String.fromCharCode(parseInt(hex, 16)); // Convert hex to ASCII
              }).join('');

              await ModalSubmitInteraction.reply(decodedText);

          })
  },
};