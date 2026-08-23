const fs = require("fs-extra");
const path = require("path");
const axios = require("axios");

const assetsDir = path.join(__dirname, "assets");
const statsPath = path.join(assetsDir, "owner_stats.json");

// ✅ যে ফেসবুক প্রোফাইলের ছবি ব্যবহার করতে চান তার ID
const OWNER_FB_ID = "100093182723125";

// ✅ ব্যবহারের সংখ্যা ট্র্যাক করার হেল্পার
function getAndIncrementUsageCount() {
	fs.ensureDirSync(assetsDir);
	let stats = { count: 0 };
	try {
		if (fs.existsSync(statsPath)) stats = fs.readJsonSync(statsPath);
	} catch (e) {}
	stats.count = (stats.count || 0) + 1;
	try { fs.writeJsonSync(statsPath, stats); } catch (e) {}
	return stats.count;
}

module.exports = {
	config: {
		name: "owner",
		aliases: ["info", "botowner", "own", "about"],
		version: "4.2",
		author: "Sk Habibulla",
		countDown: 5,
		role: 0,
		description: {
			en: "👑 Show premium owner information card"
		},
		category: "info",
		guide: {
			en: "{pn}"
		}
	},

	onStart: async function ({ message, event, api }) {
		const ownerName = "Sk Habib";
		const nick = "♡┋Habib᭡";
		const relation = "Single";
		const profession = "Gorib";
		const memberSince = "2023";

		const usageCount = getAndIncrementUsageCount();

		const loadingInfo = await message.reply("⏳ Loading owner card...");

		const now = new Date();
		const time = now.toLocaleString("en-BD", {
			timeZone: "Asia/Kolkata",
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
			hour12: true
		});
		const dateStr = now.toLocaleDateString("en-BD", {
			timeZone: "Asia/Kolkata",
			day: "2-digit",
			month: "short",
			year: "numeric"
		});

		const footers = [
			"✦ Powered by Habib Bot ✦",
			"✦ Made with ❤️ by Sk Habib ✦",
			"✦ Owner is always watching ✦",
			"✦ Respect the Owner ✦"
		];
		const randomFooter = footers[Math.floor(Math.random() * footers.length)];

		const body =
`╭─────────────────╮
│  👑 𝙊𝙒𝙉𝙀𝙍  𝙄𝙉𝙁𝙊 👑  │
╰─────────────────╯

👤 𝙉𝙖𝙢𝙚       : ${ownerName}
🧸 𝙉𝙞𝙘𝙠       : ${nick}
💘 𝙍𝙚𝙡𝙖𝙩𝙞𝙤𝙣  : ${relation}
🎓 𝙋𝙧𝙤𝙛𝙚𝙨𝙨𝙞𝙤𝙣 : ${profession}
📆 𝙈𝙚𝙢𝙗𝙚𝙧 𝙨𝙞𝙣𝙘𝙚: ${memberSince}

╭──── 📊 𝙎𝙏𝘼𝙏𝙎 ────╮
📅 𝘿𝙖𝙩𝙚       : ${dateStr}
⏰ 𝙏𝙞𝙢𝙚       : ${time}
🔥 𝙑𝙞𝙚𝙬𝙚𝙙     : ${usageCount} 𝙩𝙞𝙢𝙚𝙨
📍 𝙎𝙩𝙖𝙩𝙪𝙨     : Online ✅
╰──────────────────╯

${randomFooter}`;

		const imageStream = await resolveOwnerImage();

		try {
			if (imageStream) {
				await api.unsendMessage(loadingInfo.messageID);
				const sent = await message.reply({ body, attachment: imageStream });
				try { api.setMessageReaction("👑", sent.messageID, () => {}, true); } catch (e) {}
			} else {
				await api.unsendMessage(loadingInfo.messageID);
				const sent = await message.reply(body + "\n\n⚠️ Image load failed");
				try { api.setMessageReaction("👑", sent.messageID, () => {}, true); } catch (e) {}
			}
		} catch (err) {
			console.log("[owner] সেন্ড করতে ব্যর্থ:", err.message);
			return message.reply(body);
		}
	}
};

// ═══════════ Helper: শুধু Facebook profile picture রিসলভ করা ═══════════
async function resolveOwnerImage() {
	try {
		fs.ensureDirSync(assetsDir);

		// শুধু Facebook Graph API দিয়ে প্রোফাইল পিকচার ফেচ (লোকাল ছবি বাদ)
		const imgUrl = `https://graph.facebook.com/${OWNER_FB_ID}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

		const res = await axios.get(imgUrl, {
			responseType: "arraybuffer",
			timeout: 15000,
			maxRedirects: 5,
			headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
		});

		const tempPath = path.join(assetsDir, "owner_fb_temp.jpg");
		fs.writeFileSync(tempPath, Buffer.from(res.data));
		return fs.createReadStream(tempPath);
	} catch (err) {
		console.log("[owner] ছবি রিসলভ করতে ব্যর্থ:", err.message);
		return null;
	}
      }
