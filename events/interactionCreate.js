const { Events } = require("discord.js");

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction) {
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        console.error(
          `No command matching ${interaction.commandName} was found.`
        );
        return;
      }

      try {
        await command.execute(interaction);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        } else {
          await interaction.reply({
            content: "There was an error while executing this command!",
            ephemeral: true,
          });
        }
      }
    } else if (interaction.isButton()) {
      // const button = interaction.customId;
      // if (!button) {
      //   console.error(`No button matching ${interaction.customId} was found.`);
      //   return;
      // }
      // try {
      //   await button.execute(interaction);
      // } catch (error) {
      //   console.error(error);
      //   await interaction.reply({
      //     content: "There was an error while executing this button!",
      //     ephemeral: true,
      //   });
      // }
    } else if (interaction.isSelectMenu()) {
      const selectMenu = interaction.client.selectMenus.get(
        interaction.customId
      );

      if (!selectMenu) {
        console.error(
          `No select menu matching ${interaction.customId} was found.`
        );
        return;
      }

      try {
        await selectMenu.execute(interaction);
      } catch (error) {
        console.error(error);
        await interaction.reply({
          content: "There was an error while executing this select menu!",
          ephemeral: true,
        });
      }
    } else {
      console.error(
        `Unhandled interaction type: ${interaction.type} in ${
          interaction.commandName ?? "unknown command"
        }`
      );
    }
  },
};
