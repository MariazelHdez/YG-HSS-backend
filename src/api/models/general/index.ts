export interface SubmissionsDTO {
    id: string;
    department: string;
    submissions: number;
}
export interface SubmissionStatusDTO extends SubmissionsDTO {
    status: string;
}

export interface SubmissionsTotalDTO extends SubmissionsDTO {
    date_code: string
}
export interface AuditDTO {
    id: number;
    event_type: number;
    event_date: Date;
    schema_name: string;
    table_name: string;
    entity_id: number;
    new_key: string;
    new_value: any;
    old_key: string;
    old_value: any;
}