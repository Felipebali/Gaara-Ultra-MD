const handler = async (m, { conn, args }) => {
    const emoji = '🚫';
    const done = '✅';
    const db = global.db.data.users || (global.db.data.users = {});

    // Obtener usuario del argumento
    if (!args || !args[0]) {
        return await conn.reply(m.chat, `${emoji} Por favor escribe el número o @mención del usuario que deseas desbanear.\nEjemplo: .unbanuser 59898719147`, m);
    }

    // Limpiar el número y convertirlo en JID
    const number = args[0].replace(/\D/g, ''); // eliminar caracteres que no sean dígitos
    const user = number + '@s.whatsapp.net';

    // Verificar si el usuario está registrado
    if (!db[user]) {
        return await conn.reply(m.chat, `${emoji} El usuario @${number} no está registrado.`, m, { mentions: [user] });
    }

    // Desbanear usuario
    db[user].banned = false;
    db[user].banReason = '';
    db[user].bannedBy = null;

    const userName = await conn.getName(user);
    const senderName = await conn.getName(m.sender);

    await conn.sendMessage(m.chat, { 
        text: `${done} El usuario *@${number}* (${userName}) ha sido desbaneado por ${senderName}.`, 
        mentions: [user, m.sender] 
    });

    // Guardar cambios en la base de datos
    if (global.db.write) await global.db.write();
};

handler.help = ['unbanuser <número>'];
handler.command = ['unbanuser'];
handler.tags = ['owner'];
handler.rowner = true; // solo owner

export default handler;
