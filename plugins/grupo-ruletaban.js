// plugins/ruletaban.js
let handler = async function (m, { conn }) {
    if (!m.isGroup) return await conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)

        // Filtrar solo usuarios normales
        const participantes = groupMetadata.participants
            .filter(p => !p.admin) // solo usuarios normales
            .map(p => p.id)

        if (participantes.length === 0) {
            return await conn.sendMessage(m.chat, { text: "No hay usuarios normales para expulsar." })
        }

        // Elegir usuario al azar
        const randomIndex = Math.floor(Math.random() * participantes.length)
        const usuarioExpulsar = participantes[randomIndex]

        // Intentar expulsar al usuario
        try {
            await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], 'remove')

            // Obtener nombre del usuario
            const name = groupMetadata.participants.find(p => p.id === usuarioExpulsar)?.pushName || usuarioExpulsar.split('@')[0]

            // Avisar en el grupo con mención
            await conn.sendMessage(m.chat, {
                text: `🚨 ${name} fue expulsado al azar.`,
                mentions: [usuarioExpulsar]
            })

            console.log(`Usuario ${name} expulsado al azar por .ruletaban`)
        } catch {
            // Si no puede expulsar (bot no admin)
            return await conn.sendMessage(m.chat, { text: "No puedo expulsar usuarios porque no soy admin." })
        }

    } catch (err) {
        console.error("Error en .ruletaban:", err)
        await conn.sendMessage(m.chat, { text: "Ocurrió un error al intentar expulsar al usuario." })
    }
}

handler.command = ['ruletaban']
handler.group = true
handler.botAdmin = true
handler.admin = false // no hace falta que el bot verifique si el usuario es admin
handler.fail = null

export default handler
