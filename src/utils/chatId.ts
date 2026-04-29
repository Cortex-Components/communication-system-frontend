const CHAT_ID_KEY = 'chat_id';

export function getChatId(): string {
  const stored = localStorage.getItem(CHAT_ID_KEY);
  if (stored) {
    return stored;
  }
  const newId = crypto.randomUUID();
  localStorage.setItem(CHAT_ID_KEY, newId);
  return newId;
}
