//================ CONFIG.JS =================//

import { watchFile, unwatchFile } from 'fs' 
import chalk from 'chalk'
import { fileURLToPath } from 'url'
import fs from 'fs'
import fetch from 'node-fetch'
import axios from 'axios'
import moment from 'moment-timezone'

//================ DATOS DEL BOT =================//

global.botNumber = '' //Número del bot opcional
global.owner = [
  ['59898719147', 'Feli', true], // tu número como dueño
  ['59896026646', 'G', true], 
  ['119069730668723', 'FeliLID', true], // tu LID
  ['262573496758272', 'GerLID', true] 
]

global.mods = []
global.suittag = ['59898719147'] 
global.prems = []

global.libreria = 'Baileys'
global.baileys = 'V 6.7.17'
global.languaje = 'Español'
global.vs = '2.13.2'
global.vsJB = '5.0'
global.nameqr = 'FelixCat-Bot' 
global.namebot = 'FelixCat-Bot'
global.vegetasessions = 'GaaraSessions'
global.jadi = 'JadiBots' 
global.vegetaJadibts = true

global.packname = `Feli FelixCat-Bot`
global.botname = '𝗙𝗘𝗟𝗜 𝗙𝗘𝗟𝗜𝗫𝗖𝗔𝗧-𝗕𝗢𝗧'
global.dev = '𝙿𝙾𝚆𝙴𝚁𝙳 𝙱𝚈 𝙵𝙴𝙻𝙸'
global.textbot = '𝐁𝐲 𝐅𝐞𝐥𝐢 𝐅𝐞𝐥𝐢𝐱𝐂𝐚𝐭-𝐁𝐨𝐭'

global.moneda = 'coin'
global.welcom1 = '𝙀𝙙𝙞𝙩𝙖 𝘾𝙤𝙣 𝙀𝙡 𝘾𝙤𝙢𝙖𝙣𝙙𝙤 𝙎𝙚𝙩𝙬𝙚𝙡𝙘𝙤𝙢𝙚'
global.welcom2 = '𝙀𝙙𝙞𝙩𝙖 𝘾𝙤𝙣 𝙀𝙡 𝘾𝙤𝙢𝙖𝙣𝙙𝙤 𝙎𝙚𝙩𝙗𝙮𝙚'
global.banner = 'https://files.catbox.moe/j0z1kz.jpg'
global.catalogo = 'https://files.catbox.moe/j0z1kz.jpg'

global.gp1 = 'https://chat.whatsapp.com/HaKf6ezcwdbGzmH782eBal?mode=r_c'
global.comunidad1 = 'https://chat.whatsapp.com/I0dMp2fEle7L6RaWBmwlAa'
global.channel = 'https://whatsapp.com/channel/0029Vb5yFNP72WU14BQqel1V'
global.md = 'https://github.com/FelipeBali/FelixCat-Bot.git'
global.correo = 'erenxz01@gmail.com'

//================ ESTILO Y OTROS =================//

global.estilo = { key: { fromMe: false, participant: `0@s.whatsapp.net` }, message: { orderMessage: { itemCount : -999999, status: 1, surface : 1, message: global.packname, orderTitle: 'Bang', thumbnail: global.catalogo, sellerJid: '0@s.whatsapp.net'}}}
global.ch = { ch1: '120363417252896376@newsletter', ch2: "120363417252896376@newsletter", ch3: "120363417252896376@newsletter" }
global.multiplier = 60
global.fs = fs
global.fetch = fetch
global.axios = axios
global.moment = moment   

//================ WATCH CONFIG =================//

let file = fileURLToPath(import.meta.url)
watchFile(file, () => {
  unwatchFile(file)
  console.log(chalk.redBright("Update 'config.js'"))
  import(`${file}?update=${Date.now()}`)
})

//================ PLUGIN ANTI-LINK =================//

const groupLinkRegex = /chat.whatsapp.com\/(?:invite\/)?([0-9A-Za-z]{20,24})/i

export async function before(m, { conn }) {
    if (!m || !m.text) return
    if (m.isBaileys && m.fromMe) return !0
    if (!m.isGroup) return !1

    let chat = global.db?.data?.chats?.[m.chat]
    if (!chat) {
        if (global.db?.data?.chats) global.db.data.chats[m.chat] = { antiLink: false }
        chat = global.db?.data?.chats?.[m.chat]
    }

    if (!chat.antiLink) return !0

    if (m.text.match(groupLinkRegex)) {
        try {
            await conn.sendMessage(m.chat, { delete: m.key }) // borrar mensaje
            await conn.reply(m.chat, `> ⚠️ @${m.sender.split`@`[0]} fue eliminado por Anti-Link`, null, { mentions: [m.sender] })
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove') // expulsar usuario
            console.log(`Usuario ${m.sender} eliminado del grupo ${m.chat} por Anti-Link`)
        } catch (error) {
            console.error("Error eliminando mensaje o expulsando usuario:", error)
        }
    }
    return !0
}

export async function antilinkCommand(m, { conn, args, isAdmin }) {
    if (!m.isGroup) return conn.reply(m.chat, "Este comando solo funciona en grupos.", m)
    if (!isAdmin) return conn.reply(m.chat, "Solo administradores pueden activar/desactivar Anti-Link.", m)

    let chat = global.db.data.chats[m.chat]
    if (!chat) {
        global.db.data.chats[m.chat] = { antiLink: true }
        chat = global.db.data.chats[m.chat]
    } else {
        chat.antiLink = !chat.antiLink
    }

    await global.db.write()
    conn.reply(m.chat, `✅ Anti-Link ahora está ${chat.antiLink ? "activado" : "desactivado"} en este grupo.`, m)
}
