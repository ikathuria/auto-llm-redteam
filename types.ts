export enum AgentRole {
  ATTACKER = 'Red Team',
  TARGET = 'Blue Team',
  JUDGE = 'Arbiter',
  SYSTEM = 'System'
}

export interface Message {
  id: string;
  role: AgentRole;
  content: string;
  thought?: string;
  timestamp: number;
}

export interface SimulationConfig {
  targetSecret: string;
  targetSystemPrompt: string;
  attackerGoal: string;
  maxRounds: number;
  modelName: string; // e.g., gemini-2.5-flash
}

export interface JudgeVerdict {
  round: number;
  attackerSuccess: boolean;
  score: number; // 0-100 likelihood of leak
  reasoning: string;
  winner?: 'Red' | 'Blue';
}

export enum SimulationStatus {
  IDLE = 'IDLE',
  RUNNING = 'RUNNING',
  PAUSED = 'PAUSED',
  FINISHED = 'FINISHED'
}
