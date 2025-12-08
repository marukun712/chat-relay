import readline from "node:readline";
import WebSocket from "ws";

export const WS_URL = "ws://localhost:3000";
export const ADD_URL = "http://localhost:3000/add";
const FROM_NAME = "user";

const ws = new WebSocket(WS_URL);

ws.on("open", () => {
	console.log("Connected to WS server");
});

ws.on("message", (data) => {
	try {
		const msg = JSON.parse(data.toString());
		if (msg.type === "newMessage") {
			console.log(`[${msg.message.from}] ${msg.message.message}`);
		}
	} catch (err) {
		console.error("Failed to parse WS message:", err);
	}
});

ws.on("close", () => {
	console.log("WS connection closed");
});

const rl = readline.createInterface({
	input: process.stdin,
	output: process.stdout,
	terminal: true,
	prompt: "> ",
});

async function sendMessage(message: string) {
	try {
		const res = await fetch(ADD_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ from: FROM_NAME, message }),
		});
		if (!res.ok) {
			const text = await res.text();
			throw new Error(text);
		}
	} catch (err) {
		console.error("Failed to send message:", err);
	}
}

rl.on("line", async (line) => {
	const trimmed = line.trim();
	if (trimmed) await sendMessage(trimmed);
});
