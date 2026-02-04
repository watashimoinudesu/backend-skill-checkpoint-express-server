import { Router } from "express";
import connectionPool from "../utils/db.mjs";
import { validateQuestionBody } from "../middlewares/validateQuestion.mjs";
import { validateAnswerBody } from "../middlewares/validateAnswer.mjs";
const questionsRouter = Router()


questionsRouter.get("/", async (req, res) => {
    try {
      const result = await connectionPool.query("SELECT * FROM questions");
      return  res.status(200).json(result.rows);
    }catch (error) {
      console.error("Error getting assignments:", error);
      return res.status(500).json({ message: "Unable to fetch questions." })
    }
  });
  
questionsRouter.get("/search", async (req, res) => {
    try {
      const { title, category } = req.query;
  
      if (!title && !category) {
        return res.status(400).json({
          message: "Invalid search parameters.",
        });
      }
  
      let query = "SELECT * FROM questions WHERE 1=1";
      const values = [];
      let idx = 1;
  
      if (title) {
        query += ` AND title ILIKE $${idx}`;
        values.push(`%${title}%`);
        idx++;
      }
  
      if (category) {
        query += ` AND category ILIKE $${idx}`;
        values.push(`%${category}%`);
        idx++;
      }
  
      const result = await connectionPool.query(query, values);
  
      return res.status(200).json({
        data: result.rows,
      });
    } catch (error) {
      console.error("Error searching questions:", error);
      return res.status(500).json({
        message: "Unable to fetch a question.",
      });
    }
  });
questionsRouter.get("/:questionId/answers", async (req, res) => {
    try {
      const questionId = Number(req.params.questionId);
  
      
      if (Number.isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID." });
      }
  
      
      const questionResult = await connectionPool.query(
        "SELECT id FROM questions WHERE id = $1",
        [questionId]
      );
  
      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }
  
      const answerResult = await connectionPool.query(
        "SELECT id, content FROM answers WHERE question_id = $1",
        [questionId]
      );
  
      return res.status(200).json({
        data: answerResult.rows,
      });
    } catch (error) {
      console.error("Error getting answers by question ID:", error);
      return res.status(500).json({
        message: "Unable to fetch answers.",
      });
    }
  });
  
  
questionsRouter.get("/:questionId", async (req, res) => {
    try {
      const { questionId } = req.params;
      const result = await connectionPool.query("SELECT * FROM questions WHERE id = $1", [questionId]);
      if (!result.rows[0]) {
        return res.status(404).json({ message: "Question not found." });
      }
      return res.status(200).json({ data: result.rows[0] });
    } catch (error) {
      console.error("Error getting question by ID:", error);
      return res.status(500).json({ message: "Unable to fetch questions" });
    }
  });
  
  
questionsRouter.post("/",validateQuestionBody, async (req, res) => {
    try {
      const { title, description, category } = req.body;
  
      
      if (!title || !description || !category) {
        return res.status(400).json({
          message: "Invalid request data.",
        });
      }
  
  
      await connectionPool.query(
        `INSERT INTO questions (title, description, category)
         VALUES ($1, $2, $3)`,
        [title, description, category]
      );
  
      return res.status(201).json({
        message: "Question created successfully.",
      });
    } catch (error) {
      console.error("Error creating question:", error);
      return res.status(500).json({
        message: "Unable to create question.",
      });
    }
  });
  
questionsRouter.post("/:questionId/answers",validateAnswerBody, async (req, res) => {
    try {
      const questionId = Number(req.params.questionId);
      const { content } = req.body;
  
  
      if (Number.isNaN(questionId) || !content || typeof content !== "string" || content.trim() === "") {
        return res.status(400).json({ message: "Invalid request data." });
      }
  
    
      const questionResult = await connectionPool.query(
        "SELECT id FROM questions WHERE id = $1",
        [questionId]
      );
  
      if (questionResult.rows.length === 0) {
        return res.status(404).json({ message: "Question not found." });
      }
  
  
      await connectionPool.query(
        "INSERT INTO answers (content, question_id) VALUES ($1, $2)",
        [content.trim(), questionId]
      );
  
      return res.status(201).json({ message: "Answer created successfully." });
    } catch (error) {
      console.error("Error creating answer:", error);
      return res.status(500).json({ message: "Unable to create answers." });
    }
  });
  
questionsRouter.post("/:questionId/vote", async (req, res) => {
    try {
      const questionId = Number(req.params.questionId);
      const { vote } = req.body;
  
      
      if (Number.isNaN(questionId) || (vote !== 1 && vote !== -1)) {
        return res.status(400).json({ message: "Invalid vote value." });
      }
  
      
      const q = await connectionPool.query(
        "SELECT id FROM questions WHERE id = $1",
        [questionId]
      );
      if (q.rows.length === 0) {
        return res.status(404).json({ message: "Question not found." });
      }
  
      
      await connectionPool.query(
        "INSERT INTO question_votes (question_id, vote) VALUES ($1, $2)",
        [questionId, vote]
      );
  
      return res
        .status(200)
        .json({ message: "Vote on the question has been recorded successfully." });
    } catch (error) {
      console.error("Error voting question:", error);
      return res.status(500).json({ message: "Unable to vote question." });
    }
  });
  
  questionsRouter.delete("/:questionId", async (req, res) => {
    const client = await connectionPool.connect();
  
    try {
      const questionId = Number(req.params.questionId);
  
      if (Number.isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid request data." });
      }
  
      await client.query("BEGIN");
  
      
      const q = await client.query("SELECT id FROM questions WHERE id = $1", [questionId]);
      if (q.rows.length === 0) {
        await client.query("ROLLBACK");
        return res.status(404).json({ message: "Question not found." });
      }
  
      
      await client.query("DELETE FROM answers WHERE question_id = $1", [questionId]);
  
      
      await client.query("DELETE FROM questions WHERE id = $1", [questionId]);
  
      await client.query("COMMIT");
  
      return res.status(200).json({
        message: "Question post has been deleted successfully.",
      });
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error deleting question:", error);
      return res.status(500).json({ message: "Unable to delete question." });
    } finally {
      client.release();
    }
  });
  
  
questionsRouter.delete("/:questionId/answers", async (req, res) => {
    try {
      const questionId = Number(req.params.questionId);
  
      
      if (Number.isNaN(questionId)) {
        return res.status(400).json({ message: "Invalid question ID." });
      }
  
      
      const questionResult = await connectionPool.query(
        "SELECT id FROM questions WHERE id = $1",
        [questionId]
      );
  
      if (questionResult.rows.length === 0) {
        return res.status(404).json({
          message: "Question not found.",
        });
      }
  
      
      await connectionPool.query(
        "DELETE FROM answers WHERE question_id = $1",
        [questionId]
      );
  
      return res.status(200).json({
        message: "All answers for the question have been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting answers for question:", error);
      return res.status(500).json({
        message: "Unable to delete answers.",
      });
    }
  });
  
questionsRouter.put("/:questionId",validateQuestionBody, async (req, res) => {
    try {
      const questionId = Number(req.params.questionId);
      const { title, description, category } = req.body;
  
      
      if (
        Number.isNaN(questionId) ||
        !title ||
        !description ||
        !category ||
        typeof title !== "string" ||
        typeof description !== "string" ||
        typeof category !== "string" ||
        title.trim() === "" ||
        description.trim() === "" ||
        category.trim() === ""
      ) {
        return res.status(400).json({ message: "Invalid request data." });
      }
  
      
      const result = await connectionPool.query(
        `UPDATE questions
         SET title = $1, description = $2, category = $3
         WHERE id = $4
         RETURNING id`,
        [title.trim(), description.trim(), category.trim(), questionId]
      );
  
      if (result.rows.length === 0) {
        return res.status(404).json({ message: "Question not found." });
      }
  
      return res.status(200).json({ message: "Question updated successfully." });
    } catch (error) {
      console.error("Error updating question:", error);
      return res.status(500).json({ message: "Unable to fetch questions." });
    }
  });


  export default questionsRouter;