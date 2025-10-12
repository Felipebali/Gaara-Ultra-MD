// plugins/antilink2.js
const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i

export async function before(m, { conn, isBotAdmin }) {
  if (!m?.text) return true
  if (m.isBaileys && m.fromMe) return true
  if (!m.isGroup) return true
  if (!isBotAdmin) return true

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat?.antiLink2) return true

  const who = m.sender
  const mentions = [who]

  if (!blockedLinks.test(m.text)) return true

  try {
    await conn.sendMessage(m.chat, { delete: m.key })
    await conn.sendMessage(m.chat, {
      text: `⚠️ @${who.split('@')[0]}, ese link de Instagram, TikTok o YouTube no está permitido.`,
      mentions
    })
  } catch (e) {
    console.error('Error en Anti-Link2:', e)
  }

  return true
}

// Comando .antilink2
export const handler = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.")

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]

  chat.antiLink2 = !chat.antiLink2

  await conn.sendMessage(m.chat, { 
    text: `✅ Anti-Link2 ahora está *${chat.antiLink2 ? "activado" : "desactivado"}*.`
  })
}

handler.command = ['antilink2']
handler.group = true
handler.admin = true
export default handler
