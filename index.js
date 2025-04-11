require("dotenv").config();
const { Client, GatewayIntentBits, Partials, EmbedBuilder, REST, Routes, SlashCommandBuilder, PermissionsBitField } = require("discord.js");
const offenseController = require("./controllers/offensecontroller");

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
  partials: [Partials.Message, Partials.Channel, Partials.GuildMember]
});

// Banned words list
const bannedWords = ["damn", "hell", "shit", "fuck", "bitch", "asshole", "bastard"];

client.once("ready", async () => {
  console.log(`✅ Sentara is online as ${client.user.tag}`);

  // Register slash commands
  const commands = [
    new SlashCommandBuilder()
      .setName("offenses")
      .setDescription("View offense history of a user (admin only)")
      .addUserOption(option =>
        option.setName("target").setDescription("User to view offenses for").setRequired(true)
      ),
    new SlashCommandBuilder()
      .setName("unsuspend")
      .setDescription("Unsuspend a user manually (admin only)")
      .addStringOption(option =>
        option.setName("userid").setDescription("User ID to unsuspend").setRequired(true)
      )
  ].map(command => command.toJSON());

  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_TOKEN);
  try {
    await rest.put(
      Routes.applicationCommands(client.user.id),
      { body: commands }
    );
    console.log("✅ Slash commands registered.");
  } catch (err) {
    console.error("❌ Failed to register slash commands:", err);
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  const msgContent = message.content.toLowerCase();
  const foundWord = bannedWords.find(word => msgContent.includes(word));

  if (foundWord) {
    const userId = message.author.id;
    const username = message.author.tag;

    const alreadySuspended = await offenseController.isUserSuspended(userId);
    if (alreadySuspended) return;

    await offenseController.logOffense(userId, username, msgContent);

    const offenseCount = await offenseController.getOffenseCount(userId);
    console.log(`⚠️ Offense ${offenseCount} logged for ${username}`);

    if (offenseCount >= 3) {
      try {
        await message.member.kick("Exceeded 3 offenses. Suspended until admin review.");
        await offenseController.logSuspension(userId, username);

        const embed = new EmbedBuilder()
          .setTitle("🚨 User Suspended")
          .setDescription(`${username} has been suspended after 3 rule violations.`)
          .setColor("Red")
          .addFields(
            { name: "User ID", value: userId },
            { name: "Total Offenses", value: `${offenseCount}` }
          )
          .setTimestamp();

        await message.channel.send({ embeds: [embed] });

      } catch (err) {
        console.error("❌ Error suspending user:", err);
        await message.channel.send("❌ Couldn't suspend the user. I may lack permission.");
      }
    } else {
      await message.reply(`⚠️ Please follow the rules. This is your offense #${offenseCount}.`);
    }
  }
});

// Slash Command Handler
client.on("interactionCreate", async interaction => {
  if (!interaction.isChatInputCommand()) return;

  const member = interaction.member;

  // Check if user has admin perms
  const isAdmin = member.permissions.has(PermissionsBitField.Flags.Administrator);

  if (interaction.commandName === "offenses") {
    if (!isAdmin) return interaction.reply({ content: "❌ You are not authorized.", ephemeral: true });

    const target = interaction.options.getUser("target");
    const history = await offenseController.getOffenseHistory(target.id);

    if (history.length === 0) {
      return interaction.reply({ content: `✅ No offenses found for ${target.tag}.`, ephemeral: true });
    }

    const offenseList = history.map((o, i) => `**${i + 1}.** "${o.message}" — <t:${Math.floor(new Date(o.timestamp).getTime() / 1000)}:R>`).join("\n");

    const embed = new EmbedBuilder()
      .setTitle(`📄 Offense History for ${target.tag}`)
      .setColor("Yellow")
      .setDescription(offenseList)
      .setFooter({ text: `User ID: ${target.id}` })
      .setTimestamp();

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }

  if (interaction.commandName === "unsuspend") {
    if (!isAdmin) return interaction.reply({ content: "❌ You are not authorized.", ephemeral: true });

    const userId = interaction.options.getString("userid");
    const success = await offenseController.clearSuspension(userId);

    if (success) {
      return interaction.reply({ content: `✅ Suspension lifted for user ID: ${userId}`, ephemeral: true });
    } else {
      return interaction.reply({ content: `⚠️ No active suspension found for user ID: ${userId}`, ephemeral: true });
    }
  }
});

client.login(process.env.DISCORD_TOKEN);
