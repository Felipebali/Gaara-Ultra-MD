import config from './config.js';

const handler = async (m, { conn, args }) => {
  const chat = global.db.data.chats[m.chat];

  // Ejemplo: aplicar welcome desde config
  chat.welcome = config.welcome;
  chat.autoresponder = config.autoresponder;
  chat.autoAceptar = config.autoaceptar;
  chat.autorechazar = config.autorechazar;
  chat.detect = config.detect;
  chat.antidelete = config.antidelete;
  chat.antiLink = config.antilink;
  chat.antiLink2 = config.antilink2;
  chat.nsfw = config.nsfw;
  chat.autolevelup = config.autolevelup;
  chat.autosticker = config.autosticker;
  chat.reaction = config.reaction;
  chat.antitoxic = config.antitoxic;
  chat.audios = config.audios;
  chat.modoadmin = config.modoadmin;
  chat.antifake = config.antifake;
  chat.antiBot = config.antibot;
  
  // Opciones globales (bot)
  const bot = global.db.data.settings[conn.user.jid] || {};
  bot.antiBot2 = config.antisubots;
  bot.autobio = config.status;
  bot.jadibotmd = config.serbot;
  bot.restrict = config.restrict;
  bot.autoread2 = config.autoread;
  bot.antiSpam = config.antispam;
  bot.antiPrivate = config.antiprivado;

  return conn.reply(m.chat, '✅ *Se han aplicado las configuraciones de config correctamente.*', m);
};

export default handler;
