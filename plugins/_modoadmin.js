const ownerNumbers = ['59896026646','59898719147'];

let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);

    // Revisar si es admin
    let isAdmin = false;
    if (m.isGroup) {
        const chat = await conn.groupMetadata(m.chat);
        const participant = chat.participants.find(p => p.id === m.sender);
        isAdmin = participant?.admin != null;
    }

    if (!isAdmin && !isOwner) return conn.reply(m.chat, '❌ Solo administradores o dueños pueden usar este comando.', m);

    if (!global.db.data.settings) global.db.data.settings = {};
    global.db.data.settings.modoadmin = !global.db.data.settings.modoadmin;

    let msg = global.db.data.settings.modoadmin
        ? '🛡️ *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        : '⚠️ *MODO ADMIN DESACTIVADO*\nTodos los miembros pueden usar comandos nuevamente.';

    await conn.sendMessage(m.chat, { text: msg }, { quoted: m });
};

// ---------- BLOQUEO GLOBAL ----------
conn.ev.on('messages.upsert', async ({ messages }) => {
    const m = messages[0];
    if (!m.message || !m.key.remoteJid.endsWith('@g.us')) return; // solo grupos
    if (!global.db.data.settings?.modoadmin) return;

    const sender = m.key.participant || m.key.remoteJid;
    const cleanSender = sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(cleanSender);

    // Revisar si es admin
    const chat = await conn.groupMetadata(m.key.remoteJid);
    const participant = chat.participants.find(p => p.id === sender);
    const isAdmin = participant?.admin != null;

    const text = m.message.conversation || m.message.extendedTextMessage?.text;
    if (!text) return;
    if (text.startsWith('.modoadmin')) return; // excepción

    if (!isOwner && !isAdmin && text.startsWith('.')) {
        await conn.sendMessage(m.key.remoteJid, {
            text: '🚫 *MODO ADMIN ACTIVADO*\nSolo administradores y dueños pueden usar comandos ahora.'
        }, { quoted: m });
    }
});

handler.help = ['modoadmin'];
handler.tags = ['group'];
handler.command = ['modoadmin'];
handler.group = true;
handler.register = true;

export default handler;
