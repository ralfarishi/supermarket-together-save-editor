export function parseUnityFloat(val: string): number {
  if (typeof val !== 'string') return 0;
  return parseFloat(val.replace(',', '.'));
}
