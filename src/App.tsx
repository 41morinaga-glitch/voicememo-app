import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useGoogleDrive } from './hooks/useGoogleDrive';
import { useTheme } from './hooks/useTheme';
import { PhoneFrame } from './components/PhoneFrame';
import { BottomNav } from './components/BottomNav';
import { Home } from './components/screens/Home';
import { Recording } from './components/screens/Recording';
import { SaveConfirm } from './components/screens/SaveConfirm';
import { TagList } from './components/screens/TagList';
import { TagDetail } from './components/screens/TagDetail';
import { MemoEdit } from './components/screens/MemoEdit';
import { Trash } from './components/screens/Trash';
import { Menu } from './components/screens/Menu';
import { Settings } from './components/screens/Settings';
import { VoiceCommands } from './components/screens/VoiceCommands';
import { Cloud } from './components/screens/Cloud';
import { PDFExport } from './components/screens/PDFExport';
import { Search } from './components/screens/Search';
import { TagManage } from './components/screens/TagManage';
import { UsageGuide } from './components/UsageGuide';
import { Toast } from './components/Toast';
import { findBestTag } from './lib/tagMatch';
import { notifySaved, notifyStart } from './lib/feedback';
import { useI18n } from './i18n/I18nContext';
import {
  loadCloud,
  loadCommands,
  loadMemos,
  loadSettings,
  loadTags,
  nowIso,
  purgeOldTrash,
  saveCloud,
  saveCommands,
  saveMemos,
  saveSettings,
  saveTags,
  uid,
} from './storage';
import type {
  Memo,
  Settings as SettingsType,
  Tag,
  View,
  VoiceCommands as VC,
} from './types';
import type { CloudState } from './storage';

function App() {
  const stopRecordingRef = useRef<(() => void) | null>(null);
  const [memos, setMemos] = useState<Memo[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [settings, setSettings] = useState<SettingsType>(loadSettings());
  const [commands, setCommands] = useState<VC>(loadCommands());
  const [cloud, setCloudState] = useState<CloudState>(loadCloud());
  const initialAutoRecord = useMemo(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('autoRecord') === 'true' || params.get('autoRecord') === '1';
  }, []);
  const [view, setView] = useState<View>(() =>
    initialAutoRecord ? { name: 'recording' } : { name: 'home' },
  );
  const [autoRecordMode, setAutoRecordMode] = useState(initialAutoRecord);
  const [menuOpen, setMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; kind?: 'success' | 'info' | 'warn' } | null>(null);
  const drive = useGoogleDrive();
  const themeCtl = useTheme();
  const { t } = useI18n();
  const syncDebounceRef = useRef<number | null>(null);
  const isLoadedRef = useRef(false);

  useEffect(() => {
    const initialMemos = loadMemos();
    const purged = purgeOldTrash(initialMemos, settings.trashAutoDeleteDays);
    if (purged.length !== initialMemos.length) saveMemos(purged);
    setMemos(purged);
    setTags(loadTags());
    isLoadedRef.current = true;
    if (initialAutoRecord) {
      notifyStart({ sound: settings.notifySound, vibrate: settings.vibrate });
    }
  }, [settings.trashAutoDeleteDays, initialAutoRecord, settings.notifySound, settings.vibrate]);

  useEffect(() => {
    if (!isLoadedRef.current) return;
    if (!drive.connected) return;
    if (syncDebounceRef.current) window.clearTimeout(syncDebounceRef.current);
    syncDebounceRef.current = window.setTimeout(() => {
      drive.sync(memos, tags).catch(() => {});
    }, 2000);
    return () => {
      if (syncDebounceRef.current) window.clearTimeout(syncDebounceRef.current);
    };
  }, [memos, tags, drive]);

  const persistMemos = useCallback((next: Memo[]) => {
    setMemos(next);
    saveMemos(next);
  }, []);

  const persistTags = useCallback((next: Tag[]) => {
    setTags(next);
    saveTags(next);
  }, []);

  const persistSettings = useCallback((next: SettingsType) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const persistCommands = useCallback((next: VC) => {
    setCommands(next);
    saveCommands(next);
  }, []);

  const persistCloud = useCallback((next: CloudState) => {
    setCloudState(next);
    saveCloud(next);
  }, []);

  const recomputeUsage = useCallback(
    (memoList: Memo[], tagList: Tag[]): Tag[] => {
      const counts = new Map<string, number>();
      for (const m of memoList) {
        if (m.deletedAt) continue;
        counts.set(m.tagId, (counts.get(m.tagId) ?? 0) + 1);
      }
      return tagList.map((t) => ({ ...t, usageCount: counts.get(t.id) ?? 0 }));
    },
    [],
  );

  const handleSaveMemo = useCallback(
    (
      input: { title: string; body: string; tagId: string },
      opts?: { silent?: boolean; afterSave?: () => void },
    ) => {
      let tagList = tags;
      let tagId = input.tagId;
      if (tagId.startsWith('__new__:')) {
        const payload = tagId.slice('__new__:'.length);
        const [name, reading] = payload.split('|');
        const newTag: Tag = {
          id: uid(),
          name,
          ...(reading ? { reading } : {}),
          usageCount: 0,
          createdAt: nowIso(),
        };
        tagList = [...tags, newTag];
        tagId = newTag.id;
      }
      const now = nowIso();
      const memo: Memo = {
        id: uid(),
        title: input.title,
        body: input.body,
        tagId,
        createdAt: now,
        updatedAt: now,
      };
      const nextMemos = [memo, ...memos];
      const nextTags = recomputeUsage(nextMemos, tagList);
      persistMemos(nextMemos);
      persistTags(nextTags);
      if (!opts?.silent) {
        notifySaved({ sound: settings.notifySound, vibrate: settings.vibrate });
      }
      if (opts?.afterSave) opts.afterSave();
      else setView({ name: 'tagDetail', tagId });
    },
    [memos, tags, persistMemos, persistTags, recomputeUsage, settings.notifySound, settings.vibrate],
  );

  const handleAutoSave = useCallback(
    (draft: { title: string; body: string; tagPhrase?: string }) => {
      if (!draft.body && !draft.title) {
        setView({ name: 'home' });
        setAutoRecordMode(false);
        return;
      }
      const matched = draft.tagPhrase
        ? findBestTag(draft.tagPhrase, tags, new Map())
        : null;
      const tagId = matched?.id ?? tags[0]?.id ?? '';
      handleSaveMemo(
        {
          title: draft.title.trim() || draft.body.split(/[。.！!？?\n]/)[0]?.slice(0, 20) || t.app.untitled,
          body: draft.body,
          tagId,
        },
        {
          afterSave: () => {
            setToast({ message: t.toast.saved, kind: 'success' });
            setView({ name: 'home' });
            setAutoRecordMode(false);
          },
        },
      );
    },
    [tags, handleSaveMemo, t.app.untitled, t.toast.saved],
  );

  const handleUpdateMemo = useCallback(
    (id: string, patch: { title: string; body: string; tagId?: string }) => {
      const next = memos.map((m) =>
        m.id === id ? { ...m, ...patch, updatedAt: nowIso() } : m,
      );
      const nextTags = recomputeUsage(next, tags);
      persistMemos(next);
      persistTags(nextTags);
    },
    [memos, tags, persistMemos, persistTags, recomputeUsage],
  );

  const handleDeleteMemo = useCallback(
    (id: string) => {
      const next = memos.map((m) =>
        m.id === id ? { ...m, deletedAt: nowIso() } : m,
      );
      const nextTags = recomputeUsage(next, tags);
      persistMemos(next);
      persistTags(nextTags);
    },
    [memos, tags, persistMemos, persistTags, recomputeUsage],
  );

  const handleRestoreMemo = useCallback(
    (id: string) => {
      const next = memos.map((m) => {
        if (m.id !== id) return m;
        const { deletedAt: _drop, ...rest } = m;
        return { ...rest, updatedAt: nowIso() } as Memo;
      });
      const nextTags = recomputeUsage(next, tags);
      persistMemos(next);
      persistTags(nextTags);
    },
    [memos, tags, persistMemos, persistTags, recomputeUsage],
  );

  const handlePurgeAllTrash = useCallback(() => {
    const next = memos.filter((m) => !m.deletedAt);
    persistMemos(next);
  }, [memos, persistMemos]);

  const handleMergeTags = useCallback(
    (group: Tag[]) => {
      if (group.length < 2) return;
      const winner = [...group].sort((a, b) => b.usageCount - a.usageCount)[0];
      const losers = group.filter((t) => t.id !== winner.id);
      const loserIds = new Set(losers.map((t) => t.id));
      if (
        !confirm(
          `「${losers.map((t) => t.name).join('、')}」を「${winner.name}」に統合しますか？`,
        )
      )
        return;
      const nextMemos = memos.map((m) =>
        loserIds.has(m.tagId) ? { ...m, tagId: winner.id, updatedAt: nowIso() } : m,
      );
      const remaining = tags.filter((t) => !loserIds.has(t.id));
      const nextTags = recomputeUsage(nextMemos, remaining);
      persistMemos(nextMemos);
      persistTags(nextTags);
    },
    [memos, tags, persistMemos, persistTags, recomputeUsage],
  );

  const syncedCount = useMemo(
    () => memos.filter((m) => !m.deletedAt).length,
    [memos],
  );

  const renderView = () => {
    switch (view.name) {
      case 'home':
        return (
          <Home
            tags={tags}
            memos={memos}
            onMenuTap={() => setMenuOpen(true)}
            onSearchTap={() => setView({ name: 'search' })}
            onTagTap={(id) => setView({ name: 'tagDetail', tagId: id })}
          />
        );
      case 'recording':
        return (
          <Recording
            maxSec={settings.maxRecordingSec}
            commands={commands}
            autoSave={autoRecordMode}
            stopRef={stopRecordingRef}
            onComplete={(draft) => {
              if (draft.autoSave) {
                handleAutoSave(draft);
              } else {
                setView({ name: 'save', draft, appendToMemoId: view.appendToMemoId });
              }
            }}
            onCancel={() => {
              setView({ name: 'home' });
              setAutoRecordMode(false);
            }}
          />
        );
      case 'save':
        return (
          <SaveConfirm
            draft={view.draft}
            tags={tags}
            onSave={(input) => {
              const appendId = view.appendToMemoId;
              if (appendId) {
                const existing = memos.find((m) => m.id === appendId);
                if (existing) {
                  handleUpdateMemo(appendId, {
                    title: existing.title,
                    body: existing.body ? existing.body + '\n\n' + input.body : input.body,
                  });
                  setView({ name: 'tagDetail', tagId: existing.tagId });
                  return;
                }
              }
              handleSaveMemo(input);
            }}
            onRetake={() => setView({ name: 'recording', appendToMemoId: view.appendToMemoId })}
            onCancel={() => setView({ name: 'home' })}
          />
        );
      case 'tags':
        return (
          <TagList
            tags={tags}
            memos={memos}
            onTagTap={(id) => setView({ name: 'tagDetail', tagId: id })}
            onMerge={handleMergeTags}
          />
        );
      case 'tagDetail': {
        const tag = tags.find((t) => t.id === view.tagId);
        if (!tag) {
          setView({ name: 'tags' });
          return null;
        }
        return (
          <TagDetail
            tag={tag}
            memos={memos}
            onBack={() => setView({ name: 'tags' })}
            onEditMemo={(id) => setView({ name: 'edit', memoId: id })}
            onDeleteMemo={handleDeleteMemo}
            onAddRecord={() => setView({ name: 'recording' })}
            onPdfExport={() => setView({ name: 'pdfExport', tagId: tag.id })}
          />
        );
      }
      case 'edit': {
        const memo = memos.find((m) => m.id === view.memoId);
        if (!memo) {
          setView({ name: 'home' });
          return null;
        }
        const tag = tags.find((t) => t.id === memo.tagId) ?? null;
        return (
          <MemoEdit
            memo={memo}
            tag={tag}
            tags={tags}
            onBack={() => setView({ name: 'tagDetail', tagId: memo.tagId })}
            onSave={(patch) => {
              handleUpdateMemo(memo.id, patch);
              setView({ name: 'tagDetail', tagId: patch.tagId ?? memo.tagId });
            }}
            onDelete={() => {
              handleDeleteMemo(memo.id);
              setView({ name: 'tagDetail', tagId: memo.tagId });
            }}
            onAddRecord={() => setView({ name: 'recording', appendToMemoId: memo.id })}
          />
        );
      }
      case 'trash':
        return (
          <Trash
            memos={memos}
            tags={tags}
            autoDeleteDays={settings.trashAutoDeleteDays}
            onRestore={handleRestoreMemo}
            onPurgeAll={handlePurgeAllTrash}
          />
        );
      case 'pdfExport': {
        const tag = tags.find((t) => t.id === view.tagId);
        if (!tag) {
          setView({ name: 'tags' });
          return null;
        }
        return (
          <PDFExport
            tag={tag}
            memos={memos}
            pdfFont={settings.pdfFont}
            onBack={() => setView({ name: 'tagDetail', tagId: tag.id })}
          />
        );
      }
      case 'settings':
        return (
          <Settings
            settings={settings}
            onChange={persistSettings}
            onBack={() => setView({ name: 'home' })}
            theme={themeCtl.theme}
            onToggleTheme={themeCtl.toggle}
          />
        );
      case 'voiceCommands':
        return (
          <VoiceCommands
            commands={commands}
            onChange={persistCommands}
            onBack={() => setView({ name: 'home' })}
          />
        );
      case 'search':
        return (
          <Search
            memos={memos}
            tags={tags}
            onBack={() => setView({ name: 'home' })}
            onOpenMemo={(id) => setView({ name: 'edit', memoId: id })}
          />
        );
      case 'tagManage':
        return (
          <TagManage
            tags={tags}
            onChange={(next) => persistTags(next)}
            onDelete={(tagId) => {
              const remainingTags = tags.filter((tg) => tg.id !== tagId);
              const reassignedMemos = memos.map((m) =>
                m.tagId === tagId
                  ? { ...m, tagId: remainingTags[0]?.id ?? '', updatedAt: nowIso() }
                  : m,
              );
              persistTags(recomputeUsage(reassignedMemos, remainingTags));
              persistMemos(reassignedMemos);
            }}
            onBack={() => setView({ name: 'home' })}
          />
        );
      case 'cloud':
        return (
          <Cloud
            state={cloud}
            onChange={persistCloud}
            syncedCount={syncedCount}
            onBack={() => setView({ name: 'home' })}
            drive={{
              configured: drive.configured,
              connected: drive.connected,
              status: drive.status,
              lastSyncIso: drive.lastSyncIso,
              error: drive.error,
              connect: drive.connect,
              disconnect: drive.disconnect,
              syncNow: () => drive.sync(memos, tags),
            }}
          />
        );
    }
  };

  const showBottomNav = view.name !== 'recording' && view.name !== 'save';
  const activeNav =
    view.name === 'tags' || view.name === 'tagDetail' || view.name === 'tagManage'
      ? 'tags'
      : view.name === 'trash'
      ? 'trash'
      : 'home';

  return (
    <PhoneFrame>
      {renderView()}
      {view.name !== 'save' && (
        <div className="flex justify-center items-center py-3 flex-shrink-0">
          {view.name === 'recording' ? (
            <button
              type="button"
              onClick={() => stopRecordingRef.current?.()}
              aria-label="停止"
              className="w-[64px] h-[64px] rounded-full bg-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="block w-[22px] h-[22px] bg-white rounded-sm" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setView({ name: 'recording' })}
              aria-label="録音"
              className="w-[64px] h-[64px] rounded-full bg-accent flex items-center justify-center shadow-lg active:scale-95 transition-transform"
            >
              <span className="block w-[24px] h-[24px] bg-white rounded-full" />
            </button>
          )}
        </div>
      )}
      {showBottomNav && (
        <BottomNav
          active={activeNav}
          onChange={(k) => {
            if (k === 'tags') setView({ name: 'tags' });
            else if (k === 'trash') setView({ name: 'trash' });
            else setView({ name: 'home' });
          }}
        />
      )}
      {menuOpen && (
        <Menu
          onClose={() => setMenuOpen(false)}
          onNavigate={(target) => {
            setMenuOpen(false);
            if (target === 'settings') setView({ name: 'settings' });
            else if (target === 'cloud') setView({ name: 'cloud' });
            else if (target === 'voiceCommands') setView({ name: 'voiceCommands' });
            else setView({ name: 'tagManage' });
          }}
          theme={themeCtl.theme}
          onToggleTheme={themeCtl.toggle}
          onOpenGuide={() => {
            setMenuOpen(false);
            setGuideOpen(true);
          }}
        />
      )}
      {guideOpen && <UsageGuide onClose={() => setGuideOpen(false)} />}
      {toast && (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast(null)}
        />
      )}
    </PhoneFrame>
  );
}

export default App;
