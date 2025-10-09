import { youtube } from '@bochilteam/scraper'
import fetch from 'node-fetch'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // Buscar video en YouTube
    let result = await youtube(text, { type: 'video' })
    let video = result[0]
    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    // Tomar URL de audio 128kbps
    let audioUrl = video.audio['128kbps']
    if (!audioUrl) return conn.reply(m.chat, '❌ No se pudo obtener el audio.', m)

    // Descargar audio
    const audioBuffer = Buffer.from(await (await fetch(audioUrl)).arrayBuffer())

    // Descargar miniatura
    const thumbnailBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer())

    // Enviar audio con miniatura e info
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${video.title}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `Canal: ${video.author.name || "Desconocido"} | Duración: ${video.durationH}`,
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
