// promote.js (.p)
let handler = async (m, { conn, isAdmin, isBotAdmin }) => {
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');
    if (!isAdmin) return m.reply('❌ Solo los administradores pueden usar este comando.');
    if (!isBotAdmin) return m.reply('❌ Necesito ser administrador para promover.');

    const user = m.mentionedJid?.[0] || m.quoted?.sender;
    if (!user) return m.reply('⚠️ Menciona o responde al usuario que deseas promover.');

    try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'promote');
        await m.reply(`✅ Usuario @${user.split('@')[0]} ahora es admin.`, m.chat, { mentions: [user] });
    } catch (e) {
        console.error(e);
        m.reply('❌ Error al intentar promover al usuario.');
    }
};

handler.command = ['p'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
