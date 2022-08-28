const express = require('express')
const DataStore = require('nedb')
const app = express()
const port = 3000;




var db = new DataStore({filename: "db/data.db", autoload: true});
var settings = new DataStore({filename: "db/settings.db", autoload: true});


var currentCampaign = undefined;
function getCurrentCampaign(callback) {
    if(currentCampaign == undefined) {
        settings.findOne({name: "current"}, function(err, doc) {
            if(err) {
                console.log(err);
            } else {
                currentCampaign = doc.currentCampaign;
                callback(currentCampaign);
            }
        });
    }
    
}


app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile("views/index.html", { root: __dirname })
})

app.get("/dbTest", (req,res) => {
    db.count({}, function (err, count) {
        campaign = {
            num: count,
            name: "Lightning Test Campaign 1",
            description: "Recieve your Groups Here!",
            groups:[{
                name: "A",
                color: "red"
            },
            {
                name: "B",
                color: "blue"
            }],
            assigned: 0
        }
        db.insert(campaign, (err, newDoc) => {
            settings.insert({name: "current", currentCampaign: newDoc._id}, (err, newDoc) => {
                res.send("Success");
            });
        });
    });
    
})

app.get("/assign", (req,res) => {
    getCurrentCampaign((campaign) => {


        db.findOne({_id: campaign}, (err, doc) => {
            var groups = doc.groups;
            var assigned = doc.assigned;
            var group = groups[assigned%groups.length];
            db.update({_id: campaign}, {$inc: {assigned: 1}}, {}, (err, numReplaced) => {
                res.send(group);
            });
            
        });
        

        
        
    });
});

app.get("/currentCampaign", (req,res) => {
    getCurrentCampaign((campaign) => {

        db.findOne({_id: campaign}, (err, doc) => {
            res.send(doc);
        });

        
    });
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})