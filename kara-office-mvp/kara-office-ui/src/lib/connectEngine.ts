import { publishArtifact } from './intelligence';

type Rule = { id: string; triggerApp: string; triggerEvent: string; actionApp: string; actionType: string; active: boolean };
const RULES_KEY = 'karaConnectRules';
const LOG_KEY = 'karaConnectLog';

const readRules = (): Rule[] => { try { return JSON.parse(localStorage.getItem(RULES_KEY) || '[]'); } catch { return []; } };
const log = (msg: string) => {
  try {
    const l = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
    l.unshift({ ts: Date.now(), msg });
    localStorage.setItem(LOG_KEY, JSON.stringify(l.slice(0, 30)));
    window.dispatchEvent(new CustomEvent('kara-connect-log'));
  } catch (e) {}
};
const today = () => new Date().toISOString().slice(0, 10);

const runAction = (rule: Rule, detail: any) => {
  const title = (detail && detail.title) || 'Automation item';
  if (rule.actionType === 'Create Event') {
    try {
      const ev = JSON.parse(localStorage.getItem('karaCalendarEvents') || '[]');
      ev.unshift({ id: 'auto' + Date.now().toString(36), title: '[Auto] ' + title, date: today(), time: '09:00', source: 'Kara Connect' });
      localStorage.setItem('karaCalendarEvents', JSON.stringify(ev));
    } catch (e) {}
  } else if (rule.actionType === 'Create Record') {
    try {
      const bases = JSON.parse(localStorage.getItem('karaBaseData') || '[]');
      if (bases.length) {
        const b = bases[0];
        const textCol = (b.cols || []).find((c: any) => c.type === 'text');
        b.rows = b.rows || [];
        b.rows.push({ id: 'auto' + Date.now().toString(36), cells: textCol ? { [textCol.id]: '[Auto] ' + title } : { c1: '[Auto] ' + title } });
        localStorage.setItem('karaBaseData', JSON.stringify(bases));
      }
    } catch (e) {}
  } else if (rule.actionType === 'Create Task') {
    try {
      const t = JSON.parse(localStorage.getItem('karaFlowTasks') || '[]');
      t.unshift({ id: 'auto' + Date.now().toString(36), title: '[Auto] ' + title, assignee: 'Kara Connect', status: 'todo', due: today() });
      localStorage.setItem('karaFlowTasks', JSON.stringify(t));
    } catch (e) {}
  } else if (rule.actionType === 'Publish Artifact') {
    publishArtifact('connect', 'Automation: ' + title, JSON.stringify(detail || {}));
  }
  log('FIRED: ' + rule.triggerApp + ' ' + rule.triggerEvent + ' -> ' + rule.actionType + ' (' + title + ')');
};

const triggerMap: Record<string, string> = {
  'Kara Base|Record Created': 'kara-base-record',
  'Kara Calendar|Event Scheduled': 'kara-calendar-event',
  'Kara Intelligence|Artifact Published': 'kara-intel-updated',
};

export function startConnectEngine() {
  Object.entries(triggerMap).forEach(([key, evt]) => {
    window.addEventListener(evt, (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      readRules().filter(r => r.active && (r.triggerApp + '|' + r.triggerEvent) === key).forEach(r => runAction(r, detail));
    });
  });
}
