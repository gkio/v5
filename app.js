var app = require('express')();
var express = require('express');
var http = require('http').Server(app);
var io = require('socket.io')(http);
var request = require('request');
var cheerio = require('cheerio');
var matches = [];

app.use(express.static('public'))
app.use('/bower_components',  express.static(__dirname + '/bower_components'));
app.get('/',function(req, res){
	res.sendFile(__dirname + '/public/index.html')
})

//parse
function startLoop(){
    setInterval(function(){
        matches.forEach(function(item,i){
            parseMatch(item.link, function(json) {
              console.log(json)
                io.emit('match', {
                    id: item.id,
                    data: json
                })
            });
        });

    }, 5000);
}

function parseMatch(link, cb){
    console.log("parseMatch");
    request({
        url: link,
        jar:  true
    }, function(error, response, html){
        if(error) console.log(error);
        if(!error){
            var $ = cheerio.load(html);
            var website,asso,xi,diplo,aAvg,xAvg,dAvg;
            var json = {};
                var count =  $('ul[id*="rtf_m999d888_1_300"]').length;
                json['count'] = count;
                json['list'] = [];
                for (var i = 1; i < count+1; i++) {
                    var row = {};
                    row.website = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTBookies .OTBH .OTBookieLink .OTBookie').text();
                    row.asso = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol1 a').text().replace(/[^0-9.-]/g, '');
                    row.xi = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol2 a').text().replace(/[^0-9.-]/g, '');
                    row.diplo = $('#paramGroup-rtf_m999d888 ul:nth-child('+i+') .OTCol3 a').text().replace(/[^0-9.-]/g, '');
                    json['list'].push(row);
                }
                // json['aAvg']  = $('#avg_rtf_m999d888 .OTCol1 a').text().replace(/[^0-9.-]/g, '');
                // json['xAvg']  = $('#avg_rtf_m999d888 .OTCol2 a').text().replace(/[^0-9.-]/g, '');
                // json['dAvg']  = $('#avg_rtf_m999d888 .OTCol3 a').text().replace(/[^0-9.-]/g, '');
                cb(json);// что такое cb
        }
    });
}

io.on('connection', function(socket){
  console.log('connected')
    startLoop()
  socket.on('disconnect', function(){
    matches = []
  });
  socket.on('match',function(data){
  	data = {
  		id: data.id,
  		link: data.link,
  	}
  	matches.push(data) 
  	console.log(matches)
  })
});


http.listen(3000,function(){
	console.log('listen')
})