import * as T from 'three'

/** Ground-plane movement with a mouse look target that travels with the visitor. */
export class WalkControls extends T.EventDispatcher<{start:{}}> {
 target=new T.Vector3()
 enabled=true
 enableDamping=true
 dampingFactor=.075
 minDistance=1.8
 maxDistance=36
 minPolarAngle=.12
 maxPolarAngle=Math.PI-.12
 maxAzimuthAngle=Infinity
 minAzimuthAngle=-Infinity
 panSpeed=.65
 private keys=new Set<string>()
 private velocity=new T.Vector3()
 private last=performance.now()
 private pointers=new Map<number,{x:number;y:number}>()
 private mouseButton=0
 private stopped=false
 private lastDistance=0
 private forward=new T.Vector3()
 private side=new T.Vector3()
 constructor(private camera:T.PerspectiveCamera,private element:HTMLElement){
  super()
  element.style.touchAction='none';element.tabIndex=0
  element.addEventListener('pointerdown',this.down)
  element.addEventListener('pointermove',this.move)
  element.addEventListener('pointerup',this.up)
  element.addEventListener('pointercancel',this.up)
  element.addEventListener('wheel',this.wheel,{passive:false})
  element.addEventListener('contextmenu',this.context)
  window.addEventListener('keydown',this.keyDown)
  window.addEventListener('keyup',this.keyUp)
  window.addEventListener('blur',this.release)
  document.addEventListener('visibilitychange',this.release)
 }
 private inputFocused(){
  const e=document.activeElement
  return !!document.querySelector('dialog[open]') || e instanceof HTMLElement && (e.isContentEditable || /^(INPUT|SELECT|TEXTAREA|BUTTON)$/.test(e.tagName))
 }
 private keyDown=(e:KeyboardEvent)=>{
  if(!this.enabled||this.inputFocused()||e.ctrlKey||e.metaKey||e.altKey||!['KeyW','KeyA','KeyS','KeyD'].includes(e.code))return
  e.preventDefault();if(!this.keys.has(e.code))this.dispatchEvent({type:'start'})
  this.keys.add(e.code)
 }
 private keyUp=(e:KeyboardEvent)=>{this.keys.delete(e.code)}
 private release=()=>{this.keys.clear();this.velocity.set(0,0,0);this.pointers.clear()}
 private context=(e:Event)=>e.preventDefault()
 private down=(e:PointerEvent)=>{
  if(!this.enabled)return
  this.element.focus({preventScroll:true});this.mouseButton=e.button
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY});this.element.setPointerCapture(e.pointerId)
  this.lastDistance=0;this.dispatchEvent({type:'start'})
 }
 private move=(e:PointerEvent)=>{
  const prior=this.pointers.get(e.pointerId);if(!prior||!this.enabled)return
  const dx=e.clientX-prior.x,dy=e.clientY-prior.y
  this.pointers.set(e.pointerId,{x:e.clientX,y:e.clientY})
  if(this.pointers.size===2){
   const [a,b]=Array.from(this.pointers.values()),distance=Math.hypot(a.x-b.x,a.y-b.y)
   if(this.lastDistance>0)this.zoom(Math.pow(this.lastDistance/distance,.45))
   this.lastDistance=distance;return
  }
  if(this.mouseButton===2){
   this.direction();this.translate(this.side.clone().multiplyScalar(-dx*.006).addScaledVector(this.forward,dy*.006));return
  }
  const direction=this.target.clone().sub(this.camera.position)
  const sphere=new T.Spherical().setFromVector3(direction)
  sphere.theta-=dx*.003;sphere.phi=T.MathUtils.clamp(sphere.phi+dy*.003,.12,Math.PI-.12)
  sphere.radius=Math.max(1,direction.length());this.target.copy(this.camera.position).add(new T.Vector3().setFromSpherical(sphere))
 }
 private up=(e:PointerEvent)=>{this.pointers.delete(e.pointerId);this.lastDistance=0}
 private wheel=(e:WheelEvent)=>{
  if(!this.enabled)return;e.preventDefault();this.dispatchEvent({type:'start'});this.zoom(Math.exp(e.deltaY*.0006))
 }
 zoom(factor:number){this.camera.fov=T.MathUtils.clamp(this.camera.fov*factor,34,78);this.camera.updateProjectionMatrix()}
 setPaused(value:boolean){this.enabled=!value;this.release()}
 private direction(){
  this.forward.copy(this.target).sub(this.camera.position).setY(0).normalize()
  this.side.crossVectors(this.forward,this.camera.up).normalize()
 }
 private valid(x:number,z:number){
  if(x< -8.85||x>8.85||z< -18||z>18.5)return false
  for(const [cx,cz] of [[-3.7,4],[3.7,4],[0,12],[0,1],[0,-11]])
   if(Math.abs(x-cx)<1.53&&Math.abs(z-cz)<.96)return false
  for(const cx of [-5.5,5.5])if(Math.abs(x-cx)<1.55&&Math.abs(z-17.5)<.5)return false
  return true
 }
 private translate(delta:T.Vector3){
  const before=this.camera.position.clone(),p=this.camera.position
  if(this.valid(p.x+delta.x,p.z))p.x+=delta.x
  if(this.valid(p.x,p.z+delta.z))p.z+=delta.z
  this.target.add(p.clone().sub(before))
 }
 update(){
  const now=performance.now(),dt=Math.min((now-this.last)/1000,.05);this.last=now
  if(!this.enabled||this.inputFocused()){this.keys.clear();this.velocity.set(0,0,0)}
  this.direction()
  const wish=this.forward.clone().multiplyScalar(Number(this.keys.has('KeyW'))-Number(this.keys.has('KeyS'))).addScaledVector(this.side,Number(this.keys.has('KeyD'))-Number(this.keys.has('KeyA')))
  if(wish.lengthSq()>0)wish.normalize().multiplyScalar(3.1)
  this.velocity.lerp(wish,1-Math.exp(-dt*13))
  if(this.enabled&&this.velocity.lengthSq()>.0001)this.translate(this.velocity.clone().multiplyScalar(dt))
  this.camera.lookAt(this.target)
 }
 dispose(){
  if(this.stopped)return;this.stopped=true;this.release()
  this.element.removeEventListener('pointerdown',this.down);this.element.removeEventListener('pointermove',this.move);this.element.removeEventListener('pointerup',this.up);this.element.removeEventListener('pointercancel',this.up)
  this.element.removeEventListener('wheel',this.wheel);this.element.removeEventListener('contextmenu',this.context)
  window.removeEventListener('keydown',this.keyDown);window.removeEventListener('keyup',this.keyUp);window.removeEventListener('blur',this.release);document.removeEventListener('visibilitychange',this.release)
 }
}
