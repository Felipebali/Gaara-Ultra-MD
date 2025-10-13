import fs from 'fs'
import path from 'path'

let handler = async (m, { conn }) => {
  let sender = '@' + m.sender.split('@')[0]
  let mentionedJid = m.quoted ? m.quoted.sender : (m.mentionedJid && m.mentionedJid[0])

  // Mensaje principal
  let textMessage
  if (!mentionedJid || mentionedJid === m.sender) {
    textMessage = `💋 ${sender} se dio un beso a sí mismo 😳🔥`
  } else {
    let target = '@' + mentionedJid.split('@')[0]
    textMessage = `💋 ${sender} le dio un beso a ${target} 😘🔥`
  }

  // Enviar mensaje con mención
  let mentions = mentionedJid ? [m.sender, mentionedJid] : [m.sender]
  await conn.sendMessage(m.chat, { text: textMessage, mentions })

  // Elegir un gif de beso sexy/funny aleatorio
  const gifs = [
    'https://media.giphy.com/media/G3va31oEEnIkM/giphy.gif',
    'https://media.giphy.com/media/12VXIxKaIEarL2/giphy.gif',
    'https://media.giphy.com/media/3oz8xIsloV7zOmt81G/giphy.gif'
  ]
  let gifUrl = gifs[Math.floor(Math.random() * gifs.length)]

  // Enviar el gif
  await conn.sendMessage(m.chat, { video: { url: gifUrl }, caption: textMessage, gifPlayback: true }, { mentions })
}

handler.command = ['kiss']
handler.help = ['kiss @usuario']
handler.tags = ['fun', 'nsfw']

export default handler
