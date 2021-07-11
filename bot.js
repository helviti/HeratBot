const Discord = require('discord.js');
const disbut = require("discord-buttons");
const fs = require('fs');
const { audioFolder } = require('./config.json');
const {
  getTime, deleteMessage, downloadFile,
} = require('./lib/util.js');
const { getList, clipPlayed, addClip, ClipMeta, getDescription, setDescription, generateClipObjects, clipList, addTagToClip, removeTag, tagMap, getTags, renameTag } = require('./analytics.js');
const consWrite = require('./console.js');
const { initializeRepo, autoCommitAndPushChanges, commitAudio } = require('./lib/audio_git_util.js');

let randomMsg = null;
let randomMsgTimeout = null;

// Custom functions
function log(msg) {
  // const date = new Date().toLocaleString();
  if (msg.channel.type === 'dm') {
    console.log(`${getTime()}: ${msg.content} requested by ${msg.author.username} (${msg.author.id}) in direct messages.`);
  } else {
    console.log(`${getTime()}: ${msg.content} requested by ${msg.member.displayName} (${msg.author.id}) in ${msg.guild} (${msg.guild.id})`);
  }
}

// ON DM

async function DM(msg) {
  try {
    // Upload clips via DM
    log(msg);
    if (msg.attachments.first()) {
      let re = new RegExp('ab+c');
      let name = msg.attachments.first().url;
      if (name.substring(name.length - 3, name.length) === 'mp3') {
        name = name.split('/');
        name = name[name.length - 1];
        const temp = name.slice(0, -4).toUpperCase();
        console.log(`${getTime()}: Downloading file: ${name}`);

        // console.log(name);
        await downloadFile(msg.attachments.first().url, temp);
        console.log(`${getTime()}: Download finished.`);

        addClip(temp, msg.author.id, new ClipMeta(msg.content), []);
        msg.reply(`Succesfully added new audio file. Use the command "${temp}" to play the file. Thank you for your contribution!`);
      } else {
        msg.reply('The file you are trying to upload is not an mp3.');
      }
    }
    else {
      let match;

      // Sed description
      if ((match = msg.content.match(/^-d +(\S+) +(\S.*)/)) != null) {
        const clipName = match[1];
        const desc = match[2];
        setDescription(clipName, desc);
        msg.reply(`Updated description for ${clipName} to "${desc}"`);
      }

      // Add tag
      else if ((match = msg.content.match(/^-t (\w+) ((?:\w+ ?)*) \| ((?:\w+ ?)*)/)) != null) {
        const command = match[1];
        const tags = match[2].split(' ');
        const clipNames = match[3].split(' ');
        if (command === 'add') {
          clipNames.forEach(clipName => {
            tags.forEach(tag => {
              addTagToClip(clipName, tag);
            });
          });
          msg.reply("Successful tag update!");
        }
        else if (command === 'remove' || command === 'rem') {
          clipNames.forEach(clipName => {
            tags.forEach(tag => {
              removeTag(clipName, tag);
            });
          });
          msg.reply("Successful tag update!");
        }
      }
      else if ((match = msg.content.match(/^-t rename (\w+) (\w+)/)) != null) {
        renameTag(match[1], match[2]);
        msg.reply("Successful tag update!");
      }
      else if (msg.content === '-c') {
        commitAudio();
      }

      // Prints the help message
      else if (msg.content.startsWith('-h')) {
        msg.reply(
`Available private commands are:
'-d <clip> <description>': Sets the description for the specified clip.
'-t add <tag1 tag2 tag3 ...> | <clip1 clip2 ...>': Adds all specified tags for all specified clips.
'-t remove <tag1 tag2 tag3 ...> | <clip1 clip2 ...>': Removes all specified tags for all specified clips.
'-t rename <oldTagName> <newTagName>': Renames a specified tag.`);
      }
    }
  } catch (err) {
    console.log(err);
  }
}

// ON TEXT CHANNEL

async function TEXT(msg) {
  try {
    let match;

    // Play clip if message matches a file
    if ((match = msg.content.match(/([^ ]*)( [0-9]+\.?[0-9]*)?/))) {
      if (clipList.some((clip) => clip.name === match[1])) {
        deleteMessage(msg);
        if (match[2])
          await play(msg.member.voice, match[1], parseFloat(match[2]));
        else
          await play(msg.member.voice, match[1]);
      }
    }

    // Play random sound clip
    if (msg.content.startsWith('-r')) {
      if ((match = msg.content.match(/^-r (\w+)/)) != null) {
        await playAndReplyRandom(msg, match[1])
      }
      else {
        await playAndReplyRandom(msg);
      }
    }

    if (msg.content.startsWith("-d ")) {
      const clipName = msg.content.substring(3);
      const desc = getDescription(clipName);
      deleteMessage(msg);
      if(desc !== "") {
        msg.reply(`${clipName}: ${desc}`);
      }
      else {
        msg.reply(`No description set for ${clipName}`);
      }
    }

    if ((match = msg.content.match(/^-t clip (\w+)/)) != null) {
      const clipName = match[1];
      if (clipList.some((clip) => clip.name === clipName)) {
        deleteMessage(msg);
        const tags = getTags(clipName);
        let reply = `Tags for ${clipName} are: `
        for (let i = 0; i < tags.length; i++) {
          reply += tags[i] + ((i < tags.length - 1) ? ', ' : '');
        }
        msg.reply(reply);
      }
    }
    else if ((match = msg.content.match(/^-t tag (\w+)/)) != null) {
      const tag = match[1];
      if (tag in tagMap) {
        deleteMessage(msg);
        sendButtonRows(tagMap[tag], `Clips for ${tag} are:`, msg.channel);
      }
    }

    if (msg.content.startsWith('-h')) {
      log(msg);
      if ((match = msg.content.match(/^-(?:\w+) (\w+)/)) != null) {
        const helpWord = match[1];

        // Send list of sound clips
        if (helpWord.startsWith('c')) {
          printList(msg.channel);
        }

        // Send a list of all tags
        else if (helpWord.startsWith('t')) {
          printTags(msg);
        }

        else if (helpWord.startsWith('u')) {
          printUntaggedClips(msg);
        }
      }

      // Prints the help message
      else {
        msg.channel.send(
`Available public commands are:
'-h c': Lists all clips.
'-h t': Lists all tags.
'-h u': Lists all untagged clips.
'-r': Plays a random clip.
'-r <tag>': Plays a random clip with the specified tag (if it doesn't match, first tag which starts with <tag> will be used).
'-d <clip>': Shows the set description for the specified clip.
'-t clip <clip>': Lists the tags set for the specified clip.
'-t tag <tag>': Lists the clips within specified tag.
'-p <clip beginning>': Basically auto complete (supports lowercase).
'-s <keyword>: Seatches for clips beginning with the given keyword.`);
      }
    }

    if ((match = msg.content.match(/^-p (\w+)/)) != null) {
      const clipPart = match[1].toUpperCase();
      clipList.forEach(async clip => {
        if (clip.name.startsWith(clipPart)) {
          deleteMessage(msg);
          await play(msg.member.voice, clip.name);
          return;
        }
      });
    }

    if ((match = msg.content.match(/^-s (\w+)/)) != null) {
      const keyword = match[1].toUpperCase();
      searchAndSendResults(keyword, msg.channel);
    }
  } catch (err) {
    console.log(err);
  }
}

async function play(voice, clip, volume = 1) {
  if (voice && voice.channel) {
    const connection = await voice.channel.join();
    connection.play(`${audioFolder + clip}.mp3`, { volume: volume });
  }
}

async function playAndReplyRandom(msg, tag = '') {
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
  const randomAudio = noTag ? list[randomIndex].name : list[randomIndex];

  deleteMessage(msg);
  if (msg.member.voice.channel) {
    const connection = await msg.member.voice.channel.join();
    connection.play(`${audioFolder + randomAudio}.mp3`);
    log(msg);
    clipPlayed(msg.author.id, randomAudio);
    if(randomMsg != null && randomMsgTimeout != null) {
      deleteMessage(randomMsg);
      clearTimeout(randomMsgTimeout);
    }
    msg.reply(` you rolled ${randomAudio}${noTag ? '' : (' of tag ' + tag)}!`)
      .then((reply) => randomMsg = reply);
    randomMsgTimeout = setTimeout(() => {
      if(randomMsg != null) {
        deleteMessage(randomMsg);
        randomMsg = null;
        randomMsgTimeout = null;
      }
    }, 5000);
  }
}

function printList(msg) {
  let page = 0;
  let reply = "";
  clipList.forEach((item) => {
    let toBeAdded = `${item.name}, `;
    if (reply.length + toBeAdded.length <= 1900 && reply.length > 0) {
      reply += toBeAdded;
    }
    else {
      if(reply.length > 0) {
        msg.reply(reply);
      }
      page++;
      reply = `available sound clips are (page ${page}): ${toBeAdded}`;
    }
  });

  if(reply.length > 2) {
    reply = reply.substring(0, reply.length - 2);
    msg.reply(reply);
  }
}

function searchAndSendResults(keyword, channel) {
  let results = [];
  clipList.forEach(item => {
    if (item.name.startsWith(keyword)) {
      results.push(item.name);
    }
  });

  if (results.length > 0) {
    sendButtonRows(results, `Clips starting with '${keyword}':`, channel);
  }
}

function sendButtonRows(clipNames, prefixText, channel) {
  let rows = [];
  let row;
  for (let i = 0; i < clipNames.length; i++) {
    const name = clipNames[i];
    if (i % 5 == 0) {
      row = new disbut.MessageActionRow();
      rows.push(row);
    }

    row.addComponent(new disbut.MessageButton().setStyle('blurple').setLabel(name).setID(`c_${name}`));
  }
  
  channel.send(prefixText);
  for (let i = 0; i < rows.length; i++) {
    row = rows[i];
    channel.send(`Clips (${i}):`, row);
  }
}

function printTags(msg) {
  let page = 0;
  let reply = "";
  for (let tag in tagMap) {
    let toBeAdded = `${tag}, `;
    if (reply.length + toBeAdded.length <= 1900 && reply.length > 0) {
      reply += toBeAdded;
    }
    else {
      if(reply.length > 0) {
        msg.reply(reply);
      }
      page++;
      reply = `available tags are (page ${page}): ${toBeAdded}`;
    }
  }

  if(reply.length > 2) {
    reply = reply.substring(0, reply.length - 2);
    msg.reply(reply);
  }
}

function printUntaggedClips(msg) {
  let page = 0;
  let reply = "";
  clipList.filter(clip => getTags(clip.name).length <= 0).forEach((item) => {
    let toBeAdded = `${item.name}, `;
    if (reply.length + toBeAdded.length <= 1900 && reply.length > 0) {
      reply += toBeAdded;
    }
    else {
      if(reply.length > 0) {
        msg.reply(reply);
      }
      page++;
      reply = `untagged sound clips are (page ${page}): ${toBeAdded}`;
    }
  });

  if(reply.length > 2) {
    reply = reply.substring(0, reply.length - 2);
    msg.reply(reply);
  }
}

module.exports.startBot = function startBot(token) {
  initializeRepo().then(() =>{
    generateClipObjects();
    const client = new Discord.Client();
    disbut(client);
  
    consWrite();
  
    client.on('ready', () => {
      console.log(`${getTime()}: Logged in as ${client.user.tag}\n===============================================`);
    });
  
    client.on('message', (msg) => {
      if (msg.channel.type === 'dm') { DM(msg); }
      if (msg.channel.type === 'text') { TEXT(msg); }
    });
  
    process.on('unhandledRejection', (error) => {
      console.error(`${getTime()}: Unhandled promise rejection:`, error);
    });

    client.on('clickButton', async (button) => {
      if (button.id.startsWith('c_')) {
        await play(button.clicker.member.voice, button.id.substr(2));
        button.reply.defer();
      }
    });
  
    client.login(token);
    autoCommitAndPushChanges();
  });
}
