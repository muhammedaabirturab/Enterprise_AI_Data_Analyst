import { createContext, ReactNode, useContext, useMemo, useState } from "react";

interface ChatContextValue {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  pendingMessage: string | null;
  openWithMessage: (message?: string) => void;
  consumePendingMessage: () => void;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  const value = useMemo(
    () => ({
      isOpen,
      setOpen: setIsOpen,
      pendingMessage,
      openWithMessage: (message?: string) => {
        setIsOpen(true);
        if (message) setPendingMessage(message);
      },
      consumePendingMessage: () => setPendingMessage(null),
    }),
    [isOpen, pendingMessage]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChatWidget(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error("useChatWidget must be used within a ChatProvider");
  return ctx;
}
