const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require("discord.js");
const offenseController = require("../controllers/offensecontroller");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("offenses")
    .setDescription("Check a user’s offense history (Admin only)")
    .addUserOption(option =>
      option.setName("target")
        .setDescription("The user to check")
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator), // Restrict to Admins

  async execute(interaction) {
    const targetUser = interaction.options.getUser("target");
    const history = await offenseController.getUserOffenses(targetUser.id);

    if (!history || history.length === 0) {
      return interaction.reply({ content: `✅ ${targetUser.tag} has a clean record.`, ephemeral: true });
    }

    const embed = new EmbedBuilder()
      .setTitle(`📄 Offense History for ${targetUser.tag}`)
      .setColor("Orange")
      .setTimestamp();

    history.slice(0, 10).forEach((offense, index) => {
      embed.addFields({
        name: `#${index + 1} — ${new Date(offense.timestamp).toLocaleString()}`,
        value: offense.message
      });
    });

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
};
