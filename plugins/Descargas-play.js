// plugins/playaudio_final.js
import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import { exec } from 'child_process';

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);
  await m.react('🕓');

  try {
    let video;

    // Verificar si es URL válida de YouTube
    const urlRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/;
    const urlMatch = args[0].match(urlRegex);

    if (urlMatch) {
      const url = urlMatch[0];
      if (!ytdl.validateURL(url)) throw new Error('URL no válida.');
      const info = await ytdl.getInfo(url);
      video = {
        title: info.videoDetails.title,
        url: info.videoDetails.video_url,
        author: { name: info.videoDetails.author.name },
        duration: { timestamp: new Date(info.videoDetails.lengthSeconds * 1000).toISOString().substr(11, 8) },
        views: parseInt(info.videoDetails.viewCount),
        thumbnail: info.videoDetails.thumbnails.pop().url
      };
    } else {
      // Buscar video por texto
      const search = await yts(args.join(" "));
      if (!search.videos.length) throw new Error('✖️ No se encontraron resultados.');
      video = search.videos[0];
    }

    const titleSafe = video.title.replace(/[^a-zA-Z0-9 ]/g, "_").substring(0, 100);

    // Asegurarse de que la carpeta tmp exista
    const tmpDir = path.resolve('./tmp');
    if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir);
    const tmpPath = path.join(tmpDir, `${titleSafe}.mp3`);

    // Enviar miniatura + info primero
    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer();
    const infoMessage = `🎬 *${video.title}*\n> 📺 *Canal:* ${video.author.name}\n> ⏱ *Duración:* ${video.duration.timestamp || 'No disponible'}\n> 👁 *Vistas:* ${video.views?.toLocaleString() || 'No disponible'}\n> 🔗 *Link:* ${video.url}`;
    await conn.sendMessage(m.chat, { image: thumbnailBuffer, caption: infoMessage }, { quoted: m });

    // Intentar descargar con ytdl-core
    let success = false;
    try {
      const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' });
      const writeStream = fs.createWriteStream(tmpPath);
      stream.pipe(writeStream);

      await new Promise((resolve, reject) => {
        writeStream.on('finish', resolve);
        stream.on('error', reject);
      });

      success = true;
    } catch (err) {
      console.warn('ytdl-core falló, intentando con yt-dlp...', err);
    }

    // Si ytdl-core falla, usar yt-dlp (opcionalmente con cookies)
    if (!success) {
      const cmd = `yt-dlp -x --audio-format mp3 -o "${tmpPath}" "${video.url}"`;
      await new Promise((resolve, reject) => {
        exec(cmd, (err, stdout, stderr) => err ? reject(err) : resolve(stdout));
      });
    }

    // Enviar audio
    const audioData = fs.readFileSync(tmpPath);
    await conn.sendMessage(m.chat, {
      audio: audioData,
      mimetype: 'audio/mpeg',
      fileName: `${titleSafe}.mp3`
    }, { quoted: m });

    fs.unlinkSync(tmpPath); // limpiar
    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    return conn.reply(m.chat, '⚠️ No se pudo obtener el audio del video.', m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];

export default handler;
