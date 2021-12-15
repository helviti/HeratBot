/* eslint-disable max-len */
const fs = require("fs");
const { audioFolder } = require("./config.json");
const { getTime } = require("./lib/util.js");

class Clip {
  constructor(name, playCount = 0, lastPlayDate = null) {
    this.name = name;
    this.playCount = playCount;
    this.lastPlayDate = lastPlayDate;
  }
}

class ClipMeta {
  constructor(desc = "", tags = [], playCount = 0) {
    this.desc = desc;
    this.tags = tags;
    this.playCount = playCount;
    this.lastPlayDate = null;
  }
}

module.exports.ClipMeta = ClipMeta;

const clipList = [];
const tagMap = {};

module.exports.clipList = clipList;
module.exports.tagMap = tagMap;

function fileNotExist(list, temp) {
  if (list.length < 1) {
    return true;
  }
  let flag = true;
  for (let i = 0; i < list.length; i += 1) {
    if (list[i].name === temp) {
      flag = false;
      break;
    }
  }
  return flag;
}

function getMetaFileName(clipName) {
  return `${audioFolder}${clipName}.json`;
}

function getMeta(clipName) {
  const metaFile = getMetaFileName(clipName);
  let meta = new ClipMeta();
  if (fs.existsSync(metaFile)) {
    let metaRaw = JSON.parse(fs.readFileSync(metaFile));
    if ("desc" in metaRaw) meta.desc = metaRaw.desc;
    if ("tags" in metaRaw) meta.tags = metaRaw.tags;
    if ("playCount" in metaRaw) meta.playCount = metaRaw.playCount;
    if ("lastPlayDate" in metaRaw)
      meta.lastPlayDate = Date.parse(metaRaw.lastPlayDate);
  }

  return meta;
}

function saveMeta(clipName, meta) {
  const metaFile = getMetaFileName(clipName);
  fs.writeFileSync(metaFile, JSON.stringify(meta, null, 2), (err) => {
    if (err) {
      console.log(err);
    }
  });
}

module.exports.generateClipObjects = function generateClipObjects() {
  fs.readdirSync(audioFolder).forEach((file) => {
    // Sanitize filenames
    const match = file.match(/(.+)\.[^\.]*/);
    if (match != null) {
      const clipName = match[1];
      if (clipList.length < 1 || fileNotExist(clipList, clipName)) {
        const meta = getMeta(clipName);
        clipList.push(new Clip(clipName, meta.playCount, meta.lastPlayDate));
        const { tags } = meta;
        tags.forEach((tag) => {
          if (!(tag in tagMap)) {
            tagMap[tag] = [];
          }
          tagMap[tag].push(clipName);
        });
      }
    }
  });
};

// Exports for the main file

module.exports.addClip = function addClip(name, by, meta, tags) {
  // Check if clip name exists, if so dont save to file and output an error
  if (fileNotExist(clipList, name)) {
    clipList.push(new Clip(name));
    saveMeta(name, meta);
  } else {
    console.log("error adding clip");
  }
};

module.exports.clipPlayed = function clipPlayed(byId, clip) {
  // empty for now
};

module.exports.getList = function getList() {
  const audioList = [];
  clipList.forEach((item) => audioList.push(item.name));
  const out = audioList.join(", ");
  return out;
};

module.exports.getDescription = function getDescription(clipName) {
  return getMeta(clipName).desc;
};

module.exports.setDescription = function setDescription(clipName, desc) {
  if (clipList.some((clip) => clip.name === clipName)) {
    const meta = getMeta(clipName);
    meta.desc = desc;
    saveMeta(clipName, meta);
  }
};

function addTagToClip(clipName, tag) {
  if (clipList.some((clip) => clip.name === clipName)) {
    tag = tag.toLowerCase();
    const meta = getMeta(clipName);
    if (!meta.tags.some((t) => t === tag)) {
      meta.tags.push(tag);
      saveMeta(clipName, meta);
      if (!(tag in tagMap)) {
        tagMap[tag] = [];
      }
      tagMap[tag].push(clipName);
    }
  }
}

module.exports.addTagToClip = addTagToClip;

module.exports.getTags = function getTags(clipName) {
  return getMeta(clipName).tags;
};

function removeTag(clipName, tag) {
  if (clipList.some((clip) => clip.name === clipName)) {
    tag = tag.toLowerCase();
    const meta = getMeta(clipName);
    if (meta.tags.some((t) => t === tag)) {
      meta.tags = meta.tags.filter((value) => value !== tag);
      saveMeta(clipName, meta);
      tagMap[tag] = tagMap[tag].filter((value) => value !== clipName);
    }
  }
}

module.exports.removeTag = removeTag;

module.exports.renameTag = function renameTag(oldName, newName) {
  if (oldName in tagMap && !(newName in tagMap)) {
    const clips = tagMap[oldName];
    clips.forEach((clip) => {
      removeTag(clip, oldName);
      addTagToClip(clip, newName);
    });
    delete tagMap[oldName];
  }
};

module.exports.markAsPlayed = function (clipName) {
  const clip = clipList.find((value) => value.name === clipName);
  if (clip) {
    clip.playCount++;
    clip.lastPlayDate = new Date();
    const meta = getMeta(clipName);
    meta.playCount = clip.playCount;
    meta.lastPlayDate = clip.lastPlayDate;
    saveMeta(clipName, meta);
  }
};
