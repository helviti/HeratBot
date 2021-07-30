const { removeTag } = require("../../analytics");

module.exports.RemoveTagCommandHandler = class {
  constructor() {
    this.command = {
      name: 'removetags',
      description: 'Removes specified tag(s) from specified clip(s)',
      options: [
        {
          type: 'STRING',
          name: 'tags',
          description: 'Tag(s) to remove (comma separated)',
          required: true
        },
        {
          type: 'STRING',
          name: 'clips',
          description: 'Clip(s) to remove the tag(s) from (comma separated)',
          required: true
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const tags = interaction.options.getString('tags').toLowerCase().split(',');
    const clips = interaction.options.getString('clips').toUpperCase().split(',');
    clips.forEach(clipName => {
      tags.forEach(tag => {
        removeTag(clipName, tag);
      });
    });
    interaction.reply("Successful tag update!");
  }
}