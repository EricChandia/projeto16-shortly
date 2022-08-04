import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from '../dbStrategy/postgres.js';
import joi from 'joi';

export async function createUser(req, res) {
    try{
        const user = req.body;
  
        const userSchema = joi.object({
          name: joi.string().required(),
          email: joi.string().email().required().regex(/^[a-z0-9.]+@[a-z0-9]+\.[a-z]+\.([a-z]+)?$/i),
          password: joi.string().required(),
          confirmPassword: joi.string().required()
        });
      
        const { error } = userSchema.validate(user);
      
        if (error) {
            console.log(error);
          return res.sendStatus(422);
        }
      
        if (user.password != user.confirmPassword) {
          return res.status(422).send('Digite a mesma senha nos dois campos');
        }
      
        const senhaCriptografada = bcrypt.hashSync(user.password, 10);
      
        const emailExists = await connection.query(`select * from users where email = $1`, [user.email]);
        if(emailExists.rowCount > 0){
            return res.status(409).send("Email já existe!");
        }
    
    
        await connection.query(`INSERT INTO users (name, "email", "password") values ($1, $2, $3)`, [user.name, user.email, senhaCriptografada]);
        res.status(201).send('Usuário criado com sucesso');
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }



  export async function loginUser(req, res) {
    try{
        const user = req.body;
  
        const userSchema = joi.object({
          email: joi.string().email().required(),
          password: joi.string().required()
        });
      
        const { error } = userSchema.validate(user);
      
        if (error) {
          return res.sendStatus(422);
        }
      
        const userLogged = await connection.query(`SELECT * FROM users where email = $1`, [user.email]);
    
        if(userLogged.rowCount === 0){
            return res.sendStatus(401);
        }
    
        const name = userLogged.rows[0].name;
      
        if (bcrypt.compareSync(user.password, userLogged.rows[0].password)) {
          const token = uuid();
   
          await connection.query(
            `INSERT INTO sessions ("token", "userId") values ($1, $2)`, [token, userLogged.rows[0].id]
          );
      
          return res.status(201).send({ token, name });
        } else {
          return res.status(401).send('Senha ou email incorretos!');
        }
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
  }