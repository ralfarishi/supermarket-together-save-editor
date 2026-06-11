export const getGridCol = (x: number): string => {
  const clampedX = Math.max(-21.99, Math.min(37.99, x));
  if (clampedX > 32 && clampedX <= 38) return 'A';
  if (clampedX > 26 && clampedX <= 32) return 'B';
  if (clampedX > 20 && clampedX <= 26) return 'C';
  if (clampedX > 14 && clampedX <= 20) return 'D';
  if (clampedX > 8 && clampedX <= 14) return 'E';
  if (clampedX > 2 && clampedX <= 8) return 'F';
  if (clampedX > -4 && clampedX <= 2) return 'G';
  if (clampedX > -10 && clampedX <= -4) return 'H';
  if (clampedX > -16 && clampedX <= -10) return 'I';
  if (clampedX >= -22 && clampedX <= -16) return 'J';
  return '?';
};

export const getGridRow = (z: number): string => {
  const clampedZ = Math.max(-10, Math.min(59.99, z));
  const rowIdx = Math.floor((clampedZ + 10) / 10) + 1;
  if (rowIdx >= 1 && rowIdx <= 7) return String(rowIdx);
  return '?';
};

export const getGridCoord = (x: number, z: number): string => {
  return `${getGridCol(x)}${getGridRow(z)}`;
};
