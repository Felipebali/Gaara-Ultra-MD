// plugins/menuowner.js
export default {
    name: 'menuowner',
    description: 'Menú de comandos exclusivos del Owner 🐱',
    group: false,
    all: async function (m, { conn }) {
        try {
            const menuText = `
╭━━━〔 👑 MENÚ OWNER 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐱 〕━━━⬣
┃ ❒ *Comandos exclusivos del dueño*
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🐾 ADMIN AUTOMÁTICO 〕━━━⬣
┃ 🐱 .autoadmin - Activar autoadmin
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔨 BAN / UNBAN 〕━━━⬣
┃ 🐱 .banuser <@user> - Banear usuario
┃ 🐱 .unbanuser <@user> - Desbanear usuario
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚡ CHEATS 〕━━━⬣
┃ 🐱 .chetar <@user> - Dar privilegios extra
┃ 🐱 .deschetar <@user> - Quitar privilegios
┃ 🐱 .dsowner <@user> - Desactivar dueño temporal
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🌐 RED / BOT 〕━━━⬣
┃ 🐱 .join <link> - Unirse a grupo
┃ 🐱 .restart - Reiniciar bot
┃ 🐱 .exec <código> - Ejecutar JS
┃ 🐱 .exec2 <código> - Ejecutar JS avanzado
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ⚙ CONFIGURACIÓN 〕━━━⬣
┃ 🐱 .setcmd <comando> - Configurar comando
┃ 🐱 .setprefix <prefijo> - Cambiar prefijo
┃ 🐱 .update - Actualizar bot
╰━━━━━━━━━━━━━━━━━━━━⬣

> 👑 Powered by FelixCat 🐾
`;

            await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, '✖️ Error al mostrar el menú Owner.', m);
        }
    }
};

export const handler = {
    command: ['menuow'], // comando para activar el menú
    owner: true // solo el owner puede usarlo
};
