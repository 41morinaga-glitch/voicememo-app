export type Memo = {
  id: string;
  title: string;
  body: string;
  tagId: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

export type Tag = {
  id: string;
  name: string;
  reading?: string;
  usageCount: number;
  createdAt: string;
};

export type VoiceCommands = {
  startRecording: string;
  setTitle: string;
  setTag: string;
  save: string;
  cancel: string;
  readAloud: string;
};

export type View =
  | { name: 'memoList' }
  | { name: 'recording'; appendToMemoId?: string }
  | { name: 'save'; draft: Draft; appendToMemoId?: string }
  | { name: 'edit'; memoId: string }
  | { name: 'trash' }
  | { name: 'settings' }
  | { name: 'cloud' }
  | { name: 'voiceCommands' }
  | { name: 'search' };

export type Settings = {
  maxRecordingSec: number;
  language: string;
  notifySound: boolean;
  vibrate: boolean;
  trashAutoDeleteDays: number;
  pdfFont: string;
};

export const DEFAULT_SETTINGS: Settings = {
  maxRecordingSec: 30,
  language: 'ja-JP',
  notifySound: true,
  vibrate: true,
  trashAutoDeleteDays: 30,
  pdfFont: 'Noto Sans JP',
};

export type Draft = {
  title: string;
  body: string;
  durationSec: number;
  tagPhrase?: string;
  suggestedTagId?: string;
  autoSave?: boolean;
};

export const DEFAULT_VOICE_COMMANDS: VoiceCommands = {
  startRecording: '録音開始',
  setTitle: 'タイトルは',
  setTag: 'タグは',
  save: '保存',
  cancel: 'キャンセル',
  readAloud: '読んで',
};
