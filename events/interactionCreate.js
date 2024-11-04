const {
  ActionRowBuilder,
  Events,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");
const { teams } = require("../assets/data/teams.json");
const { series_types } = require("../assets/data/series_types.json");

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
      const customId = interaction.customId;
      if (customId === "cancel") {
        // delete the message
        // await interaction.deleteReply();
        return;
      } else if (customId === "match_id" || customId === "show_match_id") {
        // do something

        // Create the modal
        const modal = new ModalBuilder()
          .setCustomId("myModal")
          .setTitle("請輸入房號");

        // Add components to modal

        // Create the text input components
        const matchIdTextInput = new TextInputBuilder()
          .setCustomId("matchIdTextInput")
          // The label is the prompt the user sees for this input
          .setLabel("請輸入房號")
          // Short means only a single line of text
          .setStyle(TextInputStyle.Short);

        // An action row only holds one text input,
        // so you need one action row per text input.
        const firstActionRow = new ActionRowBuilder().addComponents(
          matchIdTextInput
        );

        // Add inputs to the modal
        modal.addComponents(firstActionRow);

        // Show the modal to the user
        await interaction.showModal(modal);
      } else if (teams.map((team) => team.name).includes(customId)) {
        const components = interaction.message.components;
        const team = teams.find((team) => team.name === customId);
        const teamIndex = teams.indexOf(team);
        const teamRow = Math.floor(teamIndex / 4);
        const teamColumn = teamIndex % 4;
        components[teamRow].components[teamColumn] = new ButtonBuilder()
          .setCustomId(team.name)
          .setLabel(team.name)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);
        interaction.update({ components: components });

        // do something
      } else if (series_types.map(({ value }) => value).includes(customId)) {
        const components = interaction.message.components;
        const { label, value } = series_types.find(
          ({ value }) => value === customId
        );
        const seriesIndex = series_types
          .map(({ value }) => value)
          .indexOf(customId);
        components[2].components[seriesIndex] = new ButtonBuilder()
          .setCustomId(value)
          .setLabel(label)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);
        interaction.update({ components: components });

        // do something
      } else if (["game1", "game2", "game3"].includes(customId)) {
        const components = interaction.message.components;
        const gameIndex = ["game1", "game2", "game3"].indexOf(customId);
        components[3].components[gameIndex] = new ButtonBuilder()
          .setCustomId(customId)
          .setLabel(`第${gameIndex + 1}局`)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);
        interaction.update({ components: components });

        // do something
        // } else if (interaction.customId === "submit") {
        //   // do something
        //   const components = interaction.message.components;
        //   components[4].components[0] = new ButtonBuilder()
        //     .setCustomId("submit")
        //     .setLabel("已提交")
        //     .setStyle(ButtonStyle.Success)
        //     .setDisabled(true);
        //   interaction.update({ components: components });
        //   const clickedButtons = interaction.message.components
        //     .flatMap((row) => row.components.filter((button) => button.disabled))
        //     .map(({ label, customId }) => [label, customId]);
        //   const [team1, team2, seriesType, matchNumber, matchString] =
        //     clickedButtons;
        //   const matchId = matchString?.at(0)?.split(": ")[1];
        //   if (
        //     [team1, team2, seriesType, matchNumber, matchId].some(
        //       (val) => val === undefined
        //     )
        //   ) {
        //     console.error("Some values are missing.");
        //     components[4].components[0] = new ButtonBuilder()
        //       .setCustomId("submit")
        //       .setLabel("Submit")
        //       .setStyle(ButtonStyle.Success)
        //       .setDisabled(false);
        //     interaction.update({ components: components });
        //     interaction.reply({
        //       content: "執行失敗，請確保所有選項都已選擇。",
        //       ephemeral: true,
        //     });
        //   } else {
        //     interaction.reply({
        //       content: `${seriesType[0]} - ${team1[0]} v.s. ${team2[0]} ${matchNumber[0]}，房號: ${matchId} 已提交。`,
        //       ephemeral: true,
        //     });

        //     // // delete original message
        //     // interaction.message.deleteReply();
        //   }

        //   console.table(clickedButtons);
      } else if (customId === "submit") {
        // do something
      } else {
        console.error(`No button matching ${interaction.customId} was found.`);
        interaction.reply({
          content: "There was an error while executing this button!",
          ephemeral: true,
        });
      }
    } else if (interaction.isModalSubmit()) {
      if (interaction.customId === "myModal") {
        const matchId =
          interaction.fields.getTextInputValue("matchIdTextInput");
        // to update the previous message: the ActionRow[3][-1] is what we want to update
        // components: [ [ActionRow], [ActionRow], [ActionRow], [ActionRow], [ActionRow] ]
        const components = interaction.message.components;
        components[3].components[3] = new ButtonBuilder()
          .setCustomId("show_match_id")
          .setLabel(`房號: ${matchId}`)
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);

        interaction.update({
          components: components,
        });
      }

      // do something
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
