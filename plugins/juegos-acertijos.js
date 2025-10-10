// plugins/acertijo.js
import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, text }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};

        // Verificar si los juegos están activados
        if (!chat.games) {
            return await conn.sendMessage(m.chat, { text: '❌ Los juegos están desactivados en este chat. Usa el comando .juegos para activarlos.' });
        }

        // Inicializar objeto de acertijos por chat si no existe
        if (!chat.acertijoActual) chat.acertijoActual = {};
        global.db.data.chats[m.chat] = chat;

        // Si el usuario envía un texto, verificamos la respuesta
        if (text) {
            const respuestaCorrecta = chat.acertijoActual[m.sender];
            if (!respuestaCorrecta) return; // No hay acertijo activo

            if (text.toLowerCase() === respuestaCorrecta.toLowerCase()) {
                delete chat.acertijoActual[m.sender];
                return await conn.sendMessage(m.chat, { text: `🎉 ¡Correcto, ${m.pushName}!` });
            } else {
                return await conn.sendMessage(m.chat, { text: `❌ Incorrecto, ${m.pushName}. Intenta de nuevo.` });
            }
        }

        // Leer acertijos desde el JSON
        const filePath = path.join('src', 'games', 'acertijo.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        const acertijos = JSON.parse(data);

        // Elegir un acertijo aleatorio
        const randomIndex = Math.floor(Math.random() * acertijos.length);
        const acertijo = acertijos[randomIndex];

        // Guardar la respuesta del usuario
        chat.acertijoActual[m.sender] = acertijo.respuesta.toLowerCase();
        global.db.data.chats[m.chat] = chat;

        // Enviar el acertijo
        await conn.sendMessage(m.chat, { text: `🧩 *Acertijo:*\n${acertijo.pregunta}\n\nResponde con lo que creas correcto.` });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al enviar o verificar el acertijo.');
    }
};

handler.command = ['acertijo'];
handler.group = true;
handler.admin = false;
handler.rowner = false;

export default handler;
