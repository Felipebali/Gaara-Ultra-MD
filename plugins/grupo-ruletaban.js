// Comando .ruletaban
export async function ruletabanCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return await conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return await conn.sendMessage(m.chat, { text: "Solo administradores pueden usar este comando." })

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)
        const participantes = groupMetadata.participants
            .filter(p => !p.admin) // solo usuarios normales
            .map(p => p.id)

        if (participantes.length === 0) {
            return await conn.sendMessage(m.chat, { text: "No hay usuarios normales para expulsar." })
        }

        // Elegir un usuario al azar
        const randomIndex = Math.floor(Math.random() * participantes.length)
        const usuarioExpulsar = participantes[randomIndex]

        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], 'remove')

        // Obtener nombre del usuario (pushName o fallback)
        const name = groupMetadata.participants.find(p => p.id === usuarioExpulsar)?.name || usuarioExpulsar.split('@')[0]

        await conn.sendMessage(m.chat, {
            text: `🚨 ${name} fue expulsado al azar.`,
            mentions: [usuarioExpulsar]
        })

        console.log(`Usuario ${name} expulsado al azar por .ruletaban`)

    } catch (err) {
        console.error("Error en .ruletaban:", err)
        await conn.sendMessage(m.chat, { text: "Ocurrió un error al intentar expulsar al usuario." })
    }
}
