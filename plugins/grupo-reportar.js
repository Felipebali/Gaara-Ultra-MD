let handler = async (m, { conn, args }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '❌ Este comando solo funciona en grupos.' });

    // Usuario reportado (respuesta o mención)
    let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0]);
    if (!target) {
        return conn.sendMessage(m.chat, { 
            text: `⚠️ Debes mencionar o responder a alguien para reportarlo.\n\nEjemplo:\n.report @usuario spam`
        });
    }

    // Motivo
    const reason = args.length ? args.join(' ') : 'Sin motivo';

    // Obtener admins
    let metadata = await conn.groupMetadata(m.chat).catch(_ => ({}));
    const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id);
    if (!admins.length) {
        return conn.sendMessage(m.chat, { text: `⚠️ No hay administradores en este grupo.` });
    }

    // Cita segura: si hay mensaje citado, lo usa; si no, no usa nada
    let quotedMsg = m.quoted ? m.quoted : null;

    await conn.sendMessage(m.chat, {
        text: `🚨 *Reporte* 🚨\n\n👤 Usuario: @${target.split('@')[0]}\n📝 Motivo: ${reason}\n\n🔧 Admins: ${admins.map(v => '@' + v.split('@')[0]).join(', ')}`,
        mentions: [target, ...admins]
    }, quotedMsg ? { quoted: quotedMsg } : {}); // ✅ Anticrash, siempre seguro
};

handler.command = ['report', 'reportar'];
handler.group = true;

export default handler;
