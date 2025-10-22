// 🧩 propietario-ban.js
import fs from 'fs';

const dbFile = './banlist.json';
if (!fs.existsSync(dbFile)) fs.writeFileSync(dbFile, '{}');

let db = JSON.parse(fs.readFileSync(dbFile));

// ----------------- FUNCIÓN AUXILIAR -----------------
function saveDB() {
    fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

let handler = async (m, { conn, command, text, participants }) => {
    const senderName = await conn.getName(m.sender);
    const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net'];
    if (!ownerNumbers.includes(m.sender)) return conn.reply(m.chat, '⚠️ Solo el propietario puede usar este comando.', m);

    // ----------------- BANUSER -----------------
    if (command === 'banuser') {
        let who;
        if (m.quoted) who = m.quoted.sender;
        else if (m.mentionedJid?.length) who = m.mentionedJid[0];
        else return conn.reply(m.chat, '⚠️ Menciona o responde a alguien para banearlo.', m);

        const reason = text?.replace(/@\d+/g, '').trim() || 'No especificado';
        db[who] = { banned: true, banReason: reason, bannedBy: senderName };
        saveDB();

        const name = await conn.getName(who);
        await conn.sendMessage(m.chat, {
            text: `✅ *${name}* fue baneado globalmente y será expulsado.\n🔹 Motivo: ${reason}`,
            mentions: [who]
        });

        try {
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        } catch (e) {
            console.log('No se pudo expulsar:', e);
        }
        return;
    }

    // ----------------- UNBANUSER -----------------
    if (command === 'unbanuser') {
        let who;
        if (m.quoted) who = m.quoted.sender;
        else if (m.mentionedJid?.length) who = m.mentionedJid[0];
        else return conn.reply(m.chat, '⚠️ Menciona o responde a alguien para desbanear.', m);

        if (!db[who]?.banned) return conn.reply(m.chat, '❌ Ese usuario no está baneado.', m);

        delete db[who];
        saveDB();

        const name = await conn.getName(who);
        await conn.sendMessage(m.chat, {
            text: `✅ *${name}* fue desbaneado correctamente.`,
            mentions: [who]
        });
        return;
    }

    // ----------------- BANLIST -----------------
    if (command === 'banlist') {
        const entries = Object.entries(db);
        if (!entries.length) return conn.reply(m.chat, '✅ No hay usuarios baneados.', m);

        let list = '🚫 *Lista de baneados:*\n\n';
        for (const [jid, info] of entries) {
            const name = await conn.getName(jid);
            list += `• @${jid.split('@')[0]}\n  🔸 Baneado por: ${info.bannedBy || 'Desconocido'}\n  🔹 Motivo: ${info.banReason}\n\n`;
        }

        await conn.sendMessage(m.chat, { text: list.trim(), mentions: entries.map(([jid]) => jid) });
        return;
    }
};
handler.help = ['banuser @usuario', 'unbanuser @usuario', 'banlist'];
handler.tags = ['owner'];
handler.command = ['banuser', 'unbanuser', 'banlist'];
handler.rowner = true;

// ----------------- AUTO KICK SI HABLA O ENTRA -----------------
handler.participantsUpdate = async function (update) {
    if (!update.participants || !update.action) return;
    for (const user of update.participants) {
        if (update.action === 'add' && db[user]?.banned) {
            const reason = db[user].banReason || 'No especificado';
            const name = await this.getName(user);
            await this.sendMessage(update.id, {
                text: `⚠️ *${name}* estaba en la lista negra y fue eliminado automáticamente.\n🔹 Motivo: ${reason}`,
                mentions: [user]
            });
            await this.groupParticipantsUpdate(update.id, [user], 'remove');
        }
    }
};

handler.before = async function (m, { conn }) {
    if (!m.isGroup || !m.sender) return;
    if (db[m.sender]?.banned) {
        const reason = db[m.sender].banReason || 'No especificado';
        const name = await conn.getName(m.sender);
        await conn.sendMessage(m.chat, {
            text: `🚫 *${name}* fue eliminado por estar en la lista negra.\n🔹 Motivo: ${reason}`,
            mentions: [m.sender]
        });
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');
        return !1;
    }
};

export default handler;
