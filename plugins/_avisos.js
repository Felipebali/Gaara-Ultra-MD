// plugins/reconocer.js
global.db.data.chats = global.db.data.chats || {}
global.groupData = global.groupData || {}

let handler = async (m, { conn, isAdmin, isGroup }) => {
    if (!isGroup) return
    if (!isAdmin) return conn.sendMessage(m.chat, { text: '❌ Solo *admins* pueden usar este comando.' })

    let chat = global.db.data.chats[m.chat]
    chat.reconocer = !chat.reconocer

    await conn.sendMessage(m.chat, {
        text: chat.reconocer
            ? '✅ El modo *reconocer* está ACTIVADO\nAvisaré cuando cambien *el nombre o la descripción* del grupo.'
            : '❌ El modo *reconocer* está DESACTIVADO\nNo enviaré más avisos del grupo.'
    })
}

handler.command = /^reconocer$/i

// --- DETECCIÓN DE CAMBIOS ---
handler.before = async function (m, { conn, isGroup }) {
    if (!isGroup) return
    let chat = global.db.data.chats[m.chat]
    if (!chat?.reconocer) return

    try {
        const metadata = await conn.groupMetadata(m.chat)

        // Inicializar datos si no existen
        if (!global.groupData[m.chat]) {
            global.groupData[m.chat] = {
                name: metadata.subject,
                desc: metadata.desc || ''
            }
        }

        // Detectar cambio de nombre
        if (metadata.subject !== global.groupData[m.chat].name) {
            await conn.sendMessage(m.chat, {
                text: `📢 Se cambió el *nombre del grupo*\n🔤 Nuevo nombre: *${metadata.subject}*`
            })
            global.groupData[m.chat].name = metadata.subject
        }

        // Detectar cambio de descripción
        if ((metadata.desc || '') !== global.groupData[m.chat].desc) {
            await conn.sendMessage(m.chat, {
                text: `📝 Se actualizó la *descripción del grupo*\n${metadata.desc || '_(sin descripción)_'}`
            })
            global.groupData[m.chat].desc = metadata.desc || ''
        }
    } catch { }
}

export default handler
