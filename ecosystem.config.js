module.exports = {
    apps: [{
     name: "api-map",
     script: "npm",
     args: "run start",
     interpreter: "/root/.nvm/versions/node/v22.21.1/bin/node",
     env: {
      NODE_ENV: "production",
     }
   }]
}
