// plugins/report.js
let handler = async (m, { conn, text }) => {
    if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

    if (!text) return conn.reply(m.chat, '❌ Debes escribir el motivo del reporte.\nEjemplo: *.report Spam en el grupo*', m);

    // Obtener admins del grupo
    let groupMetadata = await conn.groupMetadata(m.chat);
    let admins = groupMetadata.participants.filter(p => p.admin).map(p => p.id);

    if (admins.length === 0) return conn.reply(m.chat, '❌ No se encontraron administradores en el grupo.', m);

    // Crear mensaje de reporte
    let reportMessage = `
📢 *Reporte de miembro* 📢
• Usuario: @${m.sender.split('@')[0]}
• Motivo: ${text}
• Grupo: ${groupMetadata.subject}
    `.trim();

    // Enviar reporte a los admins mencionándolos
    await conn.sendMessage(m.chat, { 
        text: reportMessage, 
        mentions: admins.concat(m.sender) 
    }, { quoted: m });

    // Confirmación al usuario
    conn.reply(m.chat, '✅ Tu reporte ha sido enviado a los administradores del grupo.', m);
};

handler.help = ['report <motivo>'];
handler.tags = ['group'];
handler.command = ['report', 'reporte', 'reportar'];
handler.group = true; // solo grupos
handler.register = true; // usuarios registrados

export default handler;
