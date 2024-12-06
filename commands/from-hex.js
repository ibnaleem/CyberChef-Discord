const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('from-hex')
      .setDescription("Converts hexadecimal bytes into readable text, automatically detecting the delimiters.")
      .addStringOption(option => 
          option.setName('hexadecimal')
              .setDescription("The hexadecimal you want to decode")
              .setRequired(true)
      ),

  async execute(interaction) {
    const hexadecimal = interaction.options.getString('hexadecimal');

    // Define the delimiters
    const delimiters = [
      { name: 'Space', value: ' ' },
      { name: 'Percent', value: '%' },
      { name: 'Comma', value: ',' },
      { name: 'Semi-colon', value: ';' },
      { name: '0x', value: '0x' },
      { name: '0x with comma', value: '0x,' },
      { name: '\\x', value: '\\x' }
    ];

    // Check which delimiter is present in the input
    let delimiter = '';
    for (const delim of delimiters) {
      if (hexadecimal.includes(delim.value)) {
        delimiter = delim.value;
        break;
      }
    }

    let hexValues = [];

    if (delimiter) {
      // Split the hexadecimal string by the detected delimiter
      hexValues = hexadecimal.split(delimiter).map(item => item.trim()).filter(item => item.length > 0);
    } else {
      // If no delimiter is found, treat the string as a continuous raw hex string
      // This assumes the raw string is just a sequence of hex pairs like "48656c6c6f"
      const hexPairs = hexadecimal.match(/.{2}/g); // Matches every 2 characters (a single byte in hex)
      if (hexPairs) {
        hexValues = hexPairs;
      } else {
        return interaction.reply("Invalid hexadecimal format.");
      }
    }

    // Convert hexadecimal values to text
    let decodedText = hexValues.map(hex => {
      if (hex.startsWith('0x') || hex.startsWith('\\x')) {
        hex = hex.slice(2); // Remove '0x' or '\\x' prefix
      }
      return String.fromCharCode(parseInt(hex, 16)); // Convert hex to ASCII
    }).join('');

    // Send the decoded text as the response
    return interaction.reply(decodedText);
  }
};