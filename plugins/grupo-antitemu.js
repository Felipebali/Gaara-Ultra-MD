// plugins/antitemu.js
import fs from 'fs';

const temuShareRegex = /https?:\/\/(?:share\.temu\.com\/|temu\.com\/s\/)[a-zA-Z0-9]{10,}/i;

let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return m.reply('Solo administradores pueden activar/desactivar Antitemu.');

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];
    chat.antitemu = !chat.antitemu;

    await global.db.write();
    m.reply(`✅ Antitemu ahora está ${chat.antitemu ? '🟢 activado' : '🔴 desactivado'} en este grupo.`);
};

// Configuración para que el bot reconozca el comando
handler.command = ['antitemu'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

// === Before ===: verifica los mensajes y elimina links ===
handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return true;
    if (!m.text) return true;
    if (!global.db.data.chats[m.chat]?.antitemu) return true;
    if (!isBotAdmin) return true; // el bot debe ser admin para expulsar

    const name = m.pushName || m.sender.split('@')[0];
    const isTemuLink = temuShareRegex.test(m.text);

    if (!isTemuLink) return true;

    try {
        if (isAdmin) {
            await conn.sendMessage(m.chat, { delete: m.key });
            await conn.sendMessage(m.chat, { text: `⚠️ El admin *${name}* envió un link de Temu. Solo se eliminó el mensaje.` });
            console.log(`Mensaje de admin ${name} eliminado por Anti-Temu`);
            return true;
        }

        await conn.sendMessage(m.chat, { delete: m.key });
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        await conn.sendMessage(m.chat, { text: `🚫 El usuario *${name}* fue expulsado por enviar un link de Temu.` });
        console.log(`Usuario ${name} expulsado por enviar link de Temu`);

    } catch (err) {
        console.error('Error eliminando mensaje/usuario:', err);
    }

    return true;
};

export default handler;
