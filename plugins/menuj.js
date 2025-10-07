// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false; // por defecto activados

        let menuText = `╭━━━〔 🎮 MENÚ 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐾 〕━━━⬣
┃ Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}
╰━━━━━━━━━━━━━━━━━━━━⬣\n`;

        if (gamesEnabled) {
            menuText += `
🐾 .math       - Operaciones matemáticas 🧠
🐾 .ttt        - Tic-Tac-Toe ✖️⭕
🐾 .delttt     - Reiniciar Tic-Tac-Toe 🔄
🐾 .ppt <@user> - Piedra, papel o tijera ✊✋✌️
🐾 .dance <@user> - Retar a un amigo a bailar🕺
🐾 .bandera    - Adivina la bandera 🌍
🐾 .acertijo   - Resolver acertijos 🎁
🐾 .ahorcado   - Adivina antes de perder 😵
🐾 .adivinanza - Resuelve adivinanzas 😸
`;
        } else {
            menuText += `⚠️ Los mini-juegos están desactivados. Usa .juegos para activarlos 🔴\n`;
        }

        menuText += `\n> 👑 Powered by FelixCat 🐾`;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de mini-juegos.');
    }
}

handler.command = ['menuj', 'mj'];
handler.group = true;

export default handler;
