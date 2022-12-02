import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG_MIDWIFERY } from "../config";
var _ = require('lodash');

const db = knex(DB_CONFIG_MIDWIFERY)

export const midwiferyRouter = express.Router();

midwiferyRouter.get("/", EnsureAuthenticated, async (req: Request, res: Response) => {

        var midwifery = Object();
        var midwiferyOptions = Object();

        midwifery = db("bizont_edms_midwifery.midwifery_services")
                .leftJoin('bizont_edms_midwifery.midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
                .leftJoin('bizont_edms_midwifery.midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
                .select('midwifery_services.*',
                        'midwifery_birth_locations.description as birth_locations',
                        'midwifery_preferred_contact_types.description as preferred_contact')
                //.selectRaw('CONCAT(midwifery_services.first_name, " ", midwifery_services.last_name) as fullName')
                .where('midwifery_services.status', 'open')
                .orderBy('midwifery_services.id', 'asc');

        midwiferyOptions = db("bizont_edms_midwifery.midwifery_options").select('midwifery_options.*').pluck("field_value");

        _.forEach(midwifery, function(value: any, key: any) {
                value.first_pregnancy = !value.first_pregnancy ? ( midwiferyOptions[value.first_pregnancy] == 1 ? 'Yes' : 'No'): '' ;
                value.medical_concerns = !value.medical_concerns ? ( midwiferyOptions[value.medical_concerns] == 1 ? 'Yes' : 'No'): '' ;
                value.major_medical_conditions = !value.major_medical_conditions ? ( midwiferyOptions[value.major_medical_conditions] == 1 ? 'Yes' : 'No'): '' ;

                if(value.due_date == 0) {
                        value.due_date =  "N/A";
                }

                if(value.preferred_name == "") {
                        value.preferred_name = value.preferred_name;//fullName;
                }

                if(value.do_you_identify_with_one_or_more_of_these_groups_and_communities.lenght){
                        var dataString = "";
                        _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communities, function(valueCommunity: any, key: any) {
                                var info_find = Object();
                                info_find = db("bizont_edms_midwifery.midwifery_groups_communities").where({ id: valueCommunity });

                                if(!isNaN(valueCommunity) && !info_find && typeof info_find.description !== 'undefined'){
                                        dataString += info_find.description+",";
                                }else{
                                        dataString += valueCommunity+",";
                                }
                        });

                        if(dataString.substr(-1) == ","){
                                dataString = dataString.substr(0, -1);
                        }

                        value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataString;

                }
        });

});

midwiferyRouter.get("/:midwifery_id",[param("midwifery_id").isInt().notEmpty()], async (req: Request, res: Response) => {
        let { midwifery_id } = req.params;
        var midwifery = Object();
        var midwiferyOptions = Object();

        midwifery = db("bizont_edms_midwifery.midwifery_services")
                .leftJoin('midwifery_community_locations', 'midwifery_services.community_located', '=', 'midwifery_community_locations.id')
                .leftJoin('midwifery_languages', 'midwifery_services.preferred_language', '=', 'midwifery_languages.id')
                .leftJoin('midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
                .leftJoin('midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
                .select('midwifery_services.*',
                        'midwifery_community_locations.description as community',
                        'midwifery_languages.description as language',
                        'midwifery_birth_locations.description as birth_locations',
                        'midwifery_preferred_contact_types.description as preferred_contact')
                //.selectRaw('CONCAT(midwifery_services.first_name, " ", midwifery_services.last_name) as fullName')
                .where({ id: midwifery_id })
                .first();

        midwiferyOptions = db("bizont_edms_midwifery.midwifery_options").select().pluck("description");

        if(midwifery.community == null) {
                midwifery.community = midwifery.community_located;
        }

        if(midwifery.language == null) {
                midwifery.language = midwifery.preferred_language;
        }

        if(midwifery.due_date == 0) {
                midwifery.due_date =  "N/A";
        }

        if(midwifery.date_of_birth == 0) {
                midwifery.date_of_birth =  "N/A";
        }

        if(midwifery.when_was_the_first_day_of_your_last_period_ == 0) {
                midwifery.when_was_the_first_day_of_your_last_period_ =  "N/A";
        }

        if(!midwifery.preferred_name || midwifery.preferred_name == "") {
                midwifery.preferred_name = midwifery.preferred_name;//.fullName;
        }

        if(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities.lenght){
                var dataString = "";
                _.forEach(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities, function(valueCommunity: any, key: any) {
                        var info_find = Object();
                        info_find = db("bizont_edms_midwifery.midwifery_groups_communities").where({ id: valueCommunity });

                        if(!isNaN(valueCommunity) && !info_find && typeof info_find.description !== 'undefined'){
                                dataString += info_find.description+",";
                        }else{
                                dataString += valueCommunity+",";
                        }
                });

                if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                }

                midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataString;

        }else if(!midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities){
                var info_find = Object();
                info_find = db("bizont_edms_midwifery.midwifery_groups_communities").select().where({ id: midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities });
                if(!isNaN(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities) && !info_find && typeof info_find.description !== 'undefined'){
                        midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities = info_find.description;
                }
        }

        if(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_.lenght){
                var dataString = "";
                _.forEach(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_, function(valueContact: any, key: any) {
                        var info_find = Object();
                        info_find = db("bizont_edms_midwifery.midwifery_clinic_contact_types").where({ id: valueContact });

                        if(!isNaN(valueContact) && !info_find && typeof info_find.description !== 'undefined'){
                                dataString += info_find.description+",";
                        }else{
                                dataString += valueContact+",";
                        }
                });

                if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                }

                midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ = dataString;

        }else if(!midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_){
                var info_find = Object();
                info_find = db("bizont_edms_midwifery.midwifery_clinic_contact_types").select().where({ id: midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ });
                if(!isNaN(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_) && !info_find && typeof info_find.description !== 'undefined'){
                        midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ = info_find.description;
                }
        }

        if (!midwifery) {
                res.json({ error: 'Information not found.' });
        }

        res.json({ midwifery: midwifery, options: midwiferyOptions });
});

midwiferyRouter.post("/store", EnsureAuthenticated, async (req: Request, res: Response) => {

        let data = Object();
        data = req;
        var midwifery = Object();
        var midwiferyCommunityLocations = Object();
        var midwiferyLanguages = Object();
        var midwiferyPreferredContactTypes = Object();
        var midwiferyBirthLocations = Object();

        midwifery.confirmation_number = getConfirmationNumber();
        midwifery.first_name = data['first_name'];
        midwifery.last_name = data['last_name'];
        midwifery.preferred_name = (!data['preferred_name'] || data['preferred_name'] == "") ? data['first_name']+" "+data['last_name'] : data['preferred_name'];
        midwifery.pronouns = data['pronouns'];
        midwifery.date_of_birth = data['date_of_birth'];
        midwifery.preferred_phone = data['preferred_phone'];
        midwifery.preferred_email = data['preferred_email'];
        midwifery.when_was_the_first_day_of_your_last_period_ = data['when_was_the_first_day_of_your_last_period_'];

        midwiferyCommunityLocations = db("bizont_edms_midwifery.midwifery_community_locations").where({ description: data['community_located'] }).first('*');
        midwifery.community_located = midwiferyCommunityLocations.lenght ? midwiferyCommunityLocations.id : data['community_located'];

        midwiferyLanguages = db("bizont_edms_midwifery.midwifery_languages").where({ description: data['preferred_language'] }).first('*');
        midwifery.preferred_language =  midwiferyLanguages.lenght ? midwiferyLanguages.id : data['preferred_language'];

        midwiferyPreferredContactTypes = db("bizont_edms_midwifery.midwifery_preferred_contact_types").where({ description: data['prefer_to_be_contacted'] }).first('*');
        midwifery.prefer_to_be_contacted = midwiferyPreferredContactTypes.lenght ? midwiferyPreferredContactTypes.id : null;

        midwiferyBirthLocations = db("bizont_edms_midwifery.midwifery_birth_locations").where({ description: data['where_to_give_birth'] }).first('*');
        midwifery.where_to_give_birth = midwiferyBirthLocations.lenght ? midwiferyBirthLocations.id : null;

        midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities = (!data['do_you_identify_with_one_or_more_of_these_groups_and_communities'] ? null : getMultipleIdsByModel("MidwiferyGroupsCommunities", data['do_you_identify_with_one_or_more_of_these_groups_and_communities']));
        midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ = (!data['how_did_you_find_out_about_the_midwifery_clinic_select_all_that_'] ? null : getMultipleIdsByModel("MidwiferyClinicContactTypes", data['how_did_you_find_out_about_the_midwifery_clinic_select_all_that_']));

        midwifery.yukon_health_insurance = getMidwiferyOptions("yukon_health_insurance", data['yukon_health_insurance']);
        midwifery.need_interpretation = getMidwiferyOptions("need_interpretation", data['need_interpretation']);
        midwifery.okay_to_leave_message = getMidwiferyOptions("okay_to_leave_message", data['okay_to_leave_message']);
        midwifery.date_confirmed = getMidwiferyOptions("date_confirmed", data['date_confirmed']);
        midwifery.first_pregnancy = getMidwiferyOptions("first_pregnancy", data['first_pregnancy']);
        midwifery.complications_with_previous = getMidwiferyOptions("complications_with_previous", data['complications_with_previous']);
        midwifery.midwife_before = getMidwiferyOptions("midwife_before", data['midwife_before']);
        midwifery.medical_concerns = getMidwiferyOptions("medical_concerns", data['medical_concerns']);
        midwifery.have_you_had_primary_health_care = getMidwiferyOptions("have_you_had_primary_health_care", data['have_you_had_primary_health_care']);
        midwifery.family_physician = getMidwiferyOptions("family_physician", data['family_physician']);
        midwifery.major_medical_conditions = getMidwiferyOptions("major_medical_conditions", data['major_medical_conditions']);

        midwifery.due_date = data['due_date'];
        midwifery.how_many_vaginal_births = data['how_many_vaginal_births'];
        midwifery.how_many_c_section_births = data['how_many_c_section_births'];
        midwifery.provide_details = data['provide_details'];
        midwifery.provide_details2 = data['provide_details2'];
        midwifery.menstrual_cycle_length = data['menstrual_cycle_length'];
        midwifery.physician_s_name = data['physician_s_name'];
        midwifery.provide_details3 = data['provide_details3'];

        //result = midwifery->save();
        await knex('bizont_edms_midwifery.midwifery_services').insert(midwifery);

        res.json({});

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

function getMultipleIdsByModel(model: any, names: any) {
        var others = "";
        var auxNames = names;
        var groups = Object();
        var contact = Object();
        var data = Object();

        if(model == "MidwiferyGroupsCommunities") {
            groups = db("bizont_edms_midwifery.midwifery_groups_communities")
                            .select()
                            .pluck('description');

            _.forEach(names, function(value: any, key: any) {
                    var info_find = Object();
                    info_find = db("bizont_edms_midwifery.midwifery_clinic_contact_types").where({ id: value });

                    if(typeof groups[value] == 'undefined'){
                            others = names[key];
                            names.splice(key, 1);
                    }
            });

            data = db("bizont_edms_midwifery.midwifery_groups_communities").whereIn('name', names );
        }else if(model == "MidwiferyClinicContactTypes") {
            contact = db("bizont_edms_midwifery.midwifery_clinic_contact_types").select().pluck('description');

            _.forEach(names, function(value: any, key: any) {
                if(typeof contact[value] == 'undefined'){
                    others = names[key];
                    names.splice(key, 1);
                }
            });

            data = db("bizont_edms_midwifery.midwifery_clinic_contact_types").whereIn('name', names);
        }

        if(data.lenght){
            var modelValues = "";
            var max = data.lenght;
            var count = 1;
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

            if(others !== "") {
                return modelValues+","+others;
            }else{
                return modelValues;
            }

        }else if(!data.lenght && auxNames.lenght > 0){
            return auxNames[0];
        }else{
            return null;
        }
}

function getMidwiferyOptions(field: any, data: string) {

        var data = data.toLowerCase();
        var bool = true;

        if(data == "yes") {
            bool = true;
        }else if(data == "no"){
            bool = false;
        }else if(!data || data == ""){
            return null;
        }

        return db("midwifery.midwifery_options").where({ field_name: field }).where({ field_value: bool }).first('id');
}

midwiferyRouter.get("/changeRequestStatus/:midwifery_id",[param("midwifery_id").isInt().notEmpty()], async (req: Request, res: Response) => {

        let midwifery_id = req.param;
        var mid = Object();
        mid = db("midwifery.midwifery_services").where({ id: midwifery_id });
        mid.status = 'closed';
        mid.save();

        res.json({ data: mid });

});