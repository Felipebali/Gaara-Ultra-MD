// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false; // por defecto activados

        let menuText = `╭━━━━━━━━━━━━━━━〔 🎮 *MENÚ MINI-JUEGOS FELIXCAT* 🐾 〕━━━━━━━━━━━━━━━⬣
┃ Estado: ${gamesEnabled ? '🟢 *Activados*' : '🔴 *Desactivados*'}
╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣\n`;

        if (gamesEnabled) {
            menuText += `
🐾 *Math*           ➤ Realiza operaciones matemáticas 🧠
🐾 *Tic-Tac-Toe*    ➤ Juega Tic-Tac-Toe ✖️⭕
🐾 *Reiniciar TTT*  ➤ Reiniciar Tic-Tac-Toe 🔄
🐾 *Piedra, Papel o Tijera* ➤ .ppt <@user> ✊✋✌️
🐾 *Dance*          ➤ .dance <@user> 💃🕺
🐾 *Bandera*        ➤ Adivina la bandera 🌍
🐾 *Acertijo*       ➤ Resolver acertijos 🎁
🐾 *Ahorcado*       ➤ Adivina antes de perder 😵
🐾 *Adivinanza*     ➤ Resuelve adivinanzas 😸
`;
        } else {
            menuText += `⚠️ *Los mini-juegos están desactivados.*\nUsa .juegos para activarlos 🔴\n`;
        }

        menuText += `\n╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━⬣
> 👑 *Powered by FelixCat* 🐾`;

        await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de mini-juegos.');
    }
}

handler.command = ['menuj', 'mj'];
handler.group = true;

export default handler;
