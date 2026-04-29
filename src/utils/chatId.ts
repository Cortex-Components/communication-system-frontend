const CHAT_ID_KEY = 'chat_id';

function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Fallback for browsers without crypto.randomUUID
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getChatId(): string {
  const stored = localStorage.getItem(CHAT_ID_KEY);
  if (stored) {
    return stored;
  }
  const newId = generateUUID();
  localStorage.setItem(CHAT_ID_KEY, newId);
  return newId;
}
