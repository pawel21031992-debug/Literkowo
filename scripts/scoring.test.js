const test=require('node:test');const assert=require('node:assert/strict');const {strokeScore,outlineStrokeScore}=require('../pwa/scoring.js');
const line=Array.from({length:21},(_,i)=>({x:i*5,y:0}));
const reverse=line.slice().reverse();
test('zalicza prawidłowy ślad przy różnej liczbie próbek',()=>{const sparse=[{x:0,y:0},{x:50,y:0},{x:100,y:0}];assert.equal(strokeScore(sparse,line,16).pass,true)});
test('odrzuca ślad rozpoczęty daleko od wymaganego punktu',()=>{const shifted=line.map(p=>({x:p.x,y:p.y+60}));assert.equal(strokeScore(shifted,line,16).pass,false)});
test('poziom średni dopuszcza odwrócony kierunek otwartego ruchu',()=>{assert.equal(outlineStrokeScore(reverse,line,{tolerance:16}).pass,true)});
test('poziom początkujący zachowuje wymagany kierunek',()=>{assert.equal(strokeScore(reverse,line,16).pass,false)});
test('poziom średni dopuszcza inny punkt startu zamkniętego kształtu',()=>{const ring=[{x:0,y:0},{x:20,y:0},{x:20,y:20},{x:0,y:20},{x:0,y:0}];const rotated=[{x:20,y:20},{x:0,y:20},{x:0,y:0},{x:20,y:0},{x:20,y:20}];assert.equal(outlineStrokeScore(rotated,ring,{tolerance:16,closed:true}).pass,true)});
test('pojedynczy punkt jest oceniany w tolerancji',()=>{assert.equal(strokeScore([{x:3,y:4}],[{x:0,y:0}],16).pass,true);assert.equal(strokeScore([{x:30,y:30}],[{x:0,y:0}],16).pass,false)});
test('odrzuca niepoprawne współrzędne zamiast zaliczać NaN',()=>{assert.equal(strokeScore([{x:NaN,y:0},{x:1,y:1}],line,16).pass,false)});

test('poziom średni łączy obie ukośne kreski wielkiego A w jeden ruch /\\',()=>{const left=[{x:15,y:0},{x:10,y:10},{x:5,y:20}],right=[{x:15,y:0},{x:20,y:10},{x:25,y:20}];const joined=require('../pwa/scoring.js').joinStrokePaths(left,right);assert.deepEqual(joined,[{x:5,y:20},{x:10,y:10},{x:15,y:0},{x:20,y:10},{x:25,y:20}]);assert.equal(outlineStrokeScore(joined,joined,{tolerance:2}).pass,true)});

test('cofnięcie usuwa tylko ostatni ruch i nie zmienia historii wejściowej',()=>{const {undoLastStroke}=require('../pwa/scoring.js');const first=[{x:0,y:0},{x:1,y:1}],second=[{x:2,y:2},{x:3,y:3}],history=[first,second];const remaining=undoLastStroke(history);assert.deepEqual(remaining,[first]);assert.equal(history.length,2);assert.deepEqual(undoLastStroke([]),[])});

test('zalicza kropkę, gdy szybki ruch palca przeciął punkt między próbkami',()=>{const trace=[{x:0,y:0},{x:40,y:0}];assert.equal(strokeScore(trace,[{x:20,y:3}],8).pass,true)});
test('nie zalicza kropki, gdy ślad tylko przebiega obok niej poza tolerancją',()=>{const trace=[{x:0,y:20},{x:40,y:20}];assert.equal(strokeScore(trace,[{x:20,y:0}],8).pass,false)});
test('zalicza kropkę przy pojedynczym precyzyjnym dotknięciu',()=>{assert.equal(strokeScore([{x:19,y:2}],[{x:20,y:0}],8).pass,true)});

test('odrzuca ślad z dużym objazdem mimo zaliczenia punktów wzoru',()=>{const detour=[{x:0,y:0},{x:20,y:0},{x:40,y:0},{x:45,y:35},{x:50,y:55},{x:55,y:35},{x:60,y:0},{x:80,y:0},{x:100,y:0}];assert.equal(strokeScore(detour,line,16).pass,false)});
test('akceptuje niewielkie naturalne odchylenie od linii wzoru',()=>{const slight=[{x:0,y:4},{x:25,y:7},{x:50,y:5},{x:75,y:7},{x:100,y:4}];assert.equal(strokeScore(slight,line,16).pass,true)});
