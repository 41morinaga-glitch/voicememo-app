const GIS_SRC = 'https://accounts.google.com/gsi/client';
const SCOPE = 'https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'voicememo-data.json';
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const DRIVE_UPLOAD = 'https://www.googleapis.com/upload/drive/v3';

export type DriveData = {
  version: 1;
  exportedAt: string;
  memos: unknown[];
  tags: unknown[];
};

export type TokenResult = {
  accessToken: string;
  expiresAt: number;
};

let gisLoadPromise: Promise<void> | null = null;
let tokenClient: any = null;

declare global {
  interface Window {
    google?: any;
  }
}

export function getClientId(): string | null {
  const id = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
  return id && id.trim() ? id.trim() : null;
}

export function loadGis(): Promise<void> {
  if (gisLoadPromise) return gisLoadPromise;
  gisLoadPromise = new Promise<void>((resolve, reject) => {
    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    const existing = document.querySelector(`script[src="${GIS_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('GIS script failed to load')));
      return;
    }
    const script = document.createElement('script');
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('GIS script failed to load'));
    document.head.appendChild(script);
  });
  return gisLoadPromise;
}

export async function requestAccessToken(prompt: '' | 'consent' = ''): Promise<TokenResult> {
  const clientId = getClientId();
  if (!clientId) throw new Error('VITE_GOOGLE_CLIENT_ID が設定されていません');
  await loadGis();
  return new Promise<TokenResult>((resolve, reject) => {
    if (!tokenClient) {
      tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: SCOPE,
        prompt,
        callback: () => {},
      });
    }
    tokenClient.callback = (resp: any) => {
      if (resp.error) {
        reject(new Error(resp.error_description || resp.error));
        return;
      }
      const expiresIn = Number(resp.expires_in ?? 3600);
      resolve({
        accessToken: resp.access_token,
        expiresAt: Date.now() + expiresIn * 1000,
      });
    };
    tokenClient.requestAccessToken({ prompt });
  });
}

export function revokeToken(token: string): Promise<void> {
  return new Promise((resolve) => {
    if (!window.google?.accounts?.oauth2) {
      resolve();
      return;
    }
    window.google.accounts.oauth2.revoke(token, () => resolve());
  });
}

export async function findDataFile(token: string): Promise<string | null> {
  const url = new URL(`${DRIVE_API}/files`);
  url.searchParams.set('spaces', 'appDataFolder');
  url.searchParams.set('q', `name='${FILE_NAME}' and trashed=false`);
  url.searchParams.set('fields', 'files(id,name,modifiedTime)');
  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Drive find failed: ${res.status}`);
  const json = (await res.json()) as { files?: { id: string }[] };
  return json.files?.[0]?.id ?? null;
}

export async function uploadData(
  token: string,
  fileId: string | null,
  data: DriveData,
): Promise<string> {
  const body = JSON.stringify(data);
  if (!fileId) {
    const boundary = `vm-${Date.now()}`;
    const metadata = { name: FILE_NAME, parents: ['appDataFolder'] };
    const multipart =
      `--${boundary}\r\n` +
      `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
      JSON.stringify(metadata) +
      `\r\n--${boundary}\r\n` +
      `Content-Type: application/json\r\n\r\n` +
      body +
      `\r\n--${boundary}--`;
    const res = await fetch(`${DRIVE_UPLOAD}/files?uploadType=multipart&fields=id`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipart,
    });
    if (!res.ok) throw new Error(`Drive create failed: ${res.status} ${await res.text()}`);
    const json = (await res.json()) as { id: string };
    return json.id;
  }
  const res = await fetch(
    `${DRIVE_UPLOAD}/files/${fileId}?uploadType=media&fields=id`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body,
    },
  );
  if (!res.ok) throw new Error(`Drive update failed: ${res.status} ${await res.text()}`);
  return fileId;
}

export async function downloadData(token: string, fileId: string): Promise<DriveData | null> {
  const res = await fetch(`${DRIVE_API}/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`Drive download failed: ${res.status}`);
  return (await res.json()) as DriveData;
}
