// plugins/playaudio_termux_safe.js
import yts from 'yt-search';
import youtubedl from 'youtube-dl-exec';
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const handler = async (m, { conn, args }) => {
    if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);

    await m.react('🕓');

    try {
        // Buscar video
        const videos = await searchVideos(args.join(" "));
        if (!videos.length) throw new Error('✖️ No se encontraron resultados.');
        const video = videos[0];

        // Crear carpeta tmp si no existe
        const tmpDir = path.resolve('./tmp');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);

        // Limpiar nombre de archivo
        const cleanName = video.titulo.replace(/[^a-zA-Z0-9 _-]/g, '');
        const audioPath = path.join(tmpDir, cleanName + '.m4a');

        // Borrar archivo previo si existe
        if (fs.existsSync(audioPath)) fs.unlinkSync(audioPath);

        // Enviar miniatura + info
        const thumbBuffer = await (await fetch(video.miniatura)).buffer();
        const infoMsg = `🎬 *${video.titulo}*\n> 📺 *Canal:* ${video.canal}\n> ⏱ *Duración:* ${video.duracion}\n> 👁 Vistas: ${video.vistas}\n> 🔗 Link: ${video.url}`;
        await conn.sendMessage(m.chat, { image: thumbBuffer, caption: infoMsg }, { quoted: m });

        // Descargar audio
        await youtubedl(video.url, {
            extractAudio: true,
            audioFormat: 'm4a',
            audioQuality: 0,
            output: audioPath,
            noCheckCertificates: true,
            allowUnplayableFormats: true,
        });

        // Verificar que el archivo se creó
        if (!fs.existsSync(audioPath)) throw new Error('❌ Falló la creación del archivo de audio.');

        // Enviar audio
        await conn.sendMessage(m.chat, {
            audio: { url: audioPath },
            mimetype: 'audio/m4a',
            fileName: cleanName + '.m4a'
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
