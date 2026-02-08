const axios = require("axios");

const API = "https://api.noobs-api.rf.gd/dipto";
const prefixes = ["bby","janu","বাবু","babu","bbu","botli","bot","baby","বেবি","জানু","বট","hi","hlw","babe"];
const reacts = ["❤️","😍","😘","😎","🥰","😂","😇","🤖","😉","🔥","💋"];

const cutPrefix = (t = "") => {
  t = t.toLowerCase().trim();
  const p = prefixes.find(x => t.startsWith(x));
  return p ? t.slice(p.length).trim() : t;
};

const rand = arr => arr[Math.floor(Math.random() * arr.length)];
const reactMsg = (api, emoji, mid, d=250) =>
  setTimeout(() => api.setMessageReaction(emoji, mid, () => {}, true), d);

async function getName(api, uid) {
  const info = await api.getUserInfo(uid);
  return info?.[uid]?.name || "User";
}

async function ask(text, senderID) {
  const url = `${API}/baby?text=${encodeURIComponent(text)}&senderID=${senderID}&font=1`;
  const { data } = await axios.get(url);
  return { msg: data?.reply || "🙂", apiReact: data?.react };
}

module.exports = {
  config: {
    name: "bot",
    version: "1.8.2",
    author: "dipto•AHMED TARIF",
    role: 0,
    description: { en: "No prefix command!" },
    category: "Everyone",
    guide: { en: "type bby/bot + text or reply bot" }
  },

  onStart() {},

  async onReply({ api, event }) {
    if (!event.messageReply) return;
    try {
      const text = cutPrefix(event.body || "") || "bby";
      const name = await getName(api, event.senderID);
      const { msg, apiReact } = await ask(text, event.senderID);

      reactMsg(api, rand(reacts), event.messageID, 200);
      if (apiReact) reactMsg(api, apiReact, event.messageID, 400);

      api.sendMessage(
        { body: msg, mentions: [{ tag: name, id: event.senderID }] },
        event.threadID,
        (err, info) => {
          if (!err)
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
        },
        event.messageID
      );
    } catch (e) {
      console.error(e?.message || e);
      api.sendMessage("🥹 Error occurred while replying!", event.threadID, event.messageID);
    }
  },

  async onChat({ api, event }) {
    if (event.messageReply) return;
    if (event.senderID == api.getCurrentUserID()) return;

    const body = (event.body || "").trim();
    const low = body.toLowerCase();
    if (!prefixes.some(p => low.startsWith(p))) return;

    const tl = [
      "•এই নেও পটিয়ে দেখাও m.me/61552422054139 ",
      "•বলেন sir___😌",
      "• বলেন ম্যাডাম__😌",
      "• ওই মামা_আর ডাকিস না প্লিজ__😡🙂",
      "• 𝗜 𝗹𝗼𝘃𝗲 𝘆𝗼𝘂__😘😘",
      "• 𝗕𝗯𝘆 না বলে 𝗕𝗼𝘄 বলো___❤‍🩹😘",
      "• 🍺 এই নাও জুস খাও..!𝗕𝗯𝘆 বলতে বলতে হাপায় গেছো না 🥲",
      "• 𝗕𝗲𝘀𝗵𝗶 𝗱𝗮𝗸𝗹𝗲 𝗮𝗺𝗺𝘂 𝗯𝗼𝗸𝗮 𝗱𝗲𝗯𝗮 𝘁𝗼__🥺",
      "• আজকে আমার মন ভালো নেই__🙉",
      "• [███████]100%",
      "• ভুলে জাও আমাকে_____😞😞",
      "• কথা দেও আমাকে পটাবা...!! 😌",
      "• আমি অন্যের জিনিসের সাথে কথা বলি না__😏ওকে",
      "• ভালো হয়ে  যাও____😑😒",
      "• ৩২ তারিখ আমার বিয়ে___🐤"
    ];

    try {
      const parts = low.split(/\s+/);

      const name = await getName(api, event.senderID);
      reactMsg(api, rand(reacts), event.messageID, 200);

      // শুধু prefix লিখলে TL reply
      if (parts.length === 1) {
        return api.sendMessage(
          { body: `乄 ${name} 乄\n\n𓍯 ${rand(tl)}`, mentions: [{ tag: name, id: event.senderID }] },
          event.threadID,
          (err, info) => {
            if (!err)
              global.GoatBot.onReply.set(info.messageID, {
                commandName: "bot",
                type: "reply",
                messageID: info.messageID,
                author: event.senderID
              });
          },
          event.messageID
        );
      }

      // prefix + text দিলে API reply
      const text = cutPrefix(low);
      const { msg, apiReact } = await ask(text, event.senderID);
      if (apiReact) reactMsg(api, apiReact, event.messageID, 400);

      api.sendMessage(
        { body: msg, mentions: [{ tag: name, id: event.senderID }] },
        event.threadID,
        (err, info) => {
          if (!err)
            global.GoatBot.onReply.set(info.messageID, {
              commandName: "bot",
              type: "reply",
              messageID: info.messageID,
              author: event.senderID
            });
        },
        event.messageID
      );
    } catch (e) {
      console.error(e?.message || e);
      api.sendMessage("⚠️ Error while contacting API", event.threadID, event.messageID);
    }
  }
};
