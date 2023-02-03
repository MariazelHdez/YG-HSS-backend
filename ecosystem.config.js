module.exports = {
  "apps": [
      {
          "name": "YG-HSS-api",
          "cwd": "./src/api",
          "script": "npm",
          "args" : "run start:dev",
          "env_development": {
            "NODE_ENV": "development"
          }
      },
      {
        "name": "YG-HSS-web",
        "cwd": "./src/web",
        "script": "npm",
        "args" : "run start:dev",
        "env_development": {
          "NODE_ENV": "development"
        }
    }
  ]
}

