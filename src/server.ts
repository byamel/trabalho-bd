import express from "express";
import routes from "./routes";
import path from "path";

const app = express();

app.use(express.json());

app.use(express.static(path.join(__dirname, "../public")));

app.use(routes);

app.listen(3000, () => {
    console.log("Servidor rodando em http://localhost:3000");
});