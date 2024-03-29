const { ApplicationCommandOptionType } = require("discord.js");
const { renameClip } = require("../../analytics");

module.exports.RenameCommandHandler = class {
  constructor() {
    this.command = {
      name: 'rename',
      description: 'Renames a clip',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'clipname',
          description: 'Clip name',
          required: true
        },
        {
          type: ApplicationCommandOptionType.String,
          name: 'newclipname',
          description: 'The new clip name',
          required: true
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const clipName = interaction.options.getString('clipname');
    const newClipName = interaction.options.getString('newclipname');
    if (renameClip(clipName, newClipName)) {
      await interaction.reply("Renamed the clip successfully!")
    } else {
      await interaction.reply("Specified clip does not exist.")
    }
  }
}