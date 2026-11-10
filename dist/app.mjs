import { codes, languages, phrase, phrases, units } from './content.mjs';
import { copy } from './copy.mjs';
import { CloudSync } from './cloud-sync.mjs';
import { TelegramAuth, insideTelegram, launchUserId, miniAppData } from './auth.mjs';
import { accountKeys, guestKeys, loadAccountProgress, rememberAccount, rememberedAccount } from './account-data.mjs';
import { maxSaveBytes, validateState } from './progress-data.mjs';
import { activitySummary, goals, recordActivity, xpPerActivity } from './home-progress.mjs';
import { wordGroups, words } from './words.mjs';
import { stories, storyLines, storyPassed } from './stories.mjs';
import { connectLessonPaths, stopPosition } from './lesson-path.mjs';
import { vocabularyEntries, vocabularyReviewSummary } from './vocabulary.mjs';
import { skillModes, createSkillRound, matchesReference, recordSkillRound, skillSnapshot } from './skill-lab.mjs';
import {
  modes, practiceQuestions, mixedQuestions, placementQuestions, checkpointQuestions, readingQuestions, matchRound, normalizeSpelling, practiceSkill
} from './practice.mjs';
import {
  path, orderedUnits, journeyFor, journeyStatus, recordJourney, applyPlacement, nextActivity, workingLevel,
  lessonUnlocked, checkpointUnlocked, accessibleLevel, levelComplete
} from './journey.mjs';
import {
  defaultPair, validPair, pairKey, newCourse, completed, lessonQuestions,
  saveLesson, recordPractice, reviewQueue, reviewStats, saveReview, passingScore
} from './engine.mjs';

const icons = {
  plane: '<path d="m3 10 18-7-7 18-4-7-7-4Zm7 4L21 3"/>',
  flame: '<path d="M12 22a7 7 0 0 0 7-7c0-3-2-5-3-6 0 2-1 3-2 3 0-4-1-7-4-10 1 4-1 6-3 9-1 1-2 3-2 5a7 7 0 0 0 7 6Z"/>',
  gem: '<path d="M6 3h12l4 6-10 12L2 9l4-6Zm-4 6h20M6 3l3 6 3 12 3-12 3-6"/>',
  bridge: '<path d="M2 19h20M5 5v14M19 5v14M2 10c3 5 6 6 10 6s7-1 10-6M9 16v3m6-3v3"/>',
  star: '<path d="m12 3 2.8 5.8 6.4.9-4.6 4.5 1.1 6.4-5.7-3-5.7 3 1.1-6.4-4.6-4.5 6.4-.9L12 3Z"/>',
  progress: '<path d="M3 20h18M6 16v-4m6 4V8m6 8V4"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  home: '<path d="M3 10.5 12 3l9 7.5M5 9v12h14V9M9 21v-7h6v7"/>',
  path: '<path d="m3 6 6-2 6 3 6-2v14l-6 2-6-3-6 2V6Zm6-2v14m6-11v14"/>',
  review: '<rect x="6" y="6" width="13" height="15" rx="2.5"/><path d="M16 3H6a3 3 0 0 0-3 3v10m7-3h5m-2.5-2.5v5"/>',
  settings: '<path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="2.5" fill="var(--icon-bg, white)"/><circle cx="15" cy="17" r="2.5" fill="var(--icon-bg, white)"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  swap: '<path d="M4 8h15m-4-4 4 4-4 4M20 16H5m4-4-4 4 4 4"/>',
  spark: '<path d="M12 2v20M2 12h20M5 5l14 14M19 5 5 19"/>',
  person: '<circle cx="12" cy="8" r="3.5"/><path d="M4.5 20v-1a7.5 7.5 0 0 1 15 0v1"/>',
  cup: '<path d="M4 7h12v5a6 6 0 0 1-12 0V7Zm12 1h2a2.5 2.5 0 1 1 0 5h-2M3 21h16"/>',
  compass: '<circle cx="12" cy="12" r="9"/><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4m8-4v4m-7 8h6"/>',
  bag: '<rect x="4" y="8" width="16" height="13" rx="2"/><path d="M8 9V7a4 4 0 0 1 8 0v2"/>',
  book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H7a3 3 0 0 0-3 2V5Zm0 16h15M8 8h7m-7 4h5"/>',
  chat: '<path d="M20.5 11.5a7.5 7.5 0 0 1-7.5 7.5H8l-4 2v-5a7.5 7.5 0 0 1 6.5-12H13a7.5 7.5 0 0 1 7.5 7.5Z"/><path d="M8.5 11.5h7"/>',
  key: '<circle cx="8" cy="8" r="4.5"/><path d="m11.5 11.5 8.5 8.5m-3.2-3.2 2.7-2.7m-5.4 0 2.5-2.5"/>',
  lock: '<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
  flag: '<path d="M5 21V4m0 1c4-4 9 4 14 0v10c-5 4-10-4-14 0"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  volume: '<path d="M4 9h4l5-4v14l-5-4H4V9Zm12 0a4.5 4.5 0 0 1 0 6m2.5-8.5a8 8 0 0 1 0 11"/>',
  search: '<circle cx="10.5" cy="10.5" r="5.5"/><path d="m15 15 5 5"/>',
  practice: '<path d="M4 7h4m-2-2v4m8-2h6M4 17h4m-2-2v4m8-4 2 2 4-4"/>',
  stories: '<path d="M12 6C9.5 4 6.3 4 3 5v14c3.3-1 6.5-1 9 1 2.5-2 5.7-2 9-1V5c-3.3-1-6.5-1-9 1Zm0 0v14"/><path d="M6 9h3m6 0h3"/>',
  vocabulary: '<path d="m3 17 4-10 4 10m-6.5-3h5m7-2.5h4v5.5h-4a2.75 2.75 0 0 1 0-5.5Z"/>',
  more: '<path d="M5 12h.01M12 12h.01M19 12h.01" stroke-width="3.6"/>',
  gap: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M7 10h5m-5 4h3m4 0h3"/>',
  order: '<rect x="3" y="4" width="6" height="6" rx="1"/><rect x="15" y="14" width="6" height="6" rx="1"/><path d="M13 7h7m-3-3 3 3-3 3M11 17H4m3-3-3 3 3 3"/>',
  mic: '<rect x="9" y="2.5" width="6" height="12" rx="3"/><path d="M5 10.5a7 7 0 0 0 14 0M12 17.5V22m-4 0h8"/>',
  pen: '<path d="m5 15 10-10a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Zm8-8 3 3"/>',
  match: '<rect x="3" y="5" width="11" height="12" rx="2"/><path d="M10 19h8a2 2 0 0 0 2-2V9m-14 3 2 2 3-4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>'
};

const main = document.querySelector('#main');
const dialog = document.querySelector('#pair-dialog');
const toast = document.querySelector('#toast');
const browserStorage = {
  getItem: key => localStorage.getItem(key),
  setItem: (key, value) => localStorage.setItem(key, value),
  removeItem: key => localStorage.removeItem(key)
};
let storageKey = guestKeys.progress;
let storageAvailable = true;
let sync;
let authClient;
let authIssue = false;
let accountTransition = false;
let accountStarting = true;
let pendingGuestState = null;
let signOutWarning = false;
let reloadAfterExercise = false;
let unsyncedEdits = false;
let cloudActionBusy = false;
let state = { ...defaultPair, courses: {}, transliterate: true };

let page = 'home';
let run = null;
let draft = null;
let vocabTab = 'words';
const lexiconFilters = { words: { query: '', topic: '', filter: '' }, phrases: { query: '', topic: '', filter: '' } };
let bridgeIndex = 0;
let toastTimer;
let disconnectLessonPaths = () => {};
let skillRecording = null;
let skillRecordToken = 0;
const navPages = ['home', 'path', 'practice', 'stories', 'vocabulary', 'progress', 'settings'];
const mobileMenuPages = ['vocabulary', 'progress', 'settings'];
const reviewable = [...phrases, ...words];
const timedPages = new Set(['study', 'quiz', 'reading', 'flashcards', 'match', 'skill']);
const bridgeEntries = words.filter(entry => entry.level === 1).slice(0, 4);
const audioEntries = new Map([...reviewable, ...storyLines].map(entry => [entry.id, entry]));

function persist() {
  writeLocalState();
  // Edits made before a sync exists (while the first sign-in check runs) are detected when it starts.
  if (sync) sync.queue(); else unsyncedEdits = true;
  renderFooter();
  updateVocabularyReview();
}

function writeLocalState() {
  // A tab whose account changed in another tab stops writing that account's cache.
  if (!storageKey) return;
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
    storageAvailable = true;
  } catch {
    storageAvailable = false;
  }
}

function course() {
  const current = state.courses[pairKey(state.base, state.target)] ??= newCourse();
  current.practiceBest ??= {};
  current.storyBest ??= {};
  return current;
}

function t(key) {
  return copy[state.base][key];
}

function fmt(value) {
  return new Intl.NumberFormat(state.base).format(value);
}

function h(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[char]);
}

function icon(name, extra = '') {
  return `<svg class="icon ${extra}" width="20" height="20" viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"
    aria-hidden="true">${icons[name]}</svg>`;
}

function mark(code, extra = '') {
  const lang = languages[code];
  return `<span class="language-mark tone-${lang.tone} ${extra}" aria-hidden="true">${lang.mark}</span>`;
}

function languageName(code) {
  const lang = languages[code];
  return `<bdi lang="${code}" dir="${lang.direction ?? 'ltr'}">${h(lang.name)}</bdi>`;
}

function pairNames(base = state.base, target = state.target) {
  return `<span class="pair-names">${languageName(base)}${icon('arrow', 'directional')}${languageName(target)}</span>`;
}

function pairButton(label = 'course') {
  return `<button class="pair-button" type="button" data-action="pair"
    aria-haspopup="dialog" aria-label="${h(t(label))} · ${h(languages[state.base].name)} → ${h(languages[state.target].name)}">
    ${mark(state.target)}${pairNames()}${icon('down')}
  </button>`;
}

function button(label, action, options = {}) {
  const { style = 'primary', symbol, id, extra = '' } = options;
  return `<button type="button" class="button ${style} ${extra}" data-action="${action}" ${id ? 'data-id="' + id + '"' : ''}>
    ${h(t(label))}${symbol ? icon(symbol, symbol === 'arrow' ? 'directional' : '') : ''}
  </button>`;
}

function backButton(label, action) {
  return `<button type="button" class="back-link" data-action="${action}">${icon('back', 'directional')}${h(t(label))}</button>`;
}

function heading(kicker, title, lead) {
  return `<div class="page-intro">
    ${kicker ? '<div class="eyebrow"><span class="intro-dot" aria-hidden="true"></span>' + h(kicker) + '</div>' : ''}
    <h1>${h(title)}</h1>${lead ? '<p>' + h(lead) + '</p>' : ''}
  </div>`;
}

function cloudStatus() {
  const status = sync?.status ?? (authIssue ? 'signin' : 'connecting');
  return ['connecting', 'pending', 'saving', 'saved'].includes(status) ? '' : t('cloud-' + status);
}

function renderFooter() {
  const status = cloudStatus();
  document.querySelector('#sidebar-foot').innerHTML = `
    <div class="sidebar-count"><i></i><i></i><i></i><strong>${h(t('pairCount'))}</strong></div>
    ${storageAvailable ? '' : `<p role="status">${h(t('localUnavailable'))}</p>`}
    ${status ? `<button class="cloud-footer" type="button" data-action="nav" data-id="settings">
      ${h(status)}
    </button>` : ''}
    <button class="cloud-footer account-footer" type="button" data-action="nav" data-id="settings">
      ${h(authClient?.user ? authClient.user.name : t('telegramSignIn'))}
    </button>`;
}

function updateCloudUI() {
  renderFooter();
  // The account panel changes with the session, e.g. offering sign-in again once a session expires.
  const panel = main.querySelector('.account-panel');
  if (panel && panel.dataset.accountState !== accountPanelState()) panel.outerHTML = accountPanel();
  const status = cloudStatus();
  main.querySelectorAll('[data-cloud-status]').forEach(element => {
    element.textContent = status;
    element.hidden = !status;
  });
  main.querySelectorAll('[data-cloud-conflict]').forEach(element => { element.hidden = !sync?.conflict; });
  main.querySelectorAll('[data-sync-notices]').forEach(element => {
    element.hidden = !status && !pendingGuestState && !sync?.conflict;
  });
  main.querySelectorAll('[data-cloud-action]').forEach(element => {
    element.disabled = cloudActionBusy || !sync || ['saving', 'connecting'].includes(sync.status);
  });
}

function applyCloudState(next) {
  state = next;
  writeLocalState();
  go(page === 'settings' ? 'settings' : 'home');
}


function renderShell(progress) {
  document.documentElement.lang = state.base;
  document.documentElement.dir = languages[state.base].direction ?? 'ltr';
  document.querySelector('.skip-link').textContent = t('skip');
  document.querySelector('#tagline').textContent = t('tagline');

  let section = run?.fromPath || run?.kind === 'checkpoint' ? 'path' : 'home';
  if (navPages.includes(page)) section = page;
  if (page === 'flashcards' || page === 'review-result') section = 'vocabulary';
  if (page === 'match' || run?.kind === 'practice') section = 'practice';
  if (page === 'reading' || run?.kind === 'reading') section = 'stories';
  const nav = document.querySelector('#navigation');
  nav.setAttribute('aria-label', t('navigation'));
  const navTitle = name => t(name === 'path' ? 'learn' : name);
  const item = name => `<button type="button" class="nav-item nav-${name}" data-action="nav" data-id="${name}"
      ${section === name ? 'aria-current="page"' : ''}>
    ${icon(name)}<span>${h(navTitle(name))}</span>${name === 'stories' ? '<span class="nav-short">' + h(t('storyNav')) + '</span>' : ''}
    ${name === 'vocabulary' ? '<span class="nav-review-count" aria-hidden="true" hidden></span>' : ''}
  </button>`;
  nav.innerHTML = navPages.map(item).join('') + `
    <details class="mobile-menu">
      <summary class="nav-item ${mobileMenuPages.includes(section) ? 'more-active' : ''}">${icon('more')}<span>${h(t('more'))}</span></summary>
      <div class="mobile-popover">${mobileMenuPages.map(item).join('')}</div>
    </details>`;
  document.querySelector('#topbar').innerHTML = `<div class="topbar-location"><img class="mobile-brand" src="./mark.svg"
    alt="Aytim" width="34" height="34">${icon(section)}<span>${h(navTitle(section))}</span></div>
    <div class="topbar-course">${pairButton()}${levelBadge()}<div class="topbar-stats">${topbarStats(progress)}</div></div>`;
  renderFooter();
  updateVocabularyReview();
}


function levelLabel(number) {
  return t('levelNumber').replace('{n}', fmt(number));
}

function levelBadge() {
  const { current, next, fill, complete } = journeyStatus(course());
  const label = levelLabel(current.level);
  const progressLabel = t(next ? 'levelProgress' : 'finalLevelProgress');
  return `<details class="course-level">
    <summary class="level-chip">
      <span>${h(label)}</span>
      <progress max="1" value="${fill}" aria-label="${h(progressLabel)}"></progress>
    </summary>
    <div class="level-popover">
      <strong>${h(label)}</strong>
      <p>${h(complete ? t('pathFinished') : current.description[state.base])}</p>
    </div>
  </details>`;
}

const uzWeekdays = ['yakshanba', 'dushanba', 'seshanba', 'chorshanba', 'payshanba', 'juma', 'shanba'];
const uzWeekdayMarks = ['Y', 'D', 'S', 'Ch', 'P', 'J', 'Sh'];
const uzMonths = ['yanvar', 'fevral', 'mart', 'aprel', 'may', 'iyun', 'iyul', 'avgust', 'sentabr', 'oktabr', 'noyabr', 'dekabr'];

function measure(value, unit) {
  if (state.base === 'uz') return fmt(value) + (unit === 'minute' ? ' daqiqa' : ' kun');
  return new Intl.NumberFormat(state.base, { style: 'unit', unit, unitDisplay: 'long' }).format(value);
}

function topbarStats({ streak, xp }) {
  const days = measure(streak, 'day');
  const rule = t('homeXpRule').replace('{n}', fmt(xpPerActivity));
  return `<span class="topbar-streak" role="img" aria-label="${h(t('homeStreak') + ' · ' + days)}"
      title="${h(t('homeStreak'))}">${icon('flame')}<bdi>${h(days)}</bdi></span>
    <span class="topbar-xp" title="${h(rule)}">${icon('gem')}<bdi dir="ltr">${fmt(xp)} XP</bdi></span>`;
}

function homeDate(date) {
  if (state.base === 'uz') {
    return fmt(date.getDate()) + '-' + uzMonths[date.getMonth()] + ', ' + uzWeekdays[date.getDay()];
  }
  return new Intl.DateTimeFormat(state.base, { weekday: 'long', month: 'long', day: 'numeric' }).format(date);
}

function homeLink(label, action) {
  return `<button type="button" class="home-link" data-action="${action}">
    ${h(t(label))}${icon('arrow', 'directional')}</button>`;
}

function pathStops(step, current, highlightNext) {
  const nextLesson = highlightNext && step.units.find(unit => !completed(unit, current));
  const best = current.practiceBest['checkpoint-' + step.level];
  const testDone = best >= 8;
  const testLocked = !checkpointUnlocked(current, step.level);
  const testNext = highlightNext && !nextLesson && !testDone && !testLocked;
  const position = index => {
    const { row, column } = stopPosition(index);
    return `style="--stop-row:${row};--stop-column:${column}"`;
  };
  const testState = testDone ? t('complete') : testNext ? t('recommended') : '';
  const testLabel = [t('levelTest'), levelLabel(step.level), testState, fmt(12) + ' ' + t('questionsLabel'), checkpointScore(step.level, current)].filter(Boolean).join(' · ');
  return `<div class="lesson-path" data-lesson-path>
    <svg class="path-connections" aria-hidden="true" focusable="false"></svg>
    <ol class="path-stops" role="list">${step.units.map((unit, index) => {
    const done = completed(unit, current);
    const next = unit === nextLesson;
    const locked = !lessonUnlocked(current, unit);
    const title = unit.title[state.base];
    const label = title + ' · ' + t(done ? 'complete' : next ? 'recommended' : 'lesson');
    return `<li ${position(index)}><button type="button" class="path-stop ${locked ? 'is-locked' : done ? 'is-complete' : next ? 'is-next' : ''}"
        data-action="study" data-id="${unit.id}" ${locked ? 'disabled aria-disabled="true"' : ''} aria-label="${h(label)}" ${next ? 'aria-current="step"' : ''}>
      <span class="path-stop-dot">${icon(locked ? 'lock' : done ? 'check' : unit.icon)}</span>
      <span class="path-stop-label">${h(title)}</span>
    </button></li>`;
  }).join('')}
      <li ${position(step.units.length)}><button type="button" class="path-stop path-stop-test ${testLocked ? 'is-locked' : testDone ? 'is-complete' : testNext ? 'is-next' : ''}"
          data-action="start-checkpoint" data-id="${step.level}" ${testLocked ? 'disabled aria-disabled="true"' : ''} aria-label="${h(testLabel)}" ${testNext ? 'aria-current="step"' : ''}>
        <span class="path-stop-dot">${icon(testLocked ? 'lock' : testDone ? 'check' : 'flag')}</span>
        <span class="path-stop-label">${h(t('levelTest'))}
          <small>${h(testDone ? t('complete') : testLocked ? fmt(12) + ' ' + t('questionsLabel') : t('takeLevelTestNow'))}</small>
          ${best === undefined ? '' : '<small class="path-stop-score">' + h(checkpointScore(step.level, current)) + '</small>'}
        </span>
      </button></li>
    </ol>
  </div>`;
}

function lessonCompletion(step, current) {
  const done = step.units.filter(unit => completed(unit, current)).length;
  return t('homeLessonsDone').replace('{done}', fmt(done)).replace('{total}', fmt(step.units.length));
}

function homePath(step, current) {
  return `<section class="panel home-panel home-path" aria-labelledby="home-path-title">
    <div class="home-panel-head">
      <div><p class="home-overline">${h(t('homeYourPath'))}</p>
        <h2 id="home-path-title">${h((step.units.find(unit => !completed(unit, current)) ?? step.units[0]).title[state.base])}</h2>
      </div>
      <span class="home-pill">${h(levelLabel(step.level))}</span>
    </div>
    ${pathStops(step, current, true)}
    <div class="home-path-footer"><span>${icon('flag')}${h(lessonCompletion(step, current))}</span>${homeLink('homeAllStops', 'go-path')}</div>
  </section>`;
}

function homeGoal({ today, week }) {
  const minutes = Math.floor(today.seconds / 60);
  const goal = measure(goals.minutes, 'minute');
  const fill = Math.min(today.seconds / (goals.minutes * 60), 1);
  const weekday = new Intl.DateTimeFormat(state.base, { weekday: 'narrow' });
  return `<section class="panel home-panel home-goal" aria-labelledby="home-goal-title">
    <div class="home-panel-head"><h2 id="home-goal-title">${h(t('homeGoal'))}</h2><span class="home-pill">${h(goal)}</span></div>
    <div class="home-goal-body">
      <div class="home-goal-ring" style="--goal-fill:${fill * 100}%" role="meter" aria-labelledby="home-goal-title"
        aria-valuemin="0" aria-valuemax="${goals.minutes}" aria-valuenow="${Math.min(minutes, goals.minutes)}"
        aria-valuetext="${h(measure(minutes, 'minute') + ' / ' + goal)}">
        <strong>${fmt(minutes)}</strong><small><bdi>/ ${h(goal)}</bdi></small>
      </div>
      <div><strong>${h(t(fill === 1 ? 'homeGoalReached' : 'homeGoalLead'))}</strong>
        <p>${h(t('homeActivityCount').replace('{n}', fmt(today.sessions)))}</p>
        ${today.sessions ? '' : '<p>' + h(t('homeGoalHint')) + '</p>'}
      </div>
    </div>
    <ol class="home-week" aria-label="${h(t('homeWeek'))}">${week.map(({ date, key, isToday, activity }) => {
      const practiced = !!activity?.sessions;
      const shortDay = state.base === 'uz' ? uzWeekdayMarks[date.getDay()] : weekday.format(date);
      const label = homeDate(date) + (practiced ? ' · ' + t('homePracticed') : '');
      return `<li class="${practiced ? 'practiced' : ''}"><span aria-hidden="true">${h(shortDay)}</span>
        <time datetime="${key}" title="${h(label)}" aria-label="${h(label)}" ${isToday ? 'aria-current="date"' : ''}>
          ${practiced ? icon('check') : fmt(date.getDate())}
        </time></li>`;
    }).join('')}</ol>
  </section>`;
}

function bridgeWords() {
  const entry = bridgeEntries[bridgeIndex];
  return `<span>${phraseMarkup(entry, state.base)}</span>${icon('arrow', 'directional')}
    <span>${phraseMarkup(entry, state.target)}</span>`;
}

function weeklyWins(wins, linkToProgress = false) {
  const labels = { lessons: 'homeWinLessons', days: 'homeWinDays', recalled: 'homeWinRecall' };
  return `<section class="panel home-panel home-wins" aria-labelledby="home-wins-title">
    <div class="home-panel-head"><h2 id="home-wins-title">${h(t('homeWeeklyWins'))}</h2>${icon('star')}</div>
    <ul class="home-win-list">${Object.entries(labels).map(([metric, key]) => {
      const goal = goals[metric];
      const value = Math.min(wins[metric], goal);
      return `<li class="${value === goal ? 'met' : ''}">${icon(value === goal ? 'check' : 'target')}
        <div><span>${h(t(key))}</span><bdi>${fmt(value)} / ${fmt(goal)}</bdi>
          <progress value="${value}" max="${goal}" aria-label="${h(t(key))}"></progress>
        </div></li>`;
    }).join('')}</ul>
    ${linkToProgress ? homeLink('viewProgress', 'go-progress') : ''}
  </section>`;
}

function renderHome(progress) {
  const showIntro = false; // Set to true to restore the home page greeting and date.
  // Enable these individually to bring a home page section back.
  const sections = { activities: false, dailyGoal: false, languageBridge: false, weeklyWins: false };
  const showSidebar = sections.dailyGoal || sections.languageBridge || sections.weeklyWins;
  const heroHeading = showIntro ? 'h2' : 'h1';
  const current = course();
  const next = nextActivity(current, +progress.date);
  const { current: step } = journeyStatus(current);
  const due = reviewQueue(current, false, +progress.date).length;
  const topic = next.unit ?? next.story;
  const title = topic?.title[state.base] ?? t(next.type === 'checkpoint' ? 'levelTest' : next.type === 'review' ? 'quickReview' : 'mixedPractice');
  const description = topic?.description[state.base] ?? t(next.type === 'checkpoint' ? 'levelTestLead' : next.type === 'review' ? 'dueLead' : 'mixedLead');
  const minutes = count => t('aboutMinutes').replace('{n}', fmt(count));
  const duration = minutes({ lesson: 3, checkpoint: 5, review: 1, story: 4, mixed: 2 }[next.type]);
  const reading = path[workingLevel(current, 'reading') - 1].stories;
  const story = reading.find(entry => !storyPassed(entry, current.storyBest?.[entry.id])) ?? reading[0];
  const date = homeDate(progress.date);
  main.innerHTML = `
    <div class="page-intro home-intro" ${showIntro ? '' : 'hidden'}>
      <div class="eyebrow home-pair"><span class="intro-dot" aria-hidden="true"></span>${pairNames()}</div>
      <h1>${h(t('homeTitle'))}${icon('plane', 'directional')}</h1>
      <div class="home-intro-meta"><p>${h(t('homeLead'))}</p><time datetime="${progress.key}">${h(date)}</time></div>
    </div>
    <div class="home-grid${showSidebar ? '' : ' no-sidebar'}">
      <div class="home-primary">
        <section class="journey-hero" aria-labelledby="home-hero-title">
          <div class="journey-copy">
            <p class="home-overline"><span class="home-dot"></span>${h(t('homeTagline'))}</p>
            <${heroHeading} id="home-hero-title">${h(t('homeRoots'))}<span>${h(t('homeHorizons'))}</span></${heroHeading}>
            <p class="journey-next">${h(t('homeNext'))} · <strong>${h(title)}</strong></p>
            <p class="journey-description">${h(description)}</p>
            <div class="journey-actions">
              ${button('continueLearning', 'continue-learning', { symbol: 'arrow' })}
              <span class="journey-time">${icon('clock')}${h(duration)}</span>
            </div>
          </div>
          <div class="journey-illustration" aria-hidden="true">
            <img src="./journey-${state.target}.svg" width="840" height="430" alt="">
            <span class="journey-stamp">${icon('plane')}${languageName(state.target)}</span>
          </div>
        </section>
        ${!current.placementDone ? `<section class="panel placement-invitation" aria-labelledby="placement-invitation-title">
          <h2 id="placement-invitation-title">${h(t('placementInvitation'))}</h2>
          <p>${h(t('placementInvitationLead'))}</p>
          <div class="placement-actions">
            ${button('placementStart', 'start-check', { symbol: 'arrow' })}
            ${button('placementSkip', 'skip-placement', { style: 'secondary' })}
          </div>
        </section>` : ''}
        ${homePath(step, current)}
        <section class="home-activities" aria-labelledby="home-activities-title" ${sections.activities ? '' : 'hidden'}>
          <div class="home-section-head"><h2 id="home-activities-title">${h(t('homeActivities'))}</h2>
            ${homeLink('homeAllPractice', 'go-practice')}</div>
          <div class="activity-grid home-activity-grid">
            ${activityCard({
              action: due ? 'home-review' : 'practice-mode', id: 'words', symbol: 'swap', tone: 'lilac',
              title: t(due ? 'homeReview' : 'mode-words'),
              description: due ? t('cardsDue').replace('{n}', fmt(due)) : t('mode-words-lead'),
              tag: minutes(due ? 1 : 3), tagIcon: 'clock'
            })}
            ${activityCard({
              action: 'open-story', id: story.id, symbol: 'chat', tone: 'peach',
              title: story.title[state.base], description: story.description[state.base], tag: minutes(4), tagIcon: 'clock'
            })}
          </div>
        </section>
      </div>
      <aside class="home-sidebar" ${showSidebar ? '' : 'hidden'}>
        ${sections.dailyGoal ? homeGoal(progress) : ''}
        <section class="panel home-panel home-bridge" aria-labelledby="home-bridge-title" ${sections.languageBridge ? '' : 'hidden'}>
          <p class="home-overline">${icon('bridge')}${h(t('homeBridge'))}</p>
          <h2 id="home-bridge-title">${h(t('homeBridgeTitle'))}</h2>
          <div class="home-bridge-words" id="bridge-words" aria-live="polite" aria-atomic="true">${bridgeWords()}</div>
          <p>${h(t('homeBridgeLead'))}</p>
          ${homeLink('homeAnotherBridge', 'next-bridge')}
        </section>
        ${sections.weeklyWins ? weeklyWins(progress.wins, true) : ''}
      </aside>
    </div>`;
}

function progressWeek(week) {
  const weekday = new Intl.DateTimeFormat(state.base, { weekday: 'narrow' });
  const counts = week.map(({ activity }) => activity?.sessions ?? 0);
  const total = counts.reduce((sum, count) => sum + count, 0);
  const max = Math.max(1, ...counts);
  return `<section class="panel progress-week" aria-labelledby="progress-week-title">
    <h2 id="progress-week-title">${h(t('homeWeek'))}</h2>
    <p>${h(t('progressWeekCount').replace('{n}', fmt(total)))}</p>
    <ol class="week-chart" role="list">${week.map(({ date, key, isToday }, index) => {
      const label = state.base === 'uz' ? uzWeekdayMarks[date.getDay()] : weekday.format(date);
      const count = counts[index];
      return `<li aria-label="${h(homeDate(date) + ' · ' + t('progressWeekCount').replace('{n}', fmt(count)))}">
        <span class="week-chart-number">${fmt(count)}</span>
        <span class="week-chart-track" aria-hidden="true"><span style="--bar-fill:${100 * count / max}%"></span></span>
        <time datetime="${key}" ${isToday ? 'aria-current="date"' : ''} title="${h(homeDate(date))}">${h(label)}</time>
      </li>`;
    }).join('')}</ol>
    ${total ? '' : '<p>' + h(t('progressWeekEmpty')) + '</p>'}
  </section>`;
}

function renderProgress({ xp, streak, week, wins }) {
  const current = course();
  const level = journeyStatus(current);
  const lessons = orderedUnits.filter(unit => completed(unit, current)).length;
  const storyQuizzes = stories.filter(story => storyPassed(story, current.storyBest[story.id])).length;
  const wordCount = reviewStats(current, words).practiced;
  const stats = [
    { label: 'progressLevel', value: levelLabel(level.current.level), icon: 'progress', tone: 'mint', fill: level.fill },
    { label: 'progressXp', value: fmt(xp) + ' XP', icon: 'gem', tone: 'sand' },
    { label: 'homeStreak', value: measure(streak, 'day'), icon: 'flame', tone: 'peach' },
    { label: 'progressLessons', value: fmt(lessons) + ' / ' + fmt(orderedUnits.length), icon: 'path', tone: 'mint' },
    { label: 'progressStories', value: fmt(storyQuizzes) + ' / ' + fmt(stories.length), icon: 'stories', tone: 'sky' },
    { label: 'progressWords', value: fmt(wordCount) + ' / ' + fmt(words.filter(word => word.level <= accessibleLevel(current)).length), icon: 'vocabulary', tone: 'lilac' }
  ];
  const levelProgress = t(level.next ? 'levelProgress' : 'finalLevelProgress');
  const percent = new Intl.NumberFormat(state.base, { style: 'percent' }).format(level.fill);
  main.innerHTML = `
    ${heading(t('progressEyebrow'), t('progressTitle'), t('progressLead'))}
    <section class="progress-stats" aria-label="${h(t('progress'))}">
      ${stats.map(stat => `<article class="panel progress-stat">
        <span class="tile-icon tone-${stat.tone}">${icon(stat.icon)}</span>
        <div class="progress-stat-copy">
          <h2>${h(t(stat.label))}</h2>
          <strong><bdi>${h(stat.value)}</bdi></strong>
        </div>
        ${stat.fill === undefined ? '' : `<div class="progress-stat-meter">
          <span>${h(levelProgress)} · ${h(percent)}</span>
          <progress max="1" value="${stat.fill}" aria-label="${h(levelProgress)}"></progress>
        </div>`}
      </article>`).join('')}
    </section>
    <div class="progress-panels">${progressWeek(week)}${weeklyWins(wins)}</div>
    ${skillProgressCards(current)}`;
}

function renderPath() {
  const current = course();
  const level = accessibleLevel(current);
  const summary = t('pathSummary').replace('{levels}', fmt(path.length)).replace('{lessons}', fmt(orderedUnits.length));
  main.innerHTML = `
    ${heading(t('pathEyebrow'), t('pathTitle'), summary + ' ' + t('pathLead'))}
    <div class="learning-path">
      ${path.map(step => {
        const active = step.level === level;
        const locked = step.level > level;
        return `<details class="unit-group panel ${locked ? 'is-locked' : ''}" ${active ? 'open' : ''}>
          <summary class="level-summary" ${active ? 'aria-current="step"' : ''}>
            <span class="level-name"><span class="level-dot" aria-hidden="true"></span>${h(levelLabel(step.level))}${locked ? ' · ' + h(t('lockedLevel')) : ''}</span>
            <span class="level-summary-end"><span class="level-count">${h(lessonCompletion(step, current))}</span>${icon('down')}</span>
          </summary>
          <div class="level-content">
            <p>${h(step.description[state.base])}</p>
            ${pathStops(step, current, active)}
          </div>
        </details>`;
      }).join('')}
    </div>`;
}

function activityCard({ action, id, symbol, tone, title, description, tag, tagIcon, score }) {
  return `<button class="activity-card" type="button" data-action="${action}" data-id="${id}">
    <span class="activity-card-top"><span class="tile-icon tone-${tone}">${icon(symbol)}</span>
      ${tag ? '<span class="activity-tag">' + (tagIcon ? icon(tagIcon) : '') + h(tag) + '</span>' : ''}</span>
    <strong>${h(title)}</strong>
    <span class="activity-description">${h(description)}</span>
    <span class="activity-card-bottom">${score ? '<span>' + h(score) + '</span>' : '<span></span>'}${icon('arrow', 'directional')}</span>
  </button>`;
}

function checkpointScore(level, current) {
  const best = current.practiceBest['checkpoint-' + level];
  return best === undefined ? '' : t('best') + ' · ' + fmt(best) + ' / ' + fmt(12);
}

function skillName(skill) {
  return t('skill' + skill[0].toUpperCase() + skill.slice(1));
}

function skillProgressCards(current) {
  const level = accessibleLevel(current);
  return `<section class="skill-progress-section" aria-label="${h(t('skillSection'))}">
    <div class="skill-section-heading"><h2>${h(t('skillSection'))}</h2><p>${h(t('skillTestNote'))}</p></div>
    <div class="skill-grid">${Object.entries(skillModes).map(([skill, design]) => {
      const data = skillSnapshot(current, skill, level);
      return `<article class="panel skill-card skill-progress-card">
        <span class="tile-icon tone-${design.tone}">${icon(design.icon)}</span>
        <h3>${h(skillName(skill))}</h3>
        <p>${h(t('skillPracticeCount').replace('{n}', fmt(data.practice)))}</p>
        <p>${h(t('skillTestCount').replace('{n}', fmt(data.attempts)))}</p>
      </article>`;
    }).join('')}</div>
  </section>`;
}

function skillPracticeCards(current) {
  const level = accessibleLevel(current);
  return `<section class="skill-section" aria-label="${h(t('skillSection'))}">
    <div class="skill-section-heading"><h2>${h(t('skillSection'))}</h2>
      <p>${h(t('skillSectionLead'))}</p></div>
    <div class="skill-grid">${Object.entries(skillModes).map(([skill, design]) => {
      const data = skillSnapshot(current, skill, level);
      return `<article class="panel skill-card">
        <div class="skill-card-title">
          <span class="tile-icon tone-${design.tone}">${icon(design.icon)}</span>
          <div><h3>${h(skillName(skill))}</h3>
            <small>${h(t('skillPracticeCount').replace('{n}', fmt(data.practice)))}</small></div>
        </div>
        <p>${h(t('skill' + skill[0].toUpperCase() + skill.slice(1) + 'Lead'))}</p>
        <div class="skill-card-actions">
          <button class="button primary" type="button" data-action="start-skill" data-id="${skill}">${h(t('skillPracticeAction'))}</button>
          <button class="button secondary" type="button" data-action="start-skill-test" data-id="${skill}">
            ${h(t('skillTestAction'))}</button>
        </div>
      </article>`;
    }).join('')}</div>
    <p class="skill-note">${h(t('skillTestNote'))}</p>
  </section>`;
}

function renderPractice() {
  const current = course();
  const due = reviewQueue(current).length;
  main.innerHTML = `${heading(t('practiceEyebrow'), t('practiceTitle'), t(due ? 'practiceDue' : 'practiceLead'))}
    ${skillPracticeCards(current)}
    ${due ? `<div class="panel practice-due">
      <span class="tile-icon tone-mint">${icon('review')}</span>
      <strong>${h(t('cardsDue').replace('{n}', fmt(due)))}</strong>
      ${homeLink('quickReview', 'home-review')}
    </div>` : ''}
    <div class="activity-grid">${Object.entries(modes).map(([mode, design]) => {
      const best = current.practiceBest[mode];
      return activityCard({
        action: 'practice-mode', id: mode, symbol: design.icon, tone: design.tone,
        title: t('mode-' + mode), description: t('mode-' + mode + '-lead'),
        tag: mode === 'match' ? fmt(5) + ' ' + t('pairsLabel') : fmt(6) + ' ' + t('questionsLabel'),
        score: best === undefined ? '' : t('best') + ' · ' + fmt(best) + ' / ' + fmt(mode === 'match' ? 5 : 6)
      });
    }).join('')}${activityCard({
      action: 'start-checkpoint', id: journeyFor(current).level, symbol: 'check', tone: 'sky',
      title: t('levelTest') + ' · ' + levelLabel(journeyFor(current).level), description: t('levelTestLead'),
      tag: fmt(12) + ' ' + t('questionsLabel'), score: checkpointScore(journeyFor(current).level, current)
    })}</div>`;
}


function startSkill(skill, assessment = false) {
  if (!skillModes[skill]) return;
  const round = createSkillRound(skill, course(), state.base, state.target, assessment);
  go('skill', {
    kind: 'skill', ...round, index: 0, outcomes: [],
    stage: 'task', heard: false, revealed: false, audioUnavailable: false
  });
}

// Microphone data is intentionally ephemeral. No audio blob or transcription
// becomes part of the account, D1 database, or progress export.
function stopSkillRecording() {
  skillRecordToken++;
  const current = skillRecording;
  skillRecording = null;
  if (!current) return;
  try {
    if (current.recorder?.state === 'recording') current.recorder.stop();
  } catch { /* A recorder may have already stopped itself. */ }
  current.stream?.getTracks().forEach(track => track.stop());
  if (current.url) URL.revokeObjectURL(current.url);
}

function skillRecordingStatus(message) {
  const output = main.querySelector('#skill-mic-status');
  if (output) output.textContent = message;
}

async function beginSkillRecording() {
  if (page !== 'skill' || run.skill !== 'speaking' || run.outcomes[run.index]) return;
  stopSkillRecording();
  if (!navigator.mediaDevices?.getUserMedia || !window.MediaRecorder) {
    skillRecordingStatus(t('skillMicProblem'));
    return;
  }
  const token = ++skillRecordToken;
  const session = run;
  const index = run.index;
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    if (token !== skillRecordToken || page !== 'skill' || run !== session || run.index !== index) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    skillRecording = { recorder, stream, url: null };
    recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      if (token !== skillRecordToken || run !== session || run.index !== index || page !== 'skill' || run.outcomes[index]) return;
      if (chunks.length) {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        skillRecording.url = URL.createObjectURL(blob);
        const player = main.querySelector('#skill-audio-playback');
        if (player) { player.src = skillRecording.url; player.hidden = false; }
      }
      const start = main.querySelector('#skill-record-start');
      const stop = main.querySelector('#skill-record-stop');
      if (start) start.disabled = false;
      if (stop) stop.disabled = true;
      skillRecordingStatus(t('skillPrivacy'));
    };
    recorder.start();
    const start = main.querySelector('#skill-record-start');
    const stop = main.querySelector('#skill-record-stop');
    if (start) start.disabled = true;
    if (stop) stop.disabled = false;
    skillRecordingStatus(t('skillRecording'));
  } catch {
    if (token === skillRecordToken) skillRecordingStatus(t('skillMicProblem'));
  }
}

function endSkillRecording() {
  if (page !== 'skill' || skillRecording?.recorder?.state !== 'recording') return;
  skillRecording.recorder.stop();
}

function playSkillAudio() {
  if (page !== 'skill' || run.stage !== 'task') return;
  const session = run;
  const index = run.index;
  const answered = Boolean(run.outcomes[index]);
  speak(run.tasks[index].entry.id, state.target,
    () => {
      if (page !== 'skill' || run !== session || run.index !== index) return;
      run.audioUnavailable = true;
      const message = main.querySelector('#skill-audio-status');
      if (message) message.textContent = t('skillNoAudio');
    },
    () => {
      if (page !== 'skill' || run !== session || run.index !== index) return;
      if (!answered) run.heard = true;
    });
}

function revealSkillReference() {
  if (page !== 'skill' || run.stage !== 'task' || run.outcomes[run.index]) return;
  run.revealed = true;
  const reference = main.querySelector('#skill-reference-preview');
  if (reference) reference.hidden = false;
}

function submitSkillAnswer(event) {
  if (page !== 'skill' || run.stage !== 'task' || run.skill === 'speaking' ||
      run.outcomes[run.index]) return;
  const entered = event.target.querySelector('textarea')?.value.trim();
  if (!entered) return;
  const entry = run.tasks[run.index].entry;
  const scorable = !run.revealed && !run.tasks[run.index].openEnded && (run.skill === 'writing' || run.heard);
  run.outcomes[run.index] = {
    attempted: true, scorable,
    referenceMatch: scorable && matchesReference(entered, entry.text[state.target], state.target)
  };
  renderSkillSession();
}

function confirmSkillSpeaking() {
  if (page !== 'skill' || run.stage !== 'task' || run.skill !== 'speaking' ||
      run.outcomes[run.index]) return;
  endSkillRecording();
  run.outcomes[run.index] = { attempted: true, scorable: false, referenceMatch: false };
  renderSkillSession();
}

function nextSkillTask() {
  if (page !== 'skill' || run.stage !== 'task' || !run.outcomes[run.index]) return;
  stopSkillRecording();
  window.speechSynthesis?.cancel();
  if (run.index + 1 < run.tasks.length) {
    run.index++;
    run.heard = false;
    run.revealed = false;
    run.audioUnavailable = false;
    renderSkillSession();
    main.querySelector('#skill-focus')?.focus({ preventScroll: true });
    return;
  }
  const current = course();
  run.summary = recordSkillRound(current, run, run.outcomes);
  run.stage = 'summary';
  finishActivity(current, Date.now());
  persist();
  renderSkillSession();
}

function renderSkillSession() {
  const skill = run.skill;
  const title = skillName(skill);
  const kind = t(run.assessment ? 'skillTestAction' : 'skillPracticeAction');
  if (run.stage === 'summary') {
    const { completed, matched, scored, total } = run.summary;
    main.innerHTML = `<div class="work-area">
      ${backButton('skillBack', 'go-practice')}
      <section class="panel result-panel">
        <span class="result-icon tone-mint">${icon('check')}</span>
        <h1>${h(t('skillSummary'))}</h1>
        <h2>${h(title)} · ${h(levelLabel(run.level))}</h2>
        <p>${h(t('skillSummaryLead'))}</p>
        <div class="skill-summary-stats">
          <span><strong>${fmt(completed)} / ${fmt(total)}</strong>${h(t('skillCompleted'))}</span>
          ${skill === 'speaking' ? '' : `<span><strong>${fmt(matched)} / ${fmt(scored)}</strong>${h(t('skillMatches'))}</span>`}
        </div>
        <div class="result-actions">
          <button type="button" class="button secondary" data-action="go-practice">${h(t('skillBack'))}</button>
          <button type="button" class="button primary" data-action="${run.assessment ? 'start-skill-test' : 'start-skill'}" data-id="${skill}">${h(t('skillAgain'))}</button>
        </div>
      </section>
    </div>`;
    return;
  }
  const task = run.tasks[run.index];
  const entry = task.entry;
  const outcome = run.outcomes[run.index];
  const done = Boolean(outcome);
  const listening = skill === 'listening';
  const speaking = skill === 'speaking';
  const direction = languages[state.target].direction ?? 'ltr';
  const prompt = t(listening ? 'skillListenInstruction' : speaking ? (task.openEnded ? 'skillFreeSpeakInstruction' : 'skillSpeakInstruction') : (task.openEnded ? 'skillFreeWriteInstruction' : 'skillWriteInstruction'));
  const lead = listening
    ? `<div class="skill-audio-control">
      <button class="button secondary" type="button" data-action="skill-listen">${icon('volume')}${h(t('skillPlayAudio'))}</button>
      <span id="skill-audio-status" class="skill-note">${h(t('skillAudioNotice'))}</span>
    </div>`
    : `<div class="skill-source">
      <span class="skill-small-label">${h(task.openEnded ? languages[state.base].name : speaking ? languages[state.target].name : languages[state.base].name)}</span>
      ${task.openEnded ? `<p lang="${state.base}">${h(task.context[state.base])}</p>` : phraseMarkup(entry, speaking ? state.target : state.base, speaking)}
    </div>
    ${speaking ? `<div class="skill-audio-control">
      <button type="button" class="button secondary" data-action="skill-listen">${icon('volume')}${h(t('skillPlayAudio'))}</button>
    </div>` : ''}`;
  const form = speaking ? `<div class="skill-record-tools">
      <div class="skill-record-actions">
        <button id="skill-record-start" class="button secondary" type="button" data-action="skill-record-start">${icon('mic')}${h(t('skillStartRecord'))}</button>
        <button id="skill-record-stop" class="button secondary" type="button" data-action="skill-record-stop" disabled>${h(t('skillStopRecord'))}</button>
      </div>
      <audio id="skill-audio-playback" controls hidden aria-label="${h(t('skillPlayback'))}"></audio>
      <p id="skill-mic-status" class="skill-note" role="status">${h(t('skillPrivacy'))}</p>
      <button type="button" class="button primary" data-action="skill-spoke">${h(t('skillSpoke'))}${icon('arrow')}</button>
    </div>`
    : `<form id="skill-answer-form" class="skill-answer-form">
      <label for="skill-answer">${h(t('skillPrompt'))}</label>
      <textarea id="skill-answer" lang="${state.target}" dir="${direction}" rows="3" maxlength="500"
        required spellcheck="false" autocomplete="off" autocapitalize="off"></textarea>
      <div class="skill-answer-actions">
        <button type="button" class="button secondary" data-action="skill-reveal">${h(t('skillReveal'))}</button>
        <button type="submit" class="button primary">${h(t('skillSubmit'))}${icon('check')}</button>
      </div>
    </form>`;
  const reference = speaking
    ? (done ? `<div class="skill-reference">
        <strong>${h(t('skillExample'))}</strong>
        <p>${phraseMarkup(entry, state.target)}</p>
      </div>` : '')
    : `<div id="skill-reference-preview" class="skill-reference" ${run.revealed || done ? '' : 'hidden'}>
        <strong>${h(t(task.openEnded ? 'skillExample' : 'skillReference'))}</strong>
        <p>${phraseMarkup(entry, state.target)}</p>
        ${done ? `<p class="skill-result-message">${h(!outcome.scorable ? t('skillUnscored') : outcome.referenceMatch ? t('skillExact') : t('skillNotExact'))}</p>` : ''}
      </div>`;
  main.innerHTML = `<div class="work-area">
    ${backButton('skillBack', 'go-practice')}
    ${heading(kind, title + ' · ' + levelLabel(run.level))}
    <section class="panel skill-session">
      ${sessionProgress(run.index + 1, run.tasks.length, 'question')}
      <div class="skill-prompt">
        <h2 id="skill-focus" tabindex="-1">${h(prompt)}</h2>
        ${lead}
      </div>
      ${done ? '' : form}
      ${reference}
      ${done ? `<div class="skill-next-actions">
        <button class="button primary" type="button" data-action="skill-next">
          ${h(t(run.index + 1 === run.tasks.length ? 'skillFinish' : 'skillNextTask'))}${icon('arrow', 'directional')}
        </button>
      </div>` : ''}
    </section>
  </div>`;
}

function renderStories() {
  const current = course();
  const level = accessibleLevel(current);
  main.innerHTML = `${heading(t('storiesEyebrow'), t('stories'), t('storiesLead'))}
    <div class="activity-grid story-grid">${stories.filter(story => story.level <= level).map(story => {
      const best = current.storyBest[story.id];
      return activityCard({
        action: 'open-story', id: story.id, symbol: 'stories', tone: story.tone,
        title: story.title[state.base], description: story.description[state.base],
        tag: levelLabel(path.find(step => step.stories.includes(story)).level),
        score: best === undefined ? '' : t('best') + ' · ' + fmt(best) + ' / ' + fmt(story.questions.length)
      });
    }).join('')}</div>`;
}

function renderReading() {
  const { story } = run;
  main.innerHTML = `<div class="work-area">
    ${backButton('backStories', 'go-stories')}
    ${heading(t('stories'), story.title[state.base], story.description[state.base])}
    <article class="panel reading-panel">
      <div class="reading-tools">
        <span class="reading-language">${mark(state.target)}${languageName(state.target)}</span>
        <button class="button secondary" type="button" data-action="toggle-translations"
          aria-expanded="false" aria-controls="story-text">${h(t('showTranslations'))}</button>
      </div>
      <h2 lang="${state.target}" dir="${languages[state.target].direction ?? 'ltr'}">${h(story.title[state.target])}</h2>
      <div id="story-text" class="reading-text">
        ${story.lines.map(entry => `<div class="reading-line">
          <div><p>${phraseMarkup(entry, state.target)}</p>
            <p class="base-text story-translation" hidden>${phraseMarkup(entry, state.base, false)}</p>
          </div>${listenButton(entry, state.target)}
        </div>`).join('')}
      </div>
      <div class="panel-actions">${button('storyQuiz', 'start-reading-quiz', { symbol: 'arrow' })}</div>
    </article>
  </div>`;
}

function toggleTranslations(control) {
  const reveal = control.getAttribute('aria-expanded') === 'false';
  control.setAttribute('aria-expanded', String(reveal));
  control.textContent = t(reveal ? 'hideTranslations' : 'showTranslations');
  main.querySelectorAll('.story-translation').forEach(line => { line.hidden = !reveal; });
}


function phraseMarkup(entry, code, showRoman = true) {
  const roman = showRoman && code === 'ar' && state.transliterate
    ? `<small class="roman" lang="ar-Latn" dir="ltr">${h(entry.romanization)}</small>`
    : '';
  return `<span class="phrase-text" lang="${code}" dir="${languages[code].direction ?? 'ltr'}">${h(entry.text[code])}</span>${roman}`;
}

function listenButton(entry, code) {
  const label = h(t('listen') + ' · ' + entry.text[code]);
  return `<button type="button" class="icon-button sound" data-action="speak" data-id="${entry.id}" data-lang="${code}"
    title="${h(t('listen'))}" aria-label="${label}">${icon('volume')}</button>`;
}

function phraseRow(entry, extra = '') {
  return `<div class="phrase-row">
    <div class="phrase-pair">
      <div class="target-text">${phraseMarkup(entry, state.target)}</div>
      <div class="base-text">${phraseMarkup(entry, state.base, false)}</div>
    </div><div class="phrase-actions">${listenButton(entry, state.target)}${extra}</div>
  </div>`;
}

function usageNotes() {
  const pair = [state.base, state.target];
  const notes = [];
  if (pair.includes('ar')) notes.push(t('arabicNote'));
  if (pair.some(code => ['ar', 'ru', 'de'].includes(code))) notes.push(t('genderNote'));
  return notes.length ? '<div class="usage-notes">' + notes.map(note => '<p>' + h(note) + '</p>').join('') + '</div>' : '';
}

function renderStudy() {
  const { unit, fromPath } = run;
  main.innerHTML = `<div class="work-area">
    ${fromPath ? backButton('backPath', 'go-path') : backButton('backToday', 'go-home')}
    ${heading(t('lesson'), unit.title[state.base], unit.description[state.base])}
    <section class="panel study-panel">
      <div class="study-head"><span class="tile-icon tone-${unit.tone}">${icon(unit.icon)}</span>
        <div><h2>${h(t('study'))}</h2><p>${h(t('studyLead'))}</p></div></div>
      <div class="phrase-list">${unit.phrases.map(phraseRow).join('')}</div>
      ${usageNotes()}
      <div class="panel-actions">${button('startPractice', 'start-practice', { symbol: 'arrow' })}</div>
    </section>
  </div>`;
}

function sessionProgress(step, total, label) {
  return `<div class="session-progress">
    <span>${h(t(label))} <bdi>${fmt(step)} / ${fmt(total)}</bdi></span>
    <progress value="${step}" max="${total}" aria-label="${h(t(label))}"></progress>
  </div>`;
}


function quizLabels() {
  if (run.kind === 'checkpoint') return { title: t('levelTest') + ' · ' + levelLabel(run.level), kicker: t('practice'), back: 'backPath', action: 'go-path' };
  if (run.kind === 'mixed') return { title: t('mixedPractice'), kicker: t('today'), back: 'backToday', action: 'go-home' };
  if (run.kind === 'practice') return { title: t('mode-' + run.mode), kicker: t('practice'), back: 'backPractice', action: 'go-practice' };
  if (run.kind === 'reading') return { title: run.story.title[state.base], kicker: t('storyQuiz'), back: 'backStories', action: 'go-stories' };
  const title = run.kind === 'check' ? t('check') : run.unit.title[state.base];
  const kicker = run.kind === 'check' ? t('today') : t('lesson');
  return { title, kicker, back: run.fromPath ? 'backPath' : 'backToday', action: run.fromPath ? 'go-path' : 'go-home' };
}

function quizPrompt(question) {
  const { task, entry, from, gap, studyEntry } = question;
  let instruction;
  let contents = '';
  if (task === 'reading') {
    instruction = question.prompt;
  } else if (task === 'listen') {
    instruction = t('listenPrompt');
    contents = `<div class="listening-actions">
      ${button('listen', 'listen-quiz', { symbol: 'volume' })}
      <button type="button" class="text-button" data-action="show-transcript"
        aria-expanded="false" aria-controls="quiz-transcript">${h(t('transcript'))}</button>
    </div>
    <div id="quiz-transcript" class="quiz-transcript" hidden>${phraseMarkup(entry, from)}</div>`;
  } else if (gap) {
    instruction = t(task === 'spelling' ? 'spellingPrompt' : 'gapPrompt');
    contents = `<p class="gapped-phrase" lang="${from}" dir="${languages[from].direction ?? 'ltr'}">${h(gap.before)}<span
      class="gap-slot" role="img" aria-label="${h(t('missingWord'))}">…</span>${h(gap.after)}</p>
      <p class="question-gloss">${phraseMarkup(studyEntry, state.base, false)}</p>`;
  } else if (task === 'order') {
    instruction = t('modelPrompt');
    contents = `<div id="order-model" class="order-model">
      <div class="quiz-phrase"><div>${phraseMarkup(entry, from)}</div>${listenButton(entry, from)}</div>
      ${button('hideModel', 'hide-model', { style: 'secondary', symbol: 'arrow' })}
    </div>
    <p class="question-gloss">${phraseMarkup(entry, state.base, false)}</p>`;
  } else {
    const key = from === state.target ? run.mode === 'words' ? 'wordMeaning' : 'meaning' : 'translate';
    instruction = t(key);
    contents = `<div class="quiz-phrase"><div>${phraseMarkup(entry, from, from === state.target)}</div>
      ${from === state.target ? listenButton(entry, from) : ''}</div>`;
  }
  return `<div class="quiz-prompt" data-task="${task ?? 'translation'}"><h2 id="question-focus" tabindex="-1">${h(instruction)}</h2>${contents}</div>`;
}

function quizInputs(question) {
  if (question.options) {
    return `<div class="quiz-options" role="group" aria-labelledby="question-focus">
      ${question.options.map((option, index) => `<button type="button" class="option" data-action="answer" data-id="${option.id}">
        <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span class="option-copy">${phraseMarkup(option, question.to, question.to === state.target && !question.gap)}</span>
        <span class="option-result" aria-hidden="true"></span>
      </button>`).join('')}
    </div>`;
  }
  if (question.task === 'spelling') {
    return `<form class="spelling-form" id="spelling-form">
      <input id="spelling-word" lang="${question.to}" dir="${languages[question.to].direction ?? 'ltr'}" maxlength="100"
        placeholder="${h(t('missingWord'))}" aria-label="${h(t('missingWord'))}" required spellcheck="false" autocomplete="off" autocapitalize="off">
      <button class="button primary" type="submit">${h(t('checkAnswer'))}${icon('check')}</button>
    </form>`;
  }
  const direction = languages[question.to].direction ?? 'ltr';
  return `<div id="order-board" class="order-board" hidden>
    <div class="order-label">${h(t('yourSentence'))}</div>
    <div class="order-line" id="order-line" lang="${question.to}" dir="${direction}"></div>
    <div class="order-label">${h(t('wordBank'))}</div>
    <div class="order-tray" id="order-tray" lang="${question.to}" dir="${direction}"></div>
    <div class="order-actions">
      <button type="button" class="button secondary" data-action="clear-order" disabled>${h(t('clearOrder'))}</button>
      <button type="button" class="button primary" data-action="check-order" disabled>${h(t('checkAnswer'))}${icon('check')}</button>
    </div>
  </div>`;
}

function renderQuiz() {
  const { questions, index } = run;
  const question = questions[index];
  const last = index === questions.length - 1;
  const { title, kicker, back, action } = quizLabels();
  if (question.task === 'order') run.placed = [];
  main.innerHTML = `<div class="work-area">
    ${backButton(back, action)}
    ${heading(kicker, title)}
    <section class="panel quiz-panel">
      ${sessionProgress(index + 1, questions.length, 'question')}
      ${quizPrompt(question)}${quizInputs(question)}
      ${question.task === 'reading' ? `<details class="reading-reference">
        <summary>${h(t('readAgain'))}</summary>
        ${run.story.lines.map(entry => '<p>' + phraseMarkup(entry, state.target, false) + '</p>').join('')}
      </details>` : ''}
      <div class="quiz-bottom">
        <div id="answer-feedback" class="answer-feedback" role="status" aria-atomic="true"></div>
        <button type="button" id="quiz-next" class="button primary" data-action="advance-quiz" disabled>
          ${h(t(last ? 'results' : 'next'))}${icon('arrow', 'directional')}
        </button>
      </div>
    </section>
  </div>`;
}


function saveQuizResult() {
  const current = course();
  const score = run.answers.filter(answer => answer.correct).length;
  const now = Date.now();
  run.score = score;
  if (run.kind === 'check') {
    applyPlacement(current, run.answers);
    current.placement = score;
  } else if (run.kind === 'reading') {
    recordJourney(current, [...run.answers, { id: 'reading:' + run.story.id, correct: storyPassed(run.story, score) }], 'reading', now);
    current.storyBest[run.story.id] = Math.max(current.storyBest[run.story.id] ?? 0, score);
  } else {
    recordJourney(current, run.answers, run.kind, now);
    if (run.kind === 'lesson') saveLesson(current, run.unit, run.answers, now);
    else recordPractice(current, run.answers, now);
    if (run.kind === 'practice' || run.kind === 'checkpoint') {
      const key = run.kind === 'checkpoint' ? 'checkpoint-' + run.level : run.mode;
      current.practiceBest[key] = Math.max(current.practiceBest[key] ?? 0, score);
      journeyFor(current);
    }
  }
  const lessonId = run.kind === 'lesson' && score >= passingScore ? run.unit.id : undefined;
  const recalled = run.questions.flatMap((question, index) =>
    question.task === 'spelling' && run.answers[index].correct
      ? [normalizeSpelling(question.entry.text[question.to], question.to)]
      : []
  );
  finishActivity(current, now, { lessonId, recalled });
  persist();
}

function skillForQuestion(question) {
  if (question.task === 'reading') return 'reading';
  if (question.task === 'listen' && (run.heardIndex !== run.index || !main.querySelector('#quiz-transcript').hidden)) return 'reading';
  return practiceSkill(question.task ?? run.mode);
}


function finishAnswer(correct, selectedId) {
  if (page !== 'quiz' || run.answers[run.index]) return;
  const question = run.questions[run.index];
  const answer = question.studyEntry ?? question.entry;
  run.answers.push({ id: answer.id, correct, skill: skillForQuestion(question) });
  main.querySelectorAll('.option').forEach(option => {
    const correctOption = option.dataset.id === question.entry.id;
    const wrongOption = option.dataset.id === selectedId && !correct;
    option.setAttribute('aria-disabled', 'true');
    option.tabIndex = -1;
    option.classList.toggle('option-correct', correctOption);
    option.classList.toggle('option-wrong', wrongOption);
    if (correctOption || wrongOption) option.querySelector('.option-result').innerHTML = icon(correctOption ? 'check' : 'close');
  });
  const feedback = main.querySelector('#answer-feedback');
  feedback.className = 'answer-feedback ' + (correct ? 'correct' : 'incorrect');
  feedback.innerHTML = correct
    ? icon('check') + '<strong>' + h(t('correct')) + '</strong>'
    : icon('close') + '<strong>' + h(t('correctAnswer')) + '</strong>' + phraseMarkup(answer, question.to, false);
  main.querySelector('#quiz-next').disabled = false;
  if (run.answers.length === run.questions.length) saveQuizResult();
}

function answerQuestion(id) {
  if (page !== 'quiz' || run.answers[run.index]) return;
  const question = run.questions[run.index];
  if (question.options?.some(option => option.id === id)) finishAnswer(id === question.entry.id, id);
}

function revealTranscript() {
  main.querySelector('#quiz-transcript').hidden = false;
  main.querySelector('[data-action="show-transcript"]').setAttribute('aria-expanded', 'true');
}

function orderBoard() {
  const question = run.questions[run.index];
  const placed = run.placed;
  const available = question.tray.filter(token => !placed.includes(token));
  function chip(token, action) {
    return `<button type="button" class="word-chip" data-action="${action}" data-id="${token.id}">${h(token.text)}</button>`;
  }
  main.querySelector('#order-line').innerHTML = placed.map(token => chip(token, 'remove-token')).join('');
  main.querySelector('#order-tray').innerHTML = available.map(token => chip(token, 'add-token')).join('');
  main.querySelector('[data-action="clear-order"]').disabled = placed.length === 0;
  main.querySelector('[data-action="check-order"]').disabled = available.length > 0;
}

function hideOrderModel() {
  main.querySelector('#order-model').hidden = true;
  main.querySelector('#question-focus').textContent = t('buildPrompt');
  main.querySelector('#order-board').hidden = false;
  orderBoard();
  main.querySelector('#order-tray button').focus({ preventScroll: true });
}

function moveOrderToken(id, add) {
  if (run.answers[run.index]) return;
  if (add) {
    const token = run.questions[run.index].tray.find(item => item.id === id);
    if (token && !run.placed.includes(token)) run.placed.push(token);
  } else {
    run.placed = run.placed.filter(token => token.id !== id);
  }
  orderBoard();
  const focus = add
    ? main.querySelector('#order-tray button') ?? main.querySelector('[data-action="check-order"]')
    : main.querySelector('#order-tray [data-id="' + id + '"]');
  focus?.focus({ preventScroll: true });
}

function checkOrder() {
  const question = run.questions[run.index];
  if (run.answers[run.index] || run.placed.length !== question.tray.length) return;
  const correct = run.placed.map(token => token.text).join(' ') === question.entry.text[question.to];
  main.querySelectorAll('#order-board button').forEach(control => { control.disabled = true; });
  finishAnswer(correct);
  main.querySelector('#quiz-next').focus({ preventScroll: true });
}

function checkSpelling(event) {
  const form = event.target;
  const input = form.querySelector('input');
  const question = run.questions[run.index];
  const submitted = normalizeSpelling(input.value, question.to);
  if (!submitted || run.answers[run.index]) return;
  input.readOnly = true;
  form.querySelector('button').disabled = true;
  finishAnswer(submitted === normalizeSpelling(question.entry.text[question.to], question.to));
  main.querySelector('#quiz-next').focus({ preventScroll: true });
}

function advanceQuiz() {
  if (page !== 'quiz' || !run.answers[run.index]) return;
  if (run.index + 1 === run.questions.length) {
    go('result', run);
  } else {
    run.index++;
    renderQuiz();
    main.querySelector('#question-focus').focus();
  }
}


function levelUpNotice() {
  const level = journeyFor(course()).level;
  if (level <= run.startLevel) return '';
  return `<p class="level-up" role="status">${icon('spark')}${h(t('levelReached').replace('{n}', fmt(level)))}</p>`;
}

function renderResult() {
  const { kind, score } = run;
  const total = run.questions?.length ?? run.total;
  const isMatch = kind === 'practice' && run.mode === 'match';
  const passed = kind === 'check' || score >= (kind === 'lesson' ? passingScore : Math.ceil(total * 2 / 3));
  const continueButton = button('continueLearning', 'continue-learning', { symbol: 'arrow' });
  let title, detail, buttons;
  if (kind === 'checkpoint') {
    title = passed ? 'levelTestDone' : 'tryAgain';
    detail = t(passed ? (run.level === path.length ? 'finalLevelTestPassed' : 'levelTestPassed') : 'levelTestRetry');
    buttons = button('backPath', 'go-path', { style: 'secondary' })
      + (passed ? '' : button('retry', 'start-checkpoint', { id: run.level, symbol: 'arrow' }));
  } else if (kind === 'practice' || kind === 'mixed') {
    title = 'practiceDone';
    detail = t('practiceDoneLead');
    buttons = kind === 'mixed' ? continueButton : button('backPractice', 'go-practice', { style: 'secondary' })
      + button('againPractice', 'practice-mode', { id: run.mode, symbol: 'arrow' });
  } else if (kind === 'reading') {
    title = 'storyResult';
    detail = t('storyResultLead');
    buttons = run.guided ? continueButton : button('backStories', 'go-stories', { style: 'secondary' })
      + button('readAgain', 'open-story', { id: run.story.id, symbol: 'arrow' });
  } else if (kind === 'check') {
    title = 'checkDone';
    detail = t('checkPlaced').replace('{n}', fmt(journeyFor(course()).level));
    buttons = continueButton;
  } else {
    title = passed ? 'lessonDone' : 'tryAgain';
    detail = t(passed ? 'passLead' : 'retryLead');
    buttons = (passed ? '' : button('retry', 'study', { id: run.unit.id, style: 'secondary' })) + continueButton;
  }
  main.innerHTML = `<div class="work-area">
    <section class="panel result-panel">
      <span class="result-icon tone-${passed ? 'mint' : 'lilac'}">${icon(passed ? 'check' : 'spark')}</span>
      <h1>${h(t(title))}</h1>
      <div class="score-badge"><bdi>${fmt(score)} / ${fmt(total)}</bdi> ${h(t(isMatch ? 'matchScore' : 'score'))}</div>
      <p>${h(detail)}</p>
      ${kind === 'check' ? '' : levelUpNotice()}
      <div class="result-actions">${buttons}</div>
    </section>
  </div>`;
}


function renderFlashcard() {
  const entry = run.queue[run.index];
  main.innerHTML = `<div class="work-area">
    ${backButton('backVocabulary', 'go-vocabulary')}
    ${heading(t('vocabulary'), t('review'), t('reviewLead'))}
    <section class="panel flashcard">
      ${sessionProgress(run.index + 1, run.queue.length, 'review')}
      <div class="flashcard-face">
        <h2 id="flashcard-focus" tabindex="-1">${phraseMarkup(entry, state.target)}</h2>
        ${listenButton(entry, state.target)}
        <div id="card-meaning" class="card-meaning" aria-live="polite"></div>
      </div>
      <div class="result-actions">
        ${button('reveal', 'reveal')}
        <div class="rating-actions" hidden>
          ${button('again', 'rate-again', { style: 'secondary' })}
          ${button('known', 'rate-known', { symbol: 'check' })}
        </div>
      </div>
    </section>
  </div>`;
}

function revealFlashcard() {
  if (page !== 'flashcards' || run.revealed) return;
  run.revealed = true;
  main.querySelector('#card-meaning').innerHTML = phraseMarkup(run.queue[run.index], state.base, false);
  main.querySelector('[data-action="reveal"]').hidden = true;
  const ratings = main.querySelector('.rating-actions');
  ratings.hidden = false;
  ratings.querySelector('button').focus();
}

function rateFlashcard(known) {
  if (page !== 'flashcards' || !run.revealed) return;
  const current = course();
  const id = run.queue[run.index].id;
  const now = Date.now();
  recordJourney(current, [{ id, correct: known }], 'review', now);
  saveReview(current, id, known, now);
  run.revealed = false;
  run.index++;
  const finished = run.index === run.queue.length;
  if (finished) finishActivity(current, now);
  persist();
  if (finished) {
    go('review-result', run);
  } else {
    renderFlashcard();
    main.querySelector('#flashcard-focus').focus();
  }
}

function renderReviewResult() {
  main.innerHTML = `<div class="work-area">
    <section class="panel result-panel">
      <span class="result-icon tone-mint">${icon('check')}</span>
      <h1>${h(t('reviewDone'))}</h1>
      <div class="score-badge">${fmt(run.index)} ${h(t('cardsReviewed'))}</div>
      <p>${h(t('reviewDoneLead'))}</p>
      ${levelUpNotice()}
      <div class="result-actions">${run.quick ? button('backVocabulary', 'go-vocabulary', { style: 'secondary' })
        + button('continueLearning', 'continue-learning', { symbol: 'arrow' })
        : button('backVocabulary', 'go-vocabulary', { symbol: 'arrow' })}</div>
    </section>
  </div>`;
}


function renderMatch() {
  const { group, targetCards, baseCards } = run;
  function column(code, side, cards) {
    return `<section class="match-column">
      <h2>${mark(code)}${languageName(code)}</h2>
      ${cards.map(entry => `<button type="button" class="match-card" data-action="choose-match" data-id="${entry.id}"
        data-side="${side}" aria-pressed="false"><span>${phraseMarkup(entry, code, false)}</span><span class="match-mark" aria-hidden="true"></span></button>`).join('')}
    </section>`;
  }
  main.innerHTML = `<div class="work-area">
    ${backButton('backPractice', 'go-practice')}
    ${heading(group.title[state.base], t('mode-match'), t('mode-match-lead'))}
    <section class="panel">
      <div class="match-grid">${column(state.target, 'target', targetCards)}${column(state.base, 'base', baseCards)}</div>
      <div class="match-footer">
        <div><div id="match-progress" class="match-progress"><bdi>${fmt(0)} / ${fmt(run.total)}</bdi> ${h(t('matchCount'))}</div>
          <div id="match-feedback" class="answer-feedback" role="status" aria-atomic="true"></div></div>
        <div id="match-result" hidden>${button('results', 'match-result', { symbol: 'arrow' })}</div>
      </div>
    </section>
  </div>`;
}

function chooseMatch(control) {
  const { id, side } = control.dataset;
  if (run.matched.has(id)) return;
  const previous = run.selected;
  const same = previous?.id === id && previous.side === side;
  const paired = previous && previous.side !== side;
  run.selected = same || paired ? null : { id, side };
  run.mismatch = null;
  let message = '';
  if (paired) {
    if (previous.id === id) {
      run.matched.add(id);
      message = 'matchFound';
    } else {
      run.mismatch = { [previous.side]: previous.id, [side]: id };
      run.missed.add(id);
      run.missed.add(previous.id);
      message = 'matchMiss';
    }
  }
  main.querySelectorAll('.match-card').forEach(card => {
    const cardId = card.dataset.id;
    const cardSide = card.dataset.side;
    const selected = run.selected?.id === cardId && run.selected.side === cardSide;
    const matched = run.matched.has(cardId);
    card.setAttribute('aria-pressed', String(selected));
    card.classList.toggle('match-wrong', run.mismatch?.[cardSide] === cardId);
    if (matched && card.getAttribute('aria-disabled') !== 'true') {
      card.setAttribute('aria-disabled', 'true');
      card.tabIndex = -1;
      card.querySelector('.match-mark').innerHTML = icon('check');
    }
  });
  main.querySelector('#match-progress bdi').textContent = fmt(run.matched.size) + ' / ' + fmt(run.total);
  const feedback = main.querySelector('#match-feedback');
  feedback.textContent = message ? t(message) : '';
  feedback.className = 'answer-feedback ' + (message === 'matchMiss' ? 'incorrect' : 'correct');
  if (run.matched.size === run.total) {
    const answers = run.targetCards.map(entry => ({ id: entry.id, correct: !run.missed.has(entry.id), skill: 'recognition' }));
    const current = course();
    const now = Date.now();
    recordJourney(current, answers, 'practice', now);
    run.score = recordPractice(current, answers, now);
    current.practiceBest.match = Math.max(current.practiceBest.match ?? 0, run.score);
    finishActivity(current, now);
    persist();
    const result = main.querySelector('#match-result');
    result.hidden = false;
    result.querySelector('button').focus({ preventScroll: true });
  }
}

function lexiconGroups() {
  const level = accessibleLevel(course());
  return vocabTab === 'words' ? wordGroups.filter(group => group.level <= level).map(group => ({ ...group, entries: group.words }))
    : orderedUnits.filter(unit => unit.level <= level).map(unit => ({ ...unit, entries: unit.phrases }));
}

function reviewButton(entry, added) {
  const key = added ? 'addedReview' : 'addReview';
  const label = t(key) + ' · ' + entry.text[state.target];
  return `<button type="button" class="icon-button save-card" data-action="add-review" data-id="${entry.id}"
    ${added ? 'aria-disabled="true"' : ''} title="${h(t(key))}" aria-label="${h(label)}">${icon(added ? 'check' : 'plus')}</button>`;
}

const lexiconStatuses = ['due', 'saved', 'new', 'queued', 'practiced', 'recalled'];

function vocabularyReviewContent(summary) {
  const { ready, saved } = summary;
  const title = t(!ready && saved ? 'vocabularyReviewCaughtUp' : 'vocabularyReviewTitle');
  const description = ready ? t('vocabularyReviewDue').replace('{n}', fmt(ready))
    : t(saved ? 'vocabularyReviewLater' : 'vocabularyReviewEmpty');
  return `<div class="vocabulary-review-copy">
      <span class="tile-icon tone-mint">${icon(ready ? 'review' : saved ? 'check' : 'vocabulary')}</span>
      <div><h2 id="vocabulary-review-title">${h(title)}</h2><p>${h(description)}</p></div>
    </div>
    ${ready ? button('startReview', 'start-review', { symbol: 'arrow' })
      : saved ? button('practiceSeen', 'practice-seen', { symbol: 'arrow' })
        : button('browseVocabulary', 'focus-lexicon', { style: 'secondary', symbol: 'arrow' })}`;
}

function updateVocabularyReview() {
  const summary = vocabularyReviewSummary(course());
  document.querySelectorAll('.nav-vocabulary').forEach(control => {
    const count = control.querySelector('.nav-review-count');
    if (count) { count.hidden = !summary.ready; count.textContent = fmt(summary.ready); }
    const label = t('vocabulary') + (summary.ready ? ' · ' + t('cardsDue').replace('{n}', fmt(summary.ready)) : '');
    control.setAttribute('aria-label', label);
  });
  const banner = main.querySelector('#vocabulary-review');
  if (banner) banner.innerHTML = vocabularyReviewContent(summary);
  const history = main.querySelector('#vocabulary-history');
  if (history) history.textContent = vocabularyHistory(course());
}

function vocabularyHistory(current) {
  const stats = reviewStats(current, (vocabTab === 'words' ? words : phrases).filter(entry => entry.level <= accessibleLevel(current)));
  return t('vocabHistory').replace('{saved}', fmt(stats.saved))
    .replace('{practiced}', fmt(stats.practiced)).replace('{recalled}', fmt(stats.recalled));
}

function lexiconCard(entry, group, status, due) {
  return `<article class="panel lexicon-card">
    <div class="lexicon-card-top">
      <div class="phrase-pair">
        <strong class="lexicon-target">${phraseMarkup(entry, state.target)}</strong>
        <div class="base-text">${phraseMarkup(entry, state.base, false)}</div>
      </div>
      <div class="phrase-actions">${listenButton(entry, state.target)}${reviewButton(entry, status !== 'new')}</div>
    </div>
    <div class="lexicon-card-footer">
      <span class="lexicon-topic">${h(group.title[state.base])}</span>
      <span class="lexicon-state is-${due ? 'due' : status}">${h(t('lexicon-' + (due ? 'due' : status)))}</span>
    </div>
  </article>`;
}

function renderLexiconResults() {
  const query = main.querySelector('#lexicon-search').value;
  const topic = main.querySelector('#lexicon-topic').value;
  const filter = main.querySelector('#lexicon-state').value;
  lexiconFilters[vocabTab] = { query, topic, filter };
  const cards = vocabularyEntries(lexiconGroups(), course(), { query, topic, filter, base: state.base, target: state.target })
    .map(({ entry, group, status, due }) => lexiconCard(entry, group, status, due));
  const total = lexiconGroups().reduce((n, group) => n + group.entries.length, 0);
  main.querySelector('#lexicon-count').textContent = t('vocabCount').replace('{shown}', fmt(cards.length)).replace('{total}', fmt(total));
  main.querySelector('#lexicon-results').innerHTML = cards.join('')
    || '<p class="empty">' + h(t(vocabTab === 'words' ? 'noWords' : 'noPhrases')) + '</p>';
}

function renderVocabulary() {
  const label = t(vocabTab === 'words' ? 'searchWords' : 'search');
  const filters = lexiconFilters[vocabTab];
  main.innerHTML = `
    ${heading(t('vocabEyebrow'), t('vocabulary'), t('vocabularyLead'))}
    <section class="vocabulary-review" id="vocabulary-review" aria-labelledby="vocabulary-review-title">
      ${vocabularyReviewContent(vocabularyReviewSummary(course()))}
    </section>
    <section class="lexicon" aria-label="${h(t('vocabulary'))}">
      <div class="vocab-tabs" role="group" aria-label="${h(t('vocabulary'))}">
        ${['words', 'phrases'].map(tab => `<button class="vocab-tab" type="button" data-action="vocab-tab" data-id="${tab}"
          aria-pressed="${tab === vocabTab}">${h(t(tab === 'words' ? 'wordsTab' : 'phrasebook'))}</button>`).join('')}
      </div>
      <div class="phrase-filters">
        <label class="search-field">${icon('search')}
          <input id="lexicon-search" type="search" dir="auto" value="${h(filters.query)}" placeholder="${h(label)}" aria-label="${h(label)}">
        </label>
        <select id="lexicon-topic" aria-label="${h(t('topic'))}">
          <option value="">${h(t('all'))}</option>
          ${lexiconGroups().map(group => '<option value="' + group.id + '"' + (filters.topic === group.id ? ' selected' : '') + '>' + h(group.title[state.base]) + '</option>').join('')}
        </select>
        <select id="lexicon-state" aria-label="${h(t('vocabStatus'))}">
          <option value="">${h(t('vocabAllStatuses'))}</option>
          ${lexiconStatuses.map(status => '<option value="' + status + '"' + (filters.filter === status ? ' selected' : '') + '>' + h(t('lexicon-' + status)) + '</option>').join('')}
        </select>
      </div>
      ${usageNotes()}
      <div class="lexicon-summary"><p id="vocabulary-history">${h(vocabularyHistory(course()))}</p>
        <p id="lexicon-count" role="status"></p></div>
      <div class="lexicon-grid" id="lexicon-results"></div>
    </section>`;
  renderLexiconResults();
}

function saveLexiconEntry(control) {
  const entry = reviewable.find(item => item.id === control.dataset.id);
  const current = course();
  if (!entry || current.cards[entry.id]) return;
  recordPractice(current, [{ id: entry.id, correct: false }]);
  persist();
  const filter = main.querySelector('#lexicon-state');
  if (filter.value) {
    renderLexiconResults();
    filter.focus({ preventScroll: true });
  } else {
    control.setAttribute('aria-disabled', 'true');
    control.setAttribute('aria-label', t('addedReview') + ' · ' + entry.text[state.target]);
    control.title = t('addedReview');
    control.innerHTML = icon('check');
    const badge = control.closest('.lexicon-card').querySelector('.lexicon-state');
    badge.className = 'lexicon-state is-due';
    badge.textContent = t('lexicon-due');
  }
  showToast(t('addedReview'));
}

function accountPanelState() {
  const user = authClient?.user;
  const available = authClient?.isMiniApp ? authClient.config.miniAppEnabled : authClient?.config.webEnabled;
  return [user?.telegramId ?? '', user && sync?.status === 'signin', signOutWarning, authIssue, Boolean(available)].join('|');
}

function accountPanel() {
  const user = authClient?.user;
  const mini = authClient?.isMiniApp;
  const available = mini ? authClient.config.miniAppEnabled : authClient?.config.webEnabled;
  // A session that expired or was revoked while this account is open can be renewed in place.
  const expired = Boolean(user) && sync?.status === 'signin';
  const signIn = enabled => `<button class="button telegram-button" data-action="sign-in" ${enabled ? '' : 'disabled'}>
    ${icon('plane')}${h(t('telegramSignIn'))}</button>`;
  return `<section class="panel account-panel" aria-labelledby="account-title" data-account-state="${h(accountPanelState())}">
    <div class="account-heading"><span class="tile-icon tone-mint">${icon('plane')}</span>
      <div><h2 id="account-title">${h(t('account'))}</h2>
        <p>${h(t(user ? 'signedInTelegram' : 'signInLead'))}</p></div></div>
    ${user ? `<div class="account-person"><strong><bdi>${h(user.name)}</bdi></strong>
      ${user.username ? '<span dir="ltr">@' + h(user.username) + '</span>' : ''}</div>
      ${expired ? `<p role="status">${h(t(mini ? 'miniSignInFailed' : 'cloud-signin'))}</p>${signIn(true)}` : ''}
      ${signOutWarning ? `<div class="sign-out-warning" role="alert"><p>${h(t('signOutUnsaved'))}</p><div class="cloud-actions">
        <button class="button secondary" data-action="download-progress">${h(t('downloadProgress'))}</button>
        <button class="button secondary" data-action="sign-out-anyway">${h(t('signOutAnyway'))}</button>
        <button class="button secondary" data-action="cancel-sign-out">${h(t('stayLoggedIn'))}</button>
      </div></div>` : `<button class="button secondary" data-action="sign-out">${h(t('signOut'))}</button>`}` : `
      ${authIssue ? '<p role="status">' + h(t(mini ? 'miniSignInFailed' : 'signInFailed')) + '</p>' : ''}
      ${signIn(available || mini)}
      ${!available && !mini ? '<p>' + h(t('signInUnavailable')) + '</p>' : ''}`}
  </section>`;
}

function cloudSettings() {
  const status = cloudStatus();
  return `<div class="panel sync-notices" data-sync-notices ${status || pendingGuestState || sync?.conflict ? '' : 'hidden'}>
    <p class="cloud-status" data-cloud-status role="status" ${status ? '' : 'hidden'}>${h(status)}</p>
    ${pendingGuestState ? `<div class="guest-progress"><p>${h(t('guestProgress'))}</p><div class="cloud-actions">
      <button class="button secondary" data-action="use-guest">${h(t('useGuest'))}</button>
      <button class="button secondary" data-action="keep-account">${h(t('keepAccount'))}</button>
      <button class="button secondary" data-action="download-guest">${h(t('downloadGuest'))}</button>
    </div></div>` : ''}
    <div class="cloud-actions" data-cloud-conflict ${sync?.conflict ? '' : 'hidden'}>
      <button class="button secondary" data-cloud-action data-action="use-cloud">${h(t('useCloud'))}</button>
      <button class="button secondary" data-cloud-action data-action="use-local">${h(t('useLocal'))}</button>
    </div>
  </div>
  <details class="panel advanced-settings">
    <summary>${h(t('advancedSettings'))}</summary>
    <div class="cloud-actions">
      <button class="button secondary" data-action="download-progress">${h(t('downloadProgress'))}</button>
      <label class="button secondary cloud-import">${h(t('importProgress'))}
        <input id="import-progress" type="file" accept=".json,application/json">
      </label>
    </div>
  </details>`;
}

function renderSettings() {
  main.innerHTML = `${heading(t('settingsEyebrow'), t('settings'), t('settingsLead'))}
  <div class="work-area">
    <section class="panel settings-panel">
      <div class="setting">
        <div><h2>${h(t('course'))}</h2><p>${h(t('pairInfo'))}</p></div>
        ${pairButton('changePair')}
      </div>
      <div class="setting">
        <div><h2>${h(t('check'))}</h2><p>${h(t('checkLead'))}</p></div>
        ${button('startCheck', 'start-check', { style: 'secondary', symbol: 'arrow' })}
      </div>
      ${[state.base, state.target].includes('ar') ? `<div class="setting">
        <div><label for="transliterate">${h(t('scriptHelp'))}</label><p>${h(t('scriptLead'))}</p></div>
        <input id="transliterate" type="checkbox" ${state.transliterate ? 'checked' : ''}>
      </div>` : ''}
    </section>
    ${accountPanel()}
    ${cloudSettings()}
  </div>`;
  updateCloudUI();
}


const views = {
  home: renderHome,
  path: renderPath,
  study: renderStudy,
  quiz: renderQuiz,
  result: renderResult,
  flashcards: renderFlashcard,
  'review-result': renderReviewResult,
  practice: renderPractice,
  skill: renderSkillSession,
  stories: renderStories,
  reading: renderReading,
  vocabulary: renderVocabulary,
  progress: renderProgress,
  match: renderMatch,
  settings: renderSettings
};

function updateActivityClock() {
  const clock = run?.clock;
  if (!clock) return;
  const now = performance.now();
  // Limit idle time between interactions and pause while the page is hidden.
  if (clock.since !== null) clock.seconds += Math.min((now - clock.since) / 1000, 90);
  clock.since = document.hidden || dialog.open ? null : now;
}

function finishActivity(current, now, outcome = {}) {
  if (!run.clock) return;
  updateActivityClock();
  recordActivity(current, { ...outcome, seconds: Math.round(run.clock.seconds) }, now);
  run.clock = null;
  document.querySelector('.topbar-stats').innerHTML = topbarStats(activitySummary(current, now));
}

function go(destination, exercise = null) {
  stopSkillRecording();
  if (destination === 'review') destination = 'vocabulary';
  // The account changed in another tab during an exercise; reload once the learner leaves it.
  if (reloadAfterExercise && !exercise) { window.location.reload(); return; }
  updateActivityClock();
  page = destination;
  run = exercise;
  if (run) {
    run.startLevel ??= journeyFor(course()).level;
    if (timedPages.has(page)) {
      run.clock ??= { seconds: 0, since: document.hidden ? null : performance.now() };
    }
  }
  const progress = activitySummary(course());
  window.speechSynthesis?.cancel();
  disconnectLessonPaths();
  renderShell(progress);
  views[page](progress);
  disconnectLessonPaths = connectLessonPaths(main);
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

function startStudy(id, fromPath = false) {
  const unit = units.find(candidate => candidate.id === id);
  if (unit && lessonUnlocked(course(), unit)) go('study', { unit, fromPath });
}

function startQuiz(kind) {
  const unit = kind === 'lesson' ? run.unit : null;
  const { base, target } = state;
  if (unit && !lessonUnlocked(course(), unit)) return;
  const questions = unit ? lessonQuestions(unit, base, target) : placementQuestions(base, target);
  go('quiz', { kind, unit, fromPath: run?.fromPath, clock: run?.clock, questions, index: 0, answers: [] });
}


function startMode(mode) {
  if (!modes[mode]) return;
  if (mode === 'match') {
    const round = matchRound(course());
    go('match', { ...round, kind: 'practice', mode, total: round.baseCards.length, matched: new Set(), missed: new Set() });
    return;
  }
  const questions = practiceQuestions(mode, course(), state.base, state.target);
  go('quiz', { kind: 'practice', mode, questions, index: 0, answers: [] });
}

function startCheckpoint(level) {
  if (!Number.isInteger(level) || !checkpointUnlocked(course(), level)) return;
  const questions = checkpointQuestions(level, state.base, state.target);
  go('quiz', { kind: 'checkpoint', level, questions, index: 0, answers: [] });
}

function openStory(id) {
  const story = stories.find(item => item.id === id);
  if (story && story.level <= accessibleLevel(course())) go('reading', { story });
}

function startReadingQuiz() {
  const { story, guided, clock } = run;
  if (story.level > accessibleLevel(course())) return;
  go('quiz', { kind: 'reading', story, guided, clock, questions: readingQuestions(story, state.base), index: 0, answers: [] });
}



function continueLearning() {
  const next = nextActivity(course());
  if (next.type === 'lesson') startStudy(next.unit.id);
  else if (next.type === 'checkpoint') startCheckpoint(next.level);
  else if (next.type === 'review') openReviewRound(next.queue, true);
  else if (next.type === 'story') go('reading', { story: next.story, guided: true });
  else go('quiz', {
    kind: 'mixed',
    questions: mixedQuestions(course(), state.base, state.target),
    index: 0,
    answers: []
  });
}

function openReviewRound(queue, quick = false) {
  if (queue.length) go('flashcards', { queue, quick, index: 0, revealed: false });
}


function startFlashcards(all) {
  openReviewRound(reviewQueue(course(), all));
}

function optionsFor(selected, excluded) {
  return codes.filter(code => code !== excluded).map(code => `
    <option value="${code}" lang="${code}" ${code === selected ? 'selected' : ''}>${h(languages[code].name)}</option>`).join('');
}

function refreshPairFields() {
  dialog.querySelector('#pair-base').value = draft.base;
  dialog.querySelector('#pair-target').innerHTML = optionsFor(draft.target, draft.base);
  dialog.querySelector('#pair-preview').innerHTML = pairNames(draft.base, draft.target);
}

function openPair() {
  draft = { base: state.base, target: state.target };
  dialog.setAttribute('aria-labelledby', 'pair-title');
  dialog.setAttribute('aria-describedby', 'pair-info');
  dialog.innerHTML = `<form class="pair-form">
    <div class="dialog-head"><span class="tile-icon tone-lilac">${icon('swap')}</span>
      <span class="eyebrow">${h(t('pairCount'))}</span></div>
    <h2 id="pair-title">${h(t('choosePair'))}</h2>
    <p id="pair-info">${h(t('pairInfo'))}</p>
    <div class="pair-fields">
      <label for="pair-base">${h(t('base'))}</label>
      <select id="pair-base" autofocus>${optionsFor(draft.base)}</select>
      <label for="pair-target">${h(t('target'))}</label>
      <select id="pair-target">${optionsFor(draft.target, draft.base)}</select>
    </div>
    <div class="pair-preview-row">
      <span id="pair-preview">${pairNames(draft.base, draft.target)}</span>
      <button class="text-button" type="button" data-action="swap">${icon('swap')}${h(t('swap'))}</button>
    </div>
    <div class="dialog-actions">
      ${button('cancel', 'cancel-pair', { style: 'secondary' })}
      <button class="button primary" type="submit">${h(t('apply'))}${icon('arrow', 'directional')}</button>
    </div>
  </form>`;
  dialog.showModal();
  updateActivityClock();
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.hidden = false;
  toast.textContent = message;
  toastTimer = setTimeout(() => {
    toast.hidden = true;
    toast.textContent = '';
  }, 3500);
}

async function cloudAction(work) {
  if (cloudActionBusy) return;
  cloudActionBusy = true;
  updateCloudUI();
  try { await work(); }
  catch { showToast(t('cloudActionFailed')); }
  finally { cloudActionBusy = false; updateCloudUI(); }
}

function downloadProgress(value = state) {
  const blob = new Blob([JSON.stringify(validateState(value), null, 2) + '\n'], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'aytim-progress-' + new Date().toISOString().slice(0, 10) + '.json';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function speak(id, code, onUnavailable, onPlayed) {
  const phrase = audioEntries.get(id);
  if (!phrase || !languages[code]) return;
  const engine = window.speechSynthesis;
  const unavailable = () => {
    showToast(t('noVoice'));
    onUnavailable?.();
  };
  if (!engine || !window.SpeechSynthesisUtterance) {
    unavailable();
    return;
  }
  const voices = engine.getVoices();
  const locale = languages[code].locale.toLowerCase();
  const voice = voices.find(candidate => candidate.lang.toLowerCase() === locale)
    ?? voices.find(candidate => candidate.lang.toLowerCase().split(/[-_]/)[0] === code);
  if (!voice) {
    unavailable();
    return;
  }
  engine.cancel();
  const utterance = new SpeechSynthesisUtterance(phrase.text[code]);
  utterance.lang = voice.lang;
  utterance.voice = voice;
  utterance.rate = 0.9;
  utterance.addEventListener('error', event => {
    if (event.error !== 'interrupted' && event.error !== 'canceled') unavailable();
  });
  if (onPlayed) utterance.addEventListener('end', onPlayed, { once: true });
  engine.speak(utterance);
}

const actions = {
  nav: button => go(button.dataset.id),
  'use-cloud': () => sync.useCloud(),
  'use-local': () => cloudAction(() => sync.useLocal()),
  'download-progress': () => downloadProgress(),
  'sign-in': () => accountAction(async () => {
    if (sync?.busy) await sync.busy;
    await sync?.flush();
    if (authClient.isMiniApp) {
      await bootstrapAccount(await authClient.load());
      broadcastAccountChange();
    } else window.location.assign('/api/auth/telegram/start');
  }),
  'sign-out': () => accountAction(async () => {
    if (sync?.busy) await sync.busy;
    await sync?.flush();
    // Edits that cannot sync (offline, expired session, an oversized save) need an explicit choice, not a dead end.
    if (sync?.dirty || sync?.conflict) { signOutWarning = true; go('settings'); return; }
    await signOut();
  }),
  'sign-out-anyway': () => accountAction(signOut),
  'cancel-sign-out': () => { signOutWarning = false; go('settings'); },
  'use-guest': () => cloudAction(async () => {
    if (!pendingGuestState) return;
    state = pendingGuestState;
    clearGuestCandidate();
    persist();
    if (sync?.busy) await sync.busy;
    if (sync?.conflict) await sync.useLocal();
    else await sync?.flush();
    go('settings');
  }),
  'keep-account': () => { clearGuestCandidate(); go('settings'); },
  'download-guest': () => { if (pendingGuestState) downloadProgress(pendingGuestState); },

  'go-practice': () => go('practice'),
  'go-stories': () => go('stories'),
  'practice-mode': control => startMode(control.dataset.id),
  'start-skill': control => startSkill(control.dataset.id, false),
  'start-skill-test': control => startSkill(control.dataset.id, true),
  'skill-listen': playSkillAudio,
  'skill-reveal': revealSkillReference,
  'skill-next': nextSkillTask,
  'skill-spoke': confirmSkillSpeaking,
  'skill-record-start': beginSkillRecording,
  'skill-record-stop': endSkillRecording,
  'open-story': control => openStory(control.dataset.id),
  'toggle-translations': toggleTranslations,
  'start-reading-quiz': startReadingQuiz,
  'listen-quiz': () => {
    const exercise = run;
    const { entry, from } = run.questions[run.index];
    const index = run.index;
    speak(entry.id, from, () => {
      if (page === 'quiz' && run === exercise && run.index === index) revealTranscript();
    }, () => {
      if (page === 'quiz' && run === exercise && run.index === index) run.heardIndex = index;
    });
  },
  'show-transcript': revealTranscript,
  'hide-model': hideOrderModel,
  'add-token': control => moveOrderToken(control.dataset.id, true),
  'remove-token': control => moveOrderToken(control.dataset.id, false),
  'clear-order': () => {
    run.placed = [];
    orderBoard();
    main.querySelector('#order-tray button').focus({ preventScroll: true });
  },
  'check-order': checkOrder,
  'choose-match': chooseMatch,
  'match-result': () => go('result', run),
  'vocab-tab': control => {
    if (vocabTab === control.dataset.id) return;
    vocabTab = control.dataset.id;
    renderVocabulary();
    main.querySelector('.vocab-tab[aria-pressed="true"]').focus({ preventScroll: true });
  },
  'add-review': saveLexiconEntry,

  pair: openPair,
  swap: () => {
    [draft.base, draft.target] = [draft.target, draft.base];
    refreshPairFields();
  },
  'cancel-pair': () => dialog.close(),
  study: button => startStudy(button.dataset.id, page === 'path' || run?.fromPath),
  'go-home': () => go('home'),
  'go-path': () => go('path'),
  'go-progress': () => go('progress'),
  'home-review': () => openReviewRound(reviewQueue(course()).slice(0, 4), true),
  'next-bridge': () => {
    bridgeIndex = (bridgeIndex + 1) % bridgeEntries.length;
    main.querySelector('#bridge-words').innerHTML = bridgeWords();
  },
  'continue-learning': continueLearning,
  'go-review': () => go('vocabulary'),
  'go-vocabulary': () => go('vocabulary'),
  'focus-lexicon': () => main.querySelector('#lexicon-search').focus(),
  'start-practice': () => startQuiz('lesson'),
  'start-check': () => startQuiz('check'),
  'skip-placement': () => { course().placementDone = true; persist(); go('home'); },
  'start-checkpoint': control => startCheckpoint(Number(control.dataset.id)),
  answer: button => answerQuestion(button.dataset.id),
  'advance-quiz': advanceQuiz,
  'start-review': () => startFlashcards(false),
  'practice-seen': () => startFlashcards(true),
  reveal: revealFlashcard,
  'rate-again': () => rateFlashcard(false),
  'rate-known': () => rateFlashcard(true),
  speak: button => speak(button.dataset.id, button.dataset.lang)
};

document.addEventListener('click', event => {
  if (accountTransition) return;
  document.querySelectorAll('.mobile-menu[open], .course-level[open]').forEach(details => {
    if (!details.contains(event.target)) details.open = false;
  });
  const button = event.target.closest('button[data-action]');
  if (button) {
    updateActivityClock();
    actions[button.dataset.action]?.(button);
  }
});

main.addEventListener('submit', event => {
  if (accountTransition) { event.preventDefault(); return; }
  if (event.target.id === 'skill-answer-form') { event.preventDefault(); submitSkillAnswer(event); return; }
  if (event.target.id !== 'spelling-form') return;
  event.preventDefault();
  checkSpelling(event);
});

dialog.addEventListener('submit', event => {
  event.preventDefault();
  if (!draft || !validPair(draft.base, draft.target)) return;
  const { base, target } = draft;
  dialog.close();
  if (state.base === base && state.target === target) return;
  state.base = base;
  state.target = target;
  bridgeIndex = 0;
  persist();
  go(page === 'progress' ? 'progress' : 'home');
});

dialog.addEventListener('close', () => {
  if (!dialog.open) {
    draft = null;
    updateActivityClock();
  }
});

document.addEventListener('change', async event => {
  if (accountTransition) return;
  const { id, value, checked } = event.target;
  if (id === 'pair-base') {
    if (value === draft.target) draft.target = draft.base;
    draft.base = value;
    refreshPairFields();
  } else if (id === 'pair-target') {
    draft.target = value;
    refreshPairFields();
  } else if (id === 'lexicon-topic' || id === 'lexicon-state') {
    renderLexiconResults();
  } else if (id === 'transliterate') {
    state.transliterate = checked;
    persist();
  } else if (id === 'import-progress') {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      if (file.size > maxSaveBytes) throw new Error('Save is too large');
      state = validateState(JSON.parse(await file.text()));
      persist();
      go('settings');
    } catch { showToast(t('importFailed')); }
  }
});

document.addEventListener('input', event => {
  if (event.target.id === 'lexicon-search') renderLexiconResults();
  else if (event.target.form?.id === 'spelling-form') updateActivityClock();
});

document.addEventListener('visibilitychange', () => {
  updateActivityClock();
  if (!document.hidden) {
    updateVocabularyReview();
    if (page === 'vocabulary') renderLexiconResults();
  }
});

async function accountAction(work) {
  if (cloudActionBusy || accountStarting) return;
  await cloudAction(async () => {
    accountTransition = true;
    try { await work(); }
    finally { accountTransition = false; }
  });
}

async function signOut() {
  const keys = accountKeys(authClient.user);
  await authClient.logout();
  try { for (const key of Object.values(keys)) browserStorage.removeItem(key); }
  catch { storageAvailable = false; }
  await bootstrapAccount({ user: null });
  broadcastAccountChange();
}

const accountChangedKey = 'aytim.account.changed';

function broadcastAccountChange() {
  try { browserStorage.setItem(accountChangedKey, JSON.stringify({ account: authClient.user?.telegramId ?? null, id: crypto.randomUUID() })); }
  catch { /* Storage can be blocked. */ }
}

function clearGuestCandidate() {
  pendingGuestState = null;
  try {
    browserStorage.removeItem(guestKeys.progress);
    browserStorage.removeItem(guestKeys.metadata);
    if (authClient.user) browserStorage.removeItem(accountKeys(authClient.user).importFrom);
  } catch { /* Local storage is optional. */ }
}

// Shows an account's local copy without waiting for the network.
function openAccount(data) {
  const saved = loadAccountProgress(browserStorage, data);
  state = saved.state;
  storageKey = saved.keys.progress;
  storageAvailable = saved.storageAvailable;
  pendingGuestState = saved.guestState;
  signOutWarning = false;
  unsyncedEdits = false;
  go(page === 'settings' ? 'settings' : 'home');
  return saved;
}

function startSync(user, saved) {
  // A Mini App without a verified or remembered account must not create a guest profile.
  if (authClient.isMiniApp && authIssue && !user) return;
  sync = new CloudSync({
    storage: browserStorage, metadataKey: saved.keys.metadata, accountId: user?.telegramId ?? null,
    getState: () => state, applyState: applyCloudState,
    canApply: () => !run && !dialog.open,
    onStatus: updateCloudUI, hasLocal: saved.hasLocal || unsyncedEdits,
    fetcher: (input, options) => authClient.fetch(input, options)
  });
  unsyncedEdits = false;
  sync.connect();
}

async function bootstrapAccount(data, failed = false) {
  sync?.stop();
  if (sync?.busy) await sync.busy;
  sync = undefined;
  authIssue = failed;
  if (!failed) rememberAccount(browserStorage, data.user);
  startSync(data.user, openAccount(data));
}

// Only Telegram clients need the SDK, so other browsers never wait for telegram.org to start the app.
async function telegramWebApp() {
  if (!insideTelegram(window)) return undefined;
  if (!window.Telegram?.WebApp) {
    await new Promise(resolve => {
      const script = document.createElement('script');
      script.src = 'https://telegram.org/js/telegram-web-app.js?64';
      script.addEventListener('load', resolve);
      script.addEventListener('error', resolve);
      setTimeout(resolve, 4000);
      document.head.append(script);
    });
  }
  return window.Telegram?.WebApp;
}

const tabStorage = {
  getItem: key => sessionStorage.getItem(key), setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: key => sessionStorage.removeItem(key)
};
// Render the last verified account's local copy (or the guest copy) at once. The sign-in check below only
// decides how it syncs; a failed or unreachable check is not a sign-out.
authClient = new TelegramAuth({ storage: tabStorage, initData: miniAppData(window.location, undefined, window) });
authClient.user = rememberedAccount(browserStorage, authClient.isMiniApp ? launchUserId(authClient.initData) : undefined);
const shown = authClient.user;
let opened = openAccount({ user: shown });
const webApp = await telegramWebApp();
webApp?.ready();
const initData = miniAppData(window.location, webApp, window);
if (initData !== authClient.initData) {
  // The SDK can restore launch data that the URL no longer carries.
  authClient = new TelegramAuth({ storage: tabStorage, initData });
  authClient.user = shown;
}
try {
  const data = await authClient.load();
  rememberAccount(browserStorage, data.user);
  if ((data.user?.telegramId ?? null) !== (shown?.telegramId ?? null)) opened = openAccount(data);
  else {
    // Same account as the instant render: keep anything practiced meanwhile, but apply a verified guest claim.
    const saved = loadAccountProgress(browserStorage, data);
    if (saved.migrated) opened = openAccount(data);
    else {
      opened = saved;
      if (Boolean(saved.guestState) !== Boolean(pendingGuestState)) {
        pendingGuestState = saved.guestState;
        if (page === 'settings') go('settings');
      }
    }
  }
  startSync(data.user, opened);
} catch {
  // The sync names the shown account, so the Worker only accepts it while this browser's session still
  // belongs to that account.
  authIssue = true;
  startSync(shown, opened);
}
accountStarting = false;
updateCloudUI();
const login = new URL(window.location.href).searchParams.get('login');
if (login) {
  const clean = new URL(window.location.href);
  clean.searchParams.delete('login');
  history.replaceState(null, '', clean.pathname + clean.search + clean.hash);
  if (login === 'failed') showToast(t('signInFailed'));
  else broadcastAccountChange();
}
window.addEventListener('storage', event => {
  if (event.key !== accountChangedKey) return;
  let account;
  try { account = JSON.parse(event.newValue).account ?? null; } catch { account = undefined; }
  // Another tab re-verified this tab's own account: the shared session still fits.
  if (account !== undefined && account === (authClient.user?.telegramId ?? null)) return;
  if (!run) { window.location.reload(); return; }
  // Let the learner finish the current exercise, then reload. A guest result stays in the guest copy, which
  // the new account can still claim; a signed-in tab stops syncing and writing the account it no longer holds.
  reloadAfterExercise = true;
  sync?.stop();
  if (authClient.user) storageKey = null;
});
window.addEventListener('online', () => sync?.flush());
document.addEventListener('visibilitychange', () => { if (document.hidden) sync?.flush({ keepalive: true }); });
window.addEventListener('pagehide', () => sync?.flush({ keepalive: true }));
