import fetch from 'node-fetch'
import yts from 'yt-search'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // Buscar video en YouTube
    let search = await yts(text)
    let video = search.videos[0]
    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    // Descargar audio desde API gratuita
    const apiUrl = `https://api.vihangayt.me/ytmp3?url=${encodeURIComponent(video.url)}`
    const res = await fetch(apiUrl)
    const json = await res.json()

    if (!json || !json.url) return conn.reply(m.chat, '❌ No se pudo obtener el audio.', m)

    const audioBuffer = await (await fetch(json.url)).arrayBuffer()
    const thumbnailBuffer = await (await fetch(video.thumbnail)).arrayBuffer()

    await conn.sendMessage(m.chat, {
      audio: Buffer.from(audioBuffer),
      fileName: `${video.title}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `Canal: ${video.author?.name || "Desconocido"} | Duración: ${video.timestamp}`,
          mediaType: 2,
          thumbnail: Buffer.from(thumbnailBuffer),
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
