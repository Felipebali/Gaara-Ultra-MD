let handler = async (m, { conn, participants, isAdmin, isOwner }) => {
    // Si no mencionó ni citó, nada que hacer
    if (!m.mentionedJid?.length && !m.quoted) return;

    // Obtener usuario a eliminar y normalizar
    let user = m.mentionedJid?.[0] ? m.mentionedJid[0] : m.quoted.sender;
    user = user?.replace?.('@c.us', '@s.whatsapp.net');

    // Normalizar JIDs importantes
    const groupInfo = await conn.groupMetadata(m.chat);
    const ownerGroup = (groupInfo.owner || '') .replace?.('@c.us', '@s.whatsapp.net') || m.chat.split`-`[0] + '@s.whatsapp.net';
    const ownerBot = (global.owner && global.owner[0] ? global.owner[0] : '') + '@s.whatsapp.net';
    const me = m.sender.replace('@c.us', '@s.whatsapp.net'); // tu JID actual (quien ejecuta el comando)
    const botJid = conn.user.jid;

    // Tu número protegido (ya me diste el +59898719147)
    const tuProtegido = '59898719147@s.whatsapp.net';

    // Lista de protegidos (bot, creador, dueño del grupo, vos)
    const protegidos = [botJid, ownerGroup, ownerBot, tuProtegido];

    // Normalizar participantes del grupo
    const groupMembers = participants.map(p => p.id.replace('@c.us', '@s.whatsapp.net'));

    // Si el objetivo no está en el grupo, salimos (silencioso)
    if (!groupMembers.includes(user)) return;

    // Solo admins/owners pueden usar el comando
    if (!(isAdmin || isOwner)) return;

    // Si el objetivo es protegido, respondemos con mensaje y NO eliminamos
    if (protegidos.includes(user)) {
        // Si intentan eliminarte a vos
        if (user === tuProtegido) {
            return conn.reply(m.chat, `😼 ¿Estás loco/loca? No te puedo eliminar.`, m);
        }
        // Si intentan eliminar al creador del bot
        if (user === ownerBot) {
            return conn.reply(m.chat, `🤖 ¿Cómo voy a eliminar a mi creador? Ni lo sueñes.`, m);
        }
        // Si intentan eliminar al dueño del grupo
        if (user === ownerGroup) {
            return conn.reply(m.chat, `👑 Ese es el dueño del grupo, imposible sacarlo.`, m);
        }
        // Si intentan eliminar al propio bot
        if (user === botJid) {
            return conn.reply(m.chat, `🙃 ¿Quieres que me elimine? No puedo hacerlo.`, m);
        }

        // Mensaje por defecto para cualquier otro protegido
        return conn.reply(m.chat, `❌ No puedo eliminar a ese usuario, está protegido.`, m);
    }

    // Si no es protegido, procedemos a expulsar (silencioso)
    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
        // Si querés, podés descomentar la siguiente línea para confirmar:
        // conn.reply(m.chat, `💥 Usuario eliminado.`, m);
    } catch (e) {
        console.error(e);
        // Opcional: enviar error solo si querés notificar
        // conn.reply(m.chat, `❌ No pude sacarlo… Seguramente no tengo permisos suficientes.`, m);
    }
};

handler.help = ['kick'];
handler.tags = ['grupo'];
handler.command = ['k','echar','sacar','ban'];
handler.group = true;
handler.botAdmin = true;
handler.register = true;

export default handler;
