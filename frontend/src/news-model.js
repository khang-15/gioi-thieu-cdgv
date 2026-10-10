const fold=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[đĐ]/g,'d').toLowerCase();
export function selectArticles(articles,category='all',query=''){
 const q=fold(query.trim());
 return articles.filter(a=>(category==='all'||a.category===category)&&fold([a.title,a.summary,...a.body].join(' ')).includes(q));
}
