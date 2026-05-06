import { useI18n } from '../../i18n/I18nContext';
import type { CloudState } from '../../storage';

type Props = {
  state: CloudState;
  onChange: (next: CloudState) => void;
  onBack: () => void;
  syncedCount: number;
  drive: {
    configured: boolean;
    connected: boolean;
    status: 'idle' | 'connecting' | 'syncing' | 'error';
    lastSyncIso: string | null;
    error: string | null;
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    syncNow: () => Promise<void>;
  };
};

type Provider = {
  key: keyof CloudState;
  name: string;
  icon: string;
  iconBg: string;
};

export function Cloud({ state, onChange, onBack, syncedCount, drive }: Props) {
  const { t } = useI18n();
  const PROVIDERS: Provider[] = [
    { key: 'googleDrive', name: t.cloud.googleDrive, icon: '☁️', iconBg: 'rgba(74,158,255,0.1)' },
    { key: 'iCloud', name: t.cloud.iCloud, icon: '🍎', iconBg: 'rgba(255,255,255,0.05)' },
    { key: 'dropbox', name: t.cloud.dropbox, icon: '📦', iconBg: 'rgba(74,158,255,0.05)' },
  ];
  const handleStubToggle = (key: keyof CloudState) => {
    const cur = state[key];
    const providerName = PROVIDERS.find((p) => p.key === key)?.name ?? '';
    if (cur.connected) {
      if (!confirm(t.cloud.confirmDisconnect(providerName))) return;
      onChange({ ...state, [key]: { connected: false } });
    } else {
      onChange({
        ...state,
        [key]: { connected: true, lastSyncIso: new Date().toISOString() },
      });
    }
  };

  const handleDriveToggle = async () => {
    if (drive.connected) {
      if (!confirm(t.cloud.confirmDisconnect(t.cloud.googleDrive))) return;
      await drive.disconnect();
    } else {
      await drive.connect();
    }
  };

  const handleSyncAll = async () => {
    if (drive.connected) {
      await drive.syncNow();
    } else {
      const now = new Date().toISOString();
      const next = { ...state };
      (Object.keys(state) as (keyof CloudState)[]).forEach((k) => {
        if (state[k].connected) next[k] = { connected: true, lastSyncIso: now };
      });
      onChange(next);
    }
  };

  const driveLastSyncTs = drive.lastSyncIso ? new Date(drive.lastSyncIso).getTime() : 0;
  const stubLastSync = Object.values(state)
    .filter((s) => s.connected && s.lastSyncIso)
    .map((s) => new Date(s.lastSyncIso!).getTime())
    .sort((a, b) => b - a)[0] ?? 0;
  const lastSync = Math.max(driveLastSyncTs, stubLastSync);

  return (
    <>
      <div className="flex justify-between font-mono text-[9px] text-text3 px-5 pt-9">
        <span>9:41</span>
        <span>●●●</span>
      </div>

      <button
        type="button"
        onClick={onBack}
        className="text-[10px] text-text3 px-5 mt-2 text-left"
      >
        {t.settings.backToMenu}
      </button>

      <div className="px-5 mt-2 text-[13px] font-bold text-text1">{t.cloud.title}</div>

      <div className="px-5 mt-2 flex flex-col gap-1.5">
        <div className="bg-ok/[0.07] border border-ok/30 rounded-lg px-2.5 py-2 text-[9px] text-ok">
          {t.cloud.autoSync}
        </div>
        {!drive.configured && (
          <div className="bg-warn/[0.07] border border-warn/30 rounded-lg px-2.5 py-2 text-[9px] text-warn leading-relaxed">
            {t.cloud.notConfigured}
          </div>
        )}
        {drive.error && (
          <div className="bg-accent/[0.07] border border-accent/30 rounded-lg px-2.5 py-2 text-[9px] text-accent">
            ⚠ {drive.error}
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-2 flex flex-col gap-2 pb-3">
        {PROVIDERS.map((p) => {
          if (p.key === 'googleDrive') {
            const busy = drive.status === 'connecting' || drive.status === 'syncing';
            return (
              <div
                key={p.key}
                className={`rounded-[10px] px-3 py-2.5 flex items-center gap-2.5 ${
                  drive.connected
                    ? 'bg-info/5 border border-info/40'
                    : 'bg-surface2 border border-border'
                }`}
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center text-[14px] flex-shrink-0"
                  style={{ background: p.iconBg }}
                >
                  {p.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] text-text1 truncate">{p.name}</div>
                  <div className="font-mono text-[8px] truncate">
                    {drive.connected ? (
                      <span className="text-ok">
                        ● {t.cloud.connected}
                        {drive.lastSyncIso ? ` · ${formatTime(drive.lastSyncIso)}` : ''}
                      </span>
                    ) : drive.configured ? (
                      <span className="text-text3">{t.cloud.notConnected}</span>
                    ) : (
                      <span className="text-text3">{t.cloud.notSet}</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDriveToggle}
                  disabled={busy || !drive.configured}
                  className={`text-[9px] px-2 py-1 rounded border min-h-[28px] flex-shrink-0 disabled:opacity-40 ${
                    drive.connected ? 'text-ok border-ok/40' : 'text-info border-info/40'
                  }`}
                >
                  {busy
                    ? drive.status === 'connecting'
                      ? t.cloud.connecting
                      : t.cloud.syncing
                    : drive.connected
                      ? t.cloud.connected
                      : t.cloud.connect}
                </button>
              </div>
            );
          }
          const s = state[p.key];
          return (
            <div
              key={p.key}
              className={`rounded-[10px] px-3 py-2.5 flex items-center gap-2.5 ${
                s.connected
                  ? 'bg-info/5 border border-info/40'
                  : 'bg-surface2 border border-border opacity-70'
              }`}
            >
              <div
                className="w-7 h-7 rounded-md flex items-center justify-center text-[14px] flex-shrink-0"
                style={{ background: p.iconBg }}
              >
                {p.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] text-text1 truncate">{p.name}</div>
                <div className="font-mono text-[8px] truncate">
                  {s.connected ? (
                    <span className="text-ok">
                      ● {t.cloud.connected}{s.lastSyncIso ? ` · ${formatTime(s.lastSyncIso)}` : ''}
                    </span>
                  ) : (
                    <span className="text-text3">{t.cloud.notConnectedStub}</span>
                  )}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleStubToggle(p.key)}
                className={`text-[9px] px-2 py-1 rounded border min-h-[28px] flex-shrink-0 ${
                  s.connected ? 'text-ok border-ok/40' : 'text-info border-info/40'
                }`}
              >
                {s.connected ? t.cloud.connected : t.cloud.connect}
              </button>
            </div>
          );
        })}

        <div className="bg-info/[0.07] border border-info/25 rounded-lg p-2.5 flex flex-col gap-1.5">
          <SyncRow
            label={t.cloud.lastSync}
            value={lastSync ? formatTime(new Date(lastSync).toISOString()) : '—'}
          />
          <SyncRow label={t.cloud.syncedLabel} value={t.cloud.syncedMemos(syncedCount)} />
          <SyncRow label={t.cloud.format} value="JSON + PDF" />
        </div>

        <SetupGuide configured={drive.configured} />
      </div>

      <div className="px-5 pb-3">
        <button
          type="button"
          onClick={handleSyncAll}
          disabled={drive.status === 'syncing'}
          className="w-full bg-info text-white rounded-lg py-2.5 text-[10px] font-bold tracking-[1px] min-h-[44px] disabled:opacity-50"
        >
          {drive.status === 'syncing' ? t.cloud.syncing : t.cloud.syncNow}
        </button>
      </div>
    </>
  );
}

function SetupGuide({ configured }: { configured: boolean }) {
  const { t } = useI18n();
  if (configured) return null;
  return (
    <details className="bg-surface2 border border-border rounded-lg px-2.5 py-2 text-[9px] text-text2 leading-relaxed">
      <summary className="cursor-pointer text-text1">{t.cloud.setupGuideTitle}</summary>
      <ol className="list-decimal list-inside mt-2 space-y-1">
        {t.cloud.setupSteps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </details>
  );
}

function SyncRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-[9px]">
      <span className="text-text3">{label}</span>
      <span className="text-info font-mono">{value}</span>
    </div>
  );
}

function formatTime(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  const isToday = d.toDateString() === today.toDateString();
  const hh = pad(d.getHours());
  const mm = pad(d.getMinutes());
  if (isToday) return `今日 ${hh}:${mm}`;
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${hh}:${mm}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
