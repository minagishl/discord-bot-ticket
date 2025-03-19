import { Events, type Interaction } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.InteractionCreate,
  async execute(interaction: Interaction): Promise<void> {
    // Check if the interaction is a chat input command
    if (!interaction.isChatInputCommand()) return;

    // Get the command object from the client's commands collection
    const command = interaction.client.commands.get(interaction.commandName);

    // If the command does not exist, log an error and return
    if (command === undefined) {
      console.error(`The command ${interaction.commandName} does not exist.`);
      return;
    }

    try {
      // Execute the command and log the result
      await command.execute(interaction);
      logger.info(
        interaction.user.id,
        `The ${interaction.commandName} command has been executed.`
      );
    } catch (err: any) {
      // If an error occurs, log the error
      console.error(err);
      try {
        if (!interaction.replied && !interaction.deferred) {
          await interaction.reply({
            content: "An error occurred while executing the command.",
            ephemeral: true,
          });
        } else if (interaction.deferred) {
          await interaction.editReply({
            content: "An error occurred while executing the command.",
          });
        }
      } catch (replyError) {
        console.error("Error sending error response:", replyError);
      }
    }
  },
};
