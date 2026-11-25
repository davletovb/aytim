import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { applyTheme, markFiles, themeColors, themeHintKey, themeOf, themes } from '../dist/theme.mjs';
import { keepStoredSettings, validateState } from '../dist/progress-data.mjs';
import { mergeProgress } from '../dist/progress-merge.mjs';
import { codes } from '../dist/content.mjs';
import { copy } from '../dist/copy.mjs';

const root = new URL('../dist/', import.meta.url);
const read = name => readFileSync(new URL(name, root), 'utf8');
const css = read('bright.css');
const scope = ':root[data-theme="bright"]';
const fresh = (extra = {}) => ({ base: 'uz', target: 'en', transliterate: true, courses: {}, ...extra });

test('the theme choice is saved with progress and nothing else is accepted', () => {
  assert.equal(validateState(fresh({ theme: 'bright' })).theme, 'bright');
  assert.equal(validateState(fresh({ theme: 'calm' })).theme, 'calm');
  assert.equal('theme' in validateState(fresh()), false, 'no choice keeps the calm default');
  for (const theme of ['neon', '', 1, null, true]) assert.throws(() => validateState(fresh({ theme })), String(theme));
  assert.equal(themeOf(fresh()), 'calm');
  assert.equal(themeOf(fresh({ theme: 'bright' })), 'bright');
  assert.equal(themeOf(undefined), 'calm');
});

test('a save without a theme, as an older release sends it, keeps the stored choice', () => {
  const old = validateState(fresh());
  assert.equal(keepStoredSettings(old, { theme: 'bright' }).theme, 'bright');
  assert.equal(keepStoredSettings(validateState(fresh({ theme: 'calm' })), { theme: 'bright' }).theme, 'calm', 'choosing Calm is a change');
  assert.equal('theme' in keepStoredSettings(old, null), false);
  assert.equal('theme' in keepStoredSettings(old, { theme: 'neon' }), false, 'a stored value is still checked');
});

test('a theme chosen on one device reaches the others, and switching back is not lost', () => {
  const base = validateState(fresh());
  assert.equal(mergeProgress(base, base, validateState(fresh({ theme: 'bright' }))).theme, 'bright');
  const bright = validateState(fresh({ theme: 'bright' }));
  assert.equal(mergeProgress(bright, validateState(fresh({ theme: 'calm' })), bright).theme, 'calm');
  // When both devices changed it since they last agreed, the device in use wins, as for other settings.
  assert.equal(mergeProgress(base, validateState(fresh({ theme: 'calm' })), bright).theme, 'calm');
});

function fakePage() {
  const element = attributes => ({
    attributes: { ...attributes },
    getAttribute(name) { return this.attributes[name] ?? null; },
    setAttribute(name, value) { this.attributes[name] = String(value); },
    removeAttribute(name) { delete this.attributes[name]; }
  });
  const html = element({});
  const metas = [
    element({ name: 'theme-color', media: '(prefers-color-scheme: light)', content: themeColors.calm.light }),
    element({ name: 'theme-color', media: '(prefers-color-scheme: dark)', content: themeColors.calm.dark })
  ];
  const logos = [element({ src: markFiles.calm, 'data-mark': '' }), element({ src: markFiles.calm, 'data-mark': '' })];
  const favicon = element({ rel: 'icon', href: markFiles.calm });
  const doc = {
    documentElement: html,
    querySelectorAll: selector => selector.startsWith('meta') ? metas : selector.startsWith('img') ? logos : [],
    querySelector: selector => selector.startsWith('link') ? favicon : null
  };
  const saved = new Map();
  const storage = { setItem: (key, value) => saved.set(key, value), removeItem: key => saved.delete(key) };
  return { doc, html, metas, logos, favicon, storage, saved };
}

test('applying a theme sets the page attribute, browser colors, logos, favicon and early hint', () => {
  const page = fakePage();
  assert.equal(applyTheme('bright', page.doc, page.storage), 'bright');
  assert.equal(page.html.getAttribute('data-theme'), 'bright');
  assert.deepEqual(page.metas.map(meta => meta.getAttribute('content')), [themeColors.bright.light, themeColors.bright.dark]);
  assert.ok(page.logos.every(logo => logo.getAttribute('src') === markFiles.bright));
  assert.equal(page.favicon.getAttribute('href'), markFiles.bright);
  assert.equal(page.saved.get(themeHintKey), 'bright');

  assert.equal(applyTheme('calm', page.doc, page.storage), 'calm');
  assert.equal(page.html.getAttribute('data-theme'), null);
  assert.deepEqual(page.metas.map(meta => meta.getAttribute('content')), [themeColors.calm.light, themeColors.calm.dark]);
  assert.ok(page.logos.every(logo => logo.getAttribute('src') === markFiles.calm));
  assert.equal(page.saved.has(themeHintKey), false);

  assert.equal(applyTheme('neon', page.doc, page.storage), 'calm', 'an unknown name falls back to calm');
  const blocked = { setItem() { throw new Error('blocked'); }, removeItem() { throw new Error('blocked'); } };
  assert.doesNotThrow(() => applyTheme('bright', page.doc, blocked));
});

test('a browser that blocks storage still gets its theme applied', () => {
  // Where storage is blocked, even reading localStorage throws, so the default lookup must be guarded.
  const page = fakePage();
  const original = Object.getOwnPropertyDescriptor(globalThis, 'localStorage');
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, get() { throw new Error('SecurityError'); } });
  try {
    assert.equal(applyTheme('bright', page.doc), 'bright');
    assert.equal(page.html.getAttribute('data-theme'), 'bright');
    assert.equal(applyTheme('calm', page.doc), 'calm');
  } finally {
    if (original) Object.defineProperty(globalThis, 'localStorage', original);
    else delete globalThis.localStorage;
  }
});

test('the page reads the same early hint and loads the Bright stylesheet and logo', () => {
  const html = read('index.html');
  assert.ok(html.includes(`localStorage.getItem('${themeHintKey}') === 'bright'`));
  assert.ok(html.includes('document.documentElement.dataset.theme = \'bright\''));
  assert.match(html, /<link rel="stylesheet" href="\.\/bright\.css(\?[^"]*)?">/);
  assert.ok(html.includes('<link rel="modulepreload" href="./theme.mjs">'));
  assert.match(html, /<img src="\.\/mark\.svg"[^>]*data-mark>/);
  for (const file of Object.values(markFiles)) assert.ok(existsSync(new URL(file, root)), file);
  const app = read('app.mjs');
  assert.ok(app.includes('applyTheme(themeOf(state))'), 'every render reapplies the saved theme');
  assert.ok(app.includes('data-action="set-theme"'), 'Settings offers the choice');
});

// Selectors outside @-rules, split at top-level commas (not those inside :is() or :not()).
function selectors(source) {
  const result = [];
  const plain = source.replace(/\/\*[\s\S]*?\*\//g, '');
  for (const [, prelude] of plain.matchAll(/([^{};]+)\{/g)) {
    const text = prelude.trim();
    if (text.startsWith('@')) continue;
    let depth = 0, start = 0;
    for (let index = 0; index <= text.length; index++) {
      const char = text[index];
      if (char === '(') depth++;
      else if (char === ')') depth--;
      else if ((char === ',' && depth === 0) || index === text.length) {
        result.push(text.slice(start, index).trim());
        start = index + 1;
      }
    }
  }
  return result;
}

test('every Bright rule applies only under the bright theme, without CSS nesting', () => {
  const list = selectors(css);
  assert.ok(list.length > 200, `${list.length} selectors`);
  for (const selector of list) assert.ok(selector.startsWith(scope), selector);
  assert.equal(/(^|[\s,{])&[\s.:#[]/.test(css), false, 'nesting needs newer browsers than the rest of the app');
});

test('the fonts Bright names are shipped with their license', () => {
  const fonts = [...css.matchAll(/url\(\.\/(fonts\/[^)]+\.woff2)\)/g)].map(([, file]) => file);
  assert.equal(fonts.length, 4);
  for (const file of fonts) assert.ok(existsSync(new URL(file, root)), file);
  assert.match(read('fonts/OFL.txt'), /SIL Open Font License/);
  assert.match(css, /font-family: "Nunito", ui-rounded/);
});

function tokens(block) {
  return Object.fromEntries([...block.matchAll(/(--[a-z-]+):\s*([^;]+);/g)].map(([, name, value]) => [name, value.trim()]));
}

function palette(scheme) {
  const light = tokens(css.slice(css.indexOf(`${scope} {`), css.indexOf('@media (prefers-color-scheme: dark)')));
  const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
  const dark = scheme === 'dark' ? tokens(css.slice(darkStart, css.indexOf('Components', darkStart))) : {};
  const all = { ...light, ...dark };
  const resolve = name => {
    const value = all[name];
    assert.ok(value, `${name} is defined`);
    const reference = value.match(/^var\((--[a-z-]+)\)$/);
    return reference ? resolve(reference[1]) : value;
  };
  return resolve;
}

function contrast(first, second) {
  const luminance = hex => {
    const [r, g, b] = hex.slice(1).match(/../g).map(part => parseInt(part, 16) / 255)
      .map(channel => channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  };
  const [light, dark] = [luminance(first), luminance(second)].sort((a, b) => b - a);
  return (light + 0.05) / (dark + 0.05);
}

const hues = ['green', 'blue', 'orange', 'purple', 'gold', 'red', 'pink', 'teal'];

for (const scheme of ['light', 'dark']) {
  test(`Bright text keeps WCAG AA contrast in ${scheme} mode`, () => {
    const color = palette(scheme);
    const pairs = [
      ['--ink', '--paper', 4.5], ['--ink', '--surface', 4.5], ['--muted', '--paper', 4.5], ['--muted', '--surface', 4.5],
      ['--accent-ink', '--paper', 4.5], ['--accent-ink', '--accent-soft', 4.5], ['--link', '--paper', 4.5],
      ['--select-ink', '--select-soft', 4.5], ['--correct-ink', '--correct-soft', 4.5], ['--wrong-ink', '--wrong-soft', 4.5],
      ['--checkpoint', '--checkpoint-soft', 4.5], ['--on-accent', '--accent', 4.5], ['--on-danger', '--danger', 4.5],
      // Display-size headings need 3:1, as does the focus ring.
      ['--display', '--paper', 3], ['--focus', '--paper', 3],
      // Icons on a saturated fill (skill chips, path stops, tiles, audio and microphone controls) use the
      // hue's deep shade; white measured 2.51:1 on blue and 2.00:1 on green.
      ['--gold-mark', '--gold', 4.5], ['--audio-on', '--audio', 4.5]
    ];
    for (const hue of hues) {
      pairs.push([`--${hue}-ink`, '--paper', 4.5], [`--${hue}-ink`, `--${hue}-soft`, 4.5]);
      // Question prompts sit on the soft tints, with muted readings beneath the text.
      pairs.push(['--muted', `--${hue}-soft`, 4.5], ['--ink', `--${hue}-soft`, 4.5]);
    }
    // Level banners and every icon on a fill use the hue's deep shade.
    for (const hue of ['green', 'blue', 'purple', 'orange', 'teal', 'pink', 'red']) pairs.push([`--${hue}-deep`, `--${hue}`, 4.5]);
    for (const [text, surface, minimum] of pairs) {
      const ratio = contrast(color(text), color(surface));
      assert.ok(ratio >= minimum, `${text} on ${surface}: ${ratio.toFixed(2)} < ${minimum}`);
    }
  });
}

function rules(source) {
  const plain = source.replace(/\/\*[\s\S]*?\*\//g, '');
  return [...plain.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(([, selector, body]) => ({ selector: selector.trim(), body }));
}

for (const scheme of ['light', 'dark']) {
  test(`every Bright rule that paints a fill keeps its own color legible on it in ${scheme} mode`, () => {
    const light = tokens(css.slice(css.indexOf(`${scope} {`), css.indexOf('@media (prefers-color-scheme: dark)')));
    const darkStart = css.indexOf('@media (prefers-color-scheme: dark)');
    const all = { ...light, ...(scheme === 'dark' ? tokens(css.slice(darkStart, css.indexOf('Components', darkStart))) : {}) };
    // Level colors are set per level on the path; the explicit pairs above cover them.
    const resolve = name => {
      const value = all[name];
      const reference = value?.match(/^var\((--[a-z-]+)\)$/);
      return reference ? resolve(reference[1]) : value ?? null;
    };
    let checked = 0;
    for (const { selector, body } of rules(css)) {
      // Inactive controls (locked lessons, disabled buttons) are exempt from WCAG contrast.
      if (selector.startsWith('@') || /is-locked|:disabled/.test(selector.replace(/:not\(:disabled\)/g, ''))) continue;
      const fill = body.match(/(?<![-\w])background(?:-color)?:\s*var\((--[a-z-]+)\)/)?.[1];
      const ink = body.match(/(?<![-\w])color:\s*var\((--[a-z-]+)\)/)?.[1];
      if (!fill || !ink || !resolve(fill) || !resolve(ink)) continue;
      const ratio = contrast(resolve(ink), resolve(fill));
      assert.ok(ratio >= 3, `${selector}: ${ink} on ${fill} is ${ratio.toFixed(2)}`);
      checked++;
    }
    assert.ok(checked > 25, `${checked} rules checked`);
  });
}

test('a pressed control keeps the strip it moved off as part of its hit area', () => {
  const press = rules(css).find(({ body }) => body.includes('transform: translateY(var(--lip))'));
  assert.ok(press, 'controls press into their lip');
  const extension = rules(css).find(({ selector }) => selector === `${press.selector}::after`);
  assert.ok(extension, 'every pressed control extends its hit area');
  assert.match(extension.body, /position: absolute/);
  assert.match(extension.body, /inset: calc\(-1 \* var\(--lip\)\) 0 0/);
});

test('only real feedback turns the question foot into a banner, and disabled buttons stay disabled', () => {
  const banners = selectors(css).filter(selector => selector.includes('.q-foot:has('));
  assert.ok(banners.length >= 4);
  for (const selector of banners) assert.match(selector, /:not\(:empty\)\)/, selector);
  const danger = rules(css).find(({ selector, body }) => selector.includes('.q-foot:has(') && body.includes('background: var(--danger)'));
  assert.match(danger.selector, /\.button\.primary:not\(:disabled\)$/);
});

test('the Appearance setting is written in every interface language', () => {
  for (const code of codes) {
    for (const key of ['appearance', 'appearanceLead', 'themeCalm', 'themeBright']) assert.ok(copy[code][key], `${code}.${key}`);
    assert.notEqual(copy[code].themeCalm, copy[code].themeBright, code);
  }
  assert.deepEqual(themes, ['calm', 'bright']);
});
