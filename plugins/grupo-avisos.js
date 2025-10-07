// plugins/avisos-grupo.js
import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn, groupMetadata }) {
  if (!m.isGroup) return true

  const chat = global.db.data.chats[m.chat] || {}
  if (!chat.avisos) return true // Si avisos desactivados, no hace nada

  try {
    // -------------------- CAMBIO DE NOMBRE --------------------
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_SUBJECT) {
      const newName = m.messageStubParameters?.[0] || 'N/A'
      await conn.sendMessage(m.chat, { text: `📛 El nombre del grupo cambió a: *${newName}*` })
    }

    // -------------------- CAMBIO DE DESCRIPCIÓN --------------------
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_DESCRIPTION) {
      const newDesc = m.messageStubParameters?.[0] || 'Sin descripción'
      await conn.sendMessage(m.chat, { text: `📝 La descripción del grupo se actualizó:\n\n${newDesc}` })
    }

    // -------------------- CAMBIO DE FOTO --------------------
    if (m.messageStubType === WAMessageStubType.GROUP_CHANGE_ICON) {
      await conn.sendMessage(m.chat, { text: `🖼️ La foto del grupo ha sido actualizada.` })
    }

  } catch (e) {
    console.error('Error en avisos de grupo:', e)
  }

  return true
}

// -------------------- COMANDO PARA ACTIVAR/DESACTIVAR --------------------
let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
  if (!m.isGroupAdmin && !m.fromMe) return m.reply('❌ Solo admins pueden cambiar el estado.')

  try {
    const chat = global.db.data.chats[m.chat] || {}
    chat.avisos = !chat.avisos
    global.db.data.chats[m.chat] = chat

    const estado = chat.avisos ? '🟢 Activados' : '🔴 Desactivados'
    await conn.sendMessage(m.chat, { text: `📢 Avisos del grupo ${estado}.` }, { quoted: m })

  } catch (e) {
    console.error(e)
    await m.reply('✖️ Ocurrió un error al cambiar el estado de los avisos.')
  }
}

handler.command = ['avisos']
handler.group = true
handler.admin = true
export { handler }
