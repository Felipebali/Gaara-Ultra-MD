// plugins/_qc.js
import { generateWAMessageFromContent, prepareWAMessageMedia } from '@whiskeysockets/baileys'

let handler = async (m, { conn, quoted }) => {
  if (!quoted) return m.reply('❌ Debes citar un mensaje que contenga imagen o video.')

  try {
    // Preparar media del mensaje citado
    const media = await prepareWAMessageMedia(
      { image: quoted?.mediaType === 'image' ? await quoted.download() : null,
        video: quoted?.mediaType === 'video' ? await quoted.download() : null
      },
      { upload: conn.waUploadToServer }
    )

    // Crear sticker
    const stickerMessage = generateWAMessageFromContent(m.chat, {
      stickerMessage: media
    }, { quoted: m })

    await conn.relayMessage(m.chat, stickerMessage.message, { messageId: stickerMessage.key.id })
  } catch (e) {
    console.error(e)
    m.reply('❌ No se pudo crear el sticker. Asegúrate de citar una imagen o video.')
  }
}

handler.command = ['qc']
handler.tags = ['sticker']
handler.group = false

export default handler
