import ytdl from "ytdl-core"
import yts from "yt-search"
import fs from "fs"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text?.trim())
      return conn.reply(m.chat, `⚽ *Por favor, ingresa el nombre o enlace del video.*`, m)

    // Buscar el video
    let videoIdMatch = text.match(youtubeRegexID)
    let search = await yts(videoIdMatch ? 'https://youtu.be/' + videoIdMatch[1] : text)
    let video = videoIdMatch
      ? search.all.find(v => v.videoId === videoIdMatch[1]) || search.videos.find(v => v.videoId === videoIdMatch[1])
      : search.videos?.[0]

    if (!video) return conn.reply(m.chat, '✧ No se encontraron resultados para tu búsqueda.', m)

    const { title, thumbnail, timestamp, views, ago, url, author } = video
    const vistas = formatViews(views)
    const canal = author?.name || 'Desconocido'

    const infoMessage = `
🕸️ *Título:* *${title}*
🌿 *Canal:* ${canal}
🍋 *Vistas:* ${vistas}
🍃 *Duración:* ${timestamp || 'Desconocido'}
📆 *Publicado:* ${ago || 'Desconocido'}
🚀 *Enlace:* ${url}`.trim()

    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: infoMessage,
      contextInfo: {
        externalAdReply: {
          title,
          body: canal,
          thumbnailUrl: thumbnail,
          sourceUrl: url,
          mediaType: 1,
          renderLargerThumbnail: false
        }
      }
    }, { quoted: m })

    // 🔊 Audio (.play)
    if (command === 'play') {
      try {
        const info = await ytdl.getInfo(url)
        const format = ytdl.chooseFormat(info.formats, { quality: 'highestaudio' })

        const stream = ytdl(url, { filter: 'audioonly', quality: 'highestaudio' })
        const filePath = `/tmp/${title.replace(/[^\w\s]/gi, '')}.mp3`

        const writeStream = fs.createWriteStream(filePath)
        stream.pipe(writeStream)

        writeStream.on('finish', async () => {
          await conn.sendMessage(m.chat, {
            audio: fs.readFileSync(filePath),
            mimetype: 'audio/mpeg',
            fileName: `${title}.mp3`,
            contextInfo: {
              externalAdReply: {
                title,
                body: canal,
                thumbnailUrl: thumbnail,
                sourceUrl: url,
                mediaType: 1
              }
            }
          }, { quoted: m })
          fs.unlinkSync(filePath)
          await m.react('🎶')
        })

      } catch (err) {
        console.error(err)
        conn.reply(m.chat, '⚠ Error descargando el audio. Puede ser muy largo o pesado.', m)
      }
    }

    // 🎥 Video (.play2)
    else if (command === 'play2') {
      try {
        const info = await ytdl.getInfo(url)
        const format = ytdl.chooseFormat(info.formats, { quality: '18' }) // 360p MP4

        const stream = ytdl.downloadFromInfo(info, { format })
        const filePath = `/tmp/${title.replace(/[^\w\s]/gi, '')}.mp4`

        const writeStream = fs.createWriteStream(filePath)
        stream.pipe(writeStream)

        writeStream.on('finish', async () => {
          await conn.sendMessage(m.chat, {
            video: fs.readFileSync(filePath),
            caption: `🎬 *${title}*\n📆 *Duración:* ${timestamp || 'Desconocido'}`,
            mimetype: 'video/mp4',
            fileName: `${title}.mp4`
          }, { quoted: m })
          fs.unlinkSync(filePath)
          await m.react('🎥')
        })

      } catch (err) {
        console.error(err)
        conn.reply(m.chat, '⚠ Error descargando el video. Puede ser muy largo o pesado.', m)
      }
    }

  } catch (err) {
    console.error(err)
    conn.reply(m.chat, `⚠ Error inesperado:\n${err}`, m)
  }
}

handler.command = ['play', 'play2']
handler.help = ['play', 'play2']
handler.tags = ['descargas']
export default handler

// 🧮 Formato de vistas (por estética)
function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1e9) return `${(views / 1e9).toFixed(1)}B (${views.toLocaleString()})`
  if (views >= 1e6) return `${(views / 1e6).toFixed(1)}M (${views.toLocaleString()})`
  if (views >= 1e3) return `${(views / 1e3).toFixed(1)}K (${views.toLocaleString()})`
  return views.toString()
}
