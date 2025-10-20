// plugins/playaudio_ytdl.js
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';
import path from 'path';

const handler = async (m, { conn, args }) => {
    if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);

    try {
        await m.react('🕓');

        // Buscar video
        const videos = await searchVideos(args.join(" "));
        if (!videos.length) throw new Error('✖️ No se encontraron resultados.');

        const video = videos[0];

        // Descargar audio con ytdl
        const audioPath = path.join('/tmp', `${video.title.replace(/[^a-zA-Z0-9]/g, '_')}.mp3`);
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

        await m.react('✅');

        // Borrar archivo temporal
        fs.unlinkSync(audioPath);

    } catch (err) {
        console.error(err);
        await m.react('✖️');
        return conn.reply(m.chat, `⚠️ No se pudo obtener el audio.\nError: ${err.message}`, m);
    }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];
export default handler;

async function searchVideos(query) {
    const res = await yts(query);
    return res.videos.slice(0, 1).map(v => ({
        title: v.title,
        url: v.url,
        thumbnail: v.thumbnail,
        channel: v.author.name,
        duration: v.duration.timestamp || 'No disponible',
        views: v.views?.toLocaleString() || 'No disponible'
    }));
}
