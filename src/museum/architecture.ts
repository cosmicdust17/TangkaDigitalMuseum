import * as T from 'three'
export function architecture(scene: T.Scene) {
 const navy = new T.MeshStandardMaterial({color:0x1c2b35,roughness:.86,side:T.DoubleSide})
 const wood = new T.MeshStandardMaterial({color:0x37251e,roughness:.62})
 const gold = new T.MeshStandardMaterial({color:0x9d7950,metalness:.6,roughness:.4})
 const red = new T.MeshStandardMaterial({color:0x55272a,roughness:.85})
 function box(w:number,h:number,d:number,x:number,y:number,z:number,mat:T.Material) {
  const m=new T.Mesh(new T.BoxGeometry(w,h,d),mat);m.position.set(x,y,z);scene.add(m);return m
 }
 box(16,.15,21,0,-.09,0,wood)
 // Parallel planks and brass inlay create depth without large external textures.
 for(let x=-7.8;x<8;x+=.55)box(.012,.008,21,x,.001,0,new T.MeshStandardMaterial({color:0x211b18}))
 for(const x of [-7.82,7.82]){box(.3,6.2,21,x,3,0,navy);box(.035,.025,20,x*.95,.012,0,gold)}
 box(16,6.2,.3,0,3,-10.4,navy)
 box(16,.16,21,0,6.15,0,navy)
 // An open doorway keeps the entrance visible from the initial interior overview.
 for(const x of [-5.5,5.5])box(5,6.2,.25,x,3,10.35,navy)
 box(6,1.1,.3,0,5.65,10.35,red)
 for(const x of [-3,3])box(.16,5.3,.35,x,2.65,10.2,gold)
 for(const y of [.35,4.75,5.05]) {
  box(15.5,.045,.06,0,y,-10.2,gold)
  for(const x of [-7.63,7.63])box(.05,.045,20.5,x,y,0,gold)
 }
 for(const z of [-9,-3,3,9]) {
  for(const x of [-7.4,7.4]){box(.32,5.9,.32,x,3,z,red);box(.48,.16,.48,x,4.95,z,gold)}
  box(15,.23,.24,0,5.9,z,wood)
 }
 // Restrained geometric frieze; decorative design, no claimed historical attribution.
 for(let x=-7;x<7.1;x+=.7){const m=box(.17,.17,.035,x,4.9,-10.16,gold);m.rotation.z=Math.PI/4}
 for(const x of [-7.6,7.6])for(let z=-9.5;z<10;z+=.7){const m=box(.035,.17,.17,x,4.9,z,gold);m.rotation.x=Math.PI/4}
 const rug = new T.MeshStandardMaterial({color:0x462327,roughness:1})
 box(4,.018,11,0,.015,0,rug)
 for(const x of [-1.9,1.9])box(.025,.009,10.8,x,.03,0,gold)
 for(const z of [-5.35,5.35])box(3.8,.009,.025,0,.03,z,gold)
 // Low central bench leaves the sight lines unobstructed.
 box(2.6,.18,1,0,.65,2,wood)
 for(const x of [-1,1])box(.12,.6,.7,x,.3,2,wood)
 scene.add(new T.HemisphereLight(0xf4e4cb,0x1b1c26,2.0))
 const fill=new T.PointLight(0xffe0ad,55,26,2);fill.position.set(0,5,2);scene.add(fill)
 for(const z of [-6,1,7]){const m=new T.Mesh(new T.BoxGeometry(2,.035,.35),new T.MeshBasicMaterial({color:0xffe4ac}));m.position.set(0,6.04,z);scene.add(m)}
}
