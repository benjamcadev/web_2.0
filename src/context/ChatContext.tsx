// context/ChatContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ClientData {
  nombre: string;
  email: string;
  telefono: string;
}

interface ChatState {
  pendingRut: string | null;
  clientData: ClientData | null;
  pendingAttempts: number;
}

interface ChatContextType extends ChatState {
  setPendingRut: (rut: string | null) => void;
  setClientData: (data: ClientData | null) => void;
  setPendingAttempts: (attempts: number) => void;
  incrementAttempts: () => void;
  resetPending: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [pendingRut, setPendingRut] = useState<string | null>(null);
  const [clientData, setClientData] = useState<ClientData | null>(null);
  const [pendingAttempts, setPendingAttempts] = useState(0);

  const incrementAttempts = () => {
    setPendingAttempts(prev => prev + 1);
  };

  const resetPending = () => {
    setPendingRut(null);
    setClientData(null);
    setPendingAttempts(0);
  };

  const value: ChatContextType = {
    pendingRut,
    clientData,
    pendingAttempts,
    setPendingRut,
    setClientData,
    setPendingAttempts,
    incrementAttempts,
    resetPending,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChatContext() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChatContext must be used within ChatProvider');
  }
  return context;
}