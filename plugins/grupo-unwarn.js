// plugins/unwarn.js
let handler = async (m, { conn, isAdmin, isROwner }) => {
    if (!m.isGroup) return m.reply('❌ Solo en grupos.')
    if (!isAdmin && !isROwner) return m.reply('⚠️ Solo los administradores pueden quitar advertencias.')

    const target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0])
    if (!target) return m.reply('👤 Menciona o responde al mensaje del usuario para quitarle advertencias.')

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chat.warns) chat.warns = {}
    const warns = chat.warns

    if (!warns[target] || !warns[target].count) 
        return m.reply('✅ Ese usuario no tiene advertencias.')

    warns[target].count = Math.max(0, warns[target].count - 1)
    await global.db.write()

    let name = target.split('@')[0]
    try { name = await conn.getName(target) } catch {}

    // Mensaje de éxito SIN citar
    return conn.sendMessage(m.chat, { text: `🟢 ${name} ahora tiene ${warns[target].count}/3 advertencias.`, mentions: [target] })
}

handler.command = ['unwarn','quitarwarn','sacarwarn']
handler.group = true
handler.admin = true
export default handler
