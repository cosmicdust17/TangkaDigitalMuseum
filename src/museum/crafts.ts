import * as T from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'

export type CraftId = 'loom' | 'canvas' | 'drawing' | 'pigment' | 'mount'
export const crafts: {id:CraftId; title:string; subtitle:string; x:number; z:number; source:string; note:string}[] = [
 {id:'loom',title:'经纬之间',subtitle:'亲手织出一小段平纹',x:-3.7,z:4,source:'https://museum.gwu.edu/structure',note:'通用平纹结构示意。相邻纬线按相反次序穿过经线。'},
 {id:'canvas',title:'一布成面',subtitle:'把松弛的画布逐边绷紧',x:3.7,z:4,source:'https://rubinmuseum.org/projecthimalayanart/exhibition/materials-and-technologies/painting-on-cloth/',note:'布边缝接细杆，再用绳索连接外框。此处演示张紧关系，变形幅度经过放大。'},
 {id:'drawing',title:'循线起稿',subtitle:'沿辅助线描出一朵莲花',x:0,z:12,source:'https://rubinmuseum.org/the-making-of-a-thangka-painting/',note:'以当代莲花练习图理解辅助线与对称。人物造像比例另有专门规范。'},
 {id:'pigment',title:'石色入画',subtitle:'研磨色料，再叠一层颜色',x:0,z:1,source:'https://asia.si.edu/education/educator-resources/teaching-china-with-the-smithsonian/videos/thangka-painting/',note:'研磨与施色的数字示意。屏幕颜色与颗粒大小不代表实物配方或检测结果。'},
 {id:'mount',title:'画卷的衣裳',subtitle:'拆看织物与卷杆的层次',x:0,z:-11,source:'https://www.fieldmuseum.org/page/explore/department/conserving-collections/projects/thangka-preservation',note:'通用织物装裱结构示意。拆解距离经过放大，实际作品的装裱形式各有差别。'}
]
export type CraftModel = {group:T.Group; update:(progress:number,secondary?:number)=>void}

function texture(kind:'wood'|'cloth'|'brocade') {
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512
 const c=canvas.getContext('2d')!
 c.fillStyle=kind==='wood'?'#79543a':kind==='cloth'?'#ded1af':'#7e3031';c.fillRect(0,0,512,512)
 if(kind==='wood'){
  for(let i=0;i<180;i++){c.strokeStyle=i%3?'#33251629':'#d2a16635';c.lineWidth=i%4===0?2:1;c.beginPath();for(let y=0;y<=512;y+=8){const x=i*3+Math.sin(y*.018+i)*3+Math.sin(y*.047+i)*1.6;if(y===0)c.moveTo(x,y);else c.lineTo(x,y)}c.stroke()}
 }else{
  for(let i=0;i<512;i+=4){c.fillStyle=i%8?'#fff7d719':'#271c1c22';c.fillRect(i,0,1,512);c.fillRect(0,i,512,1)}
  if(kind==='brocade')for(let y=24;y<512;y+=64)for(let x=24;x<512;x+=64){c.save();c.translate(x,y);c.strokeStyle='#d0a456';c.lineWidth=1.5;for(let j=0;j<4;j++){c.rotate(Math.PI/2);c.beginPath();c.ellipse(0,-9,5,11,0,0,Math.PI*2);c.stroke()}c.restore()}
 }
 const t=new T.CanvasTexture(canvas);t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.anisotropy=4;return t
}
function materials(){
 return {
 wood:new T.MeshStandardMaterial({map:texture('wood'),roughness:.5}),
 dark:new T.MeshStandardMaterial({color:'#34261f',roughness:.55}),
 gold:new T.MeshStandardMaterial({color:'#c6a16a',metalness:.72,roughness:.32}),
 cloth:new T.MeshStandardMaterial({map:texture('cloth'),roughness:.98,side:T.DoubleSide}),
 silk:new T.MeshStandardMaterial({map:texture('brocade'),roughness:.64,side:T.DoubleSide}),
 rope:new T.MeshStandardMaterial({color:'#c9b386',roughness:1}),
 cream:new T.MeshStandardMaterial({color:'#e9dec8',roughness:.23}),
 blue:new T.MeshStandardMaterial({color:'#315d86',roughness:.84}),
 green:new T.MeshStandardMaterial({color:'#36765e',roughness:.85}),
 red:new T.MeshStandardMaterial({color:'#a54130',roughness:.85})
 }
}
function box(parent:T.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material,r=.015){
 const mesh=new T.Mesh(new RoundedBoxGeometry(w,h,d,2,Math.min(r,w/4,h/4,d/4)),mat);mesh.position.set(x,y,z);parent.add(mesh);return mesh
}
function rod(parent:T.Object3D,a:number[],b:number[],r:number,mat:T.Material){
 const start=new T.Vector3(...a),end=new T.Vector3(...b),delta=end.clone().sub(start)
 const mesh=new T.Mesh(new T.CylinderGeometry(r,r,delta.length(),10),mat)
 mesh.position.copy(start).add(end).multiplyScalar(.5);mesh.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),delta.normalize());parent.add(mesh);return mesh
}
function thread(parent:T.Object3D,points:T.Vector3[],radius:number,mat:T.Material){
 const mesh=new T.Mesh(new T.TubeGeometry(new T.CatmullRomCurve3(points),Math.max(12,points.length*3),radius,5,false),mat);parent.add(mesh);return mesh
}
function vessel(parent:T.Object3D,x:number,y:number,z:number,scale:number,mat:T.Material){
 const profile=[[.035,0],[.085,0],[.105,.025],[.16,.16],[.157,.18],[.139,.18],[.128,.145],[.085,.035],[.035,.025]].map(p=>new T.Vector2(p[0],p[1]))
 const mesh=new T.Mesh(new T.LatheGeometry(profile,40),mat);mesh.scale.setScalar(scale);mesh.position.set(x,y,z);parent.add(mesh);return mesh
}
function brush(parent:T.Object3D,x:number,y:number,z:number,m:ReturnType<typeof materials>){
 const g=new T.Group();g.position.set(x,y,z);g.rotation.z=-.35;parent.add(g)
 rod(g,[0,0,0],[0,.48,0],.015,m.wood);rod(g,[0,.48,0],[0,.54,0],.018,m.gold)
 const tip=new T.Mesh(new T.ConeGeometry(.019,.13,18),m.dark);tip.position.y=.605;g.add(tip)
 for(let i=0;i<8;i++){const a=i*Math.PI/4;rod(g,[Math.cos(a)*.014,.54,Math.sin(a)*.014],[0,.66,0],.0012,m.rope)}
 return g
}
function frame(g:T.Object3D,m:ReturnType<typeof materials>,width=1.65,height=1.35){
 for(const x of [-width/2,width/2])box(g,.095,height+.18,.11,x,height/2,0,m.wood)
 for(const y of [-.04,height+.04])box(g,width+.17,.095,.11,0,y,0,m.wood)
 for(const x of [-width/2,width/2])for(const y of [0,height]){
  const pin=new T.Mesh(new T.CylinderGeometry(.016,.016,.012,14),m.gold);pin.rotation.x=Math.PI/2;pin.position.set(x,y,.061);g.add(pin)
 }
}
function lotus(c:CanvasRenderingContext2D,amount:number,exercise=false){
 c.clearRect(0,0,768,768);c.fillStyle='#e4d5b1';c.fillRect(0,0,768,768)
 c.strokeStyle='#a0563433';c.lineWidth=1
 for(let n=64;n<768;n+=64){c.beginPath();c.moveTo(n,0);c.lineTo(n,768);c.moveTo(0,n);c.lineTo(768,n);c.stroke()}
 c.save();c.translate(384,384);c.strokeStyle='#9a4437';c.lineWidth=3
 for(let i=0;i<8;i++){
  c.save();c.rotate(i*Math.PI/4)
  c.beginPath();c.moveTo(0,-44);c.bezierCurveTo(-100,-125,-85,-190,0,-270);c.bezierCurveTo(85,-190,100,-125,0,-44)
  c.globalAlpha=exercise ? .16 : i<Math.floor(amount*8) ? .95 : .12;c.stroke()
  if(exercise&&i%2===0){
   const visible=T.MathUtils.clamp(amount*4-i/2,0,1)
   const a=new T.CubicBezierCurve(new T.Vector2(0,-44),new T.Vector2(-100,-125),new T.Vector2(-85,-190),new T.Vector2(0,-270))
   const b=new T.CubicBezierCurve(new T.Vector2(0,-270),new T.Vector2(85,-190),new T.Vector2(100,-125),new T.Vector2(0,-44))
   const trace=[...a.getPoints(24),...b.getPoints(24).slice(1)]
   c.beginPath();c.moveTo(0,-44);trace.slice(1,1+Math.round(visible*48)).forEach(point=>c.lineTo(point.x,point.y))
   c.globalAlpha=.96;c.stroke()
  }
  c.restore()
 }
 c.globalAlpha=1;c.strokeStyle='#b88942';c.beginPath();c.arc(0,0,38,0,Math.PI*2);c.stroke();c.restore()
}

export function createCraftModel(id:CraftId):CraftModel {
 const group=new T.Group(),m=materials()
 let update:CraftModel['update']=()=>{}
 if(id==='loom'){
  frame(group,m)
  for(const x of [-.64,.64])box(group,.11,.13,.65,x,-.12,0,m.dark)
  for(let i=0;i<28;i++)rod(group,[-.73+i*.054,0,.02],[-.73+i*.054,1.35,.02],.006,m.rope)
  const rows:T.Mesh[]=[]
  for(let j=0;j<26;j++){
   const points=Array.from({length:57},(_,k)=>new T.Vector3((j%2?-1:1)*(-.755+k*.027),.04+j*.019,Math.cos(k*Math.PI/2+j*Math.PI)*.012+.02))
   rows.push(thread(group,points,.007,j%6<3?m.red:m.rope))
  }
  const shuttle=box(group,.42,.035,.07,0,.63,.1,m.wood,.025)
  box(shuttle,.19,.025,.075,0,.025,0,m.red);shuttle.userData.handle=true
  update=p=>{
   const pass=Math.min(3,Math.floor(p*4)),travel=p>=1?1:p*4-pass
   const sign=pass%2?-1:1
   rows.forEach((row,i)=>{
    row.visible=i<20+p*4
    const amount=T.MathUtils.clamp(20+p*4-i,0,1)
    const count=row.geometry.index!.count
    row.geometry.setDrawRange(0,Math.floor(count*amount/3)*3)
   })
   shuttle.position.set(T.MathUtils.lerp(-.72*sign,.72*sign,travel),.42+pass*.019,.12)
  }
 }else if(id==='canvas'){
  frame(group,m)
  const geo=new T.PlaneGeometry(1.32,1.08,32,26),cloth=new T.Mesh(geo,m.cloth);cloth.position.set(0,.675,.015);group.add(cloth);cloth.userData.handle=true
  for(const x of [-.67,.67])rod(group,[x,.12,.02],[x,1.23,.02],.012,m.wood)
  for(const y of [.12,1.23])rod(group,[-.67,y,.02],[.67,y,.02],.012,m.wood)
  for(let i=0;i<9;i++){
   const y=.16+i*.13
   for(const sign of [-1,1])thread(group,[new T.Vector3(sign*.67,y,.03),new T.Vector3(sign*.86,y+.035,-.06),new T.Vector3(sign*.86,y+.075,.065),new T.Vector3(sign*.67,y+.1,.03)],.004,m.rope)
  }
  for(let i=0;i<11;i++)for(const top of [false,true]){
   const x=-.61+i*.12,edge=top?1.23:.12,outer=top?1.42:-.07
   thread(group,[new T.Vector3(x,edge,.035),new T.Vector3(x+.03,outer,-.055),new T.Vector3(x+.06,outer,.065),new T.Vector3(x+.09,edge,.035)],.004,m.rope)
  }
  for(const x of [-.7,.7]){box(group,.18,.08,.56,x,-.13,0,m.dark);rod(group,[x,-.1,.22],[x,.7,-.02],.025,m.wood)}
  update=(p,s=0)=>{const pos=geo.attributes.position;for(let i=0;i<pos.count;i++){const x=pos.getX(i),y=pos.getY(i);pos.setZ(i,(1-p)*.14*Math.cos(x/1.32*Math.PI)*Math.cos(y/1.08*Math.PI)+Math.sin(x*36+y*20)*.012*(1-p))}pos.needsUpdate=true;geo.computeVertexNormals();m.cloth.color.setRGB(1,1-s*.025,1-s*.08)}
 }else if(id==='drawing'){
  const board=new T.Group();board.rotation.x=-.35;group.add(board)
  box(board,1.65,1.35,.06,0,.7,-.03,m.wood)
  const c=document.createElement('canvas');c.width=c.height=768;const ctx=c.getContext('2d')!;lotus(ctx,1)
  const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace
  const paper=new T.Mesh(new T.PlaneGeometry(1.26,1.26),new T.MeshStandardMaterial({map:tex,roughness:1}));paper.position.set(0,.7,.008);board.add(paper);paper.userData.handle=true
  for(const x of [-.68,.68]){rod(group,[x,0,-.3],[x,.95,-.36],.027,m.wood);box(group,.19,.065,.7,x,-.05,0,m.dark)}
  brush(group,.95,.08,.2,m)
  update=p=>{lotus(ctx,p,true);tex.needsUpdate=true}
 }else if(id==='pigment'){
  box(group,1.85,.06,.95,0,.015,0,m.dark)
  for(let i=0;i<3;i++){
   const x=-.57+i*.57,mat=[m.blue,m.green,m.red][i]
   vessel(group,x,.06,.19,.95,m.cream)
   const paint=new T.Mesh(new T.CircleGeometry(.115,36),mat);paint.rotation.x=-Math.PI/2;paint.position.set(x,.16,.19);group.add(paint)
   for(let j=0;j<7;j++){const mineral=new T.Mesh(new T.DodecahedronGeometry(.028+j*.002,0),mat);mineral.position.set(x+Math.sin(j*2.4)*.1,.10+(j%2)*.02,-.17+Math.cos(j*2.4)*.08);mineral.rotation.set(j*.3,j*.8,j*.4);group.add(mineral)}
  }
  const mortar=vessel(group,-.45,.08,-.43,1.35,m.dark)
  const pestle=rod(group,[-.45,.15,-.43],[-.35,.65,-.43],.045,m.cream)
  const dust=new T.Mesh(new T.SphereGeometry(.12,24,12),m.blue);dust.scale.y=.12;dust.position.set(-.45,.142,-.43);group.add(dust)
  const fragments=Array.from({length:8},(_,i)=>{
   const fragment=new T.Mesh(new T.DodecahedronGeometry(.021+i*.001,0),m.blue)
   const angle=i*Math.PI*.765,r=.025+i*.009
   fragment.position.set(-.45+Math.cos(angle)*r,.158,-.43+Math.sin(angle)*r);fragment.rotation.set(i*.4,i,.6);group.add(fragment);return fragment
  })
  vessel(group,.76,.08,-.37,.75,m.gold);brush(group,.86,.1,-.25,m)
  pestle.userData.handle=true
  const swatchMaterial=new T.MeshStandardMaterial({color:'#d7c9a8',roughness:.95})
  const swatch=box(group,.35,.008,.23,.26,.07,-.38,swatchMaterial);swatch.userData.handle=true
  update=(p,s=0)=>{pestle.rotation.z=Math.sin(p*Math.PI*6)*.24;pestle.position.x=-.45+Math.cos(p*Math.PI*6)*.085;pestle.position.z=-.43+Math.sin(p*Math.PI*6)*.085;swatchMaterial.color.set('#d7c9a8').lerp([m.blue,m.green,m.red][Math.min(2,Math.floor(s))].color,p);mortar.rotation.y=p*.2;dust.scale.set(.58+p*.42,.12,.58+p*.42);fragments.forEach((fragment,i)=>fragment.scale.setScalar(Math.max(.05,1-p*(1+i*.09))))}
 }else{
  const layers:T.Object3D[]=[]
  const backing=box(group,1.55,1.7,.025,0,.91,0,m.silk);layers.push(backing)
  const inner=box(group,1.05,1.22,.012,0,1.02,.022,m.gold);layers.push(inner)
  const canvas=document.createElement('canvas');canvas.width=canvas.height=768;lotus(canvas.getContext('2d')!,1)
  const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace
  layers.push(box(group,.92,1.08,.01,0,1.02,.034,new T.MeshStandardMaterial({map:tex,roughness:.94})))
  for(const y of [.06,1.78]){
   rod(group,[-.85,y,0],[.85,y,0],.045,m.wood)
   for(const x of [-.88,.88]){const cap=new T.Mesh(new T.SphereGeometry(.058,20,12),m.gold);cap.position.set(x,y,0);group.add(cap)}
  }
  thread(group,[new T.Vector3(-.55,1.81,0),new T.Vector3(0,2.05,0),new T.Vector3(.55,1.81,0)],.009,m.rope)
  for(const x of [-.64,.64]){box(group,.12,.055,.55,x,-.055,0,m.dark);rod(group,[x,-.02,-.18],[x,1.6,-.055],.018,m.dark)}
  layers.forEach(layer=>layer.userData.handle=true)
  update=p=>layers.forEach((layer,i)=>{layer.position.z=[0,.022,.034][i]+p*i*.19;layer.position.x=p*i*.28})
 }
 update(id==='mount'?0:1)
 group.traverse(o=>{if(o instanceof T.Mesh){o.userData.craftId=id;o.castShadow=true;o.receiveShadow=true}})
 return {group,update}
}

export function addCraftStations(scene:T.Scene){
 const m=materials()
 return crafts.map(craft=>{
  const station=new T.Group();station.position.set(craft.x,0,craft.z)
  box(station,2.5,.12,1.35,0,1,0,m.wood,.035)
  box(station,2.32,.045,1.2,0,1.08,0,m.dark)
  for(const x of [-1.02,1.02])for(const z of [-.47,.47]){
   box(station,.12,.94,.12,x,.47,z,m.wood)
   box(station,.135,.10,.135,x,.12,z,m.gold)
  }
  for(const z of [-.48,.48])box(station,2.12,.07,.06,0,.34,z,m.wood)
  const model=createCraftModel(craft.id);model.group.position.y=1.12
  if(craft.id==='pigment')model.group.scale.setScalar(1.15)
  station.add(model.group)
  const cv=document.createElement('canvas');cv.width=1024;cv.height=192
  const ctx=cv.getContext('2d')!;ctx.fillStyle='#152b33';ctx.fillRect(0,0,1024,192);ctx.strokeStyle='#b38d56';ctx.strokeRect(8,8,1008,176);ctx.textAlign='center';ctx.fillStyle='#e6c896';ctx.font='42px serif';ctx.fillText(craft.title,512,79);ctx.fillStyle='#d6ddd7';ctx.font='24px sans-serif';ctx.fillText('点击体验 · '+craft.subtitle,512,134)
  const tex=new T.CanvasTexture(cv);tex.colorSpace=T.SRGBColorSpace
  const sign=new T.Mesh(new T.PlaneGeometry(2.15,.403),new T.MeshBasicMaterial({map:tex}));sign.position.set(0,.76,.691);station.add(sign)
  station.traverse(o=>o.userData.craftId=craft.id);scene.add(station);return station
 })
}
