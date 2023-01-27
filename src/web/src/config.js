
export const applicationName = "Template App";
export const applicationIcon = "mdi-cash-register";
export const hasSidebar = true;
export const hasSidebarClosable = false;

export const sections = [
    {
        header: "Dashboard",
        data:[{
            name: "Dashboard",
            url: "/",
            icon: "mdi-view-dashboard"
        },
        {
            name: "Data grid",
            url: "/grid",
            icon: "mdi-table-large"
        }]
    },

    {
        header: "Constellation Health",
        data:[{
            name: "Submissions",
            url: "/constellation",
            icon: "mdi-account-group"
        }]
    },
    {
        header: "Health Information",
        data:[
            {
                name: "Submissions",
                url: "/hipma",
                icon: "mdi-format-list-bulleted"
            },
            {
                name: "Export",
                url: "/hipmaExport",
                icon: "mdi-file-move"
            }
        ]
    }
];
export const environment = process.env.NODE_ENV;
export const apiBaseUrl = process.env.NODE_ENV == "production" ? "" : "http://localhost:3000";
