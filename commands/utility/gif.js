const { SlashCommandBuilder } = require("discord.js");

const data = new SlashCommandBuilder()
  .setName("gif")
  .setDescription("Sends a random gif!")
  .addStringOption((option) =>
    option
      .setName("category")
      .setDescription("The gif category")
      .setRequired(true)
      .addChoices(
        { name: "Funny", value: "gif_funny" },
        { name: "Meme", value: "gif_meme" },
        { name: "Movie", value: "gif_movie" }
      )
  );

module.exports = {
  disable: true,
  data: data,
  async execute(interaction) {
    return interaction.reply(
      `This command(${interaction.commandName}) is still under development!`
    );
  },
};
