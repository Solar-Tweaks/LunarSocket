export default function mergeObjects<T = Object>(obj1: T, obj2: T): T {
  const keys = [...new Set([...Object.keys(obj1), ...Object.keys(obj2)])];

  for (const key of keys) {
    if (typeof obj1[key] !== 'object' || typeof obj2[key] !== 'object')
      continue;

    obj2[key] = mergeObjects(obj1[key], obj2[key]);
  }

  return {
    ...obj1,
    ...obj2,
  };
}
