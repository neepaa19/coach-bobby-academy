import { chromium } from '/home/claude/.npm-global/lib/node_modules/playwright/index.mjs';

const errors = [];
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });

await page.goto('http://127.0.0.1:8899/index.html', { waitUntil: 'networkidle' });
await page.waitForTimeout(600);

const report = {};

// --- First run ---------------------------------------------------------
// A fresh context has empty localStorage, so the intro must be here. It
// also has to be dismissible, and it must stay dismissed. Anything that
// covers the whole screen on launch is worth guarding hard.
report.introShownOnFirstRun = await page.locator('#intro').isVisible();
report.introCards = await page.locator('#introDots i').count();
for (let i = 0; i < report.introCards; i++) {
  await page.locator('#introNext').click();
  await page.waitForTimeout(120);
}
report.introDismissed = (await page.locator('#intro').count()) === 0;
await page.reload({ waitUntil: 'networkidle' });
await page.waitForTimeout(500);
report.introStaysDismissed = (await page.locator('#intro').count()) === 0;

// --- Empty state before any play ---------------------------------------
await page.locator('.tab[data-tab="profile"]').click();
await page.waitForTimeout(300);
report.emptyProfileExplainsItself = await page.locator('#profileStarter').isVisible();
await page.locator('.tab[data-tab="train"]').click();
await page.waitForTimeout(300);

report.title = await page.title();
report.scenario = await page.textContent('#scenarioTitle');
report.players = await page.locator('.player').count();
report.ourPlayers = await page.locator('.l-ours .player').count();
report.theirPlayers = await page.locator('.l-theirs .player').count();
report.labels = await page.locator('.plabel').count();
report.finishVisible = await page.locator('#finishBtn').isVisible();
report.finishDisabledAtStart = await page.locator('#finishBtn').isDisabled();
report.arrowsBeforeSubmit = await page.locator('.l-arrows line').count();

// Labels must sit inside the same transform group as their circle.
report.labelsBoundToMarkers = await page.evaluate(() =>
  [...document.querySelectorAll('.player')].every(g => g.querySelector('circle.marker') && g.querySelector('text.plabel'))
);

// Play two passes.
const ids = await page.evaluate(() => [...document.querySelectorAll('.l-ours .player')].map(n => n.dataset.id));
const target1 = ids.find(i => i === 'u-dm') || ids[5];
await page.locator(`.l-ours .player[data-id="${target1}"]`).click();
await page.waitForTimeout(1600);
report.seqAfter1 = await page.locator('.seq-step').count();
report.carrierAfter1 = await page.textContent('#carrierLabel');

const target2 = ids.find(i => i === 'u-rcm') || ids[6];
await page.locator(`.l-ours .player[data-id="${target2}"]`).click();
await page.waitForTimeout(1600);
report.seqAfter2 = await page.locator('.seq-step').count();
report.finishEnabled = !(await page.locator('#finishBtn').isDisabled());
report.arrowsStillHidden = await page.locator('.l-arrows line').count();

// Hold-to-preview.
const box = await page.locator(`.l-ours .player[data-id="u-rw"]`).boundingBox();
if (box) {
  await page.mouse.move(box.x + box.width/2, box.y + box.height/2);
  await page.mouse.down();
  await page.waitForTimeout(650);
  await page.mouse.up();
  await page.waitForTimeout(300);
  report.previewShown = await page.locator('#preview').isVisible();
  report.previewTypes = await page.locator('.type-row').count();
  await page.locator('#previewClose').click().catch(()=>{});
}

// Submit.
await page.locator('#finishBtn').click();
await page.waitForTimeout(900);
report.analysisVisible = await page.locator('#analysis').isVisible();
report.verdict = await page.textContent('.verdict-top h3').catch(()=>null);
report.rating = await page.textContent('.rating b').catch(()=>null);
report.arrowsAfterSubmit = await page.locator('.l-arrows line').count();
report.whyToggleExists = await page.locator('#whyToggle').isVisible();

// --- Progressive disclosure --------------------------------------------
// The analysis must land as verdict + next action, with the three deep
// sections closed. Everything open at once was the density problem.
report.disclosureCount = await page.locator('#analysis .why-toggle').count();
report.allDisclosuresClosedOnArrival =
  (await page.locator('#analysis .why-body[hidden]').count()) === report.disclosureCount;
report.watchActionBeforeTheDeepStuff = await page.evaluate(() => {
  const w = document.querySelector('#watchBestBtn'), d = document.querySelector('#whyToggle');
  return !!w && !!d && w.compareDocumentPosition(d) === Node.DOCUMENT_POSITION_FOLLOWING;
});
for (const id of ['optionsToggle', 'masteryToggle']) {
  await page.locator('#' + id).click();
  await page.waitForTimeout(120);
}
report.optionsOpens = await page.locator('#optionsBody').isVisible();
report.masteryOpens = await page.locator('#masteryBody').isVisible();

await page.locator('#whyToggle').click();
await page.waitForTimeout(300);
report.whyBodyOpen = await page.locator('#whyBody').isVisible();
report.factorRows = await page.locator('.factors li').count();

// Profile updates.
await page.locator('.tab[data-tab="profile"]').click();
await page.waitForTimeout(400);
report.profileOverall = await page.textContent('#profileOverall');
report.domains = await page.locator('.domain').count();
report.badgesEarned = await page.locator('.badge-card.earned').count();

// Curriculum.
await page.locator('.tab[data-tab="learn"]').click();
await page.waitForTimeout(300);
report.lessons = await page.locator('.lesson').count();

// --- Coach directory: browse and search --------------------------------
await page.locator('.tab[data-tab="library"]').click();
await page.waitForTimeout(400);
report.directoryLeagues = await page.locator('.lib-card[data-league]').count();
report.directoryTierGroups = await page.locator('.dir-tier').count();
await page.locator('#dirSearch').fill('mourinho');
await page.waitForTimeout(200);
report.searchFindsCoach = (await page.locator('.dir-hit').count()) > 0;
await page.locator('#dirSearch').fill('sanchez');   // unaccented input
await page.waitForTimeout(200);
report.searchFoldsAccents = (await page.locator('.dir-hit').count()) > 0;
await page.locator('#dirSearch').fill('');
await page.waitForTimeout(200);
report.browseReturnsWhenSearchCleared = await page.locator('#dirBrowse').isVisible();

// --- Set-piece studio: dragging is no longer destructive ----------------
await page.locator('.tab[data-tab="setpieces"]').click();
await page.waitForTimeout(400);
report.undoDisabledBeforeAnyDrag = await page.locator('#spUndo').isDisabled();
const runBox = await page.locator('.sp-run').first().boundingBox();
if (runBox) {
  const before = await page.evaluate(() => document.querySelector('.sp-run').getAttribute('transform'));
  await page.mouse.move(runBox.x + runBox.width / 2, runBox.y + runBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(runBox.x + 55, runBox.y + 38, { steps: 8 });
  await page.mouse.up();
  await page.waitForTimeout(150);
  report.dragMovedRunner =
    (await page.evaluate(() => document.querySelector('.sp-run').getAttribute('transform'))) !== before;
  await page.locator('#spUndo').click();
  await page.waitForTimeout(200);
  report.undoRestoresShape =
    (await page.evaluate(() => document.querySelector('.sp-run').getAttribute('transform'))) === before;
}

// Tap-target audit on the train screen.
await page.locator('.tab[data-tab="train"]').click();
await page.waitForTimeout(300);
report.smallTapTargets = await page.evaluate(() =>
  [...document.querySelectorAll('button:not([hidden])')]
    .filter(b => b.offsetParent !== null)
    .map(b => ({ t: (b.textContent||'').trim().slice(0,22), h: Math.round(b.getBoundingClientRect().height) }))
    .filter(b => b.h > 0 && b.h < 40)
);
// --- INTERFACE RULES (docs/Interface_Principles.md) — pass/fail ---
report.rule_noTinyTapTargets = (await page.evaluate(() =>
  [...document.querySelectorAll('button:not([hidden])')]
    .filter(b => b.offsetParent !== null)
    .filter(b => { const r = b.getBoundingClientRect(); return r.height > 0 && r.height < 40; }).length)) === 0;
report.rule_bodyTextNotBelow16px = await page.evaluate(() =>
  parseFloat(getComputedStyle(document.body).fontSize) >= 16);
report.rule_labelsBoundToMarkers = await page.evaluate(() =>
  [...document.querySelectorAll('.player')].every(g =>
    g.querySelector('circle.marker') && g.querySelector('text.plabel')));
report.rule_primaryActionVisibleWhenActionable = report.finishVisible && report.finishEnabled;

report.horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);

await page.screenshot({ path: '/home/user/cba/shot-train.png', fullPage: false });
await page.locator('.tab[data-tab="profile"]').click();
await page.waitForTimeout(400);
await page.screenshot({ path: '/home/user/cba/shot-profile.png', fullPage: false });

console.log(JSON.stringify(report, null, 1));
console.log('ERRORS:', errors.length ? errors : 'none');
await browser.close();
