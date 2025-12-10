const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const fs = require('fs-extra');
const { alldown } = require('imon-videos-downloader');

// Set up your bot with the token
const bot = new TelegramBot('7428499817:AAFrq2xGwEpCo_N_UkDPVdoK0BP_t4CtTkk', { polling: true });

// File to store unique users
const usersFile = './users.json';

// Read users from file (if it exists)
let users = [];
if (fs.existsSync(usersFile)) {
    users = JSON.parse(fs.readFileSync(usersFile));
}

// Handle the '/start' command
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const username = msg.chat.username || "No Username"; // Handle the case when there's no username

    // Log the username and user ID in the console

    // Check if user is already in the list, if not add them with a new count
    if (!users.some(user => user.userId === chatId)) {
        const userCount = users.length + 1;
        users.push({ userId: chatId, count: userCount });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }

    bot.sendMessage(chatId, `✨❝𝐖𝐄𝐋𝐂𝐎𝐌𝐄 𝐓𝐎 𝐈𝐌𝐎𝐍 𝐀𝐥𝐥 𝐕𝐈𝐃𝐄𝐎 𝐃𝐎𝐖𝐍𝐋𝐎𝐀𝐃𝐄𝐑 𝐁𝐎𝐓❞😗✨\n\n🔹 𝙎𝙀𝙉𝘿 𝙈𝙀 𝙑𝙄𝘿𝙀𝙊 𝙇𝙄𝙉𝙆 𝘼𝙉𝘿 𝘿𝙊𝙒𝙉𝙋𝙇𝙎𝘼𝙙 𝙑𝙄𝘿𝙀𝙊 🎥\n\n👨‍💻 ❝𝐁𝐎𝐓 𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑❞: 𝐈𝐌𝐎𝐍\n\n📞Contact:\n\n𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 : https://www.facebook.com/Imon.132233\n\n🔹𝐓𝐄𝐋𝐄𝐆𝐑𝐀𝐌 :@Farhan_islam12\n\n🎬 ╰•★★ Start Downloading Now! ★★•╯`);
});

// Command to get the number of users
bot.onText(/\/user/, (msg) => {
    const chatId = msg.chat.id;

    // Send the number of unique users
    bot.sendMessage(chatId, `👥 Current number of unique users interacting with the bot: ${users.length}`);
});

// Handle messages with video URLs
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const content = msg.text;
    const username = msg.chat.username || "No Username"; // Handle the case when there's no username

    // Log the username and user ID in the console for each message
    console.log(`
    User sent a message: 
    user name:${username} 
    ID: ${chatId}`);

    // Track new users
    if (!users.some(user => user.userId === chatId)) {
        const userCount = users.length + 1;
        users.push({ userId: chatId, count: userCount });
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2));
    }

    const text = content;

    if (text && (text.match(/^https:\/\/vt\.tiktok\.com\/.*/) || text.match(/^https:\/\/vm\.tiktok\.com\/.*/) || text.match(/^https:\/\/www\.tiktok\.com.*/) || text.match(/^https:\/\/m\.tiktok\.com.*/))) {
        const waitMsg = await bot.sendMessage(chatId, "🔍𝐋𝐢𝐧𝐤 𝐢𝐬 𝐛𝐞𝐢𝐧𝐠 𝐯𝐞𝐫𝐢𝐟𝐢𝐞𝐝, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭....", {
            reply_to_message_id: msg.message_id,
        });

        try {
            const { tikdown } = require("imon-videos-downloader");
            const data = await tikdown(text);
            console.log(data);

            const { title, video, images } = data.data;

            const replyMarkup = {
                inline_keyboard: [
                    [{ text: 'Download Video', url: video }],
                ],
            };

            if (images && images.length > 0) {
                // Prepare media group
                const mediaGroup = images.map((image, index) => ({
                    type: 'photo',
                    media: image,
                    caption: index === 0 ? `🎬 𝐕𝐈𝐃𝐄𝐎 𝐓𝐈𝐓𝐋𝐄𝐒: ${title}\n\n👨‍💻𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑: @Farhan_islam12` : undefined, // Caption for the first image
                }));

                await bot.sendMediaGroup(chatId, mediaGroup, {
                    reply_markup: replyMarkup,
                    reply_to_message_id: msg.message_id,
                });

            } else {
                const vid = (
                    await axios.get(video, { responseType: 'stream' })
                ).data;

                await bot.sendVideo(chatId, vid, {
                    caption: `🎬 𝐕𝐈𝐃𝐄𝐎 𝐓𝐈𝐓𝐋𝐄𝐒: ${title}\n\n👨‍💻𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑: @Farhan_islam12`,
                    reply_to_message_id: msg.message_id,
                    reply_markup: replyMarkup,
                });
            }

            await bot.deleteMessage(chatId, waitMsg.message_id);
        } catch (error) {
            console.error(error);
            await bot.deleteMessage(chatId, waitMsg.message_id);
            await bot.sendMessage(chatId, "𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐁𝐎𝐓 𝐓𝐇𝐄 𝐕𝐈𝐃𝐄𝐎.\n𝐏𝐋𝐄𝐀𝐒𝐄 𝐂𝐇𝐄𝐂𝐊 𝐓𝐇𝐄 𝐋𝐈𝐍𝐊 𝐀𝐍𝐃 𝐓𝐑𝐘 𝐀𝐆𝐀𝐈𝐍.");
        }
        return;
    }

    // Check if the message starts with "https://"
    if (content && content.startsWith("https://")) {
        try {
            const loadingMessage = await bot.sendMessage(chatId, '🔍𝐋𝐢𝐧𝐤 𝐢𝐬 𝐛𝐞𝐢𝐧𝐠 𝐯𝐞𝐫𝐢𝐟𝐢𝐞𝐝, 𝐩𝐥𝐞𝐚𝐬𝐞 𝐰𝐚𝐢𝐭....');
            const data = await alldown(content);
            console.log(data);

            const { low, high, title } = data.data;

            let nayan;

            try {
                const vidResponse = await axios.get(high, { responseType: 'stream' });
                nayan = vidResponse?.data || high;
            } catch (error) {
                nayan = high;
            }

            await bot.sendVideo(chatId, nayan, {
                caption: `🎬 𝐕𝐈𝐃𝐄𝐎 𝐓𝐈𝐓𝐋𝐄𝐒: ${title}\n\n👨‍💻𝐃𝐄𝐕𝐄𝐋𝐎𝐏𝐄𝐑: @Farhan_islam12`,
                reply_markup: {
                    inline_keyboard: [
                        [{ text: 'Download', url: high }],
                    ],
                },
            });

            bot.deleteMessage(chatId, loadingMessage.message_id);

        } catch (error) {
            console.error('Error:', error);
            bot.sendMessage(chatId, '𝐅𝐀𝐈𝐋𝐄𝐃 𝐓𝐎 𝐁𝐎𝐓 𝐓𝐇𝐄 𝐕𝐈𝐃𝐄𝐎.\n𝐏𝐋𝐄𝐀𝐒𝐄 𝐂𝐇𝐄𝐂𝐊 𝐓𝐇𝐄 𝐋𝐈𝐍𝐊 𝐀𝐍𝐃 𝐓𝐑𝐘 𝐀𝐆𝐀𝐈𝐍.');
        }
    }
});

// Handle graceful shutdown
process.once('SIGINT', () => bot.stopPolling());
process.once('SIGTERM', () => bot.stopPolling());
console.log("Imon Telegram Bot Running");
