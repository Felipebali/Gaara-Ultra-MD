import fs from 'fs'
import path from 'path'

const normalize = s => (s || '').toString().replace(/\D/g, '')

const handler = async (m, { conn, args }) => {
  const solicitudesPath = path.join('./database', 'solicitudes.json')
  const parejasPath = path.join('./database', 'parejas.json')
  const casadosPath = path.join('./database', 'casados.json')

  // Cargar solicitudes
  let solicitudes = {}
  if (fs.existsSync(solicitudesPath)) {
    try { solicitudes = JSON.parse(fs.readFileSync(solicitudesPath, 'utf8') || '{}') } 
    catch(e){ solicitudes = {} }
  }

  let parejas = {}
  if (fs.existsSync(parejasPath)) {
    try { parejas = JSON.parse(fs.readFileSync(parejasPath, 'utf8') || '{}') } 
    catch(e){ parejas = {} }
  }

  let casados = {}
  if (fs.existsSync(casadosPath)) {
    try { casados = JSON.parse(fs.readFileSync(casadosPath, 'utf8') || '{}') } 
    catch(e){ casados = {} }
  }

  const yoJid = m.sender
  const yoRaw = normalize(yoJid)

  let otroJid, otroRaw
  if (m.quoted && m.quoted.sender) {
    otroJid = m.quoted.sender
    otroRaw = normalize(otroJid)
  } else if (m.mentionedJid && m.mentionedJid.length > 0) {
    otroJid = m.mentionedJid[0]
    otroRaw = normalize(otroJid)
  } else if (args[0]) {
    const numMatch = args[0].match(/\d{5,15}/)
    if (!numMatch) return m.reply('⚠️ Formato inválido. Usa un número o mención.')
    otroRaw = normalize(numMatch[0])
    const domain = yoJid.split('@')[1] || 's.whatsapp.net'
    otroJid = `${otroRaw}@${domain}`
  } else {
    return m.reply('❌ Debes escribir o mencionar a la persona cuya solicitud quieres aceptar.\n\nEjemplo:\n*.aceptar @123456789*')
  }

  // 🔹 Buscar la solicitud correcta usando la clave del destinatario
  const solicitudesPendientes = Object.entries(solicitudes)
    .filter(([key, arr]) => Array.isArray(arr))
    .map(([key, arr]) => ({ key, arr }))
    .find(item => item.arr.some(s => normalize(s.numero || s.jid) === otroRaw && normalize(s.targetNumero || s.targetJid) === yoRaw))

  if (!solicitudesPendientes) return m.reply('❌ No tienes una solicitud de esa persona.')

  const solicitudIndex = solicitudesPendientes.arr.findIndex(s =>
    normalize(s.numero || s.jid) === otroRaw
  )

  const solicitud = solicitudesPendientes.arr[solicitudIndex]

  // Guardar relación en parejas.json
  parejas[yoJid] = { pareja: otroJid, fecha: new Date().toISOString() }
  parejas[otroJid] = { pareja: yoJid, fecha: new Date().toISOString() }

  // Opcional: si querés casados.json
  casados[yoJid] = { pareja: otroJid, fecha: new Date().toISOString() }
  casados[otroJid] = { pareja: yoJid, fecha: new Date().toISOString() }

  // Eliminar la solicitud aceptada
  solicitudesPendientes.arr.splice(solicitudIndex,1)
  if (solicitudesPendientes.arr.length === 0) {
    delete solicitudes[solicitudesPendientes.key]
  } else {
    solicitudes[solicitudesPendientes.key] = solicitudesPendientes.arr
  }

  // Guardar todos los archivos
  try {
    fs.writeFileSync(solicitudesPath, JSON.stringify(solicitudes, null,2))
    fs.writeFileSync(parejasPath, JSON.stringify(parejas, null,2))
    fs.writeFileSync(casadosPath, JSON.stringify(casados, null,2))
  } catch(e) {
    console.error('Error guardando archivos:', e)
    return m.reply('⚠️ Ocurrió un error al actualizar las bases de datos.')
  }

  // Mensaje de aceptación
  const mensaje = `💖 @${normalize(otroJid)} ¡Tu declaración fue aceptada por @${yoRaw}! 💖

🌹 ¡Que el amor florezca y sea eterno! 🌹`

  await conn.sendMessage(m.chat, {
    text: mensaje,
    mentions: [yoJid, otroJid],
    quoted: m.quoted ? m.quoted : undefined
  })
}

handler.help = ['aceptar @usuario']
handler.tags = ['pareja']
handler.command = /^aceptar$/i

export default handler
