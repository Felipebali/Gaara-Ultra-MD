// file: plugins/k-with-lid.js
// Requisitos: global.db.data debe existir (si no existe, el handler lo inicializa)
// Comandos: .k (kick), .lid add <num> [nombre], .lid remove <num>, .lid list

// ----------------- Helpers -----------------
const normalizeId = jid => String(jid || '')
  .replace(/\+/g, '')     // quitar +
  .replace(/\s+/g, '')    // quitar espacios
  .toLowerCase();

const ensureDb = () => {
  if (!global.db) global.db = { data: { lid: [], chats: {} } };
  if (!global.db.data) global.db.data = { lid: [], chats: {} };
  if (!Array.isArray(global.db.data.lid)) global.db.data.lid = []; // formato: [{ id: '5989...', name:'Feli', owner: true }]
};

const isNumberLike = s => /^[0-9]{5,}$/.test(String(s).replace(/\D/g, ''));

// ----------------- Handler .k (kick) -----------------
const kickHandler = async (m, { conn, isAdmin, isOwner }) => {
  ensureDb();
  const emoji = '🔪';

  // Permisos: owners siempre, sino admin del grupo
  if (!isOwner && !isAdmin) {
    return conn.reply(m.chat, '❌ Solo admins del grupo o dueños del bot pueden usar este comando.', m);
  }

  // detectar objetivo
  let user = m.mentionedJid?.[0] || m.quoted?.sender;
  if (!user) return conn.reply(m.chat, '📌 Debes mencionar o citar un mensaje para expulsar.', m);

  // normalizar
  const userNorm = normalizeId(user);
  const botNorm = normalizeId(conn.user?.jid || '');
  const groupInfo = await conn.groupMetadata(m.chat);
  const ownerGroupNorm = normalizeId(groupInfo.owner || m.chat.split`-`[0]);

  // Construir LID global y por chat (persistente)
  const globalLid = Array.isArray(global.db.data.lid)
    ? global.db.data.lid.map(x => normalizeId(x.id || x)) // soporta items [{id,name,owner}] o simples strings
    : [];

  const chatLid = (global.db.data.chats?.[m.chat]?.lid && Array.isArray(global.db.data.chats[m.chat].lid))
    ? global.db.data.chats[m.chat].lid.map(x => normalizeId(x.id || x))
    : [];

  // lista completa de protegidos (ids como '59898719147')
  const protectedIds = Array.from(new Set([
    botNorm.replace(/@s\.whatsapp\.net$/, ''),            // bot (sin sufijo)
    ownerGroupNorm.replace(/@s\.whatsapp\.net$/, ''),    // dueño del grupo (sin sufijo)
    ...globalLid,
    ...chatLid
  ]));

  // Buscar participante real en el grupo para obtener participant.jid (esto cubre menciones, respuestas, id interno)
  const participant = groupInfo.participants.find(p => normalizeId(p.jid) === userNorm) || {};
  const targetJid = normalizeId(participant.jid || user).replace(/@s\.whatsapp\.net$/, '');

  // Si está protegido -> bloquear
  const isProtected = protectedIds.some(p => targetJid.endsWith(p));
  if (isProtected) return conn.reply(m.chat, 'Es imposible eliminar a alguien protegido. 😎', m);

  // Si el objetivo es admin del grupo -> sólo owner puede expulsar
  const targetIsAdmin = !!participant.admin;
  if (targetIsAdmin && !isOwner) {
    return conn.reply(m.chat, '❌ No puedes expulsar a otro administrador. Solo los dueños del bot pueden hacerlo.', m);
  }

  // Intentar expulsar
  try {
    await conn.groupParticipantsUpdate(m.chat, [participant.jid || user], 'remove');
    try { await m.react(emoji); } catch (e) { /* ignore */ }
    // borrar el mensaje del comando para limpiar el chat (si tiene permisos)
    try { await conn.deleteMessage(m.chat, m.key); } catch (e) { /* ignore */ }
  } catch (err) {
    console.error('Error expulsando:', err);
    return conn.reply(m.chat, '❌ Ocurrió un error al intentar expulsar. Verifica que el bot sea administrador y tenga permisos.', m);
  }
};

kickHandler.help = ['k'];
kickHandler.tags = ['grupo'];
kickHandler.command = ['k','echar','hechar','sacar','ban'];
kickHandler.admin = true;        // meta-info: requiere admin (la lógica permite owner aunque no admin)
kickHandler.group = true;
kickHandler.register = true;
kickHandler.botAdmin = true;

// ----------------- Handler .lid add -----------------
const lidAddHandler = async (m, { conn, args, isOwner }) => {
  ensureDb();

  // Solo owners del bot pueden modificar la LID global
  if (!isOwner) return conn.reply(m.chat, '❌ Solo los dueños del bot pueden usar este comando.', m);

  if (!args || args.length === 0) return conn.reply(m.chat, 'Uso: .lid add <número> [nombre]\nEjemplo: .lid add 59898719147 Feli');

  const idRaw = args[0];
  const name = args.slice(1).join(' ') || idRaw;
  const idClean = normalizeId(idRaw).replace(/@s\.whatsapp\.net$/, '');

  if (!isNumberLike(idClean)) return conn.reply(m.chat, 'Número inválido. Poné sólo dígitos y código de país. Ej: 59898719147');

  // evitar duplicados
  global.db.data.lid = global.db.data.lid || [];
  const exists = global.db.data.lid.find(x => normalizeId(x.id || x) === idClean);
  if (exists) return conn.reply(m.chat, 'Ese número ya está en la LID.');

  // push
  global.db.data.lid.push({ id: idClean, name: name || idClean, owner: true });
  // (si usás un sistema que necesita guardar la DB a disco, hacelo después: e.g. writeFileSync)
  conn.reply(m.chat, `✅ Agregado a LID: ${idClean} (${name})`, m);
};

lidAddHandler.help = ['lid add'];
lidAddHandler.tags = ['owner'];
lidAddHandler.command = ['lid add','lidadd'];
lidAddHandler.owner = true;

// ----------------- Handler .lid remove -----------------
const lidRemoveHandler = async (m, { conn, args, isOwner }) => {
  ensureDb();
  if (!isOwner) return conn.reply(m.chat, '❌ Solo los dueños del bot pueden usar este comando.', m);
  if (!args || args.length === 0) return conn.reply(m.chat, 'Uso: .lid remove <número>\nEjemplo: .lid remove 59898719147');

  const idRaw = args[0];
  const idClean = normalizeId(idRaw).replace(/@s\.whatsapp\.net$/, '');

  global.db.data.lid = global.db.data.lid || [];
  const idx = global.db.data.lid.findIndex(x => normalizeId(x.id || x) === idClean);
  if (idx === -1) return conn.reply(m.chat, 'Ese número no está en la LID.');

  const removed = global.db.data.lid.splice(idx, 1)[0];
  conn.reply(m.chat, `✅ Removido de LID: ${idClean} (${removed.name || idClean})`, m);
};

lidRemoveHandler.help = ['lid remove'];
lidRemoveHandler.tags = ['owner'];
lidRemoveHandler.command = ['lid remove','lidremove'];
lidRemoveHandler.owner = true;

// ----------------- Handler .lid list -----------------
const lidListHandler = async (m, { conn, isOwner }) => {
  ensureDb();
  // permitimos que owners vean la lista; si querés que admins la vean también, sacá la condición
  if (!isOwner) return conn.reply(m.chat, '❌ Solo los dueños del bot pueden ver la LID global.', m);

  const arr = global.db.data.lid || [];
  if (arr.length === 0) return conn.reply(m.chat, 'La LID global está vacía.', m);

  let text = '📜 LID global:\n\n';
  arr.forEach((x, i) => {
    const id = normalizeId(x.id || x);
    const name = x.name || '—';
    const ownerFlag = x.owner ? ' (owner)' : '';
    text += `${i + 1}. ${id} — ${name}${ownerFlag}\n`;
  });
  conn.reply(m.chat, text, m);
};

lidListHandler.help = ['lid list'];
lidListHandler.tags = ['owner'];
lidListHandler.command = ['lid list','lidlist'];
lidListHandler.owner = true;

// ----------------- Exportar handlers -----------------
// Según tu loader de plugins, exportá como default un array o varios exports.
// Si tu loader espera export default handler, dividí en archivos. Aquí doy los exports individuales:

export {
  kickHandler as default, // si quieres que este archivo sea el handler de .k por defecto
  lidAddHandler,
  lidRemoveHandler,
  lidListHandler
};

// Si tu sistema requiere module.exports:
// module.exports = { kickHandler, lidAddHandler, lidRemoveHandler, lidListHandler };
