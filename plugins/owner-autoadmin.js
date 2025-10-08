const handler = async (m, { conn, isAdmin, isROwner }) => {
  // Verifica si es owner
  const owners = global.owner.map(([num]) => num); // Usa la lista global de owners
  const sender = m.sender.replace(/[^0-9]/g, '');
  const isOwner = owners.some(num => sender.includes(num));

  if (!isOwner) {
    await m.react('❌');
    return conn.sendMessage(m.chat, { text: '🚫 No sos *owner*, boludo 😏' });
  }

  if (isAdmin) {
    return conn.sendMessage(m.chat, { text: '👑 *Tú ya sos admin, maestro.*' });
  }

  try {
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'promote');
    await m.react('✔️');
    await conn.sendMessage(m.chat, { text: '👑 *Listo, jefe. Ya sos admin 🥷.*' });
  } catch {
    await conn.sendMessage(m.chat, { text: '⚠️ Ocurrió un error al intentar darte admin.' });
  }
};

handler.tags = ['owner'];
handler.help = ['autoadmin'];
handler.command = ['autoadmin'];
handler.rowner = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
