const handler = async (m, { conn, participants, args }) => {
  try {
    // Tomamos máximo 10 participantes del grupo (aleatorio)
    const shuffled = participants.sort(() => 0.5 - Math.random());
    const top10 = shuffled.slice(0, 10);

    // Lista estilo divertido
    const listTop = top10
      .map((v, i) => `💖 ${i + 1}. @${v.id.split('@')[0]}`)
      .join('\n') || '❌ No hay participantes.';

    // Mensaje opcional
    const msg = args.length ? args.join(' ') : '✨ ¡Los más lindos del grupo! ✨';

    // Texto final con estilo
    const text = `🌟 *TOP 10 LINDOS* 🌟
💌 Mensaje: ${msg}

${listTop}
🌈━━━━━━━━━━━━🌈`;

    // Enviar mensaje con menciones de los seleccionados
    await conn.sendMessage(m.chat, {
      text,
      mentions: top10.map(v => v.id)
    });

  } catch (e) {
    console.error(e);
    m.reply('❌ Ocurrió un error al generar el top 10.');
  }
};

handler.help = ['top10 <mensaje opcional>'];
handler.tags = ['juego'];
handler.command = /^(top10|toplindos)$/i;
handler.group = true;

export default handler;
