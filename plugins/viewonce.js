import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isOwner, isAdmin }) => {
    // Solo Owner y Admins
    if (!isOwner && !isAdmin) return m.reply('❌ Este comando es solo para *Admins y Owner*.')    

    // Debe responder a un mensaje ViewOnce
    if (!m.quoted) return m.reply('⚠️ Responde a una *foto o video de ver una vez*.')

    let quoted = await m.getQuotedObj()
    let type = Object.keys(quoted.message)[0]
    let media = quoted.message[type]

    if (!media?.viewOnce) return m.reply('❌ Ese mensaje *no es ver una vez*. Ahora responde a uno correcto.')

    try {
        // Descargar contenido
        let stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])
        for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // Enviar según tipo de archivo
        if (type.includes('image')) {
            await conn.sendMessage(m.chat, { image: buffer, caption: media.caption || '' }, { quoted: m })
        } else if (type.includes('video')) {
            await conn.sendMessage(m.chat, { video: buffer, caption: media.caption || '' }, { quoted: m })
        } else {
            return m.reply('❌ Solo funciona con *fotos o videos de ver una vez*.')
        }
    } catch (err) {
        console.error(err)
        m.reply('❌ Error al intentar recuperar el mensaje de ver una vez.')
    }
}

// Configuración del comando
handler.command = ['viewonce', 'ver', 'vo']
handler.help = ['ver']
handler.tags = ['tools']
handler.group = true // Solo en grupos
export default handler
