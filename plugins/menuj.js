// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false; // Por defecto activados

        let menuText = `╭━━━〔 🎮 MINI-JUEGOS FELIXCAT 🐾 〕━━━⬣
┃ Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}
╰━━━━━━━━━━━━━━━━━━━━━━━━⬣
`;

        if (gamesEnabled) {
            menuText += `
🎲 Juegos Disponibles:

🧠 .math           → Operaciones matemáticas
✖️⭕ .ttt           → Tic-Tac-Toe
🔄 .delttt         → Reiniciar Tic-Tac-Toe
✊✋✌️ .ppt <@user>  → Piedra, papel o tijera
💃🕺 .dance <@user> → Bailar con amigo
🌍 .bandera        → Adivina la bandera
🎁 .acertijo       → Resolver acertijos
😵 .ahorcado       → Adivina antes de perder
😸 .adivinanza     → Resuelve adivinanzas
🏛️ .capital       → Adivina la capital de un país
`;
        } else {
            menuText += `⚠️ Mini-juegos desactivados. Usa .juegos para activarlos 🔴\n`;
        }

        menuText += `\n👑 Powered by FelixCat 🐾`;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error(e);
        await conn.reply(m.chat, '✖️ Error al mostrar el menú de mini-juegos.');
    }
}

handler.command = ['menuj', 'mj'];
handler.group = true;

export default handler;
