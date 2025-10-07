// demote.js (.d)
let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');
    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para degradar.');

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas degradar.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'demote');
        await m.reply(`✅ Usuario @${user.split('@')[0]} degradado de administrador.`, m.chat, { mentions: [user] });
    } catch (e) {
        console.error(e);
        m.reply('❌ Error al intentar degradar al usuario.');
    }
};

handler.command = ['d'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
