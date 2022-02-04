const Discord = require('discord.js'); // eslint-disable-line no-unused-vars
const utility = require('../util/utility');
const DataStorage = require('../util/dataStorage');

const cooldownTime = 2; // minutes
const cooldowns = new Discord.Collection();

/**
 * 
 * @param {Discord.Message} message 
 */
module.exports.filter = async function (message) {
    if (process.env.HELP_CHANNELS.split(',').find(x => x == message.channel.id)) {
        // if sent in a help channel, check for FAQ keywords

        // this is basically a crappy pattern check thing
        // underscores are used as spaces so when adding a pattern using
        // a command it's less pain to program, % character splits the
        // string and therefore acts pretty much as "any characters in between"

        if (!DataStorage.storage.faq) DataStorage.storage.faq = new Map();

        DataStorage.storage.faq.forEach((value, key, map) => { // eslint-disable-line no-unused-vars
            let includesAll = true;
            const keywords = key.replaceAll('_', ' ').replaceAll('\\ ', '_').split('%');
            keywords.forEach(keyword => {
                includesAll &= message.content.toLowerCase().includes(keyword);
            });
            // if all keywords are found in the message and there is no cooldown then send the corresponding answer
            if (includesAll) {
                if (cooldowns.has(key)) {
                    if (cooldowns.get(key) < Date.now()) {
                        cooldowns.delete(key); // cooldown over
                    }
                    else {
                        return; // still on cooldown
                    }
                }
                else {
                    cooldowns.set(key, Date.now() + cooldownTime * 1000 * 60); // new cooldown
                }
                message.channel.send(utility.buildEmbed(value.replaceAll('_', ' ').replaceAll('\\ ', '_').replaceAll('´', '`')));
            }
        });
    }
};
