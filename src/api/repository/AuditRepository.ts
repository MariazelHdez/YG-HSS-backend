import { AuditDTO, AuditTimelineDTO } from './../models/general/index';
import { DB_CONFIG_GENERAL } from '../config';
import { BaseRepository } from './BaseRepository';
import knex, { Knex } from "knex";
import { PermissionDTO } from 'models';

export class AuditRepository extends BaseRepository<AuditDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getAudit(event_type: number): Promise<AuditDTO[]> {
        let general = Object();

        general = await this.mainDb("bizont_edms_general.audit_v")
            .where("event_type", "=", event_type);
                
        return this.loadResults(general);
    }

    async getAuditTimeline(permissions: Array<PermissionDTO>): Promise<AuditTimelineDTO[]> {
        let general = Object();
        
        general = await this.mainDb("bizont_edms_general.audit_timeline_v")
        .whereIn("permissions", permissions.map((x) => x.permission_name));

        return this.loadResults(general);
    }

}
