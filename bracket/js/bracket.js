/**
 * Circular bracket SVG renderer — 32/16/8/4/2 ring structure.
 */

import {
  RING_COUNTS,
  createTeamMap,
  getEliminatedTeams,
  resolveRingNode,
  isConnectorActive,
  getChampion,
} from './data.js';
import {
  CX,
  CY,
  NODE_SIZE,
  RADII,
  ringAngle,
  polarToCartesian,
  bracketPath,
} from './layout.js';

export class CircularBracket {
  constructor(svgEl, options = {}) {
    this.svg = svgEl;
    this.onMatchSelect = options.onMatchSelect || (() => {});
    this.teamMap = {};
    this.matches = [];
    this.selectedMatchId = null;
    this._buildDefs();
  }

  _buildDefs() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');

    const glow = document.createElementNS('http://www.w3.org/2000/svg', 'filter');
    glow.setAttribute('id', 'glow');
    glow.innerHTML = `
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    `;
    defs.appendChild(glow);

    const clip = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clip.setAttribute('id', 'flag-clip');
    const c = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    c.setAttribute('r', NODE_SIZE / 2);
    clip.appendChild(c);
    defs.appendChild(clip);

    this.svg.appendChild(defs);
    this.layers = {
      guides: this._group('guides'),
      rings: this._group('rings'),
      connectors: this._group('connectors'),
      nodes: this._group('nodes'),
      center: this._group('center'),
    };
  }

  _group(id) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('id', id);
    this.svg.appendChild(g);
    return g;
  }

  render(tournament) {
    this.teamMap = createTeamMap(tournament.teams);
    this.matches = tournament.matches;
    this._clearLayers();
    this._drawGuides();
    this._drawRings();
    this._drawConnectors();
    this._drawAllNodes();
    this._drawCenter(tournament);
  }

  _clearLayers() {
    Object.values(this.layers).forEach((l) => { l.innerHTML = ''; });
  }

  _drawGuides() {
    [0, 90, 180, 270].forEach((deg) => {
      const outer = polarToCartesian(RADII[0] + 18, deg);
      const inner = polarToCartesian(RADII[4] - 36, deg);
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', outer.x);
      line.setAttribute('y1', outer.y);
      line.setAttribute('x2', inner.x);
      line.setAttribute('y2', inner.y);
      line.setAttribute('stroke', '#1a1a1a');
      line.setAttribute('stroke-width', '1');
      this.layers.guides.appendChild(line);
    });
  }

  _drawRings() {
    RADII.forEach((r) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', CX);
      circle.setAttribute('cy', CY);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#222');
      circle.setAttribute('stroke-width', '1');
      this.layers.rings.appendChild(circle);
    });
  }

  _drawConnectors() {
    const eliminated = getEliminatedTeams(this.matches);

    for (let ring = 0; ring < RING_COUNTS.length - 1; ring++) {
      const parentCount = RING_COUNTS[ring + 1];

      for (let parentSlot = 0; parentSlot < parentCount; parentSlot++) {
        const childA = parentSlot * 2;
        const childB = parentSlot * 2 + 1;

        [childA, childB].forEach((childSlot) => {
          const active = isConnectorActive(ring, childSlot, this.matches, eliminated);
          const { match } = resolveRingNode(ring, childSlot, this.matches);
          const isLive = match?.status === 'live';

          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', bracketPath(ring, childSlot, ring + 1, parentSlot));
          path.setAttribute('fill', 'none');
          path.setAttribute('stroke-width', active ? '2' : '1');
          path.setAttribute(
            'stroke',
            active ? '#ffffff' : isLive ? '#c9a227' : '#2e2e2e'
          );
          path.setAttribute('opacity', active ? '1' : '0.55');
          if (active) path.setAttribute('filter', 'url(#glow)');
          this.layers.connectors.appendChild(path);
        });
      }
    }

    for (let slot = 0; slot < 2; slot++) {
      const { teamId } = resolveRingNode(4, slot, this.matches);
      if (!teamId) continue;
      const child = polarToCartesian(RADII[4], ringAngle(4, slot));
      const champion = getChampion(this.matches);
      const active = champion === teamId;
      const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      path.setAttribute('x1', child.x);
      path.setAttribute('y1', child.y);
      path.setAttribute('x2', CX);
      path.setAttribute('y2', CY);
      path.setAttribute('stroke', active ? '#ffffff' : '#2e2e2e');
      path.setAttribute('stroke-width', active ? '2' : '1');
      path.setAttribute('opacity', active ? '1' : '0.45');
      if (active) path.setAttribute('filter', 'url(#glow)');
      this.layers.connectors.appendChild(path);
    }
  }

  _drawAllNodes() {
    const eliminated = getEliminatedTeams(this.matches);

    for (let ring = 0; ring < RING_COUNTS.length; ring++) {
      const count = RING_COUNTS[ring];
      for (let slot = 0; slot < count; slot++) {
        const resolved = resolveRingNode(ring, slot, this.matches);
        const pos = polarToCartesian(RADII[ring], ringAngle(ring, slot));

        if (!resolved.teamId) {
          this._drawPlaceholder(pos, resolved.match, ring, slot);
        } else {
          this._drawTeamNode(pos, resolved, eliminated, ring);
        }
      }
    }
  }

  _drawPlaceholder(pos, match, ring, slot) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_SIZE / 2 - 1);
    circle.setAttribute('fill', '#0a0a0a');
    circle.setAttribute('stroke', '#2a2a2a');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('stroke-dasharray', '2 3');
    g.appendChild(circle);

    if (match) {
      g.style.cursor = 'pointer';
      g.addEventListener('click', () => this._select(match));
    }

    this.layers.nodes.appendChild(g);
  }

  _drawTeamNode(pos, resolved, eliminated, ring) {
    const { teamId, match } = resolved;
    const team = this.teamMap[teamId];
    if (!team) return;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    g.style.cursor = 'pointer';

    const isEliminated = eliminated.has(teamId);
    const isLive = match?.status === 'live' &&
      (match.home === teamId || match.away === teamId);
    const isWinner = match?.winner === teamId;
    const isSelected = match && this.selectedMatchId === match.id;
    const isChampion = getChampion(this.matches) === teamId;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_SIZE / 2);
    circle.setAttribute('fill', '#141414');
    circle.setAttribute(
      'stroke',
      isSelected ? '#fff'
        : isChampion ? '#5b3fe3'
          : isWinner ? '#fff'
            : isLive ? '#c9a227'
              : '#3a3a3a'
    );
    circle.setAttribute('stroke-width', isSelected || isChampion ? '2.5' : '1.5');
    if (isEliminated) circle.setAttribute('opacity', '0.3');
    g.appendChild(circle);

    const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    flag.setAttribute('href', `https://flagcdn.com/w80/${team.code}.png`);
    flag.setAttribute('x', -NODE_SIZE / 2);
    flag.setAttribute('y', -NODE_SIZE / 2);
    flag.setAttribute('width', NODE_SIZE);
    flag.setAttribute('height', NODE_SIZE);
    flag.setAttribute('clip-path', 'url(#flag-clip)');
    if (isEliminated) flag.setAttribute('opacity', '0.25');
    g.appendChild(flag);

    g.addEventListener('click', () => {
      if (match) this._select(match);
    });

    this.layers.nodes.appendChild(g);
  }

  _select(match) {
    this.selectedMatchId = match.id;
    this.onMatchSelect(match);
    this.render({ teams: Object.values(this.teamMap), matches: this.matches });
  }

  _drawCenter(tournament) {
    const champion = getChampion(this.matches);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${CX}, ${CY})`);

    const ring = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    ring.setAttribute('r', '54');
    ring.setAttribute('fill', '#080808');
    ring.setAttribute('stroke', champion ? '#5b3fe3' : '#2a2a2a');
    ring.setAttribute('stroke-width', '2');
    g.appendChild(ring);

    const inner = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    inner.setAttribute('r', '46');
    inner.setAttribute('fill', '#0d0d0d');
    inner.setAttribute('stroke', '#1a1a1a');
    inner.setAttribute('stroke-width', '1');
    g.appendChild(inner);

    if (champion) {
      const team = this.teamMap[champion];
      const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      flag.setAttribute('href', `https://flagcdn.com/w160/${team.code}.png`);
      flag.setAttribute('x', '-30');
      flag.setAttribute('y', '-30');
      flag.setAttribute('width', '60');
      flag.setAttribute('height', '60');
      flag.setAttribute('clip-path', 'url(#flag-clip)');
      g.appendChild(flag);
    } else {
      const trophy = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      trophy.setAttribute('text-anchor', 'middle');
      trophy.setAttribute('dominant-baseline', 'central');
      trophy.setAttribute('font-size', '32');
      trophy.textContent = '🏆';
      g.appendChild(trophy);
    }

    this.layers.center.appendChild(g);
  }
}
