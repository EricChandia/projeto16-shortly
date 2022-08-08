import connection from '../dbStrategy/postgres.js';

export async function checkEmailExists(email){

    return connection.query(`select * from users where email = $1`, [email]);
}


export async function insertUser(userName, userEmail, senhaCriptografada, createdAt){

    connection.query(`INSERT INTO users (name, "email", "password", "createdAt") values ($1, $2, $3, $4)`, [userName, userEmail, senhaCriptografada, createdAt]);
}

export async function checkUserLogged(email){

    return connection.query(`SELECT * FROM users where email = $1`, [email]);
}

export async function insertSession(token, userId){


    connection.query(
        `INSERT INTO sessions ("token", "userId") values ($1, $2)`, [token, userId]
      );
}