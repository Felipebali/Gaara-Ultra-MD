import { WAMessageStubType } from '@whiskeysockets/baileys'

export async function before(m, { conn }) {
  if (!m.isGroup) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return true

  // Tomar nombre visible o número limpio
  const usuarioJid = m.messageStubParameters?.[0] || m.key.participant
  const nombreUsuario = m.pushName || await conn.getName(usuarioJid) || usuarioJid.split('@')[0]

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    await conn.sendMessage(m.chat, { text: `👋 ¡${nombreUsuario} se ha unido al grupo!` })
  }

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    await conn.sendMessage(m.chat, { text: `💔 ${nombreUsuario} se ha ido del grupo.` })
  }

  return true
}
