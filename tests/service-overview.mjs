import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL('../' + path, import.meta.url), 'utf8');
const html = read('index.html');
const builder = read('assets/service-builder.js');
const styles = read('assets/app.css');
const worker = read('sw.js');
const section = html.split('<section class="page" id="setlist">')[1]?.split('<section class="page" id="academy">')[0];
assert(section, 'The Ibadah screen must exist');

const ids = ['serviceName', 'serviceOverview', 'serviceFacts', 'serviceDateValue', 'serviceWLValue',
  'serviceThemeValue', 'editSetMeta', 'addSegment', 'chooseTemplate', 'slots', 'setSummary',
  'serviceStatus', 'openSetActions', 'templateMode', 'servicePrint'];
for (const id of ids) {
  assert.equal((section.match(new RegExp('id="' + id + '"', 'g')) || []).length, 1,
    'Missing or duplicate builder element: ' + id);
}
assert(section.includes('Edit detail'), 'Date/WL/theme editor must be discoverable');
assert(section.includes('Alur Ibadah'), 'The service flow needs an explicit heading');
assert(!section.includes('<h1 tabindex="-1">Ibadah</h1>'), 'Avoid duplicate page headings');
assert(!section.includes('id="serviceMeta"'), 'Do not show old compressed metadata subtitle');
assert(!section.includes('id="chooseTemplate" class="btn"'), 'Templates should be secondary');

for (const valueId of ['serviceDateValue', 'serviceWLValue', 'serviceThemeValue']) {
  assert(builder.includes("'"+valueId+"'"), valueId + ' must receive saved values');
}
assert(builder.includes("target.textContent=hasValue?value:'Belum ditentukan'"),
  'Missing data must have an explicit empty state');
assert(builder.includes("new Date(value+'T12:00:00')"), 'Date must be formatted in local time');
assert(builder.includes("target.classList.toggle('service-placeholder',!hasValue)"),
  'Missing values should be visually distinct');
assert(builder.includes('segment-chevron') && builder.includes("data-builder=\"edit-segment\""),
  'Segment rows should have one clear edit target');
assert(styles.includes('.service-facts>div') && styles.includes('.service-flow-head'),
  'Compact service layout styles must exist');
assert(worker.includes("'0.5.5'"), 'PWA cache version must be updated');
console.log('OK: Ibadah compact summary, saved value rendering, edit affordance, segment interaction and PWA cache.');
