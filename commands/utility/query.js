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

        const matchEmbed = new EmbedBuilder()
          .setTitle(`Match: ${match.matchId}`)
          .setDescription(
            `Started: \t${new Date(match.started).toLocaleString("zh", {
              hour12: false,
            })}\nFinished: \t${new Date(match.finished).toLocaleString("zh", {
              hour12: false,
            })}`
          )
          .addFields({ name: "Name", value: match.name })
          .addFields({ name: "Map", value: match.mapName })
          .setThumbnail(match.mapImageUrl);

        match.teams.forEach(({ teamId, players }) => {
          matchEmbed.addFields({
            name: `Team ${teamId}`,
            value: players
              .map(
                ({ name, civName, won }) =>
                  `${won ? "👑" : ""} ${name} (${civName})`
              )
              .join("\n"),
          });
        });
        return interaction.reply({
          embeds: [matchEmbed],
          ephemeral: true,
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
