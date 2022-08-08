import pkg from 'pg';

const { Pool } = pkg;

// const connection = new Pool({
//   host: '127.0.0.1',
//   port: 5432,
//   user: 'postgres',
//   password: '*****',
//   database: 'shortly'
// });

const databaseConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: {
      rejectUnauthorized: false
  }
}

const connection = new Pool(databaseConfig);


export default connection;
