const { ClipMeta, addClip } = require("../../analytics");
const { downloadFile, getTime } = require("../../lib/util");

module.exports.handleDirectMessage = async function handleDirectMessage(msg) {
  if (msg.attachments.first()) {
    const attachment = msg.attachments.first();
    const name = attachment.name;
    if (name.substring(name.length - 3, name.length) === "mp3") {
      const temp = name.slice(0, -4).toUpperCase();
      console.log(temp);
      console.log(`${getTime()}: Downloading file: ${name}`);

      await downloadFile(attachment.url, temp);
      console.log(`${getTime()}: Download finished.`);

      addClip(temp, msg.author.id, new ClipMeta(msg.content), []);
      await msg.reply(
        `Succesfully added new audio file. Use the command "${temp}" to play the file. Thank you for your contribution!`
      );
    } else {
      await msg.reply("The file you are trying to upload is not an mp3.");
    }
  }
};
