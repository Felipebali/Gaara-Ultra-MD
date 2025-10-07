let handler = async (m, { conn, text }) => {
    // Verificar si los juegos están activados en este chat
    const chatSettings = global.db.data.chats[m.chat] || {};
    if (chatSettings.games === false) {
        return conn.sendMessage(m.chat, { text: '⚠️ Los juegos están desactivados en este chat. Usa .juegos para activarlos.' }, { quoted: m });
    }

    // Buscar la sala de TicTacToe en la que esté el usuario
    let room = Object.values(conn.game).find(
        room => room.id.startsWith('tictactoe') && [room.game.playerX, room.game.playerO].includes(m.sender)
    );

    if (!room) return conn.reply(m.chat, '❌ No estás en el juego de TicTacToe.', m);

    // Eliminar la sala
    delete conn.game[room.id];

    await conn.reply(m.chat, '✅ Se reinicia la sesión de *TicTacToe*.', m);
};

handler.help = ['delttt'];
handler.tags = ['game'];
handler.command = ['delttc', 'delttt', 'delxo','tictactoe'];
handler.group = true;
handler.register = true;

export default handler;
