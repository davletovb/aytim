// Gesture thresholds and touch handling adapted from NineStride.
const decisionDistance = 6;
const directionRatio = 1.5;
const reversalDistance = 10;
const velocityWindow = 90;
const ignored = 'input, textarea, select, audio, video, [role="slider"], [contenteditable]:not([contenteditable="false"]), [data-no-swipe-back]';

function suppressTouchClick() {
  const cleanup = () => {
    clearTimeout(timer);
    document.removeEventListener('click', click, true);
    document.removeEventListener('pointerdown', cleanup, true);
  };
  const click = event => {
    if (!event.detail) return;
    event.preventDefault();
    event.stopPropagation();
    cleanup();
  };
  const timer = window.setTimeout(cleanup, 500);
  document.addEventListener('click', click, true);
  document.addEventListener('pointerdown', cleanup, true);
}

export function connectSwipeBack(surface, { canGoBack, goBack }) {
  let drag = null;
  let frame = 0;
  let animation;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const transform = travel => `translate3d(${travel}px, 0, 0)`;
  const distance = touch => Math.max(0, touch.clientX - drag.x - decisionDistance);
  const heldTouch = event => Array.from(event.changedTouches).find(touch => touch.identifier === drag?.id);

  function reset() {
    drag = null;
    cancelAnimationFrame(frame);
    frame = 0;
    animation?.cancel();
    animation = undefined;
    surface.style.removeProperty('transform');
  }

  function settle(commit = false) {
    if (drag.claimed && drag.peak >= 8) suppressTouchClick();
    const travel = drag.travel;
    reset();
    if (commit) goBack();
    else if (travel >= 1 && !reducedMotion.matches && surface.animate) {
      animation = surface.animate([{ transform: transform(travel) }, { transform: transform(0) }], {
        duration: 150, easing: 'ease-out'
      });
    }
  }

  surface.addEventListener('touchstart', event => {
    if (event.touches.length !== 1) {
      if (drag) settle();
      return;
    }
    reset();
    if (!canGoBack() || !(event.target instanceof Element) || event.target.closest(ignored)) return;
    const touch = event.changedTouches[0];
    drag = {
      id: touch.identifier, x: touch.clientX, y: touch.clientY,
      width: Math.min(surface.clientWidth, window.innerWidth), claimed: false, peak: 0, travel: 0,
      samples: [{ x: touch.clientX, time: event.timeStamp }]
    };
  }, { passive: true });

  surface.addEventListener('touchmove', event => {
    const touch = heldTouch(event);
    if (!touch) return;
    if (event.touches.length !== 1 || !canGoBack()) { settle(); return; }
    if (!drag.claimed) {
      const dx = touch.clientX - drag.x;
      const dy = Math.abs(touch.clientY - drag.y);
      if (!event.cancelable || dx <= -decisionDistance || (dy >= decisionDistance && dy >= dx)) {
        reset();
        return;
      }
      if (dx < decisionDistance || dx < dy * directionRatio) return;
      drag.claimed = true;
    }
    // Canceling a claimed touchmove keeps the WebView from taking over the drag.
    if (event.cancelable) event.preventDefault();
    drag.samples.push({ x: touch.clientX, time: event.timeStamp });
    while (drag.samples.length > 2 && event.timeStamp - drag.samples[0].time > velocityWindow) drag.samples.shift();
    const dx = distance(touch);
    drag.peak = Math.max(drag.peak, dx);
    const softCap = drag.width * 0.6;
    drag.travel = dx <= softCap ? dx : Math.min(drag.width, softCap + (dx - softCap) * 0.35);
    if (!frame && !reducedMotion.matches) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        surface.style.transform = transform(drag.travel);
      });
    }
  }, { passive: false });

  surface.addEventListener('touchend', event => {
    const touch = heldTouch(event);
    if (!touch) return;
    if (!drag.claimed || event.touches.length) { settle(); return; }
    const dx = distance(touch);
    const sample = drag.samples.find(sample => event.timeStamp - sample.time <= velocityWindow);
    const elapsed = sample ? event.timeStamp - sample.time : 0;
    const velocity = elapsed > 0 ? (touch.clientX - sample.x) / elapsed : 0;
    const farEnough = dx >= drag.width * 0.17;
    const flick = dx >= 44 && velocity >= 0.25;
    const commit = drag.width > 0 && dx > 0 && drag.peak - dx < reversalDistance && (farEnough || flick);
    settle(commit && canGoBack());
  });

  surface.addEventListener('touchcancel', event => { if (heldTouch(event)) settle(); });
  window.addEventListener('blur', reset);
  window.addEventListener('resize', reset);
  document.addEventListener('visibilitychange', () => { if (document.hidden) reset(); });
  return reset;
}
