// plugins/checkln.js
function normalizeJid(jid) {
  if (!jid) return null
  return jid.replace(/@c\.us$/, '@s.whatsapp.net').replace(/@s\.whatsapp\.net$/, '@s.whatsapp.net')
}

let handler = async (m, { conn }) => {
  const db = global.db.data.users || {}
  const groups = Object.entries(await conn.groupFetchAllParticipating())
  let totalKicked = 0

  for (const [jid, group] of groups) {
    for (const participant of group.participants) {
      const user = normalizeJid(participant.id)
      if (db[user]?.banned) {
        const reason = db[user].banReason || 'No especificado'
        try {
          await conn.sendMessage(jid, {
            text: `🚫 @${user.split('@')[0]} está en la lista negra y será eliminado automáticamente.\n📝 Motivo: ${reason}`,
            mentions: [user]
          })
          await new Promise(r => setTimeout(r, 500))
          await conn.groupParticipantsUpdate(jid, [user], 'remove')
          console.log(`[CHECK-LN] Expulsado ${user} de ${group.subject}`)
          totalKicked++
        } catch (e) {
          console.log(`⚠️ No se pudo expulsar a ${user} de ${group.subject}: ${e.message}`)
        }
      }
    }
  }

  await conn.sendMessage(m.chat, { text: `✅ Comprobación finalizada. Usuarios expulsados: ${totalKicked}` })
}

handler.help = ['checkln']
handler.tags = ['owner']
handler.command = ['checkln']
handler.rowner = true

export default handler
