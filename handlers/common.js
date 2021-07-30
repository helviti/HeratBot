const {	joinVoiceChannel, entersState, VoiceConnectionStatus, createAudioPlayer, createAudioResource, AudioPlayerStatus } = require('@discordjs/voice');
const { MessageActionRow, MessageButton } = require('discord.js');
const { audioFolder } = require('../config.json');

const player = createAudioPlayer();

module.exports.getPagedList = function getPagedList(prefix, elements) {
  let currentPage = null;
  let retVal = [];
  elements.forEach((item) => {
    let toBeAdded = `${item}, `;
    if (currentPage == null || (currentPage.length + toBeAdded.length) > 1900) {
      if (currentPage != null){
        retVal.push(currentPage.substring(0, currentPage.length - 2)); // remove the last comma
      }
      currentPage = `${prefix} (Page ${retVal.length + 1}): `;
    }

    currentPage += toBeAdded;
  });

  if (currentPage != null) {
    retVal.push(currentPage.substring(0, currentPage.length - 2));
  }

  return retVal;
}

module.exports.playClip = async function playClip(voice, clip, volume = 1) {
  if (voice && voice.channel) {
    const connection = await connectToChannel(voice.channel);
    const audioSource = createAudioResource(`${audioFolder + clip}.mp3`, {inlineVolume: true});
    audioSource.volume.setVolume(volume);
    player.play(audioSource);
    await entersState(player, AudioPlayerStatus.Playing, 5e3);
    connection.subscribe(player);
  }
}

async function connectToChannel(channel) {
	const connection = joinVoiceChannel({
		channelId: channel.id,
		guildId: channel.guild.id,
		adapterCreator: channel.guild.voiceAdapterCreator,
	});
	try {
		await entersState(connection, VoiceConnectionStatus.Ready, 30_000);
		return connection;
	} catch (error) {
		connection.destroy();
		throw error;
	}
}

module.exports.multiReply = async function multiReply(interaction, pages) {
  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (i <= 0) {
      await interaction.reply(page);
    }
    else {
      await interaction.followUp(page);
    }
  }
}

module.exports.sendButtonRows = async function sendButtonRows(clipNames, prefixText, interaction) {
  let rows = [];
  let buttons = [];
  for (let i = 0; i < clipNames.length; i++) {
    const name = clipNames[i];
    buttons.push(new MessageButton().setStyle('PRIMARY').setLabel(name).setCustomId(`c_${name}`));
    if (i % 5 == 4 || (i + 1) == clipNames.length) {
      rows.push(new MessageActionRow().addComponents(buttons));
      buttons = [];
    }
  }
  
  await interaction.reply(prefixText);
  for (let i = 0; i < rows.length; i += 5) {
    const rowsToBeSent = rows.slice(i, Math.min(i + 5, rows.length));
    await interaction.followUp({content: `Clips (${(i + 1)}):`, components: rowsToBeSent});
  }
}