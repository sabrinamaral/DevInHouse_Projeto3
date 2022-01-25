const express = require("express");
const routes = require("./routes");

const swaggerUi = require("swagger-ui-express");
const swaggerFile = require("./swagger_output.json");

const app = express();

app.use("/doc", swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.use(express.json());
app.use(routes);

app.listen(3000, () => console.log("server listening on port 3000"));
