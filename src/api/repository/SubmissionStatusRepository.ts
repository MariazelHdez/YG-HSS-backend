import { DB_CONFIG_GENERAL } from '../config';
import { SubmissionStatusDTO } from '../models/general/index';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";

export class SubmissionStatusRepository extends BaseRepository<SubmissionStatusDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    loadResults(data: Array<any>): Array<SubmissionStatusDTO> {
        const result: Array<SubmissionStatusDTO> = [];
        data.forEach((row) => {
            result.push(
                {
                    id: row.id,
                    department: row.department,
                    submissions: parseInt(row.submissions),
                    status: row.status

                } as SubmissionStatusDTO
            );
        });
        return result;
    }
    
    async getSubmissionsStatus(actionId: string, actionVal: string): Promise<SubmissionStatusDTO[]> {
        let general = Object();
        let viewName = "bizont_edms_general.submissions_status_week_v";
        let whereClause = (builder: any) => {
            builder.where(1, "=", "1");
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = "bizont_edms_general.submissions_status_month_v";
            whereClause = (builder: any) => {
                builder.where("monthid", "=", monthId);
            };
        }

        const submissionsStatusQuery = async (db: Knex<any, unknown[]>, view: string) => {
            return await db(view)
                .select('status')
                .count("submissions", { as: "submissions"} )
                .where(whereClause)
                .groupBy('status')
                .orderBy('status', 'asc');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }
    
    async getModuleSubmissionsStatus(module: string, actionId: string, actionVal: string): Promise<SubmissionStatusDTO[]> {

        let general = Object();
        let viewName = "bizont_edms_general.submissions_status_week_v";
        let whereClause = (builder: any) => {
            builder.where("id", "=", module);
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = "bizont_edms_general.submissions_status_month_v";
            whereClause = (builder: any) => {
                builder
                    .where("monthid", "=", monthId)
                    .andWhere("id", "=", module);
            };
        }

        const submissionsStatusQuery = async (db: Knex<any, unknown[]>, view: string) => {
            return await db(view)
                .select('status')
                .count("submissions", { as: "submissions"} )
                .where(whereClause)
                .groupBy('status')
                .orderBy('status', 'asc');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }
}