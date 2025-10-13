let handler = async (m, { conn }) => {
  let who = m.sender // quien manda el comando
  let targetJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  let senderName = '@' + who.split('@')[0]
  let targetName = targetJid ? '@' + targetJid.split('@')[0] : null

  // Mensaje principal
  let textMessage
  if (!targetJid || targetJid === who) {
    textMessage = `💋 ${senderName} se dio un beso a sí mismo 😳🔥`
  } else {
    textMessage = `💋 ${senderName} le dio un beso a ${targetName} 😘🔥`
  }

  // Lista de gifs de beso
  const gifs = [
    'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
    'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.gif',
    'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif'
  ]
  let gifUrl = gifs[Math.floor(Math.random() * gifs.length)]

  // Enviar un solo mensaje con gif y texto
  let mentions = targetJid ? [who, targetJid] : [who]
  await conn.sendMessage(
    m.chat, 
    { video: { url: gifUrl }, caption: textMessage, gifPlayback: true, mentions },
    { mentions }
  )
}

handler.command = ['kiss']
handler.help = ['kiss @usuario']
handler.tags = ['fun', 'nsfw']

export default handler
