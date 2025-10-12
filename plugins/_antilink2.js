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
    const name = await conn.getName(who)  // ✅ Obtenemos el nombre
    const mention = `@${who.split("@")[0]}` // La mención para que WhatsApp pinguee al usuario

    const isIG = IG_REGEX.test(m.text)
    const isTT = TT_REGEX.test(m.text)
    const isYT = YT_REGEX.test(m.text)

    if (isIG || isTT || isYT) {
        try {
            // Borra el mensaje
            await conn.sendMessage(m.chat, { delete: m.key })

            // Frases distintas según sea admin o no
            let msg = m.isAdmin
                ? `${mention} (${name}), admin, nada de Instagram, TikTok ni YouTube aquí`
                : `${mention} (${name}), nada de Instagram, TikTok ni YouTube aquí`

            // Envía aviso
            await conn.sendMessage(m.chat, { text: msg })
        } catch(e){
            console.error("Error en antilink2:", e)
        }
        return true
    }

    return true
}
