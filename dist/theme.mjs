// Aytim has two looks. Calm, the original in styles.css, needs no attribute;
// Bright (bright.css) applies under <html data-theme="bright">. The choice is
// saved with progress, so it follows the learner to every signed-in device.
export const themes = ['calm', 'bright'];

// A copy of the choice kept outside the progress save. index.html reads it
// before anything is drawn, so a Bright learner never sees the calm colors
// flash while the app loads. The saved progress stays the source of truth.
export const themeHintKey = 'aytim.theme';

// The browser's own interface (address bar, task switcher) follows the page.
export const themeColors = {
  calm: { light: '#f6f7f1', dark: '#10211c' },
  bright: { light: '#ffffff', dark: '#0c1920' }
};

export const markFiles = { calm: './mark.svg', bright: './mark-bright.svg' };

export function themeOf(state) {
  return state?.theme === 'bright' ? 'bright' : 'calm';
}

// Applies a theme to the page: the attribute the stylesheets key on, the
// browser color, every logo marked data-mark, the favicon and the early hint.
// Without a storage argument it uses localStorage, looked up inside the guard
// below: where the browser blocks storage, merely reading it throws.
export function applyTheme(theme, doc = globalThis.document, storage) {
  const chosen = themes.includes(theme) ? theme : 'calm';
  const root = doc.documentElement;
  if (chosen === 'bright') root.setAttribute('data-theme', 'bright');
  else root.removeAttribute('data-theme');
  for (const meta of doc.querySelectorAll('meta[name="theme-color"]')) {
    const scheme = (meta.getAttribute('media') ?? '').includes('dark') ? 'dark' : 'light';
    meta.setAttribute('content', themeColors[chosen][scheme]);
  }
  for (const image of doc.querySelectorAll('img[data-mark]')) {
    if (image.getAttribute('src') !== markFiles[chosen]) image.setAttribute('src', markFiles[chosen]);
  }
  const favicon = doc.querySelector('link[rel="icon"]');
  if (favicon && favicon.getAttribute('href') !== markFiles[chosen]) favicon.setAttribute('href', markFiles[chosen]);
  try {
    const store = storage === undefined ? globalThis.localStorage : storage;
    if (chosen === 'bright') store?.setItem(themeHintKey, 'bright');
    else store?.removeItem(themeHintKey);
  } catch { /* Without storage, the next visit paints calm until the app loads. */ }
  return chosen;
}
