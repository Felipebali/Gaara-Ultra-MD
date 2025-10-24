// 📂 plugins/infonum-doxeo.js
import { parsePhoneNumberFromString, getNumberType } from 'libphonenumber-js'
import axios from 'axios'

/**
 * Config:
 * Si querés usar una API externa para obtener operador/line_type más preciso,
 * guarda la API key en process.env.NUMVERIFY_KEY
 *
 * Ejemplo (numverify/apilayer): https://numverify.com/  (uso de ejemplo)
 */

const approxTimezonesByCountry = {
  // mapa simple para dar una aproximación de huso horario / ciudad capital
  "598": { country: "Uruguay", capital: "Montevideo", timezone: "America/Montevideo" },
  "54":  { country: "Argentina", capital: "Buenos Aires", timezone: "America/Argentina/Buenos_Aires" },
  "52":  { country: "México", capital: "Ciudad de México", timezone: "America/Mexico_City" },
  "57":  { country: "Colombia", capital: "Bogotá", timezone: "America/Bogota" },
  "34":  { country: "España", capital: "Madrid", timezone: "Europe/Madrid" },
  "44":  { country: "Reino Unido", capital: "Londres", timezone: "Europe/London" },
  "1":   { country: "EE. UU. / Canadá", capital: "Washington / Ottawa", timezone: "America/New_York (ejemplo)" },
  // agregá más prefijos si querés
}

async function queryNumVerify(number) {
  const apiKey = process.env.NUMVERIFY_KEY
  if (!apiKey) return null
  try {
    const url = `http://apilayer.net/api/validate?access_key=${apiKey}&number=${encodeURIComponent(number)}&format=1`
    const res = await axios.get(url, { timeout: 8000 })
    if (res.data) return res.data
    return null
  } catch (e) {
    return null
  }
}

const handler = async (m, { conn, text }) => {
  try {
    if (!text) return m.reply('❌ Usa: .infonum +59898719147  (debe incluir prefijo internacional)')
    // limpieza básica
    const raw = text.trim()
    const numeroInput = raw.replace(/[^+\d]/g, '') // mantiene + y dígitos

    const phoneNumber = parsePhoneNumberFromString(numeroInput)
    if (!phoneNumber || !phoneNumber.isValid()) {
      return m.reply('❌ Número inválido o no reconocido. Asegurate de incluir el prefijo internacional, por ejemplo: +59898719147')
    }

    // Info básica con libphonenumber-js
    const e164 = phoneNumber.number // +598...
    const country = phoneNumber.country || 'Desconocido'
    const countryCallingCode = phoneNumber.countryCallingCode || '??'
    const national = phoneNumber.nationalNumber || ''
    const intl = phoneNumber.formatInternational()
    const natFormat = phoneNumber.formatNational ? phoneNumber.formatNational() : national
    let type = 'Desconocido'
    try {
      const t = phoneNumber.getType ? phoneNumber.getType() : null
      // getType devuelve 'MOBILE' / 'FIXED_LINE' / 'VOIP' etc. (si está disponible)
      if (t) type = String(t)
    } catch (err) { /* ignore */ }

    // Aproximación zona / capital por prefijo (si existe)
    let approx = approxTimezonesByCountry[countryCallingCode] || null

    // Optionally query external API for carrier and line_type
    let external = null
    const apiResult = await queryNumVerify(e164) // si no hay API key, devuelve null
    if (apiResult) {
      external = {
        valid: apiResult.valid,
        number: apiResult.international_format || e164,
        local_format: apiResult.local_format || natFormat,
        country_name: apiResult.country_name || country,
        country_code: apiResult.country_code || countryCallingCode,
        location: apiResult.location || (approx ? approx.capital : 'Desconocido'),
        carrier: apiResult.carrier || 'Desconocido',
        line_type: apiResult.line_type || 'Desconocido'
      }
    }

    // Construimos respuesta estilo "doxeo responsable"
    let reply = []
    reply.push('🕵️‍♂️ • INFO PUBLICA DEL NÚMERO (doxeo responsable) • 🕵️‍♀️')
    reply.push('──────────────────────────────────')
    reply.push(`📞 Número (E.164): ${e164}`)
    reply.push(`🔢 Prefijo / CountryCallingCode: +${countryCallingCode}`)
    reply.push(`🌍 País (ISO): ${country}`)
    reply.push(`🏷️ Formato internacional: ${intl}`)
    reply.push(`🏷️ Formato nacional: ${natFormat}`)
    reply.push(`📌 Tipo detectado: ${type}`)
    if (approx) {
      reply.push(`📍 Aproximación: ${approx.country} — capital: ${approx.capital}`)
      reply.push(`⏰ Huso horario estimado: ${approx.timezone}`)
    }
    if (external) {
      reply.push('──────────────────────────────────')
      reply.push('🔎 Datos desde API externa:')
      reply.push(`• Valid: ${external.valid}`)
      reply.push(`• Carrier / Operador: ${external.carrier}`)
      reply.push(`• Tipo de línea: ${external.line_type}`)
      reply.push(`• Ubicación aproximada: ${external.location}`)
    } else {
      reply.push('──────────────────────────────────')
      reply.push('🔎 Datos extra: no hay API configurada. Para más precisión podés configurar una API (numverify/apilayer) en process.env.NUMVERIFY_KEY')
    }

    // Consejos / advertencias
    reply.push('──────────────────────────────────')
    reply.push('⚠️ Nota: Esta información es pública/estimada. No se muestran datos privados (propietario, direcciones reales, historiales). Usa legalmente.')

    await m.reply(reply.join('\n'))

  } catch (err) {
    console.error(err)
    return m.reply('❌ Ocurrió un error al procesar el número. Asegurate del formato y volvé a intentar.')
  }
}

// comando .infonum
handler.command = /^infonum$/i
handler.help = ['.infonum +598...']
handler.tags = ['utility','info']
handler.limit = true
export default handler
