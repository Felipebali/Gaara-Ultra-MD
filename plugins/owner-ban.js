const handler = async (m, { conn, command }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    // BAN, UNBAN y CHECK requieren mensaje citado
    if (['banuser', 'unbanuser', 'checkban'].includes(command)) {
        if (!m.quoted || !m.quoted.sender) {
            return await conn.reply(m.chat, `${emoji} Debes responder a un mensaje del usuario para usar este comando.`, m);
        }
    }

    const userJid = m.quoted?.sender;
    const userName = userJid ? await conn.getName(userJid) : null; // Nombre para mostrar
    const senderName = await conn.getName(m.sender); // Tu nombre

    // Inicializar usuario si no existe
    if (userJid && !db[userJid]) db[userJid] = {};

    // BAN
    if (command === 'banuser') {
        db[userJid].banned = true;
        db[userJid].banReason = 'No especificado';
        db[userJid].bannedBy = m.sender;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *${userName}* ha sido baneado.\nPor: ${senderName}`,
            mentions: [userJid, m.sender]
        });
    }

    // UNBAN
    else if (command === 'unbanuser') {
        if (!db[userJid].banned) {
            return await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *${userName}* no está baneado.`,
                mentions: [userJid]
            });
        }

        db[userJid].banned = false;
        db[userJid].banReason = '';
        db[userJid].bannedBy = null;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *${userName}* ha sido desbaneado por ${senderName}.`,
            mentions: [userJid, m.sender]
        });
    }

    // CHECK
    else if (command === 'checkban') {
        if (db[userJid].banned) {
            const bannedByName = await conn.getName(db[userJid].bannedBy);
            await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *${userName}* está baneado.\nBaneado por: ${bannedByName}`,
                mentions: [userJid, db[userJid].bannedBy]
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: `${done} El usuario *${userName}* no está baneado.`,
                mentions: [userJid]
            });
        }
    }

    // BANLIST
    else if (command === 'banlist') {
        const bannedUsers = Object.entries(db)
            .filter(([jid, data]) => data.banned)
            .map(([jid, data]) => `• ${conn.getName(jid)} (baneado por: ${await conn.getName(data.bannedBy)})`);

        if (bannedUsers.length === 0) {
            await conn.sendMessage(m.chat, { text: `${done} No hay usuarios baneados.` });
        } else {
            await conn.sendMessage(m.chat, { text: `🚫 Lista de usuarios baneados:\n\n${bannedUsers.join('\n')}` });
        }
    }

    if (global.db.write) await global.db.write();
};

handler.help = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.command = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.tags = ['owner'];
handler.rowner = true; // solo owners

export default handler;
