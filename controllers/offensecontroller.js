const { Pool } = require("pg");
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function logOffense(userId, username, message) {
  await pool.query(
    `INSERT INTO offenses (user_id, username, message) VALUES ($1, $2, $3)`,
    [userId, username, message]
  );
}

async function getOffenseCount(userId) {
  const res = await pool.query(`SELECT COUNT(*) FROM offenses WHERE user_id = $1`, [userId]);
  return parseInt(res.rows[0].count, 10);
}

async function getOffenseHistory(userId) {
  const res = await pool.query(
    `SELECT message, timestamp FROM offenses WHERE user_id = $1 ORDER BY timestamp DESC`,
    [userId]
  );
  return res.rows;
}

async function logSuspension(userId, username) {
  await pool.query(
    `INSERT INTO suspensions (user_id, username) VALUES ($1, $2)`,
    [userId, username]
  );
}

async function isUserSuspended(userId) {
  const res = await pool.query(`SELECT * FROM suspensions WHERE user_id = $1`, [userId]);
  return res.rows.length > 0;
}

async function clearSuspension(userId) {
  try {
    const result = await pool.query(`DELETE FROM suspensions WHERE user_id = $1 RETURNING *`, [userId]);
    return result.rowCount > 0;
  } catch (err) {
    console.error("❌ Error clearing suspension:", err);
    throw err;
  }
}

module.exports = {
  logOffense,
  getOffenseCount,
  getOffenseHistory,
  logSuspension,
  isUserSuspended,
  clearSuspension
};
