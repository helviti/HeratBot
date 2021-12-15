const fs = require("fs");
const { CronJob } = require("cron");
const { MessageEmbed, MessageActionRow, MessageButton } = require("discord.js");

const { lootChannelId } = require("../config.json");

let fetchedMessages;

function parseLoot() {
  if (fs.existsSync("./savedLoot.json")) {
    return JSON.parse(fs.readFileSync("./savedLoot.json"));
  }
  return {};
}

module.exports.startCron = async function startCron(client) {
  const lootMessage = new CronJob("0 0 */1 * *", async () => {
    const channel = client.channels.cache.get(lootChannelId);
    const previousOffers = [];
    fetchedMessages = await channel.messages
      .fetch()
      .then((messages) =>
        messages.filter((message) => message.author.id === client.user.id)
      );
    fetchedMessages.each((message) =>
      previousOffers.push(message.embeds[0].footer.text)
    );
    const loots = parseLoot();
    if (loots.length > 0) {
      for (const loot of loots) {
        if (!previousOffers.includes(loot.id)) {
          channel.send(constructEmbed(loot));
        }
      }
    }
  });
  lootMessage.start();
};

function constructEmbed(loot) {
  const buttonRow = new MessageActionRow().addComponents(
    new MessageButton().setLabel("Claim loot").setURL(loot.url).setStyle("LINK")
  );
  const embedRow = new MessageEmbed()
    .setColor("#6C27B6")
    .setURL(loot.url)
    .setTitle(`🎁 New Prime Gaming Loot available for 🎮 ${loot.game}`)
    .setFooter(loot.id)
    .setImage(loot.img)
    .setDescription(loot.content.map((e) => `🔹 ${e}`).join("\n"));
  return { embeds: [embedRow], components: [buttonRow] };
}
