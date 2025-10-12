// plugins/antitoxico.js
import fs from 'fs';

// Lista de palabras ofensivas
let toxicWords = ['tonto','idiota','estúpido','burro','feo','mierda','gil'];

// Handler principal: detecta palabras tóxicas
let handler = async (m, { conn }) => {
    if (!m.text) return;
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antitoxico) return;

    const text = m.text.toLowerCase();
    const found = toxicWords.find(word => text.includes(word));
    if (!found) return;

    let who = m.sender;
    let userMention = `@${who.split("@")[0]}`;

    try {
        await conn.sendMessage(m.chat, {
            text: `⚠️ ${userMention}, cuidado con tu lenguaje, no se permiten insultos en este grupo.`,
            mentions: [who]
        });
    } catch (e) {
        console.error('Error en AntiToxico:', e);
    }
};

// Comando para activar/desactivar anti-tóxico
handler.command = ['antitoxico'];
handler.group = true;
handler.owner = false; // cualquier admin puede activar
handler.admin = true; // solo admins pueden usar el comando
handler.register = true;

// Función que se ejecuta al usar el comando
handler.callback = async (m, { conn, isAdmin }) => {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo los admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];
    chat.antitoxico = !chat.antitoxico;

    await conn.sendMessage(m.chat, {
        text: `✅ Anti-Tóxico ahora está *${chat.antitoxico ? "activado" : "desactivado"}* para todos los miembros del grupo.`
    });
};

export default handler;
