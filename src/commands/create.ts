import {
  ChannelType,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import crypto from "crypto";

export default {
  data: new SlashCommandBuilder()
    .setName("create")
    .setDescription("Create a ticket as a user"),

  async execute(interaction: ChatInputCommandInteraction) {
    interaction.deferReply({ ephemeral: true });

    // Generate a random string
    const randomId = crypto.randomBytes(4).toString("hex");
    const categoryName = `ticket-${randomId}`;

    try {
      // Create a category
      const category = await interaction.guild?.channels.create({
        name: categoryName,
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
          {
            id: interaction.guild.id,
            deny: [PermissionFlagsBits.ViewChannel],
          },
          {
            id: interaction.user.id,
            allow: [PermissionFlagsBits.ViewChannel],
          },
          {
            // Grant permissions to admin role
            id:
              interaction.guild.roles.cache.find((role) =>
                role.permissions.has(PermissionFlagsBits.Administrator)
              )?.id || "",
            allow: [PermissionFlagsBits.ViewChannel],
          },
        ],
      });

      // Create text channel
      const textChannel = await interaction.guild?.channels.create({
        name: "text",
        type: ChannelType.GuildText,
        parent: category?.id,
      });

      // Send and pin the ticket ID message
      const idMessage = await textChannel?.send({
        content: `The ID of this ticket is as follows:\n\`\`\`\n${randomId}\n\`\`\``,
      });
      await idMessage?.pin();

      // Create voice channel
      await interaction.guild?.channels.create({
        name: "voice",
        type: ChannelType.GuildVoice,
        parent: category?.id,
      });

      await interaction.editReply({
        content: `Ticket created: ${categoryName}`,
      });
    } catch (error) {
      console.error("Error creating ticket:", error);
      await interaction.editReply({
        content: "An error occurred while creating the ticket.",
      });
    }
  },
};
