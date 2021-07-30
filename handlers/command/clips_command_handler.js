const { clipList } = require("../../analytics");
const { getPagedList, multiReply } = require("../common");

module.exports.ClipsCommandHandler = class {
  constructor() {
    this.command = {
      name: 'clips',
      description: 'Lists all clips',
      options: []
    }
  }

  async handleCommand(interaction) {
    const pages = getPagedList('Available sound clips are', clipList.map(clip => clip.name));
    await multiReply(interaction, pages);
  }
}