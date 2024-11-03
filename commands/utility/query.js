const { SlashCommandBuilder, Colors } = require("discord.js");
const { teams } = require("../../assets/data/teams.json");
const { getTeam } = require("../../scripts/utility/teams");
const { getMatch } = require("../../scripts/utility/match");
const { getSeries } = require("../../scripts/utility/series");
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
  )
  .addSubcommand((subcommand) =>
    subcommand
      .setName("series")
      .setDescription("Series details for a given team, team2 and series type")
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
          .addChoices(teams.map(({ name }) => ({ name: name, value: name })))
      )
      .addStringOption((option) =>
        option
          .setName("series_type")
          .setDescription("The series type")
          .addChoices([
            { name: "all", value: "all" },
            { name: "２ｖ２大師賽", value: "Master 2v2" },
            { name: "３ｖ３大師賽", value: "Master 3v3" },
            { name: "４ｖ４大師賽", value: "Master 4v4" },
            { name: "３ｖ３萌新賽", value: "Newbie 3v3" },
            { name: "４ｖ４萌新賽", value: "Newbie 4v4" },
          ])
      )
  );

module.exports = {
  // disable: true,
  data: data,
  async execute(interaction) {
    const teamName = interaction.options.getString("team");
    const team2Name = interaction.options.getString("team2");
    const seriesType = interaction.options.getString("series_type");
    switch (interaction.options.getSubcommand()) {
      case "series":
        const seriesEmbed = new EmbedBuilder().setTitle("Series");
        seriesEmbed.addFields({ name: "team 1", value: teamName });
        seriesEmbed.addFields({ name: "team 2", value: team2Name });
        seriesEmbed.addFields({ name: "series type", value: seriesType });
        seriesEmbed.addFields({ name: "Series", value: "Under development" });
        const series = await getSeries(teamName, team2Name, seriesType);
        series.addFields({ name: "Series", value: JSON.stringify(series) });
        return interaction.reply({
          embeds: [seriesEmbed],
          ephemeral: true,
        });
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

        const matchEmbed = new EmbedBuilder().setTitle(
          `Match: ${match.matchId}`
        );
        const started = new Date(
          new Date(match.started).getTime()
        ).toLocaleString("zh", {
          timeZone: "Asia/Taipei",
          hour12: false,
        });

        let finished = "Not finished yet";
        console.log({ "match.finished": match.finished });
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
          // :color1: <:color1:1283023694293106698>
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
        console.warn({ matchTime: started });
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
          JSON.stringify(plaintext)
        );
        return interaction.reply({
          embeds: [matchEmbed, plaintextEmbed],
          // ephemeral: true,
        });
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
