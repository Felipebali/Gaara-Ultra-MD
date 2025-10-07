// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false;

        let menuText = `🎮 *MINI-JUEGOS FELIXCAT* 🐾 | Estado: ${gamesEnabled ? '🟢' : '🔴'}\n`;

        if (gamesEnabled) {
            menuText += `🐾 .math 🧠 | .ttt ✖️⭕ | .delttt 🔄 | .ppt ✊✋✌️ | .dance 💃🕺 | .bandera 🌍 | .acertijo 🎁 | .ahorcado 😵 | .adivinanza 😸`;
        } else {
            menuText += `⚠️ Mini-juegos desactivados. Usa .juegos para activarlos 🔴`;
        }

        menuText += `\n👑 Powered by FelixCat 🐾`;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de mini-juegos.');
    }
}

handler.command = ['menuj','mj'];
handler.group = true;

export default handler;
