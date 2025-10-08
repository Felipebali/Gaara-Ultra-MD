let linkRegex = /\b((https?:\/\/|www\.)?[\w-]+\.[\w-]+(?:\.[\w-]+)*(\/[\w\.\-\/]*)?)\b/i;

// Lista de dominios permitidos
const excepciones = ['instagram.com', 'youtu.be', 'youtube.com', 'tiktok.com'];

export async function before(m, { isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const chat = global.db.data.chats[m.chat];
    const delet = m.key.participant;
    const bang = m.key.id;
    const user = `@${m.sender.split('@')[0]}`;

    if (!m.text) return true;

    const enlaces = m.text.match(linkRegex);
    if (!enlaces) return true; // si no hay enlaces, dejamos pasar

    // Revisar si alguno de los enlaces NO está en la lista de excepciones
    const linkBloqueado = enlaces.some(link => {
        return !excepciones.some(dom => link.toLowerCase().includes(dom));
    });

    if (!linkBloqueado) return true; // todos los enlaces son de los permitidos

    // Si llegamos acá, hay enlace bloqueado
    if (isAdmin) {
        await this.sendMessage(m.chat, {
            text: `⚠️ ${user} envió un enlace no permitido.\nRecuerden que las reglas son iguales para todos en este grupo.`,
            mentions: [m.sender]
        });
        if (isBotAdmin) {
            await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
        }
        return false; // No expulsar
    }

    // Para miembros normales
    await this.sendMessage(m.chat, {
        text: `🚫 ${user} no puede enviar enlaces aquí, respeta las reglas del grupo.`,
        mentions: [m.sender]
    });
    if (isBotAdmin) {
        await this.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: delet } });
    }

    return false;
}
