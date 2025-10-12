/**
 * Anti-Link2 FelixCat-Bot - Borra IG, TikTok y YouTube con mención
 */

const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i

// -------------------------
// Antes de procesar cualquier mensaje
// -------------------------
let handlerBefore = async function (m, { conn, isBotAdmin }) {
  if (!m?.text) return true
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return true
  if (!isBotAdmin) return true

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat?.antiLink2) return true

  const who = m.sender
  const mentions = [who]

  if (blockedLinks.test(m.text)) {
    try {
      // Borra el mensaje
      await conn.sendMessage(m.chat, { delete: m.key })

      // Mensaje de aviso con mención
      await conn.sendMessage(m.chat, {
        text: `⚠️ @${who.split('@')[0]}, ese link de Instagram, TikTok o YouTube no está permitido.`,
        mentions
      })
    } catch (e) {
      console.error('Error en Anti-Link2:', e)
    }
  }

  return true
}
handlerBefore.before = true
export { handlerBefore as default }

// -------------------------
// Comando para activar/desactivar Anti-Link2
// -------------------------
let handlerCommand = async function (m, { conn, isAdmin }) {
  if (!m.isGroup) return
  if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.")

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  chat.antiLink2 = !chat.antiLink2

  await conn.sendMessage(m.chat, { 
    text: `✅ Anti-Link2 ahora está *${chat.antiLink2 ? "activado" : "desactivado"}*.`
  })
}
handlerCommand.command = ['antilink2']
export { handlerCommand }
