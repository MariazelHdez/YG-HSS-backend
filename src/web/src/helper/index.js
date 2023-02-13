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

const setSubmissionsStatusData = (data, labelColor) => {
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

const setSubmissionsData = (resp) => {
    const curData = resp.data
    const datasets = [];
    const labels = Object.entries(curData.labels).map((x) => x[0]);
    Object.entries(curData.data).forEach((g) => {
      const data = curData.data[g[0] ?? 0] ?? [];
      if (data) {
        const ds = {
          label:  g[1] &&  g[1][0] && g[1][0].department ?  g[1][0].department : g[0],
          data: labels.map((x) => {
            const filtered = data.filter((y) => y.date_code == x);
            let result = "";
            if (filtered.length > 0) {
                result = filtered[0].submissions;
            }
            return result;
          }),
          backgroundColor:  data.map((x) => x.color),
        };
        datasets.push(ds);
      }
    });
    return {
        labels: labels,
        datasets: datasets
    }
};

export {
   getFilterList, 
   setSubmissionsStatusData,
   setSubmissionsData
};