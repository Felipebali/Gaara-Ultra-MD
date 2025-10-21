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
    const userName = userJid ? await conn.getName(userJid) : null;
    const senderName = await conn.getName(m.sender);
    const who = userJid ? userJid : '';

    // Inicializar si no existe
    if (userJid && !db[userJid]) db[userJid] = {};

    // BANUSER — agrega a lista y expulsa
    if (command === 'banuser') {
        db[userJid].banned = true;
        db[userJid].banReason = 'No especificado';
        db[userJid].bannedBy = m.sender;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *@${who.split("@")[0]}* ha sido baneado y será expulsado de los grupos donde esté el bot.\n👤 Baneado por: ${senderName}`,
            mentions: [userJid, m.sender]
        });

        // Intentar expulsarlo de todos los grupos donde esté el bot
        const groups = Object.entries(await conn.groupFetchAllParticipating());
        for (const [jid, group] of groups) {
            const isMember = group.participants.some(p => p.id === userJid);
            if (isMember) {
                try {
                    await conn.groupParticipantsUpdate(jid, [userJid], 'remove');
                    await conn.sendMessage(jid, {
                        text: `${emoji} *@${who.split("@")[0]}* fue expulsado automáticamente (baneado globalmente).`,
                        mentions: [userJid]
                    });
                } catch (e) {
                    console.log(`No se pudo expulsar a ${userJid} de ${group.subject}:`, e.message);
                }
            }
        }
    }

    // UNBANUSER
    else if (command === 'unbanuser') {
        if (!db[userJid].banned) {
            return await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *@${who.split("@")[0]}* no está baneado.`,
                mentions: [userJid]
            });
        }

        db[userJid].banned = false;
        db[userJid].banReason = '';
        db[userJid].bannedBy = null;

        await conn.sendMessage(m.chat, {
            text: `${done} *@${who.split("@")[0]}* ha sido desbaneado por ${senderName}.`,
            mentions: [userJid, m.sender]
        });
    }

    // CHECKBAN
    else if (command === 'checkban') {
        if (db[userJid].banned) {
            const bannedByName = await conn.getName(db[userJid].bannedBy);
            await conn.sendMessage(m.chat, {
                text: `${emoji} *@${who.split("@")[0]}* está baneado.\n👤 Baneado por: ${bannedByName}`,
                mentions: [userJid, db[userJid].bannedBy]
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: `${done} *@${who.split("@")[0]}* no está baneado.`,
                mentions: [userJid]
            });
        }
    }

    // BANLIST
    else if (command === 'banlist') {
        const bannedEntries = Object.entries(db).filter(([jid, data]) => data.banned);
        if (bannedEntries.length === 0) {
            return await conn.sendMessage(m.chat, { text: `${done} No hay usuarios baneados.` });
        }

        const bannedUsersText = await Promise.all(
            bannedEntries.map(async ([jid, data]) => {
                const userName = await conn.getName(jid);
                const bannedByName = await conn.getName(data.bannedBy);
                return `• ${userName} (${jid.split('@')[0]})\n  Baneado por: ${bannedByName}`;
            })
        );

        await conn.sendMessage(m.chat, {
            text: `🚫 *Lista de usuarios baneados:*\n\n${bannedUsersText.join('\n\n')}`
        });
    }

    if (global.db.write) await global.db.write();
};

// AUTO KICK al entrar a grupo (anti baneados)
handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.sender) return;
    const user = global.db.data.users[m.sender];
    if (user?.banned) {
        try {
            await conn.sendMessage(m.chat, {
                text: `🚫 *@${m.sender.split('@')[0]}* está en la lista de baneados y será eliminado.`,
                mentions: [m.sender]
            });
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        } catch (e) {
            console.log('Error expulsando usuario baneado:', e.message);
        }
    }
};

handler.help = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.command = ['banuser', 'unbanuser', 'checkban', 'banlist'];
handler.tags = ['owner'];
handler.rowner = true; // Solo dueños del bot

export default handler;
