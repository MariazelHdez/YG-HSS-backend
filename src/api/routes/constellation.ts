import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_CONSTELLATION, SCHEMA_CONSTELLATION } from "../config";
import { groupBy, helper } from "../utils";
import { checkPermissions } from "../middleware/permissions";
var _ = require('lodash');

//let { RequireServerAuth, RequireAdmin } = require("../auth")

const db = knex(DB_CONFIG_CONSTELLATION)
const submissionStatusRepo = new SubmissionStatusRepository();
export const constellationRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
constellationRouter.get("/submissions/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissions(SCHEMA_CONSTELLATION, actionId, actionVal, permissions);
        const groupedId = groupBy(result, i => i.id);
        const labels = groupBy(result, i => i.date_code);
                        
        res.send(
            {
                data: groupedId,
                labels: labels
            });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
constellationRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissionsStatus(SCHEMA_CONSTELLATION, actionId, actionVal, permissions);
                        
        res.send({data: result});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
constellationRouter.post("/", async (req: Request, res: Response) => {

    try {
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        let status_request = req.body.params.status;
        var sqlFilter = "CONSTELLATION_HEALTH.STATUS <> '4'";
         
        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }

        if(status_request){
           sqlFilter += "  AND CONSTELLATION_HEALTH.STATUS IN ("+status_request+")";
        }

        var constellationHealth =  await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
            .select('CONSTELLATION_HEALTH.YOUR_LEGAL_NAME',
                    'CONSTELLATION_HEALTH.DATE_OF_BIRTH',
                    'CONSTELLATION_HEALTH.ID',
                    'CONSTELLATION_HEALTH.FAMILY_PHYSICIAN',
                    db.raw('JSON_SERIALIZE(CONSTELLATION_HEALTH.DIAGNOSIS) AS DIAGNOSIS'),
                    'CONSTELLATION_HEALTH.CREATED_AT',
                    'CONSTELLATION_STATUS.DESCRIPTION as STATUS',
                    'CONSTELLATION_HEALTH.ID as CONSTELLATION_HEALTH_ID')
            .whereRaw(sqlFilter)
            .orderBy('CONSTELLATION_HEALTH.ID', 'ASC');
        var diagnosis = Object();
        diagnosis = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['ID']] = row['DESCRIPTION'];
            }

            return arrayResult;
        });

        constellationHealth.forEach(function (value: any) {

            if(value.date_of_birth == 0) {
                value.date_of_birth =  "N/A";
            }else{
                value.date_of_birth =  value.date_of_birth.toLocaleDateString("en-CA");
            }

            value.created_at =  value.created_at.toLocaleString("en-CA");

            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }

            let dataString = "";
            const diagnosisList = helper.getJsonDataList(value.diagnosis);

            _.forEach(diagnosisList, function(valueDiagnosis: any, key: any) {

                if(valueDiagnosis in diagnosis){
                    dataString += diagnosis[valueDiagnosis]+",";
                }else{
                    dataString += valueDiagnosis+",";
                }
            });

            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }

            value.diagnosis = dataString.replace(/,/g, ', ');

            value.showUrl = "constellation/show/"+value.constellation_health_id;
        });

        var constellationStatus = await getAllStatus();
        res.send({data: constellationHealth, dataStatus: constellationStatus});
    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if request is non existant or with closed status
 *
 * @param {constellationHealth_id} id of request
 * @return json
 */
constellationRouter.get("/validateRecord/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var constellationHealth_id = Number(req.params.constellationHealth_id);
        var constellationHealth = Object();
        var flagExists= true;
        var message= "";
        var type= "error";

        constellationHealth = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
            .where('CONSTELLATION_HEALTH.ID', constellationHealth_id)
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.*`,
                    'CONSTELLATION_STATUS.DESCRIPTION AS STATUS_DESCRIPTION')
            .first();

        if(!constellationHealth || constellationHealth.status_description == "closed"){
            flagExists= false;
            message= "The request you are consulting is closed or non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagConstellation: flagExists, message: message, type: type});
    } catch(e) {
        console.log(e);
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtain data to show in details view
 *
 * @param {constellationHealth_id} id of request
 * @return json
 */
constellationRouter.get("/show/:constellationHealth_id", checkPermissions("constellation_view"), [param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var constellationHealth_id = Number(req.params.constellationHealth_id);
        var constellationHealth = Object();
        var constellationFamily = Object();

        constellationHealth = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
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
                    db.raw(`JSON_SERIALIZE(${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DIAGNOSIS) AS DIAGNOSIS`),
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DEMOGRAPHICS_GROUPS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.INCLUDE_FAMILY_MEMBERS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.CREATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.UPDATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION`)
            .first();

        constellationFamily = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`)
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
                    db.raw(`JSON_SERIALIZE(${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.DIAGNOSIS_FAMILY_MEMBER) AS DIAGNOSIS_FAMILY_MEMBER`),
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.CREATED_AT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS.UPDATED_AT`,
                    'CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION_FAMILY_MEMBER',
                    'CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION_FAMILY_MEMBER')
            .where('CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID', constellationHealth_id);

        if(constellationHealth.date_of_birth == 0) {
            constellationHealth.date_of_birth =  "N/A";
        }else{
            constellationHealth.date_of_birth =  constellationHealth.date_of_birth.toLocaleDateString("en-CA");
        }

        let dataString = "";
        var diagnosis = Object();

        diagnosis = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        const diagnosisList = helper.getJsonDataList(constellationHealth.diagnosis);

        _.forEach(diagnosisList, function(valueDiagnosis: any, key: any) {
            if(valueDiagnosis in diagnosis){
                dataString += diagnosis[valueDiagnosis]+",";
            }else{
                dataString += valueDiagnosis+",";
            }
        });

        if(dataString.substr(-1) == ","){
            dataString = dataString.slice(0, -1);
        }

        constellationHealth.diagnosis = dataString.replace(/,/g, ', ');

        constellationHealth.flagFamilyMembers = false;

        //If the client has family members, the same treatment of the corresponding data is given.
        if(constellationFamily.length){
            constellationHealth.flagFamilyMembers = true;

            constellationFamily.forEach(function (value: any, key: any) {

                if(value.date_of_birth_family_member == 0) {
                    value.date_of_birth_family_member =  "N/A";
                }

                let dataString = "";
                const diagnosisFmList = helper.getJsonDataList(value.diagnosis_family_member);

                _.forEach(diagnosisFmList, function(valueDiagnosisFm: any, key: any) {

                    if(valueDiagnosisFm in diagnosis){
                        dataString += diagnosis[valueDiagnosisFm]+",";
                    }else{
                        dataString += valueDiagnosisFm+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                constellationFamily[key].diagnosis_family_member = dataString.replace(/,/g, ', ');

            });
        }

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'constellation_request_details_'+todayDate+".pdf";

        var constellationStatus = await getAllStatus();

        
        res.json({ status: 200, dataStatus: constellationStatus, dataConstellation: constellationHealth, dataConstellationFamily: constellationFamily, fileName:fileName});
    } catch(e) {
        console.log(e);  // debug if needed

        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Store midwifery data
 *
 * @return json
 */
constellationRouter.post("/store", async (req: Request, res: Response) => {

    try {
        var data = Object();
        var constellationHealth = Object();
        var demographicsQuery = Object();
        var languagesQuery = Object();
        let constellationSaved = Object();

        data = req.body;
        constellationHealth.first_name = data.first_name;
        constellationHealth.last_name = data.last_name;
        constellationHealth.is_this_your_legal_name_ = data.is_this_your_legal_name_;

        let legal_name = "";
        if(!_.isUndefined(data.your_legal_name) &&  !_.isEmpty(data.your_legal_name )){
            legal_name = data.your_legal_name;
        }else{
            legal_name = data.first_name+" "+data.last_name;
        }

        constellationHealth.your_legal_name = legal_name;
        constellationHealth.pronouns = data.pronouns;
        constellationHealth.date_of_birth = data.date_of_birth;
        constellationHealth.yhcip = data.yhcip;
        constellationHealth.postal_code = data.postal_code;
        constellationHealth.phone_number = data.phone_number;
        constellationHealth.email_address = data.email_address;
        constellationHealth.current_family_physician = data.current_family_physician;
        constellationHealth.accessing_health_care = data.accessing_health_care;
        constellationHealth.leave_phone_message = data.leave_phone_message;
        constellationHealth.interpretation_support = data.interpretation_support;
        constellationHealth.family_physician = data.family_physician;
        constellationHealth.prefer_to_be_contacted = data.prefer_to_be_contacted;
        constellationHealth.have_yhcip = data.have_yhcip;
        constellationHealth.health_care_card = data.health_care_card;
        constellationHealth.province = data.province;

        languagesQuery = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`).where({ VALUE: data.language_prefer_to_receive_services }).select();
        const language = languagesQuery.length == 1 ? languagesQuery[0] : undefined;

        if (language){
            constellationHealth.language_prefer_to_receive_services = language.id;
        }

        if(data.language_prefer_to_receive_services !== ''){
            constellationHealth.preferred_language = data.other_language;
        }

        const diagnosisList = data.diagnosis.data;

        constellationHealth.diagnosis = await getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", diagnosisList);

        demographicsQuery = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).where({ VALUE: data.demographics_groups }).select();
        const demographic = demographicsQuery.length == 1 ? demographicsQuery[0] : undefined;

        if (demographic) {
            constellationHealth.demographics_groups = demographic.id;
        }

        constellationHealth.include_family_members = data.include_family_members;

        constellationSaved = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).insert(constellationHealth).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).returning('ID');

        if(!_.isEmpty(data.family_members_json) && data.family_members_json !== "[]"){
            var idConstellation = constellationSaved.find((obj: any) => {return obj.id;})

            var replaceString = data.family_members_json.replace("}]","}");
            var stringWithoutBrackets = replaceString.replace("[{","{");
            var stringSeparation = stringWithoutBrackets.replace("},{","}*SEPARATION*{");
            var arrayJson = stringSeparation.split("*SEPARATION*");

            var familyMembers = await dataFamilyMembers(idConstellation.id, arrayJson);
            var familyMembersSaved = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`).insert(familyMembers).into(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`);

            if(constellationSaved && familyMembersSaved){
                res.json({ status:200, message: 'Request saved' });
            }

        }else if(constellationSaved){
            res.json({ status:200, message: 'Request saved' });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});

/**
 * Obtain data to show in export file
 *
 * @param {status} status of request
 * @return json
 */
constellationRouter.post("/export/", async (req: Request, res: Response) => {
    try {
        var requests = req.body.params.requests;
        let status_request = req.body.params.status;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var constellationHealth = Object();
        var constellationFamily = Object();
        var sqlFilter = "CONSTELLATION_HEALTH.STATUS <> '4'";
        
        if(!_.isEmpty(requests)){
            sqlFilter += " AND CONSTELLATION_HEALTH.ID IN ("+requests+")";
        }
        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }
        if(status_request){
           sqlFilter += "  AND CONSTELLATION_HEALTH.STATUS IN ("+status_request+")";
        }
        constellationHealth = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH.LANGUAGE_PREFER_TO_RECEIVE_SERVICES', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH.DEMOGRAPHICS_GROUPS', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            .whereRaw(sqlFilter)
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.FIRST_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.LAST_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.IS_THIS_YOUR_LEGAL_NAME_`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.YOUR_LEGAL_NAME`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PRONOUNS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DATE_OF_BIRTH`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.HAVE_YHCIP`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.HEALTH_CARE_CARD`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.YHCIP`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.POSTAL_CODE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PREFER_TO_BE_CONTACTED`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.PHONE_NUMBER`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.EMAIL_ADDRESS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.LEAVE_PHONE_MESSAGE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.INTERPRETATION_SUPPORT`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.FAMILY_PHYSICIAN`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.CURRENT_FAMILY_PHYSICIAN`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.ACCESSING_HEALTH_CARE`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.DIAGNOSIS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.INCLUDE_FAMILY_MEMBERS`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.CREATED_AT`,
                    );

        constellationHealth.forEach(function (value: any) {

            if(value.date_of_birth == 0) {
                value.date_of_birth =  "N/A";
            }else{
                value.date_of_birth =  value.date_of_birth.toLocaleDateString("en-CA");
            }
                value.created_at =  value.created_at.toLocaleString("en-CA");
            
            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }
            
            var dataString = "";
            
            if(dataString.substr(-1) == ","){
                dataString = dataString.slice(0, -1);
            }
            
            value.diagnosis = dataString.replace(/,/g, ', ');
        });

    constellationFamily = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`)
        .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`,'CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID','CONSTELLATION_HEALTH.ID')
        .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
        .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
        .select('CONSTELLATION_HEALTH.FIRST_NAME AS FAMILYMEMBEROF' ,
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.FIRST_NAME_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.LAST_NAME_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.YOUR_LEGAL_NAME_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.PRONOUNS_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DATE_OF_BIRTH_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.HAVE_YHCIP_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.HEALTH_CARE_CARD_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.PROVINCE_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.YHCIP_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.RELATIONSHIP_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.PREFERRED_LANGUAGE_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.INTERPRETATION_SUPPORT_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.FAMILY_PHYSICIAN_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.CURRENT_FAMILY_PHYSICIAN_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.ACCESSING_HEALTH_CARE_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DIAGNOSIS_FAMILY_MEMBER',
                'CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION_FAMILY_MEMBER')
        .whereIn('CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID', requests);

        var diagnosis = Object();

        diagnosis = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });
        constellationHealth.flagFamilyMembers = false;

        //If the client has family members, the same treatment of the corresponding data is given.
        if(constellationFamily.length){
            constellationHealth.flagFamilyMembers = true;

            constellationFamily.forEach(function (value: any, key: any) {

                var date_of_birth : string= JSON.stringify(value.date_of_birth_family_member);
                value.date_of_birth_family_member ? 
                    value.date_of_birth_family_member= date_of_birth.substring(1, 11): 
                    value.date_of_birth_family_member =  "N/A";
                    
                if(value.date_of_birth_family_member == 0) {
                    value.date_of_birth_family_member =  "N/A";
                }

                let dataString = "";

                _.forEach(value.diagnosis_family_member, function(valueDiagnosisFm: any, key: any) {

                    if(valueDiagnosisFm in diagnosis){
                        dataString += diagnosis[valueDiagnosisFm]+",";
                    }else{
                        dataString += valueDiagnosisFm+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                constellationFamily[key].diagnosis_family_member = dataString.replace(/,/g, ', ');

            });
        }

        res.json({ status: 200, dataConstellation: constellationHealth, dataFamilyMembers: constellationFamily});
    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
    });


/**
 * Change the status request"
 *
 * @param {constellationHealth_id} id of request
 * @return json
 */

constellationRouter.patch("/changeStatus", async (req: Request, res: Response) => {
    try {
        var constellation_id = req.body.params.requests;
        var status_id = req.body.params.requestStatus;
        var updateStatus = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).update({status: status_id}).whereIn("ID", constellation_id);
        if(updateStatus) {
            let type = "success";
            let message = "Status changed successfully.";

            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

constellationRouter.post("/duplicates", async (req: Request, res: Response) => {

    try {

        var constellationOriginal = Object();
        var constellationDuplicate = Object();
        var constellation = Array();
        var sqlFilter = "CONSTELLATION_HEALTH.STATUS <> '4'";

        constellationOriginal =  await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`, 'CONSTELLATION_DUPLICATED_REQUESTS.CONSTELLATION_HEALTH_ORIGINAL_ID', '=', 'CONSTELLATION_HEALTH.ID')
            .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
            .select('CONSTELLATION_HEALTH.YOUR_LEGAL_NAME',
                    'CONSTELLATION_HEALTH.ID',
                    'CONSTELLATION_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                    'CONSTELLATION_HEALTH.ID AS CONSTELLATION_HEALTH_ID',
                    db.raw("TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                        "TO_CHAR(CONSTELLATION_HEALTH.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH"))
            .whereRaw(sqlFilter)
            .orderBy("CONSTELLATION_HEALTH.CREATED_AT").then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['constellation_health_original_id']] = row;
                }

                return arrayResult;
            });

        constellationDuplicate = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`)
        .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`, 'CONSTELLATION_DUPLICATED_REQUESTS.CONSTELLATION_HEALTH_ORIGINAL_ID', '=', 'CONSTELLATION_HEALTH.ID')
        .join(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`, 'CONSTELLATION_HEALTH.STATUS', '=', 'CONSTELLATION_STATUS.ID')
        .select('CONSTELLATION_HEALTH.YOUR_LEGAL_NAME',
                'CONSTELLATION_DUPLICATED_REQUESTS.ID',
                'CONSTELLATION_STATUS.DESCRIPTION AS STATUS_DESCRIPTION',
                'CONSTELLATION_HEALTH.ID AS CONSTELLATION_HEALTH_ID',
                db.raw("TO_CHAR(CONSTELLATION_HEALTH.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,"+
                    "TO_CHAR(CONSTELLATION_HEALTH.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH"))
        .whereRaw(sqlFilter)
        .orderBy("CONSTELLATION_HEALTH.CREATED_AT");

        let index = 0;

        constellationDuplicate.forEach(function (value: any) {

            let url = "constellationWarnings/details/"+value.id;

            constellation.push({
                constellation_health_id: null,
                id: null,
                constellation_health_original_id: null,
                constellation_health_duplicated_id: null,
                your_legal_name: 'Duplicated #'+(index+1),
                date_of_birth: null,
                status_description: null,
                created_at: 'ACTIONS:',
                showUrl: url
            });

            constellation.push(constellationOriginal[value.constellation_health_original_id]);
            constellation.push(value);
            index = index + 1;
        });

        res.send({data: constellation});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }

});


/**
 * Obtain data to show in details view
 *
 * @param id of request
 * @return json
 */
constellationRouter.get("/duplicates/details/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {

        let duplicate_id = Number(req.params.duplicate_id);
        var constellation = Object();
        var constellationDuplicate = Object();
        var constellationEntries = Object();
        var communityLocations = Object();
        var constellationFamilyOriginal = Object();
        var constellationFamilyDuplicated = Object();

        var duplicateEntry = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`)
        .where("id", duplicate_id).then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult.original = row['constellation_health_original_id'];
                arrayResult.duplicated = row['constellation_health_duplicated_id'];
            }

            return arrayResult;
        });

        constellationEntries = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH.LANGUAGE_PREFER_TO_RECEIVE_SERVICES', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH.DEMOGRAPHICS_GROUPS', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            //.where('constellation_health.id', constellationHealth_id)
            .select(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH.*`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION`,
                    `${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION`)
            .whereIn("CONSTELLATION_HEALTH.ID", [duplicateEntry.original, duplicateEntry.duplicated])
            .whereNot('CONSTELLATION_HEALTH.STATUS', '4');

        constellationFamilyOriginal = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            .select('CONSTELLATION_HEALTH_FAMILY_MEMBERS.*',
                    'CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION_FAMILY_MEMBER',
                    'CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION_FAMILY_MEMBER')
            .where('CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID', duplicateEntry.original);

        constellationFamilyDuplicated = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_FAMILY_MEMBERS`)
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.LANGUAGE_PREFER_TO_RECEIVE_SERVICES_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_LANGUAGE.ID')
            .leftJoin(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`, 'CONSTELLATION_HEALTH_FAMILY_MEMBERS.DEMOGRAPHICS_GROUPS_FAMILY_MEMBER', 'CONSTELLATION_HEALTH_DEMOGRAPHICS.ID')
            .select('CONSTELLATION_HEALTH_FAMILY_MEMBERS.*',
                    'CONSTELLATION_HEALTH_LANGUAGE.DESCRIPTION AS LANGUAGE_PREFER_DESCRIPTION_FAMILY_MEMBER',
                    'CONSTELLATION_HEALTH_DEMOGRAPHICS.DESCRIPTION AS DEMOGRAPHIC_DESCRIPTION_FAMILY_MEMBER')
            .where('CONSTELLATION_HEALTH_FAMILY_MEMBERS.CONSTELLATION_HEALTH_ID', duplicateEntry.duplicated);

        let dataString = "";
        var diagnosis = Object();

        diagnosis = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        if(constellationEntries){
            constellationEntries.forEach(function (value: any) {

                _.forEach(value.diagnosis, function(valueDiagnosis: any, key: any) {
                    if(valueDiagnosis in diagnosis){
                        dataString += diagnosis[valueDiagnosis]+",";
                    }else{
                        dataString += valueDiagnosis+",";
                    }
                });

                if(dataString.substr(-1) == ","){
                    dataString = dataString.slice(0, -1);
                }

                value.diagnosis = dataString.replace(/,/g, ', ');

                value.flagFamilyMembers = false;

                if(value.id == duplicateEntry.original){
                    constellation = value;

                    if(constellationFamilyOriginal.length){
                        value.flagFamilyMembers = true;
    
                        constellationFamilyOriginal.forEach(function (value: any, key: any) {
    
                            if(value.date_of_birth_family_member == 0) {
                                value.date_of_birth_family_member =  "N/A";
                            }
    
                            let dataString = "";
    
                            _.forEach(value.diagnosis_family_member, function(valueDiagnosisFm: any, key: any) {
    
                                if(valueDiagnosisFm in diagnosis){
                                    dataString += diagnosis[valueDiagnosisFm]+",";
                                }else{
                                    dataString += valueDiagnosisFm+",";
                                }
                            });
    
                            if(dataString.substr(-1) == ","){
                                dataString = dataString.slice(0, -1);
                            }
    
                            constellationFamilyOriginal[key].diagnosis_family_member = dataString.replace(/,/g, ', ');
    
                        });
                    }

                }else if(value.id == duplicateEntry.duplicated){
                    constellationDuplicate = value;

                    if(constellationFamilyDuplicated.length){
                        value.flagFamilyMembers = true;

                        constellationFamilyDuplicated.forEach(function (value: any, key: any) {

                            if(value.date_of_birth_family_member == 0) {
                                value.date_of_birth_family_member =  "N/A";
                            }

                            let dataString = "";

                            _.forEach(value.diagnosis_family_member, function(valueDiagnosisFm: any, key: any) {

                                if(valueDiagnosisFm in diagnosis){
                                    dataString += diagnosis[valueDiagnosisFm]+",";
                                }else{
                                    dataString += valueDiagnosisFm+",";
                                }
                            });

                            if(dataString.substr(-1) == ","){
                                dataString = dataString.slice(0, -1);
                            }

                            constellationFamilyDuplicated[key].diagnosis_family_member = dataString.replace(/,/g, ', ');

                        });
                    }

                }

            });
        }

        res.json({  dataConstellation: constellation, dataConstellationDuplicate: constellationDuplicate,
                    dataConstellationFamily: constellationFamilyOriginal,
                    dataConstellationFamilyDuplicated: constellationFamilyDuplicated
                });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Validate if warning is non existant
 *
 * @param {duplicate_id} id of warning
 * @return json
 */
constellationRouter.get("/duplicates/validateWarning/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var duplicate_id = Number(req.params.duplicate_id);
        var warning = Object();
        var flagExists = true;
        var message = "";
        var type = "error";

        warning = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`)
            .where('id', duplicate_id)
            .select()
            .first();

        if(!warning){
            flagExists = false;
            message = "The request you are consulting is non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagWarning: flagExists, message: message, type: type});

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Reject duplicate warning
 *
 * @param {warning}
 * @param {request}
 * @return json
 */
constellationRouter.patch("/duplicates/primary", async (req: Request, res: Response) => {

    try {

        var warning = Number(req.body.params.warning);
        var request = Number(req.body.params.request);
        var type = req.body.params.type;
        var updateRequest = Object();
        var rejectWarning = Object();
        let message = "Warning updated successfully.";

        if(!request){
            message = "Warning deleted successfully.";
            rejectWarning = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`).where("id", warning).del();
        }else{
            var warningRequest = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`).where("id", warning).first();

            if(type == 'O'){
                updateRequest = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).update({status: "4"}).where("id", warningRequest.constellation_health_duplicated_id);
            }else if(type == 'D'){
                updateRequest = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH`).update({status: "4"}).where("id", warningRequest.constellation_health_original_id);
            }

            if(updateRequest){
                rejectWarning = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_DUPLICATED_REQUESTS`).where("id", warning).del();
            }

        }

        if(rejectWarning) {
            let type = "success";
            res.json({ status:200, message: message, type: type });
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Obtains and transforms the data for storage
 *
 * @param {idConstellationHealth} id of saved ConstellationHealth record
 * @param {arrayMembers} array of family members information
 * @return {familyMembersInsert}
 */
async function dataFamilyMembers(idConstellationHealth:number, arrayMembers:any){

    var familyMembersInsert = Array();
    var i = 0;
    var dataMember = Object();
    var languages = Object();
    var demographics = Object();

    languages = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_LANGUAGE`).select().then((rows: any) => {
                let arrayResult = Object();

                for (let row of rows) {
                    arrayResult[row['value']] = row['id'];
                }

                return arrayResult;
    });

    demographics = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['value']] = row['id'];
            }

            return arrayResult;
    });

    for (let index = 0; index < arrayMembers.length; index++) {

        dataMember = (0, eval)('(' + arrayMembers[index] + ')');
        let constellationFamilyMembers = Object();

        constellationFamilyMembers.constellation_health_id = idConstellationHealth;
        constellationFamilyMembers.first_name_family_member = dataMember['first_name_family_member'];
        constellationFamilyMembers.last_name_family_member = dataMember['last_name_family_member'];
        constellationFamilyMembers.is_this_your_legal_name__family_member = dataMember['is_this_your_legal_name_family_member'];

        let legal_name = dataMember['your_legal_name_family_member'];
        
        
        if(!_.isEmpty(legal_name)){
            legal_name = dataMember['first_name_family_member']+" "+dataMember['last_name_family_member'];
        }

        constellationFamilyMembers.your_legal_name_family_member = legal_name;
        constellationFamilyMembers.pronouns_family_member = dataMember['pronouns_family_member'];
        constellationFamilyMembers.date_of_birth_family_member = dataMember['date_of_birth_family_member'];
        constellationFamilyMembers.yhcip_family_member = dataMember['yhcip_family_member'];
        constellationFamilyMembers.relationship_family_member = dataMember['relationship_family_member'];
        constellationFamilyMembers.current_family_physician_family_member = dataMember['current_family_physician_family_member'];
        constellationFamilyMembers.accessing_health_care_family_member = dataMember['accessing_health_care_family_member'];
        constellationFamilyMembers.interpretation_support_family_member = dataMember['interpretation_support_family_member'];
        constellationFamilyMembers.family_physician_family_member = dataMember['family_physician_family_member'];
        constellationFamilyMembers.have_yhcip_family_member = dataMember['have_yhcip_family_member'];
        constellationFamilyMembers.health_care_card_family_member = dataMember['health_care_card_family_member'];
        constellationFamilyMembers.province_family_member = dataMember['province_family_member'];

        if(dataMember['language_prefer_to_receive_services_family_member'] in languages){
            constellationFamilyMembers.language_prefer_to_receive_services_family_member = languages[dataMember['language_prefer_to_receive_services_family_member']];
        }else{
            constellationFamilyMembers.language_prefer_to_receive_services_family_member = null;
        }

        constellationFamilyMembers.preferred_language_family_member = dataMember['other_language_family_member'];

        constellationFamilyMembers.diagnosis_family_member = await getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", dataMember['diagnosis_family_member']);//'{1,6,"custom diagnosis"}';

        if(dataMember['demographics_groups_family_member'] in demographics){
            constellationFamilyMembers.demographics_groups_family_member = demographics[dataMember['demographics_groups_family_member']];
        }

        familyMembersInsert.push(constellationFamilyMembers);
    }

    return familyMembersInsert;
}

async function getAllStatus(){
  var constellationStatus = Array();
  constellationStatus = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_STATUS`).select().then((rows: any) => {
    let arrayResult = Array();
    for (let row of rows) {
        arrayResult.push({text: row['description'], value: row['id']});
    }
    return arrayResult;
  });
  return constellationStatus;
}
/**
 * Transforms given array to the allowed database array format and replaces information with catalogue data.
 *
 * @param {model} name of catalogue
 * @param {names} array of information
 * @return {array}
 */
async function getMultipleIdsByModel(model: string, names: any) {
    var others = "";
    var auxNames = names;
    var data = Object();
    var diagnosisHistory = Object();
    var demographics = Object();

    if(model == "ConstellationHealthDiagnosisHistory") {
        diagnosisHistory = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`).select().then((rows: any) => {
                                    let arrayResult = Object();
                                    for (let row of rows) {
                                        arrayResult[row['value']] = row['description'];
                                    }

                                    return arrayResult;
                                });

        names.forEach(function (value: any, key: any) {
            if(!diagnosisHistory.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DIAGNOSIS_HISTORY`)
                        .select(
                            db.raw(`JSON_OBJECT('data' VALUE JSON_ARRAYAGG(ID)) AS DATA`)
                        )
                        .whereIn('VALUE', names);
        data = data[0].data;
        return data;

    }else if(model == "ConstellationHealthDemographics") {

        demographics = await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`).select().then((rows: any) => {
                            let arrayResult = Object();
                            for (let row of rows) {
                                arrayResult[row['value']] = row['description'];
                            }

                            return arrayResult;
                        });

        names.forEach(function (value: any, key: any) {
            if(!demographics.hasOwnProperty(value)){
                others = names[key];
                names.splice(key, 1);
            }
        });

        data =  await db(`${SCHEMA_CONSTELLATION}.CONSTELLATION_HEALTH_DEMOGRAPHICS`)
                        .select()
                        .whereIn('value', names);
    }

    if(data.length){
        var modelValues = "";
        var max = data.length;
        var count = 1;
        if(max == 1){
            modelValues = data[0].id.toString();
        }else{
            data.forEach(function (value: any) {
                if(count == max){
                    modelValues += value.id.toString();
                }else{
                    modelValues += value.id.toString()+",";
                }

                count++;
            });
        }

        if(others !== "") {
            return "{"+modelValues+","+others+"}";
        }else{
            return "{"+modelValues+"}";
        }

    }else if(!data.length && auxNames.length > 0){
        return "{"+auxNames[0]+"}";
    }else{
        return null;
    }
}