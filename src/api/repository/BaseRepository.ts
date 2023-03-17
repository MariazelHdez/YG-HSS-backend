import { IRepository } from "./interfaces/IRepository";

export abstract class BaseRepository<T> implements IRepository<T> {

    loadResults<T>(data: Array<any>): Array<T> {
        const result: Array<T> = [];
        if (Array.isArray(data)) {
            data.forEach((row) => {
                const newObj = Object.fromEntries(
                    Object.entries(row).map(([k, v]) => [k.toLowerCase(), v])
                );
                  
                result.push(newObj as T);
            });
        }
        return result;
    }

    create(item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    update(id: string, item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    findAll(): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    find(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
}