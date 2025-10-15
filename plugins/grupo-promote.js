// promote.js (.p)
let handler = async (m, { conn, isAdmin, isBotAdmin, isOwner }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    // Permitir admins o owners
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o dueños pueden usar este comando.');
    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para promover.');

    const user = (m.mentionedJid && m.mentionedJid[0]) || (m.quoted && m.quoted.sender);
    if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas promover.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        await conn.sendMessage(m.chat, { 
            text: `✅ @${user.split('@')[0]} bien por vos sos admin.`, 
            mentions: [user] 
        });
    } catch (e) {
        console.error(e);
        m.reply('❌ Error al intentar promover al usuario.');
    }
};

handler.command = ['p'];
handler.group = true;
handler.admin = false; // Lo manejamos dentro del handler
handler.botAdmin = true;

export default handler;
