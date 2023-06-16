const express = require("express");
const app = express();
app.use(express.json());

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const path = require("path");
const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server running at localhost:3000");
    });
  } catch (e) {
    console.log(`Error message:${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const hasPriorityAndStatusProperties = (requestQuery) => {
  return (
    requestQuery.priority !== undefined && requestQuery.status !== undefined
  );
};

const hasPriorityProperty = (requestQuery) => {
  return requestQuery.priority !== undefined;
};

const hasStatusProperty = (requestQuery) => {
  return requestQuery.status !== undefined;
};

//API1
app.get("/todos/", async (request, response) => {
  const { search_q = "", status, priority } = request.query;
  let getTodosQuery = "";
  switch (true) {
    case hasPriorityAndStatusProperties(request.query):
      getTodosQuery = `
          SELECT * FROM todo
          WHERE todo LIKE '%${search_q}%'
          AND status='${status}'
          AND priority='${priority}';`;
    case hasStatusProperty(request.query):
      getTodosQuery = `
          SELECT * FROM todo 
          WHERE todo LIKE '%${search_q}%' 
          AND status='${status}';
          `;
      break;
    case hasPriorityProperty(request.query):
      getTodosQuery = `
          SELECT * FROM todo 
          WHERE priority='${priority}';
          `;
    default:
      getTodosQuery = `
          SELECT * FROM todo 
          WHERE todo LIKE '%${search_q}%';`;
      break;
  }
  const dbResponse = await db.all(getTodosQuery);
  response.send(dbResponse);
});

//API2
app.get("/todos/:todoId", async (request, response) => {
  const { todoId } = request.params;
  const getTodo = `
        SELECT * FROM todo
        WHERE id=${todoId};
    `;
  const dbResponse = await db.get(getTodo);
  response.send(dbResponse);
});

//API3
app.post("/todos/", async (request, response) => {
  const todoDetails = request.body;
  const { id, todo, priority, status } = todoDetails;
  const addTodo = `
        INSERT INTO todo
        (id, todo, priority, status)
        VALUES
        (
            ${id},
            '${todo}',
            '${priority}',
            '${status}'
        );
    `;
  await db.run(addTodo);
  response.send("Todo Successfully Added");
});
//API4
app.put("/todos/:todoId/", async (request, response) => {
  const { todo, priority, status } = request.body;
  let updateTodo = "";
  let dbResponse = "";
  switch (true) {
    case status !== undefined:
      updateTodo = `
            UPDATE todo
            SET status='${status}';
            `;
      dbResponse = "Status Updated";
      break;
    case priority !== undefined:
      updateTodo = `
            UPDATE todo
            SET priority='${priority}';
            `;
      dbResponse = "Priority Updated";
      break;
    case todo !== undefined:
      updateTodo = `
            UPDATE todo
            SET todo='${todo}';
            `;
      dbResponse = "Todo Updated";
      break;

    default:
      break;
  }
  await db.run(updateTodo);
  response.send(dbResponse);
});
//API5
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
        DELETE FROM todo
        WHERE id=${todoId};
    `;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
