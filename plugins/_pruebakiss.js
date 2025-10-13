let handler = async (m, { conn }) => {
  let sender = '@' + m.sender.split('@')[0]
  let mentionedJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  if (!mentionedJid) {
    await conn.sendMessage(m.chat, { text: `💋 ${sender} se dio un beso a sí mismo 😳`, mentions: [m.sender] })
  } else {
    let target = '@' + mentionedJid.split('@')[0]
    if (mentionedJid === m.sender) {
      await conn.sendMessage(m.chat, { text: `💋 ${sender} se dio un beso a sí mismo 😳`, mentions: [m.sender] })
    } else {
      await conn.sendMessage(m.chat, { text: `💋 ${sender} le dio un beso a ${target} 😘`, mentions: [m.sender, mentionedJid] })
    }
  }
}

handler.command = ['kiss']
handler.help = ['kiss @usuario']
handler.tags = ['fun']

export default handler
