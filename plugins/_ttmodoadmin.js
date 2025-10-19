const ownerNumbers = ['59896026646','59898719147'];

let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);

    // Verifica admin
    let isAdmin = false;
    if (m.isGroup) {
        const chat = await conn.groupMetadata(m.chat);
        const participant = chat.participants.find(p => p.id === m.sender);
        isAdmin = participant?.admin != null;
    }

    if (!isAdmin && !isOwner) return conn.reply(m.chat, '❌ Solo administradores o dueños pueden usar este comando.', m);

    if (!global.db.data.settings) global.db.data.settings = {};
    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    const msg = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

handler.help = ['modoadmin'];
handler.tags = ['group'];
handler.command = ['modoadmin'];
handler.group = true;
handler.register = true;

export default handler;
