// Comando .ruletaban
export async function ruletabanCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })
    if (!isAdmin) return conn.sendMessage(m.chat, { text: "Solo administradores pueden usar este comando." })

    const group = await conn.groupMetadata(m.chat)
    const participantes = group.participants
        .filter(p => !p.admin) // solo usuarios normales
        .map(p => p.id)

    if (participantes.length === 0) {
        return conn.sendMessage(m.chat, { text: "No hay usuarios normales para expulsar." })
    }

    // Elegir un usuario al azar
    const randomIndex = Math.floor(Math.random() * participantes.length)
    const usuarioExpulsar = participantes[randomIndex]

    try {
        await conn.groupParticipantsUpdate(m.chat, [usuarioExpulsar], 'remove')

        const name = (await conn.getName(usuarioExpulsar)) || usuarioExpulsar.split('@')[0]

        await conn.sendMessage(m.chat, { 
            text: `🚨 ${name} fue expulsado al azar.`, 
            mentions: [usuarioExpulsar] 
        })

        console.log(`Usuario ${name} expulsado al azar`)
    } catch (e) {
        console.error("Error expulsando usuario al azar:", e)
        await conn.sendMessage(m.chat, { text: "Ocurrió un error al intentar expulsar al usuario." })
    }
} 
