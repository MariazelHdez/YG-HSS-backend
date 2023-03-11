
export const applicationName = "Health and social services";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = true;
export const hasSidebarClosable = false;

export const sections = [
    {
        header: "Analytics",
        icon: "",
        data:[
            {
                name: "Dashboard",
                url: "/",
                icon: "fa-solid fa-grip"
            },
        ]
    },
    {
        header: "Constellation Health",
        icon: "/CH.png",
        data:[
            {
                name: "Submissions",
                url: "/constellation",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Analytics",
                url: "/constellationAnalytics",
                icon: "fa-solid fa-chart-line"
            },
            {
                name: "Export",
                url: "/constellationExport",
                icon: "fa-solid fa-file-export"
            }
        ]
    },
    {
        header: "HIPMA",
        icon: "/H.png",
        data:[
            {
                name: "Submissions",
                url: "/hipma",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Warnings",
                url: "/hipmaWarnings",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Analytics",
                url: "/hipmaAnalytics",
                icon: "fa-solid fa-chart-line"
            },
            {
                name: "Export",
                url: "/hipmaExport",
                icon: "fa-solid fa-file-export"
            }
        ]
    },
    {
        header: "Midwifery",
        icon: "/MS.png",
        data:[
            {
                name: "Submissions",
                url: "/midwifery",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Warnings",
                url: "/midwiferyWarnings",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Analytics",
                url: "/midwiferyAnalytics",
                icon: "fa-solid fa-chart-line"
            },
            {
                name: "Export",
                url: "/midwiferyExport",
                icon:  "fa-solid fa-file-export"
            }
        ]
    },
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
