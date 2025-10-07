import { WAMessageStubType } from '@whiskeysockets/baileys'
import fetch from 'node-fetch'

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup) return true

  const chat = global.db.data.chats[m.chat]
  if (!chat?.welcome) return true

  const getPais = (numero) => {
    const paises = {
      "1": "🇺🇸 EE.UU.", "34": "🇪🇸 España", "52": "🇲🇽 México",
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

  const usuarioJid = m.messageStubParameters?.[0] || m.key.participant
  const numeroUsuario = usuarioJid.split('@')[0]
  const nombreUsuario = await conn.getName(usuarioJid) || numeroUsuario
  const pais = getPais(numeroUsuario)

  const fechaObj = new Date()
  const hora = fechaObj.toLocaleTimeString('es-PE', { timeZone: 'America/Lima' })
  const fecha = fechaObj.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Lima' })
  const dia = fechaObj.toLocaleDateString('es-PE', { weekday: 'long', timeZone: 'America/Lima' })

  const groupSize = participants.length + ((m.messageStubType === 27) ? 1 : ((m.messageStubType === 28 || m.messageStubType === 32) ? -1 : 0))

  const welcomeMessage = `👋 ¡Hola ${nombreUsuario}!\nBienvenido/a al grupo *${groupMetadata.subject}*.\nMiembros: ${groupSize}\nPaís: ${pais}\nFecha: ${dia}, ${fecha} | ${hora}`
  const byeMessage = `💔 Adiós ${nombreUsuario}\nSe ha ido del grupo *${groupMetadata.subject}*.\nMiembros restantes: ${groupSize}\nPaís: ${pais}\nFecha: ${dia}, ${fecha} | ${hora}`

  const defaultImage = 'https://i.ibb.co/1s8T3sY/48f7ce63c7aa.jpg'

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD) {
    await conn.sendMessage(m.chat, { 
      image: { url: defaultImage }, 
      caption: welcomeMessage 
    })
  }

  if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    await conn.sendMessage(m.chat, { 
      image: { url: defaultImage }, 
      caption: byeMessage 
    })
  }

  return true
}
