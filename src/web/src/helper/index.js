import moment from "moment";

const getFilterList = () => {
    const today = moment().format("YYYYMM");
    const fList = [
        { label: "Last 7 Days", id: `W${today}` }
    ];
    const month = moment().format("YYYYMM");
    fList.push({ label: "This Month", id: `M${month}` });
    for (let d = 1; d <= 12; d++) {
        let nDate = moment().subtract(d, 'month');
        fList.push({ label: nDate.format("MMMM YYYY"), id: `M${nDate.format("YYYYMM")}`});
    }
    return fList;    
};

const setData = (data, labelColor) => {
    return {
        labels: labelColor.map((x, i) => `${x.label}: ${data[i]}`),
        datasets: [
            {
                name: "status",
                backgroundColor: labelColor.map((x) => x.color),
                data: data
            } 
        ]
    }
};

export {
   getFilterList, 
   setData
};