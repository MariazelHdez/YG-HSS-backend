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
