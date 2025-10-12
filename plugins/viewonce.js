// plugins/viewonce.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isOwner, isAdmin }) => {
    try {
        if (!isOwner && !isAdmin) return m.reply('❌ Solo owner o admins pueden usar esto.')
        if (!m.quoted) return m.reply('⚠️ Responde a una foto o video de *ViewOnce*.')

        const quotedMsg = m.quoted?.message?.viewOnceMessage
        if (!quotedMsg) return m.reply('❌ Ese mensaje no es ViewOnce.')

        const innerMsg = quotedMsg.message
        const type = Object.keys(innerMsg)[0] // imageMessage o videoMessage
        const media = innerMsg[type]

        const stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

        await conn.sendMessage(m.chat,
            type.includes('image')
                ? { image: buffer, caption: media.caption || '' }
                : { video: buffer, caption: media.caption || '' },
            { quoted: m }
        )

    } catch (e) {
        console.error('Error viewonce:', e)
        m.reply('❌ Error al procesar el contenido ViewOnce.')
    }
}

handler.command = ['viewonce', 'vo', 'ver']
handler.tags = ['tools']

export default handler
