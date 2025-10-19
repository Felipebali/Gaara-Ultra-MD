const ownerNumbers = ['59896026646','59898719147'];

export async function modoadminHandler(conn) {
    conn.ev.on('messages.upsert', async ({ messages }) => {
        const m = messages[0];
        if (!m.message || !m.key.remoteJid.endsWith('@g.us')) return; // solo grupos
        if (!global.db.data.settings?.modoadmin) return;

        const sender = m.key.participant || m.key.remoteJid;
        const cleanSender = sender.replace(/[^0-9]/g, '');
        const isOwner = ownerNumbers.includes(cleanSender);

        // Verificar admin
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
}
