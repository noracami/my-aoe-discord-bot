const { SlashCommandBuilder, Colors } = require("discord.js");
const { teams } = require("../../assets/data/teams.json");
const { putSeries } = require("../../scripts/utility/series");
const { EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("c")
  .setDescription("To create something")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("set_up_match_of_series")
      .setDescription("填寫系列賽的比賽資訊")
      .addStringOption((option) =>
        option
          .setName("team")
          .setDescription("The team name")
          .setRequired(true)
          .addChoices(teams.map(({ name }) => ({ name: name, value: name })))
      )
      .addStringOption((option) =>
        option
          .setName("team2")
          .setDescription("The team2 name")
          .setRequired(true)
          .addChoices(teams.map(({ name }) => ({ name: name, value: name })))
      )
      .addStringOption((option) =>
        option
          .setName("series_type")
          .setDescription("類型")
          .setRequired(true)
          .addChoices([
            { name: "２ｖ２大師賽", value: "Master 2v2" },
            { name: "３ｖ３大師賽", value: "Master 3v3" },
            { name: "４ｖ４大師賽", value: "Master 4v4" },
            { name: "３ｖ３萌新賽", value: "Newbie 3v3" },
            { name: "４ｖ４萌新賽", value: "Newbie 4v4" },
          ])
      )
      .addStringOption((option) =>
        option
          .setName("match_number")
          .setDescription("第幾局")
          .setRequired(true)
          .addChoices(
            // 1 to 3
            Array.from({ length: 3 }, (_, i) => ({
              name: `第${i + 1}局`,
              value: `${i + 1}`,
            }))
          )
      )
      .addStringOption((option) =>
        option.setName("match_id").setDescription("房間 ID").setRequired(true)
      )
  );

module.exports = {
  // disable: true,
  data: data,
  async execute(interaction) {
    const teamName = interaction.options.getString("team");
    const team2Name = interaction.options.getString("team2");
    const seriesType = interaction.options.getString("series_type");
    const matchNumber = interaction.options.getString("match_number");
    const matchId = interaction.options.getString("match_id");
    switch (interaction.options.getSubcommand()) {
      case "set_up_match_of_series":
        const result = await putSeries(
          teamName,
          team2Name,
          seriesType,
          matchNumber,
          matchId
        );

        return interaction.reply({
          content: result,
          ephemeral: true,
        });

      default:
        return interaction.reply("Invalid subcommand");
    }
  },
};
