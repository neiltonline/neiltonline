/**
 * Real-time tournament updates via polling.
 * Loads tournament.json — no score simulation (real results only).
 */

import { propagateWinners } from './data.js';

const POLL_INTERVAL = 60000;
const DATA_URL = '/bracket/data/tournament.json';

export class RealtimeTracker {
  constructor({ onUpdate, onError }) {
    this.onUpdate = onUpdate;
    this.onError = onError;
    this.tournament = null;
    this.timer = null;
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
      const data = await res.json();
      data.matches = propagateWinners(data.matches);
      data.updatedAt = data.updatedAt || new Date().toISOString();
      this.tournament = data;
      this.onUpdate(data);
    } catch (err) {
      this.onError?.(err);
    }
  }
}
