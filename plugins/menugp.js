// plugins/menugp.js
export default {
    name: 'menugp',
    description: 'Menú de comandos de administración de grupo 🐾',
    group: true,
    all: async function (m, { conn }) {
        try {
            const menuText = `
╭━━━〔 📚 MENÚ GRUPO 𝗙𝗘𝗟𝗜𝗖𝗔𝗧 🐱 〕━━━⬣
┃ ❒ *Comandos para administración de grupos*
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🐾 PROMOVER / DEGRADAR 〕━━━⬣
┃ 🐱 .p <@user> - Promover a admin
┃ 🐱 .d <@user> - Degradar admin
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🔨 BAN / UNBAN CHAT 〕━━━⬣
┃ 🐱 .banchat - Banear grupo
┃ 🐱 .unbanchat - Desbanear grupo
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 ❌ ELIMINAR USUARIOS 〕━━━⬣
┃ 🐱 .k <@user> - Eliminar usuario del grupo
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 🚪 CERRAR / ABRIR GRUPO 〕━━━⬣
┃ 🐱 .g - Cerrar / Abrir grupo
╰━━━━━━━━━━━━━━━━━━━━⬣

╭━━━〔 📢 MENCIÓN GENERAL 〕━━━⬣
┃ 🐱 .tagall - Mencionar a todos los usuarios
┃ 🐱 .hidetag - Mención oculta
╰━━━━━━━━━━━━━━━━━━━━⬣

> 👑 Powered by FelixCat 🐾
`;

            await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });

        } catch (e) {
            console.error(e);
            conn.reply(m.chat, '✖️ Error al mostrar el menú de grupo.', m);
        }
    }
};

export const handler = {
    command: ['menugp'], // comando para activar el menú
    group: true,         // solo en grupos
    admin: true          // solo admins pueden usarlo
};
