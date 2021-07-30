module.exports.HelpCommandHandler = class {
  constructor() {
    this.command = {
      name: 'help',
      description: 'A command to get started',
      options: []
    }
  }

  async handleCommand(interaction) {
    await interaction.reply('Hello World!');
  }
}