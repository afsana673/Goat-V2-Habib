/**
 * onlineNotify.js
 * Sends a styled "bot is online" broadcast message to every group thread.
 *
 * USAGE:
 * This is NOT a chat command — it's a startup broadcaster.
 * Call it once, right after the bot successfully logs in, from your index.js:
 *
 *   login(appState, {}, (err, api) => {
 *     if (err) return console.error(err);
 *     require("./onlineNotify").run(api);
 *     // ...rest of your bot startup code (listenMqtt etc.)
 *   });
 *
 * If you're on GoatBot v2 core, place this call right after
 * "Logged in successfully" log inside index.js / login.js.
 */

module.exports.run = async function (api) {
  try {
    const threadList = await api.getThreadList(100, null, ["INBOX"]);
    const groupThreads = threadList.filter(t => t.isGroup);

    const message =
      "╭─────────────────╮\n" +
      "   🤖  B O T   O N L I N E  🤖\n" +
      "╰─────────────────╯\n\n" +
      "👋 Hi everyone, I am online now!\n" +
      "👑 Owner: Hr Habib\n\n" +
      "✅ Ready to assist you all!";

    let sentCount = 0;
    for (const thread of groupThreads) {
      try {
        await api.sendMessage(message, thread.threadID);
        sentCount++;
        // Small delay between messages to avoid tripping Facebook's spam/rate-limit detection
        await new Promise(resolve => setTimeout(resolve, 1500));
      } catch (err) {
        console.log(`[onlineNotify] Failed to send to thread ${thread.threadID}:`, err.message || err);
      }
    }

    console.log(`[onlineNotify] ✅ Broadcast sent to ${sentCount}/${groupThreads.length} groups.`);
  } catch (err) {
    console.log("[onlineNotify] Fatal error while broadcasting:", err);
  }
};
