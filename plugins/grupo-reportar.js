// plugins/report.js
let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m)

  // usuario reportado (mención o respuesta)
  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
  if (!target) return conn.reply(m.chat, '⚠️ Debes *responder al mensaje* o *mencionar al usuario* que quieres reportar.\n\nEjemplo:\n.responder + .report Insultos\n.report @usuario Spam', m)

  // motivo
  const reason = args.length ? args.join(' ') : 'Sin motivo especificado'

  // obtener info del grupo y admins
  let metadata = {}
  try { metadata = await conn.groupMetadata(m.chat) } catch (e) { metadata = { participants: [] } }
  const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id)

  if (admins.length === 0) return conn.reply(m.chat, '⚠️ No se encontraron administradores en este grupo.', m)

  const reporter = m.sender
  const targetName = await conn.getName(target).catch(() => target.split('@')[0])
  const reporterName = await conn.getName(reporter).catch(() => reporter.split('@')[0])

  const text = `🚨 *REPORTE EN EL GRUPO*\n\n👤 *Reportado:* @${target.split('@')[0]} (${targetName})\n🙋‍♂️ *Reportado por:* @${reporter.split('@')[0]} (${reporterName})\n📝 *Motivo:* ${reason}\n\n⚠️ *Atención administradores:* por favor revisen este caso.`

  const mentions = [target, reporter, ...admins]
  await conn.sendMessage(m.chat, { text, mentions }, { quoted: m })
}

handler.help = ['report', 'reportar']
handler.tags = ['group']
handler.command = ['report', 'reportar']
handler.group = true
handler.register = true

export default handler
