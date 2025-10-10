let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
    // Verifica si se mencionó o respondió a alguien
    if (!m.mentionedJid?.length && !m.quoted) {
        return conn.reply(m.chat, `📌 *¿A quién quieres que elimine?*  
No has mencionado ni respondido a nadie... ☠️`);
    }

    // Obtener usuario a eliminar
    let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender;
    user = user.replace('@c.us', '@s.whatsapp.net');

    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = groupInfo.owner.replace('@c.us', '@s.whatsapp.net') || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = global.owner[0] + '@s.whatsapp.net';
    const me = m.sender.replace('@c.us', '@s.whatsapp.net'); // tu propio JID

    // Lista de protegidos
    const protegidos = [conn.user.jid, ownerGroup, ownerBot, me, '59892682421@s.whatsapp.net'];

    if (protegidos.includes(user)) return; // no puede eliminar a los protegidos

    // Verificar que el usuario está en el grupo
    const groupMembers = participants.map(p => p.id.replace('@c.us', '@s.whatsapp.net'));
    if (!groupMembers.includes(user)) return;

    // Solo admins o owners pueden usar el comando
    if (!(isAdmin || isOwner)) return;

    // Ejecuta la expulsión en silencio
    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
    } catch (e) {
        console.error(e);
    }
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['k','echar','sacar','ban'];
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
