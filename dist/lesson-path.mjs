// CSS places stops in a winding grid while DOM and keyboard order stay linear.
export function stopPosition(index, columns = 4) {
  const row = Math.floor(index / columns);
  const offset = index % columns;
  return { row: row + 1, column: row % 2 ? columns - offset : offset + 1 };
}

export function connectorPath(from, to, width, columns) {
  const start = `M ${from.x} ${from.y}`;
  if (columns === 1 || Math.abs(from.y - to.y) < 1) return `${start} L ${to.x} ${to.y}`;

  // Keep the turn outside the labels. Physical coordinates automatically follow
  // both LTR and RTL layouts, including turns at either end of later rows.
  const side = from.x > width / 2 ? 1 : -1;
  const edge = side === 1 ? width - 4 : 4;
  const radius = Math.min(24, (to.y - from.y) / 2, Math.abs(edge - from.x) / 2);
  const corner = edge - side * radius;
  return `${start} H ${corner} Q ${edge} ${from.y} ${edge} ${from.y + radius}`
    + ` V ${to.y - radius} Q ${edge} ${to.y} ${corner} ${to.y} H ${to.x}`;
}

export function connectLessonPaths(root) {
  const paths = [...root.querySelectorAll('[data-lesson-path]')];
  if (!paths.length) return () => {};
  const view = root.ownerDocument.defaultView;

  function draw(path) {
    const bounds = path.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return; // A collapsed level has no layout yet.
    const route = path.querySelector('.path-stops');
    const svg = path.querySelector('.path-connections');
    const columns = Number(view.getComputedStyle(route).getPropertyValue('--path-columns'));
    const points = [...route.querySelectorAll('.path-stop')].map(button => {
      const dot = button.querySelector('.path-stop-dot').getBoundingClientRect();
      return { x: dot.left - bounds.left + dot.width / 2, y: dot.top - bounds.top + dot.height / 2,
        complete: button.classList.contains('is-complete') };
    });
    svg.setAttribute('viewBox', `0 0 ${bounds.width} ${bounds.height}`);
    const segments = points.slice(0, -1).map((point, index) => {
      const next = points[index + 1];
      const segment = root.ownerDocument.createElementNS('http://www.w3.org/2000/svg', 'path');
      segment.setAttribute('d', connectorPath(point, next, bounds.width, columns));
      if (point.complete && next.complete) segment.setAttribute('class', 'is-complete');
      return segment;
    });
    svg.replaceChildren(...segments);
  }

  paths.forEach(draw);
  const observer = new view.ResizeObserver(entries => entries.forEach(entry => draw(entry.target)));
  paths.forEach(path => observer.observe(path));
  return () => observer.disconnect();
}
