// plugins/menu-owner.js
let handler = async (m, { conn }) => {
    try {
        let menuText = `
╭━━━〔 ⚡ MENÚ DIVINO - DIOSES DEL OLIMPO 🏛️ 〕━━━⬣
┃ ❒ *Solo los dioses del Olimpo pueden ejecutar estos mandatos*
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ MANDATOS OLÍMPICOS 〕━━━⬣
┃ 🐾 .autoadmin - Zeus otorga poderes divinos a un mortal
┃ 🐾 .banuser <@user> - Hades destierra a un mortal al inframundo
┃ 🐾 .unbanuser <@user> - Atenea perdona a un mortal desterrado
┃ 🐾 .chetar - Ares concede habilidades de guerra divina
┃ 🐾 .deschetar - Hermes quita poderes a un mortal atrevido
┃ 🐾 .dsowner - Poseidón expulsa a un dios de su trono
┃ 🐾 .join <link> - Dionisio invita a un mortal a su festín
┃ 🐾 .restart - Helios reinicia el ciclo del cosmos (bot)
┃ 🐾 .exec <comando> - Apolo ejecuta un decreto sagrado
┃ 🐾 .exec2 <comando> - Artemisa ejecuta un decreto supremo
┃ 🐾 .setcmd - Hefesto configura un mandato divino
┃ 🐾 .setprefix - Hermes cambia el símbolo de los dioses
┃ 🐾 .update - Hestia renueva el reino divino
┃ 🐾 .resetuser <@user> - Cronos borra toda existencia de un mortal de los registros celestiales
╰━━━━━━━━━━━━━━━━━━━━⬣

> 🏛️ *Todos los mandatos son ejecutados por el Supremo FelixCat, dios principal del Olimpo* 🐾
        `;

        // Enviar mensaje SIN citar
        await conn.sendMessage(m.chat, { text: menuText });

    } catch (e) {
        console.error(e);
        await m.reply('✖️ Error al mostrar el menú divino.');
    }
}

handler.command = ['menuow'];
handler.owner = true;

export default handler;
