import { experimental_createMCPClient } from "@ai-sdk/mcp";
import { type LanguageModel, ToolLoopAgent } from "ai";
import WebSocket from "ws";
import { WS_URL } from "../../client.ts";
import type { Metadata } from "../schema.ts";
import { createInstructions } from "./instructions.ts";

export class Companion {
	private agent: ToolLoopAgent;
	private isGenerating: boolean = false;
	private ws: WebSocket;

	constructor(agent: ToolLoopAgent) {
		this.agent = agent;
		this.ws = new WebSocket(WS_URL);

		this.ws.on("open", () => {
			console.log("Connected to WS server");
		});

		this.ws.on("message", () => {
			this.generate();
		});

		this.ws.on("close", () => {
			console.log("WS connection closed");
		});
	}

	static async initialize(metadata: Metadata, model: LanguageModel) {
		const client = await experimental_createMCPClient({
			transport: {
				type: "http",
				url: "http://localhost:3000/mcp",
			},
		});

		const tools = await client.tools();

		const instructions = createInstructions(metadata);
		const agent = new ToolLoopAgent({
			model,
			instructions,
			tools,
		});
		return new Companion(agent);
	}

	async generate() {
		if (this.isGenerating) {
			return;
		}
		this.isGenerating = true;
		try {
			const { text } = await this.agent.generate({
				prompt:
					"現在のリソース状況と会話履歴を確認して、instructionsに従って適切に発言してください。",
			});
			console.log(text);
		} finally {
			this.isGenerating = false;
		}
	}
}
