export function validateAnswerBody(req, res, next) {
    const { content } = req.body;
  
    if (!content || typeof content !== "string" || content.trim() === "") {
      return res.status(400).json({ message: "Invalid request data." });
    }
  
    const trimmed = content.trim();
  
    if (trimmed.length > 300) {
      return res.status(400).json({ message: "Invalid request data." });
    }
  
    req.body.content = trimmed;
    next();
  }
  