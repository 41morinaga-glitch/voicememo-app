import { useMemo, useRef, useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { useI18n } from '../../i18n/I18nContext';
import type { Memo, Tag } from '../../types';

type Format = 'styled' | 'plain';
type Output = 'image' | 'searchable';

type Props = {
  tag: Tag;
  memos: Memo[];
  pdfFont: string;
  onBack: () => void;
};

export function PDFExport({ tag, memos, pdfFont, onBack }: Props) {
  const { t } = useI18n();
  const [format, setFormat] = useState<Format>('styled');
  const [output, setOutput] = useState<Output>('searchable');
  const [generating, setGenerating] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);

  const list = useMemo(
    () =>
      memos
        .filter((m) => m.tagId === tag.id && !m.deletedAt)
        .sort(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
        ),
    [memos, tag.id],
  );

  const generateImagePdf = async () => {
    if (!previewRef.current) return;
    const canvas = await html2canvas(previewRef.current, {
      backgroundColor: '#ffffff',
      scale: 2,
      useCORS: true,
    });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const imgW = pageWidth;
    const imgH = (canvas.height * imgW) / canvas.width;
    let heightLeft = imgH;
    let position = 0;
    pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position -= pageHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgW, imgH);
      heightLeft -= pageHeight;
    }
    const safeName = tag.name.replace(/[\\/:*?"<>|]/g, '_');
    pdf.save(`${safeName}.pdf`);
  };

  const generateSearchablePdf = () => {
    if (!previewRef.current) return;
    const html = previewRef.current.outerHTML;
    const safeName = tag.name.replace(/[\\/:*?"<>|]/g, '_');
    const win = window.open('', '_blank');
    if (!win) {
      alert('ポップアップがブロックされました。許可してください。');
      return;
    }
    win.document.write(`<!DOCTYPE html>
<html lang="ja"><head><meta charset="UTF-8"><title>${safeName}</title>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&display=swap" rel="stylesheet">
<style>
  body { margin: 0; padding: 24px; background: white; color: black; font-family: 'Noto Sans JP', sans-serif; }
  @page { size: A4; margin: 16mm; }
  @media print { body { padding: 0; } }
</style>
</head><body>${html}
<script>
  window.addEventListener('load', () => {
    setTimeout(() => { window.print(); }, 600);
  });
  window.addEventListener('afterprint', () => window.close());
</script>
</body></html>`);
    win.document.close();
  };

  const generate = async () => {
    setGenerating(true);
    try {
      if (output === 'image') {
        await generateImagePdf();
      } else {
        generateSearchablePdf();
      }
    } catch (e) {
      console.error(e);
      alert('PDF生成に失敗しました: ' + (e instanceof Error ? e.message : String(e)));
    } finally {
      setGenerating(false);
    }
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
        ← {tag.name}
      </button>

      <div className="px-5 mt-2 text-[13px] font-bold text-text1">{t.pdf.title}</div>

      <div className="flex-1 overflow-hidden flex flex-col px-5 mt-3 gap-3">
        <div className="flex-1 bg-white rounded-lg p-3 overflow-y-auto scroll-area min-h-0">
          <div className="font-mono text-[7px] text-gray-500 mb-2">{t.pdf.preview}</div>
          <div
            ref={previewRef}
            className="bg-white text-black p-4"
            style={{ fontFamily: `"${pdfFont}", sans-serif`, fontSize: '11px' }}
          >
            <h1
              style={{
                fontSize: '18px',
                fontWeight: 700,
                marginBottom: '4px',
                borderBottom: format === 'styled' ? '2px solid #ff3333' : 'none',
                paddingBottom: format === 'styled' ? '4px' : 0,
              }}
            >
              {tag.name}
            </h1>
            <div style={{ fontSize: '9px', color: '#666', marginBottom: '12px' }}>
              {list.length} memos · {totalChars(list).toLocaleString()} chars · {formatNow()}
            </div>
            {list.length === 0 && (
              <div style={{ color: '#999', fontSize: '10px' }}>{t.pdf.empty}</div>
            )}
            {list.map((m) => (
              <div
                key={m.id}
                style={{
                  marginBottom: '12px',
                  paddingBottom: '8px',
                  borderBottom: format === 'styled' ? '1px solid #eee' : 'none',
                }}
              >
                <div
                  style={{
                    fontSize: '8px',
                    color: '#999',
                    fontFamily: 'monospace',
                  }}
                >
                  {formatDateTime(m.createdAt)}
                </div>
                {m.title && format === 'styled' && (
                  <div style={{ fontSize: '12px', fontWeight: 700, marginTop: '2px' }}>
                    {m.title}
                  </div>
                )}
                <div
                  style={{
                    fontSize: '11px',
                    lineHeight: 1.7,
                    marginTop: '4px',
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.body}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="text-[9px] text-text3 mb-1.5">{t.pdf.formatLabel}</div>
          <div className="flex flex-col gap-1.5">
            <FormatOption
              selected={format === 'styled'}
              onClick={() => setFormat('styled')}
              title={t.pdf.formatStyled}
              subtitle={t.pdf.formatStyledSub}
            />
            <FormatOption
              selected={format === 'plain'}
              onClick={() => setFormat('plain')}
              title={t.pdf.formatPlain}
              subtitle={t.pdf.formatPlainSub}
            />
          </div>
        </div>

        <div>
          <div className="text-[9px] text-text3 mb-1.5">{t.pdf.outputLabel}</div>
          <div className="flex flex-col gap-1.5">
            <FormatOption
              selected={output === 'searchable'}
              onClick={() => setOutput('searchable')}
              title={t.pdf.outputSearchable}
              subtitle={t.pdf.outputSearchableSub}
            />
            <FormatOption
              selected={output === 'image'}
              onClick={() => setOutput('image')}
              title={t.pdf.outputImage}
              subtitle={t.pdf.outputImageSub}
            />
          </div>
        </div>
      </div>

      <div className="px-5 pt-3 pb-3">
        <button
          type="button"
          onClick={generate}
          disabled={generating || list.length === 0}
          className="w-full bg-accent text-white rounded-[10px] py-3 text-[11px] font-bold tracking-[1px] min-h-[44px] disabled:opacity-50"
        >
          {generating
            ? t.pdf.generating
            : output === 'searchable'
              ? t.pdf.openPrint
              : t.pdf.generate}
        </button>
      </div>
    </>
  );
}

function FormatOption({
  selected,
  onClick,
  title,
  subtitle,
}: {
  selected: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-2 bg-surface2 border border-border rounded-lg px-2.5 py-2 text-left min-h-[44px] active:bg-border/40"
    >
      <span
        className={`w-5 h-5 rounded flex-shrink-0 border ${
          selected ? 'bg-accent border-accent' : 'bg-surface2 border-border'
        }`}
      />
      <div>
        <div className="text-[10px] font-medium text-text1">{title}</div>
        <div className="text-[8px] text-text3">{subtitle}</div>
      </div>
    </button>
  );
}

function totalChars(list: Memo[]): number {
  return list.reduce((acc, m) => acc + m.body.length, 0);
}
function formatNow(): string {
  const d = new Date();
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())}`;
}
function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${pad(d.getMonth() + 1)}.${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
function pad(n: number): string {
  return n.toString().padStart(2, '0');
}
