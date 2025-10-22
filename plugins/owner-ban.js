// plugins/propietario-ban.js
function normalizeJid(jid) {
    if (!jid) return null;
    return jid.replace(/@s\.whatsapp\.net$/, '@c.us');
}

const handler = async (m, { conn, command, text }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    // Determinar usuario a banear/desbanear/consultar
    const userJid = normalizeJid(
        m.quoted?.sender || m.mentionedJid?.[0] || (text && !['banlist', 'clearbanlist'].includes(command) ? text.split(' ')[0].replace(/\D/g,'')+'@s.whatsapp.net' : null)
    );

    if (!userJid && !['banlist', 'clearbanlist'].includes(command)) {
        return await conn.reply(m.chat, `${emoji} Debes responder, mencionar o escribir el número del usuario.`, m);
    }

    if (userJid && !db[userJid]) db[userJid] = {};

    // ---------------- BANUSER ----------------
    if (command === 'banuser') {
        const reason = text ? text.replace(/\s*\d+$/, '').trim() || 'No especificado' : 'No especificado';
        db[userJid].banned = true;
        db[userJid].banReason = reason;
        db[userJid].bannedBy = m.sender;

        const userName = await conn.getName(userJid) || userJid.split("@")[0];

        await conn.sendMessage(m.chat, {
            text: `${done} *${userName}* fue baneado globalmente.\nMotivo: ${reason}`,
            mentions: [userJid]
        });

        // Expulsar de todos los grupos
        const groups = Object.entries(await conn.groupFetchAllParticipating());
        for (const [jid, group] of groups) {
            const member = group.participants.find(p => normalizeJid(p.id) === userJid);
            if (member) {
                try {
                    await conn.sendMessage(jid, {
                        text: `🚫 *${userName}* estaba en la lista negra y fue eliminado automáticamente.\nMotivo: ${reason}`,
                        mentions: [userJid]
                    });
                    await conn.groupParticipantsUpdate(jid, [member.id], 'remove');
                    console.log(`[AUTO-KICK] Expulsado ${userName} de ${group.subject} por: ${reason}`);
                } catch (e) {
                    console.log(`⚠️ No se pudo expulsar de ${group.subject}: ${e.message}`);
                }
            }
        }
    }

    // ---------------- UNBANUSER ----------------
    else if (command === 'unbanuser') {
        const userName = await conn.getName(userJid) || userJid.split("@")[0];
        if (!db[userJid]?.banned) {
            return await conn.sendMessage(m.chat, { 
                text: `${emoji} *${userName}* no está baneado.`, 
                mentions: [userJid] 
            });
        }
        db[userJid].banned = false;
        db[userJid].banReason = '';
        db[userJid].bannedBy = null;

        await conn.sendMessage(m.chat, { 
            text: `${done} *${userName}* ha sido desbaneado correctamente.`, 
            mentions: [userJid] 
        });
    }

    // ---------------- CHECKBAN ----------------
    else if (command === 'checkban') {
        const userName = await conn.getName(userJid) || userJid.split("@")[0];
        if (db[userJid]?.banned) {
            const bannedBy = db[userJid].bannedBy ? await conn.getName(db[userJid].bannedBy) || 'Desconocido' : 'Desconocido';
            const reason = db[userJid].banReason || 'No especificado';
            await conn.sendMessage(m.chat, { 
                text: `${emoji} *${userName}* está baneado.\nBaneado por: ${bannedBy}\nMotivo: ${reason}`, 
                mentions: [userJid] 
            });
        } else {
            await conn.sendMessage(m.chat, { 
                text: `${done} *${userName}* no está baneado.`, 
                mentions: [userJid] 
            });
        }
    }

    // ---------------- BANLIST ----------------
    else if (command === 'banlist') {
        const bannedEntries = Object.entries(db).filter(([jid, data]) => data?.banned);
        if (bannedEntries.length === 0)
            return await conn.sendMessage(m.chat, { text: `${done} No hay usuarios baneados.` });

        let textList = '🚫 *Lista de baneados:*\n\n';
        let mentions = [];

        for (const [jid, data] of bannedEntries) {
            const userName = await conn.getName(jid) || jid.split("@")[0];
            const bannedByName = data.bannedBy ? await conn.getName(data.bannedBy) || 'Desconocido' : 'Desconocido';
            const reason = data.banReason || 'No especificado';
            textList += `• ${userName}\n  Baneado por: ${bannedByName}\n  Motivo: ${reason}\n\n`;
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
        await conn.sendMessage(m.chat, { text: `${done} La lista de baneados ha sido vaciada.` });
    }

    if (global.db.write) await global.db.write();
};

// ---------------- AUTO-KICK AL HABLAR ----------------
handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.sender) return;
    const db = global.db.data.users || {};
    const sender = normalizeJid(m.sender);
    if (db[sender]?.banned) {
        const senderName = await conn.getName(sender) || sender.split("@")[0];
        try {
            await conn.sendMessage(m.chat, { 
                text: `🚫 *${senderName}* está en la lista negra y será eliminado.\nMotivo: ${db[sender].banReason || 'No especificado'}`, 
                mentions: [sender] 
            });
            await conn.groupParticipantsUpdate(m.chat, [sender], 'remove');
            console.log(`[AUTO-KICK] Eliminado ${senderName} del grupo ${m.chat} por: ${db[sender].banReason || 'No especificado'}`);
        } catch (e) {
            console.log('⚠️ Error autoexpulsando baneado:', e.message);
        }
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
                const userName = await conn.getName(normalizedUser) || normalizedUser.split("@")[0];
                try {
                    await conn.sendMessage(id, { 
                        text: `🚫 *${userName}* está en la lista negra y fue eliminado automáticamente.\nMotivo: ${db[normalizedUser].banReason || 'No especificado'}`, 
                        mentions: [normalizedUser] 
                    });
                    await conn.groupParticipantsUpdate(id, [normalizedUser], 'remove');
                    console.log(`[AUTO-KICK JOIN] ${userName} eliminado del grupo ${id} por: ${db[normalizedUser].banReason || 'No especificado'}`);
                } catch (e) {
                    console.log(`⚠️ No se pudo expulsar a ${userName}: ${e.message}`);
                }
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
