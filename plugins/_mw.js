// plugins/mw.js
// Menú privado .mw - Estilo Militar (serio) + Colores ANSI para consola
// Owners: +59898719147, +59896026646
// Comandos únicos distintos al menú owner normal
// No cita mensajes. No responde si no es owner.

const OWNERS = ['59898719147', '59896026646']; // Números de owners sin '+'

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
    const senderNumber = (m.sender || '').replace(/[^0-9]/g, '');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);

    // Bloqueo para no-owners con frases militares
    if (!ownerCheck) {
      const reprimandas = [
        "🚫 ACCESO NO AUTORIZADO — Retírate inmediatamente. Este sector es SOLO para comando.",
        "⚠️ USTED NO TIENE PERMISO — Interferir con órdenes es una falta grave. Retroceda.",
        "❌ INTENTO INVALIDO — Este menú no es para civiles. Vuelva cuando tenga autorización."
      ];
      const r = reprimandas[Math.floor(Math.random() * reprimandas.length)];
      return conn.sendMessage(m.chat, { text: r }, { quoted: null });
    }

    // --- Log en consola con colores ANSI
    console.log(ANSI.cyan + ANSI.bold + "=== ACCESO MW AUTORIZADO ===" + ANSI.reset);
    console.log(`${ANSI.green}Owner:${ANSI.reset} ${senderNumber}`);
    console.log(ANSI.yellow + "Mostrando menú militar privado..." + ANSI.reset);

    // --- Menú para WhatsApp
    const menu = `
┏━━━━━━━━━━━━━━━━━━━━━━━┓
┃  🪖  *COMANDO ELITE - MENÚ MW*  🪖
┃  ─────────────────────────────
┃  🔐 *Acceso:* Owners exclusivos
┃  👤 *Autorizado por:* Comando Elite
┃
┣━ 〔 ⚙️  SISTEMA TÁCTICO 〕━━━━
┃  • radar         - Escanea actividad de grupos
┃  • logins        - Muestra últimos inicios de sesión
┃  • shield        - Protege el bot de cambios externos
┃  • mode          - Cambia modo operativo del bot
┃
┣━ 〔 🔒  SEGURIDAD 〕━━━━━━━━━
┃  • spy @user           - Revisa actividad de un usuario
┃  • watchlist add @user - Agrega a lista de vigilancia
┃  • watchlist remove @  - Quita de vigilancia
┃  • trap @user          - Marca para seguimiento especial
┃
┣━ 〔 👑  CONTROL DE GRUPOS 〕━━━
┃  • lockdown         - Bloquea grupo para solo admins
┃  • fortify          - Refuerza permisos de admins
┃  • taghigh mensaje  - Menciona solo a admins
┃  • silentkick @user - Expulsa sin notificación
┃
┣━ 〔 🧾  HERRAMIENTAS DEV 〕━━━
┃  • fetch logs       - Extrae logs recientes
┃  • analyze db       - Revisa base de datos
┃  • simulate <comando> - Ejecuta comando en modo prueba
┃  • audit            - Revisa actividad de todos los chats
┗━━━━━━━━━━━━━━━━━━━━━━━┛

Comando Elite – Autorización nivel Omega
`.trim();

    await conn.sendMessage(m.chat, { text: menu }, { quoted: null });

  } catch (e) {
    console.error(ANSI.red + "Error en plugin .mw:" + ANSI.reset, e);
    try {
      await conn.sendMessage(m.chat, { text: "⚠️ Error al abrir el menú privado." }, { quoted: null });
    } catch {}
  }
};

handler.command = ['mw'];
handler.owner = true; // marca para frameworks que lo usan

export default handler;
