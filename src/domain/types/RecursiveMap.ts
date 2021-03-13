type Value<K, V> = V | Map<K, Value<K, V>>;

export type RecursiveMap<K, V> = Map<K, Value<K, V>>;
