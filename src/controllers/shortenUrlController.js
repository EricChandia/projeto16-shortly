import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';
import connection from '../dbStrategy/postgres.js';
import joi from 'joi';
import { nanoid } from 'nanoid';
import { query } from 'express';


export async function shortenUrl(req,res){
    try{
        const { userId } = res.locals.session;
        const req_body = req.body;
        const shortenUrl = joi.object({
            url: joi.string().required().regex(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/)
        });

        const { error } = shortenUrl.validate(req_body);
        
        if (error) {
          console.log(error);
          return res.status(422).send(error);
        }

        const { url } = req_body;

        const shortUrl = nanoid();
        const urlExists = await connection.query(`select * from "shortenedUrls" where "url" = $1 and "userId" = $2`, [url, userId]);
        if(urlExists.rowCount > 0){
            await connection.query(`update "shortenedUrls" set "shortUrl" = $1 where "userId" = $2`, [shortUrl, userId]);
        }else{
            await connection.query(`insert into "shortenedUrls" ("userId", url, "shortUrl", "visitCount") values ($1, $2, $3, $4)`, [userId, url, shortUrl, 0]);
        }

        return res.status(201).send({shortUrl});
        

    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }
}


export async function getShortUrlById(req, res){
    try{
        const { id } = req.params;

        const reqUrl = await connection.query(`select * from "shortenedUrls" where id = $1`, [id]);
        if(reqUrl.rowCount === 0){
            return res.sendStatus(404);
        }
    
        const { id: urlId, shortUrl, url } = reqUrl.rows[0];
        console.log(urlId, shortUrl, url);
        
        return res.status(200).send({urlId, shortUrl, url});
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }

}

export async function openShortUrl(req, res){
    try{
        const { shortUrl } = req.params;

        const userShortUrl = await connection.query(`select * from "shortenedUrls" where "shortUrl" = $1`, [shortUrl]);

        if(userShortUrl.rowCount === 0){
            return res.status(404);
        }

        const urlPath = userShortUrl.rows[0].url;
        const visitCount = userShortUrl.rows[0].visitCount;
        const id = userShortUrl.rows[0].id;

        await connection.query(`update "shortenedUrls" set "visitCount" = $1 where id = $2`, [visitCount+1, id]);

        res.redirect(urlPath);

    }catch(error){
        console.log(error);
    }
}