import connection from '../dbStrategy/postgres.js';
import joi from 'joi';
import { nanoid } from 'nanoid';
import dayjs from 'dayjs';


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

        const createdAt = dayjs().format("YYYY-MM-DD");

        const shortUrl = nanoid();
        const urlExists = await connection.query(`select * from "shortenedUrls" where "url" = $1 and "userId" = $2`, [url, userId]);
        if(urlExists.rowCount > 0){
            await connection.query(`update "shortenedUrls" set "shortUrl" = $1 where "userId" = $2`, [shortUrl, userId]);
        }else{
            await connection.query(`insert into "shortenedUrls" ("userId", url, "shortUrl", "visitCount", "createdAt") values ($1, $2, $3, $4, $5)`, [userId, url, shortUrl, 0, createdAt]);
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

        res.redirect(200, urlPath);

    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function deleteUrlById(req, res){
    try{
        const { userId } = res.locals.session;
        const { id: urlId } = req.params;
    
        const userUrl = await connection.query(`select * from "shortenedUrls" where id = $1`, [urlId]);

        if(userUrl.rowCount === 0){
            return res.sendStatus(404);
        }


        if(userUrl.rows[0].userId !== userId){
            return res.sendStatus(401);
        }
    
        await connection.query(`delete from "shortenedUrls" where id = $1`, [urlId]);
        return res.sendStatus(204);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}

export async function getUserUrls(req, res){
    try{
        const { userId } = res.locals.session;
    
        const user = await connection.query(`select users.id, users.name from users where id = $1`, [userId]);
        if(user.rowCount === 0){
            res.sendStatus(404);
        }
        const userName = user.rows[0].name;
    
        let userVisitCountSum = await connection.query(`select SUM("visitCount") as "visitCount" from "shortenedUrls" where "userId" = $1`, [userId]);
        userVisitCountSum = userVisitCountSum.rows[0].visitCount === null ? 0 : userVisitCountSum.rows[0].visitCount;
        

        let shortenedUrls = await connection.query(`select * from "shortenedUrls" where "userId" = $1`, [userId]);

        if(shortenedUrls.rowCount === 0){
            shortenedUrls = {};
        }else{
            shortenedUrls = shortenedUrls.rows;
            let userUrlsArr = [];
            
            for(let i=0;i<shortenedUrls.length;i++){
                const userUrls = { id: shortenedUrls[i].id, shortUrl: shortenedUrls[i].shortUrl, url: shortenedUrls[i].url, visitCount: shortenedUrls[i].visitCount };
                userUrlsArr.push(userUrls);
            }
            shortenedUrls = userUrlsArr;
        }

        
        let userUrls = 
        {
            id: userId,
            name: userName,
            visitCount: userVisitCountSum,
            shortenedUrls
        };

        res.status(200).send(userUrls);
    }catch(error){
        console.log(error);
        res.sendStatus(500);
    }
}



