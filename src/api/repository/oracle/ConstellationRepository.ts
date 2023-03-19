import { ConstellationHealthDTO } from '../../models';
import { DB_CONFIG_CONSTELLATION } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
import { PermissionDTO } from 'models';

export class ConstellationRepository extends BaseRepository<ConstellationHealthDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_CONSTELLATION);
    
    

}
