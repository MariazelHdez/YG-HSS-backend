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

export interface AuditBaseDTO {
    id: number;
    event_type: number;
    event_date: Date;
    entity_id: number;
}

export interface AuditDTO extends AuditBaseDTO {
    schema_name: string;
    table_name: string;
    new_key: string;
    new_value: any;
    old_key: string;
    old_value: any;
}

export interface AuditTimelineDTO extends AuditBaseDTO {
    department: string;
    icon_name: string;
    message: string;
}