import express, { Request, Response } from "express";
import { param } from "express-validator";
import knex from "knex";
import { DB_CONFIG_GENERAL } from "../config";
import { SubmissionStatusDTO } from "models/general";
var _ = require('lodash');

const db = knex(DB_CONFIG_GENERAL)

export const generalRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
generalRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        let general = Object();
        let viewName = "bizont_edms_general.submissions_status_week_v"
        let whereClause = (builder: any) => {
            builder.where(1, "=", "1")
        };
        if (actionId === "month") {
            viewName = "bizont_edms_general.submissions_status_month_v"
            const monthId = actionVal.slice(-6);
            whereClause = (builder: any) => {
                builder.where("monthid", "=", monthId)
            };
        }

        general = await db(viewName)
            .select('status')
            .count("submissions", { as: "submissions"} )
            .where(whereClause)
            .groupBy('status')
            .orderBy('status', 'asc');
        
        const result: Array<SubmissionStatusDTO> = [];
        general.forEach((row: any) => {
            result.push(
                {
                    id: row.id,
                    department: row.department,
                    submissions: row.submissions,
                    status: row.status

                } as SubmissionStatusDTO
            );
        });

        res.send({data: result});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});
