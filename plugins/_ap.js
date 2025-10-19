// plugins/aprobar-todos.js
const ownerNumbers = ['59896026646','59898719147'];

let handler = async (m, { conn }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    const sender = m.sender.replace(/[^0-9]/g, '');
    const isOwner = ownerNumbers.includes(sender);

    // Verificar si es admin
    let isAdmin = false;
    if (m.isGroup) {
        const chat = await conn.groupMetadata(m.chat);
        const participant = chat.participants.find(p => p.id === m.sender);
        isAdmin = participant?.admin != null;
    }

    if (!isAdmin && !isOwner)
        return conn.reply(m.chat, '❌ Solo administradores o dueños pueden usar este comando.', m);

    // Obtener participantes pendientes
    const chat = await conn.groupMetadata(m.chat);
    const pending = chat.participants.filter(p => p.pending); // Usuarios esperando aprobación

    if (!pending || pending.length === 0) {
        return conn.reply(m.chat, '⚠️ No hay solicitudes pendientes para aprobar.', m);
    }

    // Aprobar todas las solicitudes automáticamente
    for (let p of pending) {
        try {
            await conn.groupParticipantsUpdate(m.chat, [p.id], 'approve');
        } catch (err) {
            console.log(`Error aprobando a ${p.id}:`, err);
        }
    }

    await conn.sendMessage(m.chat, { text: `✅ Se aprobaron ${pending.length} solicitudes automáticamente.` }, { quoted: m });
};

handler.help = ['ap'];
handler.tags = ['group'];
handler.command = ['ap'];
handler.group = true;
handler.register = true;

export default handler;
