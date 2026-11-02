import { TEST_DATABASE_URL } from "./database-url";

process.env.DATABASE_URL = TEST_DATABASE_URL;
delete process.env.VITE_DATABASE_URL;
