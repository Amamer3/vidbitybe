"use client";

import { create } from "zustand";

interface UiState {
  sidebarOpen: boolean;
  chatOpen: boolean;
  participantsOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  setChatOpen: (open: boolean) => void;
  setParticipantsOpen: (open: boolean) => void;
  toggleChat: () => void;
  toggleParticipants: () => void;
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: false,
  chatOpen: false,
  participantsOpen: false,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setChatOpen: (open) => set({ chatOpen: open }),
  setParticipantsOpen: (open) => set({ participantsOpen: open }),
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  toggleParticipants: () =>
    set((state) => ({ participantsOpen: !state.participantsOpen })),
}));
