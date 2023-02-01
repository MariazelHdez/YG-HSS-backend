import express, { Request, Response } from "express";
import { param } from "express-validator";
import { GeneralRepository } from "../repository/GeneralRepository";
import { groupBy } from "../utils/groupBy";

const generalRepo = new GeneralRepository();

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
        const result = await generalRepo.getSubmissionsStatus(actionId, actionVal);
        const grouped = groupBy(result, i => i.status);
        const totals = [];        
        for (const status in grouped) {
            const group = grouped[status];
            let sum = 0;
            group.forEach((i) => {
                sum += i.submissions;
            });
            totals.push(
                { status: status, submissions: sum }
            );
        }
                
        res.send({data: totals});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});
