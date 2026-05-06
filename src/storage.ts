import type { Memo, Settings, Tag, VoiceCommands } from './types';
import { DEFAULT_SETTINGS, DEFAULT_VOICE_COMMANDS } from './types';

const KEY_MEMOS = 'voicememo:memos';
const KEY_TAGS = 'voicememo:tags';
const KEY_CMDS = 'voicememo:commands';
const KEY_SETTINGS = 'voicememo:settings';
const KEY_CLOUD = 'voicememo:cloud';

export function loadMemos(): Memo[] {
  try {
    const raw = localStorage.getItem(KEY_MEMOS);
    return raw ? (JSON.parse(raw) as Memo[]) : [];
  } catch {
    return [];
  }
}

export function saveMemos(memos: Memo[]): void {
  localStorage.setItem(KEY_MEMOS, JSON.stringify(memos));
}

export function loadTags(): Tag[] {
  try {
    const raw = localStorage.getItem(KEY_TAGS);
    if (!raw) {
      const seed = defaultTags();
      saveTags(seed);
      return seed;
    }
    const tags = JSON.parse(raw) as Tag[];
    return tags.length ? tags : defaultTags();
  } catch {
    return defaultTags();
  }
}

export function saveTags(tags: Tag[]): void {
  localStorage.setItem(KEY_TAGS, JSON.stringify(tags));
}

export function loadCommands(): VoiceCommands {
  try {
    const raw = localStorage.getItem(KEY_CMDS);
    if (!raw) return DEFAULT_VOICE_COMMANDS;
    return { ...DEFAULT_VOICE_COMMANDS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_VOICE_COMMANDS;
  }
}

export function saveCommands(cmds: VoiceCommands): void {
  localStorage.setItem(KEY_CMDS, JSON.stringify(cmds));
}

export function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(KEY_SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings): void {
  localStorage.setItem(KEY_SETTINGS, JSON.stringify(settings));
}

export type CloudState = {
  googleDrive: { connected: boolean; lastSyncIso?: string };
  iCloud: { connected: boolean; lastSyncIso?: string };
  dropbox: { connected: boolean; lastSyncIso?: string };
};

const DEFAULT_CLOUD: CloudState = {
  googleDrive: { connected: false },
  iCloud: { connected: false },
  dropbox: { connected: false },
};

export function loadCloud(): CloudState {
  try {
    const raw = localStorage.getItem(KEY_CLOUD);
    if (!raw) return DEFAULT_CLOUD;
    return { ...DEFAULT_CLOUD, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_CLOUD;
  }
}

export function saveCloud(state: CloudState): void {
  localStorage.setItem(KEY_CLOUD, JSON.stringify(state));
}

export function purgeOldTrash(memos: Memo[], days: number): Memo[] {
  const cutoff = Date.now() - days * 86400000;
  return memos.filter((m) => {
    if (!m.deletedAt) return true;
    return new Date(m.deletedAt).getTime() > cutoff;
  });
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function nowIso(): string {
  return new Date().toISOString();
}

function defaultTags(): Tag[] {
  const now = new Date().toISOString();
  return [
    { id: 'tag-work', name: '💼 会社のこと', reading: 'かいしゃのこと', usageCount: 0, createdAt: now },
    { id: 'tag-private', name: '🏠 プライベート', reading: 'ぷらいべーと', usageCount: 0, createdAt: now },
    { id: 'tag-idea', name: '💡 アイデア', reading: 'あいであ', usageCount: 0, createdAt: now },
    { id: 'tag-shop', name: '🛒 買い物', reading: 'かいもの', usageCount: 0, createdAt: now },
  ];
}
