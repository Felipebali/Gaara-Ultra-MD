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
    const mention = `@${who.split("@")[0]}`  // ✅ La mención funciona correctamente

    const isIG = IG_REGEX.test(m.text)
    const isTT = TT_REGEX.test(m.text)
    const isYT = YT_REGEX.test(m.text)

    if (isIG || isTT || isYT) {
        try {
            // Borra el mensaje del link
            await conn.sendMessage(m.chat, { delete: m.key })

            // Frases random
            const userPhrases = [
                `⚠️ ${mention} no metas esas redes acá, ¿ok?`,
                `🚫 ${mention}, ese link quedó borrado porque molesta`,
                `🗑️ ${mention}, nada de Instagram, TikTok ni YouTube aquí`,
                `💥 ${mention} cuidado con tus links prohibidos`
            ]
            const adminPhrases = [
                `⚠️ ${mention} admin, también hay reglas, ese link fue borrado`,
                `🚫 ${mention} líder, no se permiten esas URLs`,
                `🗑️ ${mention} admin, mensaje eliminado por contenido prohibido`,
                `💥 ${mention} aún siendo admin, ese link no pasa`
            ]

            let msg
            if (m.isAdmin) msg = adminPhrases[Math.floor(Math.random()*adminPhrases.length)]
            else msg = userPhrases[Math.floor(Math.random()*userPhrases.length)]

            // Envía aviso con la mención
            await conn.sendMessage(m.chat, { text: msg })
        } catch(e){
            console.error("Error en antilink2:", e)
        }
        return true
    }

    return true
}
