const { ApplicationCommandOptionType } = require("discord.js");
const { clipList } = require("../../analytics")
const { sendButtonRows } = require("../common")

module.exports.SearchCommandHandler = class {
  constructor() {
    this.command = {
      name: 'search',
      description: 'Lists all clips starting with the specified key',
      options: [
        {
          type: ApplicationCommandOptionType.String,
          name: 'key',
          description: 'The key to query for',
          required: true
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const key = interaction.options.getString('key').toUpperCase();
    let results = [];
    clipList.forEach(item => {
      if (item.name.startsWith(key)) {
        results.push(item.name);
      }
    });

    if (results.length > 0) {
      sendButtonRows(results, `Clips starting with '${key}':`, interaction);
    }
    else {
      interaction.reply('No matching clips found!');
    }
  }
}