import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  const ctxErr = (global.rcanalx || {})
  const ctxWarn = (global.rcanalw || {})
  const ctxOk = (global.rcanalr || {})

  if (!text) {
    return conn.reply(m.chat, `
🍙📚 Itsuki Nakano - Buscador de Música 🎵✨

🌟 ¡Como tutora musical, puedo ayudarte a encontrar canciones!

📝 Forma de uso:
${usedPrefix + command} <nombre de la canción>

💡 Ejemplos:
• ${usedPrefix + command} unravel Tokyo ghoul
• ${usedPrefix + command} spy x family ending
• ${usedPrefix + command} LiSA crossing field

🍱 ¡Encuentra tu música favorita! 🎶📖
    `.trim(), m, ctxWarn)
  }

  try {
    const searchResults = await yts(text)
    if (!searchResults.videos.length) {
      return conn.reply(m.chat, '❌ No encontré esa canción 🎵\n\n🍙 ¡Por favor, verifica el nombre! 📖', m, ctxErr)
    }

    const video = searchResults.videos[0]

    const songInfo = `🎵📚 Itsuki Nakano - Música Encontrada 🍙✨

🎼 Título: ${video.title}
⏱️ Duración: ${video.timestamp}
👤 Artista/Canal: ${video.author.name}
📊 Vistas: ${video.views.toLocaleString()}
📅 Publicado: ${video.ago}
🔗 URL: ${video.url}

✅ ¡Búsqueda exitosa!
🍱 ¡Aquí tienes la información de tu canción! 🎶📖`

    // Enviar solo la imagen con caption simple
    await conn.sendMessage(m.chat, {
      image: { url: video.thumbnail },
      caption: songInfo
    })

  } catch (error) {
    console.error('Error en play:', error)
    await conn.reply(m.chat, 
      `❌ Error en la búsqueda\n\n` +
      `🍙 ¡Lo siento! No pude buscar esta canción.\n\n` +
      `🔧 Error: ${error.message}\n\n` +
      `📖 ¡Intenta con otro nombre o más tarde! 🍱✨`,
      m
    )
  }
}

handler.help = ['play <canción>', 'song <canción>', 'musica <canción>', 'buscar <canción>']
handler.tags = ['downloader']
handler.command = ['play', 'song', 'musica', 'music', 'buscar']
handler.limit = true
handler.premium = false

export default handler