import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, usedPrefix, isOwner }) => {
    // Validación NSFW solo para grupos
    if (!db.data.chats[m.chat].nsfw && m.isGroup) {
        return m.reply(
`🐉 El contenido *NSFW* está desactivado en este grupo.
> Solo el OWNER puede activarlo con el comando » *.nsfw*`
        );
    }

    let who;
    if (m.mentionedJid.length > 0) who = m.mentionedJid[0]; // Si hay mención
    else if (m.quoted) who = m.quoted.sender; // Si se cita un mensaje
    else who = m.sender; // Por defecto, el emisor

    let name = conn.getName(who); 
    let name2 = conn.getName(m.sender); 

    m.react('🥵');

    let str;
    if (m.mentionedJid.length > 0) {
        str = `\`${name2}\` le partió el culo a la puta de \`${name || who}\`.`;
    } else if (m.quoted) {
        str = `\`${name2}\` se la metió en el ano a \`${name || who}\`.`;
    } else {
        str = `\`${name2}\` está haciendo un anal`.trim();
    }

    if (m.isGroup) {
        const videos = [
            'https://telegra.ph/file/7185b0be7a315706d086a.mp4', 
            'https://telegra.ph/file/a11625fef11d628d3c8df.mp4', 
            'https://telegra.ph/file/062b9506656e89b069618.mp4',
            'https://telegra.ph/file/1325494a54adc9a87ec56.mp4',
            'https://qu.ax/KKazS.mp4',
            'https://qu.ax/ieJeB.mp4',
            'https://qu.ax/MCdGn.mp4'
        ];
        const video = videos[Math.floor(Math.random() * videos.length)];

        let mentions = [who];
        conn.sendMessage(m.chat, { video: { url: video }, gifPlayback: true, caption: str, mentions }, { quoted: m });
    }
}

handler.help = ['anal/culiar @tag'];
handler.tags = ['nsfw'];
handler.command = ['anal','culiar'];
handler.group = true;

export default handler;
