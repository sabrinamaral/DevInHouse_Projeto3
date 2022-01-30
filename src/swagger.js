const swaggerAutogen = require("swagger-autogen")();

const outputFile = "./src/swagger_output.json";
const endpointsFiles = ["./src/routes/index.js"];

const doc = {
  info: {
    version: "1.0.0",
    title: "DEVinBank Pagamentos | Conta 365",
    description:
      "API developed to meet the third DevInHouse Project course requirements.",
  },
  host: "localhost:3333",
  basePath: "/",
  schemes: ["http"],
  consumes: ["application/json", "application/xml"],
  produces: ["application/json"],
  tags: [
    {
      name: "User",
      description: "Endpoints",
    },
    {
      name: "Transactions",
      description: "Endpoints",
    },
  ],
};
swaggerAutogen(outputFile, endpointsFiles, doc);
