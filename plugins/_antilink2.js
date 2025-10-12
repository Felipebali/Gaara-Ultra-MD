// plugins/antilink2.js
const IG_REGEX = /(https?:\/\/)?(www\.)?instagram\.com\/[^\s]+/i
const TT_REGEX = /(https?:\/\/)?(www\.)?tiktok\.com\/[^\s]+/i
const YT_REGEX = /(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/[^\s]+/i

export async function before(m, { conn }) {
    if (!m.isGroup) return true
    if (!m.text) return true

    const chat = global.db.data.chats[m.chat] || {}
    if (!chat.antiLink2) chat.antiLink2 = true
    if (!chat.antiLink2) return true

    const who = m.sender
    const name = await conn.getName(who)  // ✅ Nombre real
    const mentions = [who]                 // ✅ Para que WhatsApp haga la mención real

    const isIG = IG_REGEX.test(m.text)
    const isTT = TT_REGEX.test(m.text)
    const isYT = YT_REGEX.test(m.text)

    if (isIG || isTT || isYT) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key })

            let msg = m.isAdmin
                ? `${name}, admin, nada de Instagram, TikTok ni YouTube aquí`
                : `${name}, nada de Instagram, TikTok ni YouTube aquí`

            await conn.sendMessage(m.chat, { text: msg, mentions })
        } catch(e){
            console.error("Error en antilink2:", e)
        }
        return true
    }

    return true
}
