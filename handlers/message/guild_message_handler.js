const { clipList } = require("../../analytics");
const { deleteMessage } = require("../../lib/util");
const { playClip } = require("../common");

module.exports.handleGuildMessage = async function handleGuildMessage(msg) {
  const match = msg.content.match(/^(?<name>[A-Z0-9]*)( (?<volume>[0-9]+))?$/);
  // Play clip if message matches a file
  if (match) {
    const { name, volume } = match.groups;
    if (clipList.some((clip) => clip.name === name)) {
      deleteMessage(msg);
      if (volume) {
        await playClip(msg.member.voice, name, volume);
      } else {
        await playClip(msg.member.voice, name);
      }
    }
  }
};
