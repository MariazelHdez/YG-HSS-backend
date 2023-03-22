export const getJsonDataList = (fieldData: any): Array<any> => {
    const json = JSON.parse(fieldData);
    const list = json?.data ?? [];
    return list;
};