import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isAdmin, isOwner }) => {
    // Solo admins y owners
    if (!isAdmin && !isOwner) return m.reply('❌ Este comando es solo para *admins* y *owner*.');

    // Debe responder a un mensaje
    if (!m.quoted) return m.reply('⚠️ Responde a una *foto o video de ver una vez* con el comando *.ver*');

    let q = m.quoted.message;
    let type = Object.keys(q)[0];

    // Detecta imagen o video view once
    if (type !== 'viewOnceMessageV2') return m.reply('❌ Eso no es un mensaje *Ver Una Vez*.');

    let media = q.viewOnceMessageV2.message.imageMessage || q.viewOnceMessageV2.message.videoMessage;
    let mime = media.mimetype;
    let isImage = mime.includes('image');
    let isVideo = mime.includes('video');

    try {
        // Descargar el contenido eliminando la protección
        const stream = await downloadContentFromMessage(media, isImage ? 'image' : 'video');
        let buffer = Buffer.from([]);
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk]);

        // Enviar liberado
        await conn.sendMessage(m.chat, {
            [isImage ? 'image' : 'video']: buffer,
            caption: `✅ Aquí está el contenido *View Once* desbloqueado 👀`,
        }, { quoted: m });

    } catch (e) {
        console.error(e);
        m.reply('❌ Error al procesar el contenido View Once.');
    }
}

handler.command = ['viewonce', 'ver', 'vo'];
handler.help = ['ver'];
handler.tags = ['tools'];

export default handler;
