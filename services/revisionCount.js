var main = require("./main.js");
var readXlsx = require('./utility/readcsv');
var utils = require("./utility/report");
exports.revisionCount = (req,res)=>{
    var finalResponse = [];
    var proxies = readXlsx.readMatserProxies();
    console.log('master proxies',proxies)
    var auth = req.headers.authorization;
    var proxyCount = 0;
    var options = {
        host: "api.enterprise.apigee.com",
        port: 443,
        method: "GET",
        headers: {
            "Authorization": auth
        },
    };
    proxies.forEach((proxy)=>{
        options.path = "/v1/organizations/ee-nonprod/apis/" + proxy+"/revisions"
        main.httpReq(options, (err, response) => {
            try{
            if (err) {
                res.send(err);
            } else {
                if(response){
                    proxyCount++;
                    constructResponse(proxy,response,finalResponse);
                   
                }
                
               if(proxies.length == proxyCount){
                
                //console.log('finalResponse ',finalResponse);
                finalResponse = finalResponse.filter((proxy)=>{
                    return proxy.revCount>10;
                })
                var path = utils.generateCsv(finalResponse,"master-proxy-revision-count");
                finalResponse.filePath = req.protocol + '://' + req.get('host')+"/files/"+path;
                res.send(finalResponse);
               }
            }
        }catch(e){
            //error.error(appObj.req,appObj.res);
        }
        });
    });
};

function constructResponse(name,response,finalResponse){
    var proxy ={};
    proxy.name= name;
    if(response){
        proxy.revCount = response.length;
    }else{
        proxy.revCount = 0;
    }
    finalResponse.push(proxy);
   
    return finalResponse;
}