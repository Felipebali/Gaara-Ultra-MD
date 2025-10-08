// plugins/nsfw-cum.js
import axios from 'axios';

let handler = async (m, { conn }) => {
    // Verifica si NSFW está activado en el grupo
    if (m.isGroup && !db.data.chats[m.chat].nsfw) {
        return m.reply('❌ El contenido NSFW está desactivado en este grupo.\n> Solo un owner o admin puede activarlo con *.nsfw*');
    }

    // Lista de respaldo si falla la API
    const backups = [
        'https://files.catbox.moe/abc123.mp4',
        'https://files.catbox.moe/def456.mp4',
        'https://files.catbox.moe/ghi789.mp4',
        'https://telegra.ph/file/12345abcde.mp4'
    ];

    let videoUrl = null;

    try {
        // Intentamos obtener un gif de la API
        const response = await axios.get('https://api.waifu.pics/nsfw/cum');
        if (response.data && response.data.url) videoUrl = response.data.url;
    } catch (e) {
        console.log('[NSFW] Falló la API, usando backup');
        videoUrl = backups[Math.floor(Math.random() * backups.length)];
    }

    // Si no hay video (por cualquier razón), usar backup
    if (!videoUrl) videoUrl = backups[Math.floor(Math.random() * backups.length)];

    try {
        await conn.sendMessage(m.chat, {
            video: { url: videoUrl },
            gifPlayback: true,
            caption: '💦 Aquí tienes tu gif de cum!'
        }, { quoted: m });
    } catch (e) {
        console.error(e);
        m.reply('❌ No se pudo enviar el contenido NSFW. Intenta de nuevo más tarde.');
    }
};

handler.help = ['cum'];
handler.tags = ['nsfw'];
handler.command = ['cum'];
handler.group = true;

export default handler;
