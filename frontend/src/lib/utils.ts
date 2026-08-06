export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(' ');
}

export function setSessionCookie(name: string, value: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(name, value);
  }
}

export function getSessionCookie(name: string): string | null {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem(name);
  }
  return null;
}

export function deleteSessionCookie(name: string) {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(name);
  }
}
