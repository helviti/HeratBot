const { clipList } = require("../../analytics");
const { deleteMessage } = require("../../lib/util");
const { playClip } = require("../common");

module.exports.handleButtonInteraction = async function handleButtonInteraction(
  interaction
) {
  if (interaction.customId.startsWith("c_")) {
    await playClip(interaction.member.voice, interaction.customId.substring(2));
    await interaction.reply("Playing!");
    await interaction.deleteReply();
  }
};
