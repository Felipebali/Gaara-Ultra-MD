// plugins/grupo-warnlist.js
const handler = async (m, { conn, groupMetadata, isAdmin }) => {
  if (!m.isGroup) return m.reply('✦ Este comando solo se puede usar en grupos.')
  if (!isAdmin) return m.reply('✦ Solo los administradores pueden usar este comando.')

  const chatData = global.db.data.chats[m.chat] || {}
  const warns = chatData.warns || {}
  const warnedUsers = Object.keys(warns).filter(jid => warns[jid]?.count > 0)

  if (warnedUsers.length === 0) return m.reply('📋 *No hay usuarios con advertencias en este grupo.*')

  let listaTexto = `📋 *LISTA DE ADVERTENCIAS*\n\n🔰 *Grupo:* ${groupMetadata.subject || 'Desconocido'}\n\n`
  const mentionedUsers = []

  warnedUsers.forEach((jid, i) => {
    const warnData = warns[jid]
    const count = warnData.count || 0
    const lastDate = warnData.date || 'Sin fecha'
    const name = conn.getName ? conn.getName(jid) : jid.split('@')[0]

    listaTexto += `${i + 1}. ${name} (@${jid.split('@')[0]})\n`
    listaTexto += `   ⚠️ Advertencias: ${count}/5\n`
    listaTexto += `   📅 Última: ${lastDate}\n\n`

    mentionedUsers.push(jid)
  })

  listaTexto += `📊 Total de usuarios advertidos: ${mentionedUsers.length}`

  try {
    await conn.sendMessage(m.chat, { text: listaTexto, mentions: mentionedUsers }, { quoted: m })
  } catch (e) {
    console.error(e)
    m.reply('❌ Error al mostrar la lista de advertencias.')
  }
}

handler.command = ['listadv', 'listaadvertencias', 'listwarns', 'advertencias']
handler.tags = ['grupo']
handler.group = true
handler.admin = true

export default handler
