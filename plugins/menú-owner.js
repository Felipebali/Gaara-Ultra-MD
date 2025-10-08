// plugins/menu-owner.js
let handler = async (m, { conn }) => {
    try {
        let menuText = `
          ╭━━━〔 👑 DIOSES DEL OLIMPO 🏛️ 〕━━━╮
          │  *Comandos exclusivos de los dioses*  │
          ╰━━━━━━━━━━━━━━━━━━━━━━━━━━━━╯

          ⚡ Zeus      - .autoadmin       ⚡ Poder absoluto
          💀 Hades     - .banuser <@user> 💀 Destierra al inframundo
          🕊️ Atenea    - .unbanuser <@user> 🕊️ Perdón divino
          ⚔️ Ares      - .chetar          ⚔️ Habilidad de guerra
          🌀 Hermes    - .deschetar       🌀 Quita poderes
          🌊 Poseidón  - .dsowner         🌊 Expulsa un dios
          🍷 Dionisio  - .join <link>     🍷 Invita al festín
          ☀️ Helios    - .restart         ☀️ Reinicia el cosmos
          🎯 Apolo     - .exec <comando>  🎯 Decreto divino
          🏹 Artemisa  - .exec2 <comando> 🏹 Decreto supremo
          🔨 Hefesto   - .setcmd          🔨 Configura mandato
          🌀 Hermes    - .setprefix       🌀 Cambia símbolo
          🔥 Hestia    - .update          🔥 Renovar reino
          ⏳ Cronos    - .resetuser <@user> ⏳ Borra existencia

          > ⚡ FelixCat, dios supremo del Olimpo
        `;

        // Enviar mensaje SIN citar
        await conn.sendMessage(m.chat, { text: menuText });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú de dioses.');
    }
}

handler.command = ['menuow'];
handler.owner = true;

export default handler;
