const { tagMap } = require("../../analytics")
const { getPagedList, multiReply, leave } = require("../common")

module.exports.LeaveCommandHandler = class {
  constructor() {
    this.command = {
      name: 'leave',
      description: 'Leaves the voice channel',
      options: []
    }
  }

  async handleCommand(interaction) {
    leave(interaction.guild.id);
    await interaction.reply('Bye!');
  }
}