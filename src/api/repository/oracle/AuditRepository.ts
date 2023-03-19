import { AuditDTO, AuditTimelineDTO } from './../../models';
import { DB_CONFIG_GENERAL } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { PermissionDTO } from 'models';

export class AuditRepository extends BaseRepository<AuditDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_GENERAL);

    async getAudit(event_type: number): Promise<AuditDTO[]> {
        let general = Object();

        general = await this.mainDb("BIZONT_EDMS_GENERAL.AUDIT_V")
            .where("EVENT_TYPE", "=", event_type);
                
        return this.loadResults(general);
    }

    async getAuditTimeline(permissions: Array<PermissionDTO>): Promise<AuditTimelineDTO[]> {
        let general = Object();
        
        general = await this.mainDb("BIZONT_EDMS_GENERAL.AUDIT_TIMELINE_V")
        .whereIn("PERMISSIONS", permissions.map((x) => x.permission_name));

        return this.loadResults(general);
    }

}
