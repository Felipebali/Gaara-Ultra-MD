// plugins/menuj.js

let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false; // Por defecto activados

        let menuText = `╔═════════════════════╗
🎮  MINI-JUEGOS FELIXCAT 🐾
╚═════════════════════╝
Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}
────────────────────────────
`;

        if (gamesEnabled) {
            menuText += `
🎲 *Juegos Disponibles:*

🧠 *.math* → Operaciones matemáticas
✊✋✌️ *.ppt <@user>* → Piedra, papel o tijera
💃🕺 *.dance <@user>* → Bailar con amigo
🌍 *.bandera* → Adivina la bandera
😸 *.adivinanza* → Resuelve adivinanzas
🏛️ *.capital* → Adivina la capital de un país
🎯 *.trivia* → Preguntas de cultura general
✨ *.consejo* → Te da un consejo aleatorio
💭 *.pensar <pregunta>* → Bola mágica que responde tu pregunta
🔢 *.numero* → Genera un número aleatorio
👑 *.top10* → Top 10 divertidos del grupo
🍽️ *.plato* → Adivina la opción correcta
   🟢 Puede ser comida, objetos o personajes
────────────────────────────
`;
        } else {
            menuText += `⚠️ *Mini-juegos desactivados.*  
Menciona a un admin para activarlos 🔴
────────────────────────────
`;
        }

        menuText += `👑 *Powered by FelixCat 🐾*`;

        // Enviar solo el texto (sin imagen)
        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '✖️ Error al mostrar el menú de mini-juegos.', m);
    }
}

handler.command = ['menuj', 'mj'];
handler.group = true;

export default handler;
