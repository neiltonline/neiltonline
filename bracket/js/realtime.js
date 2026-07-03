/**
 * Real-time tournament updates via polling.
 * Uses local JSON as data source; simulates live score changes for demo.
 */

import { propagateWinners } from './data.js';

const POLL_INTERVAL = 5000;
const DATA_URL = './data/tournament.json';

export class RealtimeTracker {
  constructor({ onUpdate, onError }) {
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.tournament = null;
    this.timer = null;
    this.simulationEnabled = true;
  }

  async start() {
    await this.fetch();
    this.timer = setInterval(() => this.fetch(), POLL_INTERVAL);
  }

  stop() {
    if (this.timer) clearInterval(this.timer);
  }

  async fetch() {
    try {
      const res = await fetch(`${DATA_URL}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      let data = await res.json();

      if (this.simulationEnabled) {
        data = this._simulateLiveUpdate(data);
      }

      data.matches = propagateWinners(data.matches);
      data.updatedAt = new Date().toISOString();
      this.tournament = data;
      this.onUpdate(data);
    } catch (err) {
      this.onError?.(err);
    }
  }

  /**
   * Demo: randomly increment live match scores and finish some games.
   */
  _simulateLiveUpdate(tournament) {
    const data = structuredClone(tournament);
    const live = data.matches.filter((m) => m.status === 'live');

    if (live.length === 0) return data;

    const match = live[Math.floor(Math.random() * live.length)];
    const idx = data.matches.findIndex((m) => m.id === match.id);

    if (Math.random() > 0.7) {
      const homeWins = Math.random() > 0.5;
      data.matches[idx].status = 'finished';
      data.matches[idx].winner = homeWins ? match.home : match.away;
      if (homeWins) {
        data.matches[idx].homeScore += 1;
      } else {
        data.matches[idx].awayScore += 1;
      }
    } else {
      if (Math.random() > 0.5) {
        data.matches[idx].homeScore += 1;
      } else {
        data.matches[idx].awayScore += 1;
      }
    }

    return data;
  }

  setSimulation(enabled) {
    this.simulationEnabled = enabled;
  }
}
