import { codes, languages, phrase, phrases, units } from './content.mjs';
import { copy } from './copy.mjs';
import { pluralText } from './plurals.mjs';
import { CloudSync } from './cloud-sync.mjs';
import { TelegramAuth, insideTelegram, launchLanguage, launchUserId, miniAppData } from './auth.mjs';
import { accountKeys, guestKeys, loadAccountProgress, rememberAccount, rememberedAccount } from './account-data.mjs';
import { maxSaveBytes, validateState } from './progress-data.mjs';
import { activitySummary, goals, recordActivity, xpPerActivity, xpPerCorrectAnswer } from './home-progress.mjs';
import { wordGroups, words } from './words.mjs';
import { stories, storyLines, storyPassed } from './stories.mjs';
import { connectLessonPaths, stopPosition } from './lesson-path.mjs';
import { vocabularyEntries, vocabularyReviewSummary } from './vocabulary.mjs';
import { skillModes, createSkillRound, recordSkillRound, skillSnapshot } from './skill-lab.mjs';
import { buildLessonActivities, recoveryActivity, lessonScore, lessonPassingScore, lessonQuestionTotal, lessonQuestionProgress, lessonReferenceMatch } from './lesson-flow.mjs';
import { wordBankMatches, wordBankSelection } from './word-bank.mjs';
import { readingAidText } from './reading-aid.mjs';
import { alphabets, letterExample } from './alphabet.mjs';
import { languageNotes } from './language-notes.mjs';
import { applySpeakerForms } from './speaker-forms.mjs';
import {
  modes, practiceCardOrder, practiceQuestions, mixedQuestions, placementQuestions, checkpointQuestions, readingQuestions, matchRound, practiceSkill, replyQuestions
} from './practice.mjs';
import {
  path, orderedUnits, journeyFor, journeyStatus, recordJourney, applyPlacement, nextActivity, workingLevel,
  lessonUnlocked, checkpointUnlocked, accessibleLevel, levelComplete, checkpointPassMark, checkpointQuestionCount
} from './journey.mjs';
import {
  defaultPair, preferredPair, validPair, pairKey, newCourse, completed, lessonQuestions, seededRandom,
  saveLesson, recordPractice, reviewQueue, reviewStats, saveReview, dialogueReviewEntries
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
// Tab-scoped: a lesson in progress and a Telegram frame session belong to this tab alone.
const tabStorage = {
  getItem: key => sessionStorage.getItem(key), setItem: (key, value) => sessionStorage.setItem(key, value),
  removeItem: key => sessionStorage.removeItem(key)
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
let deleteWarning = false;
let reloadAfterExercise = false;
let unsyncedEdits = false;
let cloudActionBusy = false;
// A first visit opens in the visitor's own language: the one Telegram reports
// when Aytim runs as a Mini App, otherwise the browser's.
const startingPair = preferredPair([
  launchLanguage(miniAppData(window.location, undefined, window)),
  ...(navigator.languages ?? [navigator.language])
]);
let state = { ...startingPair, courses: {}, transliterate: true };

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
let lessonRecognition = null;
let lessonRecognitionToken = 0;
const navPages = ['home', 'path', 'practice', 'stories', 'vocabulary', 'progress', 'settings'];
const mobileMenuPages = ['vocabulary', 'progress', 'settings'];
const reviewable = [...phrases, ...words, ...dialogueReviewEntries];
const timedPages = new Set(['quiz', 'reading', 'flashcards', 'match', 'skill']);
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

// A counted label: the wording follows the number, which most of these
// languages require ("1 вопрос", "2 вопроса", "5 вопросов").
function tn(key, count) {
  return pluralText(state.base, copy[state.base][key], count).replace('{n}', fmt(count));
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
  const rule = t('homeXpRule').replace('{n}', fmt(xpPerActivity)).replace('{m}', fmt(xpPerCorrectAnswer));
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
  const testDone = best >= checkpointPassMark;
  const testLocked = !checkpointUnlocked(current, step.level);
  const testNext = highlightNext && !nextLesson && !testDone && !testLocked;
  const position = index => {
    const { row, column } = stopPosition(index);
    return `style="--stop-row:${row};--stop-column:${column}"`;
  };
  const testState = testDone ? t('complete') : testNext ? t('recommended') : '';
  const testLabel = [t('levelTest'), levelLabel(step.level), testState, tn('questionsLabel', checkpointQuestionCount), checkpointScore(step.level, current)].filter(Boolean).join(' · ');
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
          <small>${h(testDone ? t('complete') : tn('questionsLabel', checkpointQuestionCount) + (testLocked ? '' : ' · ' + t('takeLevelTestNow')))}</small>
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
  const sections = { activities: false, dailyGoal: true, languageBridge: false, weeklyWins: true };
  const showSidebar = sections.dailyGoal || sections.languageBridge || sections.weeklyWins;
  const heroHeading = showIntro ? 'h2' : 'h1';
  const current = course();
  const next = nextActivity(current, +progress.date);
  const { current: step } = journeyStatus(current);
  const due = reviewQueue(current, false, +progress.date).length;
  const topic = next.unit ?? next.story;
  const title = topic?.title[state.base] ?? t(next.type === 'checkpoint' ? 'levelTest' : next.type === 'review' ? 'quickReview' : 'mixedPractice');
  const description = topic?.description[state.base] ?? (next.type === 'checkpoint' ? levelTestLead() : t(next.type === 'review' ? 'dueLead' : 'mixedLead'));
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
  return best === undefined ? '' : t('best') + ' · ' + fmt(best) + ' / ' + fmt(checkpointQuestionCount);
}

function levelTestLead() {
  return t('levelTestLead').replace('{required}', fmt(checkpointPassMark));
}

// Word-bank questions appear in lessons and in level tests; both use the main button to check.
const quizBankTask = question => page === 'quiz' && ['lesson', 'checkpoint'].includes(run?.kind) &&
  ['write', 'dictation'].includes(question?.task);

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
        <p>${h(tn('skillPracticeCount', data.practice))}</p>
        <p>${h(tn('skillTestCount', data.attempts))}</p>
      </article>`;
    }).join('')}</div>
  </section>`;
}

function skillPracticeCard(current, skill) {
  const design = skillModes[skill];
  const level = accessibleLevel(current);
  const data = skillSnapshot(current, skill, level);
  return `<article class="activity-card activity-card-skill">
    <div class="activity-card-top">
      <span class="tile-icon tone-${design.tone}">${icon(design.icon)}</span>
      <span class="activity-tag">${h(tn('skillPracticeCount', data.practice))}</span>
    </div>
    <strong>${h(skillName(skill))}</strong>
    <span class="activity-description">${h(t('skill' + skill[0].toUpperCase() + skill.slice(1) + 'Lead'))}</span>
    <div class="activity-card-skill-actions">
      <button type="button" class="button primary" data-action="start-skill" data-id="${skill}">${h(t('skillPracticeAction'))}</button>
      <button type="button" class="button secondary" data-action="start-skill-test" data-id="${skill}">${h(t('skillTestAction'))}</button>
    </div>
  </article>`;
}

function renderPractice() {
  const current = course();
  const due = reviewQueue(current).length;
  const cards = practiceCardOrder.map(([kind, id]) => {
    if (kind === 'skill') return skillPracticeCard(current, id);
    if (kind === 'checkpoint') return activityCard({
      action: 'start-checkpoint', id: journeyFor(current).level, symbol: 'check', tone: 'sky',
      title: t('levelTest') + ' · ' + levelLabel(journeyFor(current).level),
      description: levelTestLead(), tag: tn('questionsLabel', checkpointQuestionCount),
      score: checkpointScore(journeyFor(current).level, current)
    });
    const design = modes[id];
    const best = current.practiceBest[id];
    return activityCard({
      action: 'practice-mode', id, symbol: design.icon, tone: design.tone,
      title: t('mode-' + id), description: t('mode-' + id + '-lead'),
      tag: id === 'match' ? tn('pairsLabel', 5) : tn('questionsLabel', 6),
      score: best === undefined ? '' : t('best') + ' · ' + fmt(best) + ' / ' + fmt(id === 'match' ? 5 : 6)
    });
  }).join('');
  main.innerHTML = `${heading(t('practiceEyebrow'), t('practiceTitle'), t(due ? 'practiceDue' : 'practiceLead'))}
    ${due ? `<div class="panel practice-due">
      <span class="tile-icon tone-mint">${icon('review')}</span>
      <strong>${h(t('cardsDue').replace('{n}', fmt(due)))}</strong>
      ${homeLink('quickReview', 'home-review')}
    </div>` : ''}
    <div class="activity-grid">${cards}</div>`;
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
function stopLessonRecognition() {
  lessonRecognitionToken++;
  const current = lessonRecognition;
  lessonRecognition = null;
  if (!current) return;
  current.onresult = null;
  current.onerror = null;
  current.onend = null;
  try { current.abort(); } catch { /* Recognition may have ended. */ }
}

function startLessonRecognition() {
  if (page !== 'quiz' || run?.kind !== 'lesson' ||
      run.questions?.[run.index]?.task !== 'speak' || run.answers[run.index]) return;
  const Constructor = window.SpeechRecognition ?? window.webkitSpeechRecognition;
  const status = main.querySelector('#lesson-speech-status');
  const control = main.querySelector('[data-action="lesson-speech-check"]');
  if (!Constructor) {
    if (status) status.textContent = t('lessonSpeechUnavailable');
    return;
  }
  stopLessonRecognition();
  const session = run;
  const index = run.index;
  const token = lessonRecognitionToken;
  let recognition;
  try { recognition = new Constructor(); }
  catch { if (status) status.textContent = t('lessonSpeechUnavailable'); return; }
  recognition.lang = languages[state.target].locale;
  recognition.continuous = false;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  lessonRecognition = recognition;
  session.speakingMatch = false;
  const active = () => page === 'quiz' && run === session && run.index === index &&
    lessonRecognition === recognition && lessonRecognitionToken === token &&
    !session.answers[index];
  const enable = () => { if (active() && control) control.disabled = false; };
  if (status) status.textContent = t('lessonSpeechListening');
  if (control) control.disabled = true;
  recognition.onresult = event => {
    if (!active()) return;
    const transcript = String(event.results?.[0]?.[0]?.transcript ?? '').trim();
    if (!transcript) {
      if (status) status.textContent = t('lessonSpeechError');
    } else {
      const matched = lessonReferenceMatch(transcript, session.questions[index].entry, state.target);
      session.speakingMatch = matched;
      if (status) status.innerHTML = '<strong>' + h(t(matched ? 'lessonSpeechMatch' : 'lessonSpeechMismatch')) +
        '</strong><div>' + h(t('lessonSpeechHeard')) + ': <bdi lang="' + h(state.target) + '">' +
        h(transcript) + '</bdi></div>';
    }
    enable();
  };
  recognition.onerror = event => {
    if (!active()) return;
    if (status) status.textContent = t(['not-allowed', 'service-not-allowed'].includes(event.error)
      ? 'lessonSpeechDenied' : 'lessonSpeechError');
    enable();
  };
  recognition.onend = enable;
  try { recognition.start(); }
  catch {
    if (status) status.textContent = t('lessonSpeechError');
    enable();
    stopLessonRecognition();
  }
}

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

function isSpeakingCapture() {
  return page === 'skill' && run?.skill === 'speaking' && !run.outcomes?.[run.index] ||
    page === 'quiz' && run?.kind === 'lesson' && run.questions?.[run.index]?.task === 'speak' &&
      !run.answers?.[run.index];
}

function speakingCaptureAnswered(session, index) {
  return session.kind === 'lesson' ? Boolean(session.answers?.[index]) :
    Boolean(session.outcomes?.[index]);
}

function skillRecordingStatus(message) {
  const output = main.querySelector('#skill-mic-status');
  if (output) output.textContent = message;
}

async function beginSkillRecording() {
  if (!isSpeakingCapture()) return;
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
    if (token !== skillRecordToken || !isSpeakingCapture() || run !== session || run.index !== index) {
      stream.getTracks().forEach(track => track.stop());
      return;
    }
    const recorder = new MediaRecorder(stream);
    const chunks = [];
    skillRecording = { recorder, stream, url: null };
    recorder.ondataavailable = event => { if (event.data?.size) chunks.push(event.data); };
    recorder.onstop = () => {
      stream.getTracks().forEach(track => track.stop());
      if (token !== skillRecordToken || run !== session || run.index !== index || !isSpeakingCapture() || speakingCaptureAnswered(session, index)) return;
      if (chunks.length) {
        const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
        skillRecording.url = URL.createObjectURL(blob);
        const player = main.querySelector('#skill-audio-playback');
        if (player) { player.src = skillRecording.url; player.hidden = false; }
      }
      setRecordToggle(false);
      skillRecordingStatus(t('skillPrivacy'));
    };
    recorder.start();
    setRecordToggle(true);
    skillRecordingStatus(t('skillRecording'));
  } catch {
    if (token === skillRecordToken) skillRecordingStatus(t('skillMicProblem'));
  }
}

function setRecordToggle(recording) {
  const toggle = main.querySelector('#skill-record-toggle');
  const label = main.querySelector('#skill-record-label');
  const text = t(recording ? 'skillStopRecord' : 'skillStartRecord');
  if (toggle) {
    toggle.setAttribute('aria-pressed', String(recording));
    toggle.setAttribute('aria-label', text);
    toggle.classList.toggle('is-recording', recording);
  }
  if (label) label.textContent = text;
}

function toggleSkillRecording() {
  if (skillRecording?.recorder?.state === 'recording') endSkillRecording();
  else beginSkillRecording();
}

function endSkillRecording() {
  if (!isSpeakingCapture() || skillRecording?.recorder?.state !== 'recording') return;
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
      run.revealed = true;
      const reference = main.querySelector('#skill-reference-preview');
      if (reference) reference.hidden = false;
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
  finishActivity(current, Date.now(), { correct: run.summary.matched });
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
          ${skill === 'speaking' ? '' : scored
            ? `<span><strong>${fmt(matched)} / ${fmt(scored)}</strong>${h(t('skillMatches'))}</span>`
            : `<span><strong>—</strong>${h(t('skillUnscored'))}</span>`}
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
  const { base, target } = state;
  const instruction = t(listening ? 'skillListenInstruction' : speaking ? (task.openEnded ? 'skillFreeSpeakInstruction' : 'skillSpeakInstruction') : 'skillWriteInstruction');
  if (!speaking && run.bankIndex !== run.index) { run.bankIndex = run.index; run.bankPlaced = []; }
  // Revealed before answering (unscored), or after answering as part of the feedback.
  const reference = `<div id="skill-reference-preview" class="q-support" ${run.revealed && !done ? '' : 'hidden'}>
    ${h(t(task.openEnded ? 'skillExample' : 'skillReference'))}: ${phraseMarkup(entry, target)}</div>`;
  const prompt = listening ? audioPrompt('skill-listen', 'skill-audio-status', reference)
    : task.openEnded ? promptPanel({ label: h(t('situation')), body: `<div class="q-text is-long" lang="${base}">${h(task.context[base])}</div>`, extra: reference })
    : speaking ? promptPanel({ label: languageLabel(target), listen: listenPill(entry, target), body: promptText(entry, target) })
    : promptPanel({ label: languageLabel(base), body: promptText(entry, base, { roman: false }) });
  const result = done && outcome.scorable ? (outcome.referenceMatch ? 'is-correct' : 'is-wrong') : '';
  const answer = speaking ? (done ? '' : `<div class="q-speak">
      <button id="skill-record-toggle" type="button" class="q-mic" data-action="skill-record-toggle" aria-pressed="false" aria-label="${h(t('skillStartRecord'))}">${icon('mic')}</button>
      <div><strong id="skill-record-label">${h(t('skillStartRecord'))}</strong><div id="skill-mic-status" class="q-support" role="status">${h(t('skillPrivacy'))}</div></div>
    </div>
    <audio id="skill-audio-playback" controls hidden aria-label="${h(t('skillPlayback'))}"></audio>`)
    : wordBankMarkup(task.wordBank, run.bankPlaced ?? [], done, result);
  const feedback = !done ? null : speaking
    ? (task.openEnded ? { html: icon('check') + '<span>' + h(t('skillExample')) + ':</span> ' + phraseMarkup(entry, target, false), correct: true } : null)
    : !outcome.scorable ? { html: '<span>' + h(t('skillUnscored')) + ' · ' + h(t('skillReference')) + ':</span> ' + phraseMarkup(entry, target, false), correct: true }
    : outcome.referenceMatch ? { html: icon('check') + '<strong>' + h(t('skillExact')) + '</strong>', correct: true }
    : { html: icon('close') + '<span>' + h(t('skillReference')) + ':</span> ' + phraseMarkup(entry, target, false), correct: false };
  const secondary = done ? '' : listening || task.openEnded ? secondaryAction(t('skillReveal'), 'skill-reveal')
    : speaking ? '' : secondaryAction(t('clearOrder'), 'word-bank-clear');
  const primary = done
    ? `<button class="button primary" type="button" data-action="skill-next">${h(t(run.index + 1 === run.tasks.length ? 'skillFinish' : 'skillNextTask'))}${icon('arrow', 'directional')}</button>`
    : speaking ? `<button class="button primary" type="button" data-action="skill-spoke">${h(t('lessonFlowNext'))}${icon('arrow', 'directional')}</button>`
    : `<button class="button primary" type="button" data-action="word-bank-check" ${run.bankPlaced?.length ? '' : 'disabled'}>${h(t('checkAnswer'))}${icon('check')}</button>`;
  main.innerHTML = `<div class="work-area">
    ${backButton('skillBack', 'go-practice')}
    ${heading(kind, title + ' · ' + levelLabel(run.level))}
    <section class="panel q-card">
      ${questionHeader(skill, { step: run.index + 1, total: run.tasks.length, label: 'taskLabel' })}
      ${questionInstruction(instruction, 'skill-focus')}
      ${prompt}${answer}
      ${questionFooter({ secondary, primary })}
    </section>
  </div>`;
  if (feedback) showFeedback(feedback.html, feedback.correct);
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
  const aid = showRoman && state.transliterate ? readingAidText(entry, code) : '';
  const roman = aid ? `<small class="roman" lang="${code}-Latn" dir="ltr">${h(aid)}</small>` : '';
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
  if (pair.includes('ru') && state.transliterate) notes.push(t('russianNote'));
  if (pair.some(code => ['ar', 'ru', 'de'].includes(code))) notes.push(t('genderNote'));
  return notes.length ? '<div class="usage-notes">' + notes.map(note => '<p>' + h(note) + '</p>').join('') + '</div>' : '';
}


// ---------------------------------------------------------------------------
// Unified question card. Every question type (lessons, practice, skill checks,
// story quizzes, level tests, placement, matching and review) renders the same
// five parts in the same order: header, instruction, prompt panel, answer area
// and footer. Only the prompt panel and the answer area vary by question type.
const skillChips = {
  reading: ['skillReading', 'stories'], listening: ['skillListening', 'volume'], writing: ['skillWriting', 'pen'],
  speaking: ['skillSpeaking', 'mic'], vocabulary: ['vocabulary', 'vocabulary'], info: ['lessonFlowNewPhrases', 'review']
};

// 1. Header: skill chip, counter (or an "unscored" tag) and progress bar.
function questionHeader(skill, { step, total, label = 'question', unscored = false, chip, counter, task = '' } = {}) {
  const [chipKey, chipIcon] = skillChips[skill];
  const count = counter ?? (unscored ? `<span class="q-counter is-unscored">${h(t('unscored'))}</span>`
    : total ? `<span class="q-counter">${h(t(label))} <bdi>${fmt(step)} / ${fmt(total)}</bdi></span>` : '');
  const progress = total ? `<progress class="q-progress" value="${step}" max="${total}" aria-label="${h(t(label))}"></progress>` : '';
  return `<div class="q-head" data-skill="${skill}" ${task ? `data-task="${task}"` : ''}><div class="q-meta"><span class="q-chip skill-${skill}">${icon(chipIcon)}${h(chip ?? t(chipKey))}</span>${count}</div>${progress}</div>`;
}

// 2. Instruction: one plain sentence; it is the focus target for screen readers.
function questionInstruction(text, id = 'question-focus') {
  return `<h2 class="q-instruction" id="${id}" tabindex="-1">${h(text)}</h2>`;
}

function listenPill(entry, code, action = 'speak') {
  return `<button type="button" class="q-listen" data-action="${action}" data-id="${entry.id}" data-lang="${code}"
    aria-label="${h(t('listen') + ' · ' + entry.text[code])}">${icon('volume')}${h(t('listen'))}</button>`;
}

// 3. Prompt panel: language label + listen pill, prompt text and an optional support line.
function promptPanel({ label = '', listen = '', body = '', support = '', extra = '' }) {
  return `<div class="q-prompt">
    ${label || listen ? `<div class="q-prompt-top"><span class="q-label">${label}</span>${listen}</div>` : ''}
    ${body}${support ? `<div class="q-support">${support}</div>` : ''}${extra}
  </div>`;
}

function promptText(entry, code, { roman = true, id = '' } = {}) {
  const long = entry.text[code].length > 58 ? ' is-long' : '';
  return `<div class="q-text${long}" ${id ? `id="${id}"` : ''}>${phraseMarkup(entry, code, roman)}</div>`;
}

function languageLabel(code) {
  return `<bdi lang="${code}">${h(languages[code].name)}</bdi>`;
}

// Audio-only prompt: one large play button; the status line doubles as the hint.
function audioPrompt(action, statusId, extra = '') {
  return promptPanel({ body: `<div class="q-audio">
    <button type="button" class="q-play" data-action="${action}" aria-label="${h(t('listen'))}">${icon('volume')}</button>
    <div><strong>${h(t('listen'))}</strong><span id="${statusId}" class="q-support" role="status">${h(t('listenHint'))}</span></div>
  </div>`, extra });
}

function promptRows(entries) {
  return `<div class="q-rows">${entries.map(entry => `<div class="q-row">
    <div><div class="q-text is-long">${phraseMarkup(entry, state.target)}</div><div class="q-support">${phraseMarkup(entry, state.base, false)}</div></div>
    <button type="button" class="q-listen is-icon" data-action="speak" data-id="${entry.id}" data-lang="${state.target}"
      aria-label="${h(t('listen') + ' · ' + entry.text[state.target])}">${icon('volume')}</button>
  </div>`).join('')}</div>`;
}

// 5. Footer: one secondary text action (replaced by feedback after answering)
// on the start side, the primary button(s) on the end side.
function questionFooter({ secondary = '', primary = '', feedbackId = 'answer-feedback' } = {}) {
  return `<div class="q-foot">
    <div class="q-foot-start"><div id="${feedbackId}" class="answer-feedback" role="status" aria-atomic="true"></div>${secondary}</div>
    <div class="q-foot-end">${primary}</div>
  </div>`;
}

function secondaryAction(label, action, attributes = '') {
  return `<button type="button" class="q-action" data-action="${action}" ${attributes}>${h(label)}</button>`;
}

// Answering hides the secondary action; the feedback takes its place.
function showFeedback(html, correct, id = 'answer-feedback') {
  const feedback = main.querySelector('#' + id);
  if (!feedback) return;
  feedback.className = 'answer-feedback ' + (correct ? 'correct' : 'incorrect');
  feedback.innerHTML = html;
  main.querySelectorAll('.q-action').forEach(action => { action.hidden = true; });
}

function questionSkill(question) {
  const task = question.task ?? 'translation';
  if (['intro', 'recovery'].includes(task)) return 'info';
  if (task === 'word-intro') return 'vocabulary';
  if (['listen', 'dictation'].includes(task)) return 'listening';
  if (task === 'write') return 'writing';
  if (task === 'speak') return 'speaking';
  return run.mode === 'words' || (question.studyEntry ?? question.entry)?.id?.startsWith('word-') ? 'vocabulary' : 'reading';
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

function lessonRequirement(key, questions) {
  const total = lessonQuestionTotal(questions);
  return t(key).replace('{total}', fmt(total)).replace('{required}', fmt(lessonPassingScore(total)));
}

// Instruction, prompt panel and secondary footer action for one quiz question.
function quizPrompt(question) {
  const { task, entry, from, gap, studyEntry } = question;
  const { base, target } = state;
  if (task === 'intro') return {
    instruction: t('lessonFlowIntro'),
    prompt: promptPanel({ label: languageLabel(target), body: promptRows(question.examples),
      support: h(t('lessonFlowIntroLead')) + ' ' + h(lessonRequirement('lessonFlowPass', run.questions)) })
  };
  if (task === 'word-intro') return {
    instruction: t('lessonFlowWords'),
    prompt: promptPanel({ label: languageLabel(target), body: promptRows(question.examples),
      support: h(t('lessonFlowWordsLead')) })
  };
  if (task === 'reply') return {
    instruction: t('replyPrompt'),
    prompt: promptPanel({ label: languageLabel(target), listen: listenPill(question.cue, target),
      body: promptText(question.cue, target), support: phraseMarkup(question.cue, base, false) })
  };
  if (task === 'recovery') return {
    instruction: t('lessonFlowRecoveryLead'),
    prompt: promptPanel({ label: languageLabel(target), body: promptRows([entry]) })
  };
  if (task === 'write') return {
    instruction: t('lessonFlowWritePrompt'),
    prompt: promptPanel({ label: languageLabel(base), body: promptText(entry, base, { roman: false }) }),
    secondary: secondaryAction(t('clearOrder'), 'word-bank-clear')
  };
  if (task === 'dictation') return {
    instruction: t('lessonFlowDictation'),
    // Without audio the dictation shows the sentence's meaning, never the answer.
    prompt: audioPrompt('lesson-audio', 'lesson-audio-status',
      `<div id="lesson-preview" class="q-text is-long" hidden>${phraseMarkup(entry, base, false)}</div>`),
    secondary: secondaryAction(t('lessonFlowReveal'), 'lesson-reveal')
  };
  if (task === 'speak') return {
    instruction: t('lessonFlowSpeak'),
    prompt: promptPanel({ label: languageLabel(target), listen: listenPill(entry, target), body: promptText(entry, target) })
  };
  if (task === 'reading') return {
    instruction: t('storyQuestion'),
    prompt: promptPanel({ label: h(run.story.title[base]), body: `<div class="q-text" lang="${base}">${h(question.prompt)}</div>`,
      extra: `<div id="story-reference" class="q-story" hidden>${run.story.lines.map(line => '<p>' + phraseMarkup(line, target, false) + '</p>').join('')}</div>` }),
    secondary: secondaryAction(t('readAgain'), 'toggle-story', 'aria-expanded="false" aria-controls="story-reference"')
  };
  if (task === 'listen') return {
    instruction: t('listenPrompt'),
    prompt: audioPrompt('listen-quiz', 'listen-status', `<div id="quiz-transcript" class="q-text is-long" hidden>${phraseMarkup(entry, from)}</div>`),
    secondary: secondaryAction(t('transcript'), 'show-transcript', 'aria-expanded="false" aria-controls="quiz-transcript"')
  };
  if (gap) return {
    instruction: t('gapPrompt'),
    prompt: promptPanel({ label: languageLabel(from),
      body: `<div class="q-text" lang="${from}" dir="${languages[from].direction ?? 'ltr'}">${h(gap.before)}<span class="gap-slot" role="img" aria-label="${h(t('missingWord'))}"></span>${h(gap.after)}</div>`,
      support: phraseMarkup(studyEntry, base, false) })
  };
  const word = entry.id.startsWith('word-');
  const key = task === 'final-choice' ? 'lessonFlowFinalPrompt' : from === target ? (run.mode === 'words' || word ? 'wordMeaning' : 'meaning') : word ? 'translateWord' : 'translate';
  return {
    instruction: t(key),
    prompt: promptPanel({ label: languageLabel(from), listen: from === target ? listenPill(entry, from) : '', body: promptText(entry, from, { roman: from === target }) })
  };
}

function lessonHeader(question, index) {
  const skill = questionSkill(question);
  const total = lessonQuestionTotal(run.questions);
  const task = question.task ?? 'translation';
  if (task === 'intro') {
    return questionHeader(skill, { task, counter: `<span class="q-counter">${h(tn('questionsLabel', total))}</span>` });
  }
  const progress = lessonQuestionProgress(run.questions, index);
  if (progress) return questionHeader(skill, { ...progress, task });
  // Unscored cards keep the bar where the scored questions left it.
  const answered = run.questions.slice(0, index).filter((_, item) => lessonQuestionProgress(run.questions, item)).length;
  return questionHeader(skill, { unscored: true, step: answered, total, task, chip: task === 'recovery' ? t('lessonFlowRecovery') : undefined });
}

function activeWordBank() {
  if (quizBankTask(run?.questions?.[run.index]) && !run.answers?.[run.index]) {
    return run.questions[run.index].wordBank;
  }
  if (page === 'skill' && ['writing', 'listening'].includes(run?.skill) && run.stage === 'task' &&
      !run.outcomes?.[run.index]) return run.tasks[run.index].wordBank;
  return null;
}

// 4. Answer area — word bank: dashed answer line, then the tray. Clear and Check
// are the footer's secondary action and primary button in every context.
function wordBankMarkup(bank, ids = [], done = false, result = '') {
  const selected = wordBankSelection(bank, ids);
  const remaining = bank.tray.filter(tile => !ids.includes(tile.id));
  const dir = languages[state.target].direction ?? 'ltr';
  const reading = token => token.roman && state.transliterate
    ? `<small class="roman" lang="${state.target}-Latn" dir="ltr">${h(token.roman)}</small>` : '';
  const tile = (token, action) => `<button type="button" class="word-bank-tile" data-action="${action}"
    data-id="${h(token.id)}" ${done ? 'disabled' : ''}>${h(token.text)}${reading(token)}</button>`;
  return `<div id="word-bank-zone" class="q-bank">
    <span class="q-field-label">${h(t('yourSentence'))}</span>
    <div class="q-bank-line ${result}" id="word-bank-line" lang="${state.target}" dir="${dir}"
      aria-label="${h(t('yourSentence'))}" data-empty="${h(t('bankPlaceholder'))}">${selected.map(item => tile(item, 'word-bank-remove')).join('')}</div>
    ${remaining.length && !done ? `<span class="q-field-label">${h(t('wordBank'))}</span>
    <div class="q-tray" id="word-bank-tray" lang="${state.target}" dir="${dir}">
      ${remaining.map(item => tile(item, 'word-bank-add')).join('')}
    </div>` : ''}
  </div>`;
}

function updateWordBank() {
  const bank = activeWordBank();
  if (!bank) return;
  const zone = main.querySelector('#word-bank-zone');
  if (!zone) return;
  zone.outerHTML = wordBankMarkup(bank, run.bankPlaced ?? []);
  // The answer length is not revealed: extra tiles mean any non-empty answer can be checked.
  const primary = main.querySelector(page === 'quiz' ? '#quiz-next' : '[data-action="word-bank-check"]');
  if (primary) primary.disabled = !run.bankPlaced?.length;
}

function moveWordBankTile(id, add) {
  const bank = activeWordBank();
  if (!bank) return;
  const selected = run.bankPlaced ??= [];
  if (add) {
    if (!selected.includes(id) && bank.tray.some(tile => tile.id === id)) selected.push(id);
  } else {
    const index = selected.indexOf(id);
    if (index !== -1) selected.splice(index, 1);
  }
  updateWordBank();
  (main.querySelector(add ? '#word-bank-tray button' : '#word-bank-line button') ??
    main.querySelector('#quiz-next') ??
    main.querySelector('[data-action="word-bank-check"]'))?.focus({ preventScroll: true });
}

function clearWordBank() {
  if (!activeWordBank()) return;
  run.bankPlaced = [];
  updateWordBank();
  main.querySelector('#word-bank-tray button')?.focus({ preventScroll: true });
}

function checkWordBank() {
  const bank = activeWordBank();
  if (!bank || !run.bankPlaced?.length) return;
  const correct = wordBankMatches(bank, run.bankPlaced);
  if (page === 'quiz') {
    const placed = [...run.bankPlaced];
    finishAnswer(correct);
    // Show the answered sentence, marked right or wrong, without the tray.
    const zone = main.querySelector('#word-bank-zone');
    if (zone) zone.outerHTML = wordBankMarkup(bank, placed, true, correct ? 'is-correct' : 'is-wrong');
    main.querySelector('#quiz-next')?.focus({ preventScroll: true });
  } else {
    const scorable = run.skill === 'writing' ||
      (run.heard && !run.revealed && !run.audioUnavailable);
    run.outcomes[run.index] = {
      attempted: true, scorable,
      referenceMatch: scorable && correct
    };
    renderSkillSession();
  }
}

function quizInputs(question) {
  if (['intro', 'word-intro', 'recovery'].includes(question.task)) return '';
  if (question.task === 'speak') {
    const supported = Boolean(window.SpeechRecognition ?? window.webkitSpeechRecognition);
    return `<div class="q-speak">
      <button type="button" class="q-mic" data-action="lesson-speech-check" aria-label="${h(t('lessonSpeechStart'))}" ${supported ? '' : 'disabled'}>${icon('mic')}</button>
      <div><strong>${h(t(supported ? 'lessonSpeechStart' : 'skillSpeaking'))}</strong>
        <div id="lesson-speech-status" class="q-support" role="status" aria-live="polite">${h(t(supported ? 'speakHint' : 'lessonSpeechUnavailable'))}</div></div>
    </div>
    ${supported ? `<p class="q-note">${h(t('lessonSpeechPrivacy'))}</p>` : ''}`;
  }
  if (question.task === 'write' || question.task === 'dictation') return wordBankMarkup(question.wordBank, run.bankPlaced ?? []);
  if (question.options) return quizChoices(question);
  throw new Error('Unsupported quiz question type');
}

function quizChoices(question) {
  if (question.options) {
    return `<div class="q-choices" role="group" aria-labelledby="question-focus">
      ${question.options.map((option, index) => `<button type="button" class="option" data-action="answer" data-id="${option.id}">
        <span class="option-letter" aria-hidden="true">${String.fromCharCode(65 + index)}</span>
        <span class="option-copy">${phraseMarkup(option, question.to, question.to === state.target)}</span>
        <span class="option-result" aria-hidden="true"></span>
      </button>`).join('')}
    </div>`;
  }
  throw new Error('Unsupported quiz question type');
}

function renderQuiz() {
  const { questions, index } = run;
  const question = questions[index];
  const last = index === questions.length - 1;
  const { title, kicker, back, action } = quizLabels();
  if (question.task === 'write' || question.task === 'dictation') run.bankPlaced = [];
  const bank = quizBankTask(question);
  const informational = run.kind === 'lesson' && ['intro', 'word-intro', 'recovery'].includes(question.task);
  const ready = informational || question.task === 'speak';
  const { instruction, prompt, secondary = '' } = quizPrompt(question);
  const header = run.kind === 'lesson' ? lessonHeader(question, index)
    : questionHeader(questionSkill(question), { step: index + 1, total: questions.length, task: question.task ?? 'translation' });
  const label = ['intro', 'word-intro', 'speak'].includes(question.task) ? 'lessonFlowNext' : bank ? 'checkAnswer' : last ? 'results' : 'next';
  const primary = `<button type="button" id="quiz-next" class="button primary" data-action="advance-quiz" ${ready ? '' : 'disabled'}>
    ${h(t(label))}${bank ? icon('check') : icon('arrow', 'directional')}</button>`;
  const quizBody = header + questionInstruction(instruction) + prompt + quizInputs(question) + questionFooter({ secondary, primary });
  const panel = run.kind === 'lesson' ? main.querySelector('#mixed-lesson-panel') : null;
  if (panel) {
    // Keep the surrounding page and title mounted between questions to avoid
    // the full-screen flash caused by replacing the entire main element.
    panel.innerHTML = quizBody;
  } else {
    main.innerHTML = `<div class="work-area">
      ${backButton(back, action)}
      ${heading(kicker, title)}
      <section class="panel q-card" ${run.kind === 'lesson' ? 'id="mixed-lesson-panel"' : ''}>
        ${quizBody}
      </section>
    </div>`;
  }
}


function finishLessonFormative({ match = false, skill = 'recognition', signal = false } = {}) {
  if (page !== 'quiz' || run.kind !== 'lesson' || run.answers[run.index]) return;
  const question = run.questions[run.index];
  if (question.core) return;
  const entry = question.studyEntry ?? question.entry;
  run.answers.push({ id: entry.id, correct: match, skill, signal, scored: false });
  if (!['intro', 'word-intro', 'recovery', 'speak'].includes(question.task)) {
    showFeedback(match ? icon('check') + '<strong>' + h(t('correct')) + '</strong>'
      : icon('close') + '<span>' + h(t('correctAnswer')) + ':</span> ' + phraseMarkup(entry, state.target, false), match);
  }
  showNextQuestionButton();
  rememberLesson();
  if (run.answers.length === run.questions.length) saveQuizResult();
}

function lessonReveal() {
  if (page !== 'quiz' || run?.kind !== 'lesson' || run.answers[run.index]) return;
  run.revealedIndex = run.index;
  const element = main.querySelector('#lesson-preview');
  if (element) element.hidden = false;
  const output = main.querySelector('#answer-feedback');
  if (output) output.textContent = '';
}

function lessonAudio() {
  if (page !== 'quiz' || run?.kind !== 'lesson') return;
  const exercise = run;
  const index = run.index;
  const question = run.questions[index];
  if (!['dictation', 'speak'].includes(question.task)) return;
  speak(question.entry.id, state.target, () => {
    if (page !== 'quiz' || run !== exercise || run.index !== index) return;
    run.revealedIndex = index;
    const preview = main.querySelector('#lesson-preview');
    if (preview) preview.hidden = false;
    const message = main.querySelector('#lesson-audio-status');
    if (message) message.textContent = t('lessonFlowNoAudio');
  }, () => {
    if (page === 'quiz' && run === exercise && run.index === index) run.heardIndex = index;
  });
}

function saveQuizResult() {
  const current = course();
  if (run.kind === 'lesson') run.lessonResult = lessonScore(run.questions, run.answers);
  const score = run.kind === 'lesson' ? run.lessonResult.correct : run.answers.filter(answer => answer.correct).length;
  const now = Date.now();
  run.score = score;
  if (run.kind === 'check') {
    applyPlacement(current, run.answers);
    current.placement = score;
  } else if (run.kind === 'reading') {
    recordJourney(current, [...run.answers, { id: 'reading:' + run.story.id, correct: storyPassed(run.story, score) }], 'reading', now);
    current.storyBest[run.story.id] = Math.max(current.storyBest[run.story.id] ?? 0, score);
  } else {
    const graded = run.kind === 'lesson' ? run.answers.filter(answer => answer.scored) : run.answers;
    const observed = run.kind === 'lesson'
      ? run.answers.filter(answer => answer.scored || answer.signal) : run.answers;
    recordJourney(current, observed, run.kind, now);
    if (run.kind === 'lesson') saveLesson(current, run.unit, graded, now);
    else recordPractice(current, run.answers, now);
    if (run.kind === 'practice' || run.kind === 'checkpoint') {
      const key = run.kind === 'checkpoint' ? 'checkpoint-' + run.level : run.mode;
      current.practiceBest[key] = Math.max(current.practiceBest[key] ?? 0, score);
      journeyFor(current);
    }
  }
  forgetLesson();
  const lessonId = run.kind === 'lesson' && run.lessonResult.passed ? run.unit.id : undefined;
  finishActivity(current, now, { lessonId, correct: score, recalled: recalledWords(run.answers) });
  persist();
}

function skillForQuestion(question) {
  if (question.task === 'reading' || question.task === 'reading-practice') return 'reading';
  if (question.task === 'write') return 'recall';
  if (question.task === 'speak') return 'recognition'; // The scored part is meaning choice, not pronunciation.
  if (question.task === 'listen' && (run.heardIndex !== run.index || !main.querySelector('#quiz-transcript').hidden)) return 'reading';
  // A dictation built from its meaning (no audio, or the learner chose not to listen) is recall, not listening.
  if (question.task === 'dictation') return run.heardIndex === run.index && run.revealedIndex !== run.index ? 'listening' : 'recall';
  return practiceSkill(question.task ?? run.mode);
}


function showNextQuestionButton() {
  const button = main.querySelector('#quiz-next');
  if (!button) return;
  button.disabled = false;
  if (run.kind !== 'lesson' && !quizBankTask(run.questions[run.index])) return;
  button.innerHTML = h(t(run.index + 1 === run.questions.length ? 'results' : 'next')) +
    icon('arrow', 'directional');
  if (run.kind !== 'lesson') return;
  const progress = main.querySelector('.q-progress');
  const count = main.querySelector('.q-counter bdi');
  const steps = lessonQuestionProgress(run.questions, run.index);
  if (progress && steps) progress.max = steps.total;
  if (count && steps) count.textContent = fmt(steps.step) + ' / ' + fmt(steps.total);
}

function finishAnswer(correct, selectedId) {
  if (page !== 'quiz' || run.answers[run.index]) return;
  const question = run.questions[run.index];
  const answer = question.studyEntry ?? question.entry;
  run.answers.push({
    id: answer.id, correct, skill: skillForQuestion(question),
    scored: run.kind !== 'lesson' || Boolean(question.core),
    signal: run.kind === 'lesson' && question.task === 'listen' &&
      run.heardIndex === run.index && run.revealedIndex !== run.index
  });
  if (run.kind === 'lesson' && question.core && !correct && (run.recoveries ?? 0) < 2) {
    run.questions.splice(run.index + 1, 0, recoveryActivity(question));
    run.recoveries = (run.recoveries ?? 0) + 1;
  }
  main.querySelectorAll('.option').forEach(option => {
    const correctOption = option.dataset.id === question.entry.id;
    const wrongOption = option.dataset.id === selectedId && !correct;
    option.setAttribute('aria-disabled', 'true');
    option.tabIndex = -1;
    option.classList.toggle('option-correct', correctOption);
    option.classList.toggle('option-wrong', wrongOption);
    if (correctOption || wrongOption) option.querySelector('.option-result').innerHTML = icon(correctOption ? 'check' : 'close');
  });
  showFeedback(correct ? icon('check') + '<strong>' + h(t('correct')) + '</strong>'
    : icon('close') + '<span>' + h(t('correctAnswer')) + ':</span> ' + phraseMarkup(answer, question.to ?? state.target, false), correct);
  showNextQuestionButton();
  rememberLesson();
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

function advanceQuiz() {
  if (page !== 'quiz') return;
  if (!run.answers[run.index]) {
    const question = run.questions[run.index];
    if (run.kind === 'lesson' && ['intro', 'word-intro', 'recovery', 'speak'].includes(question.task)) {
      if (question.task === 'speak') {
        stopLessonRecognition();
        finishLessonFormative({ match: Boolean(run.speakingMatch), skill: 'speaking' });
      } else finishLessonFormative();
    } else {
      if (quizBankTask(question) && run.bankPlaced?.length) checkWordBank();
      return;
    }
  }
  if (!run.answers[run.index]) return;
  if (run.index + 1 === run.questions.length) {
    stopSkillRecording();
    go('result', run);
  } else {
    stopSkillRecording();
    stopLessonRecognition();
    window.speechSynthesis?.cancel();
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

// Words brought back from memory: a review card marked as known, or a
// vocabulary entry answered correctly. This is what the weekly recall goal counts.
function recalledWords(answers = []) {
  return answers.filter(answer => answer.correct && answer.id?.startsWith('word-')).map(answer => answer.id);
}

// The phrases and words that were answered incorrectly, in the order they were
// asked and without repeats. Unscored cards and story options are left out.
function missedEntries() {
  if (!Array.isArray(run?.questions)) return [];
  const seen = new Set();
  return run.questions.flatMap((question, index) => {
    const answer = run.answers[index];
    if (!answer || answer.correct || answer.scored === false) return [];
    const entry = question.studyEntry ?? question.entry;
    if (!entry?.id || seen.has(entry.id) || !audioEntries.has(entry.id)) return [];
    seen.add(entry.id);
    return [entry];
  });
}

function missedMarkup() {
  const missed = missedEntries();
  if (!missed.length) return '';
  return `<section class="result-missed" aria-labelledby="result-missed-title">
    <h2 id="result-missed-title">${h(t('missedPhrases'))}</h2>
    <div class="phrase-list">${missed.map(entry => phraseRow(entry)).join('')}</div>
  </section>`;
}

function renderResult() {
  const { kind, score } = run;
  const total = kind === 'lesson' ? run.lessonResult.total : run.questions?.length ?? run.total;
  const isMatch = kind === 'practice' && run.mode === 'match';
  const passed = kind === 'check' || (kind === 'lesson' ? run.lessonResult.passed
    : kind === 'checkpoint' ? score >= checkpointPassMark : score >= Math.ceil(total * 2 / 3));
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
    detail = passed ? t('passLead') : lessonRequirement('lessonFlowRetry', run.questions);
    buttons = (passed ? '' : button('retry', 'study', { id: run.unit.id, style: 'secondary' })) + continueButton;
  }
  main.innerHTML = `<div class="work-area">
    <section class="panel result-panel">
      <span class="result-icon tone-${passed ? 'mint' : 'lilac'}">${icon(passed ? 'check' : 'spark')}</span>
      <h1>${h(t(title))}</h1>
      <div class="score-badge"><bdi>${fmt(score)} / ${fmt(total)}</bdi> ${h(t(isMatch ? 'matchScore' : 'score'))}</div>
      <p>${h(detail)}</p>
      ${kind === 'check' ? '' : levelUpNotice()}
      ${missedMarkup()}
      <div class="result-actions">${buttons}</div>
    </section>
  </div>`;
}


function renderFlashcard() {
  const entry = run.queue[run.index];
  main.innerHTML = `<div class="work-area">
    ${backButton('backVocabulary', 'go-vocabulary')}
    ${heading(t('vocabulary'), t('review'), t('reviewLead'))}
    <section class="panel q-card">
      ${questionHeader('vocabulary', { step: run.index + 1, total: run.queue.length, label: 'cardLabel' })}
      ${questionInstruction(t('reviewInstruction'), 'flashcard-focus')}
      ${promptPanel({ label: languageLabel(state.target), listen: listenPill(entry, state.target), body: promptText(entry, state.target) })}
      <div id="card-meaning" class="q-reveal" aria-live="polite">${h(t('revealPlaceholder'))}</div>
      ${questionFooter({ primary: button('reveal', 'reveal') + `<span class="rating-actions" hidden>
        ${button('again', 'rate-again', { style: 'secondary' })}${button('known', 'rate-known', { symbol: 'check' })}</span>` })}
    </section>
  </div>`;
}

function revealFlashcard() {
  if (page !== 'flashcards' || run.revealed) return;
  run.revealed = true;
  const meaning = main.querySelector('#card-meaning');
  meaning.classList.add('is-open');
  meaning.innerHTML = `<span class="q-label">${languageLabel(state.base)}</span>${promptText(run.queue[run.index], state.base, { roman: false })}`;
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
  if (known) (run.recalled ??= []).push(id);
  run.revealed = false;
  run.index++;
  const finished = run.index === run.queue.length;
  if (finished) finishActivity(current, now, { correct: (run.recalled ?? []).length, recalled: recalledWords((run.recalled ?? []).map(id => ({ id, correct: true }))) });
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
      <div class="score-badge">${h(tn('cardsReviewed', run.index))}</div>
      <p>${h(t('reviewDoneLead'))}</p>
      ${levelUpNotice()}
      <div class="result-actions">${run.quick ? button('backVocabulary', 'go-vocabulary', { style: 'secondary' })
        + button('continueLearning', 'continue-learning', { symbol: 'arrow' })
        : button('backVocabulary', 'go-vocabulary', { symbol: 'arrow' })}</div>
    </section>
  </div>`;
}


function renderMatch() {
  const { targetCards, baseCards } = run;
  const card = (entry, code, side) => `<button type="button" class="match-card" data-action="choose-match" data-id="${entry.id}"
    data-side="${side}" aria-pressed="false"><span>${phraseMarkup(entry, code, false)}</span><span class="match-mark" aria-hidden="true"></span></button>`;
  main.innerHTML = `<div class="work-area">
    ${backButton('backPractice', 'go-practice')}
    ${heading(run.group.title[state.base], t('mode-match'))}
    <section class="panel q-card">
      ${questionHeader('vocabulary', { step: 0, total: run.total, label: 'pairs' })}
      ${questionInstruction(t('matchInstruction'))}
      <div class="q-match">
        <div class="q-match-column"><span class="q-field-label">${languageLabel(state.target)}</span>${targetCards.map(entry => card(entry, state.target, 'target')).join('')}</div>
        <div class="q-match-column"><span class="q-field-label">${languageLabel(state.base)}</span>${baseCards.map(entry => card(entry, state.base, 'base')).join('')}</div>
      </div>
      ${questionFooter({ feedbackId: 'match-feedback',
        primary: `<button type="button" id="match-result" class="button primary" data-action="match-result" disabled>${h(t('results'))}${icon('arrow', 'directional')}</button>` })}
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
  main.querySelector('.q-counter bdi').textContent = fmt(run.matched.size) + ' / ' + fmt(run.total);
  main.querySelector('.q-progress').value = run.matched.size;
  const feedback = main.querySelector('#match-feedback');
  feedback.innerHTML = message ? icon(message === 'matchMiss' ? 'close' : 'check') + '<span>' + h(t(message)) + '</span>' : '';
  feedback.className = 'answer-feedback ' + (message === 'matchMiss' ? 'incorrect' : 'correct');
  if (run.matched.size === run.total) {
    const answers = run.targetCards.map(entry => ({ id: entry.id, correct: !run.missed.has(entry.id), skill: 'recognition' }));
    const current = course();
    const now = Date.now();
    recordJourney(current, answers, 'practice', now);
    run.score = recordPractice(current, answers, now);
    current.practiceBest.match = Math.max(current.practiceBest.match ?? 0, run.score);
    finishActivity(current, now, { correct: run.score, recalled: recalledWords(answers) });
    persist();
    const result = main.querySelector('#match-result');
    result.disabled = false;
    result.focus({ preventScroll: true });
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

// A first look at a script the learner may not read yet. Nothing here is
// translated prose: a card holds the letter's shapes, its reading aid, and a
// word from the vocabulary they have already unlocked.
// Several letters never begin a word, so the example shows where the letter is
// rather than pretending every one of them can come first.
function markLetter(text, letter) {
  const index = String(text).toLowerCase().indexOf(letter.toLowerCase());
  if (index < 0) return h(text);
  return h(text.slice(0, index)) + '<mark>' + h(text.slice(index, index + letter.length)) +
    '</mark>' + h(text.slice(index + letter.length));
}

function alphabetSection() {
  const letters = alphabets[state.target];
  if (!letters) return '';
  const aid = entry => state.transliterate ? readingAidText(entry, state.target) : '';
  const entries = words.filter(word => word.level <= accessibleLevel(course()));
  const dir = languages[state.target].direction ?? 'ltr';
  return `<details class="panel alphabet">
    <summary class="alphabet-summary">
      <span><strong>${h(t('alphabetTitle'))}</strong><small>${h(t('alphabetLead'))}</small></span>${icon('down')}
    </summary>
    <ol class="alphabet-grid" role="list">${letters.map(letter => {
      const example = letterExample(letter.letter, entries, state.target);
      return `<li class="alphabet-letter">
        <div class="alphabet-forms" lang="${state.target}" dir="${dir}">${letter.forms.map(form => `<span>${h(form)}</span>`).join('')}</div>
        <div class="alphabet-sound"><bdi>${letter.name ? '<strong>' + h(letter.name) + '</strong> · ' : ''}${h(letter.roman)}</bdi></div>
        ${example ? `<div class="alphabet-example" lang="${state.target}" dir="${dir}">
          <span class="phrase-text">${markLetter(example.text[state.target], letter.letter)}</span>
          ${aid(example) ? `<small class="roman" lang="${state.target}-Latn" dir="ltr">${h(aid(example))}</small>` : ''}
        </div>` : ''}
      </li>`;
    }).join('')}</ol>
  </details>`;
}

// How the target language works, in the language the learner reads.
function languageNotesSection() {
  const notes = languageNotes[state.target] ?? [];
  if (!notes.length) return '';
  return `<details class="panel language-notes">
    <summary class="alphabet-summary">
      <span><strong>${h(t('languageNotesTitle'))}</strong><small>${h(t('languageNotesLead'))}</small></span>${icon('down')}
    </summary>
    <ul class="language-note-list">${notes.map(note => `<li>${h(note[state.base])}</li>`).join('')}</ul>
  </details>`;
}

function renderVocabulary() {
  const label = t(vocabTab === 'words' ? 'searchWords' : 'search');
  const filters = lexiconFilters[vocabTab];
  main.innerHTML = `
    ${heading(t('vocabEyebrow'), t('vocabulary'), t('vocabularyLead'))}
    <section class="vocabulary-review" id="vocabulary-review" aria-labelledby="vocabulary-review-title">
      ${vocabularyReviewContent(vocabularyReviewSummary(course()))}
    </section>
    ${alphabetSection()}
    ${languageNotesSection()}
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
  return [user?.telegramId ?? '', user && sync?.status === 'signin', signOutWarning, deleteWarning, authIssue, Boolean(available)].join('|');
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
      </div></div>` : deleteWarning ? `<div class="sign-out-warning" role="alert"><p>${h(t('deleteAccountWarning'))}</p><div class="cloud-actions">
        <button class="button secondary" data-action="download-progress">${h(t('downloadProgress'))}</button>
        <button class="button secondary" data-action="delete-account-confirm">${h(t('deleteAccountConfirm'))}</button>
        <button class="button secondary" data-action="cancel-delete">${h(t('cancel'))}</button>
      </div></div>` : `<div class="cloud-actions">
        <button class="button secondary" data-action="sign-out">${h(t('signOut'))}</button>
        <button class="button secondary" data-action="delete-account">${h(t('deleteAccount'))}</button>
      </div>`}` : `
      ${authIssue ? '<p role="status">' + h(t(mini ? 'miniSignInFailed' : 'signInFailed')) + '</p>' : ''}
      ${signIn(available || mini)}
      ${!available && !mini ? '<p>' + h(t('signInUnavailable')) + '</p>' : ''}`}
  </section>`;
}

// What Aytim keeps, what it never receives, and what deleting an account removes.
function privacyPanel() {
  const notes = ['privacyKept', 'privacyNever', 'privacyBrowser', 'privacyDelete'];
  return `<details class="panel language-notes">
    <summary class="alphabet-summary">
      <span><strong>${h(t('privacyTitle'))}</strong><small>${h(t('privacyLead'))}</small></span>${icon('down')}
    </summary>
    <ul class="language-note-list">${notes.map(key => `<li>${h(t(key))}</li>`).join('')}</ul>
  </details>`;
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
      ${[state.base, state.target].some(code => ['ar', 'ru'].includes(code)) ? `<div class="setting">
        <div><label for="transliterate">${h(t('scriptHelp'))}</label><p>${h(t('scriptLead'))}</p></div>
        <input id="transliterate" type="checkbox" ${state.transliterate ? 'checked' : ''}>
      </div>` : ''}
      ${[state.base, state.target].some(code => ['ru', 'ar', 'de'].includes(code)) ? `<div class="setting">
        <div><label for="speaker-form">${h(t('speakerForm'))}</label><p>${h(t('speakerFormLead'))}</p></div>
        <select id="speaker-form">
          <option value="m" ${state.speaker === 'f' ? '' : 'selected'}>${h(t('speakerMasculine'))}</option>
          <option value="f" ${state.speaker === 'f' ? 'selected' : ''}>${h(t('speakerFeminine'))}</option>
        </select>
      </div>` : ''}
    </section>
    ${accountPanel()}
    ${privacyPanel()}
    ${cloudSettings()}
  </div>`;
  updateCloudUI();
}


const views = {
  home: renderHome,
  path: renderPath,
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

// Browser and Telegram Back. Every screen Aytim opens adds one history entry,
// so Back steps out of a lesson instead of leaving the site. The screens
// themselves stay here rather than in history.state, which cannot hold a
// running exercise; only the depth is stored, so Forward is told apart from Back.
const screens = new Map();
const maxScreens = 50;
let screenDepth = 0;
let telegramBack = null;

function rememberScreen() {
  screens.set(screenDepth, { page, run });
  if (screens.size > maxScreens) screens.delete(Math.min(...screens.keys()));
  screenDepth++;
  try { history.pushState({ aytimDepth: screenDepth }, ''); } catch { /* History can be unavailable in an embedded view. */ }
}

function updateTelegramBack() {
  try { if (screenDepth) telegramBack?.show(); else telegramBack?.hide(); }
  catch { telegramBack = null; }
}

function connectTelegramBack(webApp) {
  telegramBack = webApp?.BackButton ?? null;
  try { telegramBack?.onClick(() => history.back()); } catch { telegramBack = null; }
  updateTelegramBack();
}

window.addEventListener('popstate', event => {
  const target = Number(event.state?.aytimDepth ?? 0);
  // Going forward, or past the entries Aytim owns: leave the view as it is.
  if (!Number.isInteger(target) || target >= screenDepth) { screenDepth = Math.max(target, 0); updateTelegramBack(); return; }
  if (dialog.open) dialog.close();
  screenDepth = target;
  const screen = screens.get(target);
  for (const depth of [...screens.keys()]) if (depth >= target) screens.delete(depth);
  if (screen) render(screen.page, screen.run);
  else updateTelegramBack();
});

function go(destination, exercise = null) {
  if (destination === 'review') destination = 'vocabulary';
  // Re-rendering the screen already open is not a navigation, so Back does not stop on it twice.
  if (destination !== page || exercise || run) rememberScreen();
  render(destination, exercise);
}

function render(destination, exercise = null) {
  stopSkillRecording();
  stopLessonRecognition();
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
  applySpeakerForms(state.speaker);
  renderShell(progress);
  views[page](progress);
  disconnectLessonPaths = connectLessonPaths(main);
  updateTelegramBack();
  main.focus({ preventScroll: true });
  window.scrollTo(0, 0);
}

// A lesson in progress outlives a reload. Only the seed it was built from and
// the answers given so far are stored; the lesson itself is rebuilt from them,
// so nothing of the catalog is duplicated into storage.
const lessonSessionKey = 'aytim.lesson.v1';

function rememberLesson() {
  if (run?.kind !== 'lesson' || !run.unit || run.seed === undefined) return;
  try {
    tabStorage.setItem(lessonSessionKey, JSON.stringify({
      pair: pairKey(state.base, state.target), unitId: run.unit.id,
      seed: run.seed, fromPath: Boolean(run.fromPath), answers: run.answers
    }));
  } catch { /* Without storage the lesson simply does not survive a reload. */ }
}

function forgetLesson() {
  try { tabStorage.removeItem(lessonSessionKey); } catch { /* Nothing was stored. */ }
}

// Replays the stored answers over a freshly built lesson, inserting the same
// recovery cards the wrong answers produced. Anything that no longer lines up
// (a changed catalog, another language pair) is discarded rather than guessed.
function restoreLesson() {
  let saved;
  try { saved = JSON.parse(tabStorage.getItem(lessonSessionKey) ?? 'null'); } catch { return null; }
  if (!saved || saved.pair !== pairKey(state.base, state.target) || !Array.isArray(saved.answers)) return null;
  const unit = units.find(candidate => candidate.id === saved.unitId);
  if (!unit || !lessonUnlocked(course(), unit) || !Number.isSafeInteger(saved.seed)) return null;
  const questions = buildLessonActivities(unit, course(), state.base, state.target, seededRandom(saved.seed));
  const answers = [];
  let recoveries = 0;
  for (const answer of saved.answers) {
    const question = questions[answers.length];
    const entry = question && (question.studyEntry ?? question.entry);
    if (!entry || entry.id !== answer?.id) return null;
    answers.push(answer);
    if (question.core && !answer.correct && recoveries < 2) {
      questions.splice(answers.length, 0, recoveryActivity(question));
      recoveries++;
    }
  }
  if (!answers.length || answers.length >= questions.length) return null;
  return { kind: 'lesson', unit, fromPath: saved.fromPath, seed: saved.seed, questions,
    index: answers.length, answers, recoveries };
}

function startStudy(id, fromPath = false) {
  const unit = units.find(candidate => candidate.id === id);
  if (!unit || !lessonUnlocked(course(), unit)) return;
  const seed = Math.floor(Math.random() * 2 ** 31);
  forgetLesson();
  go('quiz', {
    kind: 'lesson', unit, fromPath, seed,
    questions: buildLessonActivities(unit, course(), state.base, state.target, seededRandom(seed)),
    index: 0, answers: [], recoveries: 0
  });
}

function startPlacement() {
  forgetLesson();
  go('quiz', { kind: 'check', questions: placementQuestions(state.base, state.target), index: 0, answers: [] });
}


function startMode(mode) {
  if (!modes[mode]) return;
  if (mode === 'match') {
    const round = matchRound(course());
    go('match', { ...round, kind: 'practice', mode, total: round.baseCards.length, matched: new Set(), missed: new Set() });
    return;
  }
  const questions = mode === 'reply'
    ? replyQuestions(course(), state.base, state.target)
    : practiceQuestions(mode, course(), state.base, state.target);
  if (!questions.length) return;
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
  'delete-account': () => { deleteWarning = true; go('settings'); },
  'cancel-delete': () => { deleteWarning = false; go('settings'); },
  'delete-account-confirm': () => accountAction(async () => {
    const keys = accountKeys(authClient.user);
    await authClient.remove();
    // The account is gone from the server; its cache on this device goes too.
    try { for (const key of Object.values(keys)) browserStorage.removeItem(key); }
    catch { storageAvailable = false; }
    deleteWarning = false;
    await bootstrapAccount({ user: null });
    broadcastAccountChange();
  }),
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
  'skill-record-toggle': toggleSkillRecording,
  'word-bank-add': control => moveWordBankTile(control.dataset.id, true),
  'word-bank-remove': control => moveWordBankTile(control.dataset.id, false),
  'word-bank-clear': clearWordBank,
  'word-bank-check': checkWordBank,
  'open-story': control => openStory(control.dataset.id),
  'toggle-translations': toggleTranslations,
  'start-reading-quiz': startReadingQuiz,
  'lesson-reveal': lessonReveal,
  'lesson-audio': lessonAudio,
  'lesson-speech-check': startLessonRecognition,
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
  'toggle-story': control => {
    const story = main.querySelector('#story-reference');
    if (!story) return;
    story.hidden = !story.hidden;
    control.setAttribute('aria-expanded', String(!story.hidden));
  },
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
  'start-check': startPlacement,
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
  } else if (id === 'speaker-form') {
    state.speaker = applySpeakerForms(value);
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
  const saved = loadAccountProgress(browserStorage, data, startingPair);
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

// Render the last verified account's local copy (or the guest copy) at once. The sign-in check below only
// decides how it syncs; a failed or unreachable check is not a sign-out.
authClient = new TelegramAuth({ storage: tabStorage, initData: miniAppData(window.location, undefined, window) });
authClient.user = rememberedAccount(browserStorage, authClient.isMiniApp ? launchUserId(authClient.initData) : undefined);
const shown = authClient.user;
let opened = openAccount({ user: shown });
const webApp = await telegramWebApp();
webApp?.ready();
connectTelegramBack(webApp);
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
    const saved = loadAccountProgress(browserStorage, data, startingPair);
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
// A lesson interrupted by a reload picks up where it left off.
if (!run && page === 'home') {
  const resumed = restoreLesson();
  if (resumed) go('quiz', resumed);
}
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
