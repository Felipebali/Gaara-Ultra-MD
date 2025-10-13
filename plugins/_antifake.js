// plugins/antifake-offline.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: '⚠️ Este comando solo funciona en grupos.' });
    if (!(isAdmin || isOwner)) return conn.sendMessage(m.chat, { text: '⚠️ Solo admins pueden usar este comando.' });

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    chat.antifake = !chat.antifake;

    await conn.sendMessage(m.chat, {
        text: chat.antifake
            ? '⚡️ La función *antifake* se activó para este chat ✅'
            : '🛑 La función *antifake* se desactivó para este chat ❌'
    });

    // Escaneo de participantes actuales al activar
    if (chat.antifake) {
        let groupMetadata = await conn.groupMetadata(m.chat);
        let participants = groupMetadata.participants.map(u => u.id);
        let sospechosos = [];

        for (let jid of participants) {
            let raw = jid.split('@')[0].replace(/\D/g,''); // solo dígitos
            let number = raw.startsWith('598') ? raw : '598' + raw; // normalizamos todos los uruguayos
            if (!number.startsWith('598')) { // solo internacionales
                sospechosos.push(jid);
            }
        }

        if (sospechosos.length > 0) {
            let mentionsText = sospechosos.map(who => `@${who.split("@")[0]}`).join('\n');
            await conn.sendMessage(m.chat, {
                text: `⚠️ Números internacionales detectados en el grupo (podrían ser eliminados):\n\n${mentionsText}`,
                mentions: sospechosos
            });
        } else {
            await conn.sendMessage(m.chat, { text: '✅ No se encontraron números internacionales en el grupo.' });
        }
    }
};

// Detecta nuevos participantes
handler.all = async (m, { conn }) => {
    try {
        let chat = global.db.data.chats[m.chat];
        if (!m.isGroup || !chat?.antifake) return;

        let newUsers = m.participants || [];
        for (let who of newUsers) {
            let raw = who.split('@')[0].replace(/\D/g,'');
            let number = raw.startsWith('598') ? raw : '598' + raw; // normalizamos
            if (!number.startsWith('598')) { // solo internacionales
                let groupMetadata = await conn.groupMetadata(m.chat);
                let admins = groupMetadata.participants.filter(u => u.admin === 'admin' || u.admin === 'superadmin');
                let mentions = admins.map(u => u.id);

                await conn.sendMessage(m.chat, {
                    text: `⚠️ Nuevo número internacional detectado: @${who.split("@")[0]}\nTipo: POSIBLE NO URUGUAYO`,
                    mentions: [who, ...mentions]
                });
            }
        }
    } catch (e) {
        console.log('Error en plugin antifake-offline:', e);
    }
};

handler.help = ['antifake'];
handler.tags = ['group'];
handler.command = ['antifake', 'antivirtuales'];

export default handler;
