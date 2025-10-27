// index.js - VEGETA-BOT-MB (ESM) - Versión corregida y lista para Termux
// Basado en Gaara-Ultra-MD / VEGETA-BOT-MB - Corregido: errores de sintaxis, rate-limit, pairing safe, scrapers.

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import { watchFile, unwatchFile } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync, rmSync, watch } from 'fs'
import yargs from 'yargs'
import { spawn, execSync } from 'child_process'
import lodash from 'lodash'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import boxen from 'boxen'
import pino from 'pino'
import path, { join, dirname } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import store from './lib/store.js'
import NodeCache from 'node-cache'
import readline from 'readline'

// Baileys imports (dynamic parts)
const baileys = await import('@whiskeysockets/baileys')
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers } = baileys

// google-libphonenumber
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()

// --- Defaults y variables globales seguras ---
global.botName = global.botName || 'VEGETA-BOT-MB'
global.owners = global.owners || ['59896026646','59898719147'] // sin +
global.prefix = global.prefix || '.'
global.vegetasessions = global.vegetasessions || 'VEGETA-sessions'
global.jadi = global.jadi || 'VEGETA-jadi'
global.Jadibts = global.Jadibts || false // comportamiento por defecto
global.vegetasessions = global.vegetasessions.replace(/\/+$/,'')

// Protección para variables opcionales usadas en logs
const jadi = global.jadi
const vegetasessions = global.vegetasessions

// Prints iniciales
console.log(chalk.bold.redBright(`
╭━━━〔⚡️ ${global.botName} Conexión ⚡️〕━━━⬣
┃ ✅️ Sistema ACTIVADO con éxito
┃ 🚀 ¡Prepárate para dominar con Ultra!
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`))

console.log(chalk.bold.magentaBright('╭━━━〔 👑 INFO CREADOR 👑 〕━━━⬣'))
console.log(chalk.bold.cyanBright('┃ ✦ Basado en Gaara-Ultra-MD / VEGETA-BOT-MB'))
console.log(chalk.bold.magentaBright('╰━━━━━━━━━━━━━━━━━━━━━━⬣\n'))

// proto helpers
protoType()
serialize()

// __filename / __dirname helpers (ESM)
global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
  return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}
global.__dirname = function dirname(pathURL) {
  return path.dirname(global.__filename(pathURL, true))
}
global.__require = function require(dir = import.meta.url) {
  return createRequire(dir)
}

global.timestamp = { start: new Date() }
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())

// DB (lowdb) — si quieres cloudDBAdapter debes implementarlo en config
global.db = new Low(new JSONFile('database.json'))
global.DATABASE = global.db
global.loadDatabase = async function loadDatabase() {
  if (global.db.READ) {
    return new Promise((resolve) => setInterval(async function() {
      if (!global.db.READ) {
        clearInterval(this)
        resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
      }
    }, 1000))
  }
  if (global.db.data !== null) return
  global.db.READ = true
  await global.db.read().catch(console.error)
  global.db.READ = null
  global.db.data = {
    users: {}, chats: {}, stats: {}, msgs: {}, sticker: {}, settings: {}, ...(global.db.data || {})
  }
  global.db.chain = lodash.chain(global.db.data)
}
await loadDatabase()

// Auth state Baileys
const { state, saveState, saveCreds } = await useMultiFileAuthState(global.vegetasessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()

let phoneNumber = global.botNumber || ''
const methodCodeQR = process.argv.includes('qr')
const methodCode = !!phoneNumber || process.argv.includes('code')
const MethodMobile = process.argv.includes('mobile')

// readline question helper
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))

// console filter helper (oculta strings sensibles)
function redefineConsoleMethod(methodName, filterStrings) {
  const originalConsoleMethod = console[methodName]
  console[methodName] = function() {
    const message = arguments[0]
    if (typeof message === 'string' && filterStrings.some(filterString => message.includes(Buffer.from(filterString, 'base64').toString()))) {
      arguments[0] = ''
    }
    originalConsoleMethod.apply(console, arguments)
  }
}
const filterStrings = [
  "Q2xvc2luZyBzdGFsZSBvcGVu",
  "Q2xvc2luZyBvcGVuIHNlc3Npb24=",
  "RmFpbGVkIHRvIGRlY3J5cHQ=",
  "U2Vzc2lvbiBlcnJvcg==",
  "RXJyb3I6IEJhZCBNQUM=",
  "RGVjcnlwdGVkIG1lc3NhZ2U="
]
console.info = () => {}
console.debug = () => {}
;['log','warn','error'].forEach(methodName => redefineConsoleMethod(methodName, filterStrings))

// Connection options
const connectionOptions = {
  logger: pino({ level: 'silent' }),
  printQRInTerminal: false,
  mobile: MethodMobile,
  browser: methodCodeQR || methodCode ? Browsers.macOS('Desktop') : Browsers.macOS('Chrome'),
  auth: {
    creds: state.creds,
    keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'fatal' }).child({ level: 'fatal' }))
  },
  markOnlineOnConnect: false,
  generateHighQualityLinkPreview: true,
  syncFullHistory: false,
  getMessage: async (key) => {
    try {
      let jid = jidNormalizedUser(key.remoteJid)
      let msg = await store.loadMessage(jid, key.id)
      return msg?.message || ''
    } catch (e) { return '' }
  },
  msgRetryCounterCache,
  userDevicesCache,
  version,
  keepAliveIntervalMs: 55_000,
  maxIdleTimeMs: 60_000,
  cachedGroupMetadata: (jid) => (global.conn && global.conn.chats && global.conn.chats[jid]) || {},
}

// Conexión
global.conn = makeWASocket(connectionOptions)

// -----------------------
// CONTROL GLOBAL ANTI RATE-LIMIT (cola de envíos)
// -----------------------
global.msgQueue = global.msgQueue || []
global.processingQueue = global.processingQueue || false
global.safeSend = global.safeSend || (async (conn, chat, msg) => {
  global.msgQueue.push({ conn, chat, msg })
})
if (!global.processingQueue) {
  global.processingQueue = true
  setInterval(async () => {
    if (global.msgQueue.length === 0) return
    const item = global.msgQueue.shift()
    try {
      await item.conn.sendMessage(item.chat, item.msg)
      await new Promise(r => setTimeout(r, 1200))
    } catch (err) {
      console.error('⚠️ Error en cola de mensajes:', err?.message || err)
      // Reintento sencillo
      try { await new Promise(r => setTimeout(r, 2000)); await item.conn.sendMessage(item.chat, item.msg) } catch(e){}
    }
  }, 700)
}

// cooldowns por usuario
global.cooldowns = global.cooldowns || {}
function antiSpam(sender, delay = 2500) {
  const now = Date.now(); const last = global.cooldowns[sender] || 0
  if (now - last < delay) return true
  global.cooldowns[sender] = now; return false
}

// groupMetadata cache & safe fetch
const groupMetadataCache = new Map()
async function safeGroupMetadata(jid, ttl = 60_000) {
  const cached = groupMetadataCache.get(jid)
  if (cached && (Date.now() - cached.time) < ttl) return cached.data
  try {
    const meta = await global.conn.groupMetadata(jid)
    groupMetadataCache.set(jid, { data: meta, time: Date.now() })
    return meta
  } catch (e) {
    return cached ? cached.data : { id: jid, subject: '', participants: [] }
  }
}

// LID helpers
const lidCache = new NodeCache({ stdTTL: 60 * 60, checkperiod: 60 * 10 })
async function resolveLidToRealJid(lidJid, groupJid, maxRetries = 3, retryDelay = 1000) {
  if (!lidJid?.endsWith('@lid') || !groupJid?.endsWith('@g.us')) return lidJid?.includes('@') ? lidJid : `${lidJid}@s.whatsapp.net`
  const cached = lidCache.get(lidJid); if (cached) return cached
  const lidToFind = lidJid.split('@')[0]
  let attempts = 0
  while (attempts < maxRetries) {
    try {
      const metadata = await safeGroupMetadata(groupJid)
      if (!metadata?.participants) throw new Error('No se obtuvieron participantes')
      for (const participant of metadata.participants) {
        try {
          if (!participant?.jid) continue
          const contactDetails = await global.conn.onWhatsApp(participant.jid)
          if (!contactDetails?.[0]?.lid) continue
          const possibleLid = contactDetails[0].lid.split('@')[0]
          if (possibleLid === lidToFind) { lidCache.set(lidJid, participant.jid); return participant.jid }
        } catch (e) { continue }
      }
      lidCache.set(lidJid, lidJid); return lidJid
    } catch (e) {
      attempts++
      if (attempts >= maxRetries) { lidCache.set(lidJid, lidJid); return lidJid }
      await new Promise(r => setTimeout(r, retryDelay))
    }
  }
  return lidJid
}

async function extractAndProcessLids(text, groupJid) {
  if (!text) return text
  const lidMatches = text.match(/\d+@lid/g) || []
  let processedText = text
  for (const lid of lidMatches) {
    try {
      const realJid = await resolveLidToRealJid(lid, groupJid)
      processedText = processedText.replace(new RegExp(lid, 'g'), realJid)
    } catch (e) { console.error(`■Error procesando LID⚡ ${lid}:`, e) }
  }
  return processedText
}

async function processLidsInMessage(message, groupJid) {
  if (!message || !message.key) return message
  try {
    const messageCopy = {
      key: {...message.key},
      message: message.message ? {...message.message} : undefined,
      ...(message.quoted && { quoted: {...message.quoted} }),
      ...(message.mentionedJid && { mentionedJid: [...message.mentionedJid] })
    }
    const remoteJid = messageCopy.key.remoteJid || groupJid
    if (messageCopy.key?.participant?.endsWith('@lid')) messageCopy.key.participant = await resolveLidToRealJid(messageCopy.key.participant, remoteJid)
    if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant?.endsWith('@lid')) messageCopy.message.extendedTextMessage.contextInfo.participant = await resolveLidToRealJid(messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid)
    if (messageCopy.message?.extendedTextMessage?.contextInfo?.mentionedJid) {
      const mentionedJid = messageCopy.message.extendedTextMessage.contextInfo.mentionedJid
      if (Array.isArray(mentionedJid)) {
        for (let i = 0; i < mentionedJid.length; i++) if (mentionedJid[i]?.endsWith('@lid')) mentionedJid[i] = await resolveLidToRealJid(mentionedJid[i], remoteJid)
      }
    }
    if (messageCopy.message?.extendedTextMessage?.contextInfo?.quotedMessage?.extendedTextMessage?.contextInfo?.mentionedJid) {
      const quotedMentionedJid = messageCopy.message.extendedTextMessage.contextInfo.quotedMessage.extendedTextMessage.contextInfo.mentionedJid
      if (Array.isArray(quotedMentionedJid)) for (let i = 0; i < quotedMentionedJid.length; i++) if (quotedMentionedJid[i]?.endsWith('@lid')) quotedMentionedJid[i] = await resolveLidToRealJid(quotedMentionedJid[i], remoteJid)
    }
    if (messageCopy.message?.conversation) messageCopy.message.conversation = await extractAndProcessLids(messageCopy.message.conversation, remoteJid)
    if (messageCopy.message?.extendedTextMessage?.text) messageCopy.message.extendedTextMessage.text = await extractAndProcessLids(messageCopy.message.extendedTextMessage.text, remoteJid)
    if (messageCopy.message?.extendedTextMessage?.contextInfo?.participant && !messageCopy.quoted) {
      const quotedSender = await resolveLidToRealJid(messageCopy.message.extendedTextMessage.contextInfo.participant, remoteJid)
      messageCopy.quoted = { sender: quotedSender, message: messageCopy.message.extendedTextMessage.contextInfo.quotedMessage }
    }
    return messageCopy
  } catch (e) { console.error('Error en processLidsInMessage:', e); return message }
}

// ------------------
// Conexión y manejo de pairing code con espera segura
// ------------------
let opcion = undefined
if (methodCodeQR) opcion = '1'

if (!methodCodeQR && !methodCode && !fs.existsSync(`./${vegetasessions}/creds.json`)) {
  do {
    opcion = await question(chalk.white('Seleccione una opción:\n') + chalk.blueBright('1. 🚀 Con código QR\n') + chalk.cyan('2. ⚡️ Con código de texto de 8 dígitos\n--> '))
    opcion = (opcion || '').trim()
    if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.redBright('⚠︎ Ingresa 1 o 2'))
  } while (!/^[1-2]$/.test(opcion) || fs.existsSync(`./${vegetasessions}/creds.json`))
}

async function requestPairingSafely(addNumber) {
  try {
    let attempts = 0
    // Esperar a que el socket esté inicializado
    while ((!global.conn || !global.conn?.ws || !global.conn?.ws.socket) && attempts < 10) { attempts++; await new Promise(r => setTimeout(r, 700)) }
    // Buffer adicional
    await new Promise(r => setTimeout(r, 1500))
    const code = await global.conn.requestPairingCode(addNumber)
    return code
  } catch (e) {
    throw e
  }
}

if (!fs.existsSync(`./${vegetasessions}/creds.json`)) {
  if (opcion === '2' || methodCode) {
    opcion = '2'
    if (!global.conn.authState?.creds?.registered) {
      if (!!phoneNumber) {
        phoneNumber = phoneNumber.replace(/[^0-9+]/g, '')
      } else {
        do {
          phoneNumber = await question(chalk.bgBlack(chalk.bold.greenBright('[ ⚡️ ]  Por favor, Ingrese el número de WhatsApp.\n---> ')))
          phoneNumber = (phoneNumber || '').replace(/\D/g,'')
          if (!phoneNumber.startsWith('+')) phoneNumber = `+${phoneNumber}`
        } while (!await (async (n)=>{ try { const parsed = phoneUtil.parseAndKeepRawInput(n); return phoneUtil.isValidNumber(parsed) } catch(e){ return false } })(phoneNumber))
        rl.close()
      }
      const addNumber = phoneNumber.replace(/\D/g, '')
      try {
        console.log(chalk.cyan('[ ⚡ ]  Preparando solicitud de código, por favor espere...'))
        const codeBot = await requestPairingSafely(addNumber)
        const pretty = codeBot?.match(/.{1,4}/g)?.join('-') || codeBot
        console.log(chalk.bold.white(chalk.bgMagenta('[♡]  Código:')), chalk.bold.white(pretty))
      } catch (err) {
        console.error('❌ Error al solicitar el código:', err?.message || err)
        console.log('🔁 Reinicia el bot y espera unos segundos antes de intentarlo nuevamente.')
      }
    }
  }
}

// ----------------
// Connection update handler
// ----------------
async function connectionUpdate(update) {
  try {
    const { connection, lastDisconnect, isNewLogin } = update
    if (isNewLogin) global.conn.isInit = true
    if (connection === 'open') {
      const userName = global.conn.user?.name || global.conn.user?.verifiedName || 'Desconocido'
      console.log(chalk.green.bold(` ●Conectado a: ${userName}●`))
    }
    if (connection === 'close') {
      const reason = new Boom(lastDisconnect?.error)?.output?.statusCode || lastDisconnect?.error?.message || 'unknown'
      if (reason === DisconnectReason.loggedOut || reason === 401) {
        console.log(chalk.bold.redBright('\n Sin conexión, borra la session principal del Bot, y conéctate nuevamente.'))
      } else {
        console.log(chalk.bold.yellowBright('\n Conexión cerrada, reconectando...'))
      }
      try { await global.reloadHandler(true) } catch(e) { console.error(e) }
    }
  } catch (e) { console.error('connectionUpdate error:', e) }
}

// eventos
global.conn.ev.on('connection.update', connectionUpdate.bind(global.conn))
global.conn.ev.on('creds.update', async () => { try { await saveCreds() } catch(e) {} })

// handler loader & plugins
let handler = {}
async function loadHandler() {
  try {
    handler = await import('./handler.js?update=' + Date.now()).catch(e => { console.error('Error cargando handler:', e); return {} })
  } catch (e) { console.error(e) }
}
global.reloadHandler = async function(restatConn) {
  try { await loadHandler() } catch(e) {}
  if (restatConn) {
    try { global.conn.ws.close() } catch{}
    global.conn.ev.removeAllListeners()
    global.conn = makeWASocket(connectionOptions)
  }
  if (handler?.handler) {
    global.conn.handler = handler.handler.bind(global.conn)
    global.conn.ev.on('messages.upsert', global.conn.handler)
    global.conn.ev.on('connection.update', connectionUpdate.bind(global.conn))
    global.conn.ev.on('creds.update', saveCreds.bind(global.conn, true))
  }
  return true
}
await global.reloadHandler()

// plugins folder
const pluginFolder = global.__dirname(join(__dirname, './plugins'))
const pluginFilter = (filename) => /\.js$/.test(filename)
global.plugins = {}
async function filesInit() {
  try {
    if (!existsSync(pluginFolder)) return
    for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
      try {
        const file = global.__filename(join(pluginFolder, filename))
        const module = await import(file)
        global.plugins[filename] = module.default || module
      } catch (e) {
        console.error('plugin load error', e)
        delete global.plugins[filename]
      }
    }
  } catch (e) { console.error('filesInit error', e) }
}
await filesInit()

// watch plugins
try {
  watch(pluginFolder, async (ev, filename) => {
    if (!pluginFilter(filename)) return
    try {
      const dir = global.__filename(join(pluginFolder, filename), true)
      const err = syntaxerror(readFileSync(dir), filename, { sourceType: 'module', allowAwaitOutsideFunction: true })
      if (err) console.error('syntax error', format(err))
      else {
        const module = await import(`${global.__filename(dir)}?update=${Date.now()}`)
        global.plugins[filename] = module.default || module
        global.plugins = Object.fromEntries(Object.entries(global.plugins).sort(([a],[b]) => a.localeCompare(b)))
        console.log('updated plugin -', filename)
      }
    } catch(e){ console.error('reload plugin error', e) }
  })
} catch (e) { /* folder may not exist */ }

// safe Object.values usage helper
function safeObjectValues(obj) { if (!obj || typeof obj !== 'object') return []; return Object.values(obj) }

// limpieza periódica y mantenimiento
async function clearTmp() {
  try {
    const tmpDir = join(__dirname, 'tmp')
    if (!existsSync(tmpDir)) return
    const filenames = readdirSync(tmpDir)
    for (const file of filenames) unlinkSync(join(tmpDir, file))
  } catch(e) { console.error('clearTmp error', e) }
}
setInterval(async () => { if (!global.conn || !global.conn.user) return; await clearTmp(); console.log('⌦ TMP cleared') }, 1000 * 60 * 4)

// purge session helpers (seguro)
function purgeSession() {
  try {
    if (!existsSync(`./${vegetasessions}`)) return
    const directorio = readdirSync(`./${vegetasessions}`)
    for (const file of directorio) {
      if (file.startsWith('pre-key-')) {
        try { unlinkSync(`./${vegetasessions}/${file}`) } catch(e){}
      }
    }
  } catch(e) { console.error('purgeSession error', e) }
}
setInterval(async () => { if (!global.conn || !global.conn.user) return; purgeSession(); console.log('⌦ Session pre-keys purged') }, 1000 * 60 * 10)

// quick test de herramientas (no crítico)
async function _quickTest() {
  try {
    const test = await Promise.all([
      spawn('ffmpeg'), spawn('ffprobe'),
      spawn('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-filter_complex', 'color', '-frames:v', '1', '-f', 'webp', '-']),
      spawn('convert'), spawn('magick'), spawn('gm'), spawn('find', ['--version'])
    ].map((p) => {
      return Promise.race([
        new Promise((resolve) => { p.on('close', (code) => resolve(code !== 127)) }),
        new Promise((resolve) => { p.on('error', (_) => resolve(false)) })
      ])
    }))
    const [ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find] = test
    const s = global.support = { ffmpeg, ffprobe, ffmpegWebp, convert, magick, gm, find }
    Object.freeze(global.support)
  } catch (e) { /* no fatal */ }
}
_quickTest().catch(console.error)

console.log(chalk.greenBright('\n✔ index.js cargado — ejecuta: npm start\n'))
