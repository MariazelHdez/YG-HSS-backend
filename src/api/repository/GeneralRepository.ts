import { SubmissionStatusDTO } from './../models/general/index';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";
import { DB_CONFIG_CONSTELLATION, DB_CONFIG_MIDWIFERY } from "../config";

export class GeneralRepository extends BaseRepository<SubmissionStatusDTO> {
    
    async getSubmissionsStatus(actionId: string, actionVal: string): Promise<SubmissionStatusDTO[]> {
        let constellations = Object();
        let midwifery = Object();                
        const dbC = knex(DB_CONFIG_CONSTELLATION);
        const dbM = knex(DB_CONFIG_MIDWIFERY);

        let submissionsStatusQuery = async (db: Knex<any, unknown[]>, schema: string, tableA: string, tableB:string, title: string) => {
            return await db({ ch: `${schema}.${tableA}` })
            .join({ cs: `${schema}.${tableB}`}, "ch.status", "=", "cs.id")
            .select(db.raw("? as ??", [schema, "id"]))
            .select(db.raw("? as ??", [title, "department"]))
            .count("ch.id", {as: "submissions"})
            .select({status: "cs.description"})
            .where(db.raw("ch.created_at > (CURRENT_DATE - '7 days'::interval)"))
            .groupBy("cs.id", "cs.description", "ch.status");
        }
        
        if (actionId === "month") {
            const monthId = actionVal.slice(-6);
            submissionsStatusQuery = async (db: Knex<any, unknown[]>, schema: string, tableA: string, tableB:string, title: string) => {
                return await db({ ch: `${schema}.${tableA}` })
                .join({ cs: `${schema}.${tableB}`}, "ch.status", "=", "cs.id")
                .select(db.raw("? as ??", [schema, "id"]))
                .select(db.raw("? as ??", [title, "department"]))
                .count("ch.id", {as: "submissions"})
                .select({status: "cs.description"})
                .where(db.raw(`to_char(ch.created_at, 'yyyymm'::text) = '${monthId}'`))
                .groupBy(db.raw("(to_char(ch.created_at, 'yyyymm'::text)), cs.id"));
            }
        }
        
        constellations = await submissionsStatusQuery(dbC, "bizont_edms_constellation_health", "constellation_health", "constellation_status", "Constellation Health");
        midwifery = await submissionsStatusQuery(dbM, "bizont_edms_midwifery", "midwifery_services", "midwifery_status", "Midwifery Services");
        const result: Array<SubmissionStatusDTO> = [];
        const loadResults = (data: Array<any>) => {
            data.forEach((row) => {
                result.push(
                    {
                        id: row.id,
                        department: row.department,
                        submissions: row.submissions,
                        status: row.status
    
                    } as SubmissionStatusDTO
                );
            });
        }
                
        loadResults(constellations);
        loadResults(midwifery);

        return result;
    }
}