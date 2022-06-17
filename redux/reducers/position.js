import * as t from "../types";
import data from "../../five_brands.json";

const productsPerBrand = 5;
const downForImageProgression = true;
const nCache = 7;

const allBrands = Object.keys(data);
// Filter out non-keyboard items
for (let [name, brand] of Object.entries(data)) {
  brand.products = brand.products
    .filter((product) => product.body_html.toLowerCase().includes("keyboard"))
    .filter((product) => product.images.length > 3);
}

const clip = (x, xmin, xmax) => {
  return Math.max(xmin, Math.min(xmax, x));
};

export const computeIndices = (incomingState, keypresses) => {
  var state = { ...incomingState };

  for (const keypressType of keypresses) {
    switch (keypressType) {
      case "down":
        if (downForImageProgression) {
          if (state.level == 0) state.level += 1;
          if (state.level == 1) state.indexSide += 1;
        } else {
          state.level += 1;
        }
        break;
      case "right":
        if (downForImageProgression) {
          state.level = 0;
          state.indexSide = 0;
          state.indexTop += 1;
        } else {
          if (state.level == 0) state.indexTop += 1;
          if (state.level == 1) state.indexSide += 1;
        }
        break;
      case "up":
        if (downForImageProgression) {
          if (state.level == 1 && state.indexSide > 0) state.indexSide -= 1;
          if (state.level == 1 && state.indexSide == 0) {
            state.indexSide = 0;
            state.level = 0;
          }
        } else {
          state.level = 0;
          // Erase whatever position you were in in level 1 when ascending
          state.indexSide = 0;
        }
        break;

      case "left":
        if (downForImageProgression) {
          state.level = 0;
          state.indexSide = 0;
          state.indexTop -= 1;
        } else {
          if (state.level == 0) state.indexTop -= 1;
          if (state.level == 1) state.indexSide -= 1;
        }
        break;
    }
    state.level = clip(state.level, 0, 1);
    state.indexTop = clip(
      state.indexTop,
      0,
      allBrands.length * productsPerBrand - 1
    );

    // Compute corresponding brand, product, variant
    // the brand and product is known from just the top
    // top row position -- we show 3 products from each brand
    // then show the next brand
    const brandIndex = Math.floor(state.indexTop / productsPerBrand);
    const productIndex = Math.floor(state.indexTop % productsPerBrand);
    state.brand = allBrands[brandIndex];
    state.product = data[state.brand]["products"][productIndex];

    state.indexSide = Math.min(
      // the max image index is # of images -1,
      // but indexside starts on the second image
      // so we subtract another - 1
      state.product.images.length - 1 - 1,
      state.indexSide
    );
    state.indexSide = Math.max(0, state.indexSide);

    // because we show the first image at the top row / level
    // the image index is already at 1 once we zoom into the product level
    var imageIndex = (state.level == 1) + state.indexSide;
    imageIndex = clip(imageIndex, 0, state.product["images"].length - 1);

    state.image = state.product["images"][imageIndex];
    if (state.image == null) debugger;
    if (state.brand == null) debugger;
    if (state.product == null) debugger;
  }

  return state;
};

const computePossibles = (current) => {
  var possible = [];
  possible.push(computeIndices(current, ["up"]));
  possible.push(computeIndices(current, ["down"]));
  possible.push(computeIndices(current, ["left"]));
  for (let n = 0; n < nCache; n += 1) {
    possible.push(computeIndices(current, Array(n).fill("right")));
    possible.push(computeIndices(current, Array(n).fill("down")));
  }
  return possible;
};

const dedupeByImage = (possible, skips = []) => {
  let possibleImageIds = [].concat(skips);
  var uniques = [];
  for (let pos of possible) {
    if (pos.image && pos.image.id && !possibleImageIds.includes(pos.image.id)) {
      possibleImageIds.push(pos.image.id);
      uniques.push(pos);
    }
  }
  return uniques;
};

const reducer = (state = position, action) => {
  if (action.type == t.KEYPRESS_ARROW) {
    state.current = computeIndices(state.current, [action.payload]);
    // To compute next possible states precompute
    // the next up, down, left & right -- especially cacheing the next 5 right keys
    var possible = computePossibles(state.current);
    if (state.current.image == null) debugger;

    const uniques = dedupeByImage(possible, [state.current.image.id]);
    state.possible = uniques;
  }
  return state;
};

const position = {
  current: {
    indexTop: 0,
    indexSide: 0,
    level: 0,
    brand: allBrands[0],
    product: data[allBrands[0]]["products"][0],
    image: data[allBrands[0]]["products"][0]["images"][0],
  },
  possible: [],
};

position.possible = computePossibles(position.current);
position.possible = dedupeByImage(position.possible, [
  position.current.image.id,
]);

export default reducer;
