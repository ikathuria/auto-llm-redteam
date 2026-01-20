import { Message, JudgeVerdict } from "../types";

export interface LLMProvider {
	generateAttackerMove(
		history: Message[],
		goal: string,
		modelName: string
	): Promise<{ content: string; thought: string }>;

	generateTargetResponse(
		lastAttackerMessage: string,
		history: Message[],
		secret: string,
		baseSystemPrompt: string,
		modelName: string
	): Promise<string>;

	evaluateRound(
		history: Message[],
		secret: string,
		modelName: string,
		round: number
	): Promise<JudgeVerdict>;
}
