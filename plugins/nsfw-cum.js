// Código creado por Destroy wa.me/584120346669
import fs from 'fs';
import path from 'path';

const owners = ['59896026646@s.whatsapp.net','59898719147@s.whatsapp.net']; // Números de owner

let handler = async (m, { conn, usedPrefix }) => {
    // Verifica que NSFW esté activado, pero solo avisa a los owners
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        if (owners.includes(m.sender)) {
            return m.reply(
                `《✦》El contenido *NSFW* está desactivado en este grupo.\n> Puedes activarlo con el comando » *#nsfw on*`
            );
        } else {
            return; // Los demás no reciben mensaje
        }
    }

    // Determina a quién se menciona o cita
    let who;
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);

    // Mensaje de caption
    let str;
    if (m.mentionedJid && m.mentionedJid.length > 0 || m.quoted) {
        str = `\`${name2}\` *se vino dentro de* \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` *se vino dentro de... Omitiremos eso*`.trim();
    }

    // Array de videos de respaldo
    const videos = [
        'https://telegra.ph/file/9243544e7ab350ce747d7.mp4',
        'https://telegra.ph/file/fadc180ae9c212e2bd3e1.mp4',
        'https://telegra.ph/file/79a5a0042dd8c44754942.mp4',
        'https://telegra.ph/file/035e84b8767a9f1ac070b.mp4',
        'https://telegra.ph/file/0103144b636efcbdc069b.mp4',
        'https://telegra.ph/file/4d97457142dff96a3f382.mp4',
        'https://telegra.ph/file/b1b4c9f48eaae4a79ae0e.mp4',
        'https://telegra.ph/file/5094ac53709aa11683a54.mp4',
        'https://telegra.ph/file/dc279553e1ccfec6783f3.mp4',
        'https://telegra.ph/file/acdb5c2703ee8390aaf33.mp4'
    ];

    // Selecciona uno al azar
    const video = videos[Math.floor(Math.random() * videos.length)];

    // Envía el video
    try {
        let mentions = [who];
        await conn.sendMessage(
            m.chat,
            { video: { url: video }, gifPlayback: true, caption: str, mentions, ptt: false },
            { quoted: m }
        );
    } catch (e) {
        console.error(e);
        m.reply('❌ No se pudo enviar el contenido NSFW. Intenta más tarde.');
    }
};

handler.help = ['cum/leche @tag'];
handler.tags = ['nsfw'];
handler.command = ['cum', 'leche'];
handler.group = true;

export default handler;
