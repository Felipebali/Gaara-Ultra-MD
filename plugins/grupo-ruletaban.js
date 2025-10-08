// Comando .ruletaban
export async function ruletabanCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return await conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return await conn.sendMessage(m.chat, { text: "Solo administradores pueden usar este comando." })

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)

        // Verificar que el bot sea admin
        const botId = conn.user.id
        const botIsAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin
        if (!botIsAdmin) return await conn.sendMessage(m.chat, { text: "No puedo expulsar usuarios porque no soy admin." })

        // Filtrar solo usuarios normales
        const participantes = groupMetadata.participants
            .filter(p => !p.admin)
            .map(p => p.id)

        if (participantes.length === 0) {
            return await conn.sendMessage(m.chat, { text: "No hay usuarios normales para expulsar." })
        }

        // Elegir usuario al azar
        const randomIndex = Math.floor(Math.random() * participantes.length)
        const usuarioExpulsar = participantes[randomIndex]

        // Expulsar al usuario
        await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], 'remove')

        // Obtener nombre del usuario
        const name = groupMetadata.participants.find(p => p.id === usuarioExpulsar)?.pushName || usuarioExpulsar.split('@')[0]

        // Avisar en el grupo con mención
        await conn.sendMessage(m.chat, {
            text: `🚨 ${name} fue expulsado al azar.`,
            mentions: [usuarioExpulsar]
        })

        console.log(`Usuario ${name} expulsado al azar`)

    } catch (err) {
        console.error("Error en .ruletaban:", err)
        await conn.sendMessage(m.chat, { text: "Ocurrió un error al intentar expulsar al usuario." })
    }
}
