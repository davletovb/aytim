import { newCourse, pairKey, completed, validPair } from './engine.mjs';
import { accessibleLevel, path } from './journey.mjs';
import { stories } from './stories.mjs';

export const miniAppRouteParam = 'open';

export function miniAppRoute(value) {
  if (typeof value !== 'string') return null;
  if (['lesson', 'review', 'progress', 'stories'].includes(value)) return { page: value };
  const match = /^story:([a-z0-9-]{1,80})$/.exec(value ?? '');
  return match ? { page: 'story', id: match[1] } : null;
}

export function takeMiniAppRoute(location, history) {
  const url = new URL(location.href);
  const routes = url.searchParams.getAll(miniAppRouteParam);
  if (!routes.length) return null;
  url.searchParams.delete(miniAppRouteParam);
  try {
    history.replaceState(history.state, '', url.pathname + url.search + url.hash);
  } catch { /* An embedded view may restrict history changes. */ }
  return routes.length === 1 ? miniAppRoute(routes[0]) : null;
}

export function resolveMiniAppRoute(route, state) {
  if (!route || !validPair(state?.base, state?.target)) return null;
  const course = state.courses?.[pairKey(state.base, state.target)] ?? newCourse();
  const level = accessibleLevel(course);
  if (route.page === 'lesson') {
    // The first unfinished lesson in this level is the next unlocked lesson.
    const unit = path[level - 1].units.find(unit => !completed(unit, course));
    return unit ? { page: 'study', id: unit.id } : { page: 'home' };
  }
  if (route.page === 'story') {
    const story = stories.find(story => story.id === route.id && story.level <= level);
    return story ? route : { page: 'stories' };
  }
  return route;
}
