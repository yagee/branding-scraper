import dotenv from 'dotenv';
import cron from 'node-cron';
import TelegramBot from 'node-telegram-bot-api';
import path from 'path';
import { fileURLToPath } from 'url';
import scrape from './scrape.js';

const relativePath = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({
  path: path.resolve(relativePath + '/.env'),
});

const {
  NAME,
  BRANDING_LINK,
  CHANNEL_CHAT_ID,
  CHANNEL_BOT_TOKEN,
  PRIVATE_CHAT_ID,
  PRIVATE_BOT_TOKEN,
} = process.env;

const CHAT_ID = NAME ? PRIVATE_CHAT_ID : CHANNEL_CHAT_ID;
const TOKEN = NAME ? PRIVATE_BOT_TOKEN : CHANNEL_BOT_TOKEN;

// console.log(NAME, CHAT_ID, TOKEN);

const bot = new TelegramBot(TOKEN, {
  polling: true,
});

const cronJob = async () => {
  try {
    const time = new Date().toLocaleTimeString();
    console.log('Running cron job...', time);

    let res = { temp: false };

    while (res.temp !== true) {
      res = await scrape(BRANDING_LINK, relativePath);
    }

    bot.sendMediaGroup(
      CHAT_ID,
      [
        {
          type: 'photo',
          media: `${relativePath}/auth.png`,
          caption: `#${res.clientName}`,
        },
        {
          type: 'photo',
          media: `${relativePath}/destination.png`,
          caption: res.brandingClick,
        },
      ],
      {
        disable_notification: true,
      }
    );
  } catch (error) {
    console.error('Error running cron job:', error);
  }
};

cron.schedule('*/5 * * * *', cronJob);

console.log('starting script');

// bot.addListener('message', function (message) {});

bot.onText(/\/start/, () => {
  cronJob();
});
