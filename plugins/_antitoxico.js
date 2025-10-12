// plugins/antitoxico.js
import fs from 'fs';
import path from 'path';

// Lista de palabras ofensivas
let toxicWords = ['tonto','idiota','estúpido','burro','feo','mierda','gil'];

let handler = async (m, { conn }) => {
    if (!m.text) return; // solo textos
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antitoxico) return; // si no está activado, no hace nada

    const text = m.text.toLowerCase();
    const found = toxicWords.find(word => text.includes(word));
    if (!found) return; // si no encontró nada, no hace nada

    let who = m.sender;
    let userMention = `@${who.split("@")[0]}`;

    // Mensaje de advertencia
    let response = `⚠️ ${userMention}, cuidado con tu lenguaje, no se permiten insultos en este grupo.`;

    try {
        // Enviar aviso con mención
        await conn.sendMessage(m.chat, { text: response, mentions: [who] });
        // Opcional: borrar mensaje tóxico
        // await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
        console.error('Error en AntiToxico:', e);
    }
};

// Comando para activar/desactivar AntiTóxico
export async function antitoxicoCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo los admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    chat.antitoxico = !chat.antitoxico;

    await conn.sendMessage(m.chat, {
        text: `✅ Anti-Tóxico ahora está *${chat.antitoxico ? "activado" : "desactivado"}* para *todos los miembros del grupo*, incluyendo admins.`
    });
}

// Configuración del handler
handler.help = ['antitoxico'];
handler.tags = ['mod'];
handler.command = ['antitoxico'];
handler.group = true;

export default handler;
