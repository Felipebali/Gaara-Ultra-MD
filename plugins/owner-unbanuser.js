const handler = async (m, { conn, args }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    if (!args || !args[0]) {
        return await conn.reply(m.chat, `${emoji} Por favor escribe el número o @mención del usuario que deseas desbanear.\nEjemplo: .unbanuser 59898719147`, m);
    }

    // Obtener el primer argumento
    let input = args[0];

    // Si viene con @, lo quitamos
    if (input.startsWith('@')) input = input.slice(1);

    // Formar el JID completo
    const userJid = input + '@s.whatsapp.net';
    const userJidLower = userJid.toLowerCase(); // evitar problemas de mayúsculas

    // Verificar si el usuario existe en la DB
    if (!db[userJidLower]) {
        return await conn.reply(m.chat, `${emoji} El usuario @${input} no está registrado en la base de datos.`, m, { mentions: [userJidLower] });
    }

    // Desbanear usuario
    db[userJidLower].banned = false;
    db[userJidLower].banReason = '';
    db[userJidLower].bannedBy = null;

    const userName = await conn.getName(userJidLower);
    const senderName = await conn.getName(m.sender);

    await conn.sendMessage(m.chat, {
        text: `${done} El usuario *@${input}* (${userName}) ha sido desbaneado por ${senderName}.`,
        mentions: [userJidLower, m.sender]
    });

    if (global.db.write) await global.db.write();
};

handler.help = ['unbanuser <número o @usuario>'];
handler.command = ['unbanuser'];
handler.tags = ['owner'];
handler.rowner = true; // solo owner

export default handler;
