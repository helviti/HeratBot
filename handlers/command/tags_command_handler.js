const { tagMap } = require("../../analytics")
const { getPagedList, multiReply } = require("../common")

module.exports.TagsCommandHandler = class {
  constructor() {
    this.command = {
      name: 'tags',
      description: 'Lists all used tags',
      options: []
    }
  }

  async handleCommand(interaction) {
    const pages = getPagedList('Available tags are', Object.keys(tagMap));
    await multiReply(interaction, pages);
  }
}