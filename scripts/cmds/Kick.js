const { drive } = global.utils;
const { createCanvas, loadImage, registerFont } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

const fontDir = path.join(process.cwd(), "scripts/cmds/assets/font");
const canvasFontDir = path.join(process.cwd(), "scripts/cmds/canvas/fonts");

// Font Register
registerFont(path.join(fontDir, "NotoSans-Bold.ttf"), { family: "NotoSans", weight: "bold" });
registerFont(path.join(fontDir, "NotoSans-SemiBold.ttf"), { family: "NotoSans", weight: "600" });
registerFont(path.join(fontDir, "BeVietnamPro-Bold.ttf"), { family: "BeVietnamPro", weight: "bold" });
registerFont(path.join(fontDir, "Kanit-SemiBoldItalic.ttf"), { family: "Kanit", weight: "600", style: "italic" });

async function createKickCard(userName, threadName, memberCount, kickerName, userID, kickerID, gcImg, api) {
    const W = 1200, H = 600;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, W, H);

    // Red gradient overlay
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "rgba(185, 28, 28, 0.85)");
    grad.addColorStop(1, "rgba(15, 23, 42, 0.95)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    async function loadImg(url) {
        try {
            if (!url) return null;
            const res = await require("axios").get(url, { responseType: "arraybuffer" });
            return await loadImage(Buffer.from(res.data));
        } catch { return null; }
    }

    const [userImg, kickerImg, groupImg] = await Promise.all([
        loadImg(`https://graph.facebook.com/${userID}/picture?width=720&height=720`),
        loadImg(`https://graph.facebook.com/${kickerID}/picture?width=720&height=720`),
        groupImg ? loadImg(gcImg) : null
    ]);

    function drawCircle(ctx, img, x, y, r, color) {
        ctx.save();
        ctx.shadowColor = color;
        ctx.shadowBlur = 25;
        ctx.beginPath();
        ctx.arc(x, y, r + 6, 0, Math.PI * 2);
        ctx.strokeStyle = color;
        ctx.lineWidth = 6;
        ctx.stroke();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.clip();
        if (img) ctx.drawImage(img, x - r, y - r, r * 2, r * 2);
        else {
            ctx.fillStyle = "#1f2937";
            ctx.fill();
        }
        ctx.restore();
    }

    // User Avatar
    drawCircle(ctx, userImg, 180, 380, 68, "#ef4444");

    // Group Image
    if (groupImg) {
        ctx.save();
        ctx.beginPath();
        ctx.arc(600, 220, 95, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(groupImg, 505, 125, 190, 190);
        ctx.restore();
    }

    // Kicker Avatar
    drawCircle(ctx, kickerImg, 1020, 140, 52, "#b91c1c");

    // Texts
    ctx.textAlign = "center";
    ctx.fillStyle = "#f3e8ff";
    ctx.font = "bold 48px NotoSans";
    ctx.fillText("GOODBYE", 600, 420);

    ctx.font = "600 32px NotoSans";
    ctx.fillStyle = "#fca5a5";
    ctx.fillText(userName.toUpperCase(), 600, 480);

    ctx.font = "600 26px NotoSans";
    ctx.fillStyle = "#e2e8f0";
    ctx.fillText(`${threadName}`, 600, 525);

    ctx.font = "500 22px NotoSans";
    ctx.fillStyle = "#94a3b8";
    ctx.fillText(`Kicked by ${kickerName} • Now ${memberCount} members`, 600, 565);

    const tempPath = path.join(__dirname, `kick_${Date.now()}.png`);
    await fs.writeFile(tempPath, canvas.toBuffer("image/png"));
    return tempPath;
}

module.exports = {
    config: {
        name: "goodbye",
        version: "1.5",
        author: "Grok",
        category: "events"
    },

    langs: {
        en: {
            defaultGoodbye: "😢 {userName} was kicked from {threadName}\nKicked by: {kickerName}"
        }
    },

    onStart: async ({ threadsData, event, message, usersData, getLang, api }) => {
        if (event.logMessageType !== "log:unsubscribe") return;

        try {
            const threadData = await threadsData.get(event.threadID);
            if (!threadData?.settings?.sendWelcomeMessage) return; // You can change this key later

            const leftUserID = event.logMessageData?.leftParticipantFbId;
            if (!leftUserID) return;

            const kickerID = event.author;
            const threadName = threadData.threadName || "this group";
            const memberCount = threadData.members?.length || 1;
            const userName = await usersData.getName(leftUserID);
            const kickerName = await usersData.getName(kickerID);

            let imagePath = null;
            try {
                const gcImg = threadData.imageSrc;
                imagePath = await createKickCard(userName, threadName, memberCount, kickerName, leftUserID, kickerID, gcImg, api);
            } catch (e) {
                console.error("Kick card error:", e);
            }

            let msg = threadData.data?.goodbyeMessage || getLang("defaultGoodbye");
            msg = msg
                .replace(/\{userName\}/g, userName)
                .replace(/\{threadName\}/g, threadName)
                .replace(/\{kickerName\}/g, kickerName)
                .replace(/\{memberCount\}/g, memberCount);

            const form = {
                body: msg,
                mentions: [{ tag: userName, id: leftUserID }]
            };

            if (imagePath && fs.existsSync(imagePath)) {
                form.attachment = fs.createReadStream(imagePath);
            }

            await message.send(form);

            if (imagePath) {
                setTimeout(() => fs.unlink(imagePath).catch(() => {}), 7000);
            }
        } catch (err) {
            console.error("[GOODBYE] Error:", err);
        }
    }
};
