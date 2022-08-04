import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from '../dbStrategy/postgres.js';
import joi from 'joi';


export async function shortenUrl(req,res){
    try{
        const { userId } = res.locals.session;
        const url = req.body;
        const shortenUrl = joi.object({
            url: joi.string().required().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
        });

        const { error } = shortenUrl.validate(url);
          
        if (error) {
          console.log(error);
          return res.status(422).send(error);
        }

        return res.sendStatus(200);

    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }
}