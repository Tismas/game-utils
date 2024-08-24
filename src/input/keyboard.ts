import { deepEqual } from "../data/deepEqual";

interface KeyInfo {
  pressed: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

type Key = string | Array<string>;
interface ListenerKey {
  key: Key;
  /** Does all keys in key array need to be pressed to trigger callback @default true */
  allKeysAtOnce?: boolean;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
}

export const keyboard = new Map<string, KeyInfo>();
const keyListeners = new Map<ListenerKey, Set<() => void>>();

window.addEventListener("blur", () => {
  keyboard.clear();
});

document.addEventListener("keydown", (event) => {
  const keyInfo = {
    pressed: true,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
  };

  if (deepEqual(keyboard.get(event.key), keyInfo)) return;

  keyboard.set(event.key, keyInfo);

  keyListeners.forEach((listeners, listenerKey) => {
    if (listenerKey.altKey !== event.altKey) return;
    if (listenerKey.ctrlKey !== event.ctrlKey) return;
    if (listenerKey.shiftKey !== event.shiftKey) return;

    if (Array.isArray(listenerKey.key)) {
      if (listenerKey.allKeysAtOnce ?? true) {
        if (listenerKey.key.every((key) => keyboard.get(key)?.pressed)) {
          listeners.forEach((listener) => listener());
        }
      } else {
        if (listenerKey.key.includes(event.key)) {
          listeners.forEach((listener) => listener());
        }
      }
    } else {
      if (listenerKey.key === event.key) {
        listeners.forEach((listener) => listener());
      }
    }
  });
});

document.addEventListener("keyup", (event) => {
  keyboard.set(event.key, {
    pressed: false,
    altKey: event.altKey,
    ctrlKey: event.ctrlKey,
    shiftKey: event.shiftKey,
  });
});

interface KeyPressOptions {
  altKey?: boolean;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  /** Does all keys in key array need to be pressed to trigger callback @default true */
  allKeysAtOnce?: boolean;
}

export const isKeyPressed = (key: string, { altKey, ctrlKey, shiftKey }: KeyPressOptions = {}): boolean => {
  const keyInfo = keyboard.get(key);

  if (!keyInfo) return false;

  if (keyInfo.altKey ?? false !== altKey) return false;
  if (keyInfo.ctrlKey ?? false !== ctrlKey) return false;
  if (keyInfo.shiftKey ?? false !== shiftKey) return false;

  return keyInfo ? keyInfo.pressed : false;
};

export const addKeyPressListener = (key: Key, callback: () => void, { altKey, ctrlKey, shiftKey }: KeyPressOptions = {}) => {
  const listenerKey: ListenerKey = {
    key,
    altKey: altKey ?? false,
    ctrlKey: ctrlKey ?? false,
    shiftKey: shiftKey ?? false,
  };

  const existingListeners = keyListeners.get(listenerKey);
  if (existingListeners) {
    existingListeners.add(callback);
  } else {
    keyListeners.set(listenerKey, new Set([callback]));
  }
};

export const removeKeyPressListener = (key: Key, callback: () => void, { altKey, ctrlKey, shiftKey }: KeyPressOptions = {}) => {
  const listenerKey: ListenerKey = {
    key,
    altKey: altKey ?? false,
    ctrlKey: ctrlKey ?? false,
    shiftKey: shiftKey ?? false,
  };

  const existingListeners = keyListeners.get(listenerKey);
  if (existingListeners) {
    existingListeners.delete(callback);
  }
};
