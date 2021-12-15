const { ClipMeta, addClip } = require("../../analytics");
const { downloadFile, getTime } = require("../../lib/util");

module.exports.handleDirectMessage = async function handleDirectMessage(msg) {
  if (msg.attachments.first()) {
    let name = msg.attachments.first().url;
    if (name.substring(name.length - 3, name.length) === "mp3") {
      name = name.split("/");
      name = name[name.length - 1];
      const temp = name.slice(0, -4).toUpperCase();
      console.log(`${getTime()}: Downloading file: ${name}`);

      // console.log(name);
      await downloadFile(msg.attachments.first().url, temp);
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
