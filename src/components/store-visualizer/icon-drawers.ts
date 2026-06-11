export const drawTruck = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.rect(cx - 1.8 * s, cy - 1.4 * s, 2.6 * s, 2.0 * s);
  ctx.rect(cx - 0.8 * s, cy - 2.0 * s, 1.4 * s, 0.6 * s);
  ctx.moveTo(cx + 0.8 * s, cy - 0.6 * s);
  ctx.lineTo(cx + 1.4 * s, cy - 0.6 * s);
  ctx.lineTo(cx + 2.0 * s, cy + 0.1 * s);
  ctx.lineTo(cx + 2.0 * s, cy + 0.6 * s);
  ctx.lineTo(cx + 0.8 * s, cy + 0.6 * s);
  ctx.closePath();
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx - 1.0 * s, cy + 0.8 * s, 0.45 * s, 0, 2 * Math.PI);
  ctx.arc(cx + 1.3 * s, cy + 0.8 * s, 0.45 * s, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.beginPath();
  ctx.arc(cx - 1.0 * s, cy + 0.8 * s, 0.2 * s, 0, 2 * Math.PI);
  ctx.arc(cx + 1.3 * s, cy + 0.8 * s, 0.2 * s, 0, 2 * Math.PI);
  ctx.fillStyle = '#18181b';
  ctx.fill();
};

export const drawBox = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx, cy - s);
  ctx.lineTo(cx - 1.5 * s, cy - 0.7 * s);
  ctx.lineTo(cx, cy - 0.4 * s);
  ctx.lineTo(cx + 1.5 * s, cy - 0.7 * s);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - 1.5 * s, cy - 0.7 * s);
  ctx.lineTo(cx, cy - 0.4 * s);
  ctx.lineTo(cx, cy + 0.8 * s);
  ctx.lineTo(cx - 1.5 * s, cy + 0.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx + 1.5 * s, cy - 0.7 * s);
  ctx.lineTo(cx, cy - 0.4 * s);
  ctx.lineTo(cx, cy + 0.8 * s);
  ctx.lineTo(cx + 1.5 * s, cy + 0.5 * s);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
};

export const drawDollar = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, 1.8 * s, 0, 2 * Math.PI);
  ctx.stroke();

  ctx.fillStyle = '#ffffff';
  ctx.font = `bold ${2.2 * s}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('$', cx, cy);
};

export const drawEntranceArrow = (ctx: CanvasRenderingContext2D, cx: number, cy: number, s: number) => {
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(cx - s * 0.8, cy);
  ctx.lineTo(cx + s * 0.1, cy - s * 0.6);
  ctx.lineTo(cx + s * 0.1, cy - s * 0.25);
  ctx.lineTo(cx + s * 0.9, cy - s * 0.25);
  ctx.lineTo(cx + s * 0.9, cy + s * 0.25);
  ctx.lineTo(cx + s * 0.1, cy + s * 0.25);
  ctx.lineTo(cx + s * 0.1, cy + s * 0.6);
  ctx.closePath();
  ctx.fill();
};
