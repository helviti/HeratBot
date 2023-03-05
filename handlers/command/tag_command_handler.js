const { ApplicationCommandOptionType } = require("discord.js")
const { tagMap } = require("../../analytics")
const { getPagedList, multiReply, sendButtonRows } = require("../common")

module.exports.TagCommandHandler = class {
  constructor() {
    this.command = {
      name: 'tag',
      description: 'Lists all clips with the specified tag',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'tag',
          description: 'The tag to query for',
          required: true,
          choices: Object.keys(tagMap).map(tag => {
            return {
              name: tag,
              value: tag
            }
          })
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const tag = interaction.options.getString('tag');
    if (tag in tagMap) {
      await sendButtonRows(tagMap[tag], `Clips for ${tag} are:`, interaction);
    }
    else {
      await interaction.reply('Tag not found!')
    }
  }
}