// plugins/juegos/reacciones-automaticas.js
let cooldowns = {};

let handler = async (m, { conn }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};
        if (!chat.games) return; // Solo si los juegos están activados
        if (!chat.reacciones) return; // Función activada solo si .reacciones está ON
        if (!m.isGroup) return;

        // Cooldown de 5 segundos por usuario
        const now = Date.now();
        if (cooldowns[m.sender] && now - cooldowns[m.sender] < 5000) return;
        cooldowns[m.sender] = now;

        // Obtener participantes
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants.map(u => u.id);
        const others = participants.filter(u => u !== m.sender && u !== conn.user.jid);
        if (!others.length) return;
        const randomUser = others[Math.floor(Math.random() * others.length)];

        // Definir palabras clave y mensajes
        const palabras = {
            zorro: [
                `🦊 @user1 le jugó una broma a @user2 😏`,
                `😎 @user1 hizo travesuras con @user2 🐾`
            ],
            zorra: [
                `🔥 @user1 se acostó con @user2 😜`,
                `💥 @user1 y @user2 hicieron travesuras juntos 😏`
            ],
            guapo: [
                `🌟 @user1 es más guapo que @user2 😎`,
                `😏 @user1 le ganó en estilo a @user2 🕺`
            ],
            tonto: [
                `🤪 @user1 hizo una tontería con @user2 😂`,
                `😅 @user1 y @user2 se confundieron juntos 🤯`
            ],
            gato: [
                `🐱 @user1 está acechando a @user2 😼`,
                `😹 @user1 y @user2 están jugando al escondite felino`
            ],
            raton: [
                `🐭 @user1 corrió delante de @user2 🏃`,
                `😆 @user1 y @user2 están en una persecución épica`
            ]
        };

        // Revisar si el mensaje contiene alguna palabra clave
        const text = m.text.toLowerCase();
        const keys = Object.keys(palabras);
        const match = keys.find(k => text.includes(k));
        if (!match) return;

        // Elegir mensaje aleatorio
        const mensajes = palabras[match];
        const mensaje = mensajes[Math.floor(Math.random() * mensajes.length)]
            .replace('@user1', `@${m.sender.split('@')[0]}`)
            .replace('@user2', `@${randomUser.split('@')[0]}`);

        // Enviar mensaje sin citar
        await conn.sendMessage(m.chat, { text: mensaje, mentions: [m.sender, randomUser] });

    } catch (e) {
        console.log('Error en plugin de reacciones automáticas:', e);
    }
};

// Comando para activar/desactivar la función
let activarHandler = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return m.reply('⚠️ Solo se puede usar en grupos.');
    if (!isAdmin) return m.reply('⚠️ Solo admins pueden activar/desactivar.');
    const chat = global.db.data.chats[m.chat] || {};
    chat.reacciones = !chat.reacciones;
    global.db.data.chats[m.chat] = chat;
    m.reply(`🎮 Función de reacciones automáticas ${chat.reacciones ? 'activada 🟢' : 'desactivada 🔴'}`);
};

activarHandler.command = ['reacciones'];
activarHandler.group = true;
activarHandler.admin = true;

export { handler as default, activarHandler };
