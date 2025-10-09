// 🐾 FelixCat_Bot - Comando "read" para ver mensajes ViewOnce
// Autor base: Hidekijs | Mod: Feli (https://github.com/Felipebali)

import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  try {
    const quoted = m.quoted
    if (!quoted?.message) return m.reply('🐾 Responde a un mensaje *ViewOnce* (ver una vez) para mostrar su contenido.')

    // Detectar si es un mensaje viewOnce
    const viewOnceMsg = quoted.message?.viewOnceMessageV2 ||
                        quoted.message?.viewOnceMessageV2Extension ||
                        quoted.message?.viewOnceMessage ||
                        null

    if (!viewOnceMsg) return m.reply('⚠️ Ese mensaje no es de tipo *ver una vez*.')

    // Detectar tipo (imagen / video / audio)
    const media = viewOnceMsg.message.imageMessage ||
                  viewOnceMsg.message.videoMessage ||
                  viewOnceMsg.message.audioMessage

    if (!media) return m.reply('❌ No se encontró contenido multimedia en el mensaje.')

    const type = media.mimetype.split('/')[0]
    const stream = await downloadContentFromMessage(media, type)
    let buffer = Buffer.from([])
    for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

    if (type === 'image') {
      await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' })
    } else if (type === 'video') {
      await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '', mimetype: 'video/mp4' })
    } else if (type === 'audio') {
      await conn.sendMessage(m.chat, { audio: buffer, mimetype: 'audio/ogg; codecs=opus', ptt: false })
    } else {
      m.reply('⚠️ Tipo de contenido no soportado.')
    }

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al intentar mostrar el mensaje ViewOnce.')
  }
}

// 🧩 Comandos
handler.command = /^(read|ver)$/i
handler.owner = true // Solo el dueño puede usarlo
handler.help = ['read', 'ver']
handler.tags = ['tools']

export default handler
