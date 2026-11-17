<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import * as T from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { createOrnament, ornaments } from '../museum/ornaments'
import { assetUrl, type Artwork } from '../types'

const props=defineProps<{ artwork?:Artwork; ornament?:number }>()
const emit=defineEmits<{ close:[] }>()
const host=ref<HTMLElement>()
const dialog=ref<HTMLDialogElement>()
const fault=ref('')
const viewerReady=ref(false)
const item=computed(()=>props.ornament===undefined?undefined:ornaments[props.ornament])
let renderer:T.WebGLRenderer|undefined, controls:OrbitControls|undefined, observer:ResizeObserver|undefined
let frame=0, stopped=false
const scene=new T.Scene()
const focus=document.activeElement as HTMLElement|null
const ownedTextures=new Set<T.Texture>()

function resetView(){
 if(!controls)return
 const damping=controls.enableDamping
 // Clear leftover rotation so the view stays at the saved position.
 controls.enableDamping=false
 controls.update()
 controls.reset()
 controls.enableDamping=damping
}

onMounted(()=>{
 dialog.value!.showModal()
 try{
  scene.background=new T.Color(0x14262c)
  renderer=new T.WebGLRenderer({antialias:true})
  renderer.setPixelRatio(Math.min(devicePixelRatio,1.8))
  renderer.outputColorSpace=T.SRGBColorSpace
  renderer.toneMapping=T.ACESFilmicToneMapping
  host.value!.appendChild(renderer.domElement)
  const camera=new T.PerspectiveCamera(35,1,.05,30)
  camera.position.set(props.artwork ? .65 : 1.12,.45,props.artwork?4.6:2.65)
  controls=new OrbitControls(camera,renderer.domElement)
  controls.enableDamping=true;controls.enablePan=false
  controls.zoomToCursor=Boolean(props.artwork)
  controls.screenSpacePanning=true
  controls.minDistance=props.artwork?1.1:1;controls.maxDistance=7
  controls.saveState()
  scene.add(new T.HemisphereLight(0xe0ecff,0x82704d,2.1))
  const key=new T.DirectionalLight(0xffdeaf,3);key.position.set(3,4,4);scene.add(key)
  const rim=new T.DirectionalLight(0x90cdda,1.8);rim.position.set(-3,1,-4);scene.add(rim)
  if(props.artwork){
   const art=props.artwork, width=1.92*Math.min(1,art.width/art.height),height=1.92*Math.min(1,art.height/art.width)
   const frame=new T.Mesh(new T.BoxGeometry(width+.14,height+.14,.13),new T.MeshStandardMaterial({color:0x8f6240,roughness:.64}))
   const backing=new T.Mesh(new T.BoxGeometry(width+.05,height+.05,.022),new T.MeshStandardMaterial({color:0x351f1c,roughness:.8}));backing.position.z=.067
   const image=new T.Mesh(new T.PlaneGeometry(width,height),new T.MeshBasicMaterial({color:0x806a56}));image.position.z=.08
   scene.add(frame,backing,image)
   const loader=new T.TextureLoader()
   const apply=(texture:T.Texture)=>{if(stopped){texture.dispose();return}ownedTextures.add(texture);texture.colorSpace=T.SRGBColorSpace;texture.anisotropy=4;image.material.color.set(0xffffff);image.material.map=texture;image.material.needsUpdate=true}
   loader.load(assetUrl(art.image_hd||art.image),apply,undefined,()=>{if(!stopped&&art.image_hd)loader.load(assetUrl(art.image),apply,undefined,()=>fault.value='画作图像暂未载入。');else if(!stopped)fault.value='画作图像暂未载入。'})
  }else scene.add(createOrnament(props.ornament!))
  observer=new ResizeObserver(()=>{
   const {clientWidth:w,clientHeight:h}=host.value!;if(!w||!h)return
   renderer!.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix()
  })
  observer.observe(host.value!)
  const render=()=>{controls!.update();renderer!.render(scene,camera);frame=requestAnimationFrame(render)}
  frame=requestAnimationFrame(render)
  viewerReady.value=true
 }catch{fault.value='当前浏览器无法打开三维鉴赏。'}
})
onBeforeUnmount(()=>{
 stopped=true;cancelAnimationFrame(frame);observer?.disconnect();controls?.dispose()
 scene.traverse(obj=>{if(obj instanceof T.Mesh){obj.geometry.dispose();(Array.isArray(obj.material)?obj.material:[obj.material]).forEach(m=>m.dispose())}})
 ownedTextures.forEach(texture=>texture.dispose());renderer?.dispose();dialog.value?.close();focus?.focus()
})
</script>

<template>
 <dialog ref="dialog" class="object-viewer" aria-labelledby="object-title" @cancel.prevent="emit('close')" @keydown.stop>
  <div class="object-layout">
   <div class="object-image">
    <div ref="host" class="object-canvas"></div>
    <button v-if="artwork" type="button" class="object-reset" :disabled="!viewerReady" @click="resetView">↺ 重置视角</button>
    <span>{{ artwork ? '拖动转面 · 滚轮放大指向的细节' : '拖动转面 · 滚轮近看' }}</span>
    <p v-if="fault" role="status">{{ fault }}</p>
   </div>
   <section class="object-copy">
    <button class="object-close" autofocus @click="emit('close')">返回展厅 ×</button>
    <p class="object-label">{{ artwork ? '画作 · 三维展架' : '八吉祥 · 当代文创' }}</p>
    <h2 id="object-title">{{ artwork?.title || item?.name }}</h2>
    <template v-if="artwork">
     <p class="object-sub">{{ artwork.period }} · {{ artwork.material }}</p>
     <p>{{ artwork.looking_guide || artwork.description }}</p>
     <p class="object-note">馆藏图像呈现在可旋转的数字展架上。</p>
     <a :href="artwork.source_url" target="_blank" rel="noreferrer">大都会艺术博物馆 · 馆藏档案 ↗</a>
    </template>
    <template v-else-if="item">
     <p class="object-sub">{{ item.motif }} · {{ item.meaning }}</p>
     <p>{{ item.story }}</p>
     <p class="object-note">{{ item.design }}</p>
     <a :href="item.source" target="_blank" rel="noreferrer">纹样出处 · 大都会艺术博物馆《八吉祥经夹》↗</a>
    </template>
   </section>
  </div>
 </dialog>
</template>

<style scoped>
.object-viewer{padding:0;background:#122029;color:#eadfce;border:1px solid #887454;width:min(1180px,94vw);max-width:94vw;max-height:93dvh}
.object-viewer::backdrop{background:#0a141bf0}
.object-layout{display:grid;grid-template-columns:1.4fr 1fr;min-height:min(660px,85dvh)}
.object-image{position:relative;background:#14262c;min-height:370px}
.object-canvas{position:absolute;inset:0}.object-canvas :deep(canvas){display:block;touch-action:none}
.object-image span,.object-image p{position:absolute;bottom:20px;left:25px;color:#bacccb;font-size:13px;pointer-events:none}
.object-reset{position:absolute;top:14px;right:14px;min-height:44px;padding:0 12px;border:1px solid #8b7552;border-radius:4px;background:#122029ed;color:#f2d4a0;font-size:13px}.object-reset:hover{background:#293b41;color:#ffe1af}
.object-copy{padding:clamp(24px,4vw,54px);align-self:center}
.object-close{display:block;margin-left:auto;min-height:44px;color:#e0c58f}
.object-label,.object-sub{color:#dec18a}.object-label{font-size:12px;letter-spacing:.18em}
.object-copy h2{font:normal clamp(32px,4vw,55px)/1.3 SimSun,serif;margin:15px 0 25px}
.object-copy p{line-height:1.85}.object-note{border-top:1px solid #9c865947;padding-top:18px;color:#aebec0;font-size:14px}
.object-copy a{display:inline-block;color:#dfbf83;text-underline-offset:5px;margin-top:12px;font-size:13px}
@media(max-width:700px){.object-layout{grid-template-columns:1fr}.object-image{min-height:42dvh}.object-copy{padding:20px}.object-close{margin:0}}
</style>
