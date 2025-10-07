// plugins/k1.js
let handler = async (m, { conn, groupMetadata }) => {
  try {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')

    // Verificación de owner segura (acepta +, espacios, etc.)
    const senderNumber = String(m.sender || '').replace(/[^0-9]/g, '')
    const owners = Array.isArray(global.owner) ? global.owner.filter(Boolean).map(o => String(o).replace(/[^0-9]/g, '')) : []
    const isOwner = owners.includes(senderNumber)
    if (!isOwner) return m.reply('❌ Solo el owner puede usar este comando.')

    const participants = groupMetadata?.participants || []

    // Comprobar que el bot sea admin en el grupo
    const botId = conn.user && (conn.user.id || conn.user.jid) ? String(conn.user.id || conn.user.jid).split(':')[0] : null
    const botJid = botId ? `${botId}@s.whatsapp.net` : (conn.user && conn.user.jid) ? conn.user.jid : null
    const botParticipante = participants.find(p => p.id === botJid)
    if (!botParticipante || !botParticipante.admin) {
      return m.reply('❌ No puedo ejecutar esto: debo ser *admin* del grupo para eliminar participantes.')
    }

    // Construir lista de a quiénes eliminar: todos excepto owner(s) y el bot
    const ownerJids = owners.map(o => `${o}@s.whatsapp.net`)
    const exclude = new Set([m.sender, botJid, ...ownerJids])

    const toRemove = participants
      .map(p => p.id)
      .filter(jid => jid && !exclude.has(jid))

    if (toRemove.length === 0) {
      // No avisar que se eliminaron, pero sí indicar si no hay nadie que remover
      return m.reply('⚠️ No hay miembros para eliminar (solo owner y/o bot presentes).')
    }

    // Ejecutar expulsiones silenciosas (no mensajes posteriores)
    for (let jid of toRemove) {
      try {
        // 'remove' requiere que el bot sea admin
        await conn.groupParticipantsUpdate(m.chat, [jid], 'remove')
        // pequeño delay para evitar bloqueos por rate limit
        await new Promise(res => setTimeout(res, 300))
      } catch (e) {
        // Si falla una expulsión la registramos en la consola, pero no avisamos en el chat
        console.error(`k1: no se pudo eliminar ${jid}`, e)
      }
    }

    // FIN: **NO** enviar mensaje de confirmación para mantenerlo silencioso
    return
  } catch (err) {
    console.error(err)
    // Si ocurre un error inesperado informarlo al owner que ejecutó el comando
    try { await m.reply('✖️ Ocurrió un error al ejecutar el comando. Revisa la consola del bot.') } catch(e){/* ignore */ }
  }
}

handler.command = ['k1']
handler.group = true
handler.rowner = true // opcional, según tu sistema
handler.owner = true // marcar como comando de owner

export default handler
