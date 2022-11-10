import express, { Request, Response } from "express";
import { EnsureAuthenticated } from "./auth"
import { body, param } from "express-validator";
//import moment from "moment";
import knex from "knex";
//import { ReturnValidationErrors } from "../../middleware";
import { DB_CONFIG } from "../config";

//let { RequireServerAuth, RequireAdmin } = require("../auth")

const db = knex(DB_CONFIG)

export const constellationRouter = express.Router();

constellationRouter.get("/api/constellationHealth", EnsureAuthenticated, async (req: Request, res: Response) => {
        //let { id } = req.params;

        var constellationHealth =  await db("constellation_health.constellation_health")
            .leftJoin('constellation_health_language', 'constellation_health.language_prefer_to_receive_services', '=', 'constellation_health_language.id')
            .select('constellation_health.*',
                    'constellation_health_language.description as language_preferred')
            .where('constellation_health.status', 'open')
            .orderBy('constellation_health.id', 'asc');

        constellationHealth.forEach(function (value: any) {
            if(value.language_prefer_to_receive_services){
                value.language_prefer_to_receive_services = value.preferred_language;
            }else{
                value.language_prefer_to_receive_services = value.language_preferred;
            }

            if(!(value.diagnosis) && value.diagnosis.indexOf(',') !== false){
                let ids = value.diagnosis.split(",");
                let dataString = "";
                var info_find = Object();

                for (let i=0; i < ids.length ; i++) {
                    info_find = db("constellation_health.constellation_health")
                                    .where({ id: ids[i] });

                    if(!isNaN(ids[i]) && !info_find && typeof info_find.description !== 'undefined'){
                        dataString += info_find.description+",";
                    }else{
                        dataString += ids[i]+",";
                    }
                }

                if(dataString.substr(-1) == ","){
                    dataString = dataString.substr(0, -1);
                }

                value.diagnosis = dataString.replace(",",", ");

            }else if(!value.diagnosis){
                info_find = db("constellation_health.constellation_health_diagnosis_history").where({ id: value.diagnosis });

                if(!isNaN(value.diagnosis) && !info_find && typeof info_find.description !== 'undefined'){
                    value.diagnosis = info_find.description;
                }
            }
        });

        res.status(404).send({ data: constellationHealth });
});

constellationRouter.get("/:constellationHealth_id",[param("constellationHealth_id").isInt().notEmpty()], async (req: Request, res: Response) => {
        let { constellationHealth_id } = req.params;
        var constellationHealth = Object();
        var constellationFamily = Object();

        constellationHealth = db("constellation_health.constellation_health")
            .leftJoin('constellation_health_language', 'constellation_health.language_prefer_to_receive_services', 'constellation_health_language.id')
            .leftJoin('constellation_health_diagnosis_history', 'constellation_health.diagnosis', 'constellation_health_diagnosis_history.id')
            .leftJoin('constellation_health_demographics', 'constellation_health.demographics_groups', 'constellation_health_demographics.id')
            .select('constellation_health.*',
                    'constellation_health_language.description as language_prefer_description',
                    'constellation_health_demographics.description as demographic_description')
            .where({ id: constellationHealth_id });

        constellationFamily = db("constellation_health.constellation_health_family_members")
        .leftJoin('constellation_health_language', 'constellation_health_family_members.language_prefer_to_receive_services_family_member', 'constellation_health_language.id')
            .leftJoin('constellation_health_diagnosis_history', 'constellation_health_family_members.diagnosis_family_member', 'constellation_health_diagnosis_history.id')
            .leftJoin('constellation_health_demographics', 'constellation_health_family_members.demographics_groups_family_member', 'constellation_health_demographics.id')
            .select('constellation_health_family_members.*',
                    'constellation_health_language.description as language_prefer_description_family_member',
                    'constellation_health_demographics.description as demographic_description_family_member')
            .where({ id: constellationHealth_id });

        if(constellationHealth.date_of_birth == 0) {
            constellationHealth.date_of_birth =  "N/A";
        }

        if(!(constellationHealth.diagnosis) && constellationHealth.diagnosis.indexOf(',') !== false){
            var ids = constellationHealth.diagnosis.split(",");
            let dataString = "";
            var info_find = Object();

            for (let i=0; i < ids.length ; i++) {
                info_find =  db("constellation_health.constellation_health_diagnosis_history").where({ id: ids[i] });
                if(!isNaN(ids[i]) && !(info_find) && typeof info_find.description !== 'undefined' ){
                    dataString += info_find.description+",";
                }else{
                    dataString += ids[i]+",";
                }
            }

            if(dataString.substr(-1) == ","){
                dataString = dataString.substr(0, -1);
            }

            constellationHealth.diagnosis = dataString.replace(",",", ");

        }else if(!(constellationHealth.diagnosis)){
            info_find = db("constellation_health.constellation_health_diagnosis_history").where({ id: constellationHealth.diagnosis });

            if(!isNaN(constellationHealth.diagnosis) && !(info_find) && typeof info_find.description !== 'undefined'){
                constellationHealth.diagnosis = info_find.description;
            }
        }

        constellationHealth.flagFamilyMembers = false;

        if(constellationFamily.length){
            constellationHealth.flagFamilyMembers = true;
            constellationFamily.forEach(function (value: any, key: any) {

                if(value.date_of_birth_family_member == 0) {
                    value.date_of_birth_family_member =  "N/A";
                }

                if(!(value.diagnosis_family_member) && value.diagnosis_family_member.indexOf(',') !== false){
                    var ids = value.diagnosis_family_member.split(",");
                    var dataString = "";
                    var info_find = Object();

                    for (let i=0; i < ids.length ; i++) {
                        info_find =  db("constellation_health.constellation_health_diagnosis_history").where({ id: ids[i] });
                        if(!isNaN(ids[i]) && !(info_find) && typeof info_find.description !== 'undefined'){
                            dataString += info_find.description+",";
                        }else{
                            dataString += ids[i]+",";
                        }
                    }

                    if(dataString.substr(-1) == ","){
                        dataString = dataString.substr(0, -1);
                    }

                    constellationFamily[key].diagnosis_family_member = dataString.replace(",",", ");

                }else if(!value.diagnosis_family_member){
                    info_find = db("constellation_health.constellation_health_diagnosis_history").where({ id: value.diagnosis_family_member });

                    if(!isNaN(value.diagnosis_family_member) && !(info_find) && typeof info_find.description !== 'undefined'){
                        constellationFamily[key].diagnosis_family_member = info_find.description;
                    }
                }
            });
        }
});

constellationRouter.post("/constellationHealth/store", EnsureAuthenticated, async (req: Request, res: Response) => {
    {

            let { first_name, last_name, initials, locator_number, sin } = req.body;
            data = request->json()->all();

            var constellationHealth = Object();
            var demographics = Object();

            constellationHealth.first_name = data['first_name'];
            constellationHealth.last_name = data['last_name'];
            constellationHealth.is_this_your_legal_name_ = data['is_this_your_legal_name_'];
            constellationHealth.your_legal_name = empty(data['your_legal_name']) ? data['first_name']." ".data['last_name'] : data['your_legal_name'];
            constellationHealth.pronouns = data['pronouns'];
            constellationHealth.date_of_birth = data['date_of_birth'];
            constellationHealth.yhcip = data['yhcip'];
            constellationHealth.postal_code = data['postal_code'];
            constellationHealth.phone_number = data['phone_number'];
            constellationHealth.email_address = data['email_address'];
            constellationHealth.language_prefer_to_receive_services = data['language_prefer_to_receive_services'];
            constellationHealth.current_family_physician = data['current_family_physician'];
            constellationHealth.accessing_health_care = data['accessing_health_care'];
            constellationHealth.leave_phone_message = data['leave_phone_message'];
            constellationHealth.interpretation_support = data['interpretation_support'];
            constellationHealth.family_physician = data['family_physician'];
            constellationHealth.prefer_to_be_contacted = data['prefer_to_be_contacted'];

            constellationHealth.have_yhcip = data['have_yhcip'];
            constellationHealth.health_care_card = data['health_care_card'];
            constellationHealth.province = data['province'];

            languages = ConstellationHealthLanguage::where('value', trim(data['language_prefer_to_receive_services']))->first();

            if(count(languages)){
                constellationHealth.language_prefer_to_receive_services = languages.id;
            }

            if(!empty(data['language_prefer_to_receive_services'])){
                constellationHealth.preferred_language = data['other_language'];
            }

            constellationHealth.diagnosis = (is_array( data['diagnosis'] ) && !empty(data['diagnosis'])) ? getMultipleIdsByModel("ConstellationHealthDiagnosisHistory", data['diagnosis']) : null;

            demographics = ConstellationHealthDemographics::where('value', trim(data['demographics_groups'])).first();

            if(demographics.length){
                constellationHealth.demographics_groups = demographics.id;
            }else{
                constellationHealth.demographics_groups = data['demographics_groups'];
            }

            constellationHealth.include_family_members = data['include_family_members'];

            result = constellationHealth.save();

            if(!empty(data['family_members_json']) && data['family_members_json'] !== "[]"){
                stringWithoutBrackets = str_replace('[{', '{', str_replace('}]', '}', data['family_members_json']));
                stringSeparation = str_replace('},{', '}*SEPARATION*{', stringWithoutBrackets);
                arrayJson = explode("*SEPARATION*",  stringSeparation);

                if(is_array( arrayJson )) {
                    resultFamilyMembers = storeFamilyMembers(constellationHealth.id, arrayJson);
                }
            }

            return response()->json(result, 201);

    });

function getMultipleIdsByModel(model: string, names: any) {
    var others = "";
    var auxNames = names;
    var data = Array();
    var diagnosisHistory = Array();
    var demographics = Array();

    if(model == "ConstellationHealthDiagnosisHistory") {
        diagnosisHistory = db("constellation_health.constellation_health_diagnosis_history").select('constellation_health_diagnosis_history.*');

        names.forEach(function (value: any, key: any) {
            if(!(diagnosisHistory[value])){
                others = names[key];
                names.splice(key, 1);
            }
        });

        //var data = ConstellationHealthDiagnosisHistory::whereIn('value', names)->get();
        data = db("constellation_health.constellation_health_diagnosis_history")
                        .select('constellation_health_diagnosis_history.*')
                        .whereIn('value', names);

    }else if(model == "ConstellationHealthDemographics") {
        //var demographics = ConstellationHealthDemographics::all()->pluck('description', 'value');
        demographics = db("constellation_health.constellation_health_demographics")
                                .select('constellation_health_demographics.*')
                                .pluck('description', 'value');

        names.forEach(function (value: any, key: any) {
            if(!(demographics[value])){
                others = names[key];
                names.splice(key, 1);
            }
        });

        //var data = ConstellationHealthDemographics::whereIn('value', names)->get();
       data = db("constellation_health.constellation_health_demographics")
                        .select('constellation_health_demographics.*')
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
            return modelValues+","+others;
        }else{
            return modelValues;
        }

    }else if(!data.length && auxNames.length > 0){
        return auxNames[0];
    }else{
        return null;
    }
}