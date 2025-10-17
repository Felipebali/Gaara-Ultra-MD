// plugins/ruletaban.js
let handler = async (m, { conn, isAdmin }) => {
    try {
        // 1️⃣ Verificar si es grupo
        if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.');

        // 2️⃣ Obtener metadata del grupo
        const groupMetadata = await conn.groupMetadata(m.chat);
        const participants = groupMetadata.participants;

        // 3️⃣ Revisar si el bot es admin
        const botNumber = conn.user?.id?.split(':')[0] + '@s.whatsapp.net';
        const botIsAdmin = participants.some(p => p.id === botNumber && p.admin);
        if (!botIsAdmin) return m.reply('❌ Necesito ser ADMIN para expulsar gente.');

        // 4️⃣ Verificar que el que ejecuta sea admin
        if (!isAdmin) return m.reply('❌ Solo administradores pueden usar este comando.');

        // 5️⃣ Filtrar participantes válidos (no admin, no bot)
        let victimas = participants.filter(p => !p.admin && p.id !== botNumber);
        if (victimas.length === 0) return m.reply('😐 No hay víctimas disponibles (todos son admins o bots).');

        // 6️⃣ Elegir al azar
        let elegido = victimas[Math.floor(Math.random() * victimas.length)];
        let user = elegido.id;

        // 7️⃣ Mensaje previo de "girando la ruleta"
        await m.reply('🎯 Girando la ruleta... 🔫');
        await delay(1500); // efecto de suspenso

        // 8️⃣ Expulsar del grupo
        try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove');

            // 9️⃣ Mensaje de despedida
            await conn.sendMessage(m.chat, {
                text: `💀 La mala suerte eligió a @${user.split('@')[0]}...\n¡Fuera del grupo! 🚪😂`,
                mentions: [user]
            });

        } catch {
            // Si no se puede expulsar
            await conn.sendMessage(m.chat, {
                text: `⚠️ No pude expulsar a @${user.split('@')[0]} (posible protección o bloqueo de WhatsApp)`,
                mentions: [user]
            });
        }

    } catch (e) {
        console.error(e);
        m.reply('⚠️ Ocurrió un error ejecutando la ruleta ban.');
    }
};

// Configuración del comando
handler.command = ['ruletaban', 'rban', 'ruletakick'];
handler.group = true;
handler.admin = true;

export default handler;

// Función delay para suspenso
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
