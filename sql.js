import knex from "knex";
import knexConfig from "./knexfile.js";

const sql = knex(knexConfig.development);

export default sql;