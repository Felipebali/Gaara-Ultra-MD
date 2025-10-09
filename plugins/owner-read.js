// FelixCat_Bot 🐾 — By Feli
// Comando: .readvo | .readviewonce | .read
// Función: Ver mensajes "ver una vez" (solo dueño, sin citar mensajes)

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, usedPrefix, isOwner }) => {
  if (!isOwner) return // No responde si no es owner

  const quoted = m.quoted
  if (!quoted) return conn.sendMessage(m.chat, { text: '🐾 ¡Miau! Responde al mensaje de tipo *"ver una vez"* para poder abrirlo.' })

  try {
    await m.react('⏳')
    await conn.sendPresenceUpdate('composing', m.chat)

    const viewOnce = quoted.viewOnce
      ? quoted
      : quoted.msg?.imageMessage ||
        quoted.msg?.videoMessage ||
        quoted.msg?.audioMessage

    const messageType = viewOnce.mimetype || quoted.mtype
    const stream = await downloadContentFromMessage(viewOnce, messageType.split('/')[0])

    if (!stream) return conn.sendMessage(m.chat, { text: '😿 No pude descargar el contenido, intenta de nuevo.' })

    let buffer = Buffer.from([])
    for await (const chunk of stream) {
      buffer = Buffer.concat([buffer, chunk])
    }

    if (messageType.includes('video')) {
      await conn.sendMessage(m.chat, { video: buffer, caption: viewOnce.caption || '', mimetype: 'video/mp4' })
    } else if (messageType.includes('image')) {
      await conn.sendMessage(m.chat, { image: buffer, caption: viewOnce.caption || '' })
    } else if (messageType.includes('audio')) {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: viewOnce.ptt || false })
    }

    await m.react('✅')
    await conn.sendMessage(m.chat, { text: '✨ El maullido mágico reveló el contenido oculto. 🐾' })

  } catch (e) {
    await m.react('❌')
    conn.sendMessage(m.chat, { text: `⚠️ Ocurrió un error, miau:\n> Usa *${usedPrefix}report* para avisarle a mi creador.\n\n${e.message}` })
  }
}

handler.help = ['readviewonce', 'read', 'readvo']
handler.tags = ['tools', 'felixcat']
handler.command = /^(readviewonce|read|readvo)$/i
handler.owner = true // Solo dueños
handler.register = true

export default handler
