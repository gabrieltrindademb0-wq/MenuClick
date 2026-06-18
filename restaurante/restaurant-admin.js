/* MenuClick UI Pro — painel do restaurante com adicionais em modo fácil */
(function(){
  'use strict';
  const MC=window.MC; let data, selectedId;
  let optionDraft=[];

  const OPTION_TEMPLATES={
    burger:[
      {group:'Adicionais', required:false, max:3, items:[{name:'Bacon extra',price:5},{name:'Cheddar extra',price:4},{name:'Onion rings',price:6}]},
      {group:'Ponto da carne', required:true, max:1, items:[{name:'Ao ponto',price:0},{name:'Bem passado',price:0}]}
    ],
    pizza:[
      {group:'Borda recheada', required:false, max:1, items:[{name:'Catupiry',price:8},{name:'Cheddar',price:8},{name:'Chocolate',price:10}]},
      {group:'Sabores', required:true, max:2, items:[{name:'Calabresa',price:0},{name:'Frango com catupiry',price:0},{name:'Quatro queijos',price:3}]}
    ],
    acai:[
      {group:'Tamanho', required:true, max:1, items:[{name:'300ml',price:0},{name:'500ml',price:6},{name:'700ml',price:10}]},
      {group:'Complementos', required:false, max:4, items:[{name:'Leite condensado',price:2},{name:'Granola',price:2},{name:'Leite em pó',price:3},{name:'Morango',price:4}]}
    ],
    drink:[
      {group:'Tamanho', required:true, max:1, items:[{name:'Lata 350ml',price:0},{name:'600ml',price:4},{name:'2 litros',price:9}]},
      {group:'Preferência', required:false, max:2, items:[{name:'Gelado',price:0},{name:'Sem gelo',price:0},{name:'Com limão',price:1}]}
    ]
  };

  document.addEventListener('DOMContentLoaded',init);
  function init(){
    data=MC.load(); MC.applyBrand(data);
    selectedId=localStorage.getItem('menuclick_selected_restaurant') || data.restaurants?.[0]?.id;
    bind(); setOptionsBuilder([]); renderAll();
  }
  function bind(){
    MC.qa('[data-view]').forEach(b=>b.addEventListener('click',()=>MC.setActiveView(b.dataset.view)));
    MC.q('#restaurantSelect')?.addEventListener('change',e=>{ selectedId=e.target.value; localStorage.setItem('menuclick_selected_restaurant',selectedId); renderAll(); });
    MC.q('#storeForm')?.addEventListener('submit',saveStore);
    MC.q('#productForm')?.addEventListener('submit',saveProduct);
    MC.q('#couponForm')?.addEventListener('submit',saveCoupon);
    MC.q('#clearProduct')?.addEventListener('click',()=>{ MC.q('#productForm')?.reset(); MC.q('#productForm').elements.available.checked=true; setProductImage(''); setOptionsBuilder([]); });
    MC.q('#productImageFile')?.addEventListener('change',handleProductImage);
    MC.q('#removeProductImage')?.addEventListener('click',()=>setProductImage(''));
    MC.q('#addOptionGroup')?.addEventListener('click',()=>addGroup());
    MC.q('#clearOptionsBuilder')?.addEventListener('click',()=>setOptionsBuilder([]));
    MC.qa('[data-option-template]').forEach(btn=>btn.addEventListener('click',()=>applyTemplate(btn.dataset.optionTemplate)));
    MC.q('#optionBuilder')?.addEventListener('input',handleOptionInput);
    MC.q('#optionBuilder')?.addEventListener('change',handleOptionInput);
    MC.q('#optionBuilder')?.addEventListener('click',handleOptionClick);
    window.addEventListener('storage',()=>{data=MC.load(); renderAll();});
  }
  function store(){ return MC.getRestaurant(data,selectedId) || data.restaurants[0]; }
  function renderAll(){ renderRestaurantSelect(); renderCategorySelect(); renderStoreForm(); renderDashboard(); renderProducts(); renderOrders(); renderCoupons(); renderReviews(); }
  function renderRestaurantSelect(){
    const sel=MC.q('#restaurantSelect'); if(!sel) return;
    if(!data.restaurants.length){ sel.innerHTML='<option>Nenhuma loja</option>'; return; }
    if(!selectedId || !data.restaurants.some(r=>r.id===selectedId)) selectedId=data.restaurants[0].id;
    sel.innerHTML=data.restaurants.map(r=>`<option value="${attr(r.id)}" ${r.id===selectedId?'selected':''}>${MC.text(r.name)}</option>`).join('');
  }
  function renderCategorySelect(){
    const cats=MC.activeCategories(data);
    const html=cats.map(c=>`<option value="${attr(c.name)}">${MC.text(c.emoji)} ${MC.text(c.name)}</option>`).join('');
    const c1=MC.q('#categorySelect'); if(c1) c1.innerHTML=html;
  }
  function renderStoreForm(){
    const r=store(); if(!r) return;
    const obj=Object.assign({},r,r.schedule||{},r.paymentMethods||{});
    obj.tags=(r.tags||[]).join(', '); obj.subcategories=(r.subcategories||[]).join(', ');
    MC.fillForm(MC.q('#storeForm'),obj);
  }
  function renderDashboard(){
    const r=store(); if(!r) return;
    const orders=storeOrders(); const today=new Date().toISOString().slice(0,10);
    const todayOrders=orders.filter(o=>(o.createdAt||'').slice(0,10)===today);
    const revenue=orders.filter(o=>o.status!=='cancelled').reduce((s,o)=>s+Number(o.totals?.total||0),0);
    MC.q('#dashboardMetrics').innerHTML=`<div class="metric"><span>Pedidos</span><strong>${orders.length}</strong></div><div class="metric"><span>Hoje</span><strong>${todayOrders.length}</strong></div><div class="metric"><span>Faturamento</span><strong>${MC.money(revenue)}</strong></div><div class="metric"><span>Produtos</span><strong>${MC.getProducts(data,r.id).length}</strong></div>`;
    MC.q('#recentOrders').innerHTML=orders.slice(0,6).map(orderMini).join('')||'<div class="empty">Nenhum pedido recebido ainda.</div>';
    MC.q('#storeChecklist').innerHTML=checklist(r).map(item=>`<div class="mini-item"><span>${item.ok?'✅':'⚠️'} ${MC.text(item.label)}</span><b>${item.ok?'OK':'Pendente'}</b></div>`).join('');
  }
  function checklist(r){return [{label:'CNPJ preenchido',ok:!!r.cnpj},{label:'Endereço completo',ok:!!(r.street&&r.number&&r.neighborhood&&r.city)},{label:'Horário de funcionamento',ok:!!(r.schedule&&Object.values(r.schedule).some(Boolean))},{label:'Formas de pagamento',ok:!!(r.paymentMethods&&Object.values(r.paymentMethods).some(Boolean))},{label:'Pelo menos 3 produtos',ok:MC.getProducts(data,r.id).length>=3},{label:'Loja aberta/fechada definido',ok:typeof r.open==='boolean'}];}
  function renderProducts(){
    const list=MC.q('#productsList'); if(!list) return;
    const ps=MC.getProducts(data,selectedId);
    list.innerHTML=ps.map(p=>`<div class="mini-item product-admin-item"><div class="product-admin-left">${productThumb(p)}<div><b>${MC.text(p.name)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(p.category)} • ${p.available?'Disponível':'Pausado'} • Estoque ${p.stock??'-'} • ${(p.options||[]).length} grupos de opções</small></div></div><div class="row"><b>${MC.money(p.promoPrice||p.price)}</b><button class="btn ghost sm" data-edit-product="${attr(p.id)}">Editar</button><button class="btn danger sm" data-delete-product="${attr(p.id)}">Excluir</button></div></div>`).join('')||'<div class="empty">Cadastre produtos para aparecerem no app.</div>';
    MC.qa('[data-edit-product]',list).forEach(b=>b.addEventListener('click',()=>editProduct(b.dataset.editProduct)));
    MC.qa('[data-delete-product]',list).forEach(b=>b.addEventListener('click',()=>deleteProduct(b.dataset.deleteProduct)));
  }
  function renderOrders(){
    const table=MC.q('#ordersTable'); if(!table) return;
    const orders=storeOrders();
    table.innerHTML=orders.map(o=>`<tr><td><b>${MC.text(o.code)}</b><br><small>${new Date(o.createdAt).toLocaleString('pt-BR')}</small></td><td>${MC.text(o.customer?.name||'Cliente')}<br><small>${MC.text(o.customer?.phone||'')}</small></td><td>${(o.items||[]).map(i=>`${i.qty}x ${MC.text(i.name)}`).join('<br>')}</td><td><b>${MC.money(o.totals?.total)}</b></td><td><select class="select" data-status="${attr(o.id)}">${MC.STORE_STATUSES.map(s=>`<option value="${s}" ${o.status===s?'selected':''}>${MC.STATUS_LABELS[s]}</option>`).join('')}</select></td><td><button class="btn secondary sm" data-details="${attr(o.id)}">Detalhes</button></td></tr>`).join('')||'<tr><td colspan="6">Nenhum pedido para esta loja.</td></tr>';
    MC.qa('[data-status]',table).forEach(sel=>sel.addEventListener('change',()=>updateOrderStatus(sel.dataset.status,sel.value)));
    MC.qa('[data-details]',table).forEach(b=>b.addEventListener('click',()=>alert(orderDetails(b.dataset.details))));
  }
  function renderCoupons(){
    const list=MC.q('#couponsList'); if(!list) return;
    const cs=(data.coupons||[]).filter(c=>c.restaurantId===selectedId);
    list.innerHTML=cs.map(c=>`<div class="mini-item"><div><b>${MC.text(c.code)}</b><small style="display:block;color:var(--muted);font-weight:800">${couponDesc(c)} • mín. ${MC.money(c.minOrder)}</small></div><span class="badge ${c.active?'success':'danger'}">${c.active?'Ativo':'Pausado'}</span></div>`).join('')||'<div class="empty">Nenhum cupom próprio da loja.</div>';
  }
  function renderReviews(){
    const reviews=(data.reviews||[]).filter(r=>r.restaurantId===selectedId);
    const reviewsList=MC.q('#reviewsList'); if(reviewsList) reviewsList.innerHTML=reviews.map(r=>`<div class="mini-item"><div><b>${'⭐'.repeat(Math.max(1,Math.min(5,r.rating||1)))}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(r.comment||'Sem comentário')}</small></div><span>${new Date(r.createdAt).toLocaleDateString('pt-BR')}</span></div>`).join('')||'<div class="empty">Nenhuma avaliação ainda.</div>';
    const support=(data.support||[]).filter(s=>s.restaurantId===selectedId);
    const supportList=MC.q('#supportList'); if(supportList) supportList.innerHTML=support.map(s=>`<div class="mini-item"><div><b>Chamado ${MC.text(s.status)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(s.message)}</small></div><button class="btn ghost sm" data-close-ticket="${attr(s.id)}">Resolver</button></div>`).join('')||'<div class="empty">Nenhum chamado aberto.</div>';
    MC.qa('[data-close-ticket]').forEach(b=>b.addEventListener('click',()=>{ const s=data.support.find(x=>x.id===b.dataset.closeTicket); if(s)s.status='resolvido'; MC.addLog(data,'Chamado resolvido',b.dataset.closeTicket); MC.save(data,false); renderReviews(); }));
  }
  function storeOrders(){ return (data.orders||[]).filter(o=>o.restaurantId===selectedId); }
  function orderMini(o){ return `<div class="mini-item"><div><b>${MC.text(o.code)} • ${MC.text(o.customer?.name||'Cliente')}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.STATUS_LABELS[o.status]} • ${(o.items||[]).length} itens</small></div><strong>${MC.money(o.totals?.total)}</strong></div>`; }
  function saveStore(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const r=store(); if(!r)return;
    const schedule={mon:o.mon,tue:o.tue,wed:o.wed,thu:o.thu,fri:o.fri,sat:o.sat,sun:o.sun};
    const paymentMethods={pix:!!o.pix,credit:!!o.credit,debit:!!o.debit,cash:!!o.cash,vr:!!o.vr};
    Object.assign(r,o,{schedule,paymentMethods,tags:MC.parseList(o.tags),subcategories:MC.parseList(o.subcategories),minOrder:Number(o.minOrder||0),deliveryFee:Number(o.deliveryFee||0),freeDeliveryFrom:Number(o.freeDeliveryFrom||0),deliveryTime:Number(o.deliveryTime||0),preparationTime:Number(o.preparationTime||0),deliveryRadiusKm:Number(o.deliveryRadiusKm||0),open:!!o.open,verified:!!o.verified,superStore:!!o.superStore});
    MC.addLog(data,'Loja atualizada',r.name); MC.save(data,false); MC.toast('Loja salva'); renderAll();
  }
  function saveProduct(e){
    e.preventDefault();
    const options=collectOptionsBuilder(true); if(!options) return;
    const o=MC.formToObj(e.currentTarget);
    const p={id:o.id||MC.uid('prod'), restaurantId:selectedId, name:o.name, category:o.category, emoji:o.emoji||'🍽️', image:o.image||'', price:Number(o.price||0), promoPrice:Number(o.promoPrice||0), stock:Number(o.stock||0), serves:o.serves, weight:o.weight, description:o.description, allergens:o.allergens, nutrition:o.nutrition, prepTime:Number(o.prepTime||0), options, available:!!o.available, featured:!!o.featured};
    const idx=data.products.findIndex(x=>x.id===p.id); if(idx>=0)data.products[idx]=p; else data.products.push(p);
    MC.addLog(data,'Produto salvo',p.name); MC.save(data,false); MC.toast('Produto salvo'); e.currentTarget.reset(); e.currentTarget.elements.available.checked=true; setProductImage(''); setOptionsBuilder([]); renderProducts(); renderDashboard();
  }
  function editProduct(id){
    const p=data.products.find(x=>x.id===id); if(!p)return;
    MC.fillForm(MC.q('#productForm'),Object.assign({},p,{optionsRaw:MC.optionsToRaw(p.options)}));
    setProductImage(p.image||'');
    setOptionsBuilder(p.options||[]); MC.setActiveView('products');
    MC.q('#productForm')?.scrollIntoView({behavior:'smooth',block:'start'});
  }
  function deleteProduct(id){ if(!confirm('Excluir produto?'))return; const p=data.products.find(x=>x.id===id); data.products=data.products.filter(x=>x.id!==id); MC.addLog(data,'Produto excluído',p?.name||id); MC.save(data,false); renderProducts(); renderDashboard(); }
  function saveCoupon(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); const c={id:MC.uid('cup'), code:String(o.code||'').toUpperCase(), restaurantId:selectedId, type:o.type, value:Number(o.value||0), minOrder:Number(o.minOrder||0), expiresAt:o.expiresAt, usageLimit:Number(o.usageLimit||0), used:0, active:!!o.active};
    data.coupons.push(c); MC.addLog(data,'Cupom da loja salvo',c.code); MC.save(data,false); MC.toast('Cupom salvo'); e.currentTarget.reset(); e.currentTarget.elements.active.checked=true; renderCoupons();
  }
  function updateOrderStatus(id,status){ const o=data.orders.find(x=>x.id===id); if(!o)return; o.status=status; o.updatedAt=new Date().toISOString(); MC.addLog(data,'Status atualizado',`${o.code}: ${MC.STATUS_LABELS[status]}`); MC.save(data,false); renderDashboard(); }
  function orderDetails(id){ const o=data.orders.find(x=>x.id===id); if(!o)return 'Pedido não encontrado'; return `${o.code}\nCliente: ${o.customer?.name||''}\nTelefone: ${o.customer?.phone||''}\nEndereço: ${o.address?.street||''}, ${o.address?.number||''}\nItens:\n${(o.items||[]).map(i=>`- ${i.qty}x ${i.name}`).join('\n')}\nTotal: ${MC.money(o.totals?.total)}\nObs: ${o.note||''}`; }
  function couponDesc(c){ if(c.type==='fixed') return `${MC.money(c.value)} de desconto`; if(c.type==='percent') return `${c.value}% de desconto`; return 'Frete grátis'; }


  /* Upload visual da foto do produto */
  function handleProductImage(e){
    const file=e.target.files && e.target.files[0];
    if(!file) return;
    if(!/^image\/(png|jpeg|webp)$/.test(file.type)){
      MC.toast('Use imagem JPG, PNG ou WEBP.');
      e.target.value='';
      return;
    }
    if(file.size > 8 * 1024 * 1024){
      MC.toast('Imagem muito pesada. Use até 8MB.');
      e.target.value='';
      return;
    }
    resizeImage(file, 900, 0.82).then(src=>{
      setProductImage(src);
      MC.toast('Foto carregada');
    }).catch(()=>MC.toast('Não foi possível carregar a foto.'));
  }
  function resizeImage(file,maxSize,quality){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onerror=reject;
      reader.onload=()=>{
        const img=new Image();
        img.onerror=reject;
        img.onload=()=>{
          const scale=Math.min(1, maxSize / Math.max(img.width,img.height));
          const w=Math.max(1,Math.round(img.width*scale));
          const h=Math.max(1,Math.round(img.height*scale));
          const canvas=document.createElement('canvas');
          canvas.width=w; canvas.height=h;
          const ctx=canvas.getContext('2d');
          ctx.fillStyle='#fff'; ctx.fillRect(0,0,w,h);
          ctx.drawImage(img,0,0,w,h);
          resolve(canvas.toDataURL('image/jpeg',quality));
        };
        img.src=reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function setProductImage(src){
    const input=MC.q('[name="image"]');
    const file=MC.q('#productImageFile');
    const preview=MC.q('#productImagePreview');
    if(input) input.value=src||'';
    if(file && !src) file.value='';
    if(preview){
      preview.innerHTML=src ? `<img src="${attr(src)}" alt="Prévia do produto">` : '<span>📷</span>';
      preview.classList.toggle('has-image',!!src);
    }
  }
  function productThumb(p){
    return p.image ? `<img class="product-thumb" src="${attr(p.image)}" alt="${MC.text(p.name)}">` : `<span class="product-thumb fallback">${MC.text(p.emoji||'🍽️')}</span>`;
  }

  /* Builder visual de adicionais */
  function setOptionsBuilder(options){
    optionDraft=(options||[]).map(g=>({
      group:g.group||'', required:!!g.required, max:Number(g.max||1),
      items:(g.items||[]).map(i=>({name:i.name||'', price:Number(i.price||0)}))
    }));
    renderOptionBuilder();
  }
  function addGroup(group){
    optionDraft.push(group||{group:'',required:false,max:1,items:[{name:'',price:0}]});
    renderOptionBuilder();
  }
  function applyTemplate(type){
    const template=OPTION_TEMPLATES[type]||[];
    optionDraft=optionDraft.concat(template.map(g=>({group:g.group,required:g.required,max:g.max,items:g.items.map(i=>({...i}))})));
    renderOptionBuilder(); MC.toast('Modelo adicionado');
  }
  function renderOptionBuilder(){
    const wrap=MC.q('#optionBuilder'); if(!wrap) return;
    wrap.innerHTML=optionDraft.length?optionDraft.map((g,gi)=>`
      <div class="option-group-card" data-group-index="${gi}">
        <div class="option-group-title">Grupo ${gi+1}</div>
        <div class="option-group-top">
          <label class="field">Nome do grupo
            <input class="input" data-opt-field="group" data-gi="${gi}" value="${attr(g.group)}" placeholder="Ex: Adicionais, Tamanho, Borda" />
          </label>
          <label class="field">Obrigatório?
            <select class="select" data-opt-field="required" data-gi="${gi}">
              <option value="false" ${!g.required?'selected':''}>Não, cliente escolhe se quiser</option>
              <option value="true" ${g.required?'selected':''}>Sim, cliente precisa escolher</option>
            </select>
          </label>
          <label class="field">Máximo de escolhas
            <input class="input" type="number" min="1" data-opt-field="max" data-gi="${gi}" value="${Number(g.max||1)}" />
            <small class="option-help">Ex: 1 para tamanho, 3 para adicionais.</small>
          </label>
          <button type="button" class="option-group-remove" title="Remover grupo" data-remove-group="${gi}">×</button>
        </div>
        <div class="option-rows">
          ${(g.items&&g.items.length?g.items:[{name:'',price:0}]).map((it,ii)=>`
            <div class="option-row" data-item-index="${ii}">
              <input class="input" data-opt-field="itemName" data-gi="${gi}" data-ii="${ii}" value="${attr(it.name)}" placeholder="Nome da opção. Ex: Bacon extra" />
              <input class="input" data-opt-field="itemPrice" data-gi="${gi}" data-ii="${ii}" type="number" step="0.01" min="0" value="${Number(it.price||0)}" placeholder="Preço" />
              <button type="button" class="option-row-remove" title="Remover opção" data-remove-option="${gi}:${ii}">×</button>
            </div>`).join('')}
        </div>
        <button type="button" class="btn ghost sm add-option-btn" data-add-option="${gi}">+ Adicionar opção neste grupo</button>
      </div>`).join(''):'<div class="option-empty">Nenhum adicional cadastrado. Clique em <b>+ Grupo</b> ou escolha um modelo pronto.</div>';
    syncOptionsRaw(); renderOptionPreview();
  }
  function handleOptionInput(e){
    const el=e.target; const field=el.dataset.optField; if(!field) return;
    const gi=Number(el.dataset.gi), ii=Number(el.dataset.ii); if(!optionDraft[gi]) return;
    if(field==='group') optionDraft[gi].group=el.value;
    if(field==='required') optionDraft[gi].required=el.value==='true';
    if(field==='max') optionDraft[gi].max=Math.max(1,Number(el.value||1));
    if(field==='itemName' && optionDraft[gi].items[ii]) optionDraft[gi].items[ii].name=el.value;
    if(field==='itemPrice' && optionDraft[gi].items[ii]) optionDraft[gi].items[ii].price=Number(el.value||0);
    syncOptionsRaw(); renderOptionPreview();
  }
  function handleOptionClick(e){
    const add=e.target.closest('[data-add-option]');
    const removeGroup=e.target.closest('[data-remove-group]');
    const removeOption=e.target.closest('[data-remove-option]');
    if(add){ const gi=Number(add.dataset.addOption); optionDraft[gi]?.items.push({name:'',price:0}); renderOptionBuilder(); }
    if(removeGroup){ optionDraft.splice(Number(removeGroup.dataset.removeGroup),1); renderOptionBuilder(); }
    if(removeOption){ const [gi,ii]=removeOption.dataset.removeOption.split(':').map(Number); if(optionDraft[gi]) optionDraft[gi].items.splice(ii,1); renderOptionBuilder(); }
  }
  function collectOptionsBuilder(validate){
    const cleaned=optionDraft.map(g=>({
      group:String(g.group||'').trim(), required:!!g.required, max:Math.max(1,Number(g.max||1)),
      items:(g.items||[]).map(i=>({name:String(i.name||'').trim(), price:Number(i.price||0)})).filter(i=>i.name)
    })).filter(g=>g.group || g.items.length);
    if(validate){
      for(const g of cleaned){
        if(!g.group){ MC.toast('Dê um nome para todos os grupos de adicionais'); return null; }
        if(!g.items.length){ MC.toast(`Adicione pelo menos uma opção em ${g.group}`); return null; }
        if(g.max>g.items.length) g.max=g.items.length;
      }
    }
    return cleaned;
  }
  function syncOptionsRaw(){ const input=MC.q('[name="optionsRaw"]'); if(input) input.value=MC.optionsToRaw(collectOptionsBuilder(false)||[]); }
  function renderOptionPreview(){
    const preview=MC.q('#optionPreview'); if(!preview) return;
    const opts=collectOptionsBuilder(false)||[];
    preview.innerHTML=opts.length?opts.map(g=>`<div class="option-preview-group"><b>${MC.text(g.group||'Grupo sem nome')} ${g.required?'• obrigatório':'• opcional'} • até ${g.max||1}</b>${(g.items||[]).map(i=>`${MC.text(i.name)} ${i.price?`(+${MC.money(i.price)})`:'(grátis)'}`).join(' · ') || 'Sem opções ainda'}</div>`).join(''):'<div class="option-preview-group">Produto sem adicionais.</div>';
  }
  function attr(v){ return String(v ?? '').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }
})();
