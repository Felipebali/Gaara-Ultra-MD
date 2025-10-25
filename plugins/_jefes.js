const ownerNumbers = ['59898719147@s.whatsapp.net', '59896026646@s.whatsapp.net']; // Dueños del bot

const handler = async (m, { conn, participants }) => {
  if (!m.isGroup) return m.reply('❗ Este comando solo funciona en grupos.');

  const admins = participants.filter(p => p.admin);
  const ownersInGroup = participants.filter(p => ownerNumbers.includes(p.id));
  const otherAdmins = admins.filter(a => !ownerNumbers.includes(a.id));

  // Rangos personalizados para dueños
  const ownerRanks = {
    '59898719147@s.whatsapp.net': 'Comandante Supremo',
    '59896026646@s.whatsapp.net': 'Mariscal General'
  };

  // Rango para admins normales
  const adminRanks = ['Coronel', 'Teniente', 'Sargento', 'Capitán', 'Mayor'];

  // Dueños con rango personalizado y mención
  const ownerMentions = ownersInGroup.map(o => `👑 @${o.id.split('@')[0]} (${ownerRanks[o.id]})`);

  // Admins con rango cíclico
  const adminMentions = otherAdmins.map((a, i) => `${adminRanks[i % adminRanks.length]} @${a.id.split('@')[0]}`);

  // Frases militares grotescas
  const frases = [
    '💣 Todos los mensajes deben alinearse o enfrentarán fuego de artillería.',
    '🪖 Cada miembro desobediente será castigado con fusilamiento digital.',
    '🔥 Que tiemble el grupo: los generales controlan cada bit.',
    '☠️ Las sanciones caen con precisión quirúrgica sobre los rebeldes.',
    '⚡ Aquellos que desafíen al Comandante conocerán el horror de la disciplina.',
    '💥 Toda insubordinación será eliminada sin piedad.',
    '🛡️ La autoridad absoluta está por encima de cualquier miembro.',
    '🔫 Cada palabra fuera de lugar será registrada y castigada.'
  ];
  const fraseAleatoria = frases[Math.floor(Math.random() * frases.length)];

  let texto = `👑 *JEFES SUPREMOS DEL GRUPO* 👑\n\n`;

  if (ownersInGroup.length > 0) {
    texto += `💫 *COMANDANTES SUPREMOS:*\n`;
    texto += ownerMentions.join('\n');
    texto += `\n\n"${fraseAleatoria}"\n\n`;
  }

  texto += `⚡ *ADMINISTRADORES DEL GRUPO:*\n`;
  texto += adminMentions.join('\n') || 'Ninguno';
  texto += `\n\n⚠️ *Respeten a los jefes o sufrirán las consecuencias de la disciplina militar.*`;

  await conn.sendMessage(m.chat, {
    text: texto,
    mentions: [...ownersInGroup.map(o => o.id), ...otherAdmins.map(a => a.id)]
  });
};

handler.command = ['jefes'];
handler.tags = ['group'];
handler.help = ['jefes'];
handler.group = true;

export default handler;
