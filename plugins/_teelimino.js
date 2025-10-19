// plugins/_autokick-te-elimino.js
import fs from 'fs';
import path from 'path';

let lastCommonIndex = -1;
let lastOwnerIndex = -1;
let lastProtectedIndex = -1;

const dbPath = path.resolve('./adminWarnings.json');
if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, JSON.stringify({}), 'utf-8');

const readWarnings = () => JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
const writeWarnings = (data) => fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');

let handler = async (m, { conn }) => {
    try {
        if (!m.isGroup) return;

        const texto = m.text ? m.text.trim() : '';
        const who = m.sender;

        const owners = ['59898719147','59896026646'];
        const protegida = '59892975182';

        const frasesComunes = [
            `@${who.split("@")[0]}, sos terrible ganso, afuera 😹`,
            `@${who.split("@")[0]}, payaso detectado, andá a dormir 😎`
        ];

        const frasesOwners = [
            `@${who.split("@")[0]}, tranquilo capo, vos mandás acá 😎`,
            `@${who.split("@")[0]}, dueño supremo detectado, siga nomás 😏`
        ];

        const frasesProtegida = [
            `@${who.split("@")[0]}, 🌸 tú no preciosa 😍`,
            `@${who.split("@")[0]}, 💖 contigo todo bien ✨`,
            `@${who.split("@")[0]}, 😘 jamás te tocaría`
        ];

        const groupMetadata = await conn.groupMetadata(m.chat);
        const participant = groupMetadata.participants.find(p => p.id === who);
        const isAdmin = participant?.admin || false;

        // PROTEGIDA
        if (who.split("@")[0] === protegida) {
            let index;
            do index = Math.floor(Math.random() * frasesProtegida.length);
            while (index === lastProtectedIndex);
            lastProtectedIndex = index;
            return conn.sendMessage(m.chat, { text: frasesProtegida[index], mentions: [who] });
        }

        // OWNER
        if (owners.includes(who.split("@")[0])) {
            let index;
            do index = Math.floor(Math.random() * frasesOwners.length);
            while (index === lastOwnerIndex);
            lastOwnerIndex = index;
            return conn.sendMessage(m.chat, { text: frasesOwners[index], mentions: [who] });
        }

        // ADMIN
        if (isAdmin) {
            const warnings = readWarnings();
            const userId = who.split("@")[0];
            warnings[userId] = (warnings[userId] || 0) + 1;
            writeWarnings(warnings);

            if (warnings[userId] === 1) {
                await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
                return conn.sendMessage(m.chat, {
                    text: `@${who.split("@")[0]} ⚠️ Advertencia 1/2. La próxima te vas del grupo.\nSe te quitó el admin por pelotudo.`,
                    mentions: [who]
                });
            }

            if (warnings[userId] >= 2) {
                await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
                return conn.sendMessage(m.chat, {
                    text: `@${who.split("@")[0]} 🚫 Fue expulsado por insistir con "${texto}".`,
                    mentions: [who]
                });
            }
            return;
        }

        // USUARIO COMÚN
        if (!isAdmin && !owners.includes(who.split("@")[0]) && who.split("@")[0] !== protegida) {
            let index;
            do index = Math.floor(Math.random() * frasesComunes.length);
            while (index === lastCommonIndex);
            lastCommonIndex = index;

            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
            await conn.sendMessage(m.chat, { text: frasesComunes[index], mentions: [who] });
        }

    } catch (e) {
        console.error('Error en autokick Te eliminó:', e);
    }
};

// COMANDO PARA SACAR ADVERTENCIA
handler.perdonar = async (m, { conn, args, isOwner }) => {
    try {
        if (!isOwner) return m.reply('❌ Solo los owners pueden usar este comando.');

        let userId;
        if (m.quoted) {
            userId = m.quoted.sender.split("@")[0];
        } else if (args && args[0]) {
            userId = args[0].replace(/[^0-9]/g, '');
        } else {
            return m.reply('❌ Debes mencionar al usuario o citar su mensaje.');
        }

        const warnings = readWarnings();
        if (!warnings[userId] || warnings[userId] <= 0) {
            return m.reply(`@${userId} no tiene advertencias.`, { mentions: [`${userId}@s.whatsapp.net`] });
        }

        warnings[userId] -= 1;
        if (warnings[userId] <= 0) delete warnings[userId];
        writeWarnings(warnings);

        await m.reply(`✅ Se quitó 1 advertencia a @${userId}.`, { mentions: [`${userId}@s.whatsapp.net`] });

    } catch (e) {
        console.error('Error en comando .perdonar:', e);
    }
};

handler.customPrefix = /^(te eliminó.?|te elimino.?|te eliminaron.?|te echaron.?|fuera|rajá|andate)$/i;
handler.command = new RegExp;
export default handler;
