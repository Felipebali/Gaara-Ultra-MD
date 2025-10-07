/**
 * Welcome minimalista para FelixCat-Bot
 * Solo texto con el nombre del usuario y grupo
 */

export async function welcome(m, { conn, groupMetadata }) {
  if (!m.isGroup) return
  const participant = m.sender
  const name = m.pushName || participant.split('@')[0]
  const groupName = groupMetadata?.subject || 'este grupo'

  const mensaje = `👋 ¡Bienvenido/a *${name}* al grupo *${groupName}*!`

  await conn.sendMessage(m.chat, { text: mensaje }, { quoted: m })
}

export default { welcome }
