import { useI18n } from '../../i18n/I18nContext';

type Props = {
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

export function Cloud({ onBack, syncedCount, drive }: Props) {
  const { t } = useI18n();
  const c = t.cloud;

  const busy = drive.status === 'connecting' || drive.status === 'syncing';

  const handleConnect = async () => {
    await drive.connect();
  };

  const handleDisconnect = async () => {
    if (!confirm(c.confirmDisconnect)) return;
    await drive.disconnect();
  };

  const handleSync = async () => {
    await drive.syncNow();
  };

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
        ← メニュー
      </button>

      <div className="px-5 mt-2">
        <div className="text-[13px] font-bold text-text1">{c.title}</div>
        <div className="text-[10px] text-text3 mt-0.5">{c.subtitle}</div>
      </div>

      <div className="flex-1 overflow-y-auto scroll-area px-5 mt-4 flex flex-col gap-3 pb-6">

        {/* Google Drive card */}
        <div className={`rounded-[14px] border p-4 flex flex-col gap-3 ${
          drive.connected
            ? 'bg-ok/5 border-ok/30'
            : 'bg-surface2 border-border'
        }`}>
          {/* Header row */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[rgba(74,158,255,0.1)] flex items-center justify-center text-[22px] flex-shrink-0">
              ☁️
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[13px] font-semibold text-text1">Google ドライブ</div>
              <div className="font-mono text-[9px] mt-0.5">
                {drive.connected ? (
                  <span className="text-ok">● {c.connectedLabel}</span>
                ) : drive.configured ? (
                  <span className="text-text3">未接続</span>
                ) : (
                  <span className="text-warn">設定が必要です</span>
                )}
              </div>
            </div>
          </div>

          {/* Not configured message */}
          {!drive.configured && (
            <div className="bg-warn/[0.08] border border-warn/25 rounded-lg px-3 py-2.5 flex flex-col gap-1">
              <div className="text-[10px] font-medium text-warn">{c.notConfiguredTitle}</div>
              <div className="text-[9px] text-text2 leading-relaxed">{c.notConfiguredBody}</div>
            </div>
          )}

          {/* Error message */}
          {drive.error && (
            <div className="bg-accent/[0.08] border border-accent/25 rounded-lg px-3 py-2 text-[9px] text-accent">
              ⚠ {drive.error}
            </div>
          )}

          {/* Connected stats */}
          {drive.connected && (
            <div className="bg-surface border border-border/60 rounded-lg px-3 py-2.5 flex flex-col gap-1.5">
              <SyncRow label={c.lastSync} value={drive.lastSyncIso ? formatTime(drive.lastSyncIso) : '—'} />
              <SyncRow label={c.syncedLabel} value={c.syncedMemos(syncedCount)} />
            </div>
          )}

          {/* Action buttons */}
          {drive.connected ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleSync}
                disabled={busy}
                className="flex-1 bg-ok text-white rounded-xl py-3 text-[11px] font-bold min-h-[44px] disabled:opacity-50 active:opacity-80 transition-opacity"
              >
                {drive.status === 'syncing' ? c.syncing : c.syncNow}
              </button>
              <button
                type="button"
                onClick={handleDisconnect}
                disabled={busy}
                className="px-4 border border-border text-text3 rounded-xl py-3 text-[10px] min-h-[44px] disabled:opacity-40 active:opacity-60 transition-opacity"
              >
                {c.disconnect}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleConnect}
              disabled={busy || !drive.configured}
              className="w-full bg-info text-white rounded-xl py-3.5 text-[12px] font-bold min-h-[50px] disabled:opacity-50 active:opacity-80 transition-opacity flex items-center justify-center gap-2"
            >
              {busy ? c.connecting : c.connectBtn}
            </button>
          )}
        </div>

        {/* Info card */}
        <div className="bg-surface2 border border-border rounded-[14px] px-4 py-3 flex flex-col gap-2">
          <div className="text-[9px] font-medium text-text2 uppercase tracking-[1.5px]">同期の仕組み</div>
          <InfoRow icon="📱" text="スマホで録音 → 自動でクラウドに保存" />
          <InfoRow icon="💻" text="PCやiPadを開くと最新データを取得" />
          <InfoRow icon="🔒" text="あなたのGoogleドライブにのみ保存（非公開）" />
          <InfoRow icon="⚡" text="録音・保存のたびに自動同期" />
        </div>

      </div>
    </>
  );
}

function SyncRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center text-[9px]">
      <span className="text-text3">{label}</span>
      <span className="text-ok font-mono">{value}</span>
    </div>
  );
}

function InfoRow({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-start gap-2 text-[9px] text-text2 leading-relaxed">
      <span className="flex-shrink-0">{icon}</span>
      <span>{text}</span>
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
