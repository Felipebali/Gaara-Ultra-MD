import { downloadContentFromMessage, proto } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isAdmin, isOwner }) => {
    try {
        if (!m.quoted) return m.reply('⚠️ Responde a una foto o video de visualización única (ViewOnce).')

        let msg = await m.getQuotedObj()
        let type = Object.keys(msg.message)[0]
        let media

        if (msg.message.viewOnceMessage) {
            // Extraemos la media real del viewOnce
            media = msg.message.viewOnceMessage.message[type.replace('ViewOnceMessage', '')]
        } else {
            media = msg.message[type]
        }

        if (!media || !media.viewOnce) return m.reply('❌ Ese mensaje no es de ViewOnce.')

        // Determinamos si es imagen o video
        let mediaType = type.includes('image') ? 'image' : type.includes('video') ? 'video' : null
        if (!mediaType) return m.reply('❌ Solo funciona con fotos o videos ViewOnce.')

        // Descargamos el contenido
        const stream = await downloadContentFromMessage(media, mediaType)
        let buffer = Buffer.from([])
        for await (const chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // Enviamos media
        await conn.sendMessage(m.chat, mediaType === 'image'
            ? { image: buffer, caption: media.caption || '' }
            : { video: buffer, caption: media.caption || '' }, 
            { quoted: m })

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al procesar el contenido ViewOnce.')
    }
}

handler.command = ['viewonce', 'vo', 'ver']
handler.tags = ['tools']
handler.owner = true // solo owner y admin podés agregar un check adicional si querés
export default handler
