import { IRepository } from "./interfaces/IRepository";
import { Request, Response } from "express";

export abstract class BaseRepository<T> implements IRepository<T> {

    loadResults<T>(data: Array<any>): Array<T> {
        const result: Array<T> = [];
        if (Array.isArray(data)) {
            data.forEach((row) => {                  
                result.push(row as T);
            });
        }
        return result;
    }

    create(item: T): Promise<number> {
        throw new Error("Method not implemented.");
    }
    update(id: string, item: T): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    delete(id: string): Promise<boolean> {
        throw new Error("Method not implemented.");
    }
    findAll(req: Request): Promise<T[]> {
        throw new Error("Method not implemented.");
    }
    find(id: string): Promise<T> {
        throw new Error("Method not implemented.");
    }
}