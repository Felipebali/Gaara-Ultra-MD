// plugins/avisos-grupo.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup) return true

  // Cargar chat de DB y asegurar que tenga 'avisos'
  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  if (chat.avisos !== true) return true // Si avisos desactivados, no hace nada

  try {
    // Cambio de nombre
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_SUBJECT) {
      const newName = m.messageStubParameters?.[0] || 'N/A'
      await conn.sendMessage(m.chat, { text: `📛 El nombre del grupo cambió a: *${newName}*` })
    }

    // Cambio de descripción
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_DESCRIPTION) {
      const newDesc = m.messageStubParameters?.[0] || 'Sin descripción'
      await conn.sendMessage(m.chat, { text: `📝 La descripción del grupo se actualizó:\n\n${newDesc}` })
    }

    // Cambio de foto
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_ICON) {
      await conn.sendMessage(m.chat, { text: `🖼️ La foto del grupo ha sido actualizada.` })
    }

  } catch (e) {
    console.error('Error en avisos de grupo:', e)
  }

  return true
}

// Comando para activar/desactivar avisos
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.isGroupAdmin && !m.fromMe) return m.reply('❌ Solo admins pueden cambiar el estado.')

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  chat.avisos = !chat.avisos // alternar estado
  global.db.data.chats[m.chat] = chat

  const estado = chat.avisos ? '🟢 Activados' : '🔴 Desactivados'
  await conn.sendMessage(m.chat, { text: `📢 Avisos del grupo ${estado}.` }, { quoted: m })
}

handler.command = ['avisos']
handler.group = true
handler.admin = true
export { handler }
