// 🐾 FelixCat_Bot — Comando .read
// Abre mensajes "ver una vez" (solo owner, sin citar, estilo maullido)

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isOwner }) => {
  if (!isOwner) return // Solo el dueño puede usarlo

  const q = m.quoted
  if (!q) {
    await conn.sendMessage(m.chat, { text: '🐾 ¡Miau! Responde a un mensaje de tipo *ver una vez* para revelarlo.' })
    return
  }

  try {
    await m.react('⏳')

    // Detectar la estructura correcta del mensaje (todas las versiones de Baileys)
    let msg =
      q.message?.viewOnceMessageV2Extension?.message ||
      q.message?.viewOnceMessageV2?.message ||
      q.message?.viewOnceMessage?.message ||
      q.message ||
      q.msg ||
      q

    let mediaMsg =
      msg.imageMessage ||
      msg.videoMessage ||
      msg.audioMessage ||
      msg.documentMessage

    if (!mediaMsg) {
      await m.react('❌')
      return conn.sendMessage(m.chat, { text: '😿 No encontré contenido multimedia en ese mensaje.' })
    }

    // Descargar el contenido del mensaje
    const type = mediaMsg.mimetype ? mediaMsg.mimetype.split('/')[0] : 'file'
    const stream = await downloadContentFromMessage(mediaMsg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // Enviar sin citar el mensaje original
    if (type === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: mediaMsg.caption || '' })
    } else if (type === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: mediaMsg.caption || '', mimetype: 'video/mp4' })
    } else if (type === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: mediaMsg.ptt || false })
    } else {
      await conn.sendMessage(m.chat, { document: buffer, mimetype: mediaMsg.mimetype, fileName: 'archivo_desconocido' })
    }

    await m.react('✅')
    await conn.sendMessage(m.chat, { text: '✨ El maullido reveló el secreto oculto. 🐾' })
  } catch (e) {
    await m.react('⚠️')
    await conn.sendMessage(m.chat, {
      text: `❌ Error al intentar abrir el mensaje:\n${e.message}`,
    })
  }
}

handler.help = ['read']
handler.tags = ['owner']
handler.command = /^read$/i
handler.owner = true

export default handler
