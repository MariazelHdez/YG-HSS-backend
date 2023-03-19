import { Request, Response } from "express";
export interface IRepository<T> {
    create(item: T): Promise<boolean>;
    update(id: string, item: T): Promise<boolean>;
    delete(id: string): Promise<boolean>;
    find(id: string): Promise<T>;
    findAll(req: Request): Promise<T[]>;
}