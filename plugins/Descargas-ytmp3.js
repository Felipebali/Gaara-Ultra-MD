import yts from 'yt-search'
import ytdl from 'ytdl-core'
import { Readable } from 'stream'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    // Buscar video en YouTube
    let search = await yts(text)
    let video = search.videos[0]
    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    // Descargar audio con ytdl-core (solo audio)
    const stream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })
    const chunks = []
    for await (const chunk of stream) chunks.push(chunk)
    const audioBuffer = Buffer.concat(chunks)

    // Descargar miniatura
    const thumbnailBuffer = Buffer.from(await (await fetch(video.thumbnail)).arrayBuffer())

    // Enviar audio
    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${video.title}.mp3`,
      mimetype: 'audio/mpeg',
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
