// plugins/shield.js
// .shield — Detector de INTEGRIDAD DEL GRUPO definitivo
// Owners: +59898719147, +59896026646

const OWNERS = ['59898719147','59896026646'];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

// Función segura para obtener nombres
async function getNameSafe(conn, id) {
  try {
    if (conn.getName) {
      const n = await conn.getName(id);
      return n || "Desconocido";
    }
    if (conn.contacts && conn.contacts[id]) return conn.contacts[id].name || "Desconocido";
    return "Desconocido";
  } catch {
    return "Desconocido";
  }
}

// Función para validar si un admin es owner (comparando últimos dígitos)
function isOwnerAdmin(adminId) {
  const clean = (adminId||'').replace(/[^0-9]/g,'');
  return OWNERS.some(o => clean.endsWith(o));
}

let handler = async (m, { conn, isOwner }) => {
  try {
    const sender = (m.sender||'').replace(/[^0-9]/g,'');
    if (!(isOwner || OWNERS.includes(sender))) {
      return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    }
    if (!m.isGroup) {
      return conn.sendMessage(m.chat, { text: "❗ .shield sólo funciona en grupos." }, { quoted: null });
    }

    const meta = await conn.groupMetadata(m.chat);
    const subject = meta.subject || '(sin nombre)';
    const desc = meta.desc || '(sin descripción)';

    // Foto del grupo
    let photoLabel = "— Sin foto de grupo";
    try {
      const photo = conn.profilePictureUrl ? await conn.profilePictureUrl(m.chat).catch(()=>null) : null;
      if (photo) photoLabel = "✅ Foto de grupo disponible";
    } catch{}

    const participants = meta.participants || [];
    const totalMembers = participants.length;

    // Admins
    const admins = participants.filter(p => (p.admin || p.isAdmin || p.isSuperAdmin)).map(p => (p.id || p.jid || null)).filter(Boolean);

    // Listado de admins con nombres
    const adminNames = [];
    for (let a of admins) {
      const name = await getNameSafe(conn, a);
      adminNames.push(name);
    }

    // Detectar admins NO autorizados (fuera de OWNERS)
    const unsafeAdmins = admins.filter(a => !isOwnerAdmin(a));
    const unsafeNames = [];
    for (let a of unsafeAdmins) {
      const name = await getNameSafe(conn, a);
      unsafeNames.push(name);
    }

    // Preparar reporte
    const report = [];
    report.push("🛡️ *SHIELD — INTEGRIDAD DEL GRUPO* 🛡️");
    report.push(`🏷️ Nombre: ${subject}`);
    report.push(`📝 Descripción: ${desc}`);
    report.push(photoLabel);
    report.push("");
    report.push(`👥 Miembros totales: ${totalMembers}`);
    report.push(`⭐ Admins detectados: ${adminNames.length}`);
    report.push(adminNames.length ? adminNames.join("\n") : "• (sin admins listados)");
    report.push("");
    report.push("🔐 Permisos críticos (diagnóstico):");
    report.push("• Solo admins pueden enviar mensajes: Desconocido");
    report.push("• Solo admins pueden cambiar info del grupo: Desconocido");
    if (meta.owner) report.push(`• Owner del grupo: ${await getNameSafe(conn, meta.owner)}`);
    report.push("");

    if (unsafeNames.length) {
      report.push("⚠️ Vulnerabilidad detectada: Admins NO autorizados");
      report.push(unsafeNames.join("\n"));
      report.push("");
      report.push("Recomendación: revisar permisos de esos admins y confirmar su autorización.");
    } else {
      report.push("✅ No se detectaron admins fuera de la lista de owners (revisión rápida).");
    }

    report.push("");
    report.push("📝 Nota: este comando *NO* realiza cambios. Solo informa la configuración actual.");
    report.push("🔎 Ejecutado por: owner (modo sigilo)");

    // Consola
    console.log(ANSI.cyan+ANSI.bold+"=== SHIELD — INTEGRIDAD EJECUTADA ==="+ANSI.reset);
    console.log(ANSI.yellow+"Grupo:"+ANSI.reset, subject);
    console.log(ANSI.green+"Admins:"+ANSI.reset, adminNames.join(", "));

    await conn.sendMessage(m.chat, { text: report.join("\n") }, { quoted: null });

  } catch (err) {
    console.error(ANSI.red+"Error plugin .shield:"+ANSI.reset, err);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .shield." }, { quoted: null }); } catch {}
  }
};

handler.command = ['shield'];
handler.owner = true;

export default handler;
