const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Get help about the bot!"),
  async execute(interaction) {
    return interaction.reply({
      embeds: [
        {
          title: "Help",
          description: "Here are the commands you can use!",
          fields: [
            {
              name: "ping",
              value: "Replies with Pong!",
            },
            {
              name: "q match <match_id:required> <profile_id:optional>",
              value: `
                  Match details for a given match id and profile id.
                  - (required) match_id: The match id.
                  - (optional) profile_id: The profile id.

                  顯示指定 match_id 的資訊。
                  如果找不到，請嘗試新增 profile_id 後再次查詢。`,
            },
            {
              name: "q team <team:required>",
              value: `
                  Team details for a given team.
                  - (required) team: The team name.

                  顯示指定 team 的資訊。`,
            },
            {
              name: "q player <team:required> <tier:required>",
              value: `
                  Player details for a given team and tier.
                  - (required) team: The team name.
                  - (required) tier: The tier number.

                  顯示指定 team 和 tier 的玩家資訊。`,
            },
          ],
        },
      ],
      ephemeral: true,
    });
  },
};
