import connection from '../dbStrategy/postgres.js';

export async function getRanking(req, res){
    try{
        let ranking = await connection.query(`select users.id, "name" , COUNT("shortUrl") as "linksCount", COALESCE(SUM("visitCount"), 0) as "visitCount" from "users" left join "shortenedUrls" on users.id = "shortenedUrls"."userId" group by users.id order by "visitCount" desc limit 10;`);

        ranking = ranking.rows;
        let rankingArr = [];
        
        for(let i=0;i<ranking.length;i++){
            rankingArr.push({ id: ranking[i].id, name: ranking[i].name, url: ranking[i].linksCount, visitCount: ranking[i].visitCount });
        }
        ranking = rankingArr;

        res.status(200).send(ranking);
    }catch(error){
        console.log(error);
        res.status(500).send(error);
    }

}