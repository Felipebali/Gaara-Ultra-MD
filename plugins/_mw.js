// plugins/mw.js
// Menú privado .mw - Estilo Militar compacto + Colores ANSI
// Owners: +59898719147, +59896026646
// Comandos únicos distintos al menú owner normal

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
    const senderNumber = (m.sender||'').replace(/[^0-9]/g,'');
    const ownerCheck = isOwner || OWNERS.includes(senderNumber);

    if(!ownerCheck){
      const reprimandas=[
        "🚫 ACCESO NO AUTORIZADO — Retírate inmediatamente.",
        "⚠️ Sin permiso — Retrocede.",
        "❌ Menú no disponible para civiles."
      ];
      return conn.sendMessage(m.chat,{text:reprimandas[Math.floor(Math.random()*reprimandas.length)]},{quoted:null});
    }

    console.log(ANSI.cyan+ANSI.bold+"=== ACCESO MW AUTORIZADO ==="+ANSI.reset);
    console.log(`${ANSI.green}Owner:${ANSI.reset} ${senderNumber}`);
    console.log(ANSI.yellow+"Mostrando menú militar privado..."+ANSI.reset);

    const menu = `
🪖 *COMANDO ELITE - MENÚ MW* 🪖
🔐 Acceso: Owners exclusivos
👤 Autorizado por: Comando Elite

⚙️ SISTEMA TÁCTICO
• radar         - Escanea actividad
• spy @user     - Revisar actividad
• shield        - Protege bot
• mode          - Cambia modo

🔒 SEGURIDAD
• watchlist add @user - Agregar vigilancia
• watchlist remove @  - Quitar vigilancia
• trap @user          - Seguimiento especial

👑 CONTROL DE GRUPOS
• lockdown         - Bloquea grupo
• fortify          - Refuerza permisos
• taghigh mensaje  - Menciona admins
• silentkick @user - Expulsa sin aviso

🧾 HERRAMIENTAS DEV
• fetch logs       - Extrae logs
• analyze db       - Revisa DB
• simulate <cmd>   - Modo prueba
• audit            - Revisa actividad

Comando Elite – Autorización nivel Omega
`.trim();

    await conn.sendMessage(m.chat,{text:menu},{quoted:null});

  } catch(e){
    console.error(ANSI.red+"Error en plugin .mw:"+ANSI.reset,e);
    try{await conn.sendMessage(m.chat,{text:"⚠️ Error al abrir el menú privado."},{quoted:null});}catch{}
  }
};

handler.command=['mw'];
handler.owner=true;

export default handler;
