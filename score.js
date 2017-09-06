'use strict';
const mainUrl = "https://cricket.yahoo.com/cricket-live-score-sri-lanka-vs-india_196676";
const notifier = require('node-notifier');
const request = require('request');		
const cron = require('node-cron');

cron.schedule('*/17 * * * * *', () => getScore() );
cron.schedule('*/7 * * * * *', () => getCommentary() );

function getScore()
{
    require('nightmare')({ show: false })
        .goto(mainUrl)
        .wait(".yog-bd")
        .evaluate( () => document.querySelector('title').innerText )
        .end()
        .then( result => notifier.notify({ 'title': result.split(',')[0], 'message': result.split(',').slice(1).join(","),wait:true }))
        .catch( (error) => { console.error('Search failed:', error); return error })
}


function getCommentary ()
{
   
    request.get("https://cricket.yahoo.com/ws/score/scorecard.php?content=f5&match_id=196676&media=1&region=IN",function (error, response, body) 
    {
        if(error)
        {
            console.log(error)
        }
        else
        {
            try 
            {
                let jsonResponse = JSON.parse(body.toString());

                let score = jsonResponse.bbb.c.ro;
                let over = Object.keys(score).sort((a,b)=>a-b);
                let currentOver = over[over.length-1]

                let comments = score[over[over.length-1]];
                let overDets = [];
                let commentary = [];
                
                comments.forEach((cot,i)=> { overDets.push("Over :"+currentOver+"."+i+" : "+cot.shc); commentary.push(cot.c) });

                getCommentary.commentary = Object.assign ({},{ 'title': overDets.shift(), 'message': commentary.shift().replace(/[^\w\s]/gi, ''), wait : true })
                console.log(getCommentary.commentary)
                notifier.notify(getCommentary.commentary );
            }
            catch(err)
            {
                console.log("Something went wrong ",err);
            }
            finally
            {

                notifier.notify(getCommentary.commentary);
            }
          

        }

    });

   
}
 getCommentary.commentary = {};
