const isArrayOf = <T>(
  value: any,
  predicate: (arrayValue: any) => arrayValue is T
): value is T[] => Array.isArray(value) && value.every(predicate);

const filterArrayOf = <T, V extends T>(
  array: T[],
  predicate: (value: T) => value is V
) => {
  return array.filter(predicate) as V[];
};

const groupItemsBy = <T, K extends string>(
  array: T[],
  predicate: (item: T) => K
) => {
  return array.reduce((group, current) => {
    const key = predicate(current);
    (group[key] = group[key] || []).push(current);
    return group;
  }, {} as Record<K, T[]>);
};

export { isArrayOf, filterArrayOf, groupItemsBy };
