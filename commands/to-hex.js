const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('to-hex')
      .setDescription("Converts the input string to hexadecimal bytes, separated by the specified delimiter.")
      .addStringOption(option => 
          option.setName('message')
              .setDescription("The message you want to convert to hexadecimal")
              .setRequired(true)
      )
      .addStringOption(option => 
          option.setName('delimiter')
              .setDescription("The delimiter to separate the hexadecimal bytes")
              .setRequired(false)
              .addChoices(
                  {name: 'Space', value: ' ' },
                  { name: 'Percent', value: '%' },
                  { name: 'Comma', value: ',' },
                  { name: 'Semi-colon', value: ';' },
                  { name: 'Line feed', value: '\n' },
                  { name: '0x', value: '0x' },
                  { name: '0x with comma', value: '0x,' },
                  { name: '\\x', value: '\\x' }
              )
      ),
      async execute(interaction) {
        const message = interaction.options.getString('message');
        const delimiter = interaction.options.getString('delimiter') || '';
        
        const hexString = Buffer.from(message, 'utf8').toString('hex');
        const hexBytes = hexString.match(/.{1,2}/g);
      
        let output;
        if (delimiter === '0x' || delimiter === '0x,') {
          output = hexBytes.map(byte => `0x${byte}`).join(delimiter === '0x,' ? ',' : '');
        } else if (delimiter === '\\x') {
          output = hexBytes.map(byte => `\\x${byte}`).join('');
        } else {
          output = hexBytes.join(delimiter);
        }
      
        await interaction.reply(output);
      }      
};