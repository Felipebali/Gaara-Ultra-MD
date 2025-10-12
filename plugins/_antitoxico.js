// plugins/antitoxico.js
import fs from 'fs';
import path from 'path';

let toxicWords = ['tonto','idiota','estúpido','burro','feo','mierda','gil']; // palabras ofensivas

// --- Handler para detectar lenguaje tóxico ---
let handler = async (m, { conn }) => {
    if (!m.text) return; // solo textos
    const chat = global.db.data.chats[m.chat] || {};
    if (!chat.antitoxico) return; // si no está activado, no hace nada

    const text = m.text.toLowerCase();
    const found = toxicWords.find(word => text.includes(word));
    if (!found) return; // si no encontró nada, no hace nada

    let who = m.sender; // usuario que envió el mensaje
    let userMention = `@${who.split("@")[0]}`;

    // Mensaje de aviso
    let response = `⚠️ ${userMention}, cuidado con tu lenguaje, no se permiten insultos en este grupo.`;

    // Enviar aviso con mención
    try {
        await conn.sendMessage(m.chat, { text: response, mentions: [who] });
        // Opcional: borrar mensaje tóxico
        // await conn.sendMessage(m.chat, { delete: m.key });
    } catch (e) {
        console.error('Error en AntiToxico:', e);
    }
};

// --- Comando para activar/desactivar AntiTóxico ---
export async function antitoxicoCommand(m, { conn, isAdmin }) {
    if (!m.isGroup) return;
    if (!isAdmin) return m.reply("❌ Solo los admins pueden usar este comando.");

    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {};
    let chat = global.db.data.chats[m.chat];

    chat.antitoxico = !chat.antitoxico;

    await conn.sendMessage(m.chat, {
        text: `✅ Anti-Tóxico ahora está *${chat.antitoxico ? "activado" : "desactivado"}* en este grupo.`
    });
}

// --- Configuración del handler ---
handler.help = ['antitoxico'];
handler.tags = ['mod'];
handler.command = ['antitoxico']; // se puede usar como toggle
handler.group = true;

export default handler; 
