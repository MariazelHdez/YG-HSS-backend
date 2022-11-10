import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG } from "../config";

const db = knex(DB_CONFIG)

export const midwiferyRouter = express.Router();

    midwiferyRouter.get("/api/midwifery", EnsureAuthenticated, async (req: Request, res: Response) => {
            //let { id } = req.params;

            console.log("** const **");
    });
