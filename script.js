const fs = require('fs')
const watchHistory = require('./watch-history.json')
const client = require('https');


if (!fs.existsSync(__dirname+"/temp")){
    fs.mkdirSync(__dirname+"/temp");
}

let ytm = []
for (let i = 0; i < watchHistory.length; i++) {
    if (watchHistory[i].header === 'YouTube Music') {
        newdata ={
        "header": "YouTube Music",
        "title": watchHistory[i].title.split("Watched ").pop(),
        "titleUrl": `https://music.${watchHistory[i].titleUrl.split("www.").pop()}`,
        "artist": watchHistory[i].subtitles ? watchHistory[i].subtitles[0].name.replace(' - Topic', '') : "Unknown",
        "time": watchHistory[i].time
        }
        ytm.push(newdata)
    }
}
fs.writeFile(__dirname+'/temp/ytm.json', JSON.stringify(ytm), 'utf8', (err) => {
    if (err) {
        console.log(err)
    }
})


let timeData = []
for (let i = 0; i < ytm.length; i++) {
        newdata ={
            "time":ytm[i].time
        }
        timeData.push(newdata)
    
}


fs.writeFile(__dirname+'/temp/times.json', JSON.stringify(timeData), 'utf8', (err) => {
    if (err) {
        console.log(err)
    }
})

function downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
        client.get(url, (res) => {
            if (res.statusCode === 200) {
                res.pipe(fs.createWriteStream(filepath))
                    .on('error', reject)
                    .once('close', () => resolve(filepath));
            } else {
                // Consume response data to free up memory
                res.resume();
                reject(new Error(`Request Failed With a Status Code: ${res.statusCode}`));

            }
        });
    });
}


let yearlyListens = []
for (let i = 0; i < timeData.length; i++) {
    newdata = `${timeData[i].time.split('T')[0].slice(0,4)}`
    yearlyListens.push(newdata)
}
let yearlyListensTotal = {}
yearlyListens.forEach(element => {
    yearlyListensTotal[element] = (yearlyListensTotal[element] || 0) + 1;
  });

let yearlyListensKeys = Object.keys(yearlyListensTotal)
let yearlyListensValues = Object.values(yearlyListensTotal)
yearlyListensKeys.length = yearlyListensKeys.length<5 ? yearlyListensKeys.length : 5
yearlyListensValues.length = yearlyListensValues.length <5 ? yearlyListensValues.length : 5
yearlyListensKeys = yearlyListensKeys.toString()
yearlyListensValues = yearlyListensValues.toString()
downloadImage(`https://quickchart.io/chart/render/zm-a17dca38-62d9-49ff-8e63-483f9ff33202?labels=${yearlyListensKeys}&data1=${yearlyListensValues}`,__dirname+'/temp/yearly.png')


let monthlyListens = []
for (let i = 0; i < timeData.length; i++) {
    year = `${timeData[i].time.split('T')[0].slice(2,4)}`
    month = `${timeData[i].time.split('T')[0].slice(5,7)}`
    months = {"01":"Jan","02":"Feb","03":"Mar","04":"Apr","05":"May","06":"Jun","07":"Jul","08":"Aug","09":"Sep","10":"Oct","11":"Nov","12":"Dec"}
    month = months[month]
    monthlyListens.push(month + " '"+year)
}
let monthlyListensTotal = {}
monthlyListens.forEach(element => {
    monthlyListensTotal[element] = (monthlyListensTotal[element] || 0) + 1;
  });

  let monthlyListensKeys = Object.keys(monthlyListensTotal).reverse()
  let monthlyListensValues = Object.values(monthlyListensTotal).reverse()
  monthlyListensKeys.length = monthlyListensKeys.length<12 ? monthlyListensKeys.length : 12
  monthlyListensValues.length = monthlyListensValues.length <12 ? monthlyListensValues.length : 12
  monthlyListensKeys = monthlyListensKeys.toString()
  monthlyListensValues = monthlyListensValues.toString()
  downloadImage(`https://quickchart.io/chart/render/zm-a17dca38-62d9-49ff-8e63-483f9ff33202?labels=${monthlyListensKeys}&data1=${monthlyListensValues}`,__dirname+'/temp/monthly.png')

let mostPlayed = []
for(let i=0; i<ytm.length;i++){
    newdata = ytm[i].title
    mostPlayed.push(newdata)
}
let topMostPlayed = {}
mostPlayed.forEach(element => {
    topMostPlayed[element] = (topMostPlayed[element] || 0) + 1;
  });

  const pickHighest = (obj, num = 1) => {
    const requiredObj = {};
    if(num > Object.keys(obj).length){
       return false;
    };
    Object.keys(obj).sort((a, b) => obj[b] - obj[a]).forEach((key, ind) =>
    {
       if(ind < num){
          requiredObj[key] = obj[key];
       }
    });
    return requiredObj;
 };
const top5 = pickHighest(topMostPlayed,5)

for(let i = 0; i<5;i++){

    downloadImage(`
    https://img.youtube.com/vi/${ytm.find(item => item.title === Object.keys(top5)[i]).titleUrl.split("https://music.youtube.com/watch?v=").pop().split("&")[0]}/maxresdefault.jpg`,
        __dirname+`/temp/image${[i]}.png`)
}



fullStatsData = [{"year":yearlyListensTotal},{"month":monthlyListensTotal},{"top5":top5}]

fs.writeFile(__dirname+'/temp/fullStats.json', JSON.stringify(fullStatsData), 'utf8', (err) => {
    if (err) {
        console.log(err)
    }
})






console.log(yearlyListensTotal)
console.log(monthlyListensTotal)
console.log(top5)


