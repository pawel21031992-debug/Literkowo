(function(root){
'use strict';
function distance(a,b){return Math.hypot(a.x-b.x,a.y-b.y)}
function resampleBySpacing(points,spacing=4){
 if(points.length<2)return points.slice();
 const lengths=[0];
 for(let i=1;i<points.length;i++)lengths.push(lengths[i-1]+distance(points[i-1],points[i]));
 const total=lengths.at(-1);
 if(total<.001)return points.slice(0,1);
 const result=[];let seg=1;
 for(let target=0;target<total;target+=spacing){
  while(seg<lengths.length-1&&lengths[seg]<target)seg++;
  const span=Math.max(.0001,lengths[seg]-lengths[seg-1]);
  const t=Math.max(0,Math.min(1,(target-lengths[seg-1])/span));
  result.push({x:points[seg-1].x+(points[seg].x-points[seg-1].x)*t,y:points[seg-1].y+(points[seg].y-points[seg-1].y)*t});
 }
 result.push(points[points.length-1]);return result;
}
function strokeScore(user,expected,tolerance=16){
 if(!Array.isArray(user)||!Array.isArray(expected)||!Number.isFinite(tolerance)||tolerance<=0)return {pass:false,coverage:0,matched:0,total:Array.isArray(expected)?expected.length:0,average:Infinity};
 if(!user.length||!expected.length||[...user,...expected].some(p=>!p||!Number.isFinite(p.x)||!Number.isFinite(p.y)))return {pass:false,coverage:0,matched:0,total:expected.length,average:Infinity};
 if(expected.length===1){
  const nearest=user.reduce((best,p)=>Math.min(best,distance(p,expected[0])),Infinity),pass=nearest<=tolerance;
  return {pass,coverage:pass?1:0,matched:pass?1:0,total:1,average:nearest};
 }
 if(user.length<2||expected.length<2)return {pass:false,coverage:0,matched:0,total:expected.length,average:Infinity};
 const trace=resampleBySpacing(user,4);
 const startDistance=distance(trace[0],expected[0]),endDistance=distance(trace[trace.length-1],expected[expected.length-1]);
 if(startDistance>tolerance*1.35||endDistance>tolerance*1.35)return {pass:false,coverage:0,matched:0,total:expected.length,average:Infinity,startDistance,endDistance};
 let matched=0,cursor=0,distanceSum=0;
 for(const dot of expected){
  let nearest=Infinity,nearestIndex=-1;
  for(let i=cursor;i<trace.length;i++){const d=distance(trace[i],dot);if(d<nearest){nearest=d;nearestIndex=i}}
  if(nearestIndex>=0&&nearest<=tolerance){matched++;distanceSum+=nearest;cursor=Math.min(trace.length-1,nearestIndex+1)}
 }
 const coverage=matched/expected.length,average=matched?distanceSum/matched:Infinity,minimum=expected.length<=5?.70:.76;
 return {pass:coverage>=minimum&&average<=tolerance*.85,coverage,matched,total:expected.length,average,startDistance,endDistance};
}
function outlineStrokeScore(user,expected,{tolerance=16,closed=false}={}){
 const variants=[expected.slice()];
 if(expected.length>2&&closed){
  const ring=expected.slice(0,-1),start=user[0];let nearestIndex=0,nearestDistance=Infinity;
  ring.forEach((point,i)=>{const d=distance(start,point);if(d<nearestDistance){nearestDistance=d;nearestIndex=i}});
  const rotated=ring.slice(nearestIndex).concat(ring.slice(0,nearestIndex));rotated.push({...rotated[0]});
  variants.push(rotated,[rotated[0],...rotated.slice(1,-1).reverse(),{...rotated[0]}]);
 }else if(expected.length>1)variants.push(expected.slice().reverse());
 const scores=variants.map(path=>strokeScore(user,path,tolerance));
 return scores.find(score=>score.pass)||scores.sort((a,b)=>(b.coverage||0)-(a.coverage||0)||(a.average||Infinity)-(b.average||Infinity))[0];
}
const api={strokeScore,outlineStrokeScore};
if(typeof module!=='undefined'&&module.exports)module.exports=api;
root.LiterkowoScoring=api;
})(typeof globalThis!=='undefined'?globalThis:this);
