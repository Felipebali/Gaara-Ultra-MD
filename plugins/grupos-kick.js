let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
    // Verifica si se mencionó o citó
    if (!m.mentionedJid?.length && !(m.quoted && m.quoted.sender)) return;

    // Obtener usuario a eliminar
    let user;
    if (m.mentionedJid?.length) {
        user = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        user = m.quoted.sender;
    } else {
        return; // nada que hacer
    }

    // Normalizar JID
    user = user.replace('@c.us', '@s.whatsapp.net');

    // Normalizar participantes
    const groupMembers = participants.map(p => p.id.replace('@c.us', '@s.whatsapp.net'));
    if (!groupMembers.includes(user)) return;

    // Normalizar datos importantes
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = (groupInfo.owner || '').replace('@c.us', '@s.whatsapp.net') || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = (global.owner && global.owner[0] ? global.owner[0] : '') + '@s.whatsapp.net';
    const me = '59898719147@s.whatsapp.net'; // tu número protegido
    const botJid = conn.user.jid.replace('@c.us', '@s.whatsapp.net');

    // Lista de protegidos
    const protegidos = [botJid, ownerGroup, ownerBot, me];

    // Solo admins/owners pueden usar
    if (!(isAdmin || isOwner)) return;

    // Comprobar si es protegido
    if (protegidos.includes(user)) {
        if (user === me) return conn.reply(m.chat, '😼 ¿Estás loco/loca? No te puedo eliminar.', m);
        if (user === ownerBot) return conn.reply(m.chat, '🤖 ¿Cómo voy a eliminar a mi creador? Ni lo sueñes.', m);
        if (user === ownerGroup) return conn.reply(m.chat, '👑 Ese es el dueño del grupo, imposible sacarlo.', m);
        if (user === botJid) return conn.reply(m.chat, '🙃 ¿Quieres que me elimine? No puedo hacerlo.', m);
        return conn.reply(m.chat, '❌ No puedo eliminar a ese usuario, está protegido.', m);
    }

    // Expulsión silenciosa del resto
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
