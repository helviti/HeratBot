const moment = require('moment');
const fs = require('fs');
const request = require('request');
const { audioFolder, dataFile } = require('../config.json');
const { timeFormat } = require('../config.json');

module.exports.getTime = function getTime() {
  return moment().format(timeFormat);
};

module.exports.deleteMessage = function deleteMessage(msg) {
  if (msg.deletable) {
    msg.delete();
  }
};

module.exports.downloadFile = async function download(url, name) {
  await new Promise((resolve) => request.get(url)
    .on('error', console.error)
    .pipe(fs.createWriteStream(`${audioFolder}${name}.mp3`)).on('finish', resolve));
};


// module.exports.downloadFile = function download(url, name) {
//   request.get(url)
//     .on('error', console.error)
//     .pipe(fs.createWriteStream(`${audioFolder}${name}`));
// };
