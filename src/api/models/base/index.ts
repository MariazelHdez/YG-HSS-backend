export interface BaseTableDTO {
    id: number;
    created_at: Date;
    updated_at: Date;
};

export interface ResultsDTO<T, K> {
    data: T;
    dataStatus: K;
};