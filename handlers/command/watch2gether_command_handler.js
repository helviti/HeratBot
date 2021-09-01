const axios = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports.Watch2GetherCommandHandler = class {
  constructor() {
    this.command = {
      name: 'watch2gether',
      description: 'Creates a watch2gether room',
      options: [
        {
          type: 'STRING',
          name: 'video',
          description: 'Initial video',
          required: true
        }
      ]
    }
  }

  async handleCommand(interaction) {
    const video = interaction.options.getString('video');
    let roomData = await w2gRoomCreate(video, interaction.member);
    await interaction.reply(`<${roomData.url}>`);
    await interaction.followUp({embeds: [roomData.embed]});
  }
}

async function w2gRoomCreate(videoUrl, creator) {
  const embed = new MessageEmbed();
  const response = await axios.post('https://w2g.tv/rooms/create.json', {
    "w2g_api_key": process.env.W2G_API_KEY,
    "share": videoUrl
  })
  const roomKey = response.data.streamkey;

  const roomURL = `http://w2g.tv/rooms/${roomKey}`;
  embed.setTitle(`New WatchTogether Room`)
    .setDescription(`[${roomURL}](${roomURL})`)
    .setThumbnail('https://w2g.tv/static/watch2gether-share.jpg')
    .setFooter(`Created by ${creator.displayName}`, creator.user.avatarURL())
    .setURL(roomURL)
    .setColor('#D1A427');
  return {
    url: roomURL,
    embed: embed
  }
}