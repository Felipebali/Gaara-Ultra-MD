// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false;

        let menuText = `╭━━━〔 🎮 MINI-JUEGOS FELIXCAT 🐾 〕━━━⬣\n`;
        menuText += `┃ Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}\n`;
        menuText += `╰━━━━━━━━━━━━━━━━━━━━━━━━⬣\n`;

        if (gamesEnabled) {
            menuText += `🐾 .math       🧠 Operaciones\n`;
            menuText += `🐾 .ttt        ✖️⭕ Tic-Tac-Toe\n`;
            menuText += `🐾 .delttt     🔄 Reiniciar Tic-Tac-Toe\n`;
            menuText += `🐾 .ppt <@user> ✊✋✌️ Piedra, papel o tijera\n`;
            menuText += `🐾 .dance <@user> 💃🕺 Bailar con amigo\n`;
            menuText += `🐾 .bandera    🌍 Adivina la bandera\n`;
            menuText += `🐾 .acertijo   🎁 Resolver acertijos\n`;
            menuText += `🐾 .ahorcado   😵 Adivina antes de perder\n`;
            menuText += `🐾 .adivinanza 😸 Resuelve adivinanzas\n`;
        } else {
            menuText += `⚠️ Mini-juegos desactivados. Usa .juegos para activarlos 🔴\n`;
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
