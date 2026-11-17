export const categories = [
 { id:'MANDALA', label:'坛城', en:'MANDALAS', center:-18.7 },
 { id:'BUDDHA', label:'佛陀', en:'BUDDHAS', center:12 },
 { id:'BODHISATTVA', label:'菩萨与女尊', en:'BODHISATTVAS', center:4 },
 { id:'PROTECTOR', label:'护法', en:'PROTECTORS', center:-4 },
 { id:'MASTER', label:'上师', en:'MASTERS', center:-12 },
] as const
export function categoryOf(code:string) { return code==='TARA'?'BODHISATTVA':code }
export function categoryLabel(code:string) { return categories.find(c=>c.id===categoryOf(code))?.label || code }
