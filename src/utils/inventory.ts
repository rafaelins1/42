import { Product, ProductVariation, SelectedVariation } from '../types';

export interface ProductStockRow {
  selectedVariations: SelectedVariation[];
  stock: number;
}

export const getVariationStockKey = (selectedVariations: SelectedVariation[]): string =>
  JSON.stringify(
    [...selectedVariations]
      .sort((a, b) =>
        (a.name < b.name ? -1 : a.name > b.name ? 1 : 0) ||
        (a.value < b.value ? -1 : a.value > b.value ? 1 : 0)
      )
      .map(({ name, value }) => [name, value])
  );

export const getVariationCombinations = (variations: ProductVariation[]): SelectedVariation[][] => {
  if (variations.length === 0) return [];

  return variations.reduce<SelectedVariation[][]>(
    (combinations, variation) =>
      combinations.flatMap(combination =>
        variation.options.map(value => [...combination, { name: variation.name, value }])
      ),
    [[]]
  );
};

export const getProductTotalStock = (product: Product): number => {
  if (!product.variationStocks) return Math.max(0, Number(product.stock) || 0);

  return Object.values(product.variationStocks).reduce(
    (total, stock) => total + Math.max(0, Number(stock) || 0),
    0
  );
};

export const getStockForVariations = (
  product: Product,
  selectedVariations: SelectedVariation[]
): number => {
  if (!product.variationStocks) return Math.max(0, Number(product.stock) || 0);

  return Math.max(
    0,
    Number(product.variationStocks[getVariationStockKey(selectedVariations)]) || 0
  );
};

export const getProductStockRows = (product: Product): ProductStockRow[] => {
  if (!product.variationStocks) {
    return [{ selectedVariations: [], stock: getProductTotalStock(product) }];
  }

  const combinations = getVariationCombinations(product.variations ?? []);
  if (combinations.length === 0) {
    return [{ selectedVariations: [], stock: getProductTotalStock(product) }];
  }

  return combinations.map(selectedVariations => ({
    selectedVariations,
    stock: getStockForVariations(product, selectedVariations)
  }));
};
