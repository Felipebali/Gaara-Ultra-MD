// plugins/playaudio_minimal.js
import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return conn.reply(m.chat, '⚠️ Ingresa un título o enlace de YouTube.', m);

  try {
    await m.react('🕓');

    // Buscar video
    const videos = await searchVideos(args.join(" "));
    if (!videos.length) throw new Error('✖️ No se encontraron resultados.');

    const video = videos[0];

    // Obtener thumbnail
    const thumbBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer());

    // Enviar info con miniatura
    const infoMessage = `🎬 *${video.title}*\n> 📺 *Canal:* ${video.channel}\n> ⏱ *Duración:* ${video.duration}\n> 👁 *Vistas:* ${video.views}\n> 🔗 *Link:* ${video.url}`;
    await conn.sendMessage(m.chat, { image: thumbBuffer, caption: infoMessage }, { quoted: m });

    // Descargar audio mediante API
    const apiUrl = `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${encodeURIComponent(video.url)}`;
    const res = await fetch(apiUrl);
    const json = await res.json();

    if (!json.status || !json.download) throw new Error('⚠️ No se pudo obtener el audio.');

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: { url: json.download },
      mimetype: 'audio/mpeg',
      fileName: `${json.title || video.title}.mp3`
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    return conn.reply(m.chat, `⚠️ Ocurrió un error o no se encontró el video.\nError: ${e.message}`, m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'playaudio'];
export default handler;

// Función para buscar video en YouTube
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
