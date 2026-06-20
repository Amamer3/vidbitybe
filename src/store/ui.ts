"use client";

import { create } from "zustand";
import type { ChatMessage } from "@/features/call-room/types";

interface UiState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  unreadChatCount: number;
  chatMessages: ChatMessage[];
  setSidebarOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setParticipantsOpen: (open: boolean) => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
  addChatMessage: (msg: ChatMessage) => void;
  incrementUnread: () => void;
  clearUnread: () => void;
  clearChatMessages: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  chatOpen: false,
  participantsOpen: false,
  unreadChatCount: 0,
  chatMessages: [],
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setParticipantsOpen: (open) => set({ participantsOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  toggleParticipants: () => set((state) => ({ participantsOpen: !state.participantsOpen })),
  addChatMessage: (msg) => set((state) => ({ chatMessages: [...state.chatMessages, msg] })),
  incrementUnread: () => set((state) => ({ unreadChatCount: state.unreadChatCount + 1 })),
  clearUnread: () => set({ unreadChatCount: 0 }),
  clearChatMessages: () => set({ chatMessages: [], unreadChatCount: 0 }),
}));
