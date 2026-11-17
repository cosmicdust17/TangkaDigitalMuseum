<script setup lang="ts">
import { ref, watch } from 'vue'
import type { Artwork } from '../types'
import { categoryLabel } from '../categories'
import { assetUrl } from '../types'
const props=defineProps<{artwork:Artwork}>();defineEmits<{close:[]}>()
const failed=ref(false),hdFailed=ref(false);watch(()=>props.artwork.id,()=>{failed.value=false;hdFailed.value=false})
function imageError(){if(props.artwork.image_hd&&!hdFailed.value)hdFailed.value=true;else failed.value=true}
const labels=[['dimensions','尺寸（馆方原文）'],['credit_line','入藏说明'],['period','创作年代'],['region','地区 / 文化归属'],['material','材质与技法'],['museum','馆藏机构'],['accession_number','馆藏编号']] as const
</script>
<template><aside class="detail" aria-label="作品详情"><div class="detail-top"><span>COLLECTION / 藏品档案</span><button @click="$emit('close')" aria-label="关闭作品详情">✕</button></div><a class="detail-image" :href="assetUrl((!hdFailed && artwork.image_hd) || artwork.image)" target="_blank" rel="noopener noreferrer" aria-label="打开完整作品图片"><img v-if="!failed" :src="assetUrl((!hdFailed && artwork.image_hd) || artwork.image)" :alt="artwork.title" loading="lazy" @error="imageError"><p v-else>图片加载失败，请稍后重试</p><span>↗ 查看完整图像</span></a><div class="detail-content"><p class="eyebrow">{{ categoryLabel(artwork.category) }} · {{ artwork.id }}</p><h2>{{ artwork.title }}</h2><p class="english">{{ artwork.title_en }}</p><p class="translation">中文题名沿用原项目编辑译名</p><dl><template v-for="[key,label] in labels" :key="key"><dt>{{ label }}</dt><dd>{{ artwork[key] || '暂无可靠资料' }}</dd></template></dl><p class="craft-badge">{{ artwork.craft_type }}</p><h3>馆藏介绍</h3><p>{{ artwork.description || '暂无可靠资料' }}</p><h3>材质与工艺</h3><p class="craft-note">{{ artwork.craft_note }}</p><h3>细节观看建议</h3><p>{{ artwork.looking_guide }}</p><p class="interpretation-basis">{{ artwork.interpretation_basis }}</p><template v-if="artwork.cultural_meaning"><h3>文化阐释</h3><p>{{ artwork.cultural_meaning }}</p></template><p v-else class="muted">作品专属文化寓意尚待核验。</p><a class="source-link" :href="artwork.source_url" target="_blank" rel="noopener noreferrer">访问原始馆藏页面 ↗</a><p class="rights">{{ artwork.image_rights }}</p></div></aside></template>
