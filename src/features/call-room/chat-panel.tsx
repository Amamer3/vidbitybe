"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useLocalParticipant, useRoomContext } from "@livekit/components-react";
import { RoomEvent } from "livekit-client";
import { Send, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CHAT_TOPIC, type ChatMessage } from "@/features/call-room/types";
import { useUiStore } from "@/store/ui";
import { cn } from "@/lib/utils";

export function ChatPanel() {
  const room = useRoomContext();
  const { localParticipant } = useLocalParticipant();
  const { toggleChat } = useUiStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const senderName =
    localParticipant.name || localParticipant.identity || "You";

  useEffect(() => {
    const handleData = (
      payload: Uint8Array,
      participant?: { identity?: string; name?: string },
      _kind?: unknown,
      topic?: string,
    ) => {
      if (topic !== CHAT_TOPIC) return;
      try {
        const decoded = JSON.parse(new TextDecoder().decode(payload)) as Omit<
          ChatMessage,
          "id"
        >;
        setMessages((prev) => [
          ...prev,
          {
            ...decoded,
            id: `${decoded.timestamp}-${decoded.sender}-${Math.random()}`,
          },
        ]);
      } catch {
        // ignore malformed messages
      }
    };

    room.on(RoomEvent.DataReceived, handleData);
    return () => {
      room.off(RoomEvent.DataReceived, handleData);
    };
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed) return;

    const message: Omit<ChatMessage, "id"> = {
      sender: senderName,
      text: trimmed,
      timestamp: Date.now(),
    };

    const encoded = new TextEncoder().encode(JSON.stringify(message));
    await localParticipant.publishData(encoded, { reliable: true, topic: CHAT_TOPIC });

    setMessages((prev) => [
      ...prev,
      { ...message, id: `${message.timestamp}-${message.sender}-local` },
    ]);
    setText("");
  }, [localParticipant, senderName, text]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-zinc-800 bg-zinc-950">
      <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
        <div>
          <h3 className="font-semibold text-zinc-100">In-call chat</h3>
          <p className="text-xs text-zinc-500">Messages disappear when the call ends</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleChat}
          className="text-zinc-400 hover:bg-zinc-800 hover:text-zinc-100 lg:hidden"
          aria-label="Close chat panel"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full min-h-[12rem] flex-col items-center justify-center text-center">
            <p className="text-sm text-zinc-500">No messages yet</p>
            <p className="mt-1 text-xs text-zinc-600">Say hello to everyone in the call</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.sender === senderName;
            return (
              <div
                key={msg.id}
                className={cn("flex flex-col", isOwn ? "items-end" : "items-start")}
              >
                {!isOwn && (
                  <span className="mb-1 text-xs text-zinc-500">{msg.sender}</span>
                )}
                <div
                  className={cn(
                    "max-w-[85%] rounded-2xl px-3.5 py-2 text-sm",
                    isOwn
                      ? "rounded-br-md bg-primary text-primary-foreground"
                      : "rounded-bl-md bg-zinc-800 text-zinc-100",
                  )}
                >
                  {msg.text}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      <div className="border-t border-zinc-800 p-3">
        <div className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            className="border-zinc-700 bg-zinc-900 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-primary"
          />
          <Button
            size="icon"
            onClick={() => void sendMessage()}
            disabled={!text.trim()}
            className="shrink-0 rounded-xl"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </aside>
  );
}
