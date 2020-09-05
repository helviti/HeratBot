const { audioFolder, audioGitRepo } = require('../config.json');
const fs = require('fs');
const simpleGit = require('simple-git');

let git;
const gitOptions = {
  baseDir: audioFolder,
  binary: 'git',
  maxConcurrentProcesses: 6,
};
const remote = `https://${process.env.GIT_USER}:${process.env.GIT_PASS}@${audioGitRepo}`;

module.exports.initializeRepo = async function initializeRepo() {
  if (fs.existsSync(audioFolder)) {
    fs.rmdirSync(audioFolder, { recursive: true })
  }

  fs.mkdirSync(audioFolder);
  git = simpleGit(gitOptions);
  await git.clone(remote, './')
    .addConfig('user.name', 'Heratbot')
    .addConfig('user.email', 'heratbot@herat.bot')
    .checkoutBranch('origin/master');
};

module.exports.autoCommitAndPushChanges = function autoCommitAndPushChanges() {
  setInterval(() => commitAudio(), 1800000);
}

function commitAudio() {  
  console.log("Git commit check.");
  git.add("./*").commit("Files update!", (err, result) => {
    console.log(`Commit: R:${result} E:${err}`);
  }).push('origin', 'master', (err, result) => {
    console.log(`Push: R:${result} E:${err}`);
  });
}

module.exports.commitAudio = commitAudio;
