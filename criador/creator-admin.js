/* MenuClick UI Pro Fix — painel dos criadores/admin geral */
(function(){
  'use strict';
  const MC=window.MC; let data;
  document.addEventListener('DOMContentLoaded',init);
  function init(){ data=MC.load(); MC.applyBrand(data); bind(); renderAll(); }
  function bind(){
    MC.qa('[data-view]').forEach(b=>b.addEventListener('click',()=>{MC.setActiveView(b.dataset.view); renderAll();}));
    MC.q('#settingsForm')?.addEventListener('submit',saveSettings);
    MC.q('#addNotice')?.addEventListener('click',addNotice);
    MC.q('#restaurantForm')?.addEventListener('submit',saveRestaurant);
    MC.q('#clearRestaurant')?.addEventListener('click',()=>MC.fillForm(MC.q('#restaurantForm'),{open:true,verified:true}));
    MC.q('#categoryForm')?.addEventListener('submit',saveCategory);
    MC.q('#bannerForm')?.addEventListener('submit',saveBanner);
    MC.q('#globalCouponForm')?.addEventListener('submit',saveCoupon);
    MC.q('#resetDemo')?.addEventListener('click',resetDemo);
    MC.q('#saveSnapshot')?.addEventListener('click',exportBackup);
    MC.q('#downloadBackupFile')?.addEventListener('click',exportBackup);
    MC.q('#copyBackup')?.addEventListener('click',copyBackup);
    MC.q('#importBackup')?.addEventListener('click',importBackup);
    MC.q('#clearLogs')?.addEventListener('click',()=>{data.logs=[]; MC.save(data,false); renderLogs();});
    window.addEventListener('storage',()=>{data=MC.load(); renderAll();});
  }
  function renderAll(){ renderOverview(); renderSettings(); renderRestaurantSelects(); renderRestaurants(); renderCategories(); renderBanners(); renderCoupons(); renderData(); }
  function renderOverview(){
    const totalOrders=(data.orders||[]).length;
    const revenue=(data.orders||[]).filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.totals?.total||0),0);
    MC.q('#creatorMetrics').innerHTML=`<div class="metric"><span>Restaurantes</span><strong>${data.restaurants.length}</strong></div><div class="metric"><span>Produtos</span><strong>${data.products.length}</strong></div><div class="metric"><span>Pedidos</span><strong>${totalOrders}</strong></div><div class="metric"><span>GMV local</span><strong>${MC.money(revenue)}</strong></div>`;
    renderLogs();
  }
  function renderLogs(){
    const list=MC.q('#logsList'); if(!list) return;
    list.innerHTML=(data.logs||[]).slice(0,25).map(l=>`<div class="mini-item"><div><b>${MC.text(l.action)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(l.detail||'')} • ${new Date(l.at).toLocaleString('pt-BR')}</small></div></div>`).join('')||'<div class="empty">Nenhum log registrado ainda.</div>';
  }
  function renderSettings(){
    const form=MC.q('#settingsForm'); if(!form)return;
    MC.fillForm(form,data.settings||{});
    const notices=MC.q('#noticesList');
    if(notices) notices.innerHTML=(data.settings.notices||[]).map((n,i)=>`<div class="mini-item"><span>${MC.text(n)}</span><button class="btn danger sm" data-remove-notice="${i}">Remover</button></div>`).join('')||'<div class="empty">Nenhum aviso.</div>';
    MC.qa('[data-remove-notice]',notices).forEach(b=>b.addEventListener('click',()=>{data.settings.notices.splice(+b.dataset.removeNotice,1); MC.addLog(data,'Aviso removido','Painel dos criadores'); MC.save(data,false); renderSettings();}));
  }
  function renderRestaurantSelects(){
    const cats=MC.activeCategories(data).map(c=>`<option value="${MC.text(c.name)}">${MC.text(c.emoji)} ${MC.text(c.name)}</option>`).join('');
    const cat=MC.q('#restaurantCategory'); if(cat) cat.innerHTML=cats;
    const sel=MC.q('#globalCouponForm select[name="restaurantId"]'); if(sel) sel.innerHTML='<option value="">Todos</option>'+data.restaurants.map(r=>`<option value="${r.id}">${MC.text(r.name)}</option>`).join('');
  }
  function renderRestaurants(){
    const list=MC.q('#restaurantsList'); if(!list)return;
    list.innerHTML=data.restaurants.map(r=>`<div class="mini-item"><div><b>${MC.text(r.coverEmoji||'🍽️')} ${MC.text(r.name)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(r.category)} • ${r.open?'Aberta':'Fechada'} • ${MC.money(r.deliveryFee)} entrega</small></div><div class="row"><button class="btn secondary sm" data-edit-restaurant="${r.id}">Editar</button><button class="btn danger sm" data-delete-restaurant="${r.id}">Excluir</button></div></div>`).join('')||'<div class="empty">Nenhum restaurante cadastrado.</div>';
    MC.qa('[data-edit-restaurant]',list).forEach(b=>b.addEventListener('click',()=>editRestaurant(b.dataset.editRestaurant)));
    MC.qa('[data-delete-restaurant]',list).forEach(b=>b.addEventListener('click',()=>deleteRestaurant(b.dataset.deleteRestaurant)));
  }
  function renderCategories(){
    const list=MC.q('#categoriesList'); if(!list)return;
    list.innerHTML=data.categories.sort((a,b)=>(+a.sort||0)-(+b.sort||0)).map(c=>`<div class="mini-item"><div><b>${MC.text(c.emoji)} ${MC.text(c.name)}</b><small style="display:block;color:var(--muted);font-weight:800">Ordem ${c.sort||0} • ${c.active?'Ativa':'Inativa'}</small></div><div class="row"><button class="btn secondary sm" data-edit-category="${c.id}">Editar</button><button class="btn danger sm" data-delete-category="${c.id}">Excluir</button></div></div>`).join('')||'<div class="empty">Nenhuma categoria.</div>';
    MC.qa('[data-edit-category]',list).forEach(b=>b.addEventListener('click',()=>editCategory(b.dataset.editCategory)));
    MC.qa('[data-delete-category]',list).forEach(b=>b.addEventListener('click',()=>deleteCategory(b.dataset.deleteCategory)));
  }
  function renderBanners(){
    const list=MC.q('#bannersList'); if(!list)return;
    list.innerHTML=(data.banners||[]).map(b=>`<div class="mini-item"><div><b>${MC.text(b.title)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(b.body)} • ${b.active?'Ativo':'Pausado'}</small></div><div class="row"><button class="btn secondary sm" data-edit-banner="${b.id}">Editar</button><button class="btn danger sm" data-delete-banner="${b.id}">Excluir</button></div></div>`).join('')||'<div class="empty">Nenhum banner.</div>';
    MC.qa('[data-edit-banner]',list).forEach(b=>b.addEventListener('click',()=>editBanner(b.dataset.editBanner)));
    MC.qa('[data-delete-banner]',list).forEach(b=>b.addEventListener('click',()=>deleteBanner(b.dataset.deleteBanner)));
  }
  function renderCoupons(){
    const list=MC.q('#globalCouponsList'); if(!list)return;
    list.innerHTML=(data.coupons||[]).map(c=>{ const r=c.restaurantId?MC.getRestaurant(data,c.restaurantId)?.name:'Todas as lojas'; return `<div class="mini-item"><div><b>${MC.text(c.code)}</b><small style="display:block;color:var(--muted);font-weight:800">${descCoupon(c)} • ${MC.text(r)} • mín. ${MC.money(c.minOrder)}</small></div><div class="row"><span class="badge ${c.active?'success':'danger'}">${c.active?'Ativo':'Pausado'}</span><button class="btn danger sm" data-delete-coupon="${c.id}">Excluir</button></div></div>`; }).join('')||'<div class="empty">Nenhum cupom.</div>';
    MC.qa('[data-delete-coupon]',list).forEach(b=>b.addEventListener('click',()=>deleteCoupon(b.dataset.deleteCoupon)));
  }
  function renderData(){ const p=MC.q('#backupPreview'); if(p) p.textContent=JSON.stringify(data,null,2); }
  function saveSettings(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget);
    data.settings=Object.assign(data.settings||{},o,{serviceFeePercent:Number(o.serviceFeePercent||0),defaultDeliveryFee:Number(o.defaultDeliveryFee||0),freeDeliveryFrom:Number(o.freeDeliveryFrom||0),allowScheduledOrders:!!o.allowScheduledOrders,enablePix:!!o.enablePix,enableCash:!!o.enableCash,enableCard:!!o.enableCard});
    MC.addLog(data,'Configurações salvas',data.settings.appName); MC.save(data,false); MC.applyBrand(data); MC.toast('Configurações salvas'); renderAll();
  }
  function addNotice(){ const n=prompt('Digite o aviso para aparecer no app do cliente:'); if(!n)return; data.settings.notices=data.settings.notices||[]; data.settings.notices.unshift(n); MC.addLog(data,'Aviso criado',n); MC.save(data,false); renderSettings(); MC.toast('Aviso criado'); }
  function saveRestaurant(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const id=o.id||MC.uid('rest');
    const existing=data.restaurants.find(r=>r.id===id)||{};
    const r=Object.assign(existing,o,{id,coverEmoji:o.coverEmoji||'🍽️',minOrder:Number(o.minOrder||0),deliveryFee:Number(o.deliveryFee||0),deliveryTime:Number(o.deliveryTime||0),rating:Number(o.rating||4.5),reviewCount:Number(existing.reviewCount||0),tags:MC.parseList(o.tags),open:!!o.open,verified:!!o.verified,superStore:!!o.superStore,paymentMethods:existing.paymentMethods||{pix:true,credit:true,debit:true,cash:true,vr:false},schedule:existing.schedule||{mon:'18:00-23:00'}});
    const idx=data.restaurants.findIndex(x=>x.id===id); if(idx>=0)data.restaurants[idx]=r; else data.restaurants.push(r);
    MC.addLog(data,'Restaurante salvo',r.name); MC.save(data,false); MC.toast('Restaurante salvo'); e.currentTarget.reset(); e.currentTarget.elements.open.checked=true; e.currentTarget.elements.verified.checked=true; renderAll();
  }
  function editRestaurant(id){ const r=data.restaurants.find(x=>x.id===id); if(!r)return; MC.fillForm(MC.q('#restaurantForm'),Object.assign({},r,{tags:(r.tags||[]).join(', ')})); MC.setActiveView('restaurants'); }
  function deleteRestaurant(id){ if(!confirm('Excluir restaurante e seus produtos?'))return; const r=MC.getRestaurant(data,id); data.restaurants=data.restaurants.filter(x=>x.id!==id); data.products=data.products.filter(p=>p.restaurantId!==id); data.coupons=data.coupons.filter(c=>c.restaurantId!==id); MC.addLog(data,'Restaurante excluído',r?.name||id); MC.save(data,false); renderAll(); }
  function saveCategory(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const id=o.id||'cat_'+MC.slug(o.name||MC.uid('cat'));
    const c={id,name:o.name,emoji:o.emoji,sort:Number(o.sort||data.categories.length+1),active:!!o.active};
    const idx=data.categories.findIndex(x=>x.id===id); if(idx>=0)data.categories[idx]=c; else data.categories.push(c);
    MC.addLog(data,'Categoria salva',c.name); MC.save(data,false); MC.toast('Categoria salva'); e.currentTarget.reset(); e.currentTarget.elements.active.checked=true; renderAll();
  }
  function editCategory(id){ const c=data.categories.find(x=>x.id===id); if(c) MC.fillForm(MC.q('#categoryForm'),c); MC.setActiveView('categories'); }
  function deleteCategory(id){ if(!confirm('Excluir categoria?'))return; const c=data.categories.find(x=>x.id===id); data.categories=data.categories.filter(x=>x.id!==id); MC.addLog(data,'Categoria excluída',c?.name||id); MC.save(data,false); renderAll(); }
  function saveBanner(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const id=o.id||MC.uid('ban'); const b={id,title:o.title,body:o.body,cta:o.cta,coupon:o.coupon,active:!!o.active};
    const idx=data.banners.findIndex(x=>x.id===id); if(idx>=0)data.banners[idx]=b; else data.banners.push(b);
    MC.addLog(data,'Banner salvo',b.title); MC.save(data,false); MC.toast('Banner salvo'); e.currentTarget.reset(); e.currentTarget.elements.active.checked=true; renderBanners(); renderData();
  }
  function editBanner(id){ const b=data.banners.find(x=>x.id===id); if(b) MC.fillForm(MC.q('#bannerForm'),b); MC.setActiveView('banners'); }
  function deleteBanner(id){ if(!confirm('Excluir banner?'))return; const b=data.banners.find(x=>x.id===id); data.banners=data.banners.filter(x=>x.id!==id); MC.addLog(data,'Banner excluído',b?.title||id); MC.save(data,false); renderBanners(); }
  function saveCoupon(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const c={id:MC.uid('cup'), code:String(o.code||'').toUpperCase(), restaurantId:o.restaurantId||'', type:o.type, value:Number(o.value||0), minOrder:Number(o.minOrder||0), expiresAt:o.expiresAt, usageLimit:999, used:0, active:!!o.active};
    data.coupons.push(c); MC.addLog(data,'Cupom salvo',c.code); MC.save(data,false); MC.toast('Cupom salvo'); e.currentTarget.reset(); e.currentTarget.elements.active.checked=true; renderCoupons(); renderData();
  }
  function deleteCoupon(id){ if(!confirm('Excluir cupom?'))return; const c=data.coupons.find(x=>x.id===id); data.coupons=data.coupons.filter(x=>x.id!==id); MC.addLog(data,'Cupom excluído',c?.code||id); MC.save(data,false); renderCoupons(); }
  function resetDemo(){ if(!confirm('Restaurar dados demo? Isso substituirá dados locais deste navegador.'))return; data=MC.reset(); MC.addLog(data,'Demo restaurada','MenuClick UI Pro'); MC.toast('Demo restaurada'); renderAll(); }
  function exportBackup(){
    const dataHoje=new Date().toISOString().slice(0,10);
    MC.downloadJSON(`backup-menuclick-${dataHoje}.json`,data);
    MC.toast('Backup baixado em arquivo JSON');
  }
  async function copyBackup(){ try{ await navigator.clipboard.writeText(JSON.stringify(data,null,2)); MC.toast('Backup copiado'); } catch(e){ MC.q('#backupPreview').select?.(); MC.toast('Copie manualmente o JSON'); } }
  function importBackup(){ const raw=MC.q('#importText')?.value; if(!raw)return MC.toast('Cole o JSON primeiro.'); try{ const parsed=JSON.parse(raw); localStorage.setItem(MC.KEY,JSON.stringify(parsed)); data=MC.load(); MC.addLog(data,'Backup importado','Painel dos criadores'); MC.save(data,false); MC.toast('Backup importado'); renderAll(); }catch(e){ MC.toast('JSON inválido.'); } }
  function descCoupon(c){ if(c.type==='fixed') return `${MC.money(c.value)} de desconto`; if(c.type==='percent') return `${c.value}% de desconto`; return 'Frete grátis'; }
})();
