export interface Artwork {
 image_hd?: string; image_hd_width?: number; id: string; title: string; title_en: string; image: string; period: string; region: string;
 material: string; museum: string; accession_number: string; description: string;
 cultural_meaning: string; source_url: string; image_rights: string; category: string; width: number; height: number;
}
export const assetUrl = (path: string) => `${import.meta.env.BASE_URL}${path}`
