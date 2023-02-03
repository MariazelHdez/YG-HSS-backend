import { DB_CONFIG_GENERAL } from '../config';
import { SubmissionsTotalDTO, SubmissionStatusDTO } from '../models/general/index';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";

export class SubmissionStatusRepository extends BaseRepository<SubmissionStatusDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);
        
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

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select('status')
                .sum("submissions", { as: "submissions"} )
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

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select('status')
                .sum("submissions", { as: "submissions"} )
                .where(whereClause)
                .groupBy('status')
                .orderBy('status', 'asc');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }

    async getSubmissions(actionId: string, actionVal: string): Promise<SubmissionsTotalDTO[]> {
        let general = Object();
        let viewName = "bizont_edms_general.submissions_week_v";
        let whereClause = (builder: any) => {
            builder.where(1, "=", "1");
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = "bizont_edms_general.submissions_month_v";
            whereClause = (builder: any) => {
                builder.where("monthid", "=", monthId);
            };
        }

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select("id")
                .select("department")
                .select("date_code")
                .select("submissions")
                .where(whereClause)
                .orderBy('date_code', 'asc');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }
}