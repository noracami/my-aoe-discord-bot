const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("hello_flask")
    .setDescription("Replies with Flask!")
    .addAttachmentOption((option) =>
      option
        .setName("replay")
        .setDescription("The aoe2de replay file end with .aoe2record")
    ),
  async execute(interaction) {
    // const replay = interaction.options.getAttachment("replay");
    // // send the replay file to the flask endpoint, with multipart/form-data
    // const formData = new FormData();
    // formData.append("replay", replay);
    // const response = await fetch("https://bgitrepwocc.hkg1.zeabur.app", {
    //   method: "POST",
    //   body: formData,
    // });
    // // get the response from the flask endpoint
    // const result = await response.text();

    // fetch the flask endpoint
    // const result = await fetch("https://bgitrepwocc.hkg1.zeabur.app").then(
    //   (response) => response.text()
    // );
    const result = await fetch(
      "http://aoe2de-replay-parser.zeabur.internal:8080"
    ).then((response) => response.text());
    await interaction.reply({
      content: `🍾 Flask! ${result}`,
      ephemeral: true,
    });
  },
};
