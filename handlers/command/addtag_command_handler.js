const { addTagToClip } = require("../../analytics");

module.exports.AddTagCommandHandler = class {
  constructor() {
    this.command = {
      name: 'addtags',
      description: 'Adds the specified tag(s) to specified clip(s)',
      options: [
        {
          type: 'STRING',
          name: 'tags',
          description: 'Tag(s) to add (comma separated)',
          required: true
        },
        {
          type: 'STRING',
          name: 'clips',
          description: 'Clip(s) to add the tag(s) to (comma separated)',
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
        addTagToClip(clipName, tag);
      });
    });
    interaction.reply("Successful tag update!");
  }
}