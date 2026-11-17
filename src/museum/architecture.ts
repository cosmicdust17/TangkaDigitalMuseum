import * as T from 'three'
export function architecture(scene:T.Scene) {
 const navy=new T.MeshStandardMaterial({color:0x223744,roughness:.8}),wood=new T.MeshStandardMaterial({color:0x493127,roughness:.65}),gold=new T.MeshStandardMaterial({color:0xba925b,metalness:.6,roughness:.38}),red=new T.MeshStandardMaterial({color:0x632b2d,roughness:.8}),dark=new T.MeshStandardMaterial({color:0x201b19}),glow=new T.MeshStandardMaterial({color:0xffda9c,emissive:0xf2a951,emissiveIntensity:1.2})
 function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material){const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m}
 function cylinder(rt:number,rb:number,h:number,x:number,y:number,z:number,mat:T.Material){const m=new T.Mesh(new T.CylinderGeometry(rt,rb,h,12),mat);m.position.set(x,y,z);scene.add(m);return m}
 function label(text:string,x:number,y:number,z:number,w=3){const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=128;const c=canvas.getContext('2d')!;c.fillStyle='#192d37';c.fillRect(0,0,1024,128);c.fillStyle='#ddc08e';c.font='36px serif';c.textAlign='center';c.fillText(text,512,78,980);const mesh=new T.Mesh(new T.PlaneGeometry(w,w/8),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas)}));mesh.position.set(x,y,z);scene.add(mesh);return mesh}
 box(20,.18,39,0,-.1,.4,wood);box(20,.18,39,0,7.15,.4,navy)
 // Repeated floor joints share one draw call.
 const joints=new T.InstancedMesh(new T.BoxGeometry(.012,.01,39),dark,40);const matrix=new T.Matrix4();for(let i=0;i<40;i++){matrix.makeTranslation(-9.75+i*.5,.004,.4);joints.setMatrixAt(i,matrix)}scene.add(joints)
 for(const x of [-9.85,9.85])box(.3,7.2,39,x,3.5,.4,navy)
 box(20,7.2,.3,0,3.5,-18.95,navy)
 for(const x of [-6.6,6.6])box(6.8,7.2,.3,x,3.5,19.75,navy)
 box(6.4,1.7,.4,0,6.25,19.6,red)
 for(const x of [-3.2,3.2]){box(.22,5.4,.5,x,2.7,19.4,gold);box(.5,.22,.7,x,.18,19.4,wood)}
 for(const y of [.38,5.45,5.76]){box(19.5,.055,.07,0,y,-18.75,gold);for(const x of [-9.68,9.68])box(.06,.055,38,x,y,.3,gold)}
 for(const z of [-16,-8,0,8,16]){
  for(const x of [-9.48,9.48]){box(.4,6.9,.4,x,3.45,z,red);box(.68,.18,.68,x,.18,z,wood);box(.62,.22,.62,x,5.8,z,gold);box(.82,.18,.82,x,6.1,z,red)}
  box(19.2,.26,.3,0,6.8,z,wood)
  for(const x of [-6,-2,2,6])box(.12,.14,7.7,x,6.95,z<16?z+4:z-4,gold)
 }
 const diamonds=new T.InstancedMesh(new T.BoxGeometry(.15,.15,.035),gold,48);const q=new T.Quaternion().setFromAxisAngle(new T.Vector3(0,0,1),Math.PI/4);for(let i=0;i<48;i++){matrix.compose(new T.Vector3(-9.4+i*.4,5.6,-18.7),q,new T.Vector3(1,1,1));diamonds.setMatrixAt(i,matrix)}scene.add(diamonds)
 // Stepped coffer and concentric rings form the central ceiling detail.
 for(let i=0;i<3;i++){const s=5.2-i*.7;for(const x of [-s/2,s/2])box(.15,.12,s,x,6.93-i*.13,-1,gold);for(const z of [-1-s/2,-1+s/2])box(s,.12,.15,0,6.93-i*.13,z,gold)}
 for(const z of [-12,-4,4,12]){cylinder(.025,.025,.55,0,6.5,z,gold);cylinder(.5,.36,.16,0,6.16,z,gold);cylinder(.30,.34,.55,0,5.84,z,glow);cylinder(.40,.48,.12,0,5.51,z,gold);for(let i=0;i<6;i++){const a=i*Math.PI/3;box(.035,.6,.035,Math.cos(a)*.32,5.84,z+Math.sin(a)*.32,gold)}}
 box(4,.015,32,0,.018,0,new T.MeshStandardMaterial({color:0x4b242c,roughness:1}))
 for(const x of [-1.9,1.9])box(.025,.012,31.8,x,.03,0,gold)
 for(const z of [-15.85,15.85])box(3.8,.012,.025,0,.03,z,gold)
 for(const z of [-11,1,12]){box(2.4,.18,.85,0,.67,z,wood);box(2.25,.07,.74,0,.79,z,red);for(const x of [-.9,.9])box(.12,.6,.6,x,.3,z,wood)}
 // Fretwork screens flank the entrance without blocking wall exhibits.
 for(const x of [-5.5,5.5]){box(2.5,.15,.4,x,.15,17.5,wood);for(let i=0;i<7;i++)box(.065,2.1,.06,x-1.05+i*.35,1.25,17.5,gold);for(const y of [.3,2.2])box(2.5,.12,.13,x,y,17.5,red)}
 // Educational craft models: not accessioned museum objects or historical reconstructions.
 for(const x of [-3.7,3.7]){box(2.4,.18,1.15,x,.95,4,wood);for(const dx of [-.9,.9])for(const dz of [-.4,.4])box(.1,.85,.1,x+dx,.45,4+dz,wood)}
 for(const x of [-4.55,-2.85])box(.11,1.75,.12,x,1.8,4,gold)
 for(const y of [1.08,2.55])box(1.8,.1,.12,-3.7,y,4,wood)
 const threads=new T.InstancedMesh(new T.BoxGeometry(.009,1.4,.009),new T.MeshStandardMaterial({color:0xd1b88f}),34);for(let i=0;i<34;i++){matrix.makeTranslation(-4.48+i*.047,1.82,4);threads.setMatrixAt(i,matrix)}scene.add(threads)
 box(1.58,.35,.04,-3.7,1.4,4,new T.MeshStandardMaterial({color:0x793d3c}))
 label('织造结构 · 教学示意模型',-3.7,.69,4.62,2.2)
 const cloth=box(1.6,.035,.8,3.7,1.08,4,new T.MeshStandardMaterial({color:0xc0ae8e}));cloth.rotation.z=.08
 for(const dx of [-.88,.88])box(.09,.08,1,3.7+dx,1.12,4,wood)
 for(const dz of [-.5,.5])box(1.85,.08,.09,3.7,1.12,4+dz,wood)
 for(let i=0;i<4;i++){cylinder(.08,.1,.10,3.2+i*.3,1.17,4.25,gold);box(.025,.025,.52,3.2+i*.3,1.16,3.8,wood)}
 label('绷布与工具 · 教学示意模型',3.7,.69,4.62,2.2)
 label('坛 城  ·  M A N D A L A S',0,5.05,-18.70,6)
 scene.add(new T.HemisphereLight(0xffedcf,0x27313c,2.2))
 const light=new T.PointLight(0xffdcaa,100,48,1.5);light.position.set(0,5.4,1);scene.add(light)
 const fill=new T.DirectionalLight(0xffead0,1.4);fill.position.set(0,6,10);scene.add(fill)
}
