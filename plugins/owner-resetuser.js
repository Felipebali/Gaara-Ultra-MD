// plugins/resetuser.js
let handler = async (m, { conn, usedPrefix, text }) => {
    // Solo owner puede usarlo
    if (!global.owner.includes(m.sender)) return;

    // Verifica que se mencione a alguien
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.sendMessage(m.chat, `❌ Menciona al usuario que quieres resetear.\nEjemplo: ${usedPrefix}resetuser @usuario`, { quoted: m });
    }

    // Recorre todos los mencionados y resetea sus datos
    for (let jid of m.mentionedJid) {
        // Borrar advertencias
        if (global.db.data.users[jid]) {
            global.db.data.users[jid].warn = 0;
            global.db.data.users[jid].banned = false;
            // Si tienes más datos por usuario, reinicialos aquí
        }
    }

    await conn.sendMessage(m.chat, `✅ Usuario(s) reseteado(s) correctamente.`, { quoted: m });
};

handler.command = ['resetuser'];
handler.owner = true; // solo owner puede usar
export default handler;
