// plugins/detector.js

let handler = async (m, { conn, isAdmin, isOwner }) => {
    let chat = global.db.data.chats[m.chat];
    
    // Inicializar detector si no existe
    if (chat.detector === undefined) chat.detector = true;

    // Toggle con el comando
    chat.detector = !chat.detector;

    await conn.sendMessage(m.chat, { 
        text: `⚡️ El detector de cambios en el grupo se ha *${chat.detector ? 'activado' : 'desactivado'}*.` 
    });
};

handler.help = ['detector'];
handler.tags = ['admin', 'grupo'];
handler.command = ['detector'];

export default handler;

// ------------------------------
// Función global para escuchar cambios en el grupo
export async function groupUpdate({ conn, update }) {
    try {
        let chat = global.db.data.chats[update.id] || {};
        if (!chat.detector) return; // Detector desactivado

        switch (update.action) {
            case 'add': // Nuevo participante
                await conn.sendMessage(update.id, { 
                    text: `🎉 Bienvenido/a @${update.participants[0].split('@')[0]} al grupo!`,
                    mentions: update.participants
                });
                break;
            case 'remove': // Usuario eliminado
                await conn.sendMessage(update.id, { 
                    text: `👋 @${update.participants[0].split('@')[0]} salió del grupo.`,
                    mentions: update.participants
                });
                break;
            case 'promote': // Nuevo admin
                await conn.sendMessage(update.id, { 
                    text: `🛡️ @${update.participants[0].split('@')[0]} ahora es admin.`,
                    mentions: update.participants
                });
                break;
            case 'demote': // Degradado
                await conn.sendMessage(update.id, { 
                    text: `⚠️ @${update.participants[0].split('@')[0]} ya no es admin.`,
                    mentions: update.participants
                });
                break;
            case 'subject': // Cambio de nombre
                await conn.sendMessage(update.id, { 
                    text: `✏️ El nombre del grupo cambió a: *${update.subject}*`
                });
                break;
            case 'icon': // Cambio de foto
                await conn.sendMessage(update.id, { 
                    text: `🖼️ Se cambió la foto del grupo.`
                });
                break;
        }
    } catch (err) {
        console.log('Error en groupUpdate:', err);
    }
} 
