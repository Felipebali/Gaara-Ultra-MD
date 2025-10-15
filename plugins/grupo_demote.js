// demote.js (.d)
let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    // Permitir admins o owners
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o dueños pueden usar este comando.');
    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para degradar.');

    const user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender);
    if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas degradar.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
        await conn.sendMessage(m.chat, { 
            text: `✅ @${user.split('@')[0]} qué triste dejaste de ser admin.`, 
            mentions: [user] 
        });
    } catch (e) {
        console.error(e);
        m.reply('❌ Error al intentar degradar al usuario.');
    }
};

handler.command = ['d'];
handler.group = true;
handler.admin = false; // Lo manejamos dentro del handler
handler.botAdmin = true;

export default handler;
