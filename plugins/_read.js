// 🐾 FelixCat_Bot — Comando .read (ver mensajes "una vez")
// Solo para el dueño, sin citar, sin respuestas automáticas

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

const handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return

  const q = m.quoted
  if (!q) {
    await conn.sendMessage(m.chat, { text: '🐾 ¡Miau! Responde a un mensaje *ver una vez* para revelarlo.' }, { quoted: m })
    return
  }

  try {
    await m.react('⏳')

    // Buscar el contenido del mensaje
    let msg =
      q.message?.viewOnceMessageV2Extension?.message ||
      q.message?.viewOnceMessageV2?.message ||
      q.message?.viewOnceMessage?.message ||
      q.message ||
      q.msg ||
      q

    const media =
      msg?.imageMessage ||
      msg?.videoMessage ||
      msg?.audioMessage ||
      msg?.documentMessage

    if (!media) {
      await m.react('❌')
      await conn.sendMessage(m.chat, { text: '😿 No encontré contenido multimedia en ese mensaje.' })
      return
    }

    // Descargar el contenido
    const type = media.mimetype ? media.mimetype.split('/')[0] : 'file'
    const stream = await downloadContentFromMessage(media, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // Enviar el contenido sin citar
    if (type === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' })
    } else if (type === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '', mimetype: 'video/mp4' })
    } else if (type === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: media.ptt || false })
    } else {
      await conn.sendMessage(m.chat, { document: buffer, fileName: 'archivo_desconocido', mimetype: media.mimetype })
    }

    await m.react('✅')
    await conn.sendMessage(m.chat, { text: '✨ El maullido reveló el secreto oculto. 🐾' })
  } catch (e) {
    await m.react('⚠️')
    await conn.sendMessage(m.chat, { text: `❌ Error al intentar abrir el mensaje:\n${e.message}` })
  }
}

handler.help = ['read']
handler.tags = ['owner']
handler.command = /^read$/i
handler.owner = true

export default handler
