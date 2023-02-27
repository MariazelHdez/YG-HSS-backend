import { AuditDTO, AuditTimelineDTO } from './../models/general/index';
import { DB_CONFIG_GENERAL } from '../config';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";

export class AuditRepository extends BaseRepository<AuditDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getAudit(event_type: number): Promise<AuditDTO[]> {
        let general = Object();

        general = await this.mainDb("bizont_edms_general.audit_v")
            .where("event_type", "=", event_type);
                
        return this.loadResults(general);
    }

    async getAuditTimeline(): Promise<AuditTimelineDTO[]> {
        let general = Object();
        
        general = await this.mainDb("bizont_edms_general.audit_timeline_v");
        
        return this.loadResults(general);
    }

}
