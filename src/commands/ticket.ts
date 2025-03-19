import {
  CategoryChannel,
  ChannelType,
  ChatInputCommandInteraction,
  GuildBasedChannel,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import crypto from "crypto";

export default {
  data: new SlashCommandBuilder()
    .setName("ticket")
    .setDescription("Command to manage tickets")
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand((subcommand) =>
      subcommand.setName("create").setDescription("Create a new ticket")
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("with")
        .setDescription("Create a ticket with a specific user")
        .addUserOption((option) =>
          option
            .setName("user")
            .setDescription("The user to create a ticket with")
            .setRequired(true)
        )
    )
    .addSubcommand((subcommand) =>
      subcommand
        .setName("delete")
        .setDescription("Delete a ticket")
        .addStringOption((option) =>
          option
            .setName("id")
            .setDescription("The ID of the ticket to delete (e.g. 1a2b3c4d)")
            .setRequired(true)
        )
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === "with") {
      await interaction.deferReply({ ephemeral: true });
      const targetUser = interaction.options.getUser("user", true);
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
              id: targetUser.id,
              allow: [PermissionFlagsBits.ViewChannel],
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
          content: `Ticket created with ${targetUser.tag}: ${categoryName}`,
        });
      } catch (error) {
        console.error("Error creating ticket:", error);
        await interaction.editReply({
          content: "An error occurred while creating the ticket.",
        });
      }
    } else if (subcommand === "create") {
      await interaction.deferReply({ ephemeral: true });
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
    } else if (subcommand === "delete") {
      await interaction.deferReply({ ephemeral: true });

      const ticketId = interaction.options.getString("id", true);
      const category = interaction.guild?.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === `ticket-${ticketId}`
      ) as CategoryChannel;

      if (!category) {
        await interaction.editReply({
          content: `No ticket found with ID: ${ticketId}`,
        });
        return;
      }

      try {
        // Send deletion message before deleting channels
        await interaction.editReply({
          content: "Deleting ticket...",
        });

        // Delete all channels in the category
        await Promise.all(
          category.children.cache.map((channel: GuildBasedChannel) =>
            channel.delete()
          )
        );
        // Delete the category
        await category.delete();
      } catch (error) {
        console.error("Error deleting ticket:", error);
        // Only try to send error message if the channel still exists
        try {
          await interaction.editReply({
            content: "An error occurred while deleting the ticket.",
          });
        } catch {
          console.error("Error sending error message");
        }
      }
    }
  },
};
