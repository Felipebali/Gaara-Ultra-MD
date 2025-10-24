// 📂 plugins/infonum-doxeo.js
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

async function queryNumValidate(number) {
  try {
    const url = `https://numvalidate.com/api/validate?number=${encodeURIComponent(number)}`
    const res = await axios.get(url, { timeout: 8000 })
    return res.data || null
  } catch (e) {
    return null
  }
}

const handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('❌ Usa: .infonum +59898719147  (debe incluir prefijo internacional)')

    const numeroInput = text.trim().replace(/[^+\d]/g, '')
    const phoneNumber = parsePhoneNumberFromString(numeroInput)
    if (!phoneNumber || !phoneNumber.isValid()) return m.reply('❌ Número inválido o no reconocido.')

    const e164 = phoneNumber.number
    const country = phoneNumber.country || 'Desconocido'
    const countryCallingCode = phoneNumber.countryCallingCode || '??'
    const intl = phoneNumber.formatInternational()
    const natFormat = phoneNumber.formatNational ? phoneNumber.formatNational() : phoneNumber.nationalNumber || ''
    let type = 'Desconocido'
    try { type = phoneNumber.getType ? String(phoneNumber.getType()) : 'Desconocido' } catch {}

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

    let reply = []
    reply.push(`🕵️‍♂️ • INFO DEL NÚMERO (doxeo responsable) • 🕵️‍♀️`)
    reply.push('──────────────────────────────')
    reply.push(`📞 Número: wa.me/${e164.replace('+','')} (clic para abrir chat)`)
    reply.push(`🔢 Prefijo: +${countryCallingCode}`)
    reply.push(`🌍 País (ISO): ${country}`)
    reply.push(`🏷️ Formato internacional: ${intl}`)
    reply.push(`🏷️ Formato nacional: ${natFormat}`)
    reply.push(`📌 Tipo: ${type}`)
    if (approx) {
      reply.push(`📍 Aproximación: ${approx.country} — capital: ${approx.capital}`)
      reply.push(`⏰ Huso horario estimado: ${approx.timezone}`)
    }
    if (external) {
      reply.push('──────────────────────────────')
      reply.push('🔎 Datos desde API externa:')
      reply.push(`• Valid: ${external.valid}`)
      reply.push(`• Carrier / Operador: ${external.carrier}`)
      reply.push(`• Tipo de línea: ${external.line_type}`)
      reply.push(`• Ubicación aproximada: ${external.location}`)
    } else {
      reply.push('──────────────────────────────')
      reply.push('🔎 Datos extra: API externa no configurada.')
    }
    reply.push('──────────────────────────────')
    reply.push('⚠️ Nota: Solo información pública/estimada. Usa legalmente.')

    await m.reply(reply.join('\n'))

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
