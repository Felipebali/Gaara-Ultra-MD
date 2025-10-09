// 🐾 FelixCat_Bot — Comando "read" (ver mensajes ViewOnce)
// Hecho por Feli 😺

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    const quoted = m.quoted
    if (!quoted?.message) return m.reply('🐾 Responde a un mensaje *ViewOnce* (ver una vez) para mostrarlo.')

    // Detectar si contiene viewOnceMessage en cualquier versión
    const viewOnce = quoted.message?.viewOnceMessageV2 ||
                     quoted.message?.viewOnceMessageV2Extension ||
                     quoted.message?.viewOnceMessage

    if (!viewOnce) return m.reply('⚠️ Ese mensaje no es de tipo *ver una vez*.')

    // Buscar el contenido multimedia real
    const msg = viewOnce.message.imageMessage ||
                viewOnce.message.videoMessage ||
                viewOnce.message.audioMessage

    if (!msg) return m.reply('❌ No se encontró contenido multimedia en el mensaje.')

    const mime = msg.mimetype || ''
    const tipo = mime.split('/')[0]

    // Descargar contenido
    const stream = await downloadContentFromMessage(msg, tipo)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    // Enviar según el tipo detectado
    if (tipo === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: msg.caption || '' })
    } else if (tipo === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: msg.caption || '', mimetype: 'video/mp4' })
    } else if (tipo === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: false })
    } else {
      m.reply('⚠️ Tipo de archivo no soportado.')
    }

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al intentar mostrar el mensaje ViewOnce.')
  }
}

handler.help = ['read', 'ver']
handler.tags = ['tools']
handler.command = /^read|ver$/i
handler.owner = true // Solo dueños

export default handler
