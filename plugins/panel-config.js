// plugins/panel-config.js
import config from './config.js';

const handler = async (m, { conn }) => {
  const chat = global.db.data.chats[m.chat] || {};
  const bot = global.db.data.settings[conn.user.jid] || {};

  const fkontak = {
    key: { participants: '0@s.whatsapp.net', remoteJid: 'status@broadcast', fromMe: false, id: 'Halo' },
    message: {
      contactMessage: {
        vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;Bot;;;\nFN:y\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
      }
    },
    participant: '0@s.whatsapp.net'
  };

  let panel = '╭━━━〔 ⚡️ PANEL DE CONFIGURACIÓN 〕━━━╮\n';
  panel += '┃ 👑 Opciones de Grupo:\n';
  const grupoKeys = [
    'welcome','autoresponder','autoaceptar','autorechazar','detect','antidelete',
    'antilink','antilink2','nsfw','autolevelup','autosticker','reaction','antitoxic',
    'audios','modoadmin','antifake','antibot'
  ];

  grupoKeys.forEach(key => {
    const estado = chat[key] ?? config[key] ? '✅' : '❌';
    panel += `┃ ${estado} ${key} → comando: ${key}\n`;
  });

  panel += '┃ 🚀 Opciones Globales:\n';
  const globalKeys = [
    'antisubots','public','status','serbot','restrict','autoread','antispam','antiprivado'
  ];

  globalKeys.forEach(key => {
    const estado = bot[key] ?? config[key] ? '✅' : '❌';
    panel += `┃ ${estado} ${key} → comando: ${key}\n`;
  });

  panel += '╰━━━━━━━━━━━━━━━━━━━━╯';

  return conn.reply(m.chat, panel, m, fkontak);
};

handler.help = ['panel'];
handler.tags = ['owner','group'];
handler.command = ['panel','configuracion','conf'];

export default handler;
