import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { WORD_ROWS, SHEETS_ROWS } from '../comparison';

export default function KaraPDF() {
  const downloadComparisonPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18);
    doc.text('Kara Office Suite vs The Giants', 14, 20);
    doc.setFontSize(11);
    doc.text('Official capability comparison - V1.0 (2026)', 14, 28);
    autoTable(doc, { head: [WORD_ROWS[0]], body: WORD_ROWS.slice(1), startY: 34, styles: { fontSize: 8 }, headStyles: { fillColor: [37, 99, 235] } });
    const y2 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 160;
    autoTable(doc, { head: [SHEETS_ROWS[0]], body: SHEETS_ROWS.slice(1), startY: y2, styles: { fontSize: 8 }, headStyles: { fillColor: [5, 150, 105] } });
    const y3 = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 10 : 250;
    doc.setFontSize(9);
    doc.text('The CEO summary: Kara V1.0 covers ~80% of daily office work and holds three powers Microsoft cannot sell at any price:', 14, y3);
    doc.text('fully-offline AI, zero telemetry, and an on-prem live-research agent inside your files.', 14, y3 + 5);
    doc.save('Kara_vs_Microsoft_Comparison.pdf');
  };

  const wordToPDF = () => {
    const html = localStorage.getItem('karaWordDoc') || '';
    if (!html.trim()) { alert('Kara Word is empty. Write or load a document first.'); return; }
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, 'text/html');
    const lines: { text: string; size: number }[] = [];
    const walk = (el: Element) => {
      const tag = el.tagName.toLowerCase();
      if (tag === 'table') { lines.push({ text: '[Table - open the .doc version for the full grid]', size: 10 }); return; }
      if (['p', 'h1', 'h2', 'h3', 'li'].includes(tag) && el.children.length === 0) {
        const t = (el.textContent || '').trim();
        if (t) lines.push({ text: t, size: tag === 'h1' ? 16 : tag === 'h2' ? 14 : tag === 'h3' ? 12 : 11 });
        return;
      }
      Array.from(el.children).forEach(walk);
    };
    Array.from(dom.body.children).forEach(walk);
    const doc = new jsPDF();
    let y = 20;
    lines.forEach(ln => {
      doc.setFontSize(ln.size);
      const wrapped = doc.splitTextToSize(ln.text, 180);
      wrapped.forEach((w: string) => {
        if (y > 280) { doc.addPage(); y = 20; }
        doc.text(w, 14, y);
        y += ln.size * 0.5 + 2;
      });
      y += 2;
    });
    doc.save('KaraWord_Document.pdf');
  };

  const PreviewTable = ({ rows }: { rows: string[][] }) => (
    <table className="w-full text-xs border-collapse bg-white shadow rounded overflow-hidden mb-6">
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className={i === 0 ? 'bg-slate-800 text-white' : i % 2 === 0 ? 'bg-slate-50' : 'bg-white'}>
            {r.map((cell, j) => <td key={j} className={`border border-slate-200 px-3 py-1.5 ${i === 0 ? 'font-semibold' : ''}`}>{cell}</td>)}
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <div className="flex flex-col h-full bg-slate-100">
      <div className="bg-white border-b border-slate-200 p-3 flex items-center gap-3 flex-wrap flex-shrink-0">
        <button onClick={downloadComparisonPDF} className="px-3 py-1.5 bg-red-600 text-white text-xs rounded hover:bg-red-700">Download Comparison PDF</button>
        <button onClick={wordToPDF} className="px-3 py-1.5 bg-slate-800 text-white text-xs rounded hover:bg-slate-700">Kara Word Doc → PDF</button>
        <span className="text-xs text-slate-500">Kara PDF Engine (jsPDF) — 100% local, no cloud</span>
      </div>
      <div className="flex-1 overflow-auto p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-1">Kara Office Suite vs The Giants</h2>
        <p className="text-xs text-slate-500 mb-4">Preview of exactly what the PDF export contains.</p>
        <h3 className="text-sm font-semibold text-blue-700 mb-2">Microsoft Word vs Kara Word</h3>
        <PreviewTable rows={WORD_ROWS} />
        <h3 className="text-sm font-semibold text-emerald-700 mb-2">Microsoft Excel vs Kara Sheets</h3>
        <PreviewTable rows={SHEETS_ROWS} />
      </div>
      <div className="h-6 bg-slate-900 text-white text-[10px] flex items-center px-4 flex-shrink-0">
        <span>Kara PDF — sovereign document engine</span>
      </div>
    </div>
  );
}
