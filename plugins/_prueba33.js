import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    try {
        if (!m.quoted) return m.reply('⚠️ Responde a una imagen o video de *visualización única* (view once).')

        let msg = await m.getQuotedObj()
        let type = Object.keys(msg.message)[0]
        let media = msg.message[type]

        if (!media.viewOnce) return m.reply('❌ Ese mensaje no es de *view once*.')
        
        // Descargar contenido
        let stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])
        for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // Enviar media sin restricciones
        if (type.includes('image')) {
            await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' }, { quoted: m })
        } else if (type.includes('video')) {
            await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '' }, { quoted: m })
        } else {
            return m.reply('❌ Solo funciona con *fotos o videos view once*.')
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al procesar el contenido view once.')
    }
}

handler.command = ['viewonce', 'vo', 'ver']
handler.help = ['viewonce']
handler.tags = ['tools']

export default handler
