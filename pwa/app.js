const API_BASE = ''; // Po utworzeniu projektu wpisz: https://PROJECT_REF.supabase.co/functions/v1/literkowo-api
const DATA = {"alphabet":["A","Ą","B","C","Ć","D","E","Ę","F","G","H","I","J","K","L","Ł","M","N","Ń","O","Ó","P","R","S","Ś","T","U","W","Y","Z","Ź","Ż"],"words":{"A":["auto","aparat","ananas"],"Ą":["wąż","kąt","pąk"],"B":["balon","but","banan"],"C":["cebula","cukier","cytryna"],"Ć":["ćma","ćwiczyć","ćwierć"],"D":["dom","dach","droga"],"E":["ekran","ekierka","elf"],"Ę":["gęś","język","mięta"],"F":["foka","farba","flet"],"G":["gitara","góra","garnek"],"H":["hak","hotel","hamak"],"I":["igła","iskra","indyk"],"J":["jabłko","jeleń","jajko"],"K":["kot","kura","klocki"],"L":["lalka","las","lampa"],"Ł":["łódka","łąka","łapa"],"M":["motyl","mama","miska"],"N":["nos","noga","namiot"],"Ń":["koń","słoń","dłoń"],"O":["oko","okno","owca"],"Ó":["ósmy","ogórek","ósemka"],"P":["pies","piłka","pociąg"],"R":["rak","rower","ryba"],"S":["sowa","samolot","ser"],"Ś":["ślimak","świat","świeca"],"T":["tata","tort","tulipan"],"U":["ul","ucho","ubranie"],"W":["woda","wóz","wiewiórka"],"Y":["yoyo","dynia","ryba"],"Z":["zamek","zebra","zegar"],"Ź":["źrebak","źródło","gałąź"],"Ż":["żaba","żółw","żyrafa"]},"examples":{"A":"auto","Ą":"wąż","B":"balon","C":"cebula","Ć":"ćma","D":"dom","E":"ekran","Ę":"język","F":"foka","G":"gitara","H":"hak","I":"igła","J":"jabłko","K":"kot","L":"lalka","Ł":"łódka","M":"motyl","N":"nos","Ń":"koń","O":"oko","Ó":"ósmy","P":"pies","R":"rak","S":"sowa","Ś":"ślimak","T":"tort","U":"ul","W":"woda","Y":"yoyo","Z":"zamek","Ź":"źrebak","Ż":"żaba"}};

// Wzory pochodzą z gotowego, walidowanego zbioru ścieżek pisania.
let LETTER_PATHS = null;
let LETTER_POINTS = null;
function templateFor(letter){
 const model=LETTER_POINTS?.letters?.[letter];
 return model ? model.strokes.map(s=>s.dots) : [];
}
function isPressPoint(letter,index){
 return !!LETTER_POINTS?.letters?.[letter]?.strokes?.[index]?.press;
}
function isClosedStroke(letter,index){
 return !!LETTER_POINTS?.letters?.[letter]?.strokes?.[index]?.closed;
}
function letterTransform(letter,width,height){
 const model=LETTER_PATHS?.letters?.[letter];
 if(!model || !width || !height) return null;
 const frameX=-0.05;
 const frameY=model.bounds.minY-0.045;
 const frameW=model.aspect+0.10;
 const frameH=model.bounds.maxY-model.bounds.minY+0.09;
 const scale=Math.min(width*0.88/frameW,height*0.84/frameH);
 const offsetX=(width-frameW*scale)/2;
 const offsetY=(height-frameH*scale)/2;
 return {
  scale,offsetX,offsetY,frameX,frameY,
  point(p){
   return {
    x:(offsetX+(p[0]-frameX)*scale)/width,
    y:(offsetY+(p[1]-frameY)*scale)/height
   };
  }
 };
}
function strokePath(letter,index,stroke){
 const points=stroke || templateFor(letter)[index] || [];
 const transform=letterTransform(letter,state.size.w,state.size.h);
 if(!transform)return [];
 return points.map(p=>transform.point(p));
}
const $ = (s) => document.querySelector(s);
const state = { letter: null, strokes: [], current: [], dotProgress:0, size: {w:1,h:1}, completed: load('completed',[]), words: load('words',[]), stars: Number(localStorage.getItem('literkowo.stars')||0), saved:false };
function load(k,f){try{return JSON.parse(localStorage.getItem('literkowo.'+k))??f}catch{return f}}
function persist(){localStorage.setItem('literkowo.completed',JSON.stringify(state.completed));localStorage.setItem('literkowo.words',JSON.stringify(state.words));localStorage.setItem('literkowo.stars',String(state.stars));renderStats()}
function renderStats(){
 const completedCount=DATA.alphabet.filter(ch=>state.completed.includes(ch)).length;
 const stars=Number.isFinite(state.stars)?Math.max(0,state.stars):0;
 $('#progress').textContent=completedCount+' / '+DATA.alphabet.length+' liter';
 $('#starCount').textContent=stars+' ★';
 const bar=$('#progressBar');
 const track=document.querySelector('.progress-track');
 if(bar)bar.style.width=(completedCount/DATA.alphabet.length*100)+'%';
 if(track)track.setAttribute('aria-valuenow',String(completedCount));
 }
const voiceAudio=new Audio();
voiceAudio.preload='auto';
voiceAudio.setAttribute('playsinline','');
function audioKey(value){
 const text=String(value||'').normalize('NFC').trim().replace(/\s+/g,' ');
 let hash=0xcbf29ce484222325n;
 for(const byte of new TextEncoder().encode(text)){hash^=BigInt(byte);hash=BigInt.asUintN(64,hash*0x100000001b3n)}
 return hash.toString(16).padStart(16,'0');
}
function speak(t){
 const text=String(t||'').normalize('NFC').trim().replace(/\s+/g,' ');
 if(!text)return;
 const url='./audio/'+audioKey(text)+'.mp3';
 try{
  voiceAudio.pause();
  voiceAudio.currentTime=0;
  voiceAudio.src=url;
  $('#feedback').textContent='Odtwarzam polskie nagranie…';
  const playback=voiceAudio.play();
  if(playback&&typeof playback.catch==='function')playback.catch(()=>{$('#feedback').textContent='Nie udało się odtworzyć nagrania. Sprawdź połączenie z internetem i głośność telefonu.'});
 }catch(e){$('#feedback').textContent='Nie udało się uruchomić nagrania audio.'}
}
voiceAudio.addEventListener('ended',()=>{$('#feedback').textContent='Odtwarzanie zakończone.'});
voiceAudio.addEventListener('error',()=>{$('#feedback').textContent='Brak pliku dźwiękowego dla tego tekstu. Odśwież aplikację i spróbuj ponownie.'});
function renderHome(){
 $('#home').hidden=false;$('#practice').hidden=true;$('#letterGrid').innerHTML='';
 DATA.alphabet.forEach(ch=>{const b=document.createElement('button');b.className='letter-tile'+(state.completed.includes(ch)?' done':'');b.innerHTML='<span>'+ch+'</span><small>'+(state.completed.includes(ch)?'Ukończona':'Ćwicz')+'</small>';b.addEventListener('click',()=>openLetter(ch));$('#letterGrid').append(b)});
 renderStats();
}
function openLetter(ch){
 if(!LETTER_PATHS?.letters?.[ch]||!LETTER_POINTS?.letters?.[ch]){const intro=$('#home .intro p');if(intro)intro.textContent='Wzory liter nie zostały jeszcze załadowane. Odśwież stronę.';return;}
 state.letter=ch;state.strokes=[];state.current=[];state.dotProgress=0;state.saved=false;
 $('#home').hidden=true;$('#practice').hidden=false;
 $('#letterTitle').textContent=ch+'  '+ch.toLowerCase();
 $('#example').textContent='Przykładowe słowo: '+(DATA.examples[ch]||ch.toLowerCase());
 $('#guideList').innerHTML='';
 const template=templateFor(ch);
 const guideOverrides={
  A:[
   'Ruch 1: zacznij na szczycie i poprowadź ukośną kreskę w dół po lewej stronie.',
   'Ruch 2: zacznij ponownie na szczycie i poprowadź drugą ukośną kreskę w dół po prawej stronie.',
   'Ruch 3: narysuj poprzeczną kreskę od lewej do prawej.'
  ],
  Ą:[
   'Ruch 1: od szczytu poprowadź lewą ukośną kreskę w dół.',
   'Ruch 2: od szczytu poprowadź prawą ukośną kreskę w dół.',
   'Ruch 3: narysuj poprzeczną kreskę od lewej do prawej.',
   'Ruch 4: dodaj ogonek przy prawej dolnej części litery.'
  ],
  B:[
   'Ruch 1: narysuj pionową kreskę od góry do dołu.',
   'Ruch 2: od góry poprowadź łuk górnej części w prawo i wróć do środka.',
   'Ruch 3: od środka poprowadź dolny łuk w prawo i zakończ na dole przy pionowej kresce.'
  ],
  M:[
   'Ruch 1: narysuj lewą pionową kreskę z góry na dół.',
   'Ruch 2: od górnej części lewej strony poprowadź ukośną kreskę do środkowego dołka.',
   'Ruch 3: od środkowego dołka poprowadź ukośną kreskę do góry po prawej.',
   'Ruch 4: narysuj prawą pionową kreskę z góry na dół.'
  ],
  N:[
   'Ruch 1: narysuj lewą pionową kreskę z góry na dół.',
   'Ruch 2: połącz górę lewej strony z dołem prawej strony jedną ukośną kreską.',
   'Ruch 3: narysuj prawą pionową kreskę z góry na dół.'
  ],
  Ń:[
   'Ruch 1: narysuj lewą pionową kreskę z góry na dół.',
   'Ruch 2: poprowadź ukośną kreskę od góry po lewej do dołu po prawej.',
   'Ruch 3: narysuj prawą pionową kreskę z góry na dół.',
   'Ruch 4: dodaj kreskę nad literą.'
  ],
  Ł:[
   'Ruch 1: narysuj pionową kreskę z góry na dół.',
   'Ruch 2: dodaj dolną poziomą kreskę.',
   'Ruch 3: narysuj ukośną kreskę przechodzącą przez literę.'
  ],
  Ę:[
   'Ruch 1: narysuj pionową kreskę z góry na dół.',
   'Ruch 2: dodaj górną poziomą kreskę.',
   'Ruch 3: dodaj środkową poziomą kreskę.',
   'Ruch 4: dodaj dolną poziomą kreskę.',
   'Ruch 5: dorysuj ogonek przy prawej dolnej części litery.'
  ],
  Z:[
   'Ruch 1: jednym ciągłym ruchem narysuj górną kreskę, ukośną część i dolną kreskę.'
  ],
  Ź:[
   'Ruch 1: jednym ruchem narysuj kształt litery Z.',
   'Ruch 2: dodaj kreskę nad literą.'
  ],
  Ż:[
   'Ruch 1: jednym ruchem narysuj kształt litery Z.',
   'Ruch 2: dodaj kropkę nad literą.'
  ]
 };
 const steps=guideOverrides[ch]||template.map((stroke,i)=>isPressPoint(ch,i)?'Dotknij pomarańczowego znacznika.':'Zacznij przy pomarańczowym znaczniku i prowadź palec zgodnie ze strzałkami.'+(isClosedStroke(ch,i)?' Na końcu wróć do początku, aby zamknąć kształt.':''));
 steps.forEach((g,i)=>{const li=document.createElement('li');li.textContent=String(g).replace(/^\s*\d+[.)]\s*/, '');$('#guideList').append(li)});
 const vowel='AĄEĘIOÓUY'.includes(ch);
 const syllables=vowel?[ch.toLowerCase(),'ma','me','mi','mo','mu']:['a','e','i','o','u','y'].map(x=>ch.toLowerCase()+x);
 const wordList=DATA.words[ch]||[DATA.examples[ch]];
 fillChips('#syllables',syllables);fillChips('#words',wordList,true);
 $('#feedback').textContent='Zacznij przy pomarańczowym znaczniku. Podążaj za strzałkami. Po ukończeniu fragmentu podświetli się następny.';
 $('#save').disabled=true;draw();
 speak('Litera '+ch);
}
function fillChips(selector,items,isWord=false){const el=$(selector);el.innerHTML='';if(isWord){const select=$('#selectedWord');select.innerHTML='<option value="">Wybierz wyraz…</option>';items.forEach(item=>{const option=document.createElement('option');option.value=item;option.textContent=item;select.append(option)})}items.forEach(item=>{const b=document.createElement('button');b.className='chip';b.textContent=item;b.addEventListener('click',()=>{speak(item);if(isWord){$('#selectedWord').value=item;$('#markWord').hidden=false}});el.append(b)})}

function drawDirectionArrow(ctx,points,active,isClosed){
 if(!active||points.length<2)return;
 const path=points.slice();
 if(isClosed)path.push(points[0]);
 const lengths=[0];
 for(let i=1;i<path.length;i++)lengths.push(lengths[i-1]+dist(path[i-1],path[i]));
 const total=lengths.at(-1);
 if(total<24)return;
 // Kilka dużych grotów pokazuje kierunek bez konieczności odczytywania numerów.
 for(const fraction of [0.34,0.68]){
  const target=total*fraction;
  let segment=1;
  while(segment<lengths.length-1&&lengths[segment]<target)segment++;
  const span=Math.max(.001,lengths[segment]-lengths[segment-1]);
  const t=Math.max(0,Math.min(1,(target-lengths[segment-1])/span));
  const a=path[segment-1],b=path[segment];
  const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
  const angle=Math.atan2(b.y-a.y,b.x-a.x);
  ctx.save();
  ctx.translate(x,y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(8,0);
  ctx.lineTo(-5,-6);
  ctx.lineTo(-2,0);
  ctx.lineTo(-5,6);
  ctx.closePath();
  ctx.fillStyle='#e87524';
  ctx.fill();
  ctx.restore();
 }
}
function drawStartMarker(ctx,points,active,completed){
 if(!active||!points.length)return;
 const p=points[0],next=points[1]||points[0];
 const angle=Math.atan2(next.y-p.y,next.x-p.x);
 ctx.save();
 ctx.beginPath();
 ctx.arc(p.x,p.y,14,0,Math.PI*2);
 ctx.fillStyle='#fff';
 ctx.fill();
 ctx.lineWidth=3;
 ctx.strokeStyle='#e87524';
 ctx.stroke();
 ctx.translate(p.x,p.y);
 ctx.rotate(angle);
 ctx.beginPath();
 ctx.moveTo(6,0);
 ctx.lineTo(-4,-5);
 ctx.lineTo(-4,5);
 ctx.closePath();
 ctx.fillStyle='#e87524';
 ctx.fill();
 ctx.restore();
}

function draw(){
 const canvas=$('#drawing');
 const rect=canvas.getBoundingClientRect();
 const dpr=Math.max(1,window.devicePixelRatio||1);
 canvas.width=Math.round(rect.width*dpr);
 canvas.height=Math.round(rect.height*dpr);
 const ctx=canvas.getContext('2d');
 ctx.setTransform(dpr,0,0,dpr,0,0);
 state.size={w:rect.width,h:rect.height};
 ctx.clearRect(0,0,rect.width,rect.height);
 ctx.fillStyle='#fff';
 ctx.fillRect(0,0,rect.width,rect.height);
 const model=LETTER_PATHS?.letters?.[state.letter];
 const transform=letterTransform(state.letter,rect.width,rect.height);
 if(!model||!transform||!LETTER_POINTS?.letters?.[state.letter])return;

 // Delikatny obrys pozwala rozpoznać literę. Kierunek pokazują duże strzałki.
 if(model.outline && typeof Path2D!=='undefined'){
  try{
   ctx.save();
   ctx.translate(transform.offsetX-transform.frameX*transform.scale,transform.offsetY-transform.frameY*transform.scale);
   ctx.scale(transform.scale,transform.scale);
   ctx.fillStyle='rgba(77,83,170,.075)';
   ctx.fill(new Path2D(model.outline),'evenodd');
   ctx.restore();
  }catch(e){ctx.restore();}
 }

 const template=templateFor(state.letter);
 const rendered=template.map((stroke,i)=>strokePath(state.letter,i,stroke).map(p=>({x:p.x*rect.width,y:p.y*rect.height})));
 rendered.forEach((points,i)=>{
  if(points.length<1)return;
  const completed=i<state.strokes.length;
  const active=i===state.strokes.length;

  // Aktywny fragment jest wyraźny, pozostałe fragmenty są tylko podpowiedzią kształtu.
  if(points.length>1){
   ctx.beginPath();
   points.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
   if(isClosedStroke(state.letter,i))ctx.lineTo(points[0].x,points[0].y);
   ctx.setLineDash([2,6]);
   ctx.strokeStyle=completed?'rgba(42,150,105,.34)':active?'rgba(89,84,166,.34)':'rgba(89,84,166,.18)';
   ctx.lineWidth=2;
   ctx.lineCap='round';
   ctx.lineJoin='round';
   ctx.stroke();
   ctx.setLineDash([]);
  }
  drawDirectionArrow(ctx,points,active,isClosedStroke(state.letter,i));

  // Początek pokazujemy tylko dla aktualnie ćwiczonego fragmentu.
  drawStartMarker(ctx,points,active,completed);
 });

 // Ślad dziecka jest rysowany nad punktami.
 [...state.strokes,state.current].forEach(points=>{
  if(!points.length)return;
  ctx.beginPath();
  points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.strokeStyle='#e87524';
  ctx.lineWidth=7;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.stroke();
 });
}
function point(e){const r=$('#drawing').getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top}}
const canvas=$('#drawing');
let activePointer=null;
canvas.addEventListener('pointerdown',e=>{if(!state.letter||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();activePointer=e.pointerId;try{canvas.setPointerCapture(e.pointerId)}catch{}state.current=[point(e)];state.dotProgress=0;state.saved=false;$('#save').disabled=true;refreshDotProgress();draw()},{passive:false});
canvas.addEventListener('pointermove',e=>{if(activePointer!==e.pointerId||!state.current.length)return;e.preventDefault();state.current.push(point(e));refreshDotProgress();draw()},{passive:false});
function finishStroke(e){if(e&&activePointer!==e.pointerId)return;activePointer=null;if(state.current.length){state.strokes.push(state.current);state.current=[];state.dotProgress=0;draw();evaluate()}}
function cancelStroke(e){if(e&&activePointer!==e.pointerId)return;activePointer=null;state.current=[];state.dotProgress=0;draw();$('#feedback').textContent='Ruch przerwany. Spróbuj ponownie.'}
canvas.addEventListener('pointerup',finishStroke);canvas.addEventListener('pointercancel',cancelStroke);
function dist(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function resample(points,count=32){if(points.length<2)return points;const lengths=[0];for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+dist(points[i-1],points[i]));const total=lengths.at(-1);if(!total)return Array(count).fill(points[0]);const out=[];let seg=1;for(let i=0;i<count;i++){const target=total*i/(count-1);while(seg<lengths.length-1&&lengths[seg]<target)seg++;const span=Math.max(lengths[seg]-lengths[seg-1],.000001),t=Math.min(1,Math.max(0,(target-lengths[seg-1])/span));out.push({x:points[seg-1].x+(points[seg].x-points[seg-1].x)*t,y:points[seg-1].y+(points[seg].y-points[seg-1].y)*t})}return out}
function pointToSegmentDistance(p,a,b){
 const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
 if(!len)return dist(p,a);
 const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len));
 return dist(p,{x:a.x+t*dx,y:a.y+t*dy});
}
function pathDistance(points,path){
 let total=0;
 for(const p of points){
  let nearest=Infinity;
  for(let i=1;i<path.length;i++)nearest=Math.min(nearest,pointToSegmentDistance(p,path[i-1],path[i]));
  total+=nearest;
 }
 return total/Math.max(1,points.length);
}
function resampleBySpacing(points,spacing=4){
 if(points.length<2)return points.slice();
 const lengths=[0];
 for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+dist(points[i-1],points[i]));
 const total=lengths.at(-1);
 if(total<.001)return points.slice(0,1);
 const result=[];
 let seg=1;
 for(let target=0;target<total;target+=spacing){
  while(seg<lengths.length-1&&lengths[seg]<target)seg++;
  const span=Math.max(.0001,lengths[seg]-lengths[seg-1]);
  const t=Math.max(0,Math.min(1,(target-lengths[seg-1])/span));
  result.push({
   x:points[seg-1].x+(points[seg].x-points[seg-1].x)*t,
   y:points[seg-1].y+(points[seg].y-points[seg-1].y)*t
  });
 }
 result.push(points[points.length-1]);
 return result;
}
function expectedDots(letter,index){
 const stroke=templateFor(letter)[index]||[];
 const points=strokePath(letter,index,stroke).map(p=>({x:p.x*state.size.w,y:p.y*state.size.h}));
 if(isClosedStroke(letter,index)&&points.length>1)points.push({...points[0]});
 return points;
}
function refreshDotProgress(){
 if(!state.letter||!state.current.length)return;
 const expected=expectedDots(state.letter,state.strokes.length);
 if(!expected.length){state.dotProgress=0;return;}
 const tolerance=Math.max(14,Math.min(20,Math.min(state.size.w,state.size.h)*.055));
 if(expected.length===1){
  state.dotProgress=state.current.some(p=>dist(p,expected[0])<=tolerance)?1:0;
  return;
 }
 const trace=resampleBySpacing(state.current,4);
 let cursor=0,count=0;
 for(const dot of expected){
  let nearest=Infinity,nearestIndex=-1;
  for(let i=cursor;i<trace.length;i++){
   const d=dist(trace[i],dot);
   if(d<nearest){nearest=d;nearestIndex=i;}
  }
  if(nearestIndex>=0&&nearest<=tolerance){
   count++;
   cursor=Math.min(trace.length-1,nearestIndex+1);
  }else break;
 }
 state.dotProgress=count;
}
function strokeScore(user,expected){
 const tolerance=Math.max(14,Math.min(20,Math.min(state.size.w,state.size.h)*.055));
 if(expected.length===1){
  const nearest=user.reduce((best,p)=>Math.min(best,dist(p,expected[0])),Infinity);
  const pass=nearest<=tolerance;
  return {pass,coverage:pass?1:0,matched:pass?1:0,total:1,average:nearest};
 }
 if(user.length<2||expected.length<2)return {pass:false,coverage:0,matched:0,total:expected.length};
 const trace=resampleBySpacing(user,4);
 const startDistance=dist(trace[0],expected[0]);
 const endDistance=dist(trace[trace.length-1],expected[expected.length-1]);
 if(startDistance>tolerance*1.35||endDistance>tolerance*1.35)
  return {pass:false,coverage:0,matched:0,total:expected.length};
 let matched=0,cursor=0,distanceSum=0;
 for(const dot of expected){
  let nearest=Infinity,nearestIndex=-1;
  for(let i=cursor;i<trace.length;i++){
   const d=dist(trace[i],dot);
   if(d<nearest){nearest=d;nearestIndex=i;}
  }
  if(nearestIndex>=0&&nearest<=tolerance){
   matched++;
   distanceSum+=nearest;
   cursor=Math.min(trace.length-1,nearestIndex+1);
  }
 }
 const coverage=matched/expected.length;
 const average=matched?distanceSum/matched:Infinity;
 const minimum=expected.length<=5?.70:.76;
 return {
  pass:coverage>=minimum&&average<=tolerance*.85,
  coverage,matched,total:expected.length,average,startDistance,endDistance
 };
}
function evaluate(){
 const template=templateFor(state.letter);
 const count=state.strokes.length;
 if(count>template.length){rejectStroke('Za dużo ruchów. Wyczyść pole i spróbuj ponownie.');return}
 const index=count-1;
 if(index<0)return;
 const expected=expectedDots(state.letter,index);
 const result=strokeScore(state.strokes[index],expected);
 if(!result.pass){
  rejectStroke(result.total===1?'Dotknij pomarańczowego znacznika.':'Spróbuj ponownie. Zacznij przy pomarańczowym znaczniku i podążaj za strzałkami.');
  return;
 }
 if(count<template.length){
  $('#feedback').textContent='Dobrze! Teraz wykonaj kolejny fragment litery.';
  return;
 }
 $('#feedback').textContent='Świetnie! Wszystkie punkty zostały połączone we właściwej kolejności.';
 $('#save').disabled=false;
}
function rejectStroke(message){state.strokes.pop();state.current=[];state.saved=false;$('#save').disabled=true;$('#feedback').textContent=message+' Etapy zaliczone wcześniej pozostają zapisane.';draw();}
$('#clear').addEventListener('click',()=>{state.strokes=[];state.current=[];state.dotProgress=0;$('#save').disabled=true;$('#feedback').textContent='Wyczyść pole. Zacznij od pierwszego ruchu.';draw()});
function saveCurrentLetter(){
  if($('#save').disabled)return false;
  if(!state.completed.includes(state.letter)){state.completed.push(state.letter);state.stars++}
  state.saved=true;persist();$('#feedback').textContent='Ćwiczenie zapisane. Brawo!';$('#save').disabled=true;
  return true;
 }
 $('#save').addEventListener('click',saveCurrentLetter);
 $('#nextLetter').addEventListener('click',()=>{
  // Jeżeli wszystkie ruchy zostały poprawnie wykonane, zapisz literę automatycznie.
  // W przeciwnym razie przejdź dalej bez zaliczania jej — to bezpieczne pominięcie.
  saveCurrentLetter();
  const index=DATA.alphabet.indexOf(state.letter);
  if(index>=0&&index<DATA.alphabet.length-1)openLetter(DATA.alphabet[index+1]);
  else renderHome();
 });
$('#speakLetter').addEventListener('click',()=>speak('Litera '+(state.letter||'')));
$('#readGuide').addEventListener('click',()=>speak('Jak napisać literę '+(state.letter||'')+'. '+Array.from($('#guideList').querySelectorAll('li')).map(li=>li.textContent).join('. ')));
$('#back').addEventListener('click',renderHome);
$('#reset').addEventListener('click',()=>{if(confirm('Czy na pewno wyzerować wszystkie postępy?')){state.completed=[];state.words=[];state.stars=0;persist();renderHome()}});
$('#selectedWord').addEventListener('change',()=>{$('#markWord').hidden=!$('#selectedWord').value});
$('#markWord').addEventListener('click',()=>{const w=$('#selectedWord').value;if(w&&!state.words.includes(w)){state.words.push(w);state.stars++;persist()}$('#markWord').hidden=true;$('#feedback').textContent='Brawo! Wyraz zapisany.'});
window.addEventListener('resize',()=>{if(state.letter)draw()});
if('serviceWorker' in navigator && location.protocol!=='file:')window.addEventListener('load',async()=>{try{const reg=await navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'});await reg.update();}catch(e){console.warn('PWA update unavailable',e)}});
async function initializeLetterData(){
 try{
  const [pathResponse,pointResponse]=await Promise.all([
   fetch('./letter-paths.json?v=30'),
   fetch('./letter-points.json?v=30')
  ]);
  if(!pathResponse.ok||!pointResponse.ok)throw new Error('Nie udało się pobrać zestawu liter i punktów.');
  const pathData=await pathResponse.json();
  const pointData=await pointResponse.json();
  const missing=DATA.alphabet.filter(ch=>{
   const paths=pathData.letters?.[ch]?.strokes||[];
   const dots=pointData.letters?.[ch]?.strokes||[];
   return !paths.length||paths.length!==dots.length||dots.some(s=>!Array.isArray(s.dots)||s.dots.length<(s.press?1:2));
  });
  if(missing.length)throw new Error('Niekompletne opunktowanie liter: '+missing.join(', '));
  LETTER_PATHS=pathData;
  LETTER_POINTS=pointData;
  renderHome();
  const requested=new URLSearchParams(window.location.search).get('letter');
  if(requested&&DATA.alphabet.includes(requested.toUpperCase()))openLetter(requested.toUpperCase());
 }catch(error){
  console.error('Nie udało się wczytać systemu punktów liter',error);
  renderHome();
  const intro=$('#home .intro p');
  if(intro)intro.textContent='Nie udało się załadować systemu punktów liter. Odśwież stronę po zakończeniu publikacji.';
 }
}
initializeLetterData();
