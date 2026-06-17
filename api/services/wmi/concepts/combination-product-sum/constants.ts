// Curated product tables shared between index.ts (generate/render) and breakdown.ts.
// Kept in a separate file to break the circular import that would arise if
// breakdown.ts imported from index.ts (which in turn imports breakdown.ts).

// Products of exactly two 2-digit primes (unique 2-digit factorisation).
// For each entry P = a × b, both a and b are prime and 10 ≤ a < b ≤ 99.
// Because P = a×b is a semiprime, its only factoring into positive integers is
// 1×P or a×b; since P > 99, the 1×P pair has P a 3-or-4-digit number, so the
// ONLY pair of 2-digit factors is (a, b). This guarantees a unique answer.
export const FIND_SUM_PRODUCTS: ReadonlyArray<{
  a: number
  b: number
  product: number
  sum: number
}> = [
  { a: 11, b: 13, product: 143, sum: 24 },
  { a: 11, b: 17, product: 187, sum: 28 },
  { a: 11, b: 19, product: 209, sum: 30 },
  { a: 11, b: 23, product: 253, sum: 34 },
  { a: 11, b: 29, product: 319, sum: 40 },
  { a: 11, b: 31, product: 341, sum: 42 },
  { a: 11, b: 37, product: 407, sum: 48 },
  { a: 11, b: 41, product: 451, sum: 52 },
  { a: 11, b: 43, product: 473, sum: 54 },
  { a: 11, b: 47, product: 517, sum: 58 },
  { a: 11, b: 53, product: 583, sum: 64 },
  { a: 11, b: 59, product: 649, sum: 70 },
  { a: 11, b: 61, product: 671, sum: 72 },
  { a: 11, b: 67, product: 737, sum: 78 },
  { a: 11, b: 71, product: 781, sum: 82 },
  { a: 11, b: 73, product: 803, sum: 84 },
  { a: 11, b: 79, product: 869, sum: 90 },
  { a: 11, b: 83, product: 913, sum: 94 },
  { a: 11, b: 89, product: 979, sum: 100 },
  { a: 11, b: 97, product: 1067, sum: 108 },
  { a: 13, b: 17, product: 221, sum: 30 },
  { a: 13, b: 19, product: 247, sum: 32 },
  { a: 13, b: 23, product: 299, sum: 36 },
  { a: 13, b: 29, product: 377, sum: 42 },
  { a: 13, b: 31, product: 403, sum: 44 },
  { a: 13, b: 37, product: 481, sum: 50 },
  { a: 13, b: 41, product: 533, sum: 54 },
  { a: 13, b: 43, product: 559, sum: 56 },
  { a: 13, b: 47, product: 611, sum: 60 },
  { a: 13, b: 53, product: 689, sum: 66 },
  { a: 13, b: 59, product: 767, sum: 72 },
  { a: 13, b: 61, product: 793, sum: 74 },
  { a: 13, b: 67, product: 871, sum: 80 },
  { a: 13, b: 71, product: 923, sum: 84 },
  { a: 13, b: 73, product: 949, sum: 86 },
  { a: 13, b: 79, product: 1027, sum: 92 },
  { a: 13, b: 83, product: 1079, sum: 96 },
  { a: 13, b: 89, product: 1157, sum: 102 },
  { a: 13, b: 97, product: 1261, sum: 110 },
  { a: 17, b: 19, product: 323, sum: 36 },
  { a: 17, b: 23, product: 391, sum: 40 },
  { a: 17, b: 29, product: 493, sum: 46 },
  { a: 17, b: 31, product: 527, sum: 48 },
  { a: 17, b: 37, product: 629, sum: 54 },
  { a: 17, b: 41, product: 697, sum: 58 },
  { a: 17, b: 43, product: 731, sum: 60 },
  { a: 17, b: 47, product: 799, sum: 64 },
  { a: 17, b: 53, product: 901, sum: 70 },
  { a: 17, b: 59, product: 1003, sum: 76 },
  { a: 17, b: 61, product: 1037, sum: 78 },
  { a: 17, b: 67, product: 1139, sum: 84 },
  { a: 17, b: 71, product: 1207, sum: 88 },
  { a: 17, b: 73, product: 1241, sum: 90 },
  { a: 17, b: 79, product: 1343, sum: 96 },
  { a: 19, b: 23, product: 437, sum: 42 },
  { a: 19, b: 29, product: 551, sum: 48 },
  { a: 19, b: 31, product: 589, sum: 50 },
  { a: 19, b: 37, product: 703, sum: 56 },
  { a: 19, b: 41, product: 779, sum: 60 },
  { a: 19, b: 43, product: 817, sum: 62 },
  { a: 19, b: 47, product: 893, sum: 66 },
  { a: 19, b: 53, product: 1007, sum: 72 },
  { a: 19, b: 59, product: 1121, sum: 78 },
  { a: 19, b: 61, product: 1159, sum: 80 },
  { a: 19, b: 67, product: 1273, sum: 86 },
  { a: 23, b: 29, product: 667, sum: 52 },
  { a: 23, b: 31, product: 713, sum: 54 },
  { a: 23, b: 37, product: 851, sum: 60 },
  { a: 23, b: 41, product: 943, sum: 64 },
  { a: 23, b: 43, product: 989, sum: 66 },
  { a: 23, b: 47, product: 1081, sum: 70 },
  { a: 29, b: 31, product: 899, sum: 60 },
  { a: 29, b: 37, product: 1073, sum: 66 },
  { a: 29, b: 41, product: 1189, sum: 70 },
  { a: 29, b: 43, product: 1247, sum: 72 },
  { a: 31, b: 37, product: 1147, sum: 68 },
  { a: 31, b: 41, product: 1271, sum: 72 },
  { a: 37, b: 41, product: 1517, sum: 78 },
  { a: 41, b: 43, product: 1763, sum: 84 },
  { a: 43, b: 47, product: 2021, sum: 90 },
  { a: 47, b: 53, product: 2491, sum: 100 },
  { a: 53, b: 59, product: 3127, sum: 112 },
  { a: 59, b: 61, product: 3599, sum: 120 },
]

// Products with a verified count of unordered pairs (a < b, a×b = N).
// The count equals the number of divisors of N that are strictly less than √N.
export const COUNT_PAIRS_PRODUCTS: ReadonlyArray<{
  n: number
  count: number
}> = [
  { n: 12, count: 3 },   // (1,12),(2,6),(3,4)
  { n: 24, count: 4 },   // (1,24),(2,12),(3,8),(4,6)
  { n: 36, count: 4 },   // (1,36),(2,18),(3,12),(4,9)  — (6,6) excluded since a<b
  { n: 48, count: 5 },   // (1,48),(2,24),(3,16),(4,12),(6,8)
  { n: 60, count: 6 },   // (1,60),(2,30),(3,20),(4,15),(5,12),(6,10)
  { n: 72, count: 6 },   // (1,72),(2,36),(3,24),(4,18),(6,12),(8,9)
  { n: 84, count: 6 },   // (1,84),(2,42),(3,28),(4,21),(6,14),(7,12)
  { n: 90, count: 6 },   // (1,90),(2,45),(3,30),(5,18),(6,15),(9,10)
  { n: 120, count: 8 },  // (1,120),(2,60),(3,40),(4,30),(5,24),(6,20),(8,15),(10,12)
  { n: 180, count: 9 },  // (1,180),(2,90),(3,60),(4,45),(5,36),(6,30),(9,20),(10,18),(12,15)
  { n: 240, count: 10 }, // (1,240),(2,120),(3,80),(4,60),(5,48),(6,40),(8,30),(10,24),(12,20),(15,16)
  { n: 360, count: 12 }, // (1,360),(2,180),(3,120),(4,90),(5,72),(6,60),(8,45),(9,40),(10,36),(12,30),(15,24),(18,20)
]
