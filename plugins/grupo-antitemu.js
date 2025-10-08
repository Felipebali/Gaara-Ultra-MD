// plugins/antitemu.js
import fs from 'fs'

const temuShareRegex = /https?:\/\/(?:share\.temu\.com\/|temu\.com\/s\/)[a-zA-Z0-9]{10,}/i

let handler = async function(m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    if (!isAdmin) return m.reply('❌ Solo administradores pueden activar/desactivar Antitemu.')

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    let chat = global.db.data.chats[m.chat]
    chat.antitemu = !chat.antitemu

    await global.db.write()
    m.reply(`✅ Antitemu ahora está ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'} en este grupo.`)
}

// Antes de cada mensaje
handler.all = async function(m, { conn, isBotAdmin }) {
    if (!m.isGroup) return true
    if (!m.text) return true
    let chat = global.db.data.chats[m.chat]
    if (!chat?.antitemu) return true
    if (!isBotAdmin) return true

    const name = m.pushName || m.sender.split('@')[0]
    const isTemuLink = temuShareRegex.test(m.text)

    if (!isTemuLink) return true

    try {
        await conn.sendMessage(m.chat, { delete: m.key })
        await conn.sendMessage(m.chat, { text: `⚠️ Se eliminó un link de Temu enviado por *${name}*.` })
        console.log(`Mensaje de ${name} eliminado por Anti-Temu`)
    } catch (err) {
        console.error('Error borrando mensaje:', err)
    }

    return true
}

handler.command = ['antitemu']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
