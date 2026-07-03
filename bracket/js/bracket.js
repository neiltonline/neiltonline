/**
 * Circular bracket SVG renderer using polar coordinates.
 */

import {
  createTeamMap,
  getEliminatedTeams,
  getMatchesByRound,
} from './data.js';

const CX = 500;
const CY = 500;
const NODE_SIZE = 28;
const RADII = [380, 310, 240, 170, 100];

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
      <feGaussianBlur stdDeviation="3" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    `;
    defs.appendChild(glow);

    const clipCircle = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
    clipCircle.setAttribute('id', 'flag-clip');
    const clipRect = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    clipRect.setAttribute('r', NODE_SIZE / 2);
    clipCircle.appendChild(clipRect);
    defs.appendChild(clipCircle);

    this.svg.appendChild(defs);
    this.layers = {
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

  polarToCartesian(radius, angleDeg) {
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    return {
      x: CX + radius * Math.cos(rad),
      y: CY + radius * Math.sin(rad),
    };
  }

  angleForSlot(slot, total) {
    const step = 360 / total;
    return slot * step + step / 2;
  }

  render(tournament) {
    this.teamMap = createTeamMap(tournament.teams);
    this.matches = tournament.matches;
    this._clearLayers();
    this._drawRings();
    this._drawConnectors();
    this._drawNodes();
    this._drawCenter(tournament);
  }

  _clearLayers() {
    Object.values(this.layers).forEach((layer) => {
      layer.innerHTML = '';
    });
  }

  _drawRings() {
    RADII.forEach((r, i) => {
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', CX);
      circle.setAttribute('cy', CY);
      circle.setAttribute('r', r);
      circle.setAttribute('fill', 'none');
      circle.setAttribute('stroke', '#2a2a2a');
      circle.setAttribute('stroke-width', '1');
      circle.setAttribute('opacity', '0.7');
      this.layers.rings.appendChild(circle);
    });
  }

  _getMatchByRoundSlot(round, slot) {
    return this.matches.find((m) => m.round === round && m.slot === slot);
  }

  _drawConnectors() {
    const eliminated = getEliminatedTeams(this.matches, this.teamMap);
    const byRound = getMatchesByRound(this.matches);

    for (let round = 0; round < RADII.length - 1; round++) {
      const matches = byRound[round] || [];
      const nextMatches = byRound[round + 1] || [];
      const childRadius = RADII[round];
      const parentRadius = RADII[round + 1];

      if (round === 0) {
        matches.forEach((match, slot) => {
          const parentSlot = Math.floor(slot / 2);
          const parentAngle = this.angleForSlot(parentSlot, nextMatches.length);
          const parent = this.polarToCartesian(parentRadius, parentAngle);
          const childAngles = [
            this.angleForSlot(slot * 2, 32),
            this.angleForSlot(slot * 2 + 1, 32),
          ];

          childAngles.forEach((angle, childIdx) => {
            const teamId = childIdx === 0 ? match.home : match.away;
            this._drawConnectorPath(
              childRadius, angle, parentRadius, parentAngle,
              match, teamId, eliminated
            );
          });
        });
      } else {
        for (let slot = 0; slot < matches.length; slot += 2) {
          const parentSlot = slot / 2;
          const parentAngle = this.angleForSlot(parentSlot, nextMatches.length);
          const parent = this.polarToCartesian(parentRadius, parentAngle);
          const childAngles = [
            this.angleForSlot(slot, matches.length),
            this.angleForSlot(slot + 1, matches.length),
          ];

          childAngles.forEach((angle, childIdx) => {
            const feederMatch = matches[slot + childIdx];
            const teamId = feederMatch?.winner || feederMatch?.home || feederMatch?.away;
            this._drawConnectorPath(
              childRadius, angle, parentRadius, parentAngle,
              feederMatch, teamId, eliminated
            );
          });
        }
      }
    }
  }

  _drawConnectorPath(childR, childAngle, parentR, parentAngle, match, teamId, eliminated) {
    if (!match) return;
    const child = this.polarToCartesian(childR, childAngle);
    const parent = this.polarToCartesian(parentR, parentAngle);
    const isWinnerPath = match.winner && teamId === match.winner;
    const isLive = match.status === 'live' && teamId;
    const isEliminated = teamId && eliminated.has(teamId);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const midR = (childR + parentR) / 2;
    const midAngle = (childAngle + parentAngle) / 2;
    const mid = this.polarToCartesian(midR, midAngle);
    path.setAttribute('d', `M ${child.x} ${child.y} Q ${mid.x} ${mid.y} ${parent.x} ${parent.y}`);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', isWinnerPath ? '2.5' : '1');
    path.setAttribute(
      'stroke',
      isWinnerPath ? '#5b3fe3' : isLive ? '#e8c547' : isEliminated ? '#2a2a2a' : '#3d3d3d'
    );
    path.setAttribute('opacity', isEliminated ? '0.25' : '0.85');
    if (isWinnerPath) path.setAttribute('filter', 'url(#glow)');
    this.layers.connectors.appendChild(path);
  }

  _drawNodes() {
    const eliminated = getEliminatedTeams(this.matches, this.teamMap);
    const byRound = getMatchesByRound(this.matches);

    const r32 = byRound[0] || [];
    r32.forEach((match, slot) => {
      [match.home, match.away].forEach((teamId, idx) => {
        const angle = this.angleForSlot(slot * 2 + idx, 32);
        this._drawTeamNode(teamId, RADII[0], angle, match, eliminated);
      });
    });

    for (let round = 1; round < RADII.length; round++) {
      const matches = byRound[round] || [];
      const isFinal = round === 4;

      matches.forEach((match, slot) => {
        if (isFinal) {
          [match.home, match.away].forEach((teamId, idx) => {
            if (!teamId) {
              this._drawPlaceholder(RADII[round], this.angleForSlot(idx, 2), match);
              return;
            }
            const angle = this.angleForSlot(idx, 2);
            this._drawTeamNode(teamId, RADII[round], angle, match, eliminated);
          });
        } else {
          const teamId = match.winner || match.home || match.away;
          const angle = this.angleForSlot(slot, matches.length);
          if (!teamId) {
            this._drawPlaceholder(RADII[round], angle, match);
          } else {
            this._drawTeamNode(teamId, RADII[round], angle, match, eliminated);
          }
        }
      });
    }
  }

  _drawPlaceholder(radius, angle, match) {
    const pos = this.polarToCartesian(radius, angle);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_SIZE / 2);
    circle.setAttribute('fill', '#111');
    circle.setAttribute('stroke', '#2a2a2a');
    circle.setAttribute('stroke-width', '1');
    circle.setAttribute('stroke-dasharray', '3 3');
    g.appendChild(circle);

    g.addEventListener('click', () => {
      this.selectedMatchId = match.id;
      this.onMatchSelect(match);
      this.render({ teams: Object.values(this.teamMap), matches: this.matches });
    });

    this.layers.nodes.appendChild(g);
  }

  _drawTeamNode(teamId, radius, angle, match, eliminated) {
    const pos = this.polarToCartesian(radius, angle);
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);
    g.style.cursor = 'pointer';

    const team = this.teamMap[teamId];
    const isEliminated = eliminated.has(teamId);
    const isLive = match.status === 'live';
    const isSelected = this.selectedMatchId === match.id;
    const isWinner = match.winner === teamId;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('r', NODE_SIZE / 2);
    circle.setAttribute('fill', '#111');
    circle.setAttribute(
      'stroke',
      isSelected ? '#fff' : isWinner ? '#5b3fe3' : isLive ? '#e8c547' : '#444'
    );
    circle.setAttribute('stroke-width', isSelected || isWinner ? '2.5' : '1.5');
    if (isEliminated) circle.setAttribute('opacity', '0.35');
    g.appendChild(circle);

    const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
    flag.setAttribute('href', `https://flagcdn.com/w80/${team.code}.png`);
    flag.setAttribute('x', -NODE_SIZE / 2);
    flag.setAttribute('y', -NODE_SIZE / 2);
    flag.setAttribute('width', NODE_SIZE);
    flag.setAttribute('height', NODE_SIZE);
    flag.setAttribute('clip-path', 'url(#flag-clip)');
    if (isEliminated) flag.setAttribute('opacity', '0.35');
    g.appendChild(flag);

    g.addEventListener('click', () => {
      this.selectedMatchId = match.id;
      this.onMatchSelect(match);
      this.render({ teams: Object.values(this.teamMap), matches: this.matches });
    });

    this.layers.nodes.appendChild(g);
  }

  _drawCenter(tournament) {
    const champion = this.matches.find((m) => m.round === 4)?.winner;
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('transform', `translate(${CX}, ${CY})`);

    const outer = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    outer.setAttribute('r', '48');
    outer.setAttribute('fill', '#0d0d0d');
    outer.setAttribute('stroke', champion ? '#5b3fe3' : '#333');
    outer.setAttribute('stroke-width', '2');
    g.appendChild(outer);

    if (champion) {
      const team = this.teamMap[champion];
      const flag = document.createElementNS('http://www.w3.org/2000/svg', 'image');
      flag.setAttribute('href', `https://flagcdn.com/w160/${team.code}.png`);
      flag.setAttribute('x', '-32');
      flag.setAttribute('y', '-32');
      flag.setAttribute('width', '64');
      flag.setAttribute('height', '64');
      flag.setAttribute('clip-path', 'url(#flag-clip)');
      g.appendChild(flag);
    } else {
      const trophy = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      trophy.setAttribute('text-anchor', 'middle');
      trophy.setAttribute('dominant-baseline', 'central');
      trophy.setAttribute('font-size', '36');
      trophy.textContent = '🏆';
      g.appendChild(trophy);
    }

    const title = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    title.setAttribute('y', '68');
    title.setAttribute('text-anchor', 'middle');
    title.setAttribute('fill', '#888');
    title.setAttribute('font-size', '11');
    title.setAttribute('font-family', 'Syne, sans-serif');
    title.textContent = champion ? this.teamMap[champion].name : tournament.name;
    g.appendChild(title);

    this.layers.center.appendChild(g);
  }
}
