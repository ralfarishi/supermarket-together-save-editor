export function getProductSubCategory(p: { id: number; name: string; containerClass?: number; subCategory?: string }): string {
  if (p.subCategory) return p.subCategory;

  const name = p.name.toLowerCase();
  const cc = p.containerClass ?? 0;

  if (cc === 1) {
    if (name.includes('cheese') || name.includes('yoghurt') || name.includes('butter') || name.includes('margarine') || name.includes('milk')) {
      return 'Dairy & Eggs';
    }
    if (name.includes('soda') || name.includes('cola') || name.includes('bottle') || name.includes('juice') || name.includes('drink') || name.includes('tea') || name.includes('coffee') || name.includes('brew')) {
      return 'Chilled Beverages';
    }
    if (name.includes('beef') || name.includes('chicken') || name.includes('veal') || name.includes('ham') || name.includes('bacon') || name.includes('sliced')) {
      return 'Chilled Meats';
    }
    if (name.includes('sushi') || name.includes('salmon') || name.includes('crab') || name.includes('fish')) {
      return 'Chilled Seafood';
    }
    return 'Chilled Miscellaneous';
  }

  if (cc === 2) {
    if (name.includes('ice cream') || name.includes('cone') || name.includes('dessert') || name.includes('sweet') || name.includes('bonbek')) {
      return 'Frozen Desserts';
    }
    if (name.includes('pizza') || name.includes('lasagna') || name.includes('crepe') || name.includes('fondue') || name.includes('crocanti') || name.includes('nuggets')) {
      return 'Frozen Meals';
    }
    if (name.includes('fries') || name.includes('potato') || name.includes('beans') || name.includes('vegetable') || name.includes('chicken mix') || name.includes('mix')) {
      return 'Frozen Sides';
    }
    return 'Frozen Miscellaneous';
  }

  if (cc === 3) {
    const fruits = ['apple', 'clementine', 'orange', 'pear', 'lemon', 'mango', 'avocado', 'kiwi', 'papaya', 'strawberry', 'cherry', 'banana', 'melon', 'pineapple', 'watermelon', 'coconut'];
    if (fruits.some(f => name.includes(f))) {
      return 'Fresh Fruits';
    }
    const vegetables = ['artichoke', 'zucchini', 'carrot', 'tomato', 'potato', 'onion', 'pumpkin', 'garlic', 'pepper', 'lettuce', 'cucumber', 'mushroom', 'cauliflower'];
    if (vegetables.some(v => name.includes(v))) {
      return 'Fresh Vegetables';
    }
    return 'Fresh Miscellaneous';
  }

  if (cc === 4) {
    if (name.includes('seeds') || name.includes('seed')) {
      return 'Pegboard Seeds';
    }
    return 'Pegboard Accessories';
  }

  if (cc === 0) {
    if (name.includes('manufacturing bag')) {
      return 'Manufacturing';
    }

    if (name.includes('eggnog') || name.includes('halloween') || name.includes('christmas')) {
      return 'Seasonal & Holiday';
    }

    if (name.includes('fertilizer') || name.includes('plant pot')) {
      return 'Gardening';
    }

    if (name.includes('keyboard') || name.includes('gamepad') || name.includes('speaker') || name.includes('headphones') || name.includes('console')) {
      return 'Electronics';
    }

    if (
      name.includes('detergent') || name.includes('cleaner') || name.includes('bleach') || 
      name.includes('stain') || name.includes('softener') || name.includes('ammonia') || 
      name.includes('insecticide') || name.includes('cloths') || name.includes('capsules') ||
      name.includes('dishwasher')
    ) {
      return 'Cleaning Products';
    }

    if (
      name.includes('soap') || name.includes('shampoo') || name.includes('gel') || 
      name.includes('toothpaste') || name.includes('diapers') || name.includes('towel') || 
      name.includes('toilet') || name.includes('wipes') || name.includes('paper') || name.includes('powder')
    ) {
      return 'Personal Care & Hygiene';
    }

    if (
      name.includes('ibuprofen') || name.includes('paracetamol') || name.includes('band') || 
      name.includes('laxative') || name.includes('antihistamine') || name.includes('zinc') || 
      name.includes('antioxidant') || name.includes('pills') || name.includes('vitamins') || 
      name.includes('melatonin') || name.includes('sunscreen') || name.includes('cream') ||
      name.includes('fishoil') || name.includes('algae') || name.includes('disinfectant') ||
      name.includes('peroxide')
    ) {
      return 'Pharmacy & Health';
    }

    if (name.includes('wine') || name.includes('whisky') || name.includes('vodka') || name.includes('rum') || name.includes('gin') || name.includes('spirit')) {
      return 'Wines & Spirits';
    }

    if (name.includes('beer') || name.includes('barrel') || name.includes('cider')) {
      return 'Beer & Cider';
    }

    if (name.includes('book') || name.includes('magazine') || name.includes('literature')) {
      return 'Books & Literature';
    }

    if (
      name.includes('cereal') || name.includes('coffee') || name.includes('tea') || 
      name.includes('peppermint') || name.includes('valerian') || name.includes('mint') ||
      name.includes('infusion')
    ) {
      return 'Breakfast & Hot Drinks';
    }

    if (
      name.includes('cookie') || name.includes('biscuit') || name.includes('sweet') || 
      name.includes('marshmallow') || name.includes('chips') || name.includes('choco') || 
      name.includes('jam') || name.includes('spread') || name.includes('honey') || 
      name.includes('nuts') || name.includes('pistachio') || name.includes('almond') || 
      name.includes('cashew') || name.includes('hazelnut') || name.includes('raisin') || 
      name.includes('walnut') || name.includes('peanut') || name.includes('foditos') ||
      name.includes('chipos') || name.includes('confectionery') || name.includes('madeleine') ||
      name.includes('cake') || name.includes('chocolate') || name.includes('popcorn') ||
      name.includes('icing') || name.includes('sprinkles')
    ) {
      return 'Snacks & Sweets';
    }

    if (name.includes('egg box') || name.includes('milk brick')) {
      return 'Dairy & Eggs';
    }

    if (name.includes('pasta') || name.includes('rice') || name.includes('spaghetti') || name.includes('macarroni') || name.includes('noodle') || name.includes('potatoe bag') || name.includes('mash potatoes') || name.includes('lentils')) {
      return 'Grains & Pasta';
    }

    if (name.includes('sugar') || name.includes('flour') || name.includes('salt') || name.includes('baking') || name.includes('yeast') || name.includes('extract')) {
      return 'Baking & Sugar';
    }

    if (
      name.includes('oil') || name.includes('ketchup') || name.includes('mustard') || 
      name.includes('sauce') || name.includes('pepper') || name.includes('spices') || 
      name.includes('vinegar') || name.includes('mayonnaise') || name.includes('salt') ||
      name.includes('spicy') || name.includes('dressing') || name.includes('houmous')
    ) {
      return 'Condiments & Sauces';
    }

    if (
      name.includes('tuna') || name.includes('beans') || name.includes('peas') || 
      name.includes('soup') || name.includes('canned') || name.includes('preserve') ||
      name.includes('pate') || name.includes('corn') || name.includes('chickpeas') ||
      name.includes('olives') || name.includes('meat balls')
    ) {
      return 'Canned & Preserves';
    }

    if (name.includes('cat') || name.includes('dog') || name.includes('pet')) {
      return 'Pet Care';
    }

    if (name.includes('baby') || name.includes('infant')) {
      return 'Baby Care';
    }

    if (name.includes('bread') || name.includes('toast') || name.includes('croissant') || name.includes('pastry') || name.includes('bagel') || name.includes('muffin')) {
      return 'Bakery & Bread';
    }

    if (name.includes('water') || name.includes('juice') || name.includes('soda') || name.includes('cola') || name.includes('lemonade') || name.includes('tonic')) {
      return 'Beverages';
    }

    return 'Ambient Miscellaneous';
  }

  return 'Unknown';
}
