const { tagMap } = require("../../analytics");
const { setIntro } = require("../../lib/intros");
const { getPagedList, multiReply, sendButtonRows } = require("../common")

module.exports.SetIntroCommandHandler = class {
  constructor() {
    this.command = {
      name: 'setintro',
      description: 'Sets the intro for yourself',
      options: [
        {
          type: 'STRING',
          name: 'clip',
          description: 'Clip name',
          required: true
        },
        {
          type: 'USER',
          name: 'user',
          description: 'The user',
          required: false
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const clip = interaction.options.getString('clip');
    const user = interaction.options.getUser('user');
    let member;
    if (user) {
      member = await interaction.guild.members.fetch(user);
    } else {
      member = interaction.member;
    }
    setIntro(member, clip);
    await interaction.reply('Intro set!');
  }
}