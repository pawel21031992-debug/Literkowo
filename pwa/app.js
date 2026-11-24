const API_BASE = ''; // Po utworzeniu projektu wpisz: https://PROJECT_REF.supabase.co/functions/v1/literkowo-api
const DATA = {"alphabet":["A","Ą","B","C","Ć","D","E","Ę","F","G","H","I","J","K","L","Ł","M","N","Ń","O","Ó","P","R","S","Ś","T","U","W","Y","Z","Ź","Ż"],"templates":{"A":[[[0.18,0.86],[0.5,0.14],[0.82,0.86]],[[0.32,0.6],[0.68,0.6]]],"Ą":[[[0.18,0.86],[0.5,0.14],[0.82,0.86]],[[0.32,0.6],[0.68,0.6]],[[0.78,0.84],[0.87,0.88],[0.89,0.94],[0.82,0.98],[0.74,0.96]]],"B":[[[0.24,0.14],[0.24,0.86]],[[0.24,0.14],[0.4,0.14],[0.65,0.13],[0.75,0.23],[0.81,0.32],[0.77,0.42],[0.65,0.48],[0.46,0.5],[0.24,0.5]],[[0.24,0.5],[0.45,0.5],[0.68,0.51],[0.79,0.59],[0.85,0.69],[0.82,0.79],[0.7,0.85],[0.48,0.87],[0.24,0.86]]],"C":[[[0.8,0.22],[0.65,0.14],[0.43,0.14],[0.25,0.27],[0.18,0.5],[0.25,0.73],[0.43,0.86],[0.65,0.86],[0.8,0.78]]],"Ć":[[[0.8,0.22],[0.65,0.14],[0.43,0.14],[0.25,0.27],[0.18,0.5],[0.25,0.73],[0.43,0.86],[0.65,0.86],[0.8,0.78]],[[0.4,0.06],[0.62,0]]],"D":[[[0.22,0.14],[0.22,0.86]],[[0.22,0.14],[0.48,0.14],[0.7,0.23],[0.83,0.4],[0.83,0.6],[0.7,0.77],[0.48,0.86],[0.22,0.86]]],"E":[[[0.25,0.14],[0.25,0.86]],[[0.25,0.14],[0.8,0.14]],[[0.25,0.5],[0.7,0.5]],[[0.25,0.86],[0.8,0.86]]],"Ę":[[[0.25,0.14],[0.25,0.86]],[[0.25,0.14],[0.8,0.14]],[[0.25,0.5],[0.7,0.5]],[[0.25,0.86],[0.8,0.86]],[[0.78,0.84],[0.87,0.88],[0.89,0.94],[0.82,0.98],[0.74,0.96]]],"F":[[[0.25,0.14],[0.25,0.86]],[[0.25,0.14],[0.8,0.14]],[[0.25,0.5],[0.7,0.5]]],"G":[[[0.8,0.22],[0.65,0.14],[0.43,0.14],[0.25,0.27],[0.18,0.5],[0.25,0.73],[0.43,0.86],[0.65,0.86],[0.8,0.76],[0.8,0.56],[0.58,0.56]]],"H":[[[0.24,0.14],[0.24,0.86]],[[0.76,0.14],[0.76,0.86]],[[0.24,0.5],[0.76,0.5]]],"I":[[[0.3,0.14],[0.7,0.14]],[[0.5,0.14],[0.5,0.86]],[[0.3,0.86],[0.7,0.86]]],"J":[[[0.28,0.14],[0.78,0.14]],[[0.68,0.14],[0.68,0.68],[0.6,0.82],[0.43,0.88],[0.27,0.8]]],"K":[[[0.24,0.14],[0.24,0.86]],[[0.24,0.52],[0.76,0.14]],[[0.24,0.52],[0.8,0.86]]],"L":[[[0.25,0.14],[0.25,0.86],[0.8,0.86]]],"Ł":[[[0.25,0.14],[0.25,0.86],[0.8,0.86]],[[0.18,0.62],[0.82,0.34]]],"M":[[[0.18,0.14],[0.18,0.86],[0.5,0.55],[0.82,0.14],[0.82,0.86]]],"N":[[[0.22,0.14],[0.22,0.86],[0.78,0.14],[0.78,0.86]]],"Ń":[[[0.22,0.14],[0.22,0.86],[0.78,0.14],[0.78,0.86]],[[0.4,0.06],[0.62,0]]],"O":[[[0.5,0.14],[0.7,0.17],[0.82,0.34],[0.84,0.52],[0.76,0.72],[0.6,0.85],[0.4,0.85],[0.24,0.72],[0.16,0.52],[0.18,0.34],[0.3,0.17],[0.5,0.14]]],"Ó":[[[0.5,0.14],[0.7,0.17],[0.82,0.34],[0.84,0.52],[0.76,0.72],[0.6,0.85],[0.4,0.85],[0.24,0.72],[0.16,0.52],[0.18,0.34],[0.3,0.17],[0.5,0.14]],[[0.4,0.06],[0.62,0]]],"P":[[[0.24,0.14],[0.24,0.86]],[[0.24,0.14],[0.58,0.14],[0.78,0.24],[0.8,0.39],[0.66,0.5],[0.24,0.5]]],"R":[[[0.24,0.14],[0.24,0.86]],[[0.24,0.14],[0.58,0.14],[0.78,0.24],[0.8,0.39],[0.66,0.5],[0.24,0.5]],[[0.5,0.5],[0.82,0.86]]],"S":[[[0.78,0.23],[0.62,0.14],[0.4,0.14],[0.23,0.26],[0.27,0.42],[0.5,0.5],[0.73,0.58],[0.8,0.74],[0.63,0.86],[0.4,0.86],[0.22,0.77]]],"Ś":[[[0.78,0.23],[0.62,0.14],[0.4,0.14],[0.23,0.26],[0.27,0.42],[0.5,0.5],[0.73,0.58],[0.8,0.74],[0.63,0.86],[0.4,0.86],[0.22,0.77]],[[0.4,0.06],[0.62,0]]],"T":[[[0.18,0.14],[0.82,0.14]],[[0.5,0.14],[0.5,0.86]]],"U":[[[0.22,0.14],[0.22,0.62],[0.28,0.78],[0.42,0.86],[0.58,0.86],[0.72,0.78],[0.78,0.62],[0.78,0.14]]],"W":[[[0.14,0.14],[0.28,0.86],[0.5,0.48],[0.72,0.86],[0.86,0.14]]],"Y":[[[0.18,0.14],[0.5,0.5]],[[0.82,0.14],[0.5,0.5]],[[0.5,0.5],[0.5,0.86]]],"Z":[[[0.2,0.14],[0.8,0.14],[0.2,0.86],[0.8,0.86]]],"Ź":[[[0.2,0.14],[0.8,0.14],[0.2,0.86],[0.8,0.86]],[[0.4,0.06],[0.62,0]]],"Ż":[[[0.2,0.14],[0.8,0.14],[0.2,0.86],[0.8,0.86]],[[0.5,0.05],[0.52,0.04],[0.54,0.05],[0.52,0.06],[0.5,0.05]]]},"guides":{"A":["Zacznij na dole po lewej i poprowadź linię ukośnie do góry.","Od szczytu poprowadź drugą linię ukośnie w dół na prawo.","Połącz obie linie krótką kreską w środku."],"Ą":["Zacznij na dole po lewej i poprowadź linię ukośnie do szczytu.","Dorysuj poprzeczną kreskę w środku.","Na końcu dodaj ogonek po prawej stronie."],"B":["Narysuj pionową linię z góry na dół.","Od góry poprowadź łuk w prawo i wróć do środka.","Od środka narysuj drugi, dolny łuk."],"C":["Zacznij u góry po prawej stronie.","Poprowadź duży łuk w lewo i w dół.","Zakończ łuk u góry po prawej."],"Ć":["Narysuj literę C jednym szerokim łukiem.","Zatrzymaj ołówek przy górnym końcu.","Dodaj kreskę nad literą."],"D":["Narysuj pionową linię z góry na dół.","Zacznij u góry i poprowadź łuk w prawo.","Zamknij łuk na dole przy pionowej linii."],"E":["Narysuj pionową linię z góry na dół.","Dodaj górną kreskę w prawo.","Dodaj środkową i dolną kreskę."],"Ę":["Napisz literę E trzema poziomymi kreskami i pionową linią.","Sprawdź, czy kreski łączą się z pionową linią.","Dodaj ogonek przy dolnej części litery."],"F":["Narysuj pionową linię z góry na dół.","Dodaj długą górną kreskę.","Dodaj krótszą kreskę na środku."],"G":["Narysuj łuk podobny do litery C.","Zamknij prawą część krótką kreską.","Dodaj poziomą kreskę skierowaną do środka."],"H":["Narysuj lewą pionową linię.","Narysuj prawą pionową linię.","Połącz je kreską na środku."],"I":["Narysuj górną krótką kreskę.","Poprowadź pionową linię w dół.","Dodaj dolną krótką kreskę."],"J":["Narysuj górną kreskę.","Poprowadź pionową linię w dół.","Zakończ dolnym łukiem zawiniętym w lewo."],"K":["Narysuj pionową linię z góry na dół.","Od środka poprowadź ukośną linię w górę na prawo.","Od środka poprowadź drugą ukośną linię w dół na prawo."],"L":["Narysuj pionową linię z góry na dół.","Od dołu poprowadź poziomą kreskę w prawo."],"Ł":["Narysuj pionową linię z góry na dół.","Dodaj dolną poziomą kreskę.","Przez środek poprowadź ukośną kreskę."],"M":["Narysuj lewą pionową linię.","Poprowadź ukośną linię do środka na dole.","Wróć ukośnie do góry i narysuj prawą pionową linię."],"N":["Narysuj lewą pionową linię.","Połącz górę lewej strony z dołem prawej ukośną linią.","Narysuj prawą pionową linię."],"Ń":["Narysuj literę N: dwie pionowe linie i jedną ukośną.","Sprawdź połączenie ukośnej kreski.","Dodaj kreskę nad literą."],"O":["Zacznij u góry.","Prowadź zaokrąglony łuk w prawo i w dół.","Zamknij kształt u góry."],"Ó":["Narysuj zaokrąglone O jednym ciągłym ruchem.","Zamknij kształt.","Dodaj kreskę nad literą."],"P":["Narysuj pionową linię z góry na dół.","Od góry poprowadź łuk w prawo.","Zamknij górną część w połowie wysokości."],"R":["Narysuj pionową linię z góry na dół.","Narysuj górny łuk i zamknij go w połowie.","Od środka poprowadź ukośną nogę w dół na prawo."],"S":["Zacznij u góry po prawej.","Poprowadź łuk w lewo i w dół.","Zakręć w prawo i zakończ na dole."],"Ś":["Narysuj literę S płynnym, falistym ruchem.","Zakończ dolny łuk.","Dodaj kreskę nad literą."],"T":["Narysuj górną poziomą kreskę.","Znajdź jej środek.","Od środka poprowadź pionową linię w dół."],"U":["Zacznij u góry po lewej.","Poprowadź linię w dół i zaokrąglij na dole.","Wróć pionowo do góry po prawej."],"W":["Narysuj ukośną linię w dół do środka.","Poprowadź ukośną linię w górę.","Powtórz z drugim dołkiem i prawą końcówką."],"Y":["Narysuj lewą górną ukośną linię do środka.","Dorysuj prawą górną ukośną linię.","Od środka poprowadź pionową linię w dół."],"Z":["Narysuj górną poziomą kreskę.","Połącz ją ukośną linią z prawym dołem.","Dodaj dolną poziomą kreskę."],"Ź":["Narysuj literę Z trzema kreskami.","Sprawdź, czy ukośna linia łączy oba końce.","Dodaj kreskę nad literą."],"Ż":["Narysuj literę Z trzema kreskami.","Sprawdź połączenie górnej, ukośnej i dolnej kreski.","Dodaj kropkę nad literą."]},"words":{"A":["auto","aparat","ananas"],"Ą":["wąż","kąt","pąk"],"B":["balon","but","banan"],"C":["cebula","cukier","cytryna"],"Ć":["ćma","ćwiczyć","ćwierć"],"D":["dom","dach","droga"],"E":["ekran","ekierka","elf"],"Ę":["gęś","język","mięta"],"F":["foka","farba","flet"],"G":["gitara","góra","garnek"],"H":["hak","hotel","hamak"],"I":["igła","iskra","indyk"],"J":["jabłko","jeleń","jajko"],"K":["kot","kura","klocki"],"L":["lalka","las","lampa"],"Ł":["łódka","łąka","łapa"],"M":["motyl","mama","miska"],"N":["nos","noga","namiot"],"Ń":["koń","słoń","dłoń"],"O":["oko","okno","owca"],"Ó":["ósmy","ogórek","ósemka"],"P":["pies","piłka","pociąg"],"R":["rak","rower","ryba"],"S":["sowa","samolot","ser"],"Ś":["ślimak","świat","świeca"],"T":["tata","tort","tulipan"],"U":["ul","ucho","ubranie"],"W":["woda","wóz","wiewiórka"],"Y":["yoyo","dynia","ryba"],"Z":["zamek","zebra","zegar"],"Ź":["źrebak","źródło","gałąź"],"Ż":["żaba","żółw","żyrafa"]},"examples":{"A":"auto","Ą":"wąż","B":"balon","C":"cebula","Ć":"ćma","D":"dom","E":"ekran","Ę":"język","F":"foka","G":"gitara","H":"hak","I":"igła","J":"jabłko","K":"kot","L":"lalka","Ł":"łódka","M":"motyl","N":"nos","Ń":"koń","O":"oko","Ó":"ósmy","P":"pies","R":"rak","S":"sowa","Ś":"ślimak","T":"tort","U":"ul","W":"woda","Y":"yoyo","Z":"zamek","Ź":"źrebak","Ż":"żaba"}};

// Wzory pochodzą z gotowego, walidowanego zbioru ścieżek pisania.
let LETTER_PATHS = null;
function templateFor(letter){
 const model=LETTER_PATHS?.letters?.[letter];
 return model ? model.strokes.map(s=>s.points) : [];
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
const state = { letter: null, strokes: [], current: [], size: {w:1,h:1}, completed: load('completed',[]), words: load('words',[]), stars: Number(localStorage.getItem('literkowo.stars')||0), saved:false };
function load(k,f){try{return JSON.parse(localStorage.getItem('literkowo.'+k))??f}catch{return f}}
function persist(){localStorage.setItem('literkowo.completed',JSON.stringify(state.completed));localStorage.setItem('literkowo.words',JSON.stringify(state.words));localStorage.setItem('literkowo.stars',String(state.stars));renderStats()}
function renderStats(){ $('#progress').textContent=state.completed.length+' / 32 liter';}
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
 if(!LETTER_PATHS?.letters?.[ch]){const intro=$('#home .intro p');if(intro)intro.textContent='Wzory liter nie zostały jeszcze załadowane. Odśwież stronę.';return;}
 state.letter=ch;state.strokes=[];state.current=[];state.saved=false;
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
 const steps=guideOverrides[ch]||template.map((stroke,i)=>'Ruch '+(i+1)+': zacznij przy pomarańczowym punkcie i prowadź palec po zaznaczonej ścieżce, zgodnie ze strzałką.');
 steps.forEach((g,i)=>{const li=document.createElement('li');li.textContent=String(g).replace(/^\s*\d+[.)]\s*/, '');$('#guideList').append(li)});
 const vowel='AĄEĘIOÓUY'.includes(ch);
 const syllables=vowel?[ch.toLowerCase(),'ma','me','mi','mo','mu']:['a','e','i','o','u','y'].map(x=>ch.toLowerCase()+x);
 const wordList=DATA.words[ch]||[DATA.examples[ch]];
 fillChips('#syllables',syllables);fillChips('#words',wordList,true);
 $('#feedback').textContent=ch==='A'?'Etap 1 z 2: od lewego dołu do szczytu, a potem w dół po prawej — jednym ruchem.':'Zacznij od pomarańczowego punktu i prowadź palec zgodnie ze strzałką.';
 $('#save').disabled=true;draw();
 speak('Litera '+ch);
}
function fillChips(selector,items,isWord=false){const el=$(selector);el.innerHTML='';if(isWord){const select=$('#selectedWord');select.innerHTML='<option value="">Wybierz wyraz…</option>';items.forEach(item=>{const option=document.createElement('option');option.value=item;option.textContent=item;select.append(option)})}items.forEach(item=>{const b=document.createElement('button');b.className='chip';b.textContent=item;b.addEventListener('click',()=>{speak(item);if(isWord){$('#selectedWord').value=item;$('#markWord').hidden=false}});el.append(b)})}
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
 if(!model||!transform)return;
 // Jasny obrys daje prawdziwe proporcje litery, a ścieżki pokazują kolejność ruchów.
 if(model.outline && typeof Path2D!=='undefined'){
  try{
   ctx.save();
   ctx.translate(transform.offsetX-transform.frameX*transform.scale,transform.offsetY-transform.frameY*transform.scale);
   ctx.scale(transform.scale,transform.scale);
   ctx.fillStyle='rgba(77,83,170,.105)';
   ctx.fill(new Path2D(model.outline),'evenodd');
   ctx.restore();
  }catch(e){ctx.restore();}
 }
 const template=templateFor(state.letter);
 const rendered=template.map((stroke,i)=>strokePath(state.letter,i,stroke).map(p=>({x:p.x*rect.width,y:p.y*rect.height})));
 const baseWidth=Math.max(7,Math.min(18,transform.scale*(LETTER_PATHS.strokeHalf||0.0069)*2));
 rendered.forEach((points,i)=>{
  if(!points.length)return;
  // Delikatna, ciągła linia pod spodem; przerywana linia wskazuje dokładny tor palca.
  ctx.beginPath();
  points.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.setLineDash([]);
  ctx.strokeStyle=i<state.strokes.length?'rgba(42,150,105,.25)':'rgba(77,83,170,.20)';
  ctx.lineWidth=baseWidth*1.8;
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.stroke();
  ctx.beginPath();
  points.forEach((p,j)=>j?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));
  ctx.setLineDash([2,7]);
  ctx.strokeStyle=i<state.strokes.length?'rgba(42,150,105,.82)':i===state.strokes.length?'rgba(77,83,170,.95)':'rgba(77,83,170,.68)';
  ctx.lineWidth=Math.max(3,baseWidth*.58);
  ctx.lineCap='round';
  ctx.lineJoin='round';
  ctx.stroke();
  ctx.setLineDash([]);
  let length=0;
  for(let j=1;j<points.length;j++)length+=dist(points[j-1],points[j]);
  if(length>24){
   const target=length*.68;
   let walked=0;
   for(let j=1;j<points.length;j++){
    const a=points[j-1],b=points[j],segment=dist(a,b);
    if(walked+segment>=target){
     const t=(target-walked)/Math.max(segment,.001);
     const x=a.x+(b.x-a.x)*t,y=a.y+(b.y-a.y)*t;
     const angle=Math.atan2(b.y-a.y,b.x-a.x),size=Math.max(8,baseWidth*.9);
     ctx.beginPath();
     ctx.moveTo(x+Math.cos(angle)*size,y+Math.sin(angle)*size);
     ctx.lineTo(x-Math.cos(angle)*size*.8+Math.sin(angle)*size*.65,y-Math.sin(angle)*size*.8-Math.cos(angle)*size*.65);
     ctx.lineTo(x-Math.cos(angle)*size*.8-Math.sin(angle)*size*.65,y-Math.sin(angle)*size*.8+Math.cos(angle)*size*.65);
     ctx.closePath();
     ctx.fillStyle='#5954a6';
     ctx.fill();
     break;
    }
    walked+=segment;
   }
  }
  const p=points[0];
  let markerX=p.x,markerY=p.y;
  const priorStarts=rendered.slice(0,i).filter(s=>s.length&&dist(s[0],p)<Math.max(18,baseWidth*2.5)).length;
  if(priorStarts>0){markerX+=(i%2===0?-1:1)*Math.max(17,baseWidth*2);markerY-=2;}
  ctx.beginPath();
  ctx.arc(markerX,markerY,Math.max(10,baseWidth*1.05),0,Math.PI*2);
  ctx.fillStyle=i<state.strokes.length?'#29966a':'#f28a35';
  ctx.fill();
  ctx.fillStyle='#fff';
  ctx.font='bold 12px system-ui';
  ctx.textAlign='center';
  ctx.textBaseline='middle';
  ctx.fillText(String(i+1),markerX,markerY);
  if(i===0){
   ctx.font='800 10px system-ui';
   ctx.textAlign='left';
   ctx.fillStyle='#b85b16';
   ctx.fillText('START',markerX+Math.max(14,baseWidth*1.3),markerY+3);
  }
 });
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
canvas.addEventListener('pointerdown',e=>{if(!state.letter||e.pointerType==='mouse'&&e.button!==0)return;e.preventDefault();activePointer=e.pointerId;try{canvas.setPointerCapture(e.pointerId)}catch{}state.current=[point(e)];state.saved=false;$('#save').disabled=true;draw()},{passive:false});
canvas.addEventListener('pointermove',e=>{if(activePointer!==e.pointerId||!state.current.length)return;e.preventDefault();state.current.push(point(e));draw()},{passive:false});
function finishStroke(e){if(e&&activePointer!==e.pointerId)return;activePointer=null;if(state.current.length){state.strokes.push(state.current);state.current=[];draw();evaluate()}}
function cancelStroke(e){if(e&&activePointer!==e.pointerId)return;activePointer=null;state.current=[];draw();$('#feedback').textContent='Ruch przerwany. Spróbuj ponownie.'}
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
function strokeScore(user,expected){
 const a=resample(user.map(p=>({x:p.x/state.size.w,y:p.y/state.size.h})),48);
 const b=resample(strokePath(state.letter,state.strokes.length-1,expected),48);
 if(a.length<4||b.length<2)return Infinity;
 // Zachowujemy kolejność i kierunek ruchu, tolerując drobne odchylenia od wzoru.
 let total=0;
 for(let i=0;i<Math.min(a.length,b.length);i++)total+=dist(a[i],b[i]);
 return total/Math.min(a.length,b.length);
}
function evaluate(){
 const t=templateFor(state.letter);
 const count=state.strokes.length;
 if(count>t.length){rejectStroke('Za dużo ruchów. Zacznij jeszcze raz i wykonuj każdy ruch osobno.');return}
 const index=count-1;
 if(index<0)return;
 const score=strokeScore(state.strokes[index],t[index]);
 if(!Number.isFinite(score)||score>.145){rejectStroke('Kształt tego ruchu wyraźnie odbiega od wzoru. Spróbuj jeszcze raz, prowadząc linię po właściwym kształcie.');return}
 if(count<t.length){$('#feedback').textContent='Dobrze! Teraz wykonaj ruch '+(count+1)+' z '+t.length+', zgodnie ze strzałką.';return}
 $('#feedback').textContent='Świetnie! Wszystkie ruchy pasują do wzoru.';$('#save').disabled=false;
}
function rejectStroke(message){state.strokes.pop();state.current=[];state.saved=false;$('#save').disabled=true;$('#feedback').textContent=message+' Etapy zaliczone wcześniej pozostają zapisane.';draw();}
$('#clear').addEventListener('click',()=>{state.strokes=[];state.current=[];$('#save').disabled=true;$('#feedback').textContent='Wyczyść pole. Zacznij od pierwszego ruchu.';draw()});
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
  const response=await fetch('./letter-paths.json?v=21');
  if(!response.ok)throw new Error('HTTP '+response.status);
  const dataset=await response.json();
  const missing=DATA.alphabet.filter(ch=>!dataset.letters?.[ch]||!dataset.letters[ch].strokes?.length);
  if(missing.length)throw new Error('Brak wzorów: '+missing.join(', '));
  LETTER_PATHS=dataset;
  renderHome();
 }catch(error){
  console.error('Nie udało się wczytać wzorów liter',error);
  renderHome();
  const intro=$('#home .intro p');
  if(intro)intro.textContent='Nie udało się załadować wzorów liter. Odśwież stronę po zakończeniu publikacji.';
 }
}
initializeLetterData();