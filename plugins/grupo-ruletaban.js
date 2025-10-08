// plugins/ruletaban.js
let handler = async function (m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "Solo administradores pueden usar este comando." })

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)

        // Verificar que el bot sea admin
        const botId = conn.user.id
        const botIsAdmin = groupMetadata.participants.find(p => p.id === botId)?.admin
        if (!botIsAdmin) return conn.sendMessage(m.chat, { text: "No puedo expulsar usuarios porque no soy admin." })

        // Filtrar solo usuarios normales
        const participantes = groupMetadata.participants
            .filter(p => !p.admin)
            .map(p => p.id)

        if (participantes.length === 0) {
            return conn.sendMessage(m.chat, { text: "No hay usuarios normales para expulsar." })
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

handler.command = ['ruletaban'] // Comando que activa esto
handler.group = true // Solo funciona en grupos
handler.botAdmin = true // El bot debe ser admin
handler.admin = true // Solo admins pueden usarlo
handler.fail = null

export default handler
