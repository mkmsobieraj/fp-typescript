export const curry2: <T1, T2, T3>(fn: (a: T1, b: T2) => T3) => (a: T1) => (b: T2) => T3 =
  <T1, T2, T3>(fn: (a: T1, b: T2) => T3) => (a: T1) => (b: T2) => fn(a, b)
