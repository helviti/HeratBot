const { tagMap, clipList } = require("../../analytics")
const { playClip } = require("../common")

module.exports.RandomCommandHandler = class {
  constructor() {
    this.command = {
      name: 'random',
      description: 'Play a random clip',
      options: [
        {
          type: 'STRING',
          name: 'tag',
          description: 'The tag to randomize from',
          required: false,
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
    const clip = getRandom(tag ? tag : '');
    await playClip(interaction.member.voice, clip, 1, false);
    if (tag) {
      await interaction.reply(`You rolled '${clip}' of tag '${tag}'`);
    }
    else {
      await interaction.reply(`You rolled '${clip}'`);
    }
  }
}

function getRandom(tag = '') {
  const noTag = tag === '';
  if (!noTag) {
    if (!noTag && !(tag in tagMap)) {
      for (let key in tagMap) {      
        if(key.startsWith(tag)) {
          tag = key;
          break;
        }
      }
    }
    if (!(tag in tagMap)) return;
  }
  const list = noTag ? clipList : tagMap[tag];
  const randomIndex = Math.floor(Math.random() * list.length);
  return noTag ? list[randomIndex].name : list[randomIndex];
}
