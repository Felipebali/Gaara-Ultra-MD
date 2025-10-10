// plugins/nsfw.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix }) => {
    const chat = global.db.data.chats[m.chat] || {};

    // Validación NSFW
    if (!chat.nsfw && m.isGroup) {
        return m.reply(`《✦》El contenido *NSFW* está desactivado en este grupo.\n> Un administrador puede activarlo con el comando » *#nsfw on*`);
    }

    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);

    let str;
    if (m.mentionedJid?.length > 0) {
        str = `\`${name2}\` *le chupó las tetas a* \`${name}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` *le está chupando las tetas a* \`${name}\`.`;
    } else {
        str = `\`${name2}\` *está chupando tetas! >.<*`;
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/01143878beb3d0430c33e.mp4',
            'https://telegra.ph/file/7b181cbaa54eee6c048fc.mp4',
            'https://telegra.ph/file/f8cf75586670483fadc1d.mp4',
            'https://telegra.ph/file/f8969e557ad07e7e53f1a.mp4',
            'https://telegra.ph/file/1104aa065e51d29a5fb4f.mp4',
            'https://telegra.ph/file/9e1240c29f3a6a9867aaa.mp4',
            'https://telegra.ph/file/949dff632250307033b2e.mp4',
            'https://telegra.ph/file/b178b294a963d562bb449.mp4',
            'https://telegra.ph/file/95efbd8837aa18f3e2bde.mp4',
            'https://telegra.ph/file/9827c7270c9ceddb8d074.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions: [who]
        }, { quoted: m });
    }
}

handler.help = ['suckboobs', 'chupartetas'];
handler.tags = ['nsfw'];
handler.command = ['suckboobs','chupartetas'];
handler.group = true;

export default handler;
