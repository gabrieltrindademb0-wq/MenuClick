/* MenuClick UI Pro Fix — app do cliente */
(function(){
  'use strict';
  const MC=window.MC;
  let data, selectedCategory='all', currentRestaurant=null, currentProduct=null, cart=[];

  document.addEventListener('DOMContentLoaded', init);

  function init(){
    data=MC.load(); MC.applyBrand(data);
    cart=JSON.parse(localStorage.getItem('menuclick_cart_v4')||'[]');
    bindBase(); renderAll();
  }
  function bindBase(){
    MC.qa('[data-open-cart]').forEach(b=>b.addEventListener('click',()=>openDrawer('cartDrawer')));
    MC.qa('[data-open-profile]').forEach(b=>b.addEventListener('click',()=>{renderProfile();openModal('profileModal');}));
    MC.qa('[data-open-address]').forEach(b=>b.addEventListener('click',()=>{renderAddresses();openModal('addressModal');}));
    MC.qa('[data-close]').forEach(b=>b.addEventListener('click',closeAll));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeAll(); });
    ['searchInput','sortSelect','quickFilter'].forEach(id=>{ const el=MC.q('#'+id); if(el) el.addEventListener('input',renderRestaurants); });
    MC.q('#couponInput')?.addEventListener('input',renderCart);
    MC.q('#tipInput')?.addEventListener('input',renderCart);
    MC.q('#modeInput')?.addEventListener('change',renderCart);
    MC.q('#checkoutBtn')?.addEventListener('click',checkout);
    MC.q('#profileForm')?.addEventListener('submit',saveProfile);
    MC.q('#addressForm')?.addEventListener('submit',saveAddress);
    MC.q('#useGps')?.addEventListener('click',useGps);
    MC.q('#addPayment')?.addEventListener('click',addPayment);
    MC.q('#deleteAccount')?.addEventListener('click',deleteLocalData);
    MC.q('#exportMyData')?.addEventListener('click',()=>MC.downloadJSON('meus-dados-menuclick.json',{customer:data.customer,addresses:data.addresses,payments:data.payments,orders:data.orders}));
    window.addEventListener('storage',()=>{ data=MC.load(); renderAll(); });
  }
  function renderAll(){ renderStats(); renderCategories(); renderBanners(); renderRestaurants(); renderOrders(); renderTopAddress(); renderCart(); }
  function renderStats(){
    setText('statStores',(data.restaurants||[]).filter(r=>r.open).length);
    setText('statCats',MC.activeCategories(data).length);
    setText('statOrders',(data.orders||[]).length);
    const notice=(data.settings.notices||[])[0] || 'Configure avisos no painel dos criadores.';
    setText('noticeBox',notice);
  }
  function renderCategories(){
    const wrap=MC.q('#categoryStrip'); if(!wrap) return;
    const cats=[{id:'all',name:'Todas',emoji:'✨',active:true}, ...MC.activeCategories(data)];
    wrap.innerHTML=cats.map(c=>`<button class="category-card ${selectedCategory===c.name||selectedCategory===c.id?'active':''}" data-cat="${MC.text(c.id==='all'?'all':c.name)}"><span>${MC.text(c.emoji)}</span><strong>${MC.text(c.name)}</strong><small>${countByCat(c.name,c.id)}</small></button>`).join('');
    MC.qa('[data-cat]',wrap).forEach(b=>b.addEventListener('click',()=>{ selectedCategory=b.dataset.cat; renderCategories(); renderRestaurants(); }));
  }
  function countByCat(name,id){ if(id==='all') return `${data.restaurants.length} lojas`; return `${data.restaurants.filter(r=>r.category===name).length} lojas`; }
  function renderBanners(){
    const wrap=MC.q('#bannerGrid'); if(!wrap) return;
    const active=(data.banners||[]).filter(b=>b.active).slice(0,2);
    wrap.innerHTML=active.map((b,i)=>`<article class="banner ${i%2?'alt':''}"><span class="badge orange">Campanha</span><h3>${MC.text(b.title)}</h3><p>${MC.text(b.body)}</p><button class="btn sm" data-coupon="${MC.text(b.coupon||'')}">${MC.text(b.cta||'Ver oferta')}</button></article>`).join('');
    MC.qa('[data-coupon]',wrap).forEach(btn=>btn.addEventListener('click',()=>{ if(btn.dataset.coupon){ MC.q('#couponInput').value=btn.dataset.coupon; openDrawer('cartDrawer'); renderCart(); } else location.hash='#restaurantes'; }));
  }
  function renderRestaurants(){
    const grid=MC.q('#restaurantGrid'); if(!grid) return;
    const search=(MC.q('#searchInput')?.value||'').toLowerCase();
    const sort=MC.q('#sortSelect')?.value||'recommended';
    const filter=MC.q('#quickFilter')?.value||'all';
    let list=[...(data.restaurants||[])];
    if(selectedCategory!=='all') list=list.filter(r=>r.category===selectedCategory);
    if(search) list=list.filter(r=>[r.name,r.category,r.description,(r.tags||[]).join(' '),...MC.getProducts(data,r.id).map(p=>p.name+' '+p.description+' '+p.category)].join(' ').toLowerCase().includes(search));
    if(filter==='open') list=list.filter(r=>r.open);
    if(filter==='free') list=list.filter(r=>Number(r.deliveryFee||0)===0);
    if(filter==='coupon') list=list.filter(r=>MC.activeCoupons(data,r.id).length);
    if(filter==='super') list=list.filter(r=>r.superStore);
    const sorters={deliveryTime:(a,b)=>(a.deliveryTime||999)-(b.deliveryTime||999), deliveryFee:(a,b)=>(a.deliveryFee||999)-(b.deliveryFee||999), rating:(a,b)=>(b.rating||0)-(a.rating||0), minOrder:(a,b)=>(a.minOrder||999)-(b.minOrder||999), recommended:(a,b)=>(b.superStore-a.superStore)||((b.rating||0)-(a.rating||0))};
    list.sort(sorters[sort]||sorters.recommended);
    MC.q('#activeFilters').innerHTML=`<span class="badge">${list.length} resultados</span>${selectedCategory!=='all'?`<span class="badge orange">${MC.text(selectedCategory)}</span>`:''}${filter!=='all'?`<span class="badge">${MC.text(filter)}</span>`:''}`;
    grid.innerHTML=list.length?list.map(cardRestaurant).join(''):`<div class="empty">Nenhuma loja encontrada com esses filtros.</div>`;
    MC.qa('[data-open-restaurant]',grid).forEach(btn=>btn.addEventListener('click',()=>openRestaurant(btn.dataset.openRestaurant)));
    MC.qa('[data-fav]',grid).forEach(btn=>btn.addEventListener('click',(e)=>{ e.stopPropagation(); toggleFavorite(btn.dataset.fav); }));
  }
  function cardRestaurant(r){
    const fav=(data.customer.favorites||[]).includes(r.id);
    const coupon=MC.activeCoupons(data,r.id)[0];
    return `<article class="restaurant-card">
      <button class="heart ${fav?'active':''}" data-fav="${r.id}" title="Favorito">${fav?'♥':'♡'}</button>
      <div class="cover"><span>${MC.text(r.coverEmoji||'🍽️')}</span></div>
      <div class="restaurant-body">
        <div class="restaurant-title"><h4>${MC.text(r.name)}</h4><span class="badge ${r.open?'success':'danger'}">${r.open?'Aberto':'Fechado'}</span></div>
        <p>${MC.text(r.description||'')}</p>
        <div class="meta"><span class="badge">⭐ ${Number(r.rating||0).toFixed(1)}</span><span class="badge">${r.deliveryTime||'-'} min</span><span class="badge">${Number(r.deliveryFee||0)===0?'Entrega grátis':MC.money(r.deliveryFee)}</span>${r.superStore?'<span class="badge orange">Super</span>':''}${coupon?`<span class="badge orange">${MC.text(coupon.code)}</span>`:''}</div>
        <div class="row between" style="margin-top:14px"><small style="color:var(--muted);font-weight:800">Mín. ${MC.money(r.minOrder)}</small><button class="btn sm" data-open-restaurant="${r.id}">Ver cardápio</button></div>
      </div>
    </article>`;
  }
  function openRestaurant(id){
    currentRestaurant=MC.getRestaurant(data,id); if(!currentRestaurant) return;
    const prods=MC.getProducts(data,id);
    const payments=Object.entries(currentRestaurant.paymentMethods||{}).filter(([,v])=>v).map(([k])=>labelPayment(k)).join(', ');
    MC.q('#restaurantDetail').innerHTML=`
      <div class="cover" style="border-radius:24px;height:170px"><span>${MC.text(currentRestaurant.coverEmoji||'🍽️')}</span></div>
      <div class="section-head" style="margin-top:18px"><div><span class="badge orange">${MC.text(currentRestaurant.category)}</span><h3>${MC.text(currentRestaurant.name)}</h3><p>${MC.text(currentRestaurant.description)}</p></div><button class="btn secondary sm" data-fav-modal>${(data.customer.favorites||[]).includes(id)?'♥ Favorito':'♡ Favoritar'}</button></div>
      <div class="grid cols-4" style="margin-bottom:18px"><div class="metric"><span>Avaliação</span><strong>⭐ ${Number(currentRestaurant.rating||0).toFixed(1)}</strong></div><div class="metric"><span>Entrega</span><strong>${currentRestaurant.deliveryTime||'-'} min</strong></div><div class="metric"><span>Taxa</span><strong>${Number(currentRestaurant.deliveryFee||0)===0?'Grátis':MC.money(currentRestaurant.deliveryFee)}</strong></div><div class="metric"><span>Mínimo</span><strong>${MC.money(currentRestaurant.minOrder)}</strong></div></div>
      <div class="notice"><b>Endereço:</b> ${MC.text(currentRestaurant.street)}, ${MC.text(currentRestaurant.number)} — ${MC.text(currentRestaurant.neighborhood)}. <b>Pagamento:</b> ${payments||'Não informado'}.</div>
      <h3 style="letter-spacing:-.05em">Cardápio</h3>
      <div class="menu-grid">${prods.map(productCard).join('') || '<div class="empty">Nenhum produto cadastrado.</div>'}</div>`;
    MC.qa('[data-product]',MC.q('#restaurantDetail')).forEach(b=>b.addEventListener('click',()=>openProduct(b.dataset.product)));
    MC.q('[data-fav-modal]')?.addEventListener('click',()=>{toggleFavorite(id); openRestaurant(id);});
    openModal('restaurantModal');
  }
  function productCard(p){
    const price=p.promoPrice?`<span style="text-decoration:line-through;color:var(--muted);font-size:.82rem">${MC.money(p.price)}</span> ${MC.money(p.promoPrice)}`:MC.money(p.price);
    return `<button class="item-card ${!p.available?'unavailable':''}" data-product="${p.id}" ${!p.available?'disabled':''}><div><h4>${MC.text(p.name)}</h4><p>${MC.text(p.description)}</p><div class="price">${price}</div><small style="color:var(--muted);font-weight:800">${MC.text(p.serves||'')} • ${MC.text(p.weight||'')}</small></div>${productMedia(p)}</button>`;
  }
  function openProduct(id){
    currentProduct=(data.products||[]).find(p=>p.id===id); if(!currentProduct) return;
    const groups=(currentProduct.options||[]).map((g,gi)=>`<div class="card" style="box-shadow:none"><h4 style="margin:0 0 8px">${MC.text(g.group)} ${g.required?'<span class="badge danger">obrigatório</span>':''}</h4><p style="margin:0 0 10px;color:var(--muted);font-weight:700">Escolha até ${g.max||1}</p>${(g.items||[]).map((it,ii)=>`<label class="mini-item"><span>${MC.text(it.name)}</span><span class="row"><b>${it.price?MC.money(it.price):'Grátis'}</b><input type="checkbox" data-opt="${gi}" data-idx="${ii}"></span></label>`).join('')}</div>`).join('');
    MC.q('#productDetail').innerHTML=`<div class="row between"><div><span class="badge orange">${MC.text(currentProduct.category)}</span><h3 style="margin:8px 0 4px;letter-spacing:-.05em">${MC.text(currentProduct.name)}</h3><p style="color:var(--muted);font-weight:750">${MC.text(currentProduct.description)}</p></div>${productMedia(currentProduct,'large')}</div>
    <div class="notice"><b>Alérgenos:</b> ${MC.text(currentProduct.allergens||'Não informado')} • <b>Preparo:</b> ${currentProduct.prepTime||'-'} min</div>
    <div class="grid" style="margin-top:14px">${groups}<label class="field">Observação do item<textarea class="textarea" id="productNote" placeholder="Ex.: sem cebola, molho separado..."></textarea></label><div class="form-grid"><label class="field">Quantidade<input id="productQty" class="input" type="number" value="1" min="1"></label><div class="total-box"><div class="total-line final"><span>Total item</span><strong id="productTotal">${MC.money(itemBasePrice(currentProduct))}</strong></div></div></div><button class="btn block" id="addProductBtn">Adicionar à sacola</button></div>`;
    MC.qa('[data-opt]',MC.q('#productDetail')).forEach(i=>i.addEventListener('change',()=>{ limitOptions(i); updateProductTotal(); }));
    MC.q('#productQty')?.addEventListener('input',updateProductTotal);
    MC.q('#addProductBtn')?.addEventListener('click',addCurrentProduct);
    openModal('productModal');
  }
  function limitOptions(input){
    const group=currentProduct.options[Number(input.dataset.opt)];
    const checked=MC.qa(`[data-opt="${input.dataset.opt}"]:checked`,MC.q('#productDetail'));
    if(checked.length>Number(group.max||1)) input.checked=false;
  }
  function selectedOptions(){
    const out=[];
    MC.qa('[data-opt]:checked',MC.q('#productDetail')).forEach(i=>{
      const g=currentProduct.options[+i.dataset.opt]; const it=g.items[+i.dataset.idx];
      out.push({group:g.group,name:it.name,price:Number(it.price||0)});
    });
    return out;
  }
  function validateOptions(){
    for(let gi=0; gi<(currentProduct.options||[]).length; gi++){
      const g=currentProduct.options[gi];
      if(g.required && !MC.qa(`[data-opt="${gi}"]:checked`,MC.q('#productDetail')).length){ MC.toast(`Escolha uma opção em ${g.group}`); return false; }
    }
    return true;
  }
  function itemBasePrice(p){ return Number(p.promoPrice||p.price||0); }
  function updateProductTotal(){
    const qty=Math.max(1,Number(MC.q('#productQty')?.value||1));
    const extras=selectedOptions().reduce((s,o)=>s+Number(o.price||0),0);
    setText('productTotal',MC.money((itemBasePrice(currentProduct)+extras)*qty));
  }
  function addCurrentProduct(){
    if(!currentRestaurant||!currentProduct) return;
    if(!validateOptions()) return;
    if(cart.length && cart[0].restaurantId!==currentRestaurant.id){ if(!confirm('Sua sacola tem itens de outra loja. Limpar e continuar?')) return; cart=[]; }
    const opts=selectedOptions(); const qty=Math.max(1,Number(MC.q('#productQty')?.value||1));
    cart.push({id:MC.uid('cart'), restaurantId:currentRestaurant.id, productId:currentProduct.id, name:currentProduct.name, emoji:currentProduct.emoji, image:currentProduct.image||'', price:itemBasePrice(currentProduct), qty, options:opts, note:MC.q('#productNote')?.value||''});
    saveCart(); closeAll(); openDrawer('cartDrawer'); renderCart(); MC.toast('Item adicionado à sacola');
  }
  function saveCart(){ localStorage.setItem('menuclick_cart_v4',JSON.stringify(cart)); }
  function renderCart(){
    const wrap=MC.q('#cartItems'); if(!wrap) return;
    const store=cart[0]?MC.getRestaurant(data,cart[0].restaurantId):null;
    setText('cartCount',cart.reduce((s,i)=>s+i.qty,0));
    setText('cartStoreName',store?store.name:'Nenhum restaurante selecionado.');
    wrap.innerHTML=cart.length?cart.map(ci=>`<div class="cart-item">${cartMedia(ci)}<div><b>${MC.text(ci.name)}</b><small style="display:block;color:var(--muted);font-weight:800">${ci.options?.map(o=>o.name).join(', ')||'Sem adicionais'}${ci.note?` • ${MC.text(ci.note)}`:''}</small><div class="price">${MC.money((ci.price+(ci.options||[]).reduce((s,o)=>s+o.price,0))*ci.qty)}</div></div><div class="qty"><button data-dec="${ci.id}">−</button><b>${ci.qty}</b><button data-inc="${ci.id}">+</button></div></div>`):'<div class="empty">Sua sacola está vazia.</div>';
    MC.qa('[data-inc]',wrap).forEach(b=>b.addEventListener('click',()=>{const it=cart.find(i=>i.id===b.dataset.inc); if(it) it.qty++; saveCart(); renderCart();}));
    MC.qa('[data-dec]',wrap).forEach(b=>b.addEventListener('click',()=>{const it=cart.find(i=>i.id===b.dataset.dec); if(it){it.qty--; if(it.qty<=0) cart=cart.filter(x=>x.id!==it.id);} saveCart(); renderCart();}));
    renderTotals(store);
  }
  function calcTotals(store){
    const subtotal=cart.reduce((s,i)=>s+(i.price+(i.options||[]).reduce((a,o)=>a+o.price,0))*i.qty,0);
    const mode=MC.q('#modeInput')?.value||'delivery';
    let delivery= mode==='pickup'||!store ? 0 : Number(store.deliveryFee ?? data.settings.defaultDeliveryFee ?? 0);
    if(store && Number(store.freeDeliveryFrom||0)>0 && subtotal>=Number(store.freeDeliveryFrom)) delivery=0;
    const service=subtotal*Number(data.settings.serviceFeePercent||0)/100;
    const couponCode=(MC.q('#couponInput')?.value||'').trim().toUpperCase();
    let discount=0,couponMsg='';
    if(couponCode){
      const c=MC.activeCoupons(data,store?.id).find(x=>String(x.code).toUpperCase()===couponCode);
      if(!c) couponMsg='Cupom inválido ou expirado.';
      else if(subtotal<Number(c.minOrder||0)) couponMsg=`Pedido mínimo do cupom: ${MC.money(c.minOrder)}`;
      else { if(c.type==='fixed') discount=Number(c.value||0); if(c.type==='percent') discount=subtotal*Number(c.value||0)/100; if(c.type==='delivery') {discount+=delivery; delivery=0;} couponMsg='Cupom aplicado.'; }
    }
    const tip=Number(MC.q('#tipInput')?.value||0);
    const total=Math.max(0,subtotal+delivery+service+tip-discount);
    return {subtotal,delivery,service,tip,discount,total,couponCode,couponMsg};
  }
  function renderTotals(store){
    const t=calcTotals(store);
    MC.q('#totalsBox').innerHTML=`<div class="total-line"><span>Subtotal</span><b>${MC.money(t.subtotal)}</b></div><div class="total-line"><span>Entrega</span><b>${MC.money(t.delivery)}</b></div><div class="total-line"><span>Serviço</span><b>${MC.money(t.service)}</b></div><div class="total-line"><span>Gorjeta</span><b>${MC.money(t.tip)}</b></div><div class="total-line"><span>Desconto</span><b>− ${MC.money(t.discount)}</b></div>${t.couponMsg?`<small style="color:${t.discount?'var(--success)':'var(--danger)'};font-weight:900">${MC.text(t.couponMsg)}</small>`:''}<div class="total-line final"><span>Total</span><strong>${MC.money(t.total)}</strong></div>`;
  }
  function checkout(){
    if(!cart.length) return MC.toast('Adicione itens na sacola.');
    const store=MC.getRestaurant(data,cart[0].restaurantId); if(!store) return;
    const subtotal=cart.reduce((s,i)=>s+i.price*i.qty,0);
    if(subtotal<Number(store.minOrder||0)) return MC.toast(`Pedido mínimo da loja: ${MC.money(store.minOrder)}`);
    const addr=(data.addresses||[]).find(a=>a.isDefault) || data.addresses[0];
    if(!addr || !addr.street){ openModal('addressModal'); return MC.toast('Complete o endereço antes de finalizar.'); }
    const totals=calcTotals(store);
    const order={id:MC.uid('ped'), code:'#MC'+Math.floor(100000+Math.random()*899999), restaurantId:store.id, restaurantName:store.name, customer:MC.clone(data.customer), address:MC.clone(addr), items:MC.clone(cart), totals, payment:MC.q('#paymentInput')?.value, changeFor:MC.q('#changeInput')?.value||'', cpfNota:MC.q('#cpfNotaInput')?.value||'', note:MC.q('#orderNoteInput')?.value||'', mode:MC.q('#modeInput')?.value||'delivery', scheduledAt:MC.q('#scheduleInput')?.value||'', status:'received', createdAt:new Date().toISOString(), estimatedAt:new Date(Date.now()+Number(store.deliveryTime||35)*60000).toISOString(), deliveryPerson:{name:'Entregador parceiro', vehicle:'Moto', plate:'***-**00'}, confirmationCode:String(Math.floor(1000+Math.random()*9000))};
    data.orders.unshift(order); MC.addLog(data,'Novo pedido',`${order.code} em ${store.name}`); MC.save(data,false);
    cart=[]; saveCart(); renderAll(); closeAll(); MC.toast('Pedido realizado com sucesso'); location.hash='#pedidos'; openOrder(order.id);
  }
  function renderOrders(){
    const grid=MC.q('#ordersGrid'); if(!grid) return;
    const orders=data.orders||[];
    grid.innerHTML=orders.length?orders.map(o=>`<article class="card"><div class="section-head"><div><span class="badge orange">${MC.text(o.code)}</span><h3 style="margin:8px 0 4px">${MC.text(o.restaurantName)}</h3><p>${new Date(o.createdAt).toLocaleString('pt-BR')} • ${MC.STATUS_LABELS[o.status]||o.status}</p></div><strong>${MC.money(o.totals?.total)}</strong></div><div class="timeline">${timeline(o.status)}</div><button class="btn secondary sm" data-order="${o.id}" style="margin-top:14px">Detalhes</button></article>`).join(''):'<div class="empty">Nenhum pedido salvo ainda.</div>';
    MC.qa('[data-order]',grid).forEach(b=>b.addEventListener('click',()=>openOrder(b.dataset.order)));
  }
  function timeline(status){
    const idx=MC.STATUS_STEPS.indexOf(status);
    return MC.STATUS_STEPS.map((s,i)=>`<div class="step ${i<idx?'done':i===idx?'active':''}"><span class="step-dot">${i+1}</span><div><strong>${MC.STATUS_LABELS[s]}</strong><small>${i<=idx?'Atualizado':'Pendente'}</small></div></div>`).join('');
  }
  function openOrder(id){
    const o=(data.orders||[]).find(x=>x.id===id); if(!o) return;
    MC.q('#orderDetail').innerHTML=`<span class="badge orange">${MC.text(o.code)}</span><h3 style="letter-spacing:-.05em">${MC.text(o.restaurantName)}</h3><p style="color:var(--muted);font-weight:800">${new Date(o.createdAt).toLocaleString('pt-BR')} • ${MC.STATUS_LABELS[o.status]}</p><div class="timeline">${timeline(o.status)}</div><div class="total-box" style="margin:16px 0"><div class="total-line"><span>Total</span><b>${MC.money(o.totals?.total)}</b></div><div class="total-line"><span>Código de entrega</span><b>${MC.text(o.confirmationCode)}</b></div></div><h4>Itens</h4>${(o.items||[]).map(i=>`<div class="mini-item"><span>${i.qty}x ${MC.text(i.name)}</span><b>${MC.money(i.price*i.qty)}</b></div>`).join('')}<div class="grid cols-2" style="margin-top:16px"><button class="btn secondary" id="supportBtn">Pedir ajuda</button><button class="btn" id="rateBtn">Avaliar pedido</button></div>`;
    MC.q('#supportBtn')?.addEventListener('click',()=>{ const msg=prompt('Descreva o problema com o pedido:'); if(msg){ data.support.unshift({id:MC.uid('sup'), orderId:o.id, restaurantId:o.restaurantId, message:msg, status:'aberto', createdAt:new Date().toISOString()}); MC.addLog(data,'Suporte aberto',o.code); MC.save(data,false); MC.toast('Chamado registrado'); }});
    MC.q('#rateBtn')?.addEventListener('click',()=>{ const rating=Number(prompt('Nota de 1 a 5:','5')); const comment=prompt('Comentário da avaliação:','Muito bom!')||''; if(rating){ data.reviews.unshift({id:MC.uid('rev'), orderId:o.id, restaurantId:o.restaurantId, rating, comment, createdAt:new Date().toISOString()}); MC.addLog(data,'Avaliação criada',`${o.code} • ${rating} estrelas`); MC.save(data,false); MC.toast('Avaliação enviada'); }});
    openModal('orderModal');
  }
  function renderProfile(){
    MC.fillForm(MC.q('#profileForm'),data.customer||{});
    const list=MC.q('#paymentsList'); if(list) list.innerHTML=(data.payments||[]).map(p=>`<div class="mini-item"><div><b>${MC.text(p.label)}</b><small style="display:block;color:var(--muted);font-weight:800">${MC.text(p.masked||p.type)}</small></div><span class="badge ${p.active?'success':'danger'}">${p.active?'Ativo':'Inativo'}</span></div>`).join('')||'<div class="empty">Nenhuma forma cadastrada.</div>';
  }
  function saveProfile(e){ e.preventDefault(); data.customer=Object.assign(data.customer||{},MC.formToObj(e.currentTarget)); if(!data.customer.createdAt)data.customer.createdAt=new Date().toISOString(); MC.addLog(data,'Perfil atualizado',data.customer.email||data.customer.name||'Cliente'); MC.save(data,false); MC.toast('Perfil salvo'); closeAll(); renderAll(); }
  function renderAddresses(){
    MC.fillForm(MC.q('#addressForm'),{});
    const list=MC.q('#addressesList'); if(!list) return;
    list.innerHTML=(data.addresses||[]).map(a=>`<div class="card"><span class="badge ${a.isDefault?'orange':''}">${a.isDefault?'Padrão':MC.text(a.type)}</span><h4>${MC.text(a.label||'Endereço')}</h4><p style="color:var(--muted);font-weight:750">${MC.text(a.street)}, ${MC.text(a.number)} — ${MC.text(a.neighborhood)}<br>${MC.text(a.city)} / ${MC.text(a.state)}</p><div class="row"><button class="btn secondary sm" data-edit-address="${a.id}">Editar</button><button class="btn ghost sm" data-default-address="${a.id}">Padrão</button></div></div>`).join('')||'<div class="empty">Cadastre um endereço.</div>';
    MC.qa('[data-edit-address]',list).forEach(b=>b.addEventListener('click',()=>MC.fillForm(MC.q('#addressForm'),data.addresses.find(a=>a.id===b.dataset.editAddress))));
    MC.qa('[data-default-address]',list).forEach(b=>b.addEventListener('click',()=>{ data.addresses.forEach(a=>a.isDefault=a.id===b.dataset.defaultAddress); MC.save(data); renderAddresses(); renderTopAddress(); }));
  }
  function saveAddress(e){
    e.preventDefault(); const o=MC.formToObj(e.currentTarget); if(!o.id) o.id=MC.uid('addr');
    if(o.isDefault) (data.addresses||[]).forEach(a=>a.isDefault=false);
    const idx=(data.addresses||[]).findIndex(a=>a.id===o.id); if(idx>=0)data.addresses[idx]=o; else data.addresses.push(o);
    if(!data.addresses.some(a=>a.isDefault)) data.addresses[0].isDefault=true;
    MC.addLog(data,'Endereço salvo',o.label||o.street); MC.save(data,false); MC.toast('Endereço salvo'); renderAddresses(); renderTopAddress();
  }
  function renderTopAddress(){ const a=(data.addresses||[]).find(x=>x.isDefault)||data.addresses?.[0]; setText('topAddress', a?.street ? `${a.street}, ${a.number}` : 'Endereço'); }
  function useGps(){ if(!navigator.geolocation) return MC.toast('GPS indisponível neste navegador.'); navigator.geolocation.getCurrentPosition(pos=>{ const form=MC.q('#addressForm'); form.elements.lat.value=pos.coords.latitude.toFixed(6); form.elements.lng.value=pos.coords.longitude.toFixed(6); MC.toast('Coordenadas preenchidas'); },()=>MC.toast('Permissão de GPS negada.')); }
  function addPayment(){ const label=prompt('Nome da forma de pagamento:','Cartão final 1234'); if(!label) return; data.payments.push({id:MC.uid('pay'),type:'custom',label,masked:label,active:true}); MC.save(data); renderProfile(); }
  function deleteLocalData(){ if(confirm('Isso apagará perfil, endereços, pedidos e pagamentos locais. Continuar?')){ data.customer=MC.clone(MC.DEFAULT_DATA.customer); data.addresses=MC.clone(MC.DEFAULT_DATA.addresses); data.payments=MC.clone(MC.DEFAULT_DATA.payments); data.orders=[]; cart=[]; saveCart(); MC.save(data); renderAll(); closeAll(); MC.toast('Dados locais apagados'); } }
  function toggleFavorite(id){ data.customer.favorites=data.customer.favorites||[]; const i=data.customer.favorites.indexOf(id); if(i>=0)data.customer.favorites.splice(i,1); else data.customer.favorites.push(id); MC.save(data); renderRestaurants(); }
  function productMedia(p,variant=''){
    const cls=variant==='large' ? 'photo-bubble product-photo large' : 'photo-bubble product-photo';
    if(p.image) return `<img class="${cls}" src="${attr(p.image)}" alt="${MC.text(p.name)}">`;
    return `<span class="${cls}">${MC.text(p.emoji||'🍽️')}</span>`;
  }
  function cartMedia(item){
    if(item.image) return `<img class="photo-bubble product-photo cart" src="${attr(item.image)}" alt="${MC.text(item.name)}">`;
    return `<span class="photo-bubble product-photo cart">${MC.text(item.emoji||'🍽️')}</span>`;
  }
  function attr(v){ return String(v ?? '').replace(/[&<>\"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;'}[m])); }
  function labelPayment(k){ return ({pix:'Pix',credit:'Crédito',debit:'Débito',cash:'Dinheiro',vr:'Vale-refeição',wallet:'Carteira'})[k]||k; }
  function openDrawer(id){ MC.q('#'+id)?.classList.add('open'); renderCart(); }
  function openModal(id){ MC.q('#'+id)?.classList.add('open'); }
  function closeAll(){ MC.qa('.drawer.open,.modal.open').forEach(e=>e.classList.remove('open')); }
  function setText(id,v){ const e=MC.q('#'+id); if(e) e.textContent=v; }
})();
