// Código NSFW solo para OWNER

import fs from 'fs';
import path from 'path';

let handler = async (m, { conn }) => {
    // Validación NSFW solo si está activado por OWNER
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(
`[❗] 𝐋𝐨𝐬 𝐜𝐨𝐦𝐚𝐧𝐝𝐨𝐬 +18 están desactivados en este grupo.
> Solo el OWNER puede activarlos con el comando » *.nsfw*`
        );
    }

    // Detectamos el usuario mencionado o citado
    let who;
    if (m.mentionedJid.length > 0) who = m.mentionedJid[0];
    else if (m.quoted) who = m.quoted.sender;
    else who = m.sender;

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);

    m.react('🔥');

    // Construimos el mensaje según si hay mención o cita
    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` le está agarrando las tetas a \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` está agarrando las tetas de \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` está agarrando unas ricas tetas >.<`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/e6bf14b93dfe22c4972d0.mp4', 
            'https://telegra.ph/file/075db3ebba7126d2f0d95.mp4', 
            'https://telegra.ph/file/37c21753892b5d843b9ce.mp4',
            'https://telegra.ph/file/04bbf490e29158f03e348.mp4',
            'https://telegra.ph/file/82d32821f3b57b62359f2.mp4',
            'https://telegra.ph/file/36149496affe5d02c8965.mp4',
            'https://telegra.ph/file/61d85d10baf2e3b9a4cde.mp4',
            'https://telegra.ph/file/538c95e4f1c481bcc3cce.mp4',
            'https://telegra.ph/file/e999ef6e67a1a75a515d6.mp4',
            'https://telegra.ph/file/05c1bd3a2ec54428ac2fc.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['grabboobs/agarrartetas @tag'];
handler.tags = ['nsfw'];
handler.command = ['grabboobs','agarrartetas'];
handler.group = true;

export default handler;
