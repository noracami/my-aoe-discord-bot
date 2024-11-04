const {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  SlashCommandBuilder,
  Colors,
  codeBlock,
} = require("discord.js");
const { teams } = require("../../assets/data/teams.json");
const { series_types } = require("../../assets/data/series_types.json");
const { putSeries } = require("../../scripts/utility/series");
const { getMatch } = require("../../scripts/utility/match");
const { EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("new")
  .setDescription("To create something")
  .addSubcommand((subcommand) =>
    subcommand.setName("match").setDescription("To set up a match of a series")
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

    // will return
    // 1. teamName of 8 teams in buttons
    // 2. seriesType of 5 types in buttons
    // 3. matchNumber of 1st, 2nd and 3rd in buttons
    // 4. matchId of the room id in string input
    // 5. submit button

    const teamOptions = teams.map(({ en_name, name }) => ({
      label: `${en_name} ${name}`,
      value: name,
    }));
    const seriesOptions = series_types.map(({ label, value }) => ({
      label: label,
      value: value,
    }));
    const matchNumberOptions = Array.from({ length: 3 }, (_, i) => ({
      label: `第${i + 1}局`,
      value: `game${i + 1}`,
    }));
    const teamButtons = teamOptions.map(({ label, value }) =>
      new ButtonBuilder()
        .setCustomId(value)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
    );
    const seriesButtons = seriesOptions.map(({ label, value }) =>
      new ButtonBuilder()
        .setCustomId(value)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
    );
    const matchNumberButtons = matchNumberOptions.map(({ label, value }) =>
      new ButtonBuilder()
        .setCustomId(value)
        .setLabel(label)
        .setStyle(ButtonStyle.Primary)
    );
    const showMatchId = new ButtonBuilder()
      .setCustomId("show_match_id")
      .setLabel("輸入房號")
      .setStyle(ButtonStyle.Danger);
    const submit = new ButtonBuilder()
      .setCustomId("submit")
      .setLabel("Submit")
      .setStyle(ButtonStyle.Success);
    const cancel = new ButtonBuilder()
      .setCustomId("cancel")
      .setLabel("Cancel")
      .setStyle(ButtonStyle.Secondary);

    const rowGroupA = new ActionRowBuilder().addComponents(
      ...teamButtons.slice(0, 4)
    );
    const rowGroupB = new ActionRowBuilder().addComponents(
      ...teamButtons.slice(4, 8)
    );
    const rowSeries = new ActionRowBuilder().addComponents(...seriesButtons);
    const rowMatchNumber = new ActionRowBuilder().addComponents(
      ...matchNumberButtons,
      showMatchId
    );

    const rowSubmit = new ActionRowBuilder().addComponents(submit, cancel);

    const response = await interaction.reply({
      content: "選擇隊伍、賽制、第幾局和輸入房號",
      components: [rowGroupA, rowGroupB, rowSeries, rowMatchNumber, rowSubmit],
      // ephemeral: true,
    });

    const collector = response.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 3_600_000,
    });

    collector.on("collect", async (i) => {
      const selection = i.customId;

      if (selection === "cancel") {
        await i.update({
          content: "已取消, 刪除中...",
          components: [],
        });
        await i.deleteReply();
        collector.stop();
      } else if (selection === "submit") {
        // do something
        const components = i.message.components;
        components[4].components[0] = new ButtonBuilder()
          .setCustomId("submit")
          .setLabel("已提交")
          .setStyle(ButtonStyle.Success)
          .setDisabled(true);

        await i.update({
          components: components,
        });

        // console.log(2);
        const clickedButtons = components
          .flatMap((row) => row.components.filter((button) => button.disabled))
          .map(({ label, customId }) => [label, customId]);
        const [team1, team2, seriesType, matchNumber, matchString] =
          clickedButtons;
        const matchId = matchString?.at(0)?.split(": ")[1];
        if (
          [team1, team2, seriesType, matchNumber, matchId].some(
            (val) => val === undefined
          )
        ) {
          console.error("Some values are missing.");
          components[4].components[0] = new ButtonBuilder()
            .setCustomId("submit")
            .setLabel("Submit")
            .setStyle(ButtonStyle.Success)
            .setDisabled(false);
          await i.followUp({
            content: "執行失敗，請確保所有選項都已選擇。",
            ephemeral: true,
          });
          await i.editReply({ components: components });
        } else {
          const putSeriesResult = await putSeries(
            team1[1],
            team2[1],
            seriesType[1],
            matchNumber[1].split("game")[1],
            matchId
          );
          if (!putSeriesResult.ok) {
            await i.followUp({
              content: "執行失敗，請確認隊伍名稱和賽制是否正確。",
              ephemeral: true,
            });
            return;
          }

          // to fetch the match data
          const match = await getMatch(
            matchId,
            putSeriesResult.profileIdToFetchMatchAPI
          );

          const title = `${seriesType[0]} - ${team1[0]} v.s. ${team2[0]} ${matchNumber[0]}`;
          await i.editReply({
            content: `${title}，房號: ${matchId} 已更新。`,
            components: [
              new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                  .setCustomId("t1")
                  .setLabel(team1[0])
                  .setStyle(ButtonStyle.Success)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("t2")
                  .setLabel(team2[0])
                  .setStyle(ButtonStyle.Success)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("st_mn")
                  .setLabel(`${seriesType[0]} - ${matchNumber[0]}`)
                  .setStyle(ButtonStyle.Success)
                  .setDisabled(true),
                new ButtonBuilder()
                  .setCustomId("match_id")
                  .setLabel(`房號: ${matchId}`)
                  .setStyle(ButtonStyle.Success)
                  .setDisabled(true)
              ),
            ],
          });

          // show the match details
          // show the match details
          // show the match details

          const matchEmbed = new EmbedBuilder().setTitle(
            `${title} - ${matchId}`
          );
          const started = new Date(
            new Date(match.started).getTime()
          ).toLocaleString("zh", {
            timeZone: "Asia/Taipei",
            hour12: false,
          });

          let finished = "Not finished yet";
          // console.log({ "match.finished": match.finished });
          if (match.finished !== null && match.finished > match.started) {
            finished = new Date(
              new Date(match.finished).getTime()
            ).toLocaleString("zh", {
              hour12: false,
              timeZone: "Asia/Taipei",
            });
            matchEmbed
              .setColor(Colors.Green)
              .setDescription(`Started: \t${started}\nFinished: \t${finished}`);
          } else {
            matchEmbed
              .setColor(Colors.Red)
              .setDescription(`Started: \t${started}\nFinished: \t${finished}`);
          }

          matchEmbed
            .addFields({ name: "Name", value: match.name })
            .addFields({ name: "Map", value: match.mapName })
            .setThumbnail(match.mapImageUrl);

          const colorEmojiMap = {
            1: "<:color1:1283023694293106698>",
            2: "<:color2:1283023692728766535>",
            3: "<:color3:1283023690744729724>",
            4: "<:color4:1283023688446246943>",
            5: "<:color5:1283023686600888341>",
            6: "<:color6:1283023684587753575>",
            7: "<:color7:1283023682964295711>",
            8: "<:color8:1283023680573538369>",
          };

          match.teams.forEach(({ teamId, players }) => {
            matchEmbed.addFields({
              name: `Team ${teamId}`,
              value: players
                .map(
                  ({ name, civName, color, won }) =>
                    `${won ? "👑" : ""} ${
                      colorEmojiMap[color]
                    } ${name} (${civName})`
                )
                .join("\n"),
            });
          });

          const whoWin = match.teams.find(({ players }) =>
            players.some(({ won }) => won)
          )?.teamId;
          const teamOrder = match.teams.map(({ teamId }) => teamId);
          // const teamOrderIndex = teamOrder.indexOf(whoWin); // -1 if not found
          const plainTeams = {};
          match.teams.forEach(({ teamId, players }) => {
            plainTeams[teamOrder.indexOf(teamId)] = {
              bonus: whoWin ? (teamId === whoWin ? true : false) : false,
              players: players.map((player) => ({
                user_id: player.profileId,
                color: colorEmojiMap[player.color],
                color_code: player.color.toString(),
                name: player.name,
                civilization: player.civName,
                rating: player.rating,
                rating_change: player.ratingDiff,
                bonus: player.won ? "🏆" : "",
              })),
            };
          });
          // console.warn({ matchTime: started });
          const plaintext = {
            lobby_id: match.matchId,
            lobby_name: match.name,
            match_time: started,
            location: {
              english: match.map,
              chinese: match.mapName,
            },
            teams: plainTeams,
            match_result: whoWin
              ? `隊伍 ${teamOrder.indexOf(whoWin) + 1} 勝利`
              : "尚未決定",
          };
          const plaintextEmbed = new EmbedBuilder().setDescription(
            codeBlock("json", JSON.stringify(plaintext))
          );

          // show the match details

          await i.followUp({
            embeds: [matchEmbed, plaintextEmbed],
            content: "Match details",
            // ephemeral: true,
          });

          // // // delete original message
          // await i.deleteReply();
        }
      }
    });
  },
};
