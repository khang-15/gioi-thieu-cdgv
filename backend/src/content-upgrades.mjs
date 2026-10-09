/** Preserve fields, images and links; compose Vietnamese diacritics into NFC. */
export function normalizeText(value) {
 if(typeof value==='string') return value.normalize('NFC');
 if(Array.isArray(value)) return value.map(normalizeText);
 if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,normalizeText(v)]));
 return value;
}
export function upgradeCommunityName(value) {
 if(typeof value==='string') return value.normalize('NFC').replaceAll('Xuân Lộc Gò Vấp','Gò Vấp');
 if(Array.isArray(value)) return value.map(upgradeCommunityName);
 if(value && typeof value==='object') return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,upgradeCommunityName(v)]));
 return value;
}
