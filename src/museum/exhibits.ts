import * as T from 'three'
import type { Artwork } from '../types'
import { assetUrl } from '../types'
export interface Exhibit { artwork: Artwork; group: T.Group; image: T.Mesh<T.PlaneGeometry,T.MeshBasicMaterial>; frame: T.Mesh; focus: T.Vector3; target:T.Vector3 }
export function createExhibits(scene:T.Scene, artworks:Artwork[]):Exhibit[] {
 return artworks.map((artwork,i)=>{
  const group=new T.Group(); const side=i<3?-1:i<6?1:0
  if(side){group.position.set(side*7.6,2.75,6-(i%3)*6);group.rotation.y=-side*Math.PI/2}
  else group.position.set(i===6?-2.5:2.5,2.75,-10.15)
  const ratio=artwork.width/artwork.height || .75
  const h=Math.min(2.75,2.7/ratio),w=h*ratio
  const frame=new T.Mesh(new T.BoxGeometry(w+.24,h+.24,.16),new T.MeshStandardMaterial({color:0xae8550,metalness:.65,roughness:.36}))
  group.add(frame)
  const mount=new T.Mesh(new T.PlaneGeometry(w+.10,h+.10),new T.MeshStandardMaterial({color:0x351c18}));mount.position.z=.087;group.add(mount)
  const image=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({color:0x34434a}));image.position.z=.095;image.userData.id=artwork.id;group.add(image)
  const canvas=document.createElement('canvas');canvas.width=1024;canvas.height=160
  const ctx=canvas.getContext('2d')!;ctx.fillStyle='#182630';ctx.fillRect(0,0,1024,160);ctx.fillStyle='#e5d1ad';ctx.font='34px serif';ctx.fillText(`${String(i+1).padStart(2,'0')}  ${artwork.title}`,30,60,960);ctx.font='23px sans-serif';ctx.fillStyle='#b5b5b0';ctx.fillText(artwork.period,30,108,960)
  const label=new T.Mesh(new T.PlaneGeometry(2.4,.375),new T.MeshBasicMaterial({map:new T.CanvasTexture(canvas)}));label.position.set(0,-h/2-.43,.10);group.add(label)
  const spot=new T.SpotLight(0xffdeb0,28,8,Math.PI/5,.72,1.5);spot.position.set(0,2.8,1.8);spot.target=frame;group.add(spot)
  const lamp=new T.Mesh(new T.CylinderGeometry(.07,.1,.25,10),new T.MeshStandardMaterial({color:0x8c704a}));lamp.position.copy(spot.position);lamp.rotation.x=.6;group.add(lamp)
  scene.add(group);group.updateMatrixWorld(true)
  return {artwork,group,image,frame,focus:group.localToWorld(new T.Vector3(0,.05,4.7)),target:group.localToWorld(new T.Vector3(0,0,0))}
 })
}
export function textureQueue(exhibits:Exhibit[], onProgress:(n:number)=>void, onError:(title:string)=>void) {
 let disposed=false; let count=0
 const loader=new T.TextureLoader()
 // Two simultaneous decodes keep first paint responsive; remaining works load progressively.
 const pending=[...exhibits.slice(6),...exhibits.slice(0,6)]
 async function worker(){while(pending.length&&!disposed){const e=pending.shift()!;try{const t=await loader.loadAsync(assetUrl(e.artwork.image));if(disposed){t.dispose();return}t.colorSpace=T.SRGBColorSpace;t.anisotropy=4;e.image.material.map=t;e.image.material.color.set(0xffffff);e.image.material.needsUpdate=true}catch{if(!disposed)onError(e.artwork.title)}if(!disposed)onProgress(++count)}}
 void worker();void worker();return ()=>{disposed=true}
}
