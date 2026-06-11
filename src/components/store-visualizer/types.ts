export interface ShelfProductSlot {
  productId: number;
  quantity: number;
}

export interface VisualProp {
  key: string;
  category: 'shelf' | 'storage' | 'register' | 'manufacturing' | 'market';
  type: number;
  subType: number;
  x: number;
  y: number;
  z: number;
  rot: number;
  width: number;
  length: number;
  slots: ShelfProductSlot[];
}

export interface StoreVisualizerProps {
  saveJson: Record<string, { value?: unknown }> | null | undefined;
}
