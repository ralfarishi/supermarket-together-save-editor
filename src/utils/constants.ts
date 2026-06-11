import licensesData from '../../database/licenses.json';
import namesData from '../../database/names.json';
import dimensionsData from '../../database/dimensions.json';

export const PRODUCT_LICENSES = licensesData as unknown as Record<number, { name: string; unlocks: string }>;

export const RANDOM_NAMES = namesData as string[];

export const DIMENSION_DB = dimensionsData as unknown as Record<number, { width: number; length: number }>;
