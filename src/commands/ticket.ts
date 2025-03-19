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

    if (subcommand === "create") {
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
        await interaction.guild?.channels.create({
          name: "text",
          type: ChannelType.GuildText,
          parent: category?.id,
        });

        // Create voice channel
        await interaction.guild?.channels.create({
          name: "voice",
          type: ChannelType.GuildVoice,
          parent: category?.id,
        });

        await interaction.reply({
          content: `Ticket created: ${categoryName}`,
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error creating ticket:", error);
        await interaction.reply({
          content: "An error occurred while creating the ticket.",
          ephemeral: true,
        });
      }
    } else if (subcommand === "delete") {
      const ticketId = interaction.options.getString("id", true);
      const category = interaction.guild?.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === `ticket-${ticketId}`
      ) as CategoryChannel;

      if (!category) {
        await interaction.reply({
          content: `No ticket found with ID: ${ticketId}`,
          ephemeral: true,
        });
        return;
      }

      try {
        // Delete all channels in the category
        await Promise.all(
          category.children.cache.map((channel: GuildBasedChannel) =>
            channel.delete()
          )
        );
        // Delete the category
        await category.delete();

        await interaction.reply({
          content: "Ticket deleted.",
          ephemeral: true,
        });
      } catch (error) {
        console.error("Error deleting ticket:", error);
        await interaction.reply({
          content: "An error occurred while deleting the ticket.",
          ephemeral: true,
        });
      }
    }
  },
};
