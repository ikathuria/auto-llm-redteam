import { Message, JudgeVerdict, ApiKeys } from "../types";

export interface LLMProvider {
	generateAttackerMove(
		history: Message[],
		goal: string,
		modelName: string,
		apiKeys?: ApiKeys
	): Promise<{ content: string; thought: string }>;

	generateTargetResponse(
		lastAttackerMessage: string,
		history: Message[],
		secret: string,
		baseSystemPrompt: string,
		modelName: string,
		apiKeys?: ApiKeys
	): Promise<string>;

	evaluateRound(
		history: Message[],
		secret: string,
		modelName: string,
		round: number,
		apiKeys?: ApiKeys
	): Promise<JudgeVerdict>;
}

