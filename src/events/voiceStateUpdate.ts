import { Events, EmbedBuilder, type VoiceState } from "discord.js";
import logger from "~/utils/logger";

export default {
  name: Events.VoiceStateUpdate,
  async execute(oldState: VoiceState, newState: VoiceState): Promise<void> {
    const channelId = process.env.CHANNEL_ID;
    if (!channelId || !newState.guild) return;
    const logChannel = newState.guild.channels.cache.get(channelId);
    if (!logChannel || !logChannel.isTextBased()) return;

    let logMsg = "";
    let embedDescription = "";

    if (!oldState.channelId && newState.channelId) {
      // User joined a voice channel
      logMsg = `New user joined a voice channel`;
      embedDescription = `${newState.member?.user.username} (<@${newState.member?.user.id}>) joined ${newState.channel?.name}`;
    } else if (oldState.channelId && !newState.channelId) {
      // User left a voice channel
      logMsg = `User left a voice channel`;
      embedDescription = `${oldState.member?.user.username} (<@${oldState.member?.user.id}>) left ${oldState.channel?.name}`;
    } else if (
      oldState.channelId &&
      newState.channelId &&
      oldState.channelId !== newState.channelId
    ) {
      // User moved to another voice channel
      logMsg = `User moved to another voice channel`;
      embedDescription = `${newState.member?.user.username} (<@${newState.member?.user.id}>) moved from ${oldState.channel?.name} (<#${oldState.channelId}>) to ${newState.channel?.name} (<#${newState.channelId}>)`;
    }

    if (logMsg && embedDescription) {
      const embed = new EmbedBuilder()
        .setDescription(embedDescription)
        .setColor(0x0099ff)
        .setTimestamp();

      await logChannel.send({ embeds: [embed] });
      logger.info(newState.member?.user.id ?? "unknown", logMsg);
    }
  },
};
