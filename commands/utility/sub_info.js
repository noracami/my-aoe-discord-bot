const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Get info about a user or a server!")
  .addSubcommand((subcommand) =>
    subcommand
      .setName("user")
      .setDescription("Info about a user")
      .addUserOption((option) =>
        option.setName("target").setDescription("The user")
      )
  )
  .addSubcommand((subcommand) =>
    subcommand.setName("server").setDescription("Info about the server")
  );

module.exports = {
  disable: true,
  data: data,
  async execute(interaction) {
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
