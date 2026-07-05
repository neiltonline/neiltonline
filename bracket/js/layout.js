/**
 * Polar geometry for the circular knockout bracket.
 * Rings: 32 → 16 → 8 → 4 → 2 → trophy (center).
 */

import { RING_COUNTS } from './data.js';

export const CX = 500;
export const CY = 500;
export const NODE_SIZE = 26;

/** Outer to inner radii for each competitive ring */
export const RADII = [398, 328, 256, 184, 112];

export function ringAngle(ringIndex, slot) {
  const count = RING_COUNTS[ringIndex];
  return (slot + 0.5) * (360 / count);
}

export function polarToCartesian(radius, angleDeg) {
  const rad = ((angleDeg - 90) * Math.PI) / 180;
  return {
    x: CX + radius * Math.cos(rad),
    y: CY + radius * Math.sin(rad),
  };
}

export function position(ringIndex, slot) {
  return polarToCartesian(RADII[ringIndex], ringAngle(ringIndex, slot));
}

/**
 * Bracket connector: radial stub from child, then curve into parent (Y-merge).
 */
export function bracketPath(childRing, childSlot, parentRing, parentSlot) {
  const childR = RADII[childRing];
  const parentR = RADII[parentRing];
  const childAngle = ringAngle(childRing, childSlot);
  const parentAngle = ringAngle(parentRing, parentSlot);

  const child = polarToCartesian(childR, childAngle);
  const parent = polarToCartesian(parentR, parentAngle);

  const stubR = childR - (childR - parentR) * 0.28;
  const stub = polarToCartesian(stubR, childAngle);

  const mergeR = parentR + (childR - parentR) * 0.18;
  const mergeAngle = (childAngle + parentAngle) / 2;
  const merge = polarToCartesian(mergeR, mergeAngle);

  return `M ${child.x} ${child.y} L ${stub.x} ${stub.y} Q ${merge.x} ${merge.y} ${parent.x} ${parent.y}`;
}
