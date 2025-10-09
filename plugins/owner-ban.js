const handler = async (m, { conn, args, command }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    if (!args || !args[0]) {
        return await conn.reply(m.chat, `${emoji} Debes escribir el número o @mención del usuario.\nEjemplo: .${command} 59898719147`, m);
    }

    // Limpiar número y convertir a JID
    let input = args[0].replace(/\D/g, '');
    if (!input) return await conn.reply(m.chat, `${emoji} Formato de número inválido.`, m);
    const userJid = input + '@s.whatsapp.net';
    const userJidLower = userJid.toLowerCase();

    // Inicializar usuario si no existe
    if (!db[userJidLower]) db[userJidLower] = {};

    const userName = await conn.getName(userJidLower);
    const senderName = await conn.getName(m.sender);

    if (command === 'banuser') {
        db[userJidLower].banned = true;
        db[userJidLower].banReason = args.slice(1).join(' ') || 'No especificado';
        db[userJidLower].bannedBy = m.sender;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *@${input}* (${userName}) ha sido baneado.\nMotivo: ${db[userJidLower].banReason}\nPor: ${senderName}`,
            mentions: [userJidLower, m.sender]
        });
    }

    else if (command === 'unbanuser') {
        if (!db[userJidLower].banned) {
            return await conn.reply(m.chat, `${emoji} El usuario *@${input}* no está baneado.`, m, { mentions: [userJidLower] });
        }

        db[userJidLower].banned = false;
        db[userJidLower].banReason = '';
        db[userJidLower].bannedBy = null;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *@${input}* (${userName}) ha sido desbaneado por ${senderName}.`,
            mentions: [userJidLower, m.sender]
        });
    }

    else if (command === 'checkban') {
        if (db[userJidLower].banned) {
            await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *@${input}* (${userName}) está baneado.\nMotivo: ${db[userJidLower].banReason}\nBaneado por: ${await conn.getName(db[userJidLower].bannedBy)}`,
                mentions: [userJidLower, db[userJidLower].bannedBy]
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: `✅ El usuario *@${input}* (${userName}) no está baneado.`,
                mentions: [userJidLower]
            });
        }
    }

    if (global.db.write) await global.db.write();
};

handler.help = ['banuser <número|@usuario>', 'unbanuser <número|@usuario>', 'checkban <número|@usuario>'];
handler.command = ['banuser','unbanuser','checkban'];
handler.tags = ['owner'];
handler.rowner = true; // Solo owners

export default handler; 
