export interface IRepository<T> {
    create(data: Partial<T>): Promise<T>;
    findById(id: string): Promise<T | null>;
    findOne(filters: Partial<T>): Promise<T | null>;
    findAll(filters?: Partial<T>): Promise<T[]>;
    update(id: string, data: Partial<T>): Promise<T>;
    delete(id: string): Promise<boolean>;
    count(filters?: Partial<T>): Promise<number>;
    executeQuery<R = any>(query: string, params?: any[]): Promise<R>;
}
