import { generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { smsg } from './lib/simple.js';
import { format } from 'util';
import { fileURLToPath } from 'url';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import fs from 'fs';
import chalk from 'chalk';
import ws from 'ws';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms));

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || [];
  this.uptime = this.uptime || Date.now();
  if (!chatUpdate) return;
  this.pushMessage(chatUpdate.messages).catch(console.error);
  let m = chatUpdate.messages[chatUpdate.messages.length - 1];
  if (!m) return;
  if (global.db.data == null) await global.loadDatabase();

  try {
    m = smsg(this, m) || m;
    if (!m) return;
    global.mconn = m;
    m.exp = 0;
    m.monedas = false;

    try {
      let user = global.db.data.users[m.sender];
      if (typeof user !== 'object') global.db.data.users[m.sender] = {};
      if (user) {
        if (!isNumber(user.exp)) user.exp = 0;
        if (!isNumber(user.monedas)) user.monedas = 10;
        if (!isNumber(user.level)) user.level = 0;
        if (!isNumber(user.warn)) user.warn = 0;
        if (!('banned' in user)) user.banned = false;
        if (!('premium' in user)) user.premium = false;
        if (!user.premium) user.premiumTime = 0;
      } else {
        global.db.data.users[m.sender] = {
          exp: 0,
          monedas: 10,
          level: 0,
          warn: 0,
          banned: false,
          premium: false,
          premiumTime: 0
        };
      }

      let chat = global.db.data.chats[m.chat];
      if (typeof chat !== 'object') global.db.data.chats[m.chat] = {};
      if (chat) {
        if (!('isBanned' in chat)) chat.isBanned = false;
        if (!('welcome' in chat)) chat.welcome = true;
        if (!('modoadmin' in chat)) chat.modoadmin = false;
        if (!('antiLink' in chat)) chat.antiLink = true;
        if (!('reaction' in chat)) chat.reaction = false;
      } else {
        global.db.data.chats[m.chat] = {
          isBanned: false,
          welcome: true,
          modoadmin: false,
          antiLink: true,
          reaction: false
        };
      }

      var settings = global.db.data.settings[this.user.jid];
      if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {};
      if (settings) {
        if (!('self' in settings)) settings.self = false;
        if (!('restrict' in settings)) settings.restrict = true;
        if (!('autoread' in settings)) settings.autoread = false;
      } else {
        global.db.data.settings[this.user.jid] = {
          self: false,
          restrict: true,
          autoread: false
        };
      }
    } catch (e) {
      console.error(e);
    }

    if (typeof m.text !== 'string') m.text = '';
    const chat = global.db.data.chats[m.chat];
    globalThis.setting = global.db.data.settings[this.user.jid];

    const detectwhat = m.sender.includes('@lid') ? '@lid' : '@s.whatsapp.net';
    const isROwner = [...global.owner.map(([number]) => number)]
      .map(v => v.replace(/[^0-9]/g, '') + detectwhat)
      .includes(m.sender);
    const isOwner = isROwner || m.fromMe;
    const isPrems = isROwner || global.db.data.users[m.sender].premiumTime > 0;

    if (m.isBaileys) return;
    m.exp += Math.ceil(Math.random() * 10);

    let usedPrefix;
    let _user = global.db.data.users[m.sender];

    const senderLid = m.sender;
    const senderJid = m.sender;

    const groupMetadata = m.isGroup
      ? ((this.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(() => null))
      : {};

    const participants = m.isGroup && groupMetadata ? (groupMetadata.participants || []) : [];
    const user = participants.find(p => p.id === senderLid || p.jid === senderJid) || {};
    const bot = participants.find(p => p.id === this.user.jid || p.jid === this.user.jid) || {};
    const isRAdmin = (user && user.admin) === 'superadmin';
    const isAdmin = isRAdmin || ((user && user.admin) === 'admin');
    const isBotAdmin = !!(bot && bot.admin);

    const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

    for (let name in global.plugins) {
      let plugin = global.plugins[name];
      if (!plugin) continue;
      if (plugin.disabled) continue;

      const __filename = join(___dirname, name);

      if (typeof plugin.all === 'function') {
        try {
          await plugin.all.call(this, m, {
            chatUpdate,
            __dirname: ___dirname,
            __filename
          });
        } catch (e) {
          console.error(e);
        }
      }

      const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
      let _prefix = (plugin.customPrefix ? [plugin.customPrefix] : []).concat(
        global.db.data.settings[this.user.jid]?.prefix || global.prefix
      );

      let match = (_prefix instanceof RegExp
        ? [[_prefix.exec(m.text), _prefix]]
        : Array.isArray(_prefix)
        ? _prefix.map(p => {
            let re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            return [re.exec(m.text), re];
          })
        : typeof _prefix === 'string'
        ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]]
        : [[[], new RegExp('')]]
      ).find(p => p[1]);

      if (typeof plugin.before === 'function') {
        if (
          await plugin.before.call(this, m, {
            match,
            conn: this,
            participants,
            groupMetadata,
            user,
            bot,
            isROwner,
            isOwner,
            isRAdmin,
            isAdmin,
            isBotAdmin,
            isPrems,
            chatUpdate,
            __dirname: ___dirname,
            __filename
          })
        )
          continue;
      }

      if (typeof plugin !== 'function') continue;

      if ((usedPrefix = (match[0] || '')[0])) {
        let noPrefix = m.text.replace(usedPrefix, '');
        let [command, ...args] = noPrefix.trim().split` `.filter(v => v);
        args = args || [];
        let _args = noPrefix.trim().split` `.slice(1);
        let text = _args.join` `;
        command = (command || '').toLowerCase();
        let fail = plugin.fail || global.dfail;
        let isAccept =
          plugin.command instanceof RegExp
            ? plugin.command.test(command)
            : Array.isArray(plugin.command)
            ? plugin.command.some(cmd => (cmd instanceof RegExp ? cmd.test(command) : cmd === command))
            : typeof plugin.command === 'string'
            ? plugin.command === command
            : false;

        if (!isAccept) continue;

        m.plugin = name;
        if (plugin.owner && !isOwner) {
          m.reply('🧠 Boludo, ese comando es solo para los dueños del bot 😏');
          continue;
        }

        m.isCommand = true;
        let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10;
        m.exp += xp;

        let extra = {
          match,
          usedPrefix,
          noPrefix,
          _args,
          args,
          command,
          text,
          conn: this,
          participants,
          groupMetadata,
          user,
          bot,
          isROwner,
          isOwner,
          isRAdmin,
          isAdmin,
          isBotAdmin,
          isPrems,
          chatUpdate,
          __dirname: ___dirname,
          __filename
        };

        try {
          await plugin.call(this, m, extra);
        } catch (e) {
          m.error = e;
          console.error(e);
          if (e) {
            let text = format(e);
            m.reply(text);
          }
        }
        break;
      }
    }
  } catch (e) {
    console.error(e);
  }
}

let file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
  unwatchFile(file);
  console.log(chalk.magenta("Se actualizó 'handler.js'"));
});
