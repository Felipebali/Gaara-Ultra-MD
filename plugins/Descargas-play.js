import yts from 'yt-search'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  // Desactivar sistema de economía para este comando
  if (global.db?.data?.users?.[m.sender]) {
    global.db.data.users[m.sender].dolares = global.db.data.users[m.sender].dolares || 0
    // No restar dólares
  }

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
    `.trim(), m)
  }

  try {
    const searchResults = await yts(text)
    if (!searchResults.videos.length) {
      return conn.reply(m.chat, '❌ No encontré esa canción 🎵\n\n🍙 ¡Por favor, verifica el nombre! 📖', m)
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

// Configuración especial para evitar cobros
handler.limit = false
handler.premium = false
handler.free = true  // Marcar como comando gratuito
handler.register = false

handler.help = ['play <canción>', 'song <canción>', 'musica <canción>', 'buscar <canción>']
handler.tags = ['downloader']
handler.command = ['play', 'song', 'musica', 'music', 'buscar']

export default handler