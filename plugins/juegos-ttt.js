// plugins/ttt.js
let handler = async (m, { conn, text }) => {
    // Verificar si los juegos están activados en este chat
    if (global.db.data.chats[m.chat]?.games === false) {
        return conn.reply(m.chat, '⚠️ Los juegos están desactivados en este chat.', m);
    }

    if (!conn.game) conn.game = {}; // inicializar objeto de juegos si no existe

    const id = 'tictactoe-' + m.chat;
    if (conn.game[id]) return conn.reply(m.chat, '⚠️ Ya hay una partida de TicTacToe activa en este chat.', m);

    let playerX = m.sender;
    let playerO;
    
    if (!m.mentionedJid || m.mentionedJid.length === 0) {
        return conn.reply(m.chat, '🚩 Debes mencionar a alguien para jugar TicTacToe con él.\nEjemplo: *.ttt @usuario*', m);
    }

    playerO = m.mentionedJid[0];

    // Crear tablero vacío
    const board = [
        ['⬜','⬜','⬜'],
        ['⬜','⬜','⬜'],
        ['⬜','⬜','⬜']
    ];

    conn.game[id] = {
        id,
        game: {
            board,
            playerX,
            playerO,
            turn: playerX,
            symbol: { [playerX]: '❌', [playerO]: '⭕' },
            moves: 0,
            winner: null
        }
    };

    // Mostrar tablero inicial
    const renderBoard = board.map(r => r.join(' ')).join('\n');
    await conn.reply(m.chat, `🎮 *TicTacToe*\n\nTurno de: @${playerX.split('@')[0]} (❌)\n\n${renderBoard}\n\nPara jugar, responde con la posición: fila,columna\nEjemplo: 1,1`, m, { mentions: [playerX, playerO] });
};

handler.before = async (m, { conn }) => {
    // Verificar si los juegos están activados en este chat
    if (global.db.data.chats[m.chat]?.games === false) return;

    if (!conn.game) return;
    const games = Object.values(conn.game).filter(r => r.id.startsWith('tictactoe') && [r.game.playerX, r.game.playerO].includes(m.sender));
    if (games.length === 0) return;

    const room = games[0];
    const game = room.game;

    if (!m.text.match(/^[1-3],[1-3]$/)) return; // Solo acepta formato fila,columna
    if (m.sender !== game.turn) return; // No es el turno del jugador

    const [row, col] = m.text.split(',').map(Number);
    if (game.board[row-1][col-1] !== '⬜') return conn.reply(m.chat, '⚠️ Esa casilla ya está ocupada.', m);

    game.board[row-1][col-1] = game.symbol[m.sender];
    game.moves += 1;

    // Verificar ganador
    const winner = checkWinner(game.board);
    let renderBoard = game.board.map(r => r.join(' ')).join('\n');

    if (winner) {
        await conn.reply(m.chat, `🎉 @${winner.split('@')[0]} ha ganado el TicTacToe!\n\n${renderBoard}`, m, { mentions: [winner] });
        delete conn.game[room.id];
        return;
    }

    if (game.moves >= 9) {
        await conn.reply(m.chat, `🤝 Empate!\n\n${renderBoard}`, m);
        delete conn.game[room.id];
        return;
    }

    // Cambiar turno
    game.turn = m.sender === game.playerX ? game.playerO : game.playerX;
    await conn.reply(m.chat, `Turno de: @${game.turn.split('@')[0]} (${game.symbol[game.turn]})\n\n${renderBoard}`, m, { mentions: [game.turn] });
};

// Función para verificar ganador
function checkWinner(board) {
    // Filas
    for (let row of board) if (row[0] !== '⬜' && row[0] === row[1] && row[1] === row[2]) return getPlayerBySymbol(row[0]);
    // Columnas
    for (let i = 0; i < 3; i++) if (board[0][i] !== '⬜' && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return getPlayerBySymbol(board[0][i]);
    // Diagonales
    if (board[0][0] !== '⬜' && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return getPlayerBySymbol(board[0][0]);
    if (board[0][2] !== '⬜' && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return getPlayerBySymbol(board[0][2]);
    return null;
}

// Obtener jugador según símbolo
function getPlayerBySymbol(symbol) {
    for (let game of Object.values(global.conn?.game || {})) {
        for (let key of [game.game.playerX, game.game.playerO]) {
            if (game.game.symbol[key] === symbol) return key;
        }
    }
    return null;
}

handler.help = ['ttt @usuario'];
handler.tags = ['game'];
handler.command = ['ttt'];
handler.group = true;
handler.register = true;

export default handler;
