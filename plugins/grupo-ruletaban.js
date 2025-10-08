// plugins/ruletaban.js
let handler = async function (m, { conn }) {
    if (!m.isGroup) return await conn.sendMessage(m.chat, { text: "Este comando solo funciona en grupos." })

    try {
        const groupMetadata = await conn.groupMetadata(m.chat)

        // ID del bot y del usuario que ejecuta
        const botId = conn.user.id
        const userId = m.sender

        // Verificar admins correctamente
        const botParticipant = groupMetadata.participants.find(p => p.id === botId)
        const userParticipant = groupMetadata.participants.find(p => p.id === userId)

        const botIsAdmin = botParticipant?.admin === 'admin' || botParticipant?.admin === 'superadmin'
        const userIsAdmin = userParticipant?.admin === 'admin' || userParticipant?.admin === 'superadmin'

        if (!userIsAdmin) return await conn.sendMessage(m.chat, { text: "Solo administradores pueden usar este comando." })
        if (!botIsAdmin) return await conn.sendMessage(m.chat, { text: "No puedo expulsar usuarios porque no soy admin." })

        // Filtrar solo usuarios normales
        const participantes = groupMetadata.participants
            .filter(p => !p.admin) // usuarios normales
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

        console.log(`Usuario ${name} expulsado al azar por .ruletaban`)

    } catch (err) {
        console.error("Error en .ruletaban:", err)
        await conn.sendMessage(m.chat, { text: "Ocurrió un error al intentar expulsar al usuario." })
    }
}

handler.command = ['ruletaban']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler
