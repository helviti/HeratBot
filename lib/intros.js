const fs = require('fs');
const { playClip } = require('../handlers/common');
const { introsFile } = require('../config.json');

class IntrosConfig {
  constructor() {
    this.intros = [];
  }
}

let config;

module.exports.initializeAndRunIntros = function() {
  if (fs.existsSync(introsFile)) {
    config = JSON.parse(fs.readFileSync(introsFile))
  } else {
    config = new IntrosConfig();
  }
}

function getEntry(member) {  
  return config.intros.find(value => value.memberId === member.id && value.guildId === member.guild.id);
}

module.exports.memberJoined = function(member) {
  const entry = getEntry(member);
  if (entry) {
    playClip(member.voice, entry.clip);
  }
}

module.exports.setIntro = function(member, clip) {
  let entry = getEntry(member);
  if (!entry) {
    entry = {
      guildId: member.guild.id,
      memberId: member.id
    };
    config.intros.push(entry);
  }

  entry.clip = clip;
  fs.writeFileSync(introsFile, JSON.stringify(config, null, 2));
}