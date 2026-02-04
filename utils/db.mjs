// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString:
    "postgresql://postgres:Neyoti@4411@localhost:5432/checkpoint-be",
});

export default connectionPool;
