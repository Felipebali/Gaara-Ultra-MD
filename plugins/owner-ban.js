const handler = async (m, { conn, args, command }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    if (!args || !args[0]) {
        return await conn.reply(m.chat, `${emoji} Debes escribir el número o @mención del usuario.\nEjemplo: .${command} 59898719147`, m);
    }

    let input = args[0];

    // Si viene con @, quitar el símbolo
    if (input.startsWith('@')) input = input.slice(1);

    // Limpiar caracteres que no sean números
    input = input.replace(/\D/g, '');
    if (!input) return await conn.reply(m.chat, `${emoji} Formato de número inválido.`, m);

    const userJid = input + '@s.whatsapp.net';
    const userJidLower = userJid.toLowerCase();

    // Inicializar usuario si no existe
    if (!db[userJidLower]) db[userJidLower] = {};

    // Obtener nombre para mención correcta
    const userName = await conn.getName(userJidLower);
    const senderName = await conn.getName(m.sender);

    // BAN
    if (command === 'banuser') {
        db[userJidLower].banned = true;
        db[userJidLower].banReason = args.slice(1).join(' ') || 'No especificado';
        db[userJidLower].bannedBy = m.sender;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *@${userName}* ha sido baneado.\nMotivo: ${db[userJidLower].banReason}\nPor: ${senderName}`,
            mentions: [userJidLower, m.sender]
        });
    }

    // UNBAN
    else if (command === 'unbanuser') {
        if (!db[userJidLower].banned) {
            return await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *@${userName}* no está baneado.`,
                mentions: [userJidLower]
            });
        }

        db[userJidLower].banned = false;
        db[userJidLower].banReason = '';
        db[userJidLower].bannedBy = null;

        await conn.sendMessage(m.chat, {
            text: `${done} El usuario *@${userName}* ha sido desbaneado por ${senderName}.`,
            mentions: [userJidLower, m.sender]
        });
    }

    // CHECK
    else if (command === 'checkban') {
        if (db[userJidLower].banned) {
            const bannedByName = await conn.getName(db[userJidLower].bannedBy);
            await conn.sendMessage(m.chat, {
                text: `${emoji} El usuario *@${userName}* está baneado.\nMotivo: ${db[userJidLower].banReason}\nBaneado por: ${bannedByName}`,
                mentions: [userJidLower, db[userJidLower].bannedBy]
            });
        } else {
            await conn.sendMessage(m.chat, {
                text: `${done} El usuario *@${userName}* no está baneado.`,
                mentions: [userJidLower]
            });
        }
    }

    if (global.db.write) await global.db.write();
};

handler.help = ['banuser <número|@usuario>', 'unbanuser <número|@usuario>', 'checkban <número|@usuario>'];
handler.command = ['banuser','unbanuser','checkban'];
handler.tags = ['owner'];
handler.rowner = true; // solo owners

export default handler;
