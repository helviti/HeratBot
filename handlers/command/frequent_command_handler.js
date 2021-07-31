const { clipList } = require("../../analytics");
const { sendButtonRows } = require("../common");

module.exports.FrequentCommandHandler = class {
  constructor() {
    this.command = {
      name: 'frequent',
      description: 'Lists the most frequently played clips (max 25)',
      options: []
    }
  }

  async handleCommand(interaction) {
    const candidates = clipList
      .filter(value => value.playCount > 0)
      .sort((a, b) => a.playCount < b.playCount ? 1 : -1)
      .map(value => value.name);
    const count = Math.min(candidates.length, 25);
    sendButtonRows(candidates.slice(0, count), 'Frequently played clips are ', interaction);
  }
}