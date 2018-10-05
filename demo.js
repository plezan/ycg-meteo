fs = require('fs')
Entities = require('html-entities').AllHtmlEntities;

getFileContent('demo/index.js').then(
    (data)=>{
        fs.unlink('demo/index.js',console.error);
        return makeHTML(data)
    }
).then(
    (data)=>setFileContent('demo/index.html',data),
    console.error
)

// FUNCTIONS

function makeHTML(data) {return new Promise((resolve,reject)=>{
    let html = '<div id="wind_widget"><script>'+data+'</script></div>'+
    '<p>copy this line into your code :</p>'+
    '<textarea>'+new Entities().encodeNonUTF(data)+'</textarea>'
    resolve(html);
})}

function getFileContent(file) {return new Promise((resolve,reject)=>{
    fs.readFile(file, 'utf8', function (err,data) {
        if(err) reject(err);
        resolve(data);
    });
})}

function setFileContent(file,data) {return new Promise((resolve,reject)=>{
    fs.writeFile(file, data, function (err) {
        if(err) reject(err);
        resolve();
    });
})}