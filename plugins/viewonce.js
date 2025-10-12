// plugins/viewonce.js
import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isAdmin, isOwner }) => {
    try {
        if (!m.quoted) return m.reply('⚠️ Responde a un mensaje *ViewOnce* (foto o video) para usar este comando.')

        const msg = await m.getQuotedObj()
        const type = Object.keys(msg.message)[0]
        const media = msg.message[type]

        if (!media.viewOnce) return m.reply('❌ Ese mensaje no es de *ViewOnce*.')

        // Descargar contenido
        const stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // Enviar media sin restricciones
        if (type.includes('image')) {
            await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' }, { quoted: m })
        } else if (type.includes('video')) {
            await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '' }, { quoted: m })
        } else {
            return m.reply('❌ Solo funciona con fotos o videos ViewOnce.')
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al procesar el contenido ViewOnce.')
    }
}

handler.command = ['viewonce','vo','ver']
handler.tags = ['tools']

// Opcional: permitir solo admins o owners
handler.admin = true // true = solo admins pueden usarlo
handler.owner = true // true = solo owners pueden usarlo

export default handler
