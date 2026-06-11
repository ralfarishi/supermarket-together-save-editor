import type { VisualProp } from './types';
import { drawTruck, drawBox, drawDollar, drawEntranceArrow } from './icon-drawers';

export function drawStoreMap(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  parsedProps: VisualProp[],
  zoom: number,
  panX: number,
  panY: number,
  showShelves: boolean,
  showStorage: boolean,
  showRegisters: boolean,
  hoveredItem: VisualProp | null,
  selectedItem: VisualProp | null,
  searchProductId: string
): void {
  // Grid details
  const buildingMinX = -22;
  const buildingMaxX = 38;
  const buildingMinZ = -10;
  const buildingMaxZ = 60;

  // Helper to map game coordinates (x, z) to screen space
  const toScreen = (gx: number, gz: number) => ({
    x: gx * zoom + panX,
    y: -gz * zoom + panY
  });

  // 1. Clear background with unpurchased "dark slate" color
  ctx.fillStyle = '#09090b'; // zinc-950 (Locked space / base background)
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Helper to draw a rect from game coordinates (minX, minZ) to (maxX, maxZ)
  const drawGameRect = (minX: number, maxX: number, minZ: number, maxZ: number, fillStyle: string) => {
    const topLeft = toScreen(minX, maxZ);
    const width = (maxX - minX) * zoom;
    const height = (maxZ - minZ) * zoom;
    ctx.fillStyle = fillStyle;
    ctx.fillRect(topLeft.x, topLeft.y, width, height);
  };

  // 2. Draw unlocked storefront, checkout, manager, neutral, & storage areas
  // Main Storefront area: X in [-22, 8], Z in [-3.25, 60] (yellow scribble in layout)
  drawGameRect(-22, 8, -3.25, 60, '#18181b'); // zinc-900 (Storefront)

  // Storage Room Area: X in [8, 38], Z in [10, 60] (blue scribble in layout)
  drawGameRect(8, 38, 10, 60, 'rgba(30, 41, 59, 0.45)'); // slate-800 with opacity (Storage)

  // Manager Room Area: X in [8, 14], Z in [-3.25, 10] (dollar icon room)
  drawGameRect(8, 14, -3.25, 10, '#131316'); // dark charcoal (Manager)

  // Neutral / Recycling / Trash Area: X in [14, 38], Z in [-3.25, 10] (red scribble in layout)
  drawGameRect(14, 38, -3.25, 10, 'rgba(63, 63, 70, 0.15)'); // zinc-700 with opacity (Neutral)

  // Clear Column A Row 7 back to dark slate since it is locked (A7: X in [32, 38], Z in [50, 60])
  drawGameRect(32, 38, 50, 60, '#09090b');

  // Render hatched locked pattern in Column A Row 7
  const pCanvas = document.createElement('canvas');
  pCanvas.width = 10;
  pCanvas.height = 10;
  const pCtx = pCanvas.getContext('2d');
  if (pCtx) {
    pCtx.strokeStyle = '#27272a'; // zinc-800 lines
    pCtx.lineWidth = 1.5;
    pCtx.beginPath();
    pCtx.moveTo(0, 10);
    pCtx.lineTo(10, 0);
    pCtx.stroke();
  }
  const hatchPattern = ctx.createPattern(pCanvas, 'repeat');
  if (hatchPattern) {
    const lockedTopLeft = toScreen(32, 60);
    const lockedW = (38 - 32) * zoom;
    const lockedH = (60 - 50) * zoom;
    ctx.fillStyle = hatchPattern;
    ctx.fillRect(lockedTopLeft.x, lockedTopLeft.y, lockedW, lockedH);
  }

  // Pink outline/vertical line for the delivery zone shutter on the right wall (X = 38, Z in [40, 50])
  ctx.strokeStyle = '#db2777'; // pink-600
  ctx.lineWidth = 3.5;
  const deliveryStart = toScreen(38, 50);
  const deliveryEnd = toScreen(38, 40);
  ctx.beginPath();
  ctx.moveTo(deliveryStart.x, deliveryStart.y);
  ctx.lineTo(deliveryEnd.x, deliveryEnd.y);
  ctx.stroke();

  // 3. Draw Grid Lines inside the building limits
  ctx.strokeStyle = '#27272a'; // zinc-800 grid lines
  ctx.lineWidth = 0.5;

  // Vertical grid lines (every 6 units for 10 columns)
  for (let x = buildingMinX; x <= buildingMaxX; x += 6) {
    const start = toScreen(x, buildingMinZ);
    const end = toScreen(x, buildingMaxZ);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  // Horizontal grid lines (every 10 units for 7 rows)
  for (let z = buildingMinZ; z <= buildingMaxZ; z += 10) {
    const start = toScreen(buildingMinX, z);
    const end = toScreen(buildingMaxX, z);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    ctx.lineTo(end.x, end.y);
    ctx.stroke();
  }

  // Draw Blackboard Icons & Entrance/Exit Arrows
  const iconScale = zoom * 0.8;
  const arrowScale = zoom * 0.7;

  // Truck in delivery zone (X = 34, Z = 45)
  const ptTruck = toScreen(34, 45);
  drawTruck(ctx, ptTruck.x, ptTruck.y, iconScale);

  // Box in storage warehouse area (X = 11, Z = 15)
  const ptBox = toScreen(11, 15);
  drawBox(ctx, ptBox.x, ptBox.y, iconScale);

  // Dollar in manager area (X = 11, Z = 3.3)
  const ptDollar = toScreen(11, 3.3);
  drawDollar(ctx, ptDollar.x, ptDollar.y, iconScale * 0.9);

  // Entrance arrows pointing UP into the store from the street doors at Z = -3.25 (drawn below Z = -3.25)
  const entranceXs = [-12, -6, 0, 6];
  entranceXs.forEach(xVal => {
    const ptArrow = toScreen(xVal, -6);
    ctx.save();
    ctx.translate(ptArrow.x, ptArrow.y);
    ctx.rotate(-Math.PI / 2); // Rotate 90 degrees counter-clockwise (point UP)
    drawEntranceArrow(ctx, 0, 0, arrowScale);
    ctx.restore();
  });

  // Dumpster exit arrow pointing DOWN from the exit door at Z = -3.25 (drawn below Z = -3.25)
  const ptExitArrow = toScreen(26, -6);
  ctx.save();
  ctx.translate(ptExitArrow.x, ptExitArrow.y);
  ctx.rotate(Math.PI / 2); // Rotate 90 degrees clockwise (point DOWN)
  drawEntranceArrow(ctx, 0, 0, arrowScale);
  ctx.restore();

  // 4. Draw Walls (Solid lines with door gaps)
  ctx.strokeStyle = '#52525b'; // zinc-600 walls
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';

  const drawHWall = (gx1: number, gx2: number, gz: number, hasDoor = true) => {
    ctx.beginPath();
    const p1 = toScreen(gx1, gz);
    const p2 = toScreen(gx2, gz);
    if (hasDoor) {
      const mx = (gx1 + gx2) / 2;
      const pm1 = toScreen(mx + 0.8, gz);
      const pm2 = toScreen(mx - 0.8, gz);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(pm1.x, pm1.y);
      ctx.moveTo(pm2.x, pm2.y);
      ctx.lineTo(p2.x, p2.y);
    } else {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  };

  const drawVWall = (gx: number, gz1: number, gz2: number, hasDoor = true) => {
    ctx.beginPath();
    const p1 = toScreen(gx, gz1);
    const p2 = toScreen(gx, gz2);
    if (hasDoor) {
      const mz = (gz1 + gz2) / 2;
      const pm1 = toScreen(gx, mz - 1.2);
      const pm2 = toScreen(gx, mz + 1.2);
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(pm1.x, pm1.y);
      ctx.moveTo(pm2.x, pm2.y);
      ctx.lineTo(p2.x, p2.y);
    } else {
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
    }
    ctx.stroke();
  };

  // Main vertical dividing wall at X = 8 (from Z = -3.25 to Z = 60)
  // Has doors at Z in [2, 4], [14, 16], [44, 46]
  drawVWall(8, -3.25, 2, false);
  drawVWall(8, 4, 14, false);
  drawVWall(8, 16, 44, false);
  drawVWall(8, 46, 60, false);

  // Horizontal dividing wall at Z = 10 (from X = 8 to X = 38)
  // Has doors at X in [10, 12] (manager room door) and X in [25, 27] (warehouse door)
  drawHWall(8, 10, 10, false);
  drawHWall(12, 25, 10, false);
  drawHWall(27, 38, 10, false);

  // Vertical dividing wall at X = 14 separating manager room from neutral area (Z in [-3.25, 10])
  drawVWall(14, -3.25, 10, false);

  // 5. Draw Column letters (A to J) & Row numbers (1 to 7) along layout borders
  ctx.font = 'bold 9px monospace';
  ctx.fillStyle = '#71717a'; // zinc-500
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const cols = [
    { label: 'A', x: 35 },
    { label: 'B', x: 29 },
    { label: 'C', x: 23 },
    { label: 'D', x: 17 },
    { label: 'E', x: 11 },
    { label: 'F', x: 5 },
    { label: 'G', x: -1 },
    { label: 'H', x: -7 },
    { label: 'I', x: -13 },
    { label: 'J', x: -19 }
  ];

  cols.forEach(c => {
    const posTop = toScreen(c.x, buildingMaxZ);
    const posBot = toScreen(c.x, buildingMinZ);
    ctx.fillText(c.label, posTop.x, posTop.y - 12);
    ctx.fillText(c.label, posBot.x, posBot.y + 12);
  });

  const rows = [
    { label: '1', z: -5 },
    { label: '2', z: 5 },
    { label: '3', z: 15 },
    { label: '4', z: 25 },
    { label: '5', z: 35 },
    { label: '6', z: 45 },
    { label: '7', z: 55 }
  ];

  rows.forEach(r => {
    const posLeft = toScreen(buildingMaxX, r.z);
    const posRight = toScreen(buildingMinX, r.z);
    ctx.fillText(r.label, posLeft.x - 12, posLeft.y);
    ctx.fillText(r.label, posRight.x + 12, posRight.y);
  });

  // 6. Draw Structural Pillars (White columns with black bases)
  const pillarXs = [-16, -10, -4, 2, 8, 14, 20, 26, 32];
  const pillarZs = [0, 10, 20, 30, 40, 50];

  pillarXs.forEach(x => {
    pillarZs.forEach(z => {
      const pos = toScreen(x, z);
      
      // Pillar base (black)
      ctx.fillStyle = '#09090b';
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 4, 0, 2 * Math.PI);
      ctx.fill();

      // Pillar top (white)
      ctx.fillStyle = '#e4e4e7'; // zinc-200
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 2.5, 0, 2 * Math.PI);
      ctx.fill();
    });
  });

  // 7. Draw coordinate origin (0,0) indicator
  const origin = toScreen(0, 0);
  ctx.strokeStyle = 'rgba(245, 158, 11, 0.2)'; // Amber
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(origin.x, origin.y, 5, 0, 2 * Math.PI);
  ctx.stroke();

  // 8. Draw all props
  parsedProps.forEach(prop => {
    // Filtering out based on toggles
    if (prop.category === 'shelf' && !showShelves) return;
    if (prop.category === 'storage' && !showStorage) return;
    if (prop.category === 'register' && !showRegisters) return;

    // Coordinate conversion
    const pos = toScreen(prop.x, prop.z);
    const px = pos.x;
    const py = pos.y;

    // Check if this prop contains searched product ID
    let isHighlightedBySearch = false;
    if (searchProductId.trim() !== '') {
      const searchId = parseInt(searchProductId, 10);
      isHighlightedBySearch = prop.slots.some(slot => slot.productId === searchId && slot.quantity > 0);
    }

    const isHovered = hoveredItem && hoveredItem.key === prop.key;
    const isSelected = selectedItem && selectedItem.key === prop.key;

    // Color scheme
    let fillColor = '#52525b'; // zinc-600 default
    let strokeColor = '#3f3f46'; // zinc-700
    let label = '';

    if (prop.type === 10) {
      fillColor = '#8b5cf6'; // violet-500 (Purple)
      strokeColor = '#6d28d9'; // violet-700
      label = `MFG${prop.key.replace('mpropdata', '')}`;
    } else if (prop.type === 11) {
      fillColor = '#ec4899'; // pink-500 (Magenta)
      strokeColor = '#be185d'; // pink-700
      label = `MKT${prop.key.replace('mpropdata', '')}`;
    } else if (prop.category === 'shelf') {
      fillColor = '#10b981'; // emerald-500
      strokeColor = '#047857'; // emerald-700
      label = `S${prop.key.replace('propdata', '')}`;
    } else if (prop.category === 'storage') {
      fillColor = '#3b82f6'; // blue-500
      strokeColor = '#1d4ed8'; // blue-700
      label = `ST${prop.key.replace('propdata', '')}`;
    } else if (prop.category === 'register') {
      fillColor = '#f97316'; // orange-500 (Cash Register / Checkout)
      strokeColor = '#c2410c'; // orange-700
      if (prop.key.startsWith('decopropdata')) {
        label = 'REG';
      } else {
        label = `CO${prop.key.replace('propdata', '')}`;
      }
    }

    // Draw item shadow or highlight glow
    if (isHighlightedBySearch) {
      ctx.shadowColor = '#f59e0b'; // Amber glow for search match
      ctx.shadowBlur = 12;
    } else if (isHovered || isSelected) {
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 8;
    } else {
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
    }

    // Draw shape centered at origin after translation and rotation
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate((prop.rot * Math.PI) / 180);

    ctx.fillStyle = fillColor;
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = (isHovered || isSelected) ? 2 : 1;

    const w = prop.width * zoom;
    const l = prop.length * zoom;

    ctx.fillRect(-w / 2, -l / 2, w, l);
    ctx.strokeRect(-w / 2, -l / 2, w, l);

    // Render simple label text inside if zoomed in enough
    if (zoom > 4 && label) {
      ctx.shadowBlur = 0; // Disable text shadow
      ctx.fillStyle = '#0f172a'; // dark slate
      ctx.font = 'bold 8px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.rotate(-(prop.rot * Math.PI) / 180); // Keep text horizontal
      ctx.fillText(label, 0, 0);
    }
    ctx.restore();
  });

  // 9. Draw Outer Walls Outline
  ctx.strokeStyle = '#71717a'; // zinc-500 outer walls
  ctx.lineWidth = 4;
  ctx.lineCap = 'round';
  
  // Left wall (X = -22 from Z = -3.25 to 60)
  ctx.beginPath();
  const wl1 = toScreen(-22, -3.25);
  const wl2 = toScreen(-22, 60);
  ctx.moveTo(wl1.x, wl1.y);
  ctx.lineTo(wl2.x, wl2.y);
  ctx.stroke();

  // Back wall main (Z = 60 from X = -22 to 32)
  ctx.beginPath();
  const wb1 = toScreen(-22, 60);
  const wb2 = toScreen(32, 60);
  ctx.moveTo(wb1.x, wb1.y);
  ctx.lineTo(wb2.x, wb2.y);
  ctx.stroke();

  // Indented back wall A7 (Z = 50 from X = 32 to 38)
  ctx.beginPath();
  const wa7_1 = toScreen(32, 50);
  const wa7_2 = toScreen(38, 50);
  ctx.moveTo(wa7_1.x, wa7_1.y);
  ctx.lineTo(wa7_2.x, wa7_2.y);
  ctx.stroke();

  // Vertical wall A7 partition (X = 32 from Z = 50 to 60)
  ctx.beginPath();
  const wa7v1 = toScreen(32, 50);
  const wa7v2 = toScreen(32, 60);
  ctx.moveTo(wa7v1.x, wa7v1.y);
  ctx.lineTo(wa7v2.x, wa7v2.y);
  ctx.stroke();

  // Right wall (X = 38 from Z = -3.25 to 50)
  ctx.beginPath();
  const wr1 = toScreen(38, -3.25);
  const wr2 = toScreen(38, 50);
  ctx.moveTo(wr1.x, wr1.y);
  ctx.lineTo(wr2.x, wr2.y);
  ctx.stroke();

  // Front boundary outline (Sidewalk boundary at Z = -10)
  ctx.strokeStyle = '#3f3f46'; // zinc-700 thin sidewalk line
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  const wf1 = toScreen(-22, -10);
  const wf2 = toScreen(38, -10);
  ctx.moveTo(wf1.x, wf1.y);
  ctx.lineTo(wf2.x, wf2.y);
  ctx.stroke();

  // Sidewalk side boundaries
  ctx.beginPath();
  const wfs1_1 = toScreen(-22, -10);
  const wfs1_2 = toScreen(-22, -3.25);
  ctx.moveTo(wfs1_1.x, wfs1_1.y);
  ctx.lineTo(wfs1_2.x, wfs1_2.y);
  ctx.stroke();

  ctx.beginPath();
  const wfs2_1 = toScreen(38, -10);
  const wfs2_2 = toScreen(38, -3.25);
  ctx.moveTo(wfs2_1.x, wfs2_1.y);
  ctx.lineTo(wfs2_2.x, wfs2_2.y);
  ctx.stroke();

  // Facade Front Glass Wall (Z = -3.25 from X = -22 to 38, leaving gaps for doors)
  ctx.strokeStyle = '#a1a1aa'; // zinc-400 front glass wall
  ctx.lineWidth = 2.5;

  const drawFacadeSegment = (x1: number, x2: number) => {
    ctx.beginPath();
    const p1 = toScreen(x1, -3.25);
    const p2 = toScreen(x2, -3.25);
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  };

  // Door gaps at X = -12, -6, 0, 6 (customer doors) and X = 26 (dumpster exit door)
  // Each gap is 2m width (e.g. -13 to -11)
  drawFacadeSegment(-22, -13); // Left of Left Exit
  drawFacadeSegment(-11, -7);  // Between Left Exit and Left Entrance
  drawFacadeSegment(-5, -1);   // Between Left Entrance and Right Entrance
  drawFacadeSegment(1, 5);     // Between Right Entrance and Right Exit
  drawFacadeSegment(7, 25);    // Between Right Exit and Dumpster Exit
  drawFacadeSegment(27, 38);   // Right of Dumpster Exit
}
