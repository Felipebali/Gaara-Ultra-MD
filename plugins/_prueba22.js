// plugins/shield.js
// .shield — Detector de INTEGRIDAD DEL GRUPO (no analiza mensajes)
// Owners: +59898719147, +59896026646
// - Informa: nombre, descripción, foto (si existe), miembros, admins, permisos críticos
// - Señala admins que NO están en la lista de owners (posible vulnerabilidad)
// - Solo owners pueden ejecutarlo. No modifica nada; solo informa.

const OWNERS = ['59898719147','59896026646'];

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m"
};

let handler = async (m, { conn, isOwner }) => {
  try {
    const sender = (m.sender||'').replace(/[^0-9]/g,'');
    const ok = isOwner || OWNERS.includes(sender);
    if (!ok) return conn.sendMessage(m.chat, { text: "🚫 ACCESO DENEGADO — Solo owners." }, { quoted: null });
    if (!m.isGroup) return conn.sendMessage(m.chat, { text: "❗ .shield sólo funciona en grupos." }, { quoted: null });

    // Obtener metadata del grupo
    let meta;
    try {
      meta = await conn.groupMetadata(m.chat);
    } catch (e) {
      console.error(ANSI.red + "shield: error fetching metadata" + ANSI.reset, e);
      return conn.sendMessage(m.chat, { text: "⚠️ No pude obtener metadata del grupo." }, { quoted: null });
    }

    const subject = meta.subject || '(sin nombre)';
    const desc = (meta.desc && meta.desc.toString && meta.desc.toString()) || meta.desc || '(sin descripción)';
    const owner = (meta.owner || meta.creator || '').replace(/[^0-9]/g,'') || null;

    // Intentar obtener foto del grupo (varias APIs usan distintos métodos)
    let photo;
    try {
      if (conn.profilePictureUrl) {
        photo = await conn.profilePictureUrl(m.chat).catch(()=>null);
      } else if (conn.getProfilePicture) {
        photo = await conn.getProfilePicture(m.chat).catch(()=>null);
      } else {
        photo = null;
      }
    } catch(e){
      photo = null;
    }
    const photoLabel = photo ? "✅ Foto de grupo disponible" : "— Sin foto de grupo";

    // Participantes y admins
    const participants = meta.participants || [];
    const totalMembers = participants.length;
    const admins = participants.filter(p => (p.admin === 'admin' || p.admin === 'superadmin' || p.isAdmin || p.isSuperAdmin || p.admin)).map(p => (p.id || p.jid || p).toString());
    const adminCount = admins.length;

    // Permisos críticos (varían entre implementaciones: announce/restrict/onlyAdmins can send/change)
    // Comprobamos varios campos comunes y damos un diagnóstico conservador.
    const announce = typeof meta.announce !== 'undefined' ? !!meta.announce : (typeof meta.announce === 'undefined' ? null : !!meta.announce);
    const restrict = typeof meta.restrict !== 'undefined' ? !!meta.restrict : null;
    // Algunas implementaciones usan `msgSend` / `onlyAdmins` / `groupSetting` - comprobamos de forma defensiva:
    const onlyAdminsCanSend = (announce === true); // si announce==true en muchas libs => solo admins envían mensajes
    const onlyAdminsCanEditInfo = (restrict === true); // si restrict==true => solo admins pueden cambiar info

    // Detectar admins que no estén en OWNERS (posible riesgo)
    const unsafeAdmins = admins
      .map(a => a.replace(/[^0-9]/g,''))
      .filter(id => id && !OWNERS.includes(id));

    // Preparar listado legible de admins (nombres cuando sea posible)
    const adminNames = [];
    for (let a of admins.slice(0,20)) {
      const clean = (a||'').replace(/[^0-9]/g,'');
      try {
        const n = await (conn.getName ? conn.getName(clean) : Promise.resolve(clean));
        adminNames.push(`${n} (${clean})`);
      } catch {
        adminNames.push(clean);
      }
    }

    // Preparar reporte
    const lines = [];
    lines.push("🛡️ *SHIELD — INTEGRIDAD DEL GRUPO* 🛡️");
    lines.push(`🏷️ Nombre: ${subject}`);
    lines.push(`📝 Descripción: ${desc}`);
    lines.push(`${photoLabel}`);
    lines.push("");
    lines.push(`👥 Miembros totales: ${totalMembers}`);
    lines.push(`⭐ Admins detectados: ${adminCount}`);
    lines.push(adminNames.length ? adminNames.join("\n") : "• (sin admins listados)");
    lines.push("");
    lines.push("🔐 Permisos críticos (diagnóstico):");
    lines.push(`• Solo admins pueden enviar mensajes: ${onlyAdminsCanSend ? 'Sí' : 'No / Indeterminado'}`);
    lines.push(`• Solo admins pueden cambiar info del grupo: ${onlyAdminsCanEditInfo ? 'Sí' : 'No / Indeterminado'}`);
    if (owner) lines.push(`• Owner del grupo: ${owner}`);
    lines.push("");

    if (unsafeAdmins.length) {
      // obtener nombres para los admins no autorizados (máx 8)
      const unsafeNames = [];
      for (let i = 0; i < Math.min(unsafeAdmins.length, 8); i++) {
        const id = unsafeAdmins[i];
        try { unsafeNames.push(await conn.getName(id)); } catch { unsafeNames.push(id); }
      }
      lines.push("⚠️ Vulnerabilidad detectada: Admins NO autorizados");
      lines.push(unsafeNames.join("\n"));
      lines.push("");
      lines.push("Recomendación: revisar permisos de esos admins y confirmar su autorización.");
    } else {
      lines.push("✅ No se detectaron admins fuera de la lista de owners (revisión rápida).");
    }

    lines.push("");
    lines.push("📝 Nota: este comando *NO* realiza cambios. Solo informa la configuración actual.");
    lines.push("🔎 Ejecutado por: owner (modo sigilo)");

    // Log en consola con ANSI
    console.log(ANSI.cyan + ANSI.bold + "=== SHIELD — INTEGRIDAD EJECUTADA ===" + ANSI.reset);
    console.log(ANSI.yellow + "Grupo:" + ANSI.reset, subject);
    console.log(ANSI.green + "Admins (muestra parcial):" + ANSI.reset, adminNames.slice(0,8));

    await conn.sendMessage(m.chat, { text: lines.join("\n") }, { quoted: null });

  } catch (err) {
    console.error(ANSI.red + "Error plugin .shield:" + ANSI.reset, err);
    try { await conn.sendMessage(m.chat, { text: "⚠️ Error ejecutando .shield." }, { quoted: null }); } catch {}
  }
};

handler.command = ['shield'];
handler.owner = true;

export default handler;
