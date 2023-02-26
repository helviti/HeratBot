const { renameClip } = require("../../analytics");

module.exports.RenameCommandHandler = class {
  constructor() {
    this.command = {
      name: 'setintro',
      description: 'Sets the intro for yourself',
      options: [
        {
          type: 'STRING',
          name: 'clip name',
          description: 'Clip name',
          required: true
        },
        {
          type: 'STRING',
          name: 'new clip name',
          description: 'The new clip name',
          required: true
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const clipName = interaction.options.getString('clip name');
    const newClipName = interaction.options.getString('new clip name');
    if (renameClip(clipName, newClipName)) {
      await interaction.reply("Renamed the clip successfully!")
    } else {
      await interaction.reply("Specified clip does not exist.")
    }
  }
}