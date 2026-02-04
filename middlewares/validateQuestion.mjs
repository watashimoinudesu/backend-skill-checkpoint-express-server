export function validateQuestionBody(req, res, next) {
    const { title, description, category } = req.body;
  
    if (
      !title || !description || !category ||
      typeof title !== "string" ||
      typeof description !== "string" ||
      typeof category !== "string" ||
      title.trim() === "" ||
      description.trim() === "" ||
      category.trim() === ""
    ) {
      return res.status(400).json({ message: "Invalid request data." });
    }
  
    req.body.title = title.trim();
    req.body.description = description.trim();
    req.body.category = category.trim();
  
    next();
  }
  