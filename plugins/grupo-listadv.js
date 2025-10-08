// plugins/grupo-warnlist.js
const handler = async (m, { conn, groupMetadata, isAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo se puede usar en grupos.')
    if (!isAdmin) return m.reply('⚠️ Solo los administradores pueden usar este comando.')

    const chat = global.db.data.chats[m.chat] || (global.db.data.chats[m.chat] = {})
    if (!chat.warns) chat.warns = {}
    const warns = chat.warns

    const warnedUsers = Object.keys(warns).filter(jid => warns[jid]?.count > 0)
    if (!warnedUsers.length) return m.reply('📭 No hay usuarios con advertencias en este grupo.')

    let listaTexto = `📋 *Lista de Advertencias* 📋\n\n`
    const mentionedUsers = []

    for (let i = 0; i < warnedUsers.length; i++) {
        const jid = warnedUsers[i]
        const count = warns[jid].count || 0
        let name = jid.split('@')[0]
        try { name = await conn.getName(jid) } catch {}
        listaTexto += `${i+1}. ${name} (@${jid.split('@')[0]}) - ⚠️ ${count}/3\n`
        mentionedUsers.push(jid)
    }

    listaTexto += `\n📊 Total de usuarios advertidos: ${mentionedUsers.length}`

    try {
        await conn.sendMessage(m.chat, { text: listaTexto, mentions: mentionedUsers })
    } catch (e) {
        console.error(e)
        m.reply('❌ Error al mostrar la lista de advertencias.')
    }
}

handler.command = ['listadv','listaadvertencias','listwarns','advertencias']
handler.tags = ['grupo']
handler.group = true
handler.admin = true
export default handler
