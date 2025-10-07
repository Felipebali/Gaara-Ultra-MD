// plugins/menuj.js
let handler = async (m, { conn }) => {
    try {
        const chatSettings = global.db.data.chats[m.chat] || {};
        const gamesEnabled = chatSettings.games !== false; // por defecto activados

        let menuText = `
╭━━━〔 🎮 MENÚ 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐾 〕━━━⬣
┃ ❒ *Diviértete con estos mini-juegos* 😸
┃ ❒ Estado: ${gamesEnabled ? '🟢 Activados' : '🔴 Desactivados'}
╰━━━━━━━━━━━━━━━━━━━━⬣
`;

        if (gamesEnabled) {
            menuText += `
╭━━━〔 🧮 MATEMÁTICAS 〕━━━⬣
┃ 🐾 .math - Resuelve operaciones matemáticas 🧠
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ❌ TIC-TAC-TOE 〕━━━⬣
┃ 🐾 .ttt - Juega al clásico tres en línea ✖️⭕
┃ 🐾 .delttt - Reinicia la sesión de TicTacToe 🔄
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ✋ PIEDRA, PAPEL O TIJERA 〕━━━⬣
┃ 🐾 .ppt - Desafía a otro jugador ✊✋✌️
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 💃 DANCE / BAILA 〕━━━⬣
┃ 🐾 .dance <@user> - Retar a un amigo a bailar 💃🕺
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🚩 BANDERAS 〕━━━⬣
┃ 🐾 .bandera - Adivina la bandera del país 🌍
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ❓ ACERTIJOS 〕━━━⬣
┃ 🐾 .acertijo - Resuelve y gana 🎁
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔤 AHORCADO 〕━━━⬣
┃ 🐾 .ahorcado - Adivina antes de perder 😵
╰━━━━━━━━━━━━━━━━━━━━⬣
`;
        } else {
            menuText += `\n╭━━━〔 ⚠️ Los juegos están desactivados 🔴 〕━━━⬣\n`;
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
