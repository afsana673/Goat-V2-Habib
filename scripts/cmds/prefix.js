 module.exports = {
	config: {
		name: "prefix",
		version: "2.0",
		author: "Sk Habibulla",
		countDown: 5,
		role: 0,
		shortDescription: {
			en: "Show or change bot prefix"
		},
		longDescription: {
			en: "Show the bot's global/thread prefix, or change the prefix for this thread (admin only)"
		},
		category: "config",
		guide: {
			en: "   {pn}: show current prefix\n"
				+ "   {pn} <newPrefix>: change prefix for this thread only (thread admin/box admin only)\n"
				+ "   {pn} reset: reset this thread's prefix back to the global prefix (thread admin/box admin only)"
		}
	},

	langs: {
		en: {
			currentPrefix: "╭─────────────⭓\n"
				+ "│  🤖 𝗣𝗥𝗘𝗙𝗜𝗫 𝗜𝗡𝗙𝗢\n"
				+ "├─────────────⭓\n"
				+ "│ ➤ 𝗧𝗵𝗿𝗲𝗮𝗱: [ %1 ]\n"
				+ "│ ➤ 𝗚𝗹𝗼𝗯𝗮𝗹: [ %2 ]\n"
				+ "╰─────────────⭓",
			missingPermission: "╭─────────────⭓\n"
				+ "│  ❌ 𝗔𝗖𝗖𝗘𝗦𝗦 𝗗𝗘𝗡𝗜𝗘𝗗\n"
				+ "├─────────────⭓\n"
				+ "│ Only a thread admin or\n"
				+ "│ bot admin can do that.\n"
				+ "╰─────────────⭓",
			prefixChanged: "╭─────────────⭓\n"
				+ "│  ✅ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗨𝗣𝗗𝗔𝗧𝗘𝗗\n"
				+ "├─────────────⭓\n"
				+ "│ ➤ 𝗡𝗲𝘄 𝗽𝗿𝗲𝗳𝗶𝘅: [ %1 ]\n"
				+ "│ ➤ 𝗦𝗰𝗼𝗽𝗲: This thread\n"
				+ "╰─────────────⭓",
			prefixReset: "╭─────────────⭓\n"
				+ "│  ✅ 𝗣𝗥𝗘𝗙𝗜𝗫 𝗥𝗘𝗦𝗘𝗧\n"
				+ "├─────────────⭓\n"
				+ "│ ➤ 𝗕𝗮𝗰𝗸 𝘁𝗼: [ %1 ]\n"
				+ "│ ➤ 𝗦𝗰𝗼𝗽𝗲: This thread\n"
				+ "╰─────────────⭓",
			invalidPrefix: "╭─────────────⭓\n"
				+ "│  ❌ 𝗜𝗡𝗩𝗔𝗟𝗜𝗗 𝗣𝗥𝗘𝗙𝗜𝗫\n"
				+ "├─────────────⭓\n"
				+ "│ No spaces allowed &\n"
				+ "│ max length is 5 chars.\n"
				+ "╰─────────────⭓"
		}
	},

	onStart: async ({ message, args, event, threadsData, getLang, role }) => {
		const { threadID } = event;
		const globalPrefix = global.GoatBot.config.prefix;
		const threadData = await threadsData.get(threadID);
		const threadPrefix = threadData.data.prefix;

		// No arguments: just show the current prefix
		if (!args[0]) {
			return message.reply(
				getLang("currentPrefix", threadPrefix || globalPrefix, globalPrefix)
			);
		}

		// Reset thread prefix back to global
		if (args[0].toLowerCase() === "reset") {
			if (role < 1)
				return message.reply(getLang("missingPermission"));

			await threadsData.set(threadID, null, "data.prefix");
			return message.reply(getLang("prefixReset", globalPrefix));
		}

		// Otherwise, treat the argument as a new prefix for this thread
		if (role < 1)
			return message.reply(getLang("missingPermission"));

		const newPrefix = args[0];
		if (!newPrefix || newPrefix.includes(" ") || newPrefix.length > 5)
			return message.reply(getLang("invalidPrefix"));

		await threadsData.set(threadID, newPrefix, "data.prefix");
		return message.reply(getLang("prefixChanged", newPrefix));
	}
};
