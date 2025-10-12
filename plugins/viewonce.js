// plugins/viewonce.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isOwner, isAdmin }) => {
    try {
        if (!isOwner && !isAdmin) return m.reply('❌ Solo owners o admins pueden usar esto.')
        if (!m.quoted) return m.reply('⚠️ Responde a una foto o video de visualización única (ViewOnce).')

        const msg = await m.getQuotedObj()
        if (!msg.message.viewOnceMessage) return m.reply('❌ Ese mensaje no es ViewOnce.')

        // Detecta el tipo de media
        const innerMsg = msg.message.viewOnceMessage.message
        const type = Object.keys(innerMsg)[0] // 'imageMessage' o 'videoMessage'
        const media = innerMsg[type]

        // Descarga el contenido
        const stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // Envía la media
        await conn.sendMessage(m.chat, type.includes('image')
            ? { image: buffer, caption: media.caption || '' }
            : { video: buffer, caption: media.caption || '' }, 
            { quoted: m })

    } catch (e) {
        console.error('Error viewonce:', e)
        m.reply('❌ Error al procesar el contenido ViewOnce.')
    }
}

handler.command = ['viewonce', 'vo', 'ver']
handler.tags = ['tools']
export default handler
