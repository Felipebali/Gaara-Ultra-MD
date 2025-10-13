let handler = async (m, { conn, isAdmin, isOwner, command }) => {
    if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.');
    if (!isAdmin && !isOwner) return m.reply('⚠️ Solo *admins* pueden usar este comando.');

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    switch (command) {
        case 'antilink':
            chat.antiLink = !chat.antiLink;
            m.reply(`🔗 AntiLink WhatsApp ahora está *${chat.antiLink ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*`);
            break;

        case 'antilink2':
            chat.antiLink2 = !chat.antiLink2;
            m.reply(`🌍 AntiLink Global ahora está *${chat.antiLink2 ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*`);
            break;

        case 'antispam':
            chat.antiSpam = !chat.antiSpam;
            m.reply(`🛡️ AntiSpam ahora está *${chat.antiSpam ? '✅ ACTIVADO' : '❌ DESACTIVADO'}*`);
            break;
    }

    global.db.data.chats[m.chat] = chat;
};

handler.help = ['antilink','antilink2','antispam'];
handler.tags = ['config'];
handler.command = /^(antilink|antilink2|antispam)$/i;
handler.group = true;

export default handler;
