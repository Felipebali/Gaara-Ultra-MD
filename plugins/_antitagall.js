// plugins/antitagall.js
import fs from 'fs';

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return;

    // Cargar estado
    let data = {};
    try { data = JSON.parse(fs.readFileSync('./antitagall.json')) } 
    catch (e) { data = {} }

    if (!data[m.chat]) return; // antitagall desactivado

    // Revisar si el mensaje menciona a todos los participantes
    const groupMetadata = await conn.groupMetadata(m.chat);
    const participantes = groupMetadata.participants.map(u => u.id);

    // m.mentionedJid es la lista de usuarios mencionados en el mensaje
    if (m.mentionedJid && participantes.every(p => m.mentionedJid.includes(p))) {
        // No importa si es admin, borra el mensaje
        await conn.sendMessage(m.chat, { text: `❌ No se permite enviar un tagall copiado del bot.` }, { quoted: m });
        await conn.deleteMessage(m.chat, { id: m.key.id, remoteJid: m.chat });
    }
};

handler.all = true;
export default handler;
