import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
import { SubmissionStatusRepository } from "../repository/oracle/SubmissionStatusRepository";
import knex from "knex";
import { DB_CONFIG_HIPMA, SCHEMA_HIPMA } from "../config";
import { groupBy , helper } from "../utils";
var _ = require('lodash');

const db = knex(DB_CONFIG_HIPMA)
const submissionStatusRepo = new SubmissionStatusRepository();
const path = require('path');
export const hipmaRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @param { action_id } action id.
 * @param { action_value } action value.
 * @return json
 */
hipmaRouter.get("/submissions/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {
    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissions(SCHEMA_HIPMA, actionId, actionVal, permissions);
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
hipmaRouter.get("/submissions/status/:action_id/:action_value", [
    param("action_id").notEmpty(), 
    param("action_value").notEmpty()
], async (req: Request, res: Response) => {

    try {

        const actionId = req.params.action_id;
        const actionVal = req.params.action_value;
        const permissions = req.user?.db_user.permissions ?? [];
        const result = await submissionStatusRepo.getModuleSubmissionsStatus(SCHEMA_HIPMA, actionId, actionVal, permissions);
                        
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
 * Obtain data to show in the dashboard view
 *
 * @return json
 */
hipmaRouter.post("/", async (req: Request, res: Response) => {

    try {
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var hipma = Object();
        var sqlFilter = "HEALTH_INFORMATION.STATUS = '1'";
        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }
        
        hipma = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`)
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI', '=', 'HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.ID')
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_', '=', 'HIPMA_COPY_HEALTH_INFORMATION.ID')
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_SITUATIONS`, 'HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_', '=', 'HIPMA_SITUATIONS.ID')
            .whereRaw(sqlFilter)
            .select('HEALTH_INFORMATION.ID','HEALTH_INFORMATION.CONFIRMATION_NUMBER',
                    'HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC',
                    'HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.DESCRIPTION AS ACCESS_PERSONAL_HEALTH_INFORMATION',
                    'HIPMA_COPY_HEALTH_INFORMATION.DESCRIPTION AS CP_HEALTH_INFO',
                    'HIPMA_SITUATIONS.DESCRIPTION AS HIPMA_SITUATIONS_DESC',
                    db.raw("(HEALTH_INFORMATION.FIRST_NAME ||  ' '||  HEALTH_INFORMATION.LAST_NAME) AS APPLICANT_FULL_NAME, "+
                        "TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT")
            )
            .orderBy('HEALTH_INFORMATION.CREATED_AT', 'ASC');

        hipma.forEach(function (value: any) {
            value.showUrl = "hipma/show/"+value.id;
        });

        res.send({data: hipma});

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
 * @param {hipma_id} id of request
 * @return json
 */
hipmaRouter.get("/validateRecord/:hipma_id",[param("hipma_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var hipma_id = Number(req.params.hipma_id);
        var hipma = Object();
        var flagExists = true;
        var message = "";
        var type = "error";

        hipma = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`)
            .where('HEALTH_INFORMATION.ID', hipma_id)
            .select(`${SCHEMA_HIPMA}.HEALTH_INFORMATION.*`)
            .then((data:any) => {
                return data[0];
            });


        if(!hipma || hipma.status == 2){
            flagExists = false;
            message = "The request you are consulting is closed or non existant, please choose a valid request.";
        }

        res.json({ status: 200, flagHipma: flagExists, message: message, type: type});

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
 * @param {hipma_id} id of request
 * @return json
 */
hipmaRouter.get("/show/:hipma_id",[param("hipma_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        let hipma_id = Number(req.params.hipma_id);

        var hipma = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`)
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI', '=', 'HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_', '=', 'HIPMA_COPY_HEALTH_INFORMATION.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_SITUATIONS`, 'HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_', '=', 'HIPMA_SITUATIONS.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_ACTIVITY_REQUEST`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST', '=', 'HIPMA_COPY_ACTIVITY_REQUEST.ID')
        .select(`HEALTH_INFORMATION.ID`, `HEALTH_INFORMATION.CONFIRMATION_NUMBER`, `HEALTH_INFORMATION.STATUS`,
                `HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_`,
                `HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI`,
                `HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_`,
                `HEALTH_INFORMATION.FIRST_NAME_BEHALF`,
                `HEALTH_INFORMATION.LAST_NAME_BEHALF`,
                `HEALTH_INFORMATION.COMPANY_OR_ORGANIZATION_OPTIONAL_BEHALF`,
                `HEALTH_INFORMATION.ADDRESS_BEHALF`, `HEALTH_INFORMATION.CITY_OR_TOWN_BEHALF`,
                `HEALTH_INFORMATION.POSTAL_CODE_BEHALF`, `HEALTH_INFORMATION.EMAIL_ADDRESS_BEHALF`,
                `HEALTH_INFORMATION.PHONE_NUMBER_BEHALF`, `HEALTH_INFORMATION.FIRST_NAME`, `HEALTH_INFORMATION.LAST_NAME`,
                db.raw(`TO_CHAR(HEALTH_INFORMATION.DATE_OF_BIRTH, 'yyyy-mm-dd')  AS DATE_OF_BIRTH,
                        TO_CHAR(HEALTH_INFORMATION.DATE_FROM_, 'yyyy-mm-dd')  AS DATE_FROM_,
                        TO_CHAR(HEALTH_INFORMATION.DATE_TO_, 'yyyy-mm-dd')  AS DATE_TO_,
                        CASE WHEN HEALTH_INFORMATION.DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE = 1 THEN 'Yes' ELSE 'No' END AS DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE,
                        CASE WHEN HEALTH_INFORMATION.I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_ = 1 THEN 'Yes' ELSE 'No' END AS I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_`
                    ),
                `HEALTH_INFORMATION.ADDRESS`, `HEALTH_INFORMATION.CITY_OR_TOWN`,
                `HEALTH_INFORMATION.POSTAL_CODE`, `HEALTH_INFORMATION.EMAIL_ADDRESS`, `HEALTH_INFORMATION.PHONE_NUMBER`,
                `HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_`,
                `HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST`,
                `HEALTH_INFORMATION.NAME_OF_HEALTH_AND_SOCIAL_SERVICES_PROGRAM_AREA_OPTIONAL_`,
                `HEALTH_INFORMATION.INDICATE_THE_HSS_SYSTEM_S_YOU_WOULD_LIKE_A_RECORD_OF_USER_ACTIV`,
                `HEALTH_INFORMATION.PROVIDE_DETAILS_ABOUT_YOUR_REQUEST_`,
                `HEALTH_INFORMATION.CREATED_AT`, `HEALTH_INFORMATION.UPDATED_AT`,
                `HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC`,
                `HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.DESCRIPTION AS ACCESS_PERSONAL_HEALTH_INFORMATION`,
                `HIPMA_COPY_HEALTH_INFORMATION.DESCRIPTION AS CP_HEALTH_INFO`,
                `HIPMA_SITUATIONS.DESCRIPTION AS HIPMA_SITUATIONS_DESC`,
                `HIPMA_COPY_ACTIVITY_REQUEST.DESCRIPTION AS CP_ACT_REQ`)
        .where("HEALTH_INFORMATION.ID", hipma_id)
        .first();

        if(!_.isEmpty(hipma.name_of_health_and_social_services_program_area_optional_)) {
            var dataString = "";
            var socialServices = Object();
            hipma.name_of_health_and_social_services_program_area_optional_ = JSON.parse(hipma.name_of_health_and_social_services_program_area_optional_.toString());

            socialServices = await db(`${SCHEMA_HIPMA}.HIPMA_HEALTH_SOCIAL_SERVICES_PROGRAM`).select().then((rows: any) => {
                let arrayResult = Object();
                for (let row of rows) {
                    arrayResult[row['id']] = row['description'];
                }
                return arrayResult;
            });

            _.forEach(hipma.name_of_health_and_social_services_program_area_optional_, function(value: any, key: any) {
                if(socialServices.hasOwnProperty(value)) {
                    dataString += socialServices[value]+",";
                }else{
                    dataString += value+",";
                }
            });

            if(dataString.substr(-1) == ",") {
                dataString = dataString.slice(0, -1);
            }

            hipma.name_of_health_and_social_services_program_area_optional_ = dataString.replace(/,/g, ', ');
        }

        if(!_.isEmpty(hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ)) {
            var dataString = "";
            var hssSystems = Object();
            hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = JSON.parse(hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ.toString());
            hssSystems = await db(`${SCHEMA_HIPMA}.HIPMA_HSS_SYSTEMS`).select().then((rows: any) => {
                let arrayResult = Object();
                for (let row of rows) {
                    arrayResult[row['id']] = row['description'];
                }
                return arrayResult;
            });

            _.forEach(hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ, function(value: any, key: any) {
                if(hssSystems.hasOwnProperty(value)) {
                    dataString += hssSystems[value]+",";
                }else{
                    dataString += value+",";
                }
            });

            if(dataString.substr(-1) == ",") {
                dataString = dataString.slice(0, -1);
            }

            hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = dataString.replace(/,/g, ', ');
        }
        var hipmaFiles = await db(`${SCHEMA_HIPMA}.HIPMA_FILES`).where("HIPMA_ID", hipma_id).select();
        var files = Object();

        if(!_.isEmpty(hipmaFiles)){

            _.forEach(hipmaFiles, function(value: any) {

                files[value.description] = { id: value.id,
                                            file_name: value.file_name,
                                            file_type: value.file_type,
                                            file_size: value.file_size,
                                            file_fullName: value.file_name+"."+value.file_type,
                                            file_data: value.file_data
                                        };

            });
        }

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'_'+dd+'_'+yyyy;
        let fileName = 'hipma_request_details_'+todayDate+".pdf";

        res.json({ hipma: hipma, hipmaFiles: files, fileName:fileName });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Store Hipma data
 *
 * @return json
 */
hipmaRouter.post("/store", async (req: Request, res: Response) => {

    try {
        var data = Object();
        var hipma = Object();
        let HipmaSaved = Object();
        var files = Object();

        data = req.body;
        hipma.CONFIRMATION_NUMBER = getConfirmationNumber();

        if(_.isEmpty(data.what_type_of_request_do_you_want_to_make_)) {
            hipma.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_ = null;
        }else{
            hipma.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_ =+data.what_type_of_request_do_you_want_to_make_;
        }
        if(_.isEmpty(data.are_you_requesting_access_to_your_own_personal_health_informatio)) {
            hipma.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI = null;
        }else{
            hipma.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI = +data.are_you_requesting_access_to_your_own_personal_health_informatio;
        }
        if(_.isEmpty(data.select_the_situation_that_applies_)) {
            hipma.SELECT_THE_SITUATION_THAT_APPLIES_ = null;
        }else{
            hipma.SELECT_THE_SITUATION_THAT_APPLIES_ = +data.select_the_situation_that_applies_;
        }

        hipma.FIRST_NAME_BEHALF = data.first_name_behalf;
        hipma.LAST_NAME_BEHALF = data.last_name_behalf;
        hipma.COMPANY_OR_ORGANIZATION_OPTIONAL_BEHALF = data.company_or_organization_optional_behalf;
        hipma.ADDRESS_BEHALF = data.address_behalf;
        hipma.CITY_OR_TOWN_BEHALF = data.city_or_town_behalf;
        hipma.POSTAL_CODE_BEHALF = data.postal_code_behalf;
        hipma.EMAIL_ADDRESS_BEHALF = data.email_address_behalf;
        hipma.PHONE_NUMBER_BEHALF = data.phone_number_behalf;

        if(!_.isEmpty(data._statutory_declaration_of_parental_or_guardianship_status)) {
            files._statutory_declaration_of_parental_or_guardianship_status = saveFile('_statutory_declaration_of_parental_or_guardianship_status', data);
        }

        if(!_.isEmpty(data._minor_s_consent_to_release_of_information_if_applicable_)) {
            files._minor_s_consent_to_release_of_information_if_applicable_ = saveFile('_minor_s_consent_to_release_of_information_if_applicable_', data);
        }

        if(!_.isEmpty(data._court_order_identifying_custody_of_the_minor)){
            files._court_order_identifying_custody_of_the_minor = saveFile('_court_order_identifying_custody_of_the_minor', data);
        }

        if(!_.isEmpty(data._statutory_declaration_of_substitute_decision_maker_status)) {
            files._statutory_declaration_of_substitute_decision_maker_status = saveFile('_statutory_declaration_of_substitute_decision_maker_status', data);
        }

        if(!_.isEmpty(data._physician_affirmation_confirm_auth)){
            files._physician_affirmation_confirm_auth = saveFile('_physician_affirmation_confirm_auth', data);
        }

        if(!_.isEmpty(data._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece)){
            files._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece = saveFile('_confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece', data);
        }

        if(!_.isEmpty(data._letters_of_administration_or_grant_of_probate)){
            files._letters_of_administration_or_grant_of_probate = saveFile('_letters_of_administration_or_grant_of_probate', data);
        }

        if(!_.isEmpty(data._consent_to_release_of_information)){
            files._consent_to_release_of_information = saveFile('_consent_to_release_of_information', data);
        }

        hipma.FIRST_NAME = data.first_name;
        hipma.LAST_NAME = data.last_name;
        data.date_of_birth = new Date(data.date_of_birth);

        let result: string =   data.date_of_birth.toISOString().split('T')[0];
        hipma.DATE_OF_BIRTH  = db.raw("TO_DATE('"+result+"','YYYY-MM-DD') ");

        hipma.ADDRESS = data.address;
        hipma.CITY_OR_TOWN = data.city_or_town;
        hipma.POSTAL_CODE = data.postal_code;
        hipma.EMAIL_ADDRESS = data.email_address;
        hipma.PHONE_NUMBER = data.phone_number;

        if(_.isEmpty(data.get_a_copy_of_your_health_information_)) {
            hipma.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_ = null;
        }else{
            hipma.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_ = +data.get_a_copy_of_your_health_information_;
        }

        if(_.isEmpty(data.get_a_copy_of_your_activity_request)) {
            hipma.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST = null;
        }else{
            hipma.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST = +data.get_a_copy_of_your_activity_request;
        }

        if(_.isEmpty(data.name_of_health_and_social_services_program_area_optional_) && !_.isArray(data.name_of_health_and_social_services_program_area_optional_)) {
            hipma.NAME_OF_HEALTH_AND_SOCIAL_SERVICES_PROGRAM_AREA_OPTIONAL_ = null;
        }else{
            hipma.NAME_OF_HEALTH_AND_SOCIAL_SERVICES_PROGRAM_AREA_OPTIONAL_ =  db.raw("utl_raw.cast_to_raw('"+ JSON.stringify(data.name_of_health_and_social_services_program_area_optional_)+ "') ");
       
        }
        if(_.isEmpty(data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi) && !_.isArray(data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi)) {
            hipma.INDICATE_THE_HSS_SYSTEM_S_YOU_WOULD_LIKE_A_RECORD_OF_USER_ACTIV = null;
        }else{
            hipma.INDICATE_THE_HSS_SYSTEM_S_YOU_WOULD_LIKE_A_RECORD_OF_USER_ACTIV = db.raw("utl_raw.cast_to_raw('"+ JSON.stringify(data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi)+ "') ");//await getDataByModel("HipmaHssSystems", data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi, "multi")
        }
        if(_.isEmpty(data.date_from_)) {
            hipma.DATE_FROM_ = null;
        }else{
            data.date_from_ = new Date(data.date_from_);
            let result: string =   data.date_from_.toISOString().split('T')[0];
            hipma.DATE_FROM_  = db.raw("TO_DATE('"+result+"','YYYY-MM-DD') ");
        }

        if(_.isEmpty(data.date_to_)) {
            hipma.DATE_TO_ = null;
        }else{
            data.date_to_ = new Date(data.date_to_);
            let result: string =   data.date_to_.toISOString().split('T')[0];
            hipma.DATE_TO_  = db.raw("TO_DATE('"+result+"','YYYY-MM-DD') ");
        }

        hipma.PROVIDE_DETAILS_ABOUT_YOUR_REQUEST_ = data.provide_details_about_your_request_;
        hipma.DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE = data.date_range_is_unknown_or_i_need_help_identifying_the_date_range;
        hipma.I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_ = data.i_affirm_the_information_above_to_be_true_and_accurate_;
        
        HipmaSaved = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`).insert(hipma).into(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`).returning('ID');
        if(!_.isEmpty(files)){
            var filesInsert = Array();
            var filesSaved =  true;
            _.forEach(files, async function(value: any) {
                var hipmaFiles = Object();

                let hipma_id = HipmaSaved.find((obj: any) => {return obj.id;});
                hipmaFiles.HIPMA_ID = hipma_id.id
                hipmaFiles.DESCRIPTION = value.description;
                hipmaFiles.FILE_NAME = value.file_name;
                hipmaFiles.FILE_TYPE = value.file_type;
                hipmaFiles.FILE_SIZE = value.file_size;
                let array_file = value.file_data.match(/.{1,4000}/g)
                let query = '';
                array_file.forEach((element: string) => {
                    query = query + " DBMS_LOB.APPEND(v_long_text, to_blob(utl_raw.cast_to_raw('" +element+"'))); ";
                });

                filesInsert.push(hipmaFiles);
                var filesSaved = await db.raw(`
                    DECLARE
                        v_long_text BLOB;
                    BEGIN
                        DBMS_LOB.CREATETEMPORARY(v_long_text,true);`
                        + query +
                    `
                        INSERT INTO ${SCHEMA_HIPMA}.HIPMA_FILES (HIPMA_ID, DESCRIPTION, FILE_NAME, FILE_TYPE, FILE_SIZE, FILE_DATA) VALUES (?,?,?,?, ?,v_long_text);
                    END;
                    `, [hipma_id.id, value.description, value.file_name,value.file_type,value.file_size]);
                if(!filesSaved){
                    res.json({ status:400, message: 'Request could not be processed' });
                }
            });

            if(HipmaSaved && filesSaved){
                res.json({ status:200, message: 'Request saved' });
            }
        }else if(HipmaSaved){
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
 * Change the status request to "closed"
 *
 * @param {hipma_id} id of request
 * @return json
 */
hipmaRouter.patch("/changeStatus", async (req: Request, res: Response) => {

    try {
        var hipma = req.body.params.requests;

        var updateStatus = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`).update({STATUS: "2"}).whereIn("ID", hipma);
        if(updateStatus) {
            let type = "success";
            let message = "Request status changed successfully.";

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
 * Download request file
 *
 * @param {hipmaFile_id} id of request
 * @return json
 */
hipmaRouter.get("/downloadFile/:hipmaFile_id",[param("hipmaFile_id").isInt().notEmpty()], async (req: Request, res: Response) => {

    try {
        var pathFile = "";
        var fs = require("fs");

        var hipmaFile_id = Number(req.params.hipmaFile_id);
        var hipmaFiles = await db(`${SCHEMA_HIPMA}.HIPMA_FILES`).where("ID", hipmaFile_id).select().first();
        var buffer = Buffer.from(hipmaFiles.file_data.toString(), 'base64');
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+hipmaFiles.file_name;
        let pathPublicFront = path.join(__dirname, "../../");
        pathFile = pathPublicFront+"/web/public/"+safeName+"."+hipmaFiles.file_type;

        fs.writeFileSync(pathFile, buffer);

        if(hipmaFiles) {
            res.json({ fileName: safeName+"."+hipmaFiles.file_type, fileType: hipmaFiles.file_type, filePath: pathFile});
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
 * Export file
 *
 * @param {request}
 * @return file
 */
hipmaRouter.post("/export", async (req: Request, res: Response) => {

    try {

        var requests = req.body.params.requests;
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var hipma = Object();
        var sqlFilter = "HEALTH_INFORMATION.STATUS = '1'";

        if(requests.length > 0){
            sqlFilter += " AND HEALTH_INFORMATION.ID IN ("+requests+")";
        }
        
        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }

        hipma = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`)
                .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
                .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI', '=', 'HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.ID')
                .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_', '=', 'HIPMA_COPY_HEALTH_INFORMATION.ID')
                .leftJoin(`${SCHEMA_HIPMA}.HIPMA_SITUATIONS`, 'HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_', '=', 'HIPMA_SITUATIONS.ID')
                .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_ACTIVITY_REQUEST`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST', '=', 'HIPMA_COPY_ACTIVITY_REQUEST.ID')
                .select( `HEALTH_INFORMATION.CONFIRMATION_NUMBER`, `HEALTH_INFORMATION.FIRST_NAME_BEHALF`,
                    `HEALTH_INFORMATION.LAST_NAME_BEHALF`, `HEALTH_INFORMATION.COMPANY_OR_ORGANIZATION_OPTIONAL_BEHALF`,
                    `HEALTH_INFORMATION.ADDRESS_BEHALF`, `HEALTH_INFORMATION.CITY_OR_TOWN_BEHALF`,
                    `HEALTH_INFORMATION.POSTAL_CODE_BEHALF`, `HEALTH_INFORMATION.EMAIL_ADDRESS_BEHALF`,
                    `HEALTH_INFORMATION.PHONE_NUMBER_BEHALF`, `HEALTH_INFORMATION.FIRST_NAME`, `HEALTH_INFORMATION.LAST_NAME`,
                    db.raw(`TO_CHAR(HEALTH_INFORMATION.DATE_OF_BIRTH, 'YYYY-MM-DD')  AS DATE_OF_BIRTH`),
                    `HEALTH_INFORMATION.ADDRESS`, `HEALTH_INFORMATION.CITY_OR_TOWN`,
                    `HEALTH_INFORMATION.POSTAL_CODE`, `HEALTH_INFORMATION.EMAIL_ADDRESS`, `HEALTH_INFORMATION.PHONE_NUMBER`, 
                    `HEALTH_INFORMATION.NAME_OF_HEALTH_AND_SOCIAL_SERVICES_PROGRAM_AREA_OPTIONAL_`,
                    `HEALTH_INFORMATION.INDICATE_THE_HSS_SYSTEM_S_YOU_WOULD_LIKE_A_RECORD_OF_USER_ACTIV`,
                    `HEALTH_INFORMATION.PROVIDE_DETAILS_ABOUT_YOUR_REQUEST_`,
                    db.raw(`TO_CHAR(HEALTH_INFORMATION.DATE_FROM_, 'YYYY-MM-DD')  AS DATE_FROM_,
                            TO_CHAR(HEALTH_INFORMATION.DATE_TO_, 'YYYY-MM-DD')  AS DATE_TO_`),
                    db.raw(`TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT,
                            TO_CHAR(HEALTH_INFORMATION.UPDATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS UPDATED_AT`
                        ),
                    `HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC`,
                    `HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.DESCRIPTION AS ACCESS_PERSONAL_HEALTH_INFORMATION`,
                    `HIPMA_COPY_HEALTH_INFORMATION.DESCRIPTION AS CP_HEALTH_INFO`,
                    `HIPMA_SITUATIONS.DESCRIPTION AS HIPMA_SITUATIONS_DESC`, `HIPMA_COPY_ACTIVITY_REQUEST.DESCRIPTION AS CP_ACT_REQ`,
                    db.raw( `CASE WHEN HEALTH_INFORMATION.DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE = 1 THEN 'Yes' ELSE 'No' END AS DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE,
                            CASE WHEN HEALTH_INFORMATION.I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_ = 1 THEN 'Yes' ELSE 'No' END AS I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_ `
                        )
                    )
                .whereRaw(sqlFilter);
        var socialServices = Object();
        var hssSystems = Object();

        socialServices = await db(`${SCHEMA_HIPMA}.HIPMA_HEALTH_SOCIAL_SERVICES_PROGRAM`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        hssSystems = await db(`${SCHEMA_HIPMA}.HIPMA_HSS_SYSTEMS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        hipma.forEach(function (value: any) {
            if(!_.isEmpty(value.name_of_health_and_social_services_program_area_optional_)) {
                var dataString = "";
                value.name_of_health_and_social_services_program_area_optional_ = JSON.parse(value.name_of_health_and_social_services_program_area_optional_.toString());
                _.forEach(value.name_of_health_and_social_services_program_area_optional_, function(value: any, key: any) {
                    if(socialServices.hasOwnProperty(value)) {
                        dataString += socialServices[value]+",";
                    }else{
                        dataString += value+",";
                    }
                });

                if(dataString.substr(-1) == ",") {
                    dataString = dataString.slice(0, -1);
                }

                value.name_of_health_and_social_services_program_area_optional_ = dataString.replace(/,/g, ', ');
            }

            if(!_.isEmpty(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ)) {
                var dataString = "";
                value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = JSON.parse(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ.toString());
                _.forEach(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ, function(value: any, key: any) {
                    if(hssSystems.hasOwnProperty(value)) {
                        dataString += hssSystems[value]+",";
                    }else{
                        dataString += value+",";
                    }
                });

                if(dataString.substr(-1) == ",") {
                    dataString = dataString.slice(0, -1);
                }

                value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = dataString.replace(/,/g, ', ');
            }

        });

        let today = new Date();
        let dd = String(today.getDate()).padStart(2, '0');
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let yyyy = today.getFullYear();
        let todayDate = mm+'-'+dd+'-'+yyyy;
        let random = (Math.random() + 1).toString(36).substring(7);
        let fileName = 'hipma_'+random+'_requests_'+todayDate+".xlsx";

        res.json({ data:hipma, fileName:fileName });

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

/**
 * Deletes downloaded file
 *
 * @param {file} name of file
 */
hipmaRouter.post("/deleteFile", async (req: Request, res: Response) => {
    try {

        var fs = require("fs");
        var file = req.body.params.file;
        let pathPublicFront = path.join(__dirname, "../../");
        var filePath = pathPublicFront+"/web/public/"+file;

        if(fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

    } catch(e) {
        console.log(e);  // debug if needed
        res.send( {
            status: 400,
            message: 'Request could not be processed'
        });
    }
});

hipmaRouter.post("/duplicates", async (req: Request, res: Response) => {
    try {
        var dateFrom = req.body.params.dateFrom;
        var dateTo = req.body.params.dateTo;
        var hipmaOriginal = Object();
        var hipmaDuplicate = Object();
        var hipma = Array();

        var sqlFilter = "HEALTH_INFORMATION.STATUS = '1'";

        if(dateFrom && dateTo ){
            sqlFilter += "  AND TO_CHAR(HIPMA_DUPLICATED_REQUESTS.CREATED_AT, 'yyyy-mm-dd') >= '"+dateFrom+"'  AND TO_CHAR(HIPMA_DUPLICATED_REQUESTS.CREATED_AT, 'yyyy-mm-dd') <= '"+dateTo+"'";
        }

        hipmaOriginal = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`, 'HIPMA_DUPLICATED_REQUESTS.ORIGINAL_ID', '=', 'HEALTH_INFORMATION.ID')
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
            .whereRaw(sqlFilter)
            .select('HEALTH_INFORMATION.ID AS HEALTH_INFORMATION_ID',
                    'HIPMA_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'HIPMA_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'HEALTH_INFORMATION.CONFIRMATION_NUMBER',
                    'HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC',
                    db.raw("(HEALTH_INFORMATION.FIRST_NAME|| ' '|| HEALTH_INFORMATION.LAST_NAME) AS APPLICANT_FULL_NAME, "+
                    "(HIPMA_DUPLICATED_REQUESTS.ID|| '-'|| HEALTH_INFORMATION.ID) AS UNIQUE_ID, "+
                    "TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT, "+
                    "TO_CHAR(HEALTH_INFORMATION.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH")
            ).orderBy("HEALTH_INFORMATION.CREATED_AT").then((rows: any) => {
                let arrayResult = Object();
                for (let row of rows) {
                    arrayResult[row['original_id']] = row;
                }

                return arrayResult;
            });

        hipmaDuplicate = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`)
            .join(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`, 'HIPMA_DUPLICATED_REQUESTS.DUPLICATED_ID', '=', 'HEALTH_INFORMATION.ID')
            .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
            .whereRaw(sqlFilter)
            .select('HEALTH_INFORMATION.ID AS HEALTH_INFORMATION_ID',
                    'HIPMA_DUPLICATED_REQUESTS.ID',
                    'HIPMA_DUPLICATED_REQUESTS.ORIGINAL_ID',
                    'HIPMA_DUPLICATED_REQUESTS.DUPLICATED_ID',
                    'HEALTH_INFORMATION.CONFIRMATION_NUMBER AS CONFIRMATION_NUMBER',
                    'HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC',
                    db.raw("(HEALTH_INFORMATION.FIRST_NAME || ' ' || HEALTH_INFORMATION.LAST_NAME) AS APPLICANT_FULL_NAME, "+
                    "(HIPMA_DUPLICATED_REQUESTS.ID|| '-'|| HEALTH_INFORMATION.ID) AS UNIQUE_ID, "+
                    "TO_CHAR(HEALTH_INFORMATION.CREATED_AT, 'YYYY-MM-DD HH24:MI:SS') AS CREATED_AT, "+
                    "TO_CHAR(HEALTH_INFORMATION.DATE_OF_BIRTH, 'YYYY-MM-DD') AS DATE_OF_BIRTH")
            ).orderBy("HEALTH_INFORMATION.CREATED_AT");

        let index = 0;
        hipmaDuplicate.forEach(function (value: any) {
            let url = "hipmaWarnings/details/"+value.id;
            delete value.id;

            hipma.push({
                health_information_id: null,
                id: null,
                original_id: null,
                duplicated_id: null,
                confirmation_number: null,
                hipma_request_type_desc: null,
                applicant_full_name: 'Duplicated #'+(index+1),
                created_at: 'ACTIONS:',
                date_of_birth: null,
                showUrl: url,
            });
            hipma.push(hipmaOriginal[value.original_id]);
            hipma.push(value);
            index = index + 1;
        });

        res.send({data: hipma});

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
 * @param {hipma_id} id of request
 * @return json
 */
hipmaRouter.get("/duplicates/details/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {

        let duplicate_id = Number(req.params.duplicate_id);
        var hipma = Object();
        var hipmaDuplicate = Object();
        var hipmaEntries = Object();
        var duplicateEntry = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`)
        .where("ID", Number(duplicate_id)).then((rows: any) => {
            let arrayResult = Object();
            for (let row of rows) {
                arrayResult.original = row['original_id'];
                arrayResult.duplicated = row['duplicated_id'];
            }
            return arrayResult;
        });
 
        hipmaEntries = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`)
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_TYPE`, 'HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_', '=', 'HIPMA_REQUEST_TYPE.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI', '=', 'HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_HEALTH_INFORMATION`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_', '=', 'HIPMA_COPY_HEALTH_INFORMATION.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_SITUATIONS`, 'HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_', '=', 'HIPMA_SITUATIONS.ID')
        .leftJoin(`${SCHEMA_HIPMA}.HIPMA_COPY_ACTIVITY_REQUEST`, 'HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST', '=', 'HIPMA_COPY_ACTIVITY_REQUEST.ID')
        .select(`HEALTH_INFORMATION.ID`, `HEALTH_INFORMATION.CONFIRMATION_NUMBER`, `HEALTH_INFORMATION.STATUS`,
                `HEALTH_INFORMATION.WHAT_TYPE_OF_REQUEST_DO_YOU_WANT_TO_MAKE_`,
                `HEALTH_INFORMATION.ARE_YOU_REQUESTING_ACCESS_TO_YOUR_OWN_PERSONAL_HEALTH_INFORMATI`,
                `HEALTH_INFORMATION.SELECT_THE_SITUATION_THAT_APPLIES_`,
                `HEALTH_INFORMATION.FIRST_NAME_BEHALF`,
                `HEALTH_INFORMATION.LAST_NAME_BEHALF`,
                `HEALTH_INFORMATION.COMPANY_OR_ORGANIZATION_OPTIONAL_BEHALF`,
                `HEALTH_INFORMATION.ADDRESS_BEHALF`, `HEALTH_INFORMATION.CITY_OR_TOWN_BEHALF`,
                `HEALTH_INFORMATION.POSTAL_CODE_BEHALF`, `HEALTH_INFORMATION.EMAIL_ADDRESS_BEHALF`,
                `HEALTH_INFORMATION.PHONE_NUMBER_BEHALF`, `HEALTH_INFORMATION.FIRST_NAME`, `HEALTH_INFORMATION.LAST_NAME`,
                db.raw(`TO_CHAR(HEALTH_INFORMATION.DATE_OF_BIRTH, 'yyyy-mm-dd')  AS DATE_OF_BIRTH,
                        TO_CHAR(HEALTH_INFORMATION.DATE_FROM_, 'yyyy-mm-dd')  AS DATE_FROM_,
                        TO_CHAR(HEALTH_INFORMATION.DATE_TO_, 'yyyy-mm-dd')  AS DATE_TO_,
                         CASE WHEN HEALTH_INFORMATION.DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE = 1 THEN 'Yes' ELSE 'No' END AS DATE_RANGE_IS_UNKNOWN_OR_I_NEED_HELP_IDENTIFYING_THE_DATE_RANGE,
                        CASE WHEN HEALTH_INFORMATION.I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_ = 1 THEN 'Yes' ELSE 'No' END AS I_AFFIRM_THE_INFORMATION_ABOVE_TO_BE_TRUE_AND_ACCURATE_`
                    ),
                `HEALTH_INFORMATION.ADDRESS`, `HEALTH_INFORMATION.CITY_OR_TOWN`,
                `HEALTH_INFORMATION.POSTAL_CODE`, `HEALTH_INFORMATION.EMAIL_ADDRESS`, `HEALTH_INFORMATION.PHONE_NUMBER`,
                `HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_HEALTH_INFORMATION_`, `HEALTH_INFORMATION.GET_A_COPY_OF_YOUR_ACTIVITY_REQUEST`,
                `HEALTH_INFORMATION.NAME_OF_HEALTH_AND_SOCIAL_SERVICES_PROGRAM_AREA_OPTIONAL_`,
                `HEALTH_INFORMATION.INDICATE_THE_HSS_SYSTEM_S_YOU_WOULD_LIKE_A_RECORD_OF_USER_ACTIV`,
                `HEALTH_INFORMATION.PROVIDE_DETAILS_ABOUT_YOUR_REQUEST_`,
                `HEALTH_INFORMATION.CREATED_AT`, `HEALTH_INFORMATION.UPDATED_AT`,
                `HIPMA_REQUEST_TYPE.DESCRIPTION AS HIPMA_REQUEST_TYPE_DESC`,
                `HIPMA_REQUEST_ACCESS_PERSONAL_HEALTH_INFORMATION.DESCRIPTION AS ACCESS_PERSONAL_HEALTH_INFORMATION`,
                `HIPMA_COPY_HEALTH_INFORMATION.DESCRIPTION AS CP_HEALTH_INFO`,
                `HIPMA_SITUATIONS.DESCRIPTION AS HIPMA_SITUATIONS_DESC`,
                `HIPMA_COPY_ACTIVITY_REQUEST.DESCRIPTION AS CP_ACT_REQ`)
        .whereIn("HEALTH_INFORMATION.ID", [duplicateEntry.original, duplicateEntry.duplicated])
        .where("HEALTH_INFORMATION.STATUS", "1");

        var socialServices = Object();
        var hssSystems = Object();

        socialServices = await db(`${SCHEMA_HIPMA}.HIPMA_HEALTH_SOCIAL_SERVICES_PROGRAM`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        hssSystems = await db(`${SCHEMA_HIPMA}.HIPMA_HSS_SYSTEMS`).select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        if(hipmaEntries){
            hipmaEntries.forEach(function (value: any) {
                if(!_.isEmpty(value.name_of_health_and_social_services_program_area_optional_)) {
                    var dataString = "";
                    value.name_of_health_and_social_services_program_area_optional_ = JSON.parse(value.name_of_health_and_social_services_program_area_optional_.toString());
                    _.forEach(value.name_of_health_and_social_services_program_area_optional_, function(value: any, key: any) {
                        if(socialServices.hasOwnProperty(value)) {
                            dataString += socialServices[value]+",";
                        }else{
                            dataString += value+",";
                        }
                    });

                    if(dataString.substr(-1) == ",") {
                        dataString = dataString.slice(0, -1);
                    }

                    value.name_of_health_and_social_services_program_area_optional_ = dataString.replace(/,/g, ', ');
                }

                if(!_.isEmpty(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ)) {
                    var dataString = "";
                    value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = JSON.parse(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ.toString());
                    _.forEach(value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ, function(value: any, key: any) {
                        if(hssSystems.hasOwnProperty(value)) {
                            dataString += hssSystems[value]+",";
                        }else{
                            dataString += value+",";
                        }
                    });

                    if(dataString.substr(-1) == ",") {
                        dataString = dataString.slice(0, -1);
                    }

                    value.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = dataString.replace(/,/g, ', ');
                }

                if(value.id == duplicateEntry.original){
                    hipma = value;
                }else if(value.id == duplicateEntry.duplicated){
                    hipmaDuplicate = value;
                }

            });
        }

        var hipmaFiles = await db(`${SCHEMA_HIPMA}.HIPMA_FILES`).where("HIPMA_ID", duplicateEntry.original).select();
        var hipmaFilesDuplicated = await db(`${SCHEMA_HIPMA}.HIPMA_FILES`).where("HIPMA_ID", duplicateEntry.duplicated).select();
        var files = Object();
        var filesDuplicated = Object();

        if(!_.isEmpty(hipmaFiles)){

            _.forEach(hipmaFiles, function(valueFiles: any) {

                files[valueFiles.description] = { id: valueFiles.id,
                                            file_name: valueFiles.file_name,
                                            file_type: valueFiles.file_type,
                                            file_size: valueFiles.file_size,
                                            file_fullName: valueFiles.file_name+"."+valueFiles.file_type,
                                            file_data: valueFiles.file_data
                                        };

            });
        }

        if(!_.isEmpty(hipmaFilesDuplicated)){

            _.forEach(hipmaFilesDuplicated, function(valueFilesDup: any) {

                filesDuplicated[valueFilesDup.description] = { id: valueFilesDup.id,
                                            file_name: valueFilesDup.file_name,
                                            file_type: valueFilesDup.file_type,
                                            file_size: valueFilesDup.file_size,
                                            file_fullName: valueFilesDup.file_name+"."+valueFilesDup.file_type,
                                            file_data: valueFilesDup.file_data
                                        };

            });
        }
        res.json({ hipma: hipma, hipmaDuplicate: hipmaDuplicate, hipmaFiles: files, hipmaFilesDuplicated: filesDuplicated});

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
 * @param {duplicate_id} id of request
 * @return json
 */
hipmaRouter.patch("/duplicates/primary", async (req: Request, res: Response) => {

    try {

        var warning = Number(req.body.params.warning);
        var request = Number(req.body.params.request);
        var type = req.body.params.type;
        var updateRequest = Object();
        var rejectWarning = Object();

        if(!request){
            rejectWarning = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`).where("ID", warning).del();
        }else{
            var warningRequest = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`).where("ID", warning).first();

            if(type == 'O'){
                updateRequest = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`).update({STATUS: "2"}).where("ID", Number(warningRequest.duplicated_id));
            }else if(type == 'D'){
                updateRequest = await db(`${SCHEMA_HIPMA}.HEALTH_INFORMATION`).update({STATUS: "2"}).where("ID", Number(warningRequest.original_id));
            }

            if(updateRequest){
                rejectWarning = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`).where("ID", warning).del();
            }
        }

        if(rejectWarning) {
            let type = "success";
            let message = "Warning updated successfully.";
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
 * Validate if warning is non existant
 *
 * @param {hipma_id} id of warning
 * @return json
 */
hipmaRouter.get("/duplicates/validateWarning/:duplicate_id",[param("duplicate_id").isInt().notEmpty()], async (req: Request, res: Response) => {
    try {
        var duplicate_id = Number(req.params.duplicate_id);
        var warning = Object();
        var flagExists = true;
        var message = "";
        var type = "error";

        warning = await db(`${SCHEMA_HIPMA}.HIPMA_DUPLICATED_REQUESTS`)
            .where('ID', duplicate_id)
            .select()
            .then((data:any) => {
              return data[0];
            });

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
 * Generate a new confirmation number similar to php's uniqid()
 *
 * @return id confirmation number
 */
function getConfirmationNumber() {

    var id = uniqid();

    // Convert to uppercase for better readability.
    id = id.toUpperCase().substring(0,9);

    return id;
}

/**
 * Generate a unix timestamp with microseconds and returns as hexidecimal. This gives us a relatively high certainty of uniquess.
 *
 * @return raw confirmation number
 */
function uniqid(prefix = "", random = false) {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");

    return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}`:""}`;
}

/**
 * Obtain file characteristics
 *
 * @param {field_name}
 * @param {data}
 * @return {filesHipma} array with file data
 */
function saveFile(field_name: any, data: any){
    var path = "";
    var fs = require("fs");
    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png"]

    if(data[field_name] !== 'undefined' && (data[field_name]) && data[field_name]['data'] !== 'undefined'){

        var filesHipma = Object();
        var buffer = Buffer.from(data[field_name]['data'], 'base64');
        let mime = data[field_name]['mime'];
        let name = data[field_name]['name'];
        let extension = mime.split("/");
        let fileName = name.split(".");
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+name;
        path = __dirname+'/'+safeName;

        fs.writeFileSync(path, buffer);

        // Obtain file's general information
        var stats = fs.statSync(path);

        // Convert the file size to megabytes
        var fileSizeInMegabytes = stats.size / (1024*1024);

        filesHipma["description"] = field_name;
        filesHipma["file_name"] = fileName[0];

        if(!allowedExtensions.includes(extension[1])){
            filesHipma["file_type"] = fileName[1];
        }else{
            filesHipma["file_type"] = extension[1];
        }

        filesHipma["file_size"] = fileSizeInMegabytes;
        filesHipma["file_data"] = data[field_name]['data'];

        fs.unlinkSync(path);
    }

    return filesHipma;
}
