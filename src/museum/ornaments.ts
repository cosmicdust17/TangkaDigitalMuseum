import * as T from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'

const source = 'https://www.metmuseum.org/art/collection/search/78284'
export const ornaments = [
 { name:'莲华铜珐琅', motif:'莲花', meaning:'清净', story:'莲花由水中生长，在佛教图像里常用来表达清净。馆藏经夹上的八件吉祥纹饰分别立在莲座上。', design:'双层珐琅花瓣围绕粒纹花心，背托与上方吊耳相接，可穿绳佩戴。', source },
 { name:'八辐法轮', motif:'法轮', meaning:'佛陀的教法', story:'轮是佛陀教法的象征，八根轮辐常联系到八正道。观看时可以沿轮缘数出八辐。', design:'透空轮辐、蓝色内缘和凸起轮毂构成双面挂饰，吊耳焊接于外轮缘。', source },
 { name:'宝伞流苏', motif:'宝伞', meaning:'庇护与尊崇', story:'伞盖原是地位与尊崇的标志，在佛教造像与仪式语境中也承载庇护的意涵。', design:'拱形伞面包住内侧八道伞骨，浅色垂珠绕伞沿排列。展厅吊绳连接伞顶金属座。', source },
 { name:'宝瓶小坠', motif:'宝瓶', meaning:'丰足', story:'宝瓶是八吉祥之一，盛物的器形常使人联想到丰足。经夹上的宝瓶纹有莲座与飘带作衬。', design:'外翻口沿连着完整内壁，瓶腹留有空腔。口沿两侧由金属提梁托住吊耳，瓶口仍可从上方看见。', source },
 { name:'海螺金坠', motif:'右旋海螺', meaning:'教法之声', story:'右旋海螺是八吉祥之一。海螺也可作号角，螺号清亮而传远的声音常用来比喻教法传播。', design:'螺旋外壳收向尖端，金属口缘沿开口包边，吊耳由嵌入贝壳肩部的金属座承托。', source }
]

export function createOrnament(index:number){
 const group=new T.Group()
 const brass=new T.MeshStandardMaterial({color:0xd6a358,metalness:.68,roughness:.33})
 const enamel=new T.MeshStandardMaterial({color:[0xb34143,0x326b93,0xb13343,0x308d81,0xe2caa0][index],metalness:.22,roughness:.32})
 const pale=new T.MeshStandardMaterial({color:0xf1d8a1,metalness:.21,roughness:.39})
 function add(geometry:T.BufferGeometry,material:T.Material,x=0,y=0,z=0){
  const mesh=new T.Mesh(geometry,material);mesh.position.set(x,y,z);group.add(mesh);return mesh
 }
 const ring=(radius:number,thickness:number,material:T.Material,y=0)=>add(new T.TorusGeometry(radius,thickness,10,48),material,0,y)
 function lathe(profile:number[][],material:T.Material,y=0){
  return add(new T.LatheGeometry(profile.map(([r,h])=>new T.Vector2(r,h)),64),material,0,y)
 }
 function curvedMetal(points:T.Vector3[],radius:number){
  const curve=new T.CatmullRomCurve3(points)
  return add(new T.TubeGeometry(curve,24,radius,10,false),brass)
 }
 function bail(x:number,y:number,z=0){
  const radius=.04, thickness=.011
  add(new T.TorusGeometry(radius,thickness,12,40),brass,x,y,z)
  group.userData.suspension=new T.Vector3(x,y+radius-thickness+.004,z)
 }
 function saddle(x:number,y:number,z:number,w:number,h:number,d:number){
  const base=add(new T.SphereGeometry(1,18,12),brass,x,y,z)
  base.scale.set(w,h,d)
  return base
 }
 if(index===0){
  // A rear plate reaches the upper petal and carries the eyelet.
  add(new T.CylinderGeometry(.296,.296,.025,48),brass,0,0,-.019).rotation.x=Math.PI/2
  for(let layer=0;layer<2;layer++)for(let i=0;i<8;i++){
   const angle=(i+layer*.5)*Math.PI/4,r=layer?.155:.252
   for(const [scale,mat,z] of [[1,brass,0],[.83,enamel,.021],[.83,enamel,-.021]] as const){
    const petal=add(new T.SphereGeometry(1,16,10),mat,Math.sin(angle)*r,Math.cos(angle)*r,z)
    petal.scale.set(.083*scale,.15*scale,.038);petal.rotation.z=-angle
   }
  }
  add(new T.SphereGeometry(.105,20,12),brass).scale.z=.48
  for(let i=0;i<9;i++)add(new T.SphereGeometry(.016,8,6),pale,Math.sin(i*Math.PI*2/9)*.068,Math.cos(i*Math.PI*2/9)*.068,.05)
  saddle(0,.384,0,.037,.037,.026)
  bail(0,.46)
 }else if(index===1){
  ring(.36,.033,brass);ring(.315,.024,enamel);ring(.087,.025,brass)
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4
   add(new T.CylinderGeometry(.017,.026,.25,9),brass,Math.sin(a)*.203,Math.cos(a)*.203).rotation.z=-a
   add(new T.SphereGeometry(.026,10,7),pale,Math.sin(a)*.36,Math.cos(a)*.36)
  }
  add(new T.SphereGeometry(.073,16,10),enamel).scale.z=.57
  saddle(0,.391,0,.034,.035,.023)
  bail(0,.461)
 }else if(index===2){
  // The lathe returns along the interior of the canopy, joining both skins at the hem.
  lathe([
   [.35,0],[.353,.011],[.346,.028],[.325,.049],[.301,.088],[.264,.136],
   [.22,.178],[.166,.215],[.11,.243],[.054,.261],[.024,.265],
   [.024,.247],[.05,.243],[.104,.226],[.158,.196],[.21,.161],
   [.251,.121],[.288,.074],[.31,.037],[.33,.009],[.345,-.005],[.35,0]
  ],enamel,.035)
  const hem=ring(.347,.017,brass,.042);hem.rotation.x=Math.PI/2
  add(new T.CylinderGeometry(.021,.022,.59,22),brass,0,.019)
  add(new T.CylinderGeometry(.039,.032,.057,20),brass,0,.202)
  saddle(0,.298,0,.047,.044,.047)
  for(let i=0;i<8;i++){
   const a=i*Math.PI/4
   curvedMetal([
    new T.Vector3(.022*Math.cos(a),.22,.022*Math.sin(a)),
    new T.Vector3(.13*Math.cos(a),.232,.13*Math.sin(a)),
    new T.Vector3(.243*Math.cos(a),.155,.243*Math.sin(a)),
    new T.Vector3(.339*Math.cos(a),.042,.339*Math.sin(a))
   ],.007)
  }
  for(let i=0;i<12;i++){
   const a=i*Math.PI/6,x=Math.cos(a)*.346,z=Math.sin(a)*.346
   const drop=.084+.027*(i%2)
   add(new T.CylinderGeometry(.006,.006,drop,8),brass,x,.039-drop/2,z)
   add(new T.SphereGeometry(.023,14,10),pale,x,.027-drop,z).scale.y=1.4
  }
  group.userData.suspension=new T.Vector3(0,.336,0)
 }else if(index===3){
  // Continuous section from the exterior foot around the lip and down to the interior floor.
  lathe([
   [0,-.35],[.117,-.35],[.153,-.348],[.167,-.339],[.172,-.325],
   [.168,-.31],[.16,-.297],[.174,-.279],[.208,-.251],[.238,-.216],
   [.258,-.161],[.263,-.116],[.256,-.071],[.236,-.029],[.207,.007],
   [.171,.039],[.134,.071],[.108,.103],[.095,.133],[.091,.166],
   [.091,.215],[.098,.247],[.118,.27],[.144,.29],[.151,.301],
   [.151,.313],[.143,.322],[.128,.323],[.118,.317],[.114,.304],
   [.101,.288],[.082,.268],[.074,.242],[.073,.166],[.077,.129],
   [.09,.099],[.122,.061],[.159,.03],[.196,-.002],[.224,-.042],
   [.238,-.089],[.242,-.128],[.237,-.165],[.221,-.205],[.193,-.238],
   [.153,-.27],[.109,-.287],[.064,-.293],[0,-.295]
  ],enamel)
  for(const [y,r,t] of [[-.331,.168,.009],[-.216,.238,.007],[-.085,.26,.008],[.153,.093,.009],[.309,.149,.01]]){
   const band=ring(r,t,brass,y);band.rotation.x=Math.PI/2
  }
  for(let i=0;i<10;i++){
   const a=i*Math.PI/5,x=Math.sin(a),z=Math.cos(a)
   const setting=saddle(x*.256,-.141,z*.256,.024,.03,.013)
   setting.rotation.y=a
   const bead=add(new T.SphereGeometry(.017,14,10),pale,x*.268,-.141,z*.268)
   bead.scale.set(.84,1.12,.65);bead.rotation.y=a
  }
  for(const sign of [-1,1]){
   saddle(sign*.14,.295,0,.025,.029,.023)
   curvedMetal([
    new T.Vector3(sign*.144,.301,0),new T.Vector3(sign*.141,.352,0),
    new T.Vector3(sign*.093,.395,0),new T.Vector3(sign*.011,.407,0)
   ],.011)
  }
  saddle(0,.408,0,.028,.017,.02)
  bail(0,.454)
 }else{
  const sections=72,sides=24,positions:number[]=[],indices:number[]=[]
  for(let i=0;i<=sections;i++){
   const t=i/sections,a=t*Math.PI*4.6,r=.015+.24*t,thickness=.021+.104*t*t
   for(let k=0;k<sides;k++){
    const v=k*Math.PI*2/sides
    positions.push(Math.cos(a)*(r+Math.cos(v)*thickness),Math.sin(a)*(r+Math.cos(v)*thickness),Math.sin(v)*thickness)
    if(i<sections){const a0=i*sides+k,b=i*sides+(k+1)%sides;indices.push(a0,b,a0+sides,b,b+sides,a0+sides)}
   }
  }
  const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setIndex(indices);geo.computeVertexNormals()
  enamel.side=T.DoubleSide;add(geo,enamel)
  const lipAngle=Math.PI*4.6
  const lip=add(new T.TorusGeometry(.125,.015,12,44),brass,Math.cos(lipAngle)*.255,Math.sin(lipAngle)*.255)
  lip.quaternion.setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(-Math.sin(lipAngle),Math.cos(lipAngle),0))
  // Follow the actual outer surface at the top of the shell when adding its setting.
  let anchor=0
  for(let i=3;i<positions.length;i+=3)if(positions[i+1]>positions[anchor+1])anchor=i
  const [x,y,z]=positions.slice(anchor,anchor+3)
  saddle(x,y-.004,z,.039,.025,.026)
  bail(x,y+.065,z)
 }
 return group
}

export function addOrnaments(scene:T.Scene){
 const models=ornaments.map((_,i)=>{
  const original=createOrnament(i), model=new T.Group()
  const groups=new Map<T.Material,T.BufferGeometry[]>()
  for(const child of original.children){
   if(!(child instanceof T.Mesh))continue
   child.updateMatrix()
   const material=child.material as T.Material
   const geometry=(child.geometry.index?child.geometry.toNonIndexed():child.geometry.clone()).applyMatrix4(child.matrix)
   child.geometry.dispose()
   for(const name of Object.keys(geometry.attributes))if(name!=='position'&&name!=='normal')geometry.deleteAttribute(name)
   const list=groups.get(material)??[];list.push(geometry);groups.set(material,list)
  }
  for(const [material,list] of groups){
   const merged=mergeGeometries(list)
   list.forEach(geometry=>geometry.dispose())
   if(merged)model.add(new T.Mesh(merged,material))
  }
  model.userData.suspension=(original.userData.suspension as T.Vector3).clone()
  return model
 })
 const hanging:T.Group[]=[]
 const cord=new T.MeshStandardMaterial({color:0x9a8963,roughness:.92})
 for(let row=0;row<12;row++)for(let col=0;col<7;col++){
  const index=(row*3+col*2)%models.length
  const x=(col-3)*2.28+Math.sin(row*1.8+col)*.48,z=16-row*2.85+Math.cos(col*2+row)*.6
  const y=5.35+Math.sin(row*1.83+col*1.26)*.54
  const root=new T.Group();root.position.set(x,y,z)
  const model=models[index].clone(true);model.rotation.y=Math.sin(row+col*2)*.72
  model.scale.setScalar(.78+.27*(.5+.5*Math.sin(row*3.5+col)))
  model.traverse(o=>o.userData.ornament=index)
  root.add(model);scene.add(root);hanging.push(root)
  const attachment=model.localToWorld((models[index].userData.suspension as T.Vector3).clone())
  const ceiling=new T.Vector3(attachment.x,7.07,attachment.z)
  const wire=new T.Mesh(new T.CylinderGeometry(.006,.006,ceiling.distanceTo(attachment),6),cord)
  wire.position.copy(attachment).lerp(ceiling,.5)
  scene.add(wire)
 }
 return hanging
}
