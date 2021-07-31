const { clipList } = require("../../analytics");
const { sendButtonRows } = require("../common");

module.exports.RecentCommandHandler = class {
  constructor() {
    this.command = {
      name: 'recent',
      description: 'Lists recently played clips (max 25)',
      options: []
    }
  }

  async handleCommand(interaction) {
    const candidates = clipList
      .filter(value => value.lastPlayDate)
      .sort((a, b) => a.lastPlayDate < b.lastPlayDate ? 1 : -1)
      .map(value => value.name);
    const count = Math.min(candidates.length, 25);
    sendButtonRows(candidates.slice(0, count), 'Recently played clips are ', interaction);
  }
}