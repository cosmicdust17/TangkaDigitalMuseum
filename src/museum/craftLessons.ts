import * as T from 'three'
import type { CraftId } from './crafts'

export const lessons = {
 loom:{tag:'织物结构',title:'一上一下，线便成布',body:'经线在架上张紧，纬线横向穿行。平纹每隔一根经线翻转一次，相邻两行的次序相反。交点密了，原本容易滑动的纱就彼此约束。',detail:'观察同一根经线。它在第一道纬线前面，在第二道纬线后面。唐卡有布面绘画，也有用织物形成图像的作品，馆藏档案会注明具体材质。',hint:'握住发光的梭头，沿亮线穿到对侧',done:'相邻的纬线走向相反，交点锁住了布面。',steps:4},
 canvas:{tag:'布面绘画',title:'布面稳了，细线才画得住',body:'画师先把布边接在细杆上，再用绳索把细杆牵向外框。四周拉力逐渐平衡，布面才适合画细线。',detail:'绷好之后还要备底。底层能减少布纤维吸收颜色，也让笔尖滑过布面时更稳定。看近处的绳子，它们绕住木框，把拉力传到布边。',hint:'从亮起的布边绳结向外拉',done:'四边拉力趋于平衡，布面逐渐展开。',steps:4},
 drawing:{tag:'画师的工作方法',title:'格线让比例随画幅一起放大',body:'馆方记录的唐卡起稿会用中轴、对角线等辅助线定位。画幅变大时，画师可以用格线保持各部位的相对位置。',detail:'这里用一朵莲花练习沿线定位。画人物时，各部位的比例还要遵循对应的造像规范。',hint:'从金点落笔，沿虚线描出花瓣',done:'几片花瓣共用同一个中心与尺度。',steps:4},
 pigment:{tag:'颜料与肌理',title:'从矿物颗粒到画面上的色层',body:'有些唐卡采用矿物颜料。色料研细后可与黏结材料调合，颜色才能施到备好的布面上。',detail:'观察从粗颗粒到细粉的变化。入画以后，画师还会通过平涂、叠色和线条处理轮廓与明暗。这处以蓝色演示颗粒变化与色样形成。',hint:'握住杵柄，沿研钵内缘绕圈研磨',done:'细粉可以进一步调入黏结材料，用来施色。',steps:3},
 mount:{tag:'看画卷的边缘',title:'画心之外，还有一层织物结构',body:'许多布面唐卡把画心缝接在织物边饰内。装裱既决定画卷挂起来的样子，也为悬挂与收卷提供结构。',detail:'从侧面看，布面、边饰和卷杆各在不同位置。保存时也要注意卷折可能给颜料层和织物带来的损伤。模型放大了层间距离。',hint:'捏住画心亮点，沿引导把结构拉开',done:'从侧面能辨认画心、织物边饰与卷杆。',steps:1}
}

export function craftPath(id:CraftId,step:number,group:T.Group):T.Vector3[]{
 const v=(x:number,y:number,z:number)=>new T.Vector3(x,y,z)
 if(id==='loom'){
  const sign=step%2? -1:1,y=.42+step*.019
  return [v(-.72*sign,y,.12),v(-.36*sign,y,.12),v(0,y,.12),v(.36*sign,y,.12),v(.72*sign,y,.12)]
 }
 if(id==='canvas'){
  const paths=[[v(-.66,.72,.06),v(-.84,.72,.07),v(-1.1,.72,.08)],[v(.66,.72,.06),v(.84,.72,.07),v(1.1,.72,.08)],[v(0,1.24,.06),v(0,1.41,.07),v(0,1.66,.08)],[v(0,.12,.06),v(0,-.03,.07),v(0,-.25,.08)]]
  return paths[step]
 }
 if(id==='pigment')return Array.from({length:25},(_,i)=>v(-.45+Math.cos(i*Math.PI/12)*.085,.52,-.43+Math.sin(i*Math.PI/12)*.085))
 if(id==='mount')return [v(.40,1.34,.065),v(.64,1.34,.20),v(.93,1.34,.35),v(1.14,1.34,.46)]
 const rotate=(x:number,y:number)=>{
  const angle=step*Math.PI/2
  return v((x*Math.cos(angle)-y*Math.sin(angle))*1.26/768,.7-(x*Math.sin(angle)+y*Math.cos(angle))*1.26/768,.017)
 }
 const first=new T.CubicBezierCurve3(rotate(0,-44),rotate(-100,-125),rotate(-85,-190),rotate(0,-270))
 const second=new T.CubicBezierCurve3(rotate(0,-270),rotate(85,-190),rotate(100,-125),rotate(0,-44))
 const board=group.children[0]
 return [...first.getPoints(12),...second.getPoints(12).slice(1)].map(point=>point.applyMatrix4(board.matrix))
}
