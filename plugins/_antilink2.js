/**
 * Anti-Link2 FelixCat-Bot - Borra IG, TikTok y YouTube con mención
 */

const blockedLinks = /(instagram\.com|tiktok\.com|youtube\.com|youtu\.be)/i

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
  if (!m?.text) return
  if (m.isBaileys && m.fromMe) return
  if (!m.isGroup) return
  if (!isBotAdmin) return

  const chat = global.db?.data?.chats?.[m.chat]
  if (!chat?.antiLink2) return

  const who = m.sender
  const mentions = [who]

  const isBlockedLink = blockedLinks.test(m.text)
  if (!isBlockedLink) return

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

handler.command = ['antilink2']
handler.group = true

handler.antilink2Command = async (m, { conn, isAdmin }) => {
  if (!m.isGroup) return
  if (!isAdmin) return m.reply("❌ Solo admins pueden usar este comando.")

  if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
  const chat = global.db.data.chats[m.chat]
  chat.antiLink2 = !chat.antiLink2

  await conn.sendMessage(m.chat, { 
    text: `✅ Anti-Link2 ahora está *${chat.antiLink2 ? "activado" : "desactivado"}*.`
  })
}

export default handler
