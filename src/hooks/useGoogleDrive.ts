import { useCallback, useEffect, useRef, useState } from 'react';
import {
  downloadData,
  findDataFile,
  getClientId,
  requestAccessToken,
  revokeToken,
  uploadData,
  type DriveData,
} from '../lib/googleDrive';
import type { Memo, Tag } from '../types';

const KEY_DRIVE = 'voicememo:driveAuth';

type Persisted = {
  accessToken: string;
  expiresAt: number;
  fileId: string | null;
  lastSyncIso?: string;
};

type Status = 'idle' | 'connecting' | 'syncing' | 'error';

type Result = {
  configured: boolean;
  connected: boolean;
  status: Status;
  lastSyncIso: string | null;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  sync: (memos: Memo[], tags: Tag[]) => Promise<void>;
  pull: () => Promise<DriveData | null>;
};

function loadPersisted(): Persisted | null {
  try {
    const raw = localStorage.getItem(KEY_DRIVE);
    if (!raw) return null;
    return JSON.parse(raw) as Persisted;
  } catch {
    return null;
  }
}

function savePersisted(state: Persisted | null): void {
  if (!state) localStorage.removeItem(KEY_DRIVE);
  else localStorage.setItem(KEY_DRIVE, JSON.stringify(state));
}

function tokenValid(p: Persisted | null): boolean {
  return !!p && !!p.accessToken && p.expiresAt > Date.now() + 30_000;
}

export function useGoogleDrive(): Result {
  const configured = !!getClientId();
  const [persisted, setPersistedState] = useState<Persisted | null>(loadPersisted);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const inflightToken = useRef<Promise<Persisted> | null>(null);

  useEffect(() => {
    if (persisted && !tokenValid(persisted)) {
      setPersistedState((prev) =>
        prev ? { ...prev, accessToken: '', expiresAt: 0 } : prev,
      );
    }
  }, [persisted]);

  const persistAndSet = useCallback((next: Persisted | null) => {
    setPersistedState(next);
    savePersisted(next);
  }, []);

  const ensureToken = useCallback(async (): Promise<Persisted> => {
    if (tokenValid(persisted)) return persisted!;
    if (inflightToken.current) return inflightToken.current;
    const p = (async () => {
      const tok = await requestAccessToken('');
      const next: Persisted = {
        accessToken: tok.accessToken,
        expiresAt: tok.expiresAt,
        fileId: persisted?.fileId ?? null,
        lastSyncIso: persisted?.lastSyncIso,
      };
      if (next.fileId === null) {
        try {
          next.fileId = await findDataFile(next.accessToken);
        } catch {
          next.fileId = null;
        }
      }
      persistAndSet(next);
      return next;
    })();
    inflightToken.current = p;
    try {
      return await p;
    } finally {
      inflightToken.current = null;
    }
  }, [persisted, persistAndSet]);

  const connect = useCallback(async () => {
    if (!configured) {
      setError('VITE_GOOGLE_CLIENT_ID が未設定です');
      return;
    }
    setStatus('connecting');
    setError(null);
    try {
      await ensureToken();
      setStatus('idle');
    } catch (e) {
      setStatus('error');
      setError(e instanceof Error ? e.message : '接続に失敗しました');
    }
  }, [configured, ensureToken]);

  const disconnect = useCallback(async () => {
    if (persisted?.accessToken) {
      try {
        await revokeToken(persisted.accessToken);
      } catch {}
    }
    persistAndSet(null);
    setStatus('idle');
    setError(null);
  }, [persisted, persistAndSet]);

  const sync = useCallback(
    async (memos: Memo[], tags: Tag[]) => {
      if (!configured || !persisted) return;
      setStatus('syncing');
      setError(null);
      try {
        const tok = await ensureToken();
        const data: DriveData = {
          version: 1,
          exportedAt: new Date().toISOString(),
          memos,
          tags,
        };
        const fileId = await uploadData(tok.accessToken, tok.fileId, data);
        const nowIso = new Date().toISOString();
        persistAndSet({ ...tok, fileId, lastSyncIso: nowIso });
        setStatus('idle');
      } catch (e) {
        setStatus('error');
        setError(e instanceof Error ? e.message : '同期に失敗しました');
      }
    },
    [configured, persisted, ensureToken, persistAndSet],
  );

  const pull = useCallback(async (): Promise<DriveData | null> => {
    if (!configured || !persisted) return null;
    try {
      const tok = await ensureToken();
      if (!tok.fileId) return null;
      return await downloadData(tok.accessToken, tok.fileId);
    } catch (e) {
      setError(e instanceof Error ? e.message : '取得に失敗しました');
      return null;
    }
  }, [configured, persisted, ensureToken]);

  return {
    configured,
    connected: !!persisted,
    status,
    lastSyncIso: persisted?.lastSyncIso ?? null,
    error,
    connect,
    disconnect,
    sync,
    pull,
  };
}
