// plugins/cum.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    // Verifica si NSFW está activado en este grupo
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        return m.reply('❌ El contenido NSFW está desactivado en este grupo.\n> Solo un owner puede activarlo con *.nsfw*');
    }

    // Array de gifs/mp4 de ejemplo (Catbox / Telegra.ph)
    const gifs = [
        'https://files.catbox.moe/abc123.mp4',
        'https://files.catbox.moe/def456.mp4',
        'https://files.catbox.moe/ghi789.mp4',
        'https://telegra.ph/file/12345abcde.mp4'
    ];

    // Selecciona uno aleatorio
    const video = gifs[Math.floor(Math.random() * gifs.length)];

    // Envía el gif/video
    conn.sendMessage(m.chat, {
        video: { url: video },
        gifPlayback: true,
        caption: '💦 Aquí tienes tu gif de cum!'
    }, { quoted: m });
};

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = ['cum'];
handler.group = true;

export default handler;
