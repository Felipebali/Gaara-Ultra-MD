let handler = async (m, { conn, args }) => {
  if (!m.isGroup) return conn.reply(m.chat, '❌ Este comando solo funciona en grupos.', m);

  // Usuario reportado (respuesta o mención)
  let target = (m.quoted && m.quoted.sender) || (m.mentionedJid && m.mentionedJid[0]);  
  if (!target) return conn.reply(m.chat, 
    '⚠️ Debes responder o mencionar al usuario que deseas reportar.\n\nEjemplo:\n.report @usuario insultos\nO responde a su mensaje con:\n.report spam', m
  );  

  // Motivo del reporte
  const reason = args.length ? args.join(' ') : 'Sin motivo especificado';  

  // Obtener metadatos del grupo
  let metadata = {};
  try { 
    metadata = await conn.groupMetadata(m.chat); 
  } catch (e) { 
    metadata = { participants: [] }; 
  }  

  // Filtrar administradores
  const admins = (metadata.participants || []).filter(p => p.admin).map(p => p.id);  
  if (admins.length === 0) return conn.reply(m.chat, '⚠️ No se encontraron administradores en este grupo.', m);  

  // Nombres elegantes
  const targetName = conn.getName(target);
  const reporterName = conn.getName(m.sender);

  // Mensaje de reporte
  const text = `🚨 *REPORTE EN EL GRUPO*\n\n` +
               `👤 *Reportado:* @${target.split('@')[0]} (${targetName})\n` +
               `🙋 *Reportado por:* @${m.sender.split('@')[0]} (${reporterName})\n` +
               `📝 *Motivo:* ${reason}\n\n` +
               `⚠️ *Atención administradores:* ${admins.map(a => '@' + a.split('@')[0]).join(', ')}`;

  // Menciones
  const mentions = [target, m.sender, ...admins];  

  // Enviar reporte
  await conn.sendMessage(m.chat, { text, mentions });
};

handler.help = ['report', 'reportar'];
handler.tags = ['group'];
handler.command = ['report', 'reportar'];
handler.group = true;
handler.register = true;

export default handler;
