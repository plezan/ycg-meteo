function init(e) {
    parent = document.getElementById(e);
    parent.innerHTML = null;

    var content = document.createDocumentFragment();

    ['aws', 'cws', 'wd', 'dash', 'nds'].forEach(function (id) {
        var temp_node = document.createElement('span');
        temp_node.innerHTML = '00';
        temp_node.className = 'ctxt';
        temp_node.id = id;
        content.appendChild(temp_node);
    });
    content.getElementById('dash').textContent = '-';
    content.getElementById('nds').textContent = 'nds';
    
    var windSvg = document.createElement('div');
    windSvg.id = 'windSvg';
    
    var svg = document.createElement('svg');
    svg.width = '105';
    svg.height = '208';
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.style = 'width:105px;';
    svg.style += 'height:280px;';
    svg.style += 'margin-left:82.5px;';
    svg.style += 'margin-right:82.5px;';
    
    windSvg.appendChild(svg);
    content.appendChild(windSvg);

    // style in head
    var style = document.createElement('style');
    style.innerHTML = "@font-face{font-family:Orbitron;font-style:normal;font-weight:400;src:local('Orbitron Regular'),local('Orbitron-Regular'),url(https://fonts.gstatic.com/s/orbitron/v9/yMJRMIlzdpvBhQQL_Qq7dy1biN15.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+2074,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}#windSvg,#wind_widget{height:320px;width:320px}#windSvg,.ctxt{text-align:center}#wind_widget{position:relative}.ctxt{font-family:orbitron;font-size:50px;position:absolute}#dash{left:140px;width:40px;top:5px}#nds{left:230px;top:50px;font-size:20px}#aws{right:185px;top:10px}#cws{top:10px;left:185px}#wd{bottom:0;left:80px;width:160px}#windSvg{box-sizing:border-box;padding:15px;transform:scale(.75)}";
    document.getElementsByTagName('head')[0].appendChild(style);

    // add widget content
    parent.appendChild(content);
}

function updateData() {
    console.log('updateData');
    req.onreadystatechange = function (e) {

        if (this.readyState !== XMLHttpRequest.DONE) return;
        
        if (200 === this.status) { //SUCESS
            window.resu = this.responseXML;
            var cws = resu.querySelector('wind0wind act kn').textContent;
            var aws = resu.querySelector('wind0avgwind act kn').textContent;
            var wd = resu.querySelector('wind0dir act deg').textContent;

            //wd = Math.random()*360;//for debug purpose only

            window.wd_old = (window.old && window.old.wd)? (window.old.wd)*1 : wd*1;
             
            document.getElementById('aws').textContent = aws;
            document.getElementById('cws').textContent = cws;
            document.getElementById('wd').textContent = wd + '\xB0';
            
            var start = null;
            const anim_length = 3000;
            const swr = ((wd-wd_old+180)%360-180); // simplified wind rotation

            var step = (timestamp)=>{
                if(start == null) start = timestamp;// init
                const t = (timestamp-start)/anim_length;
                const eased_t = (t*t)*(3-2*t);//fiest number = parameter
                let wd_tmp = wd_old*1+swr*(eased_t);
                genWindSvg(aws,wd_tmp);
                if(timestamp < start+anim_length ){
                    // loop
                    requestAnimationFrame(step);
                }else{ // exit loop
                    if(!window.old) window.old = {}
                    window.old.wd = wd;
                }
            }
            requestAnimationFrame(step);
            //genWindSvg(aws,wd);
        
        } else { //ERROR
            console.error(
                'Status de la réponse: %d (%s)',
                this.status,
                this.statusText
            );
        } // FINALY
        setTimeout(updateData, 5000);
        
    }
    req.open('GET', 'https://www.lezan.pro/meteo.xml', true);
    req.send(null);
}



function genWindSvg(ws, dir) {

    var tws = ws;
    var rws = [0, 0, 0];

    rws[0] = Math.floor(tws / 50);
    tws -= 50 * rws[0];

    rws[1] = Math.floor(tws / 10);
    tws -= 10 * rws[1];

    rws[2] = Math.floor(tws / 5);
    tws -= 5 * rws[2];

    // add info
    var info = '';
    var cursor = 250;

    function hw(pos){return "<path stroke='#000' transform='rotate(-90 62.5,"+(pos-22.5)+")' id='svg_"+pos+"' d='m 40,"+(pos+15)+" l22.5,-75 l22.5,75 l-45,0 z' stroke-width='10' fill='#000'/>"};
    function mw(pos){return "<line stroke='#000' stroke-width='10' x1='100' y1='"+(pos-5)+"' x2='10' y2='"+(pos+22.5)+"' id='svg_"+pos+"'/>"};
    function lw(pos){return "<line stroke='#000' stroke-width='10' x1='100' y1='"+(pos-5)+"' x2='50' y2='"+(pos+10)+"' id='svg_"+pos+"'/>"};


    for (var i = rws[0];i>0;i--) {
        info += hw(cursor);
        cursor -= 70;
    }
    for (var i = rws[1];i>0;i--) {
        info += mw(cursor);
        cursor -= 30;
    }
    for (var i = rws[2];i>0;i--) {
        info += lw(cursor);
        cursor -= 30;
    }


    // show result
    document.getElementById('windSvg').innerHTML = 
        "<svg width='105' height='280' transform='rotate("+(dir-180)+")' style='width: 105px;height: 280px;margin-left: 82.5px;margin-right: 82.5px;' xmlns='http://www.w3.org/2000/svg'>"+
        "<g stroke='null'>"+
        "<title stroke='null'>Layer 1</title>"+
        "<line stroke='#000' stroke-width='10' x1='100' y1='0' x2='100' y2='250' id='svg_1'/>"+info+"</g>"+"</svg>";
}
init('wind_widget');
var req = new XMLHttpRequest();
updateData();