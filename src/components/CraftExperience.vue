<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { crafts, createCraftModel, type CraftId } from '../museum/crafts'
import { craftPath, lessons } from '../museum/craftLessons'

const props=defineProps<{id:CraftId}>()
const emit=defineEmits<{close:[]}>()
const craft=crafts.find(c=>c.id===props.id)!
const lesson=lessons[props.id]
const host=ref<HTMLElement>(), dialog=ref<HTMLDialogElement>(), guide=ref<HTMLCanvasElement>()
const step=ref(0), fault=ref(false)
const focus=document.activeElement as HTMLElement|null
const scene=new T.Scene()
const camera=new T.PerspectiveCamera(36,1,.05,30)
let renderer:T.WebGLRenderer|undefined, controls:OrbitControls|undefined, observer:ResizeObserver|undefined
let model:ReturnType<typeof createCraftModel>
let path:T.Vector3[]=[], projected:T.Vector2[]=[], frame=0
let active:number|null=null, segment=0, fraction=0, shown=0
let width=1,height=1
const finished=()=>step.value>=lesson.steps

function beginPath(){
 segment=0;fraction=0
 model.group.updateMatrixWorld(true)
 path=finished()?[]:craftPath(props.id,step.value,model.group)
}
function point(e:PointerEvent){
 const rect=host.value!.getBoundingClientRect()
 return new T.Vector2(e.clientX-rect.left,e.clientY-rect.top)
}
function currentPoint(){
 const a=projected[segment],b=projected[segment+1]
 return a&&b?a.clone().lerp(b,fraction):undefined
}
function cursorNearStart(pos:T.Vector2){return (currentPoint()?.distanceTo(pos)??Infinity)<28}
function down(e:PointerEvent){
 if(e.button!==0 || active!==null || finished() || !cursorNearStart(point(e)))return
 e.preventDefault()
 active=e.pointerId;controls!.enabled=false
 renderer!.domElement.setPointerCapture(e.pointerId)
}
function move(e:PointerEvent){
 const pos=point(e)
 if(active!==e.pointerId){
  renderer!.domElement.style.cursor=!finished()&&cursorNearStart(pos)?'grab':'move';return
 }
 renderer!.domElement.style.cursor='grabbing'
 for(let advance=0;advance<5;advance++){
  const a=projected[segment],b=projected[segment+1]
  if(!a||!b)return
  const delta=b.clone().sub(a)
  const distance=delta.length()
  if(distance<.01)return
  const local=pos.clone().sub(a)
  const t=local.dot(delta)/delta.lengthSq()
  if(t<-.45||local.clone().addScaledVector(delta,-t).length()>Math.max(16,Math.min(30,distance*.65)))return
  fraction=Math.max(fraction,Math.min(1,Math.max(0,t)))
  if(t<.79)return
  segment++;fraction=0
  if(segment>=projected.length-1){
   step.value++;end(e);beginPath();return
  }
 }
}
function end(e?:PointerEvent){
 if(e && e.pointerId!==active)return
 active=null
 if(controls)controls.enabled=true
 if(renderer)renderer.domElement.style.cursor='move'
}
function reset(){end();step.value=0;shown=0;beginPath();model.update(0)}
function drawGuide(now:number){
 const ctx=guide.value!.getContext('2d')!
 ctx.clearRect(0,0,width,height)
 projected=path.map(world=>{
  const p=world.clone().project(camera)
  return new T.Vector2((p.x+1)*width/2,(1-p.y)*height/2)
 })
 if(projected.length<2)return
 const current=currentPoint()!
 const stroke=(points:T.Vector2[],color:string,dash:number[],lineWidth:number)=>{
  ctx.beginPath();ctx.setLineDash(dash);ctx.strokeStyle=color;ctx.lineWidth=lineWidth;ctx.lineCap='round'
  points.forEach((p,i)=>i?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y));ctx.stroke()
 }
 stroke(projected,'#0b1519c9',[],5)
 stroke(projected,'#f0d29c',[5,7],1.8)
 if(active!==null)stroke([...projected.slice(0,segment+1),current],'#ffce77',[],3)
 const tip=projected.at(-1)!, prev=projected.at(-2)!
 const angle=Math.atan2(tip.y-prev.y,tip.x-prev.x)
 if(props.id!=='drawing')stroke([new T.Vector2(tip.x-10*Math.cos(angle-.55),tip.y-10*Math.sin(angle-.55)),tip,new T.Vector2(tip.x-10*Math.cos(angle+.55),tip.y-10*Math.sin(angle+.55))],'#f5d497',[],2)
 ctx.setLineDash([])
 const pulse=matchMedia('(prefers-reduced-motion: reduce)').matches?0:(1+Math.sin(now*.005))*3
 const dot=current
 ctx.beginPath();ctx.arc(dot.x,dot.y,12+pulse,0,Math.PI*2);ctx.strokeStyle='#f6dba1a8';ctx.lineWidth=1.3;ctx.stroke()
 ctx.beginPath();ctx.arc(dot.x,dot.y,5,0,Math.PI*2);ctx.fillStyle='#ffd88b';ctx.fill()
}
onMounted(()=>{
 dialog.value!.showModal()
 try{
  scene.background=new T.Color('#172b31')
  renderer=new T.WebGLRenderer({antialias:true});renderer.setPixelRatio(Math.min(devicePixelRatio,2));renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping
  host.value!.appendChild(renderer.domElement);renderer.domElement.setAttribute('aria-label','可操作工艺模型')
  if(props.id==='pigment')camera.position.set(1.7,2.8,3)
  else camera.position.set(1.28,1.83,4.55)
  controls=new OrbitControls(camera,renderer.domElement);controls.target.set(0,props.id==='pigment'?.18:.76,0);controls.enableDamping=true;controls.minDistance=1.5;controls.maxDistance=7;controls.enablePan=false
  scene.add(new T.HemisphereLight('#e2f0ff','#72604d',2.35))
  const key=new T.DirectionalLight('#ffddb2',3);key.position.set(3,5,4);scene.add(key)
  const fill=new T.DirectionalLight('#a4c8e3',1.4);fill.position.set(-3,2,-2);scene.add(fill)
  model=createCraftModel(props.id);scene.add(model.group);model.update(0);beginPath()
  const base=new T.Mesh(new T.CylinderGeometry(1.54,1.6,.093,64),new T.MeshStandardMaterial({color:'#294347',roughness:.71}));base.position.y=-.18;scene.add(base)
  const surface=renderer.domElement
  surface.addEventListener('pointerdown',down,true);surface.addEventListener('pointermove',move,true)
  surface.addEventListener('pointerup',end);surface.addEventListener('pointercancel',end);surface.addEventListener('lostpointercapture',end)
  observer=new ResizeObserver(()=>{
   const r=host.value!.getBoundingClientRect();if(!r.width||!r.height)return
   width=r.width;height=r.height;renderer!.setSize(width,height);camera.aspect=width/height;camera.updateProjectionMatrix()
   const dpr=Math.min(devicePixelRatio,2)
   guide.value!.width=Math.round(width*dpr);guide.value!.height=Math.round(height*dpr)
   guide.value!.getContext('2d')!.setTransform(dpr,0,0,dpr,0,0)
  });observer.observe(host.value!)
  const render=(now:number)=>{
   const partial=path.length>1?(segment+fraction)/(path.length-1):0
   const goal=Math.min(1,(step.value+partial)/lesson.steps)
   if(Math.abs(shown-goal)>.001){shown+=(goal-shown)*.28;model.update(shown)}
   controls!.update();renderer!.render(scene,camera);drawGuide(now)
   frame=requestAnimationFrame(render)
  }
  frame=requestAnimationFrame(render)
 }catch{fault.value=true}
})
onBeforeUnmount(()=>{
 cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose()
 const textures=new Set<T.Texture>(),materials=new Set<T.Material>(),geometries=new Set<T.BufferGeometry>()
 scene.traverse(o=>{if(o instanceof T.Mesh){geometries.add(o.geometry);for(const m of Array.isArray(o.material)?o.material:[o.material]){materials.add(m);if('map' in m&&m.map)textures.add(m.map as T.Texture)}}})
 geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(t=>t.dispose());renderer?.dispose();dialog.value?.close();focus?.focus()
})
</script>
<template>
 <dialog ref="dialog" class="lesson-dialog" aria-labelledby="lesson-title" @cancel.prevent="emit('close')" @keydown.stop>
  <div class="lesson-layout">
   <div class="lesson-stage">
    <div ref="host" class="lesson-canvas"></div><canvas ref="guide" aria-hidden="true" class="lesson-guide"></canvas>
    <div class="lesson-head"><span>{{ lesson.tag }}</span><h2 id="lesson-title">{{ craft.title }}</h2></div>
    <div class="lesson-cue" aria-live="polite"><i></i>{{ fault?'三维场景暂时无法打开':finished()?lesson.done:lesson.hint }}</div>
    <div class="lesson-bottom"><span class="lesson-dots" aria-hidden="true"><i v-for="n in lesson.steps" :key="n" :class="{lit:n<=step}"></i></span><button v-if="step>0&&!fault" @click="reset">重新体验 ↺</button></div>
   </div>
   <section class="lesson-editorial">
    <button class="lesson-exit" autofocus @click="emit('close')">返回展厅 ×</button>
    <div class="lesson-text">
     <p class="lesson-kicker">{{ lesson.tag }}</p><h3>{{ lesson.title }}</h3><p class="lesson-lede">{{ lesson.body }}</p>
     <div class="lesson-observe"><b>看这个细节</b><p>{{ lesson.detail }}</p></div>
     <a :href="craft.source" target="_blank" rel="noreferrer">查看工艺资料 ↗</a>
    </div>
   </section>
  </div>
 </dialog>
</template>
<style scoped>
.lesson-dialog{width:min(1430px,96vw);max-width:96vw;max-height:94dvh;padding:0;border:1px solid #b39562;background:#182b32;color:#f0e4cc;overflow:auto;border-radius:8px}
.lesson-dialog::backdrop{background:#08121ae8;backdrop-filter:blur(6px)}
.lesson-layout{display:grid;grid-template-columns:minmax(0,1.8fr) minmax(285px,1fr);min-height:min(800px,90dvh)}
.lesson-stage{position:relative;min-height:480px;overflow:hidden}.lesson-canvas,.lesson-guide{position:absolute;inset:0;width:100%;height:100%}.lesson-canvas :deep(canvas){display:block;touch-action:none}.lesson-guide{pointer-events:none}
.lesson-head{position:absolute;top:28px;left:32px;pointer-events:none}.lesson-head span,.lesson-kicker{font-size:12px;letter-spacing:.15em;color:#e1bd7d}.lesson-head h2{font:normal clamp(32px,4vw,58px)/1.2 SimSun,serif;letter-spacing:.09em;margin:12px 0}
.lesson-cue{position:absolute;bottom:68px;left:50%;transform:translateX(-50%);max-width:92%;width:max-content;padding:10px 16px;background:#101d24e8;color:#fae4bc;border:1px solid #c2a56c62;font-size:13px;pointer-events:none;border-radius:4px}
.lesson-cue i{display:inline-block;background:#e9c684;width:7px;height:7px;transform:rotate(45deg);margin-right:9px}
.lesson-bottom{position:absolute;bottom:12px;left:24px;right:20px;display:flex;justify-content:space-between;align-items:center;min-height:38px}.lesson-bottom button,.lesson-exit{min-height:44px;color:#efd5a1}.lesson-dots{display:flex;gap:7px}.lesson-dots i{height:3px;width:23px;background:#a98e533f}.lesson-dots .lit{background:#e0bc77}
.lesson-editorial{position:relative;background:#ede2cb;color:#273438;padding:25px clamp(24px,4vw,58px);display:flex;flex-direction:column;justify-content:center}
.lesson-exit{position:absolute;right:18px;top:12px;color:#3a4241}.lesson-exit:hover{color:#19282e;background:#c7b48f41}
.lesson-text{margin-top:42px}.lesson-kicker{color:#805c34}.lesson-text h3{font:normal clamp(28px,3.3vw,48px)/1.2 SimSun,serif;margin:14px 0 25px}
.lesson-lede{font-size:16px;line-height:1.85}.lesson-observe{border-top:1px solid #9d805873;margin:26px 0 16px;padding-top:15px}.lesson-observe b{font-size:12px;color:#795631}.lesson-observe p{font-size:14px;line-height:1.85;margin:8px 0}.lesson-text a{color:#795631;text-underline-offset:4px;font-size:13px;display:inline-flex;min-height:38px;align-items:center}
@media(max-width:700px){.lesson-layout{grid-template-columns:1fr}.lesson-stage{min-height:54dvh}.lesson-head{top:16px;left:22px}.lesson-editorial{padding:20px}.lesson-cue{bottom:55px}.lesson-text h3{margin:12px 0}}
</style>
