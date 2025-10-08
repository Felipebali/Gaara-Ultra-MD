import fetch from 'node-fetch'
import yts from 'yt-search'
import axios from 'axios'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

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

    const audioBuffer = await (await fetch(downloadUrl)).buffer()
    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer()

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${video.title}.mp3`,
      mimetype: "audio/mpeg",
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `Canal: ${video.author?.name || "Desconocido"} | Duración: ${video.timestamp}`,
          mediaType: 2,
          thumbnail: thumbnailBuffer,
          mediaUrl: video.url,
          sourceUrl: video.url
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: "✔️", key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

handler.command = ['ytmp3','song']
handler.tags = ['descargas']
handler.help = ['ytmp3 <texto o link>', 'song <texto>']

export default handler

async function fetchFromApis(apis) {
  for (const api of apis) {
    try {
      const res = await fetch(api.endpoint)
      const json = await res.json()
      const url = api.extractor(json)
      if (url) return { url, servidor: api.api }
    } catch {}
  }
  return { url: null, servidor: "Ninguno" }
}
