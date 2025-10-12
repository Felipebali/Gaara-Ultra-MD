// plugins/nsfw-sexo.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.nsfw && m.isGroup) {
        return m.reply('[❗] 𝐋𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 +18 están desactivados en este grupo.\n> Si eres owner y deseas activarlos, usa .nsfw');
    }

    // Detectamos el usuario objetivo
    let who = m.mentionedJid?.[0] || m.quoted?.sender || m.sender;
    const name = conn.getName(who);
    const name2 = conn.getName(m.sender);

    m.react('🥵');

    // Construimos el mensaje según mención o cita
    let str;
    if (m.mentionedJid?.length) {
        str = `\`${name2}\` tiene sexo fuertemente con \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` tiene sexo con \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` tiene sexo apasionadamente`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/a2ad1dd463a935d5dfd17.mp4',
            'https://telegra.ph/file/e3abb2e79cd1ccf709e91.mp4',
            'https://telegra.ph/file/c5be4a906531c6731cd41.mp4',
            'https://telegra.ph/file/9c4b894e034c290df75e4.mp4',
            'https://telegra.ph/file/3246f62c61a0ebebcb5c8.mp4',
            'https://telegra.ph/file/820460f05d76bb2329bbc.mp4',
            'https://telegra.ph/file/2072f260302c6bb97682a.mp4',
            'https://telegra.ph/file/22d0ef801c93c1b2ac074.mp4',
            'https://telegra.ph/file/6f66fd1974e8df1496768.mp4'
        ];

        const video = videos[Math.floor(Math.random() * videos.length)];
        const mentions = [who];

        await conn.sendMessage(m.chat, {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions
        }, { quoted: m });
    }
};

handler.help = ['sexo/sex @tag'];
handler.tags = ['nsfw'];
handler.command = ['sexo','sex'];
handler.group = true;

export default handler;
