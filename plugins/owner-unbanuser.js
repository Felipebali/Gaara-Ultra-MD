const handler = async (m, { conn, text }) => {
    try {
        const emojis = '🚫'; 
        const done = '✅'; 

        let user;
        const db = global.db.data.users || (global.db.data.users = {});

        // 1️⃣ Usuario citado
        if (m.quoted) {
            user = m.quoted.sender;
        }
        // 2️⃣ Usuario mencionado
        else if (m.mentionedJid && m.mentionedJid.length) {
            user = m.mentionedJid[0];
        }
        // 3️⃣ Usuario escrito como número
        else if (text && /\d+/.test(text)) {
            const number = text.match(/\d+/g).join('');
            user = number + '@s.whatsapp.net';
        }
        else {
            await conn.reply(m.chat, `*${emojis} Debes mencionar, responder o escribir el número del usuario que deseas desbanear.*`, m);
            return;
        }

        // Verificar que el usuario exista en la base de datos
        if (db[user]) {
            db[user].banned = false;
            db[user].banReason = '';
            db[user].bannedBy = null;

            const userName = await conn.getName(user);
            await conn.sendMessage(m.chat, { 
                text: `*${done} El usuario* *@${user.split('@')[0]}* (*${userName}*) *ha sido desbaneado.*`, 
                mentions: [user] 
            });

            // Guardar cambios si la base de datos requiere write()
            if (global.db.write) await global.db.write();

        } else {
            await conn.reply(m.chat, `*⚠️ El usuario no está registrado en la base de datos.*`, m);
        }

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, `✖️ *Error en unbanuser:* ${e.message}`, m);
    }
};

handler.help = ['unbanuser <@usuario o número>'];
handler.command = ['unbanuser'];
handler.tags = ['owner'];
handler.rowner = true; // Solo owner

export default handler;
