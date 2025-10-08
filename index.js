//adaptado para VEGETA-BOT-MB por BrayanOFC 
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '1'

import './config.js'
import { setupMaster, fork } from 'cluster'
import { watchFile, unwatchFile } from 'fs'
import { createRequire } from 'module'
import { fileURLToPath, pathToFileURL } from 'url'
import { platform } from 'process'
import * as ws from 'ws'
import fs, { readdirSync, statSync, unlinkSync, existsSync, mkdirSync, readFileSync } from 'fs'
import yargs from 'yargs'
import { spawn } from 'child_process'
import lodash from 'lodash'
import { vegetaJadiBot } from './plugins/jadibot-serbot.js'
import chalk from 'chalk'
import syntaxerror from 'syntax-error'
import { tmpdir } from 'os'
import { format } from 'util'
import pino from 'pino'
import path, { join } from 'path'
import { Boom } from '@hapi/boom'
import { makeWASocket, protoType, serialize } from './lib/simple.js'
import { Low, JSONFile } from 'lowdb'
import { mongoDB, mongoDBV2 } from './lib/mongoDB.js'
import store from './lib/store.js'

const { proto } = (await import('@whiskeysockets/baileys')).default
import pkg from 'google-libphonenumber'
const { PhoneNumberUtil } = pkg
const phoneUtil = PhoneNumberUtil.getInstance()
const { DisconnectReason, useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore, jidNormalizedUser, Browsers } = await import('@whiskeysockets/baileys')
import readline from 'readline'
import NodeCache from 'node-cache'

const { chain } = lodash
const PORT = process.env.PORT || process.env.SERVER_PORT || 3000

console.log(chalk.bold.redBright(`
╭━━━〔⚡️ Gaara-Ultra-MD Conexión ⚡️〕━━━⬣
┃ ✅️ Sistema ACTIVADO con éxito
┃ 🚀 ¡Prepárate para dominar con Ultra!
╰━━━━━━━━━━━━━━━━━━━━━━⬣
`))

console.log(chalk.bold.magentaBright('╭━━━〔 👑 INFO CREADOR 👑 〕━━━⬣'))
console.log(chalk.bold.cyanBright('┃ ✦ Desarrollado por xzzys26 👑'))
console.log(chalk.bold.magentaBright('╰━━━━━━━━━━━━━━━━━━━━━━⬣\n'))

protoType()
serialize()

global.__filename = function filename(pathURL = import.meta.url, rmPrefix = platform !== 'win32') {
    return rmPrefix ? /file:\/\/\//.test(pathURL) ? fileURLToPath(pathURL) : pathURL : pathToFileURL(pathURL).toString();
}; 

global.__dirname = function dirname(pathURL) {
    return path.dirname(global.__filename(pathURL, true))
}; 

global.__require = function require(dir = import.meta.url) {
    return createRequire(dir)
}

global.timestamp = {start: new Date}
const __dirname = global.__dirname(import.meta.url)
global.opts = new Object(yargs(process.argv.slice(2)).exitProcess(false).parse())
global.prefix = new RegExp('^(#|!|\\.|/)', 'i')

global.db = new Low(/https?:\/\//.test(opts['db'] || '') ? new cloudDBAdapter(opts['db']) : new JSONFile('database.json'))
global.DATABASE = global.db; 
global.loadDatabase = async function loadDatabase() {
    if (global.db.READ) {
        return new Promise((resolve) => setInterval(async function() {
            if (!global.db.READ) {
                clearInterval(this);
                resolve(global.db.data == null ? global.loadDatabase() : global.db.data)
            }
        }, 1000))
    }
    if (global.db.data !== null) return
    global.db.READ = true
    await global.db.read().catch(console.error)
    global.db.READ = null
    global.db.data = {
        users: {},
        chats: {},
        stats: {},
        msgs: {},
        sticker: {},
        settings: {},
        ...(global.db.data || {}),
    }
    global.db.chain = chain(global.db.data)
}
await global.loadDatabase()

const {state, saveState, saveCreds} = await useMultiFileAuthState(global.vegetasessions)
const msgRetryCounterCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const userDevicesCache = new NodeCache({ stdTTL: 0, checkperiod: 0 })
const { version } = await fetchLatestBaileysVersion()
let phoneNumber = global.botNumber
const methodCodeQR = process.argv.includes("qr")
const methodCode = !!phoneNumber || process.argv.includes("code")
const MethodMobile = process.argv.includes("mobile")
const colors = chalk.bold.white
const qrOption = chalk.blueBright
const textOption = chalk.cyan
const rl = readline.createInterface({ input: process.stdin, output: process.stdout })
const question = (texto) => new Promise((resolver) => rl.question(texto, resolver))
let opcion
if (methodCodeQR) opcion = '1'
if (!methodCodeQR && !methodCode && !fs.existsSync(`./${vegetasessions}/creds.json`)) {
    do {
        opcion = await question(colors("Seleccione una opción:\n") + qrOption("1. 🚀 Con código QR\n") + textOption("2. ⚡️ Con código de texto de 8 dígitos\n--> "))
        if (!/^[1-2]$/.test(opcion)) console.log(chalk.bold.redBright(`⚠︎ No se permiten numeros que no sean 1 o 2.`))
    } while (opcion !== '1' && opcion !== '2' || fs.existsSync(`./${vegetasessions}/creds.json`))
} 

const connectionOptions = {
    logger: pino({ level: 'silent' }),
    printQRInTerminal: opcion == '1' ? true : methodCodeQR ? true : false,
    mobile: MethodMobile, 
    browser: Browsers.macOS("Desktop"), 
    auth: {
        creds: state.creds,
        keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
    },
    markOnlineOnConnect: false, 
    generateHighQualityLinkPreview: true, 
    syncFullHistory: false,
    getMessage: async (key) => {
        try {
            let jid = jidNormalizedUser(key.remoteJid);
            let msg = await store.loadMessage(jid, key.id)
            return msg?.message || ""
        } catch (error) {
            return ""
        }
    },
    msgRetryCounterCache: msgRetryCounterCache || new Map(),
    userDevicesCache: userDevicesCache || new Map(),
    cachedGroupMetadata: (jid) => globalThis.conn.chats[jid] ?? {},
    version: version, 
    keepAliveIntervalMs: 55000, 
    maxIdleTimeMs: 60000, 
}

global.conn = makeWASocket(connectionOptions)
conn.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update
    if (connection === 'open') {
        console.log(chalk.green.bold(`● Conectado como: ${conn.user.name || "Desconocido"} ●`))
    } else if (connection === 'close') {
        const code = lastDisconnect?.error?.output?.statusCode
        console.log(chalk.redBright(`Conexión cerrada con código ${code}, reconectando...`))
        await global.reloadHandler(true).catch(console.error)
    }
})

global.reloadHandler = async function(restatConn) {
    let handler = await import(`./handler.js?update=${Date.now()}`).catch(console.error)
    conn.handler = handler.handler.bind(conn)
    conn.ev.on('messages.upsert', conn.handler)
    conn.ev.on('connection.update', conn.connectionUpdate)
    conn.ev.on('creds.update', saveCreds.bind(conn, true))
    return true
}

await global.reloadHandler()

// ----------- Mostrar mensajes en Termux ----------- 
conn.ev.on('messages.upsert', m => {
    m.messages.forEach(msg => {
        if (!msg.key.fromMe) {
            console.log(`[📩] ${msg.key.remoteJid}: ${JSON.stringify(msg.message)}`)
        }
    })
})

// ----------- Plugins ----------- 
const pluginFolder = join(__dirname, './plugins/index')
global.plugins = {}
const pluginFilter = filename => /\.js$/.test(filename)
for (const filename of readdirSync(pluginFolder).filter(pluginFilter)) {
    try {
        const file = global.__filename(join(pluginFolder, filename))
        const module = await import(file)
        global.plugins[filename] = module.default || module
    } catch (e) {
        console.error(e)
    }
}

// ----------- Limpieza de tmp y sesiones ----------- 
setInterval(async () => {
    const tmpDir = join(__dirname, 'tmp')
    if (existsSync(tmpDir)) readdirSync(tmpDir).forEach(f => unlinkSync(join(tmpDir, f)))
    console.log(chalk.cyanBright(`Archivos temporales eliminados.`))
}, 1000 * 60 * 4)

setInterval(async () => {
    if (!existsSync(`./${vegetasessions}`)) return
    readdirSync(`./${vegetasessions}`).forEach(f => {
        if (!f.includes('creds.json')) unlinkSync(`./${vegetasessions}/${f}`)
    })
    console.log(chalk.cyanBright(`Archivos antiguos de sesión eliminados.`))
}, 1000 * 60 * 10)
