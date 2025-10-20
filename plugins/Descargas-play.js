// plugins/playaudio_termux.js
import yts from 'yt-search';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
    if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);

    await m.react('🕓');

    try {
        // Buscar video en YouTube
        const videos = await searchVideos(args.join(" "));
        if (!videos.length) throw new Error('✖️ No se encontraron resultados.');
        const video = videos[0];

        // Preparar ruta de audio temporal
        const audioFileName = `${video.titulo.replace(/[\\/:"*?<>|]/g, '')}.m4a`;
        const audioPath = path.resolve('./tmp', audioFileName);

        // Crear carpeta tmp si no existe
        if (!fs.existsSync('./tmp')) fs.mkdirSync('./tmp');

        // Borrar archivo anterior si existe
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        // Enviar miniatura + info
        const thumbBuffer = await (await fetch(video.miniatura)).buffer();
        const infoMsg = `🎬 *${video.titulo}*\n> 📺 *Canal:* ${video.canal}\n> ⏱ *Duración:* ${video.duracion}\n> 👁 Vistas: ${video.vistas}\n> 🔗 Link: ${video.url}`;
        await conn.sendMessage(m.chat, { image: thumbBuffer, caption: infoMsg }, { quoted: m });

        // Descargar audio con yt-dlp
        await youtubedl(video.url, {
            extractAudio: true,
            audioFormat: 'm4a',
            audioQuality: 0,
            output: audioPath,
            noCheckCertificates: true,
            allowUnplayableFormats: true,
        });

        // Enviar audio al chat
        await conn.sendMessage(m.chat, {
            audio: { url: audioPath },
            mimetype: 'audio/m4a',
            fileName: audioFileName
        }, { quoted: m });

        await m.react('✅');

    } catch (err) {
        console.error(err);
        await m.react('✖️');
        return conn.reply(m.chat, `⚠️ No se pudo obtener el audio.\n${err.message}`, m);
    }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];

export default handler;

// Función para buscar video
async function searchVideos(query) {
    try {
        const res = await yts(query);
        return res.videos.slice(0, 1).map(v => ({
            titulo: v.title,
            url: v.url,
            miniatura: v.thumbnail,
            canal: v.author.name,
            duracion: v.duration.timestamp || 'No disponible',
            vistas: v.views?.toLocaleString() || 'No disponible'
        }));
    } catch (err) {
        console.error('Error en yt-search:', err.message);
        return [];
    }
}
