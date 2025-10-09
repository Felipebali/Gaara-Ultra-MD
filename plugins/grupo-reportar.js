let handler = async (m, { conn, args }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

    // Usuario reportado (respuesta o mención)
    let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0]);
    if (!target) {
        return conn.sendMessage(m.chat, { 
            text: `⚠️ Debes mencionar o responder a alguien para reportarlo.\n\nEjemplo:\n.report @usuario spam`
        });
    }

    // Motivo del reporte
    const reason = args.length ? args.join(' ') : 'Sin motivo';

    // Obtener administradores
    let metadata = await conn.groupMetadata(m.chat).catch(_ => ({}));
    const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id);
    if (!admins.length) return conn.sendMessage(m.chat, { text: '⚠️ No hay administradores en este grupo.' });

    // Mensaje final SIN nombre extra del objetivo
    await conn.sendMessage(m.chat, {
        text: `🚨 *REPORTE* 🚨\n\n👤 Usuario: @${target.split('@')[0]}\n📝 Motivo: ${reason}\n\n👮 Admins: ${admins.map(a => '@' + a.split('@')[0]).join(', ')}`,
        mentions: [target, ...admins]
    }, {
        quoted: m.quoted || m // ✅ Cita mensaje si fue respuesta
    });
};

handler.command = ['report', 'reportar'];
handler.group = true;

export default handler;
