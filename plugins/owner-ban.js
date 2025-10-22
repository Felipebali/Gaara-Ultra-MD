// plugins/propietario-ban.js
function normalizeJid(jid) {
    if (!jid) return null;
    return jid.replace(/@s\.whatsapp\.net$/, '@c.us');
}

// Limpia el motivo quitando números, @ y links
function cleanReason(text) {
    if (!text) return 'No especificado';
    return text
        .replace(/@\d+/g, '')
        .replace(/\d+/g, '')
        .replace(/https?:\/\/\S+/g, '')
        .replace(/@/g, '')
        .trim() || 'No especificado';
}

const handler = async (m, { conn, command, text }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    // Determinar usuario
    const userJid = normalizeJid(
        m.quoted?.sender ||
        m.mentionedJid?.[0] ||
        (text && !['banlist', 'clearbanlist'].includes(command)
            ? text.split(' ')[0].replace(/\D/g, '') + '@s.whatsapp.net'
            : null)
    );

    if (!userJid && !['banlist', 'clearbanlist'].includes(command))
        return await conn.reply(
            m.chat,
            `${emoji} Debes responder, mencionar o escribir el número del usuario.`,
            m
        );

    if (userJid && !db[userJid]) db[userJid] = {};

    // ---------------- BANUSER ----------------
    if (command === 'banuser') {
        let reason = cleanReason(text);
        db[userJid].banned = true;
        db[userJid].banReason = reason;
        db[userJid].bannedBy = m.sender;

        const name = await conn.getName(userJid);

        await conn.sendMessage(m.chat, {
            text: `${done} *@${name}* fue baneado globalmente y será expulsado.\n🔹 Motivo: ${reason}`,
            mentions: [userJid],
        });

        // Expulsar de todos los grupos
        const groups = Object.entries(await conn.groupFetchAllParticipating());
        for (const [jid, group] of groups) {
            const member = group.participants.find(
                (p) => normalizeJid(p.id) === userJid
            );
            if (member) {
                try {
                    await conn.sendMessage(jid, {
                        text: `🚫 *@${name}* estaba en la lista negra y fue eliminado automáticamente.\n🔹 Motivo: ${reason}`,
                        mentions: [userJid],
                    });
                    await conn.groupParticipantsUpdate(jid, [member.id], 'remove');
                    console.log(
                        `[AUTO-KICK] Expulsado ${userJid} de ${group.subject} por: ${reason}`
                    );
                } catch (e) {
                    console.log(`⚠️ No se pudo expulsar de ${group.subject}: ${e.message}`);
                }
            }
        }
    }

    // ---------------- UNBANUSER ----------------
    else if (command === 'unbanuser') {
        if (!db[userJid]?.banned)
            return await conn.sendMessage(m.chat, {
                text: `${emoji} *@${await conn.getName(userJid)}* no está baneado.`,
                mentions: [userJid],
            });

        db[userJid].banned = false;
        db[userJid].banReason = '';
        db[userJid].bannedBy = null;

        await conn.sendMessage(m.chat, {
            text: `${done} *@${await conn.getName(userJid)}* ha sido desbaneado correctamente.`,
            mentions: [userJid],
        });
    }

    // ---------------- CHECKBAN ----------------
    else if (command === 'checkban') {
        const name = await conn.getName(userJid);
        if (!db[userJid]?.banned)
            return await conn.sendMessage(m.chat, {
                text: `✅ *@${name}* no está baneado.`,
                mentions: [userJid],
            });

        const bannedByName = db[userJid].bannedBy
            ? await conn.getName(db[userJid].bannedBy)
            : 'Desconocido';
        const reason = cleanReason(db[userJid].banReason);

        await conn.sendMessage(m.chat, {
            text: `${emoji} *@${name}* está baneado.\n🔸 Baneado por: ${bannedByName}\n🔹 Motivo: ${reason}`,
            mentions: [userJid],
        });
    }

    // ---------------- BANLIST ----------------
    else if (command === 'banlist') {
        const bannedEntries = Object.entries(db).filter(([jid, data]) => data?.banned);
        if (bannedEntries.length === 0)
            return await conn.sendMessage(m.chat, {
                text: `${done} No hay usuarios baneados.`,
            });

        let textList = '🚫 *Lista de baneados:*\n\n';
        const mentions = [];

        for (const [jid, data] of bannedEntries) {
            const name = await conn.getName(jid);
            const bannedByName = data.bannedBy
                ? await conn.getName(data.bannedBy)
                : 'Desconocido';
            const reason = cleanReason(data.banReason);

            textList += `• *@${name}*\n  🔸 Baneado por: ${bannedByName}\n  🔹 Motivo: ${reason}\n\n`;
            mentions.push(jid);
        }

        await conn.sendMessage(m.chat, { text: textList.trim(), mentions });
    }

    // ---------------- CLEARBANLIST ----------------
    else if (command === 'clearbanlist') {
        for (const jid in db) {
            if (db[jid]?.banned) {
                db[jid].banned = false;
                db[jid].banReason = '';
                db[jid].bannedBy = null;
            }
        }
        await conn.sendMessage(m.chat, {
            text: `${done} La lista de baneados ha sido vaciada.`,
        });
    }

    if (global.db.write) await global.db.write();
};

// ---------------- AUTO-KICK AL HABLAR ----------------
handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.sender) return;
    const db = global.db.data.users || {};
    const sender = normalizeJid(m.sender);

    if (db[sender]?.banned) {
        const reason = cleanReason(db[sender].banReason);
        const name = await conn.getName(sender);

        await conn.sendMessage(m.chat, {
            text: `🚫 *@${name}* está en la lista negra y será eliminado.\n🔹 Motivo: ${reason}`,
            mentions: [sender],
        });

        await conn.groupParticipantsUpdate(m.chat, [sender], 'remove');
        console.log(`[AUTO-KICK] Eliminado ${sender} por: ${reason}`);
    }
};

// ---------------- AUTO-KICK AL UNIRSE ----------------
handler.participantsUpdate = async function (event) {
    const conn = this;
    const { id, participants, action } = event;
    const db = global.db.data.users || {};

    if (action === 'add' || action === 'invite') {
        for (const user of participants) {
            const normalizedUser = normalizeJid(user);
            if (!db[normalizedUser]) db[normalizedUser] = {};

            if (db[normalizedUser].banned) {
                const reason = cleanReason(db[normalizedUser].banReason);
                const name = await conn.getName(normalizedUser);

                await conn.sendMessage(id, {
                    text: `🚫 *@${name}* estaba en la lista negra y fue eliminado automáticamente.\n🔹 Motivo: ${reason}`,
                    mentions: [normalizedUser],
                });

                await conn.groupParticipantsUpdate(id, [normalizedUser], 'remove');
                console.log(
                    `[AUTO-KICK JOIN] ${normalizedUser} eliminado por: ${reason}`
                );
            }
        }
    }
};

// ---------------- HELP & COMANDOS ----------------
handler.help = ['banuser', 'unbanuser', 'checkban', 'banlist', 'clearbanlist'];
handler.command = ['banuser', 'unbanuser', 'checkban', 'banlist', 'clearbanlist'];
handler.tags = ['owner'];
handler.rowner = true;

export default handler;
