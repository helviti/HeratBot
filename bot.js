const { Client, Intents } = require("discord.js");
const { generateClipObjects } = require("./analytics");
const consWrite = require('./console.js');
const { getTime } = require("./lib/util");
const { HelpCommandHandler } = require("./handlers/command/help_command_handler");
const { ClipsCommandHandler } = require("./handlers/command/clips_command_handler");
const { handleGuildMessage } = require("./handlers/message/guild_message_handler");
const { TagsCommandHandler } = require("./handlers/command/tags_command_handler");
const { TagCommandHandler } = require("./handlers/command/tag_command_handle");
const { handleButtonInteraction } = require("./handlers/button/button_handler");
const { SearchCommandHandler } = require("./handlers/command/search_command_handler");
const { AddTagCommandHandler } = require("./handlers/command/addtag_command_handler");
const { RemoveTagCommandHandler } = require("./handlers/command/removetag_command_handler");
const { handleDirectMessage } = require("./handlers/message/direct_message_handler");
const { RandomCommandHandler } = require("./handlers/command/random_command_handler");
const { RecentCommandHandler } = require("./handlers/command/recent_command_handler");
const { FrequentCommandHandler } = require("./handlers/command/frequent_command_handler");
const { initializeAndRunIntros, memberJoined } = require("./lib/intros");
const { SetIntroCommandHandler } = require("./handlers/command/set_intro_command_handle");
const { LeaveCommandHandler } = require("./handlers/command/leave_command_handler");

let commandHandlers;

module.exports.startBot = function startBot(token) {
  generateClipObjects();
  initializeAndRunIntros();
  const client = new Client({ 
    intents: [
      Intents.FLAGS.GUILDS,
      Intents.FLAGS.GUILD_MESSAGES,
      Intents.FLAGS.DIRECT_MESSAGES,
      Intents.FLAGS.GUILD_VOICE_STATES
    ],
    partials: [
      'CHANNEL'
    ]
  });

  consWrite();

  client.on('ready', () => {
    populateAndHandleCommands(client.application.commands);
    console.log(`${getTime()}: Logged in as ${client.user.tag}\n===============================================`);
  });

  client.on('interactionCreate', handleInteraction);

  client.on('messageCreate', async msg => {
    if (msg.channel.type === 'DM') await handleDirectMessage(msg);
    if (msg.channel.type === 'GUILD_TEXT') await handleGuildMessage(msg);
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

  client.on('voiceStateUpdate', (oldState, newState) => {
    if (!oldState.channel && newState.channel) {
      memberJoined(newState.member);
    }
  });

  client.login(token);
}

function populateAndHandleCommands(commands) {
  const rawCommandHandlers = [
    // new HelpCommandHandler(),
    new ClipsCommandHandler(),
    new TagsCommandHandler(),
    new TagCommandHandler(),
    new SearchCommandHandler(),
    new AddTagCommandHandler(),
    new RemoveTagCommandHandler(),
    new RandomCommandHandler(),
    new RecentCommandHandler(),
    new FrequentCommandHandler(),
    new SetIntroCommandHandler(),
    new LeaveCommandHandler()
  ];

  commandHandlers = {};
  rawCommandHandlers.forEach(handler => {
    commandHandlers[handler.command.name] = handler;
  });

  commands.set(rawCommandHandlers.map(handler => handler.command))
    .catch(console.error);
}

async function handleInteraction(interaction) {
  if (interaction.isCommand()) {
    const commandName = interaction.commandName;
    if (commandName in commandHandlers) {
      await commandHandlers[commandName].handleCommand(interaction);
    }
  } else if (interaction.isButton()) {
    await handleButtonInteraction(interaction);
  }
}
