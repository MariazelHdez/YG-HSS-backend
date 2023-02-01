import { IRepository } from "./interfaces/IRepository";

export abstract class BaseRepository<T> implements IRepository<T> {
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