import { ConstellationHealthDemographicDTO, ConstellationHealthLanguageDTO } from './../../models/constellation/index';
import { ResultsDTO } from './../../models/base';
import { Request, Response } from "express";
import { ConstellationFamilyResultDTO, ConstellationHealthDTO, ConstellationStatusDTO, ConstellationFamilyDTO } from '../../models';
import { DB_CONFIG_CONSTELLATION, SCHEMA_CONSTELLATION } from '../../config';
import { BaseRepository } from '../BaseRepository';
import knex, { Knex } from "knex";
const _ = require('lodash');
export class ConstellationRepository extends BaseRepository<ConstellationHealthDTO> {

    mainDb: Knex<any, unknown> = knex(DB_CONFIG_CONSTELLATION);
    
    /**
     * Get all status from constellation status table.
     * 
     * @returns { ConstellationStatusDTO[] }
     */
    async getAllStatus() {
        var constellationStatus = Array();
        constellationStatus = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`).select().then((rows: any) => {
          let arrayResult = Array();
          for (let row of rows) {
              arrayResult.push({text: row['DESCRIPTION'], value: row['ID']});
          }
          return arrayResult;
        });
        return constellationStatus;
    }
    
    /**
     * Get All constellation health submissions.
     * 
     * @param req Request parameter.
     * @returns { ResultsDTO<ConstellationHealthDTO[], ConstellationStatusDTO[]> }
     */
    async getAll(req: Request): Promise<ResultsDTO<ConstellationHealthDTO[], ConstellationStatusDTO[]>> {
        console.log(req);
        var dateFrom = req.body?.params?.dateFrom ?? null;
        var dateTo = req.body?.params?.dateTo ?? null;
        let status_request = req.body?.params?.status ?? null;
        var sqlFilter = "CONSTELLATION_HEALTH.STATUS <> '4'";
         
        if (dateFrom && dateTo ){
            sqlFilter += `  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') >= '${dateFrom}'  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') <= '${dateTo}'`;
        }

        if(status_request){
           sqlFilter += `  AND constellation_health.status IN (${status_request})`;
        }

        var constellationHealth =  await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
            .select('CONSTELLATION_HEALTH.YOUR_LEGAL_NAME',
                    'CONSTELLATION_HEALTH.DATE_OF_BIRTH',
                    'CONSTELLATION_HEALTH.ID',
                    'CONSTELLATION_HEALTH.FAMILY_PHYSICIAN',
                    this.mainDb.raw('JSON_SERIALIZE(CONSTELLATION_HEALTH.DIAGNOSIS) AS DIAGNOSIS'),
                    'CONSTELLATION_HEALTH.CREATED_AT',
                    'CONSTELLATION_STATUS.DESCRIPTION as status',
                    'CONSTELLATION_HEALTH.ID as CONSTELLATION_HEALTH_ID')
            .whereRaw(sqlFilter)
            .orderBy('CONSTELLATION_HEALTH.ID', 'ASC');
        var diagnosis = Object();
        diagnosis = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['ID']] = row['DESCRIPTION'];
            }

            return arrayResult;
        });

        const constellationHealthData = this.loadResults(constellationHealth);
        const constellationResults: Array<ConstellationHealthDTO> = [];

        constellationHealthData.forEach((value: any) => {

            if (value.date_of_birth == 0) {
                value.date_of_birth =  "N/A";
            } else {
                value.date_of_birth =  value.date_of_birth.toLocaleDateString("en-CA");
            }

            value.created_at =  value.created_at.toLocaleString("en-CA");

            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }

            var dataString = "";
            const diagnosisData = value.diagnosis ? JSON.parse(value.diagnosis) : null;
            const diagnosisList: Array<any> = diagnosisData?.data ?? [];

            diagnosisList.forEach((x) => {

                if (x in diagnosis) {
                    dataString += diagnosis[x]+",";
                } else{
                    dataString += x+",";
                }

            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }
            value.diagnosis = dataString.replace(/,/g, ', ');
            value.showUrl = "constellation/show/" + value.constellation_health_id;
            constellationResults.push(value);
        });

        var constellationStatus = await this.getAllStatus();
        return { data: constellationResults, dataStatus: constellationStatus } as ResultsDTO<ConstellationHealthDTO[], ConstellationStatusDTO[]>;
    }

    /**
     * Validate record.
     * 
     * @param constellationHealth_id 
     * @returns { any }
     */
    async validateRecord(constellationHealth_id: number): Promise<any> {
        var constellationHealth = Object();
        var flagExists= true;
        var message= "";
        var type= "error";

        constellationHealth = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
            .where('CONSTELLATION_HEALTH.ID', constellationHealth_id)
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.*`,
                    'CONSTELLATION_STATUS.DESCRIPTION AS STATUS_DESCRIPTION')
            .first();

        if(!constellationHealth || constellationHealth.status_description == "CLOSED"){
            flagExists= false;
            message= "The request you are consulting is closed or non existant, please choose a valid request.";
        }

        return { status: 200, flagConstellation: flagExists, message: message, type: type};
    }

    /**
     * Get record by id.
     *
     * @param constellationHealth_id 
     * @returns { ConstellationFamilyResultDTO }
     */
    async getById(constellationHealth_id: number): Promise<ConstellationFamilyResultDTO> {
        let constellationHealthQuery = Object();
        let constellationFamilyQuery = Object();

        constellationHealthQuery = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH.LANGUAGE_PREFER_TO_RECEIVE_SERVICES', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH.DEMOGRAPHICS_GROUPS', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            .where('CONSTELLATION_HEALTH.ID', constellationHealth_id)
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.ID`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.STATUS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.FIRST_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.LAST_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.IS_THIS_YOUR_LEGAL_NAME_`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.YOUR_LEGAL_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PRONOUNS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DATE_OF_BIRTH`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.HAVE_YHCIP`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.HEALTH_CARE_CARD`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PROVINCE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.YHCIP`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.POSTAL_CODE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PREFER_TO_BE_CONTACTED`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PHONE_NUMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.EMAIL_ADDRESS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.LEAVE_PHONE_MESSAGE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.LANGUAGE_PREFER_TO_RECEIVE_SERVICES`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PREFERRED_LANGUAGE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.INTERPRETATION_SUPPORT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.FAMILY_PHYSICIAN`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.CURRENT_FAMILY_PHYSICIAN`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.ACCESSING_HEALTH_CARE`,
                    this.mainDb.raw(`JSON_SERIALIZE(${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DIAGNOSIS) AS DIAGNOSIS`),
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DEMOGRAPHICS_GROUPS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.INCLUDE_FAMILY_MEMBERS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.CREATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.UPDATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION`);

        constellationFamilyQuery = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.ID`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.FIRST_NAME_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.LAST_NAME_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.IS_THIS_YOUR_LEGAL_NAME__FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.YOUR_LEGAL_NAME_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.PRONOUNS_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.DATE_OF_BIRTH_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.HAVE_YHCIP_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.HEALTH_CARE_CARD_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.PROVINCE_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.YHCIP_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.RELATIONSHIP_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.PREFERRED_LANGUAGE_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.INTERPRETATION_SUPPORT_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.FAMILY_PHYSICIAN_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.CURRENT_FAMILY_PHYSICIAN_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.ACCESSING_HEALTH_CARE_FAMILY_MEMBER`,
                    this.mainDb.raw(`JSON_SERIALIZE(${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.DIAGNOSIS_FAMILY_MEMBER) AS DIAGNOSIS_FAMILY_MEMBER`),
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.CREATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.UPDATED_AT`,
                    'CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION_FAMILY_MEMBER',
                    'CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION_FAMILY_MEMBER')
            .where('CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID', constellationHealth_id);
        
        // Get just the first record.
        const constellationHealth: ConstellationHealthDTO = this.loadResults<ConstellationHealthDTO>(constellationHealthQuery)[0] ;
        const constellationFamily: ConstellationFamilyDTO[] = this.loadResults<ConstellationFamilyDTO>(constellationFamilyQuery);

        if (constellationHealth) {
            if (constellationHealth.date_of_birth == null) {
                constellationHealth.date_of_birth =  "N/A";
            } else {
                constellationHealth.date_of_birth =  constellationHealth.date_of_birth instanceof Date ? constellationHealth.date_of_birth.toLocaleDateString("en-CA") : "";
            }
    
            let dataString = "";
            var diagnosis = Object();
            
            diagnosis = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
                let arrayResult = Object();
    
                for (let row of rows) {
                    arrayResult[row['ID']] = row['DESCRIPTION'];
                }
    
                return arrayResult;
            });
    
            const diagnosisData = constellationHealth.diagnosis ? JSON.parse(constellationHealth.diagnosis) : null;
            const diagnosisList: Array<any> = diagnosisData?.data ?? [];
    
            diagnosisList.forEach((x) => {
    
                if (x in diagnosis) {
                    dataString += diagnosis[x]+",";
                } else{
                    dataString += x+",";
                }
    
            });
    
            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }
    
            constellationHealth.diagnosis = dataString.replace(/,/g, ', ');
    
            constellationHealth.flagFamilyMembers = false;
    
            //If the client has family members, the same treatment of the corresponding data is given.
            if (constellationFamily.length){
                constellationHealth.flagFamilyMembers = true;
    
                constellationFamily.forEach((value: any, key: any) => {
    
                    if(value.date_of_birth_family_member == 0) {
                        value.date_of_birth_family_member =  "N/A";
                    }
    
                    let dataString = "";
                    const diagnosisFmData = value.diagnosis_family_member ? JSON.parse(value.diagnosis_family_member) : null;
                    const diagnosisFmList: Array<any> = diagnosisFmData?.data ?? [];
    
                    diagnosisFmList.forEach((x) => {
    
                        if (x in diagnosis) {
                            dataString += diagnosis[x]+",";
                        } else{
                            dataString += x+",";
                        }
    
                    });
    
                    if(dataString.substr(-1) == ","){
                        dataString = dataString.slice(0, -1);
                    }
    
                    constellationFamily[key].diagnosis_family_member = dataString.replace(/,/g, ', ');
    
                });
            }
    
            const today = new Date();
            const dd = String(today.getDate()).padStart(2, '0');
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const yyyy = today.getFullYear();
            const todayDate = mm + '_' + dd + '_' + yyyy;
            const fileName = `constellation_request_details_${todayDate}.pdf`;
    
            const constellationStatus = await this.getAllStatus();
    
            return { status: 200, dataStatus: constellationStatus, data: constellationHealth, dataConstellationFamily: constellationFamily, fileName:fileName} as ConstellationFamilyResultDTO;
        }

        throw new Error("Record was not found.");
    }

    async getDemographics(): Promise<ConstellationHealthDemographicDTO[]> {
        const demographics = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).select();
        const result = this.loadResults<ConstellationHealthDemographicDTO>(demographics);
        return result;
    }

    async getDemographicsByValue(value: number): Promise<ConstellationHealthDemographicDTO[]> {
        const demographics = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).where({ value: value }).select();
        const result = this.loadResults<ConstellationHealthDemographicDTO>(demographics);
        return result;
    }

    async getLanguages(): Promise<ConstellationHealthLanguageDTO[]> {
        const languages = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`).select();
        const result = this.loadResults<ConstellationHealthLanguageDTO>(languages);
        return result;
    }

    async getLanguagesByValue(value: number): Promise<ConstellationHealthLanguageDTO[]> {
        const languages = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`).where({ value: value }).select();
        const result = this.loadResults<ConstellationHealthLanguageDTO>(languages);
        return result;
    }

    async create(item: ConstellationHealthDTO): Promise<number> {
        let constellationSaved = Object();
        constellationSaved = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).insert(item).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).returning('id');
        return constellationSaved;        
    }

    async createFamilyMembers(item: ConstellationFamilyDTO): Promise<number> {
        let itemSaved = Object();
        itemSaved = await this.mainDb(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`).insert(item).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`);
        return itemSaved;
    }

}
