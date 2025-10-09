// 🐾 FelixCat_Bot — Ver mensajes de tipo "Ver una vez"
// Solo para dueño, sin citar mensajes.

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, isOwner }) => {
  if (!isOwner) return // Ignora si no es dueño

  const q = m.quoted
  if (!q) return conn.sendMessage(m.chat, { text: '🐾 ¡Miau! Responde a un mensaje de tipo *ver una vez* para abrirlo.' })

  try {
    await m.react('⏳')
    await conn.sendPresenceUpdate('composing', m.chat)

    // Detección flexible del contenido "view once"
    let msg = q.msg || q.message?.viewOnceMessageV2 || q.message?.viewOnceMessage || q
    let mediaMsg =
      msg.imageMessage ||
      msg.videoMessage ||
      msg.audioMessage ||
      msg.documentMessage

    if (!mediaMsg) {
      await m.react('❌')
      return conn.sendMessage(m.chat, { text: '😿 No encontré contenido multimedia en ese mensaje.' })
    }

    // Descargar contenido
    let type = mediaMsg.mimetype.split('/')[0]
    let stream = await downloadContentFromMessage(mediaMsg, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // Enviar sin citar mensaje
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
    await conn.sendMessage(m.chat, { text: '✨ El maullido mágico reveló el secreto. 🐾' })

  } catch (e) {
    await m.react('⚠️')
    conn.sendMessage(m.chat, { text: `❌ Error al intentar abrir el mensaje.\n> Usa *${usedPrefix}report* para informar.\n\n${e.message}` })
  }
}

handler.help = ['readvo']
handler.tags = ['tools', 'felixcat']
handler.command = /^(readvo|readviewonce|read)$/i
handler.owner = true // Solo para dueño

export default handler
