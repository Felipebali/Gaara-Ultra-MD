import { downloadContentFromMessage } from '@whiskeysockets/baileys'

let handler = async (m, { conn, isAdmin, isOwner }) => {

    // ✅ Solo Owner y Admins
    if (!isAdmin && !isOwner) 
        return m.reply('❌ Este comando es solo para *Admins* y *Owner*.')

    if (!m.quoted) return m.reply('📌 Responde a una *foto o video view once* para poder verlo.')

    try {
        let msg = await m.getQuotedObj()
        let type = Object.keys(msg.message)[0]
        let media = msg.message[type]

        // 🔒 Verificamos que sea ViewOnce
        if (!media.viewOnce) return m.reply('❌ Ese mensaje no es *view once*. Envía uno verdadero.')

        // 📥 Descargar contenido
        let stream = await downloadContentFromMessage(media, type.includes('image') ? 'image' : 'video')
        let buffer = Buffer.from([])

        for await (let chunk of stream) buffer = Buffer.concat([buffer, chunk])

        // 📤 Enviarlo sin limitación
        if (type.includes('image')) {
            await conn.sendMessage(m.chat, { 
                image: buffer, 
                caption: `🔓 View Once desbloqueado ✅` 
            }, { quoted: m })
        } else if (type.includes('video')) {
            await conn.sendMessage(m.chat, { 
                video: buffer, 
                caption: `🔓 View Once desbloqueado ✅` 
            }, { quoted: m })
        } else {
            return m.reply('⚠️ Solo funciona con *fotos o videos*.')
        }

    } catch (e) {
        console.error(e)
        m.reply('❌ Error al procesar el mensaje View Once.')
    }
}

handler.command = ['viewonce', 'vo', 'ver']
handler.help = ['ver']
handler.tags = ['tools']
export default handler
