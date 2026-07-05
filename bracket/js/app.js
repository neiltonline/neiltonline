import { CircularBracket } from './bracket.js';
import { RealtimeTracker } from './realtime.js';
import {
  createTeamMap,
  formatScore,
  getLiveMatches,
  getRoundLabel,
} from './data.js';

const svg = document.getElementById('bracket-svg');
const bracket = new CircularBracket(svg, { onMatchSelect: showMatchDetail });

const els = {
  tournamentName: document.getElementById('tournament-name'),
  lastUpdate: document.getElementById('last-update'),
  liveCount: document.getElementById('live-count'),
  liveList: document.getElementById('live-list'),
  matchPanel: document.getElementById('match-panel'),
  matchRound: document.getElementById('match-round'),
  matchTeams: document.getElementById('match-teams'),
  matchScore: document.getElementById('match-score'),
  matchStatus: document.getElementById('match-status'),
  connectionStatus: document.getElementById('connection-status'),
};

const tracker = new RealtimeTracker({
  onUpdate: render,
  onError: () => {
    els.connectionStatus.textContent = 'Reconectando…';
    els.connectionStatus.className = 'status status--error';
  },
});

tracker.start();

function render(tournament) {
  bracket.render(tournament);
  els.tournamentName.textContent = tournament.name;
  els.lastUpdate.textContent = formatTime(tournament.updatedAt);

  const live = getLiveMatches(tournament.matches);
  els.liveCount.textContent = live.length;
  els.liveList.innerHTML = live
    .map((m) => {
      const map = createTeamMap(tournament.teams);
      const home = map[m.home]?.name || 'TBD';
      const away = map[m.away]?.name || 'TBD';
      return `<li class="live-item">
        <span class="live-dot"></span>
        <span>${home} <strong>${m.homeScore}–${m.awayScore}</strong> ${away}</span>
      </li>`;
    })
    .join('') || '<li class="live-item live-item--empty">Nenhum jogo ao vivo</li>';

  els.connectionStatus.textContent = 'Ao vivo';
  els.connectionStatus.className = 'status status--live';
}

function showMatchDetail(match) {
  const tournament = tracker.tournament;
  if (!tournament) return;

  const map = createTeamMap(tournament.teams);
  const home = match.home ? map[match.home] : null;
  const away = match.away ? map[match.away] : null;

  els.matchPanel.hidden = false;
  els.matchRound.textContent = getRoundLabel(match.round);
  els.matchTeams.textContent = `${home?.name || '—'} vs ${away?.name || '—'}`;
  els.matchScore.textContent = formatScore(match);
  els.matchStatus.textContent = statusLabel(match.status);
  els.matchStatus.className = `match-status match-status--${match.status}`;
}

function statusLabel(status) {
  const labels = {
    scheduled: 'Agendado',
    live: 'Ao vivo',
    finished: 'Encerrado',
  };
  return labels[status] || status;
}

function formatTime(iso) {
  try {
    return new Date(iso).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  } catch {
    return '—';
  }
}

document.getElementById('close-panel')?.addEventListener('click', () => {
  els.matchPanel.hidden = true;
  bracket.selectedMatchId = null;
  if (tracker.tournament) bracket.render(tracker.tournament);
});
