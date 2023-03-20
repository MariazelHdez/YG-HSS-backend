import { Request, Response } from "express";
export interface IRepository<T> {
    create(item: T): Promise<number>;
    update(id: string, item: T): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    find(id: string): Promise<T>;
    findAll(req: Request): Promise<T[]>;
}