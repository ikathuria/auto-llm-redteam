import { GeminiService } from "./geminiService";
import { GroqService } from "./groqService";
import { OpenAIService } from "./openaiService";
import { LLMProvider } from "./llmTypes";

export const getLLMProvider = (modelName: string): LLMProvider => {
	if (modelName.startsWith("llama") || modelName.startsWith("mixtral")) {
		return GroqService;
	}
	if (modelName.startsWith("gpt")) {
		return OpenAIService;
	}
	// Default to Gemini
	return GeminiService;
};
