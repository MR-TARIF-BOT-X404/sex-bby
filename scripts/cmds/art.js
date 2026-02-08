const axios = require("axios");
const fs = require("fs-extra");
const FormData = require("form-data");
const path = require("path");

const API = "https://art-api-97wn.onrender.com/artify?style=anime";
const CACHE_DIR = path.join(__dirname, "cache");

module.exports = {
  config: {
    name: "art",
    version: "1.0.3",
    author: "AHMED TARIF",
    role: 0,
    category: "editing",
    shortDescription: { en: "AI anime art style" },
    longDescription: { en: "Reply to an image to convert it into anime art" },
    guide: { en: "Reply to an image and type: art" },
    cooldown: 5
  },

  onStart: async function ({ api, event, message }) {
    const { threadID, messageID, messageReply } = event;

    if (!messageReply?.attachments?.length)
      return message.reply("❌ অনুগ্রহ করে একটি ছবির রিপ্লাই দিন।");

    const att = messageReply.attachments[0];
    if (att.type !== "photo") return message.reply("❌ শুধু ছবির উপরেই কাজ করবে।");

    await fs.ensureDir(CACHE_DIR);

    const inPath = path.join(CACHE_DIR, `art_in_${Date.now()}.jpg`);
    const outPath = path.join(CACHE_DIR, `art_out_${Date.now()}.jpg`);

    // ✅ Wait react add
    try { await api.setMessageReaction("⏳", messageID, () => {}, true); } catch {}

    try {
      const img = await axios.get(att.url, { responseType: "arraybuffer" });
      await fs.writeFile(inPath, img.data);

      const form = new FormData();
      form.append("image", fs.createReadStream(inPath));

      const res = await axios.post(API, form, {
        headers: form.getHeaders(),
        responseType: "arraybuffer",
        timeout: 60000
      });

      await fs.writeFile(outPath, res.data);

      await api.sendMessage(
        {
          body: "🎨| • 𝐀𝐫𝐭 𝐒𝐮𝐜𝐜𝐞𝐬𝐬𝐟𝐮𝐥𝐥𝐲.....!! ",
          attachment: fs.createReadStream(outPath)
        },
        threadID,
        async () => {
          fs.remove(inPath).catch(() => {});
          fs.remove(outPath).catch(() => {});
          // ✅ Done react
          try { await api.setMessageReaction("✅", messageID, () => {}, true); } catch {}
        },
        messageID
      );
    } catch (e) {
      console.error("ART CMD ERROR:", e?.response?.data || e?.message || e);
      fs.remove(inPath).catch(() => {});
      fs.remove(outPath).catch(() => {});
      // ❌ Error react
      try { await api.setMessageReaction("❌", messageID, () => {}, true); } catch {}
      return message.reply("❌ সার্ভার/API সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।");
    }
  }
};
