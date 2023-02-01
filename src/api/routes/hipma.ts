import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_HIPMA } from "../config";
var _ = require('lodash');

const db = knex(DB_CONFIG_HIPMA)

export const hipmaRouter = express.Router();

/**
 * Obtain data to show in the index view
 *
 * @return json
 */
hipmaRouter.get("/", async (req: Request, res: Response) => {

    try {

        var hipma = Object();

        hipma = await db("bizont_edms_hipma.health_information")
            .leftJoin('bizont_edms_hipma.hipma_request_type', 'health_information.what_type_of_request_do_you_want_to_make_', '=', 'hipma_request_type.id')
            .leftJoin('bizont_edms_hipma.hipma_request_access_personal_health_information', 'health_information.are_you_requesting_access_to_your_own_personal_health_informatio', '=', 'hipma_request_access_personal_health_information.id')
            .leftJoin('bizont_edms_hipma.hipma_copy_health_information', 'health_information.get_a_copy_of_your_health_information_', '=', 'hipma_copy_health_information.id')
            .leftJoin('bizont_edms_hipma.hipma_situations', 'health_information.select_the_situation_that_applies_', '=', 'hipma_situations.id')
            .select('health_information.*',
                    'hipma_request_type.description as HipmaRequestType',
                    'hipma_request_access_personal_health_information.description as AccessPersonalHealthInformation',
                    'hipma_copy_health_information.description as CopyHealthInformation',
                    'hipma_situations.description as HipmaSituations',
                    db.raw("concat(health_information.first_name, ' ', health_information.last_name) as applicantFullName")
                    )
            .where('health_information.status', 'open')
            .orderBy('health_information.created_at', 'asc');

        hipma.forEach(function (value: any) {
            value.created_at =  value.created_at.toLocaleString("en-CA");

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

        hipma = await db("bizont_edms_hipma.health_information")
            .where('health_information.id', hipma_id)
            .select('bizont_edms_hipma.health_information.*')
            .first();

        if(!hipma || hipma.status == "closed"){
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

        var hipma = await db("bizont_edms_hipma.health_information")
        .leftJoin('bizont_edms_hipma.hipma_request_type', 'health_information.what_type_of_request_do_you_want_to_make_', '=', 'hipma_request_type.id')
        .leftJoin('bizont_edms_hipma.hipma_request_access_personal_health_information', 'health_information.are_you_requesting_access_to_your_own_personal_health_informatio', '=', 'hipma_request_access_personal_health_information.id')
        .leftJoin('bizont_edms_hipma.hipma_copy_health_information', 'health_information.get_a_copy_of_your_health_information_', '=', 'hipma_copy_health_information.id')
        .leftJoin('bizont_edms_hipma.hipma_situations', 'health_information.select_the_situation_that_applies_', '=', 'hipma_situations.id')
        .leftJoin('bizont_edms_hipma.hipma_copy_activity_request', 'health_information.get_a_copy_of_your_activity_request', '=', 'hipma_copy_activity_request.id')
        .select('bizont_edms_hipma.health_information.*',
                'bizont_edms_hipma.hipma_request_type.description as HipmaRequestType',
                'bizont_edms_hipma.hipma_request_access_personal_health_information.description as AccessPersonalHealthInformation',
                'bizont_edms_hipma.hipma_copy_health_information.description as CopyHealthInformation',
                'bizont_edms_hipma.hipma_situations.description as HipmaSituations',
                'bizont_edms_hipma.hipma_copy_activity_request.description as HipmaCopyActivityRequest')
        .where("health_information.id", hipma_id)
        .first();

        if(!_.isEmpty(hipma.date_from_)) {
            hipma.date_from_ =   hipma.date_from_.toLocaleString("en-CA");
        }

        if(!_.isEmpty(hipma.date_to_)) {
            hipma.date_to_ =   hipma.date_to_.toLocaleString("en-CA");
        }

        if(!_.isEmpty(hipma.date_of_birth)) {
            hipma.date_of_birth =   hipma.date_of_birth.toLocaleString("en-CA");
        }

        if(!_.isEmpty(hipma.name_of_health_and_social_services_program_area_optional_)) {
            var dataString = "";
            var socialServices = Object();

            socialServices = await db("bizont_edms_hipma.hipma_health_social_services_program").select().then((rows: any) => {
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

            hssSystems = await db("bizont_edms_hipma.hipma_hss_systems").select().then((rows: any) => {
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

        var hipmaFiles = await db("bizont_edms_hipma.hipma_files").where("hipma_id", hipma_id).select();
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

        hipma.confirmation_number = getConfirmationNumber();

        if(_.isEmpty(data.what_type_of_request_do_you_want_to_make_)) {
            hipma.what_type_of_request_do_you_want_to_make_ = null;
        }else{
            hipma.what_type_of_request_do_you_want_to_make_ = await getDataByModel("HipmaRequestType", data.what_type_of_request_do_you_want_to_make_, "single");
        }

        if(_.isEmpty(data.are_you_requesting_access_to_your_own_personal_health_informatio)) {
            hipma.are_you_requesting_access_to_your_own_personal_health_informatio = null;
        }else{
            hipma.are_you_requesting_access_to_your_own_personal_health_informatio = await getDataByModel("HipmaRequestAccessPersonalHealthInformation", data.are_you_requesting_access_to_your_own_personal_health_informatio, "single");
        }

        if(_.isEmpty(data.select_the_situation_that_applies_)) {
            hipma.select_the_situation_that_applies_ = null;
        }else{
            hipma.select_the_situation_that_applies_ = await getDataByModel("HipmaSituations", data.select_the_situation_that_applies_, "single");
        }

        hipma.first_name_behalf = data.first_name_behalf;
        hipma.last_name_behalf = data.last_name_behalf;
        hipma.company_or_organization_optional_behalf = data.company_or_organization_optional_behalf;
        hipma.address_behalf = data.address_behalf;
        hipma.city_or_town_behalf = data.city_or_town_behalf;
        hipma.postal_code_behalf = data.postal_code_behalf;
        hipma.email_address_behalf = data.email_address_behalf;
        hipma.phone_number_behalf = data.phone_number_behalf;

        if(!_.isEmpty(data._statutory_declaration_of_parental_or_guardianship_status)) {
            files._statutory_declaration_of_parental_or_guardianship_status = saveFile('_statutory_declaration_of_parental_or_guardianship_status', data);
        }

        if(!_.isEmpty(data.minor_s_consent_to_release_of_information_if_applicable_)) {
            files._minor_s_consent_to_release_of_information_if_applicable_ = saveFile('_minor_s_consent_to_release_of_information_if_applicable_', data);
        }

        if(!_.isEmpty(data.court_order_identifying_custody_of_the_minor)){
            files._court_order_identifying_custody_of_the_minor = saveFile('_court_order_identifying_custody_of_the_minor', data);
        }

        if(!_.isEmpty(data.statutory_declaration_of_substitute_decision_maker_status)) {
            files._statutory_declaration_of_substitute_decision_maker_status = saveFile('_statutory_declaration_of_substitute_decision_maker_status', data);
        }

        if(!_.isEmpty(data.physician_affirmation_confirm_auth)){
            files._physician_affirmation_confirm_auth = saveFile('_physician_affirmation_confirm_auth', data);
        }

        if(!_.isEmpty(data.confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece)){
            files._confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece = saveFile('_confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece', data);
        }

        if(!_.isEmpty(data.letters_of_administration_or_grant_of_probate)){
            files._letters_of_administration_or_grant_of_probate = saveFile('_letters_of_administration_or_grant_of_probate', data);
        }

        if(!_.isEmpty(data.consent_to_release_of_information)){
            files._consent_to_release_of_information = saveFile('_consent_to_release_of_information', data);
        }

        hipma.first_name = data.first_name;
        hipma.last_name = data.last_name;
        hipma.date_of_birth = data.date_of_birth;
        hipma.address = data.address;
        hipma.city_or_town = data.city_or_town;
        hipma.postal_code = data.postal_code;
        hipma.email_address = data.email_address;
        hipma.phone_number = data.phone_number;

        if(_.isEmpty(data.get_a_copy_of_your_health_information_)) {
            hipma.get_a_copy_of_your_health_information_ = null;
        }else{
            hipma.get_a_copy_of_your_health_information_ = await getDataByModel("HipmaCopyHealthInformation", data.get_a_copy_of_your_health_information_, "single");
        }

        if(_.isEmpty(data.get_a_copy_of_your_activity_request)) {
            hipma.get_a_copy_of_your_activity_request = null;
        }else{
            hipma.get_a_copy_of_your_activity_request = await getDataByModel("HipmaCopyActivityRequest", data.get_a_copy_of_your_activity_request, "single");
        }

        if(_.isEmpty(data.name_of_health_and_social_services_program_area_optional_) && !_.isArray(data.name_of_health_and_social_services_program_area_optional_)) {
            hipma.name_of_health_and_social_services_program_area_optional_ = null;
        }else{
            hipma.name_of_health_and_social_services_program_area_optional_ = await getDataByModel("HipmaHealthSocialServicesProgram", data.name_of_health_and_social_services_program_area_optional_, "multi")
        }

        if(_.isEmpty(data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi) && !_.isArray(data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi)) {
            hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = null;
        }else{
            hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activ = await getDataByModel("HipmaHssSystems", data.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi, "multi")
        }

        if(_.isEmpty(data.date_from_)) {
            hipma.date_from_ = null;
        }else{
            hipma.date_from_ = data.date_from_;
        }

        if(_.isEmpty(data.date_to_)) {
            hipma.date_to_ = null;
        }else{
            hipma.date_to_ = data.date_to_;
        }

        hipma.provide_details_about_your_request_ = data.provide_details_about_your_request_;
        hipma.date_range_is_unknown_or_i_need_help_identifying_the_date_range = data.date_range_is_unknown_or_i_need_help_identifying_the_date_range;
        hipma.i_affirm_the_information_above_to_be_true_and_accurate_ = data.i_affirm_the_information_above_to_be_true_and_accurate_;

        HipmaSaved = await db('bizont_edms_hipma.health_information').insert(hipma).into('bizont_edms_hipma.health_information').returning('id');

        if(!_.isEmpty(files)){
            var filesInsert = Array();

            _.forEach(files, function(value: any) {
                var hipmaFiles = Object();

                let hipma_id = HipmaSaved.find((obj: any) => {return obj.id;});
                hipmaFiles.hipma_id = hipma_id.id
                hipmaFiles.description = value.description;
                hipmaFiles.file_name = value.file_name;
                hipmaFiles.file_type = value.file_type;
                hipmaFiles.file_size = value.file_size;
                hipmaFiles.file_data = value.file_data;

                filesInsert.push(hipmaFiles);
            });

            var filesSaved = await db('bizont_edms_hipma.hipma_files').insert(filesInsert).into('bizont_edms_hipma.hipma_files');

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
        //var hipma_id = Number(req.params.hipma_id);

        var hipma = req.body.params.requests;

        var updateStatus = await db("bizont_edms_hipma.health_information").update({status: "closed"}).whereIn("id", hipma);

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
        var path = "";
        var hipmaFile_id = Number(req.params.hipmaFile_id);
        var hipmaFiles = await db("bizont_edms_hipma.hipma_files").where("id", hipmaFile_id).select().first();
        var buffer = Buffer.from(hipmaFiles.file_data, 'base64')
        var file = buffer.toString();
        let name = hipmaFiles.file_name;
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+name;
        path = __dirname+'/'+safeName+"."+hipmaFiles.file_type;

        if(hipmaFiles) {
            res.json({ fileData: file , fileName: safeName+"."+hipmaFiles.file_type});
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
        var sqlFilter = "health_information.status = 'open'";

        if(requests.length > 0){
            sqlFilter += " AND health_information.id IN ("+requests+")";
        }else if(dateFrom !== null && dateTo !== null){
            sqlFilter += " AND health_information.created_at >= '"+dateFrom+"' AND health_information.created_at <= '"+dateTo+"'";
        }

        hipma = await db("bizont_edms_hipma.health_information")
                .leftJoin('bizont_edms_hipma.hipma_request_type', 'health_information.what_type_of_request_do_you_want_to_make_', '=', 'hipma_request_type.id')
                .leftJoin('bizont_edms_hipma.hipma_request_access_personal_health_information', 'health_information.are_you_requesting_access_to_your_own_personal_health_informatio', '=', 'hipma_request_access_personal_health_information.id')
                .leftJoin('bizont_edms_hipma.hipma_copy_health_information', 'health_information.get_a_copy_of_your_health_information_', '=', 'hipma_copy_health_information.id')
                .leftJoin('bizont_edms_hipma.hipma_situations', 'health_information.select_the_situation_that_applies_', '=', 'hipma_situations.id')
                .leftJoin('bizont_edms_hipma.hipma_copy_activity_request', 'health_information.get_a_copy_of_your_activity_request', '=', 'hipma_copy_activity_request.id')
                .select('bizont_edms_hipma.health_information.*',
                        'bizont_edms_hipma.hipma_request_type.description as HipmaRequestType',
                        'bizont_edms_hipma.hipma_request_access_personal_health_information.description as AccessPersonalHealthInformation',
                        'bizont_edms_hipma.hipma_copy_health_information.description as CopyHealthInformation',
                        'bizont_edms_hipma.hipma_situations.description as HipmaSituations',
                        'bizont_edms_hipma.hipma_copy_activity_request.description as HipmaCopyActivityRequest')
                .whereRaw(sqlFilter);

        var socialServices = Object();
        var hssSystems = Object();

        socialServices = await db("bizont_edms_hipma.hipma_health_social_services_program").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        hssSystems = await db("bizont_edms_hipma.hipma_hss_systems").select().then((rows: any) => {
            let arrayResult = Object();

            for (let row of rows) {
                arrayResult[row['id']] = row['description'];
            }

            return arrayResult;
        });

        hipma.forEach(function (value: any) {

            if(!_.isEmpty(value.date_from_)) {
                value.date_from_ =   value.date_from_.toLocaleString("en-CA");
            }

            if(!_.isEmpty(value.date_to_)) {
                value.date_to_ =   value.date_to_.toLocaleString("en-CA");
            }

            if(!_.isEmpty(value.date_of_birth)) {
                value.date_of_birth =   value.date_of_birth.toLocaleString("en-CA");
            }

            if(value.date_range_is_unknown_or_i_need_help_identifying_the_date_range == 1){
                value.needHelpIdentifyingDataRange = "YES";
            }else{
                value.needHelpIdentifyingDataRange = "NO";
            }

            if(value.i_affirm_the_information_above_to_be_true_and_accurate_ == 1){
                value.affirmInformationAccurate = "YES";
            }else{
                value.affirmInformationAccurate = "NO";
            }

            if(!_.isEmpty(value.name_of_health_and_social_services_program_area_optional_)) {
                var dataString = "";

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

            delete value.id;
            delete value.what_type_of_request_do_you_want_to_make_;
            delete value.status;
            delete value.are_you_requesting_access_to_your_own_personal_health_informati;
            delete value.select_the_situation_that_applies_;
            delete value.get_a_copy_of_your_activity_request;
            delete value.i_affirm_the_information_above_to_be_true_and_accurate_;
            delete value.date_range_is_unknown_or_i_need_help_identifying_the_date_range;

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

    if(data[field_name] !== 'undefined' && (data[field_name]) && data[field_name]['data'] !== 'undefined'){

        var filesHipma = Object();
        var buffer = Buffer.from(data[field_name]['data'], 'base64')
        var file = buffer.toString();
        let mime = data[field_name]['mime'];
        let name = data[field_name]['name'];
        let extension = mime.split("/");
        let fileName = name.split(".");
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+name;
        path = __dirname+'/'+safeName;

        fs.writeFileSync(path, file);

        // Obtain file's general information
        var stats = fs.statSync(path);

        // Convert the file size to megabytes
        var fileSizeInMegabytes = stats.size / (1024*1024);

        filesHipma["description"] = field_name;
        filesHipma["file_name"] = fileName[0];
        filesHipma["file_type"] = extension[1];
        filesHipma["file_size"] = fileSizeInMegabytes;
        filesHipma["file_data"] = data[field_name]['data'];

        fs.unlinkSync(path);
    }

    return filesHipma;
}

/**
 * Transforms given array to the allowed database array format and replaces information with catalogue data.
 *
 * @param {model} name of catalogue
 * @param {id} id of catalogue
 * @return {type}
 */
async function getDataByModel(model: string, id: any, type: string){

    var data = Object();

    if(type == "single"){
        switch (model) {
            case 'HipmaRequestType':
                data = await db("bizont_edms_hipma.hipma_request_type").where("bizont_edms_hipma.hipma_request_type.id", id).first();
                break;

            case 'HipmaRequestAccessPersonalHealthInformation':
                data = await db("bizont_edms_hipma.hipma_request_access_personal_health_information").where("bizont_edms_hipma.hipma_request_access_personal_health_information.id", id).first();
                break;

            case 'HipmaCopyHealthInformation':
                data = await db("bizont_edms_hipma.hipma_copy_health_information").where("bizont_edms_hipma.hipma_copy_health_information.id", id).first();
                break;

            case 'HipmaSituations':
                data = await db("bizont_edms_hipma.hipma_situations").where("bizont_edms_hipma.hipma_situations.id", id).first();
                break;

            case 'HipmaCopyActivityRequest':
                data = await db("bizont_edms_hipma.hipma_copy_activity_request").where("bizont_edms_hipma.hipma_copy_activity_request.id", id).first();
                break;
        }

        if(!_.isEmpty(data)) {
            return data.id;
        }else{
            return null;
        }

    }else if(type == "multi"){

        var others = "";
        var auxNames = id;
        var data = Object();
        var socialServices = Object();
        var hss = Object();

        if(model == "HipmaHealthSocialServicesProgram") {
            socialServices = await db("bizont_edms_hipma.hipma_health_social_services_program").select().then((rows: any) => {
                                        let arrayResult = Object();
                                        for (let row of rows) {
                                            arrayResult[row['description']] = row['id'];
                                        }

                                        return arrayResult;
                                    });

            id.forEach(function (value: any, key: any) {
                if(!socialServices.hasOwnProperty(value)){
                    others = id[key];
                    //id.splice(key, 1);
                }
            });

            data = await db("bizont_edms_hipma.hipma_health_social_services_program")
                            .select()
                            .whereIn('description', id);

        }else if(model == "HipmaHssSystems") {

            hss = await db("bizont_edms_hipma.hipma_hss_systems").select().then((rows: any) => {
                                let arrayResult = Object();
                                for (let row of rows) {
                                    arrayResult[row['description']] = row['id'];
                                }

                                return arrayResult;
                            });

            id.forEach(function (value: any, key: any) {
                if(!hss.hasOwnProperty(value)){
                    others = id[key];
                    //id.splice(key, 1);
                }
            });

            data =  await db("bizont_edms_hipma.hipma_hss_systems")
                            .select()
                            .whereIn('description', id);
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
}