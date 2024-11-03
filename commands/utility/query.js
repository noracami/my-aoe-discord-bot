const { SlashCommandBuilder } = require("discord.js");
const { teams } = require("../../assets/data/teams.json");
const { getTeam } = require("../../scripts/utility/teams");
const { getMatch } = require("../../scripts/utility/match");
const { EmbedBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("q")
  .setDescription("To query something")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("match")
      .setDescription("Match details for a given match id and profile id")
      .addStringOption((option) =>
        option
          .setName("match_id")
          .setDescription("The match id")
          .setRequired(true)
      )
      .addStringOption((option) =>
        option.setName("profile_id").setDescription("The profile id")
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("team")
      .setDescription("Team details for a given team")
      .addStringOption((option) =>
        option
          .setName("team")
          .setDescription("The team name")
          .setRequired(true)
          .addChoices(teams.map(({ name }) => ({ name: name, value: name })))
      )
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("player")
      .setDescription("Player details for a given team and tier")
      .addStringOption((option) =>
        option
          .setName("team")
          .setDescription("The team name")
          .setRequired(true)
          .addChoices(teams.map(({ name }) => ({ name: name, value: name })))
      )
      // tier from 1 to 8
      .addIntegerOption((option) =>
        option
          .setName("tier")
          .setDescription("The tier number")
          .setRequired(true)
          .addChoices(
            Array.from({ length: 8 }, (_, i) => ({
              name: `Tier ${i + 1}`,
              value: i + 1,
            }))
          )
      )
  );

module.exports = {
  // disable: true,
  data: data,
  async execute(interaction) {
    const teamName = interaction.options.getString("team");
    switch (interaction.options.getSubcommand()) {
      case "match":
        const matchId = interaction.options.getString("match_id");
        const profileId = interaction.options.getString("profile_id");
        console.log({ matchId, profileId });
        const match = await getMatch(matchId, profileId);
        if (!match) {
          if (profileId) {
            return interaction.reply(`Match: (${matchId}) not found`);
          }

          return interaction.reply(
            `Match: (${matchId}) not found. Please provide the profile id`
          );
        }

        // const toParsedTime = (t, type = 'started') => {
        //   const timestamp = new Date(t).getTime();
        //   if (type === 'finished' && t < new Date().getTime()) {
        //     return null;
        //   } else {
        //     return new Date(timestamp).toLocaleString("en-US", {
        //       timeZone: "Asia/Taipei",
        //       hour12: false,
        //     });
        //   }
        // };

        const matchEmbed = new EmbedBuilder().setTitle(
          `Match: ${match.matchId}`
        );
        const started = new Date(
          new Date(match.started).getTime()
        ).toLocaleTimeString("zh", {
          timeZone: "Asia/Taipei",
          hour12: false,
        });

        let finished = "Not finished yet";
        console.log({ "match.finished": match.finished });
        if (match.finished !== null && match.finished > match.started) {
          finished = new Date(
            new Date(match.finished).getTime()
          ).toLocaleTimeString("zh", {
            hour12: false,
            timeZone: "Asia/Taipei",
          });
          matchEmbed
            .setColor([0, 255, 0])
            .setDescription(`Started: \t${started}\nFinished: \t${finished}`);
        } else {
          matchEmbed
            .setColor([255, 0, 0])
            .setDescription(`Started: \t${started}\nFinished: \t${finished}`);
        }

        matchEmbed
          .addFields({ name: "Name", value: match.name })
          .addFields({ name: "Map", value: match.mapName })
          .setThumbnail(match.mapImageUrl);

        const colorEmojiMap = {
          // :color1:  <:color1:1283023694293106698>
          // :color2: <:color2:1283023692728766535>
          // :color3: <:color3:1283023690744729724>
          // :color4: <:color4:1283023688446246943>
          // :color5: <:color5:1283023686600888341>
          // :color6: <:color6:1283023684587753575>
          // :color7: <:color7:1283023682964295711>
          // :color8: <:color8:1283023680573538369>
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

        // {
        // "lobby_id": 349168873,
        // "lobby_name": "WS4 A88 VS A88",
        // "match_time": "2024/11/02 00:00",
        // "location": {"english": "Ws4_Golden LakesCustom", "chinese": "WS4_GOLDEN湖泊custom"},
        // "teams": {
        // "team1": {
        // "players": [{
        // "user_id": "7151715",
        // "color": "<:color1:1283023694293106698>",
        // "color_code": "1",
        // "name": "AF Bot",
        // "civilization": "蒙古",
        // "rating": "1500",
        // "rating_change": "-16",
        // "bonus": ""}, {
        // }, {}, {}], "bonus": false}, "team2": {"players": [{"user_id": "12091", "color": "<:color2:1283023692728766535>", "color_code": "2", "name": "TAG_A88", "civilization": "中國", "rating": "1513", "rating_change": "+17", "bonus": "🏆"}, {"user_id": "1080762", "color": "<:color4:1283023688446246943>", "color_code": "4", "name": "Mashirou", "civilization": "高棉", "rating": "1512", "rating_change": "+17", "bonus": "🏆"}, {"user_id": "11567102", "color": "<:color6:1283023684587753575>", "color_code": "6", "name": "被煎的波卡", "civilization": "緬甸", "rating": "1467", "rating_change": "+19", "bonus": "🏆"}, {"user_id": "224455", "color": "<:color8:1283023680573538369>", "color_code": "8", "name": "liang0312", "civilization": "印加", "rating": "1508", "rating_change": "+17", "bonus": "🏆"}], "bonus": true}}, "match_result": "隊伍 2 勝利"}
        // only keep first 4000 characters
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
        const plaintext = {
          lobby_id: match.matchId,
          lobby_name: match.name,
          // 2024/11/3 14:03:50
          // transform to 2024/11/03 14:03
          match_time: `${started.slice(0, 10)} ${started.slice(11, 16)}`,
          location: {
            english: match.map,
            chinese: match.mapName,
          },
          teams: plainTeams,
          match_result: whoWin
            ? `隊伍 ${teamOrder.indexOf(whoWin) + 1} 勝利`
            : "尚未決定",
        };
        const embedPlaintext = new EmbedBuilder().setDescription(plaintext);
        interaction.reply({ embeds: [matchEmbed] });
        interaction.followUp({
          embeds: [matchEmbed, embedPlaintext],
          ephemeral: true,
        });
        return;
      case "team":
        const team = await getTeam(teamName);
        const embed = new EmbedBuilder()
          .setTitle(team.name)
          .setDescription(team.description || "No description provided");

        team.lineup
          .sort((a, b) => a.tier - b.tier)
          .forEach(({ tier, nickname, discord_id, profile_id }) => {
            embed.addFields({
              name: `Tier ${tier} ${nickname} `,
              value: `profile_id ${profile_id}`,
              // value: `profile_id ${profile_id} (${userMention(
              //   discord_id
              //   // "681596955528527905"
              // )})`,
            });
          });

        return interaction.reply({
          embeds: [embed],
          ephemeral: true,
        });
      case "player":
        const tier = interaction.options.getInteger("tier");
        const player = await getTeam(teamName).then(({ lineup }) =>
          lineup.find((p) => p.tier === tier)
        );
        return interaction.reply({
          embeds: [
            {
              title: `${player.nickname} - Tier ${player.tier} - ${teamName}`,
              description: `# profile_id: ${player.profile_id}`,
            },
          ],
          ephemeral: true,
        });

      default:
        return interaction.reply("Invalid subcommand");
    }

    return interaction.reply(
      `
        This command(${interaction.commandName}) is still under development!
        Subcommand: ${interaction.options.getSubcommand()}
        options: ${interaction.options}
      `
    );
    // if (interaction.options.getSubcommand() === "user") {
    //   const user = interaction.options.getUser("target");
    //   if (user) return interaction.reply(`Username: ${user.username}\nID: ${user.id}`);
    //   return interaction.reply(`Your username: ${interaction.user.username}\nYour ID: ${interaction.user.id}`);
    // } else if (interaction.options.getSubcommand() === "server") {
    //   return interaction.reply(`Server name: ${interaction.guild.name}\nTotal members: ${interaction.guild.memberCount}`);
    // }
  },
};
