/**
 * Tournament data model and bracket logic.
 */

export const RING_COUNTS = [32, 16, 8, 4, 2];

const ROUND_LABELS = ['32 avos', 'Oitavas', 'Quartas', 'Semifinal', 'Final'];

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

export function getMatch(matches, round, slot) {
  return matches.find((m) => m.round === round && m.slot === slot) || null;
}

/**
 * Resolve which team (if any) occupies a visual ring slot.
 * Ring 0 = 32 initial teams | Ring 1–4 = advancing teams per knockout stage.
 */
export function resolveRingNode(ring, slot, matches) {
  if (ring === 0) {
    const matchSlot = Math.floor(slot / 2);
    const match = getMatch(matches, 0, matchSlot);
    if (!match) return { teamId: null, match: null, side: null };
    const side = slot % 2 === 0 ? 'home' : 'away';
    return { teamId: match[side], match, side };
  }

  const feederRound = ring - 1;
  const feederMatch = getMatch(matches, feederRound, slot);
  if (!feederMatch) return { teamId: null, match: null, side: null };

  const teamId = feederMatch.winner || null;
  const upcomingMatch = getMatch(matches, ring, Math.floor(slot / 2));

  return {
    teamId,
    match: upcomingMatch || feederMatch,
    feederMatch,
    side: null,
  };
}

export function getEliminatedTeams(matches) {
  const eliminated = new Set();
  for (const match of matches) {
    if (match.status !== 'finished' || !match.winner) continue;
    const loser = match.home === match.winner ? match.away : match.home;
    if (loser) eliminated.add(loser);
  }
  return eliminated;
}

export function isConnectorActive(ring, childSlot, matches, eliminated) {
  const { teamId, match, side } = resolveRingNode(ring, childSlot, matches);
  if (!teamId) return false;
  if (eliminated.has(teamId)) return false;

  if (ring === 0 && match) {
    if (match.status === 'live') return true;
    if (match.winner === teamId) return true;
    return false;
  }

  const feederRound = ring - 1;
  const feeder = getMatch(matches, feederRound, childSlot);
  if (feeder?.winner === teamId) return true;
  if (feeder?.status === 'live') {
    return feeder.home === teamId || feeder.away === teamId;
  }
  return false;
}

export function propagateWinners(matches) {
  const byRound = getMatchesByRound(matches);
  const updated = matches.map((m) => ({ ...m }));

  for (let round = 0; round < 4; round++) {
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

      if (slot % 2 === 0) {
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
  return ROUND_LABELS[round] || `Rodada ${round + 1}`;
}

export function getChampion(matches) {
  return getMatch(matches, 4, 0)?.winner || null;
}

export function getFinalists(matches) {
  const sf = getMatchesByRound(matches)[3] || [];
  return sf.map((m) => m.winner).filter(Boolean);
}
