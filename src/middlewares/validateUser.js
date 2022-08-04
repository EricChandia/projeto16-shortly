import connection from '../dbStrategy/postgres.js';

async function validateUser(req, res, next){
    const { authorization } = req.headers;
    const token = authorization?.replace('Bearer ', '');

    const session = await connection.query('select * from sessions where token = $1', [token]); 
    if(session.rowCount === 0){
        return res.status(400).send("Sessão não existe!");
      }

    res.locals.session = session.rows;

    next();
}

export default validateUser;