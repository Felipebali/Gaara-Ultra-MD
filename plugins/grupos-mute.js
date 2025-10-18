let mutedUsers = new Set();

let handler = async (m, { conn, usedPrefix, command, isAdmin, isBotAdmin }) => {
    if (!isBotAdmin) return conn.reply(m.chat, '⭐ El bot necesita ser administrador.', m);
    if (!isAdmin) return conn.reply(m.chat, '⭐ Solo los administradores pueden usar este comando.', m);

    let user;

    // Detecta usuario por mensaje citado
    if (m.quoted) {
        user = m.quoted.sender;
    }
    // Si no hay cita, detecta usuario por mención
    else if (m.mentionedJid && m.mentionedJid.length > 0) {
        user = m.mentionedJid[0];
    }
    else {
        return conn.reply(m.chat, '😮‍💨 Qué inútil si no citaste o mencionaste a nadie para mutear/desmutear.😮‍💨', m);
    }

    if (["mute", "silenciar"].includes(command)) {
        mutedUsers.add(user);
        conn.reply(m.chat, `✅ *Usuario muteado:* @${user.split('@')[0]}`, m, { mentions: [user] });
    } else if (["unmute", "desilenciar"].includes(command)) {
        mutedUsers.delete(user);
        conn.reply(m.chat, `✅ *Usuario desmuteado:* @${user.split('@')[0]}`, m, { mentions: [user] });
    }
};

handler.before = async (m, { conn }) => {
    if (mutedUsers.has(m.sender)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key });
        } catch (e) {
            console.error(e);
        }
    }
};

handler.help = ['mute', 'unmute', 'silenciar', 'desilenciar'];
handler.tags = ['grupo'];
handler.command = ['mute', 'unmute', 'silenciar', 'desilenciar'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
