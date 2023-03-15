
export const applicationName = "Health and social services";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = true;
export const hasSidebarClosable = false;

export const sections = [
    {
        header: "Analytics",
        icon: "",
        permissions: [
            "dashboard_view"
        ],
        data:[
            {
                name: "Dashboard",
                url: "/",
                icon: "fa-solid fa-grip",
                permissions: [
                    "dashboard_view"
                ]
            },
        ]
    },
    {
        header: "Constellation Health",
        icon: "/CH.png",
        permissions: [
            "constellation_view"
        ],
        data:[
            {
                name: "Submissions",
                url: "/constellation",
                icon: "fa-regular fa-rectangle-list",
                permissions: [
                    "constellation_view"
                ]
            },
            {
                name: "Warnings",
                url: "/constellationWarnings",
                icon: "fa-regular fa-rectangle-list"
            },
            {
                name: "Analytics",
                url: "/constellationAnalytics",
                icon: "fa-solid fa-chart-line",
                permissions: [
                    "constellation_view"
                ]
            },
            {
                name: "Export",
                url: "/constellationExport",
                icon: "fa-solid fa-file-export",
                permissions: [
                    "constellation_view"
                ]
            }
        ]
    },
    {
        header: "HIPMA",
        icon: "/H.png",
        permissions: [
            "hipma_view"
        ],
        data:[
            {
                name: "Submissions",
                url: "/hipma",
                icon: "fa-regular fa-rectangle-list",
                permissions: [
                    "hipma_view"
                ]
            },
            {
                name: "Warnings",
                url: "/hipmaWarnings",
                icon: "fa-regular fa-rectangle-list",
                permissions: [
                    "hipma_view"
                ]
            },
            {
                name: "Analytics",
                url: "/hipmaAnalytics",
                icon: "fa-solid fa-chart-line",
                permissions: [
                    "hipma_view"
                ]
            },
            {
                name: "Export",
                url: "/hipmaExport",
                icon: "fa-solid fa-file-export",
                permissions: [
                    "hipma_view"
                ]
            }
        ]
    },
    {
        header: "Midwifery",
        icon: "/MS.png",
        permissions: [
            "midwifery_view"
        ],
        data:[
            {
                name: "Submissions",
                url: "/midwifery",
                icon: "fa-regular fa-rectangle-list",
                permissions: [
                    "midwifery_view"
                ]
            },
            {
                name: "Warnings",
                url: "/midwiferyWarnings",
                icon: "fa-regular fa-rectangle-list",
                permissions: [
                    "midwifery_view"
                ]
            },
            {
                name: "Analytics",
                url: "/midwiferyAnalytics",
                icon: "fa-solid fa-chart-line",
                permissions: [
                    "midwifery_view"
                ]
            },
            {
                name: "Export",
                url: "/midwiferyExport",
                icon:  "fa-solid fa-file-export",
                permissions: [
                    "midwifery_view"
                ]
            }
        ]
    },
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
