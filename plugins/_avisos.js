// plugins/reconocer-event.js
global.groupData = global.groupData || {}
global.db.data.chats = global.db.data.chats || {}

export async function groupUpdateHandler(conn, update) {
    const id = update.id || update.jid || update.groupJid
    if (!id) return

    const chat = global.db.data.chats[id]
    if (!chat?.reconocer) return // Solo grupos con modo reconocer activo

    try {
        const oldData = global.groupData[id] || { name: '', desc: '' }

        // Nombre cambiado
        if (update.subject && update.subject !== oldData.name) {
            await conn.sendMessage(id, { text: `🔧 *El nombre del grupo ha cambiado*\n🆕 Nuevo nombre: *${update.subject}*` })
            oldData.name = update.subject
        }

        // Descripción cambiada
        if (update.desc && update.desc !== oldData.desc) {
            await conn.sendMessage(id, { text: `📝 *La descripción del grupo ha cambiado*\n${update.desc || '_Sin descripción_'}` })
            oldData.desc = update.desc
        }

        global.groupData[id] = oldData

    } catch (err) {
        console.log('Error en groupUpdateHandler:', err)
    }
}
