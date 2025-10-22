import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  if (!text?.trim()) return conn.reply(m.chat, '⚠ Ingresa nombre o enlace del video.', m)

  try {
    const videoIdMatch = text.match(youtubeRegexID)
    const search = await yts(videoIdMatch ? 'https://youtu.be/' + videoIdMatch[1] : text)
    const video = videoIdMatch
      ? search.all.find(v => v.videoId === videoIdMatch[1]) || search.videos[0]
      : search.videos[0]

    if (!video) return conn.reply(m.chat, '⚠ No se encontraron resultados.', m)

    const { title, thumbnail, timestamp, views, ago, url, author } = video
    const canal = author?.name || 'Desconocido'

    const info = `🕸️ *Titulo:* ${title}
🌿 *Canal:* ${canal}
🍋 *Vistas:* ${views?.toLocaleString() || 'No disponible'}
🍃 *Duración:* ${timestamp || 'Desconocido'}
📆 *Publicado:* ${ago || 'Desconocido'}
🚀 *Enlace:* ${url}`

    await conn.sendMessage(m.chat, { image: { url: thumbnail }, caption: info }, { quoted: m })

    if (command === 'playaudio') {
      const res = await fetch(`https://api.vreden.my.id/api/v1/download/youtube/audio?url=${encodeURIComponent(url)}&quality=128`)
      const json = await res.json()
      if (!json.status || !json.result?.download?.url) throw '⚠ Enlace de audio inválido.'

      await conn.sendMessage(m.chat, {
        audio: { url: json.result.download.url },
        mimetype: 'audio/mpeg',
        fileName: `${title}.mp3`
      }, { quoted: m })
      await m.react('🎶')
    }

    if (command === 'playvideo') {
      const res = await fetch(`https://api.stellarwa.xyz/dow/ytmp4?url=${encodeURIComponent(url)}&apikey=Shadow_Core`)
      const json = await res.json()
      if (!json.status || !json.data?.dl) throw '⚠ Enlace de video inválido.'

      await conn.sendMessage(m.chat, {
        video: { url: json.data.dl },
        caption: `🎥 *${title}*\nDuración: ${timestamp || 'Desconocido'}`,
        mimetype: 'video/mp4',
        fileName: `${title}.mp4`
      }, { quoted: m })
      await m.react('🎥')
    }

  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `⚠ Error: ${err}`, m)
  }
}

handler.command = ['play', 'play2', 'playaudio', 'playvideo']
export default handler
