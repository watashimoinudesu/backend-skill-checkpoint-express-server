# An Express Server Template
# Q&A REST API (Express + PostgreSQL)

A RESTful API for a simple Question & Answer system.
Users can create, view, update, delete questions and answers, search questions, and vote on questions/answers.
## Tech Stack
- Node.js
- Express.js
- PostgreSQL
## Project Structure
.
├── app.mjs
├── routes
│   ├── questions.mjs
│   └── answers.mjs
├── middlewares
│   ├── validateQuestion.mjs
│   └── validateAnswer.mjs
└── utils
    └── db.mjs
## Design Decisions

### 1) Express Router
Routes are separated by resource for better organization:
- `routes/questions.mjs` for question-related endpoints
- `routes/answers.mjs` for answer-related endpoints

### 2) Validation with Middleware
Reusable middleware is used to validate request data:
- Question validation: `title`, `description`, `category` must be provided and non-empty
- Answer validation: `content` must be provided and must not exceed 300 characters

### 3) Manual Cascade Delete (Delete answers when deleting a question)
When deleting a question, all related answers must be deleted.
This is handled at the API level (without ON DELETE CASCADE) using a database transaction:
1. Check if the question exists
2. Delete answers for that question
3. Delete the question
4. Commit the transaction
## Features
### Questions
- Create a question
- Get all questions
- Get a question by ID
- Update a question
- Delete a question (also deletes its answers)
- Search questions by title or category
- Vote on a question (+1 / -1)

### Answers
- Create an answer for a question (max 300 characters)
- Get answers for a question
- Vote on an answer (+1 / -1)
## API Endpoints

### Questions
- POST `/questions`
- GET `/questions`
- GET `/questions/:questionId`
- PUT `/questions/:questionId`
- DELETE `/questions/:questionId`
- GET `/questions/search?title=...&category=...`
- POST `/questions/:questionId/answers`
- GET `/questions/:questionId/answers`
- POST `/questions/:questionId/vote`

### Answers
- POST `/answers/:answerId/vote`

