import { DB_CONFIG_GENERAL, SCHEMA_GENERAL } from '../../config';
import { SubmissionsTotalDTO, SubmissionStatusDTO, PermissionDTO } from '../../models';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";

export class SubmissionStatusRepository extends BaseRepository<SubmissionStatusDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);
        
    async getSubmissionsStatus(actionId: string, actionVal: string, permissions: Array<PermissionDTO>): Promise<SubmissionStatusDTO[]> {
        let general = Object();
        let viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_STATUS_WEEK_V`;
        let whereClause = (builder: any) => {
            builder.where(1, "=", "1");

        }
       
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_STATUS_MONTH_V`;
            whereClause = (builder: any) => {
                builder.where("MONTHID", "=", monthId);
            };
        }
        
        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select('STATUS', 'COLOR')
                .sum("SUBMISSIONS", { as: "SUBMISSIONS"} )
                .max("PERMISSIONS", { as: "PERMISSIONS"} )
                .where(whereClause)
                .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name))
                .groupBy('STATUS', 'COLOR')
                .orderBy('STATUS', 'ASC');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }
    
    async getModuleSubmissionsStatus(module: string, actionId: string, actionVal: string, permissions: Array<PermissionDTO>): Promise<SubmissionStatusDTO[]> {

        let general = Object();
        let viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_STATUS_WEEK_V`;
        let whereClause = (builder: any) => {
            builder.where("ID", "=", module);
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_STATUS_MONTH_V`;
            whereClause = (builder: any) => {
                builder
                    .where("MONTHID", "=", monthId)
                    .andWhere("ID", "=", module);
            };
        }

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select('STATUS', 'COLOR')
                .sum("SUBMISSIONS", { as: "SUBMISSIONS"} )
                .max("PERMISSIONS", { as: "PERMISSIONS"} )
                .where(whereClause)
                .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name))
                .groupBy('STATUS', 'COLOR')
                .orderBy('STATUS', 'ASC');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }

    async getSubmissions(actionId: string, actionVal: string, permissions: Array<PermissionDTO>): Promise<SubmissionsTotalDTO[]> {
        let general = Object();
        let viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_WEEK_V`;
        let whereClause = (builder: any) => {
            builder.where(1, "=", "1");
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_MONTH_V`;
            whereClause = (builder: any) => {
                builder.where("MONTHID", "=", monthId);
            };
        }

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select("ID")
                .select("DEPARTMENT")
                .select("DATE_CODE")
                .select("SUBMISSIONS")
                .select("COLOR")
                .select("PERMISSIONS")
                .where(whereClause)
                .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name))
                .orderBy('DATE_CODE', 'ASC');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }

    async getModuleSubmissions(module: string, actionId: string, actionVal: string, permissions: Array<PermissionDTO>): Promise<SubmissionsTotalDTO[]> {
        let general = Object();
        let viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_WEEK_V`;
        let whereClause = (builder: any) => {
            builder.where("ID", "=", module);
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            viewName = `${SCHEMA_GENERAL}.SUBMISSIONS_MONTH_V`;
            whereClause = (builder: any) => {
                builder
                    .where("MONTHID", "=", monthId)
                    .andWhere("ID", "=", module);
            };
        }

        const submissionsStatusQuery = (db: Knex<any, unknown[]>, view: string) => {
            return db(view)
                .select("ID")
                .select("DEPARTMENT")
                .select("DATE_CODE")
                .select("SUBMISSIONS")
                .select("COLOR")
                .select("PERMISSIONS")
                .where(whereClause)
                .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name))
                .orderBy('DATE_CODE', 'ASC');
        }
        
        general = await submissionsStatusQuery(this.mainDb, viewName);
        
        return this.loadResults(general);
    }
}