// plugins/top10.js
let handler = async (m, { conn }) => {
    try {
        const chat = global.db.data.chats[m.chat] || {};

        // Verificar si los juegos están activados
        if (chat.games === false) {
            return await conn.sendMessage(m.chat, { text: '❌ Los mini-juegos están desactivados. Pide a un admin que los active.' });
        }

        // Obtener participantes del grupo
        const participants = m.isGroup ? m.participants : [m.sender];

        if (!participants || participants.length === 0) {
            return await conn.sendMessage(m.chat, { text: '❌ No hay participantes en el grupo.' });
        }

        // Categorías divertidas
        const categories = [
            '💖 Los más lindos',
            '😈 Los más traviesos',
            '🔊 Los más ruidosos',
            '💀 Los más épicos',
            '🔥 Los más atrevidos',
            '👑 Los más legendarios'
        ];

        // Elegir una categoría al azar
        const category = categories[Math.floor(Math.random() * categories.length)];

        // Mezclar aleatoriamente y tomar hasta 10
        const shuffled = participants.sort(() => 0.5 - Math.random());
        const top10 = shuffled.slice(0, 10);

        // Mensaje opcional
        const args = m.text.split(' ').slice(1);
        const msg = args.length ? args.join(' ') : '✨ ¡Mira quién está en el top! ✨';

        // Crear lista con estilo llamativo
        const listTop = top10
            .map((v, i) => `🩸 ${i + 1}. @${v.id.split('@')[0]} 🩸`)
            .join('\n') || '❌ No hay participantes.';

        // Texto final
        const text = `🩸🖤 *TOP 10 - ${category}* 🖤🩸
💌 Mensaje: ${msg}

${listTop}
🩸━━━━━━━━━━━━🩸`;

        // Enviar mensaje con menciones
        await conn.sendMessage(m.chat, {
            text,
            mentions: top10.map(v => v.id)
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { text: '❌ Ocurrió un error al generar el top 10.' });
    }
};

handler.help = ['top10 <mensaje opcional>'];
handler.tags = ['juego'];
handler.command = /^(top10|toplindos)$/i;
handler.group = true;

export default handler;
