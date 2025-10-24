// 📂 plugins/infonum-doxeo3.js
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import axios from 'axios'

const approxTimezonesByCountry = {
  "598": { country: "Uruguay", capital: "Montevideo", timezone: "America/Montevideo" },
  "54":  { country: "Argentina", capital: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires" },
  "52":  { country: "México", capital: "Ciudad de México", timezone: "America/Mexico_City" },
  "57":  { country: "Colombia", capital: "Bogotá", timezone: "America/Bogota" },
  "34":  { country: "España", capital: "Madrid", timezone: "Europe/Madrid" },
  "44":  { country: "Reino Unido", capital: "Londres", timezone: "Europe/London" },
  "1":   { country: "EE. UU. / Canadá", capital: "Washington / Ottawa", timezone: "America/New_York" },
}

// Heurística de tipo de línea
function guessLineType(countryCode, nationalNumber) {
  if (!countryCode || !nationalNumber) return 'Desconocido'
  switch (countryCode) {
    case '598': if (nationalNumber.startsWith('09')) return 'Móvil'; if (nationalNumber.startsWith('2')) return 'Fijo'; return 'Desconocido'
    case '54': if (nationalNumber.startsWith('15')) return 'Móvil'; return 'Fijo'
    case '52': if (nationalNumber.startsWith('55') || nationalNumber.startsWith('56')) return 'Móvil'; return 'Fijo'
    default: return 'Desconocido'
  }
}

// Consulta gratuita alternativa
async function queryNumValidate(number) {
  try {
    const url = `https://numvalidate.com/api/validate?number=${encodeURIComponent(number)}`
    const res = await axios.get(url, { timeout: 8000 })
    return res.data || null
  } catch { return null }
}

const handler = async (m, { conn, text }) => {
  try {
    // 🚨 Solo admins o dueños
    const botNumbers = ['59898301727'] // número del bot
    const ownerNumbers = ['59896026646','59898719147'] // dueños
    const isOwner = ownerNumbers.includes(m.sender)
    if (!m.isGroup) return m.reply('❌ Este comando solo funciona en grupos.')
    const participant = m.isGroup ? m.sender : null
    const isAdmin = m.isGroup && (m.isGroup ? (await conn.groupMetadata(m.chat)).participants.find(p => p.id === participant)?.admin : false)
    if (!isAdmin && !isOwner) return m.reply('❌ Solo administradores o dueños pueden usar este comando.')

    if (!text) return m.reply('❌ Usa: .infonum +59898719147')

    const numeroInput = text.trim().replace(/[^+\d]/g, '')
    const phoneNumber = parsePhoneNumberFromString(numeroInput)
    if (!phoneNumber || !phoneNumber.isValid()) return m.reply('❌ Número inválido o no reconocido.')

    const e164 = phoneNumber.number
    const country = phoneNumber.country || 'Desconocido'
    const countryCallingCode = phoneNumber.countryCallingCode || '??'
    const intl = phoneNumber.formatInternational()
    const natFormat = phoneNumber.formatNational ? phoneNumber.formatNational() : phoneNumber.nationalNumber || ''

    let type = 'Desconocido'
    try {
      type = phoneNumber.getType ? phoneNumber.getType() : null
      if (!type) type = guessLineType(countryCallingCode, phoneNumber.nationalNumber)
    } catch {
      type = guessLineType(countryCallingCode, phoneNumber.nationalNumber)
    }

    const approx = approxTimezonesByCountry[countryCallingCode] || null
    const apiResult = await queryNumValidate(e164)
    const external = apiResult ? {
      valid: apiResult.valid,
      number: apiResult.e164Format || e164,
      local_format: apiResult.nationalFormat || natFormat,
      country_name: apiResult.countryName || country,
      country_code: apiResult.countryPrefix || countryCallingCode,
      location: apiResult.location || (approx ? approx.capital : 'Desconocido'),
      carrier: 'Desconocido',
      line_type: 'Desconocido'
    } : null

    // Info perfil público WhatsApp (legal)
    let waProfile = { name: 'Desconocido', picture: 'No disponible' }
    try {
      const vcard = await conn.onWhatsApp(e164)
      if (Array.isArray(vcard) && vcard.length > 0) {
        waProfile.name = vcard[0].name || 'Desconocido'
        waProfile.picture = vcard[0].profilePic || 'No disponible'
      }
    } catch {}

    // Botones interactivos
    const buttons = [
      { buttonId: `copyintl ${intl}`, buttonText: { displayText: '📋 Copiar Intl' }, type: 1 },
      { buttonId: `copynat ${natFormat}`, buttonText: { displayText: '📋 Copiar Nacional' }, type: 1 },
      { buttonId: `openwa ${e164}`, buttonText: { displayText: '💬 Abrir WhatsApp' }, type: 1 },
      { buttonId: `fwdinfo ${e164}`, buttonText: { displayText: '📤 Reenviar Info' }, type: 1 }
    ]

    let reply = `🕵️‍♂️ • INFO AVANZADA DEL NÚMERO • 🕵️‍♀️
──────────────────────────────
📞 Número: wa.me/${e164.replace('+','')} (clic para abrir chat)
🔢 Prefijo: +${countryCallingCode}
🌍 País (ISO): ${country}
🏷️ Formato internacional: ${intl}
🏷️ Formato nacional: ${natFormat}
📌 Tipo: ${type}
💬 Estado WhatsApp: ${waProfile.name}
🖼 Foto de perfil: ${waProfile.picture}`

    if (approx) reply += `
📍 Aproximación: ${approx.country} — capital: ${approx.capital}
⏰ Huso horario estimado: ${approx.timezone}`

    if (external) reply += `
──────────────────────────────
🔎 Datos desde API externa:
• Valid: ${external.valid}
• Carrier / Operador: ${external.carrier}
• Tipo de línea: ${external.line_type}
• Ubicación aproximada: ${external.location}`
    else reply += `
──────────────────────────────
🔎 Datos extra: API externa no configurada.`

    reply += `
──────────────────────────────
⚠️ Nota: Solo información pública/estimada. Usa legalmente.`

    await conn.sendMessage(m.chat, { text: reply, buttons, headerType: 1 }, { quoted: m })

  } catch (err) {
    console.error(err)
    m.reply('❌ Ocurrió un error al procesar el número. Revisa el formato y vuelve a intentar.')
  }
}

handler.command = /^infonum$/i
handler.help = ['.infonum +598...']
handler.tags = ['utility','info']
handler.limit = true
export default handler
