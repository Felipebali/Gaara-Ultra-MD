// plugins/resetuser.js
export default async function handler(m, { conn, text }) {
    // Solo owner
    if (!global.owner.includes(m.sender)) return;

    // Tomamos el primer argumento como número o JID
    let target = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted?.sender;
    if (!target) return conn.sendMessage(m.chat, '❌ Especifica un usuario o responde a su mensaje', { quoted: m });

    // Inicializamos la base de datos
    if (!global.db) global.db = { data: { users: {} } };
    if (!global.db.data.users[target]) global.db.data.users[target] = {};

    // Reseteamos datos
    global.db.data.users[target].warn = 0;
    global.db.data.users[target].banned = false;
    // aquí podés agregar más campos a resetear

    await conn.sendMessage(m.chat, `✅ Usuario @${target.split('@')[0]} reseteado correctamente`, { quoted: m });
}

handler.command = ['resetuser'];
handler.owner = true;
