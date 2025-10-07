// plugins/avisos.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!(m.isGroupAdmin || m.fromMe)) return m.reply('❌ Solo el owner o admins pueden usar este comando.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  chat.avisos = !chat.avisos
  global.db.data.chats[m.chat] = chat

  const estado = chat.avisos ? '🟢 Activados' : '🔴 Desactivados'
  await conn.sendMessage(m.chat, { text: `📢 Avisos del grupo ${estado}.` }, { quoted: m })
}

handler.command = ['avisos']
handler.group = true
handler.admin = true
export { handler }

// ------------------ Antes de procesar mensajes ------------------
export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup) return true
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  if (!chat.avisos) return true // Si está desactivado, no hace nada

  try {
    // Cambios de nombre
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_SUBJECT) {
      const nuevoNombre = m.messageStubParameters?.[0] || 'N/A'
      await conn.sendMessage(m.chat, { text: `📛 El nombre del grupo cambió a: *${nuevoNombre}*` })
    }

    // Cambios de descripción
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_DESCRIPTION) {
      const nuevaDesc = m.messageStubParameters?.[0] || 'Sin descripción'
      await conn.sendMessage(m.chat, { text: `📝 La descripción del grupo se actualizó:\n${nuevaDesc}` })
    }

    // Cambios de foto
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_ICON) {
      await conn.sendMessage(m.chat, { text: `🖼️ La foto del grupo ha sido actualizada.` })
    }

  } catch (e) {
    console.error('Error en avisos de grupo:', e)
  }

  return true
}
