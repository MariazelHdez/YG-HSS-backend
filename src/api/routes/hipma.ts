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
var filesHipma = Array();

hipmaRouter.get("/", EnsureAuthenticated, async (req: Request, res: Response) => {

        var hipma = await db("bizont_edms_hipma.health_information")
        .leftJoin('bizont_edms_hipma.hipma_request_type', 'health_information.what_type_of_request_do_you_want_to_make_', '=', 'hipma_request_type.id')
        .leftJoin('bizont_edms_hipma.hipma_request_access_personal_health_information', 'health_information.are_you_requesting_access_to_your_own_personal_health_informatio', '=', 'hipma_request_access_personal_health_information.id')
        .leftJoin('bizont_edms_hipma.hipma_copy_health_information', 'health_information.get_a_copy_of_your_health_information_', '=', 'hipma_copy_health_information.id')
        .leftJoin('bizont_edms_hipma.hipma_situations', 'health_information.select_the_situation_that_applies_', '=', 'hipma_situations.id')
        .select('health_information.*',
                'hipma_request_type.description as HipmaRequestType',
                'hipma_request_access_personal_health_information.description as HipmaRequestAccessPersonalHealthInformation',
                'hipma_copy_health_information.description as HipmaCopyHealthInformation',
                'hipma_situations.description as HipmaSituations')
        //.selectRaw('CONCAT(health_information.first_name, " ", health_information.last_name) as applicantFullName')
        .where('health_information.status', 'open')
        .orderBy('health_information.created_at', 'asc');

        res.json({ data: hipma });

});

hipmaRouter.post("/store", EnsureAuthenticated, async (req: Request, res: Response) => {
        var data = Object();
        data = req;
        //$data = $request->json()->all();
        var hipma = Object();

        hipma.confirmation_number = getConfirmationNumber();
        hipma.what_type_of_request_do_you_want_to_make_ = getDataByModel("HipmaRequestType", data['what_type_of_request_do_you_want_to_make_'], "single");
        hipma.are_you_requesting_access_to_your_own_personal_health_informatio = getDataByModel("HipmaRequestAccessPersonalHealthInformation", data['are_you_requesting_access_to_your_own_personal_health_informatio'], "single");
        hipma.select_the_situation_that_applies_ = String(getDataByModel("HipmaSituations", data['select_the_situation_that_applies_'], "single"));
        hipma.first_name_behalf = data['first_name_behalf'];
        hipma.last_name_behalf = data['last_name_behalf'];
        hipma.company_or_organization_optional_behalf = data['company_or_organization_optional_behalf'];
        hipma.address_behalf = data['address_behalf'];
        hipma.city_or_town_behalf = data['city_or_town_behalf'];
        hipma.postal_code_behalf = data['postal_code_behalf'];
        hipma.email_address_behalf = data['email_address_behalf'];
        hipma.phone_number_behalf = data['phone_number_behalf'];

        if(typeof data['statutory_declaration_of_parental_or_guardianship_status'] !== 'undefined' && data['statutory_declaration_of_parental_or_guardianship_status']){
            saveFile('_statutory_declaration_of_parental_or_guardianship_status', data);
        }

        if(typeof data['minor_s_consent_to_release_of_information_if_applicable_'] !== 'undefined' && data['minor_s_consent_to_release_of_information_if_applicable_']){
            saveFile('_minor_s_consent_to_release_of_information_if_applicable_', data);
        }

        if(typeof data['court_order_identifying_custody_of_the_minor'] !== 'undefined' && data['court_order_identifying_custody_of_the_minor']){
            saveFile('_court_order_identifying_custody_of_the_minor', data);
        }

        if(typeof data['statutory_declaration_of_substitute_decision_maker_status'] !== 'undefined' && data['statutory_declaration_of_substitute_decision_maker_status']){
            saveFile('_statutory_declaration_of_substitute_decision_maker_status', data);
        }

        if(typeof data['physician_affirmation_confirm_auth'] !== 'undefined' && data['physician_affirmation_confirm_auth']){
            saveFile('_physician_affirmation_confirm_auth', data);
        }

        if(typeof data['confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece'] !== 'undefined' && data['confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece']){
            saveFile('_confirmation_of_authority_to_exercise_rights_or_powers_of_a_dece', data);
        }

        if(typeof data['letters_of_administration_or_grant_of_probate'] !== 'undefined' && data['letters_of_administration_or_grant_of_probate']){
            saveFile('_letters_of_administration_or_grant_of_probate', data);
        }

        if(typeof data['consent_to_release_of_information'] !== 'undefined' && data['consent_to_release_of_information']){
            saveFile('_consent_to_release_of_information', data);
        }

        hipma.first_name = data['first_name'];
        hipma.last_name = data['last_name'];
        hipma.date_of_birth = data['date_of_birth'];
        hipma.address = data['address'];
        hipma.city_or_town = data['city_or_town'];
        hipma.postal_code = data['postal_code'];
        hipma.email_address = data['email_address'];
        hipma.phone_number = data['phone_number'];

        hipma.get_a_copy_of_your_health_information_ = getDataByModel("HipmaCopyHealthInformation", data['get_a_copy_of_your_health_information_'], "single");
        hipma.get_a_copy_of_your_activity_request = getDataByModel("HipmaCopyActivityRequest", data['get_a_copy_of_your_activity_request'], "single");
        hipma.name_of_health_and_social_services_program_area_optional_ = ((data['name_of_health_and_social_services_program_area_optional_']) ? null : getDataByModel("HipmaHealthSocialServicesProgram", data['name_of_health_and_social_services_program_area_optional_'], "multi"));
        hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi = ((data['indicate_the_hss_system_s_you_would_like_a_record_of_user_activi']) ? null : getDataByModel("HipmaHssSystems", data['indicate_the_hss_system_s_you_would_like_a_record_of_user_activi'], "multi"));
        hipma.provide_details_about_your_request_ = data['provide_details_about_your_request_'];
        hipma.date_from_ = data['date_from_'] == "" ? null : data['date_from_'];
        hipma.date_to_ = data['date_to_'] == "" ? null : data['date_to_'];
        hipma.date_range_is_unknown_or_i_need_help_identifying_the_date_range = data['date_range_is_unknown_or_i_need_help_identifying_the_date_range'];
        hipma.i_affirm_the_information_above_to_be_true_and_accurate_ = data['i_affirm_the_information_above_to_be_true_and_accurate_'];

        const healthInfoId = knex('bizont_edms_hipma.health_information').returning('id').insert(hipma);

        if(filesHipma.length > 0){
            _.forEach(filesHipma, function(value: any, key: any) {
                var hipmaFiles = Object();

                hipmaFiles.hipma_id = healthInfoId;
                hipmaFiles.description = value['description'];
                hipmaFiles.file_name = value['file_name'];
                hipmaFiles.file_type = value['file_type'];
                hipmaFiles.file_size = value['file_size'];
                hipmaFiles.file_data = value['file_data'];

                knex('bizont_edms_hipma.hipma_files').insert(hipmaFiles);

            });


            res.json({});
        }

});

function getConfirmationNumber() {
    // Generate a new confirmation number using php's uniqid(), which
    // essensially generates a unix timestamp with microseconds and returns as
    // hexidecimal. This gives us a relatively high certainty of uniquess.
    var id = uniqid();
    // Convert to uppercase for better human readability.
    id = id.toUpperCase();

    return id;
}

function uniqid(prefix = "", random = false) {
    const sec = Date.now() * 1000 + Math.random() * 1000;
    const id = sec.toString(16).replace(/\./g, "").padEnd(14, "0");
    return `${prefix}${id}${random ? `.${Math.trunc(Math.random() * 100000000)}`:""}`;
}

hipmaRouter.get("/:hipma_id",[param("hipma_id").isInt().notEmpty()], async (req: Request, res: Response) => {

    let { hipma_id } = req.params;

    var hipma = await db("bizont_edms_hipma.health_information")
    .leftJoin('bizont_edms_hipma.hipma_request_type', 'health_information.what_type_of_request_do_you_want_to_make_', '=', 'hipma_request_type.id')
    .leftJoin('bizont_edms_hipma.hipma_request_access_personal_health_information', 'health_information.are_you_requesting_access_to_your_own_personal_health_informatio', '=', 'hipma_request_access_personal_health_information.id')
    .leftJoin('bizont_edms_hipma.hipma_copy_health_information', 'health_information.get_a_copy_of_your_health_information_', '=', 'hipma_copy_health_information.id')
    .leftJoin('bizont_edms_hipma.hipma_situations', 'health_information.select_the_situation_that_applies_', '=', 'hipma_situations.id')
    .leftJoin('bizont_edms_hipma.hipma_copy_activity_request', 'health_information.get_a_copy_of_your_activity_request', '=', 'hipma_copy_activity_request.id')
    .select('health_information.*',
            'hipma_request_type.description as HipmaRequestType',
            'hipma_request_access_personal_health_information.description as HipmaRequestAccessPersonalHealthInformation',
            'hipma_copy_health_information.description as HipmaCopyHealthInformation',
            'hipma_situations.description as HipmaSituations',
            'hipma_copy_activity_request.description as HipmaCopyActivityRequest')
    .where({ id: hipma_id })
    .first();

    if((hipma.name_of_health_and_social_services_program_area_optional_)){
        var dataString = "";
        _.forEach(hipma.name_of_health_and_social_services_program_area_optional_, function(value: any, key: any) {
        //for (i=0; i < count(ids) ; i++) {
            var info_find = Object();
            info_find = db("bizont_edms_hipma.hipma_health_social_services_program").where({ id: value }).first();
            if(!isNaN(value) && (info_find) && typeof info_find.description !== 'undefined'){
                dataString += info_find.description+",";
            }else{
                dataString += value+",";
            }
        });

        if(dataString.substr(-1) == ","){
            //dataString = substr(dataString, 0, -1);
            dataString = dataString.substr(0, -1);
        }

        hipma.name_of_health_and_social_services_program_area_optional_ = dataString;
    }

    if((hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi)){
        var dataString = "";
        _.forEach(hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi, function(value: any, key: any) {
        //for (i=0; i < count(ids) ; i++) {
            var info_find = Object();
            info_find = db("bizont_edms_hipma.hipma_hss_systems").where({ id: value }).first();
            if(!isNaN(value) && (info_find) && typeof info_find.description !== 'undefined'){
                dataString += info_find.description+",";
            }else{
                dataString += value+",";
            }
        });

        if(dataString.substr(-1) == ","){
            //dataString = substr(dataString, 0, -1);
            dataString = dataString.substr(0, -1);
        }

        hipma.indicate_the_hss_system_s_you_would_like_a_record_of_user_activi = dataString;
    }

    var hipmaFiles = db("bizont_edms_hipma.hipma_files").where({ hipma_id: hipma_id });
    var files = Array();

    _.forEach(hipmaFiles, function(value: any, key: any) {
    //foreach (hipmaFiles as key => value) {
        files[value["description"]]["id"] = value["id"];
        files[value["description"]]["file_name"] = value["file_name"];
        files[value["description"]]["file_type"] = value["file_type"];
        files[value["description"]]["file_size"] = value["file_size"];
        files[value["description"]]["file_data"] = value["filee_size"];
        files[value["description"]]["file_data"] = value["file_data"];
    });

    res.json({ hipma: hipma, hipmaFiles: files });
});

hipmaRouter.get("/changeRequestStatus/:hipma_id",[param("hipma_id").isInt().notEmpty()], async (req: Request, res: Response) => {
//function changeRequestStatus(id: any){
    let { hipma_id } = req.params;
    var hipma = Object();
    hipma = db("bizont_edms_hipma.health_information").where({ id: hipma_id });
    hipma.status = 'closed';
    hipma.save();

    res.json({ data: hipma });

});

function saveFile(field_name: any, data: any){
    var path = "";
    var fs = require("fs");

    if(data[field_name] !== 'undefined' && (data[field_name]) && data[field_name]['data'] !== 'undefined'){
        //let file = base64_decode(data[field_name]['data']);
        var buffer = Buffer.from(data[field_name]['data'], 'base64')
        var file = buffer.toString();
        let mime = data[field_name]['mime'];
        let name = data[field_name]['name'];
        let extension = mime.split("/");
        let fileName = name.split(".");
        let safeName = (Math.random() + 1).toString(36).substring(7)+'_'+name;

        //let success = file_put_contents(public_path().'/HipmaFiles/'.safeName, file);
        let path = __dirname+'/HipmaFiles/'+safeName;

        var stats = fs.statSync(path);
        // Convert the file size to megabytes (optional)
        var fileSizeInMegabytes = stats.size / (1024*1024);

        filesHipma[field_name]["description"] = field_name;
        filesHipma[field_name]["file_name"] = fileName[0];
        filesHipma[field_name]["file_type"] = extension[1];
        filesHipma[field_name]["file_size"] = fileSizeInMegabytes;//filesize(path);
        filesHipma[field_name]["file_data"] = data[field_name]['data'];

        //unlink(path);
    }

    return path;
}

function getDataByModel(model: string, id: any, type: string){

    var data = Object();
    if(type == "single"){
        switch (model) {
            case 'HipmaRequestType':
                data = db("bizont_edms_hipma.hipma_request_type").where({ id: id }).first();//HipmaRequestType::where('id', id)->first();
                break;

            case 'HipmaRequestAccessPersonalHealthInformation':
                data = db("bizont_edms_hipma.hipma_request_access_personal_health_information").where({ id: id }).first();
                break;

            case 'HipmaCopyHealthInformation':
                data = db("bizont_edms_hipma.hipma_copy_health_information").where({ id: id }).first();
                break;

            case 'HipmaSituations':
                data = db("bizont_edms_hipma.hipma_situations").where({ id: id }).first();
                break;

            case 'HipmaCopyActivityRequest':
                data = db("bizont_edms_hipma.hipma_copy_activity_request").where({ id: id }).first();
                break;
        }
        if((data)){
            return data.id;
        }else{
            return null;
        }

    }else if(type == "multi"){
        var others = "";
        var res_arr = Array();
        var modelValues = "";

        switch (model) {
            case 'HipmaHealthSocialServicesProgram':
                data = db("bizont_edms_hipma.hipma_health_social_services_program").where({ id: id }).select();
                break;

            case 'HipmaHssSystems':
                data = db("bizont_edms_hipma.hipma_hss_systems").where({ id: id }).select();
                break;
        }

        if(data.length > 1){
          res_arr = JSON.parse(data);
        }

        _.forEach(id, function(values: any, position: any) {
            const arrayColumn = (arr: any, n: any) => arr.map((x: any) => x[n]);

          if(!values.includes(arrayColumn(res_arr, 'id'))){
            others = values;
          }
        });

        if(data.length){
            var max = data.length;
            var count = 1;
            var modelValues = '';

            if(max == 1){
                modelValues = String(data[0].id);
            }else{
                _.forEach(data, function(value: any, key: any) {
                    if(count == max){
                        modelValues += String(value.id);
                    }else{
                        modelValues += String(value.id)+",";
                    }
                    count++;
                });
            }
        }
        if((modelValues) && (others)){
              return modelValues+","+others;
        }else if((modelValues)){
              return modelValues;
        }/*else if((others)){
              return others;
        }*/

    }
}