let handler = async (m, { conn, text }) => {
  // Usuario que manda el comando
  let sender = '@' + m.sender.split('@')[0]

  // Obtener a quién se le da el beso
  let mentionedJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  if (!mentionedJid) {
    // Si no mencionó a nadie, se da un beso a sí mismo
    await conn.sendMessage(m.chat, `💋 ${sender} se dio un beso a sí mismo 😳`, { mentions: [m.sender] })
  } else {
    let target = '@' + mentionedJid.split('@')[0]
    if (mentionedJid === m.sender) {
      // Si se menciona a sí mismo
      await conn.sendMessage(m.chat, `💋 ${sender} se dio un beso a sí mismo 😳`, { mentions: [m.sender] })
    } else {
      // Si se menciona a otro usuario
      await conn.sendMessage(m.chat, `💋 ${sender} le dio un beso a ${target} 😘`, { mentions: [m.sender, mentionedJid] })
    }
  }
}

handler.command = ['kiss']  // Comando
handler.help = ['kiss @usuario'] // Ayuda
handler.tags = ['fun'] // Categoría

export default handler 
