import { ActivityType, type Client, Events } from "discord.js";

export default {
  name: Events.ClientReady,
  once: true,
  async execute(client: Client): Promise<void> {
    const setActivityStatus = (): void => {
      client.user?.setActivity("Get started using /create!", {
        type: ActivityType.Custom,
      });
    };

    // Initial setting
    setActivityStatus();

    // Set activity every 12 hours (12 * 60 * 60 * 1000 ms)
    setInterval(setActivityStatus, 43200000);

    // Log the username of the client when it is ready.
    console.log(`Logged in as ${client.user?.username}!`);
  },
};
