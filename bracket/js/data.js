/**
 * Tournament data model and bracket logic.
 */

const ROUND_LABELS = ['Oitavas', 'Oitavas de final', 'Quartas', 'Semifinal', 'Final'];

const ROUND_COUNTS = [16, 8, 4, 2, 1];

export function createTeamMap(teams) {
  return Object.fromEntries(teams.map((t) => [t.id, t]));
}

export function getMatchTeams(match, teamMap) {
  return {
    home: match.home ? teamMap[match.home] : null,
    away: match.away ? teamMap[match.away] : null,
  };
}

export function getMatchesByRound(matches) {
  const byRound = {};
  for (const match of matches) {
    if (!byRound[match.round]) byRound[match.round] = [];
    byRound[match.round].push(match);
  }
  for (const round of Object.keys(byRound)) {
    byRound[round].sort((a, b) => a.slot - b.slot);
  }
  return byRound;
}

export function getEliminatedTeams(matches, teamMap) {
  const eliminated = new Set();
  for (const match of matches) {
    if (match.status !== 'finished' || !match.winner) continue;
    const loser = match.home === match.winner ? match.away : match.home;
    if (loser) eliminated.add(loser);
  }
  return eliminated;
}

export function getActivePath(matches) {
  const active = new Set();
  for (const match of matches) {
    if (match.winner) active.add(match.winner);
    if (match.status === 'live') {
      if (match.home) active.add(match.home);
      if (match.away) active.add(match.away);
    }
  }
  return active;
}

/**
 * Propagate finished match winners into the next round slots.
 */
export function propagateWinners(matches) {
  const byRound = getMatchesByRound(matches);
  const updated = matches.map((m) => ({ ...m }));

  for (let round = 0; round < ROUND_COUNTS.length - 1; round++) {
    const current = byRound[round] || [];
    const next = byRound[round + 1] || [];

    for (let slot = 0; slot < current.length; slot++) {
      const match = current[slot];
      if (match.status !== 'finished' || !match.winner) continue;

      const nextSlot = Math.floor(slot / 2);
      const nextMatch = next[nextSlot];
      if (!nextMatch) continue;

      const idx = updated.findIndex((m) => m.id === nextMatch.id);
      if (idx === -1) continue;

      const isHomeSlot = slot % 2 === 0;
      if (isHomeSlot) {
        updated[idx].home = match.winner;
      } else {
        updated[idx].away = match.winner;
      }
    }
  }

  return updated;
}

export function getLiveMatches(matches) {
  return matches.filter((m) => m.status === 'live');
}

export function formatScore(match) {
  if (!match.home && !match.away) return '—';
  return `${match.homeScore} – ${match.awayScore}`;
}

export function getRoundLabel(round) {
  const labels = ['32 avos', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];
  return labels[round] || `Rodada ${round + 1}`;
}
