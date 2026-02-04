import { Router } from "express";
import connectionPool from "../utils/db.mjs";


const answersRouter = Router()

answersRouter.post("/:answerId/vote", async (req, res) => {
    try {
      const answerId = Number(req.params.answerId);
      const { vote } = req.body;
  
      
      if (Number.isNaN(answerId) || (vote !== 1 && vote !== -1)) {
        return res.status(400).json({ message: "Invalid vote value." });
      }
  
      
      const a = await connectionPool.query(
        "SELECT id FROM answers WHERE id = $1",
        [answerId]
      );
  
      if (a.rows.length === 0) {
        return res.status(404).json({ message: "Answer not found." });
      }
  
      
      await connectionPool.query(
        "INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2)",
        [answerId, vote]
      );
  
      return res.status(200).json({
        message: "Vote on the answer has been recorded successfully.",
      });
    } catch (error) {
      console.error("Error voting answer:", error);
      return res.status(500).json({ message: "Unable to vote answer." });
    }
  });
  export default answersRouter