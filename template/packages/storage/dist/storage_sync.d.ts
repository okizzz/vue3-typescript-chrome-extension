import type { StorageType } from './types';
export default class Storage implements StorageType {
    get<T>(key: string): Promise<T | null>;
    set<T>(key: string, value: T): Promise<void>;
    remove(key: string): Promise<void>;
    clear(): Promise<void>;
}
//# sourceMappingURL=storage_sync.d.ts.map