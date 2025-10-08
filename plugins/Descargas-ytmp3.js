import yts from 'yt-search'
import ytdl from 'ytdl-core'
import { writeFileSync } from 'fs'

let handler = async (m, { conn, text, command, usedPrefix }) => {
  try {
    if (!text) return conn.reply(m.chat, `🎋 Ingresa el nombre de la canción o un enlace de YouTube.\n> Ejemplo: ${usedPrefix + command} DJ Malam Pagi`, m)

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key } })

    let video
    if (ytdl.validateURL(text)) {
      const info = await ytdl.getInfo(text)
      video = {
        url: text,
        title: info.videoDetails.title,
        author: info.videoDetails.author.name,
        thumbnail: info.videoDetails.thumbnails[info.videoDetails.thumbnails.length - 1].url,
        timestamp: new Date(parseInt(info.videoDetails.lengthSeconds)*1000).toISOString().substr(11, 8)
      }
    } else {
      const search = await yts(text)
      video = search.videos[0]
    }

    if (!video) return conn.reply(m.chat, '☁️ No se encontró ningún resultado.', m)

    const audioStream = ytdl(video.url, { filter: 'audioonly', quality: 'highestaudio' })
    const chunks = []
    for await (const chunk of audioStream) chunks.push(chunk)
    const audioBuffer = Buffer.concat(chunks)

    const thumbnailBuffer = await (await fetch(video.thumbnail)).buffer()

    await conn.sendMessage(m.chat, {
      audio: audioBuffer,
      fileName: `${video.title}.mp3`,
      mimetype: 'audio/mpeg',
      ptt: false,
      contextInfo: {
        externalAdReply: {
          title: video.title,
          body: `Canal: ${video.author} | Duración: ${video.timestamp}`,
          mediaType: 2,
          thumbnail: thumbnailBuffer,
          mediaUrl: video.url,
          sourceUrl: video.url
        }
      }
    }, { quoted: m })

    await conn.sendMessage(m.chat, { react: { text: '✔️', key: m.key } })

  } catch (e) {
    console.error(e)
    await conn.reply(m.chat, `❌ Error: ${e.message}`, m)
  }
}

handler.command = ['ytmp3','song']
handler.tags = ['descargas']
handler.help = ['ytmp3 <texto o link>', 'song <texto>']

export default handler
