import * as T from 'three'
import { WalkControls } from './WalkControls'
import { addCraftStations, crafts, type CraftId } from './crafts'
import { addOrnaments } from './ornaments'
import type { Artwork } from '../types'
import { categories, categoryOf } from '../categories'
import { architecture } from './architecture'
import { createExhibits, textureQueue } from './exhibits'
export function createMuseum(host:HTMLElement, artworks:Artwork[], onSelect:(a:Artwork)=>void,onProgress:(n:number)=>void,onError:(message:string)=>void,onCraft:(id:CraftId)=>void,onArtworkView:(artwork:Artwork)=>void,onOrnament:(index:number)=>void) {
 const scene=new T.Scene();scene.background=new T.Color(0x101c28);scene.fog=new T.Fog(0x101c28,50,100)
 const renderer=new T.WebGLRenderer({antialias:true,powerPreference:'default'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.65));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.15;host.appendChild(renderer.domElement)
 renderer.domElement.setAttribute('aria-label','唐卡三维展厅：WASD行走，拖动转头，滚轮缩放，点击画作或教具查看详情')
 const camera=new T.PerspectiveCamera(64,1,.1,100)
 const controls=new WalkControls(camera,renderer.domElement);controls.enableDamping=true;controls.dampingFactor=.075;controls.minDistance=1.8;controls.maxDistance=36;controls.minPolarAngle=.32;controls.maxPolarAngle=Math.PI*.52;controls.maxAzimuthAngle=Math.PI*.94;controls.minAzimuthAngle=-Math.PI*.94;controls.panSpeed=.65
 architecture(scene);const stations=addCraftStations(scene);const hanging=addOrnaments(scene);const exhibits=createExhibits(scene,artworks)
 // Reuse six spotlights instead of compiling twenty real-time lights.
 const spots=Array.from({length:6},()=>{const l=new T.SpotLight(0xffdeb0,30,8,Math.PI/5,.72,1.5);scene.add(l);return l})
 function relight(){const near=exhibits.filter(e=>e.group.visible).sort((a,b)=>a.target.distanceToSquared(camera.position)-b.target.distanceToSquared(camera.position));spots.forEach((light,i)=>{const e=near[i];light.visible=!!e;if(e){light.position.copy(e.group.localToWorld(new T.Vector3(0,2.3,1.5)));light.target=e.frame}})}
 const stopTextures=textureQueue(exhibits,onProgress,onError)
 const homePosition=new T.Vector3(2.5,2.25,16.4),homeTarget=new T.Vector3(0,1.9,-3.5)
 camera.position.copy(homePosition);controls.target.copy(homeTarget);controls.update()
 let animation:{start:number;from:T.Vector3;to:T.Vector3;targetFrom:T.Vector3;targetTo:T.Vector3}|null=null
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches
 function move(to:T.Vector3,target:T.Vector3){controls.enableDamping=false;controls.update();animation={start:performance.now(),from:camera.position.clone(),to,targetFrom:controls.target.clone(),targetTo:target};if(reduced){camera.position.copy(to);controls.target.copy(target);animation=null;controls.enableDamping=true;controls.update()}}
 function select(id:string){const e=exhibits.find(e=>e.artwork.id===id);if(!e)return;exhibits.forEach(x=>(x.frame.material as T.MeshStandardMaterial).emissive.set(x===e?0x77501b:0));move(e.focus,e.target);onSelect(e.artwork)}
 function clear(){exhibits.forEach(x=>(x.frame.material as T.MeshStandardMaterial).emissive.set(0))}
 function focusCraft(id:CraftId){
  const craft=crafts.find(item=>item.id===id)
  if(!craft)return
  const {x,z}=craft
  camera.fov=61;camera.updateProjectionMatrix()
  move(new T.Vector3(x,2.18,z+3.55),new T.Vector3(x,1.76,z))
 }
 const raycaster=new T.Raycaster();const pointer=new T.Vector2()
 let pendingArtwork:{id:string;x:number;y:number;timer:number}|null=null
 function clearPendingArtwork(){
  if(pendingArtwork)window.clearTimeout(pendingArtwork.timer)
  pendingArtwork=null
 }
 function pick(e:PointerEvent){
  const rect=renderer.domElement.getBoundingClientRect()
  pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2)
  raycaster.setFromCamera(pointer,camera)
  return raycaster.intersectObjects([...stations,...hanging,...exhibits.filter(item=>item.group.visible).map(item=>item.image)],true)[0]?.object
 }
 let down:{x:number;y:number;id:number}|null=null;let dragged=false;let activePointers=new Set<number>()
 function pointerDown(e:PointerEvent){activePointers.add(e.pointerId);if(activePointers.size>1)dragged=true;if(e.button===0&&activePointers.size===1){down={x:e.clientX,y:e.clientY,id:e.pointerId};dragged=false}}
 function pointerMove(e:PointerEvent){
  if(down){if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>6)dragged=true;return}
  renderer.domElement.style.cursor=pick(e)?'pointer':'grab'
 }
 function pointerUp(e:PointerEvent){
  activePointers.delete(e.pointerId)
  if(!down||e.pointerId!==down.id)return
  const click=!dragged&&e.button===0
  down=null
  if(!click)return
  const hit=pick(e)
  if(!hit)return
  const {craftId,ornament,id}=hit.userData
  if(typeof ornament==='number'){clearPendingArtwork();onOrnament(ornament);return}
  if(craftId){clearPendingArtwork();onCraft(craftId);return}
  if(typeof id!=='string')return
  if(e.pointerType==='touch'){select(id);return}
  if(pendingArtwork?.id===id&&Math.hypot(e.clientX-pendingArtwork.x,e.clientY-pendingArtwork.y)<25){
   clearPendingArtwork()
   const exhibit=exhibits.find(item=>item.artwork.id===id)
   if(exhibit)onArtworkView(exhibit.artwork)
   return
  }
  clearPendingArtwork()
  pendingArtwork={id,x:e.clientX,y:e.clientY,timer:window.setTimeout(()=>{
   pendingArtwork=null
   select(id)
  },360)}
 }
 function cancel(){down=null;activePointers.clear();dragged=true}
 function start(){animation=null;controls.enableDamping=true}
 controls.addEventListener('start',start)
 const canvas=renderer.domElement;canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',cancel)
 function resize(){const {width,height}=host.getBoundingClientRect();if(!width||!height)return;camera.aspect=width/height;camera.updateProjectionMatrix();renderer.setSize(width,height)}
 const observer=new ResizeObserver(resize);observer.observe(host);resize()
 let raf=0,disposed=false,lastLight=0
 function render(now:number){if(disposed)return;if(animation){const p=Math.min((now-animation.start)/850,1),t=p*p*(3-2*p);camera.position.lerpVectors(animation.from,animation.to,t);controls.target.lerpVectors(animation.targetFrom,animation.targetTo,t);if(p===1){animation=null;controls.enableDamping=true}}controls.update();if(now-lastLight>250){relight();lastLight=now}renderer.render(scene,camera);raf=requestAnimationFrame(render)}
 raf=requestAnimationFrame(render)
 function zoom(factor:number){animation=null;controls.zoom(factor)}
 function dispose(){clearPendingArtwork();disposed=true;cancelAnimationFrame(raf);stopTextures();observer.disconnect();controls.removeEventListener('start',start);controls.dispose();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',cancel);const textures=new Set<T.Texture>();const materials=new Set<T.Material>();scene.traverse(o=>{if(o instanceof T.Mesh){o.geometry.dispose();if(o instanceof T.InstancedMesh)o.dispose();for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if('map'in m&&m.map)textures.add(m.map as T.Texture)}}});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());renderer.dispose();canvas.remove()}
 function filter(category:string){clear();if(category==='all'){camera.fov=64;camera.updateProjectionMatrix()}exhibits.forEach(e=>e.group.visible=category==='all'||categoryOf(e.artwork.category)===category);const bay=categories.find(c=>c.id===category);if(bay){if(category==='MANDALA')move(new T.Vector3(0,4,bay.center+9),new T.Vector3(0,2.8,bay.center));else {const first=exhibits.find(e=>e.group.visible)!;move(first.focus,first.target)}}else move(homePosition,homeTarget);relight()}
 return {focusCraft,setPaused(value:boolean){clearPendingArtwork();animation=null;controls.setPaused(value)},select,clear,filter,reset(){clear();move(homePosition,homeTarget)},zoom,dispose}
}
