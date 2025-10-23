// plugins/play.js
import yts from 'yt-search';
import ytdl from 'ytdl-core';
import fs from 'fs';

let handler = async (m, { conn, text }) => {
  try {
    if (!text) return conn.reply(m.chat, '🎶 Ingresa el nombre de la canción que querés buscar.', m);

    // Buscar el video en YouTube
    const results = await yts(text);
    if (!results.videos || !results.videos.length)
      return conn.reply(m.chat, '❌ No encontré resultados para esa búsqueda.', m);

    const video = results.videos[0]; // primer resultado
    const title = video.title;
    const url = video.url;
    const duration = video.timestamp;

    await conn.reply(m.chat, `🎧 *Descargando...*\n\n🎵 *Título:* ${title}\n🕒 *Duración:* ${duration}\n🔗 *Enlace:* ${url}`, m);

    // Descargar el audio
    const stream = ytdl(url, {
      filter: 'audioonly',
      quality: 'highestaudio',
    });

    const filePath = `./tmp/${title.replace(/[^\w\s]/gi, '')}.mp3`;
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on('finish', async () => {
      await conn.sendMessage(m.chat, { 
        audio: fs.readFileSync(filePath), 
        mimetype: 'audio/mpeg', 
        fileName: `${title}.mp3` 
      }, { quoted: m });

      fs.unlinkSync(filePath); // borrar después de enviar
    });

    writeStream.on('error', err => {
      console.error(err);
      conn.reply(m.chat, '⚠️ Ocurrió un error al procesar el audio.', m);
    });

  } catch (e) {
    console.error(e);
    conn.reply(m.chat, '🚫 Error al intentar descargar el audio.', m);
  }
};

handler.help = ['play <texto>'];
handler.tags = ['descargas'];
handler.command = /^play$/i;
export default handler;
