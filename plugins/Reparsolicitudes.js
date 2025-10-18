import fs from 'fs'
import path from 'path'

const solicitudesPath = path.join('./database', 'solicitudes.json')

// Cargar solicitudes existentes
let solicitudes = {}
try {
  if (fs.existsSync(solicitudesPath)) {
    solicitudes = JSON.parse(fs.readFileSync(solicitudesPath, 'utf8') || '{}')
  }
} catch (e) {
  console.error('Error leyendo solicitudes.json:', e)
  process.exit(1)
}

const normalize = s => (s || '').toString().replace(/\D/g, '')

// Nuevo objeto normalizado
const nuevasSolicitudes = {}

// Recorremos todas las claves existentes
for (const [clave, arr] of Object.entries(solicitudes)) {
  if (!Array.isArray(arr)) continue

  arr.forEach(s => {
    const targetJid = s.targetJid || `${s.targetNumero || ''}@s.whatsapp.net`
    if (!targetJid) return

    // Aseguramos que la clave sea el JID completo del destinatario
    if (!nuevasSolicitudes[targetJid]) nuevasSolicitudes[targetJid] = []

    // Normalizamos datos de la solicitud
    nuevasSolicitudes[targetJid].push({
      jid: s.jid || '',
      numero: normalize(s.numero || s.jid || ''),
      targetJid,
      targetNumero: normalize(s.targetNumero || s.targetJid || ''),
      nombre: s.nombre || '',
      targetNombre: s.targetNombre || '',
      isGroup: s.isGroup || false,
      chatContext: s.chatContext || '',
      fecha: s.fecha || new Date().toISOString()
    })
  })
}

// Guardar archivo normalizado
try {
  fs.writeFileSync(solicitudesPath, JSON.stringify(nuevasSolicitudes, null, 2))
  console.log('✅ solicitudes.json normalizado correctamente.')
} catch (e) {
  console.error('❌ Error guardando solicitudes.json:', e)
}
