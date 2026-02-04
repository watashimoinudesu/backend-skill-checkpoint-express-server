import express from "express";
import connectionPool from "./utils/db.mjs";
import answersRouter from "./routes/answers.mjs";
import questionsRouter from "./routes/questions.mjs";

const app = express();
const port = 4000;

app.use(express.json());
app.use('/answers',answersRouter);
app.use('/questions',questionsRouter);

app.get("/test", (req, res) => {
  return res.json("Server API is working 🚀");
});









app.listen(port, () => {
  console.log(`Server is running at ${port}`);
});
