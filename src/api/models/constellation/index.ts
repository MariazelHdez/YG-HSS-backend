import { ResultsDTO } from './../base/index';
import { BaseTableDTO } from "models/base";
export interface ConstellationHealthLanguage {
    id: number;
    value: string;
    description: string;
}

export interface ConstellationFamilyDTO extends BaseTableDTO {
    constellation_health_id: number;
    first_name_family_member: string;
    last_name_family_member: string;
    is_this_your_legal_name__family_member: string;
    your_legal_name_family_member: string;
    pronouns_family_member: string;
    date_of_birth_family_member: Date;
    have_yhcip_family_member: string;
    health_care_card_family_member: string;
    province_family_member: string;
    yhcip_family_member: string;
    relationship_family_member: string;
    language_prefer_to_receive_services_family_member: number;
    preferred_language_family_member: string;
    interpretation_support_family_member: string;
    family_physician_family_member: string;
    current_family_physician_family_member: string;
    accessing_health_care_family_member: string;
    diagnosis_family_member: string;
    demographics_groups_family_member: number;
}

export interface ConstellationStatusDTO {
    value: number;
    text: string;
}

export interface ConstellationHealthDTO extends BaseTableDTO {
    status: number;
    first_name: string;
    last_name: string;
    is_this_your_leagal_name: string;
    your_legal_name: string;
    pronouns: string;
    date_of_birth: Date | string;
    have_yhcip: string;
    health_care_card: string;
    province: string;
    yhcip: string;
    postal_code: string;
    prefer_to_be_contacted: string;
    phone_number: string;
    email_address: string;
    leave_phone_message: string;
    language_prefer_to_receive_services: number;
    preferred_language: string;
    interpretation_support: string;
    family_physician: string;
    current_family_physician: string;
    accessing_health_care: string;
    diagnosis: string;
    demographics_groups: number;
    include_family_members: string;
    showUrl: string;
    flagFamilyMembers: boolean;
}

export interface ConstellationFamilyResultDTO extends ResultsDTO<ConstellationHealthDTO, ConstellationStatusDTO[]> {
    status: number;
    dataConstellationFamily: Array<ConstellationFamilyDTO>;
    fileName: string;
}