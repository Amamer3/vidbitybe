export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
  isLocal: boolean;
}

export const CHAT_TOPIC = "chat";
