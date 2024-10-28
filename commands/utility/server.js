const { SlashCommandBuilder } = require("discord.js");
// const wait = require("node:timers/promises").setTimeout;

module.exports = {
  data: new SlashCommandBuilder()
    .setName("server")
    .setDescription("Provides information about the server."),
  async execute(interaction) {
    // const member = interaction.options.getMember('target');
    // if (member.roles.cache.some(role => role.name === 'role name')) {

    // show the user roles
    // console.log(interaction.member.roles.cache.map((role) => role.name));
    // await wait(1_000);

    if (!interaction.member.roles.cache.some((role) => role.name === "畜長")) {
      await interaction.reply({
        content: `You don't have permission to use this command.`,
        ephemeral: true,
      });
      return;
    }
    // interaction.guild is the object representing the Guild in which the command was run
    await interaction.reply({
      content: `This server is ${interaction.guild.name} and has ${interaction.guild.memberCount} members.`,
      ephemeral: true,
    });
  },
};
