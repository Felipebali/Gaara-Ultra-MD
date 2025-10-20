// plugins/playaudio_yt-dlp.js
import { exec } from 'child_process';
import fs from 'fs';
import fetch from 'node-fetch';
import path from 'path';
import yts from 'yt-search';

const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);
  
  await m.react('🕓');

  try {
    // Buscar video en YouTube
    const videos = await yts(args.join(" "));
    if (!videos.videos.length) throw new Error('✖️ No se encontraron resultados.');
    
    const video = videos.videos[0];
    const titleSafe = video.title.replace(/[^a-zA-Z0-9 ]/g, "_").substring(0, 100);
    const tmpPath = path.resolve(`./tmp/${titleSafe}.mp3`);
    
    // Descargar audio con yt-dlp
    await new Promise((resolve, reject) => {
      const cmd = `yt-dlp -x --audio-format mp3 -o "${tmpPath}" "${video.url}"`;
      exec(cmd, (err, stdout, stderr) => {
        if (err) return reject(err);
        resolve(stdout);
      });
    });

    // Obtener miniatura
    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer();

    // Enviar info + audio
    const infoMessage = `🎬 *${video.title}*\n> 📺 *Canal:* ${video.author.name}\n> ⏱ *Duración:* ${video.duration.timestamp || 'No disponible'}\n> 👁 *Vistas:* ${video.views?.toLocaleString() || 'No disponible'}\n> 🔗 *Link:* ${video.url}`;
    await conn.sendMessage(m.chat, { image: thumbnailBuffer, caption: infoMessage }, { quoted: m });

    const audioData = fs.readFileSync(tmpPath);
    await conn.sendMessage(m.chat, {
      audio: audioData,
      mimetype: 'audio/mpeg',
      fileName: `${titleSafe}.mp3`
    }, { quoted: m });

    fs.unlinkSync(tmpPath); // Eliminar archivo temporal
    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    return conn.reply(m.chat, '⚠️ No se pudo obtener el audio.', m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];

export default handler;
