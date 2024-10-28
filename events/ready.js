const { ActivityType, Events } = require("discord.js");

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`Ready! Logged in as ${client.user.tag}`);
    client.user.setActivity("💤💤💤", {
      type: ActivityType.Custom,
    });
  },
};
