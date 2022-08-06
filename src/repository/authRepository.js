import connection from '../dbStrategy/postgres.js';

export async function checkEmailExists(email){

    return connection.query(`select * from users where email = $1`, [email]);
}


export async function insertUser(userName, userEmail, senhaCriptografada){

    connection.query(`INSERT INTO users (name, "email", "password") values ($1, $2, $3)`, [userName, userEmail, senhaCriptografada]);
}

export async function checkUserLogged(email){

    return connection.query(`SELECT * FROM users where email = $1`, [email]);
}

export async function insertSession(token, userId){


    connection.query(
        `INSERT INTO sessions ("token", "userId") values ($1, $2)`, [token, userId]
      );
}