// plugins/play.js
import yts from 'yt-search';
import fetch from 'node-fetch';

const handler = async (m, { conn, args, usedPrefix }) => {
  if (!args[0]) return conn.reply(m.chat, '⚠ Ingresa un título o enlace de YouTube.', m);

  await m.react('🕓');

  try {
    // Buscar video
    const videos = await searchVideos(args.join(" "));
    if (!videos.length) throw new Error('No se encontraron resultados.');

    const video = videos[0];
    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer();

    // Mensaje minimalista
    const messageText = 
      `🎬 *${video.title}*\n` +
      `> 📺 Canal: ${video.channel}\n` +
      `> ⏱ Duración: ${video.duration}\n` +
      `> 👁 Vistas: ${video.views}\n` +
      `> 🔗 ${video.url}`;

    await conn.sendMessage(m.chat, {
      image: thumbnailBuffer,
      caption: messageText,
      footer: 'FelixCat-Bot',
      contextInfo: { mentionedJid: [m.sender] },
      buttons: [
        { buttonId: `${usedPrefix}ytmp3 ${video.url}`, buttonText: { displayText: '🎧 Audio' }, type: 1 },
        { buttonId: `${usedPrefix}ytmp4 ${video.url}`, buttonText: { displayText: '📹 Video' }, type: 1 }
      ],
      headerType: 1
    }, { quoted: m });

    await m.react('✅');

  } catch (e) {
    console.error(e);
    await m.react('✖️');
    return conn.reply(m.chat, '⚠ No se encontró el video.', m);
  }
};

handler.help = ['play'];
handler.tags = ['descargas'];
handler.command = ['play', 'play2'];
export default handler;

// Función de búsqueda
async function searchVideos(query) {
  try {
    const res = await yts(query);
    return res.videos.slice(0, 10).map(v => ({
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
