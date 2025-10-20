// plugins/playaudio_termux.js
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);

    try {
        // Buscar video
        const videos = await searchVideos(args.join(" "));
        if (!videos.length) throw new Error('✖️ No se encontraron resultados.');

        const video = videos[0];

        // Obtener thumbnail
        const thumbBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer());

        // Enviar info con miniatura
        const infoMessage = `🎬 *${video.title}*\n> 📺 *Canal:* ${video.channel}\n> ⏱ *Duración:* ${video.duration}\n> 👁 *Vistas:* ${video.views}\n> 🔗 *Link:* ${video.url}`;
        await conn.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m });

        // Descargar audio con ytdl
        const safeName = video.title.replace(/[^a-zA-Z0-9]/g, '_');
        const audioPath = path.join('./', `${safeName}.mp3`);
        const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
        const writeStream = fs.createWriteStream(audioPath);

        stream.pipe(writeStream);

        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
            stream.on('error', reject);
        });

        // Enviar audio
        await conn.sendMessage(m.chat, {
            audio: { url: audioPath },
            mimetype: 'audio/mpeg',
            fileName: `${video.title}.mp3`
        }, { quoted: m });

        // Borrar archivo temporal
        fs.unlinkSync(audioPath);

    } catch (err) {
        console.error(err);
        return conn.reply(m.chat, `⚠️ No se pudo obtener el audio.\nError: ${err.message}`, m);
    }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];
export default handler;

async function searchVideos(query) {
    try {
        const res = await yts(query);
        return res.videos.slice(0, 1).map(v => ({
            title: v.title,
            url: v.url,
            thumbnail: v.thumbnail,
            channel: v.author.name,
            duration: v.duration.timestamp || 'No disponible',
            views: v.views?.toLocaleString() || 'No disponible'
        }));
    } catch (err) {
        console.error('Error en yt-search:', err.message);
        return [];
    }
}
