import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // Buscar video en YouTube
    let search = await yts(text)
    let video = search.videos[0]
    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    const apis = [
      { api: 'ZenzzXD v2', endpoint: `https://api.zenzxz.my.id/downloader/ytmp3v2?url=${encodeURIComponent(video.url)}`, extractor: res => res.download_url },
      { api: 'Vreden', endpoint: `https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(video.url)}&quality=128`, extractor: res => res.result?.download?.url },
      { api: 'Xyro', endpoint: `https://xyro.site/download/youtubemp3?url=${encodeURIComponent(video.url)}`, extractor: res => res.result?.dl }
    ]

    const { url: downloadUrl, servidor } = await fetchFromApis(apis)
    if (!downloadUrl) return conn.reply(m.chat, '❌ Ninguna API devolvió el audio.', m)

    const size = await getSize(downloadUrl)
    const sizeStr = size ? formatSize(size) : 'Desconocido'

    const meta = {
      title: video.title,
      duration: video.timestamp,
      url: video.url,
      author: video.author?.name || "Desconocido",
      views: video.views?.toLocaleString('es-PE') || "0",
      ago: video.ago || "Desconocido",
      thumbnail: video.thumbnail,
      size: sizeStr,
      servidor
    }

    // Texto de info con estilo Felix-Cat
    const textoInfo = `🎶 *ＹＯＵＴＵＢＥ • ＭＰ3* ☁️
────────────────────
> 𝐓𝐈𝐓𝐔𝐋𝐎: *${meta.title}*
> 𝐃𝐔𝐑𝐀𝐂𝐈𝐎𝐍: *${meta.duration}*
> 𝐂𝐀𝐍𝐀𝐋: *${meta.author}*
> 𝐕𝐈𝐒𝐓𝐀𝐒: *${meta.views}*
> 𝐓𝐀𝐌𝐀𝐍̃𝐎: *${meta.size}*
> 𝐂𝐀𝐋𝐈𝐃𝐀𝐃: *128kbps*
> 𝐏𝐔𝐁𝐋𝐈𝐂𝐀
