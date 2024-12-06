const crypto = require('crypto');
const openpgp  = require('openpgp');
const { createPaste } = require('./paste');

const { 
  SlashCommandBuilder, 
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle 
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
      .setName('pgp-encrypt')
      .setDescription("Encrypt text using PGP encryption"),

  publickey: new TextInputBuilder({
    customId: `pub-key`,
    label: "Public Key (ASCII)",
    placeholder: "Paste recipient's public key in ASCII format",
    style: TextInputStyle.Paragraph,
    required: true,
  }),

  message: new TextInputBuilder({
      customId: `message-field`,
      label: "Message",
      placeholder: 'Disclaimer: Encryption occurs via the Discord API',
      style: TextInputStyle.Paragraph,
      required: true,
  }),

  async execute(interaction) {

      const firstActionRow = new ActionRowBuilder().addComponents(this.publickey);
      const secondActionRow = new ActionRowBuilder().addComponents(this.message);

      const modal = new ModalBuilder({
          customId: `message-field-${interaction.user.id}`,
          title: 'PGP Encryption',
      });

      modal.addComponents(firstActionRow);
      modal.addComponents(secondActionRow);

      try {
          await interaction.showModal(modal);
      } catch (error) {
          interaction.reply({ content: 'An error occurred while processing your request.', ephemeral: true });
          console.error(error);
          return;
      }

      const filter = (i) => i.customId === `message-field-${interaction.user.id}`;

      interaction.awaitModalSubmit({ filter, time: 300_000 })
          .then(async ModalSubmitInteraction => {
            const publicKeyArmored = ModalSubmitInteraction.fields.getTextInputValue('pub-key');
            const message = ModalSubmitInteraction.fields.getTextInputValue('message-field');
            const publicKey = await openpgp.readKey({ armoredKey: publicKeyArmored });
              try {
                
                const encrypted = await openpgp.encrypt({
                        message: await openpgp.createMessage({ text: message }),
                        encryptionKeys: publicKey,
                });

                const hashPwd = crypto.createHash('sha1')
                                        .update(encrypted)
                                        .digest('hex')

                const paste = await createPaste(hashPwd, encrypted)

                await ModalSubmitInteraction.reply(`\`\`\`https://paste.lcomrade.su/${paste.id}\`\`\``);
              } catch (error) {
                  await ModalSubmitInteraction.reply({ content: `An error occured: ${error}`, ephemeral: true });
              }
          })
  },
};