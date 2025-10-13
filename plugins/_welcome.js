// plugins/_welcome.js
import fetch from 'node-fetch'

export async function welcome(conn) {
  // Escucha los cambios de participantes
  conn.ev.on('group-participants.update', async (update) => {
    try {
      const chat = update.id || update.jid
      const action = update.action
      const participants = update.participants || []

      if (!participants.length) return

      // Obtener metadata del grupo
      const groupMetadata = await conn.groupMetadata(chat).catch(() => ({}))

      for (let who of participants) {
        const username = who.split('@')[0]

        // Función para obtener país
        const getPais = (numero) => {
          const paises = {
            "1": "🇺🇸 Estados Unidos", "34": "🇪🇸 España", "52": "🇲🇽 México",
            "54": "🇦🇷 Argentina", "55": "🇧🇷 Brasil", "56": "🇨🇱 Chile",
            "57": "🇨🇴 Colombia", "58": "🇻🇪 Venezuela", "591": "🇧🇴 Bolivia",
            "593": "🇪🇨 Ecuador", "595": "🇵🇾 Paraguay", "598": "🇺🇾 Uruguay",
            "502": "🇬🇹 Guatemala", "503": "🇸🇻 El Salvador", "504": "🇭🇳 Honduras",
            "505": "🇳🇮 Nicaragua", "506": "🇨🇷 Costa Rica", "507": "🇵🇦 Panamá",
            "51": "🇵🇪 Perú", "53": "🇨🇺 Cuba", "91": "🇮🇳 India"
          }
          for (let i = 1; i <= 3; i++) {
            const prefijo = numero.slice(0, i)
            if (paises[prefijo]) return paises[prefijo]
          }
          return "🌎 Desconocido"
        }

        const numeroUsuario = username
        const pais = getPais(numeroUsuario)

        // Avatar del usuario
        const avatarUsuario = await conn.profilePictureUrl(who, 'image')
          .catch(() => 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg')

        // Imagen de contacto para quoted
        const thumbBuffer = await fetch('https://files.catbox.moe/7sbozb.jpg').then(res => res.buffer())
        const fkontak = {
          key: { participants: "0@s.whatsapp.net", remoteJid: chat, fromMe: false, id: "Halo" },
          message: { locationMessage: { name: "☆ 𝚁𝙸𝙽 𝙸𝚃𝙾𝚂𝙷𝙸 𝚄𝙻𝚃𝚁𝙰 ☆ 🌸", jpegThumbnail: thumbBuffer } },
          participant: "0@s.whatsapp.net"
        }

        const fechaObj = new Date()
        const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
        const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
        const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })
        const groupSize = groupMetadata.participants?.length || 0

        const contextInfo = {
          mentionedJid: [who],
          externalAdReply: {
            title: '🍉 𝙒𝙚𝙡𝙘𝙤𝙢𝙚 𝙍𝙞𝙣 𝙄𝙩𝙤𝙨𝙝𝙞 - 𝘽𝙤𝙩 🌿',
            body: '',
            previewType: "PHOTO",
            thumbnailUrl: avatarUsuario,
            sourceUrl: "https://instagram.com",
            mediaType: 1
          }
        }

        // Mensajes
        const welcomeMessage = `
╭━━━〔 🌸 *ＢＩＥＮ𝐕𝐄𝐍𝐈𝐃𝐎 @${numeroUsuario}* 🌸 〕━━⬣
│🎀 ʙɪᴇɴᴠᴇɴɪᴅᴏ ᴀ *${groupMetadata.subject || "este grupo"}* 💫
│🍃 _${groupMetadata.desc?.slice(0, 120) || "Sin descripción."}_
│🌸 𝑀𝑖𝑒𝑚𝑏𝑟𝑜𝑠: *${groupSize}*
│🕰️ 𝐹𝑒𝑐ℎ𝑎: *${dia}, ${fecha}*
│🌍 𝐿𝑢𝑔𝑎𝑟: *${pais}*
╰━━━〔 💮 𝑅𝑖𝑛 𝐼𝑡𝑜𝑠ℎ𝑖 💮 〕━━⬣
> ✨ *Que disfrutes tu estadía en este grupo.*
> ૮₍｡˃ ᵕ ˂ ｡₎ა 💕 Usa _#menu_ para explorar comandos.`

        const byeMessage = `
╭━━━〔 💔 *Ｈ𝐀𝐒𝐓𝐀 Ｐ𝐑𝐎𝐍𝐓𝐎 @${numeroUsuario}* 💔 
│🍂 𝑬𝒔 𝒕𝒓𝒊𝒔𝒕𝒆 𝒗𝒆𝒓𝐭𝑒 𝒊𝒓...
│🕊️ 𝐺𝑟𝑢𝑝𝑜: *${groupMetadata.subject || "este grupo"}*
│🌸 𝑀𝑖𝑒𝑚𝑏𝑟𝑜𝑠: *${groupSize}*
│🕰️ 𝐹𝑒𝑐ℎ𝑎: *${dia}, ${fecha}*
│🌍 𝐿𝑢𝑔𝑎𝑟: *${pais}*
╰━━━〔 💮 𝑅𝑖𝑛 𝐼𝑡𝑜𝑠ℎ𝑖 💮 〕━━⬣
> 🌧️ *Esperamos verte de nuevo pronto.*
> 🍃 Usa _#help_ si vuelves, estaremos aquí.`

        // Acciones
        if (action === 'add') {
          await conn.sendMessage(chat, { 
            image: { url: avatarUsuario },
            caption: welcomeMessage,
            contextInfo,
            mentions: [who],
            buttons: [
              { buttonId: "#reg shadow.18", buttonText: { displayText: "💮 𝐀𝐔𝐓𝐎 𝐕𝐄𝐑𝐈𝐅𝐈𝐂𝐀𝐑 💮" }, type: 1 },
              { buttonId: "#menu", buttonText: { displayText: "🌸 𝐌𝐄𝐍𝐔 𝐑𝐈𝐍 𝐈𝐓𝐎𝐒𝐇𝐈 🌸" }, type: 1 }
            ],
            headerType: 4
          }, { quoted: fkontak })
        }

        if (action === 'remove') {
          await conn.sendMessage(chat, { 
            image: { url: avatarUsuario },
            caption: byeMessage,
            contextInfo,
            mentions: [who],
            buttons: [
              { buttonId: "#menu", buttonText: { displayText: "☁️ 𝐌𝐄𝐍𝐔 ☁️" }, type: 1 },
              { buttonId: "#p", buttonText: { displayText: "🍃 𝐒𝐓𝐀𝐓𝐔𝐒 🍃" }, type: 1 }
            ],
            headerType: 4
          }, { quoted: fkontak })
        }
      }
    } catch (e) {
      console.error('Error en welcome plugin:', e)
    }
  })
}
