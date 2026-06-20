export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export const CHAT_TOPIC = "chat";
