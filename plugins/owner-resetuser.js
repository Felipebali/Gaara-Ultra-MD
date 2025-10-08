// plugins/resetuser.js
export default async function handler(m, { conn, usedPrefix }) {
    // Solo owner puede usar
    if (!global.owner.includes(m.sender)) return;

    // Verifica que se mencionó al menos a un usuario
    const mentioned = m.mentionedJid;
    if (!mentioned || mentioned.length === 0) {
        return conn.sendMessage(m.chat,
            `❌ Menciona al usuario que quieres resetear.\nEjemplo: ${usedPrefix}resetuser @usuario`,
            { quoted: m }
        );
    }

    // Aseguramos que la base de datos existe
    if (!global.db) global.db = { data: { users: {} } };
    if (!global.db.data.users) global.db.data.users = {};

    // Recorremos todos los mencionados y reseteamos datos
    for (let jid of mentioned) {
        if (!global.db.data.users[jid]) global.db.data.users[jid] = {};
        global.db.data.users[jid].warn = 0;
        global.db.data.users[jid].banned = false;
        // Agrega aquí más campos que quieras resetear (puntos, juegos, etc.)
    }

    await conn.sendMessage(m.chat,
        `✅ Usuario(s) reseteado(s) correctamente.`,
        { quoted: m }
    );
}

handler.command = ['resetuser'];
handler.owner = true;
