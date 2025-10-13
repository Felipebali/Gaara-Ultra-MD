let handler = async (m, { conn, isAdmin, isOwner, command }) => {
    if (!m.isGroup) return m.reply('⚠️ Este comando solo funciona en grupos.');
    if (!isAdmin && !isOwner) return m.reply('⚠️ Solo *admins* pueden usar este comando.');

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    switch (command.toLowerCase()) {
        case 'antilink':
            chat.antiLink = !chat.antiLink;
            m.reply(chat.antiLink 
                ? '🔗 ¡Cuidado con los links! AntiLink activado ✅ Ahora los enlaces no pasarán desapercibidos 😎' 
                : '🔗 AntiLink desactivado ❌ ¡Los links ya pueden colarse sin problemas! 😅'
            );
            break;

        case 'antilink2':
            chat.antiLink2 = !chat.antiLink2;
            m.reply(chat.antiLink2 
                ? '🌍 ¡Protección global activada! AntiLink Global ✅ Nadie puede escapar de los enlaces 🚫' 
                : '🌍 AntiLink Global desactivado ❌ Los enlaces vuelven a ser libres... cuidado 😏'
            );
            break;

        case 'antispam':
            chat.antiSpam = !chat.antiSpam;
            m.reply(chat.antiSpam 
                ? '🛡️ AntiSpam activado ✅ ¡Que no te molesten los mensajes repetidos! 😎' 
                : '🛡️ AntiSpam desactivado ❌ Prepárate para recibir spam a placer 😅'
            );
            break;
    }

    global.db.data.chats[m.chat] = chat;
};

handler.help = ['antilink','antilink2','antispam'];
handler.tags = ['config'];
handler.command = /^(antilink|antilink2|antispam)$/i;
handler.group = true;

export default handler;
