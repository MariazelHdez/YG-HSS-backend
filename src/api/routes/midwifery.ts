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

midwiferyRouter.get("/midwifery", EnsureAuthenticated, async (req: Request, res: Response) => {
        //midwifery_services
        var midwifery = db("midwifery.midwifery_services")
                .leftjoin('midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
                .leftjoin('midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
                .select('midwifery_services.*',
                        'midwifery_birth_locations.description as birth_locations',
                        'midwifery_preferred_contact_types.description as preferred_contact')
                .selectRaw('CONCAT(midwifery_services.first_name, " ", midwifery_services.last_name) as fullName')
                .where('midwifery_services.status', 'open')
                .orderBy('midwifery_services.id', 'asc');

        var midwiferyOptions = db("midwifery.midwifery_options").select('midwifery_options.*').pluck("field_value", "id");


        _.forEach(midwifery, function(value: any, key: any) {
            value.first_pregnancy = !value.first_pregnancy ? ( midwiferyOptions[value.first_pregnancy] == 1 ? 'Yes' : 'No'): '' ;
            value.medical_concerns = !value.medical_concerns ? ( midwiferyOptions[value.medical_concerns] == 1 ? 'Yes' : 'No'): '' ;
            value.major_medical_conditions = !value.major_medical_conditions ? ( midwiferyOptions[value.major_medical_conditions] == 1 ? 'Yes' : 'No'): '' ;

            if(value.due_date == 0) {
                value.due_date =  "N/A";
            }

            if(value.preferred_name == "") {
                value.preferred_name = value.fullName;
            }

            if(value.do_you_identify_with_one_or_more_of_these_groups_and_communities.lenght){
                var dataString = "";
                _.forEach(value.do_you_identify_with_one_or_more_of_these_groups_and_communities, function(valueCommunity: any, key: any) {
                        var info_find = db("midwifery.midwifery_groups_communities").where({ id: valueCommunity });

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

                /*ids = explode(",",value.do_you_identify_with_one_or_more_of_these_groups_and_communities);
                dataString = "";

                if(count(ids) > 0){
                    for (i=0; i < count(ids) ; i++) {
                        info_find =  MidwiferyGroupsCommunities::find((int)ids[i]);
                        if(is_numeric(ids[i]) && !empty(info_find) && isset(info_find.description)){
                            dataString .= info_find.description.",";
                        }else{
                            dataString .= ids[i].",";
                        }
                    }

                    if(substr(dataString, -1) == ","){
                        dataString = substr(dataString, 0, -1);
                    }

                    value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataString;
                }else{
                    var dataQuery = MidwiferyGroupsCommunities::find((int)value.do_you_identify_with_one_or_more_of_these_groups_and_communities);
                    value.do_you_identify_with_one_or_more_of_these_groups_and_communities = dataQuery.description;
                }*/
            }
        });

        
});


midwiferyRouter.get("/:midwifery_id",[param("midwifery_id").isInt().notEmpty()], async (req: Request, res: Response) => {

        let { midwifery_id } = req.params;
        var midwifery = Object();

        midwifery = db("midwifery.midwifery_services")
                .leftjoin('midwifery_community_locations', 'midwifery_services.community_located', '=', 'midwifery_community_locations.id')
                .leftjoin('midwifery_languages', 'midwifery_services.preferred_language', '=', 'midwifery_languages.id')
                .leftjoin('midwifery_birth_locations', 'midwifery_services.where_to_give_birth', '=', 'midwifery_birth_locations.id')
                .leftjoin('midwifery_preferred_contact_types', 'midwifery_services.prefer_to_be_contacted', '=', 'midwifery_preferred_contact_types.id')
                .select('midwifery_services.*',
                        'midwifery_community_locations.description as community',
                        'midwifery_languages.description as language',
                        'midwifery_birth_locations.description as birth_locations',
                        'midwifery_preferred_contact_types.description as preferred_contact')
                .selectRaw('CONCAT(midwifery_services.first_name, " ", midwifery_services.last_name) as fullName')
                .where({ id: midwifery_id });

        var midwiferyOptions = db("midwifery.midwifery_options").select('midwifery_options.*').pluck("description", "id");

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

        if(!(midwifery.preferred_name) || midwifery.preferred_name == "") {
            midwifery.preferred_name = midwifery.fullName;
        }

        if(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities){

                var dataString = "";
                _.forEach(midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities, function(valueCommunity: any, key: any) {
                        var info_find = db("midwifery.midwifery_groups_communities").where({ id: valueCommunity });

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

        }

        if(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_){

                var dataString = "";
                _.forEach(midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_, function(valueCommunity: any, key: any) {
                        var info_find = db("midwifery.midwifery_clinic_contact_types").where({ id: valueCommunity });

                        if(!isNaN(valueCommunity) && !info_find && typeof info_find.description !== 'undefined'){
                                dataString += info_find.description+",";
                        }else{
                                dataString += valueCommunity+",";
                        }
                });

                if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                }

                midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ = dataString;
        }

        res.json({ data: midwifery }, { options: midwiferyOptions });
});

midwiferyRouter.post("/midwifery/store", EnsureAuthenticated, async (req: Request, res: Response) => {
{

        let { data } = req.data;
        var midwifery = Object();

        midwifery.confirmation_number = getConfirmationNumber();
        midwifery.first_name = data['first_name'];
        midwifery.last_name = data['last_name'];
        midwifery.preferred_name = (empty(data['preferred_name']) || data['preferred_name'] == "") ? data['first_name']." ".data['last_name'] : data['preferred_name'];
        midwifery.pronouns = data['pronouns'];
        midwifery.date_of_birth = data['date_of_birth'];
        midwifery.preferred_phone = data['preferred_phone'];
        midwifery.preferred_email = data['preferred_email'];
        midwifery.when_was_the_first_day_of_your_last_period_ = data['when_was_the_first_day_of_your_last_period_'];

        midwiferyCommunityLocations = MidwiferyCommunityLocations::where('description', trim(data['community_located'])).first();
        midwifery.community_located = count(midwiferyCommunityLocations) ? midwiferyCommunityLocations.id : data['community_located'];
        midwiferyLanguages = MidwiferyLanguages::where('description', trim(data['preferred_language'])).first();
        midwifery.preferred_language =  count(midwiferyLanguages) ? midwiferyLanguages.id : data['preferred_language'];

        midwiferyPreferredContactTypes = MidwiferyPreferredContactTypes::where('name', trim(data['prefer_to_be_contacted'])).first();
        midwifery.prefer_to_be_contacted = count(midwiferyPreferredContactTypes) ? midwiferyPreferredContactTypes.id : null;
        midwiferyBirthLocations = MidwiferyBirthLocations::where('name', trim(data['where_to_give_birth'])).first();
        midwifery.where_to_give_birth = count(midwiferyBirthLocations) ? midwiferyBirthLocations.id : null;

        midwifery.do_you_identify_with_one_or_more_of_these_groups_and_communities = (is_array( data['do_you_identify_with_one_or_more_of_these_groups_and_communities'] ) && !empty(data['do_you_identify_with_one_or_more_of_these_groups_and_communities'])) ? this.getMultipleIdsByModel("MidwiferyGroupsCommunities", data['do_you_identify_with_one_or_more_of_these_groups_and_communities']) : null;
        midwifery.how_did_you_find_out_about_the_midwifery_clinic_select_all_that_ = (is_array( data['how_did_you_find_out_about_the_midwifery_clinic_select_all_that_'] ) && !empty(data['how_did_you_find_out_about_the_midwifery_clinic_select_all_that_'])) ? this.getMultipleIdsByModel("MidwiferyClinicContactTypes", data['how_did_you_find_out_about_the_midwifery_clinic_select_all_that_']) : null;

        midwifery.yukon_health_insurance = this.getMidwiferyOptions("yukon_health_insurance", data['yukon_health_insurance']);
        midwifery.need_interpretation = this.getMidwiferyOptions("need_interpretation", data['need_interpretation']);
        midwifery.okay_to_leave_message = this.getMidwiferyOptions("okay_to_leave_message", data['okay_to_leave_message']);
        midwifery.date_confirmed = this.getMidwiferyOptions("date_confirmed", data['date_confirmed']);
        midwifery.first_pregnancy = this.getMidwiferyOptions("first_pregnancy", data['first_pregnancy']);
        midwifery.complications_with_previous = this.getMidwiferyOptions("complications_with_previous", data['complications_with_previous']);
        midwifery.midwife_before = this.getMidwiferyOptions("midwife_before", data['midwife_before']);
        midwifery.medical_concerns = this.getMidwiferyOptions("medical_concerns", data['medical_concerns']);
        midwifery.have_you_had_primary_health_care = this.getMidwiferyOptions("have_you_had_primary_health_care", data['have_you_had_primary_health_care']);
        midwifery.family_physician = this.getMidwiferyOptions("family_physician", data['family_physician']);
        midwifery.major_medical_conditions = this.getMidwiferyOptions("major_medical_conditions", data['major_medical_conditions']);

        midwifery.due_date = data['due_date'];
        midwifery.how_many_vaginal_births = data['how_many_vaginal_births'];
        midwifery.how_many_c_section_births = data['how_many_c_section_births'];
        midwifery.provide_details = data['provide_details'];
        midwifery.provide_details2 = data['provide_details2'];
        midwifery.menstrual_cycle_length = data['menstrual_cycle_length'];
        midwifery.physician_s_name = data['physician_s_name'];
        midwifery.provide_details3 = data['provide_details3'];

        result = midwifery->save();

        return response()->json(result, 201);

});

function getConfirmationNumber() {
        // Generate a new confirmation number using php's uniqid(), which
        // essensially generates a unix timestamp with microseconds and returns as
        // hexidecimal. This gives us a relatively high certainty of uniquess.
        var id = uniqid();
        // Shorten the hexidec id by converting to base 36 (0-9a-z).
        id = strtoupper(base_convert(id, 16, 36));
        // Convert to uppercase for better human readability.
        id = strtoupper(id);
  
        return id;
}

function getMultipleIdsByModel(model: any, names: any) {
            var others = "";
            var auxNames = names;

            if(model == "MidwiferyGroupsCommunities") {
                var groups = db("midqifery.midwifery_groups_communities")
                                .select('midwifery_groups_communities.*')
                                .pluck('description', 'name');

                _.forEach(names, function(value: any, key: any) {
                        var info_find = db("midwifery.midwifery_clinic_contact_types").where({ id: value });

                        if(typeof groups[value] == 'undefined'){
                                others = names[key];
                                unset(names[key]);
                        }
                });

                data = MidwiferyGroupsCommunities::whereIn('name', names)->get();
            }else if(model == "MidwiferyClinicContactTypes") {
                contact = MidwiferyClinicContactTypes::all()->pluck('description', 'name');

                foreach (names as key => value) {
                    if(!isset(contact[value])){
                        others = names[key];
                        unset(names[key]);
                    }
                }

                data = MidwiferyClinicContactTypes::whereIn('name', names)->get();
            }

            if(count(data)){
                modelValues = "";
                max = count(data);
                count = 1;
                if(max == 1){
                    modelValues = strval(data[0]->id);
                }else{
                    foreach (data as key => value) {
                        if(count == max){
                            modelValues .= strval(value->id);
                        }else{
                            modelValues .= strval(value->id).",";
                        }

                        count++;
                    }
                }

                if(others !== "") {
                    return modelValues.",".others;
                }else{
                    return modelValues;
                }

            }elseif(!count(data) && count(auxNames) > 0){
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

public function changeRequestStatus(id: any){

        var mid = db("midwifery.midwifery_services").where({ id: id });
        mid.status = 'closed';
        mid.save();

        res.json({ data: mid });

}
