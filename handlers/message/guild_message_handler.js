const { clipList } = require("../../analytics");
const { deleteMessage } = require("../../lib/util");
const { playClip } = require("../common")

module.exports.handleGuildMessage = async function handleGuildMessage(msg) {
  let match;

  // Play clip if message matches a file
  if ((match = msg.content.match(/([^ ]*)( [0-9]+\.?[0-9]*)?/))) {
    if (clipList.some(clip => clip.name === match[1])) {
      deleteMessage(msg);
      if (match[2])
        await playClip(msg.member.voice, match[1], parseFloat(match[2]));
      else
        await playClip(msg.member.voice, match[1]);
    }
  }
}