/* MenuClick UI Pro Fix — dados e utilitários compartilhados */
(function(){
  'use strict';
  const KEY = 'menuclick_ui_pro_v4';
  const STORE_STATUSES = ['received','confirmed','preparing','onroute','delivered','cancelled'];
  const STATUS_LABELS = {
    received:'Recebido', confirmed:'Confirmado', preparing:'Em preparo', onroute:'Saiu para entrega', delivered:'Entregue', cancelled:'Cancelado', refunded:'Reembolsado'
  };
  const STATUS_STEPS = ['received','confirmed','preparing','onroute','delivered'];
  const DEFAULT_DATA = {
    settings:{
      appName:'MenuClick', slogan:'Delivery profissional em poucos cliques.', city:'São Paulo', accent:'#ff7900',
      serviceFeePercent:4.9, defaultDeliveryFee:7.99, freeDeliveryFrom:99.9,
      allowScheduledOrders:true, enablePix:true, enableCash:true, enableCard:true,
      privacyText:'Usamos seus dados apenas para cadastro, entrega, atendimento, segurança e melhoria do serviço. Protótipo local: não salve dados sensíveis reais.',
      notices:['Bem-vindo ao MenuClick Pro: app do cliente + painel da loja + painel dos criadores.','Protótipo local: para produção, conecte banco de dados, login e pagamento real.']
    },
    categories:[
      {id:'cat_lanches', name:'Lanches', emoji:'🍔', sort:1, active:true},
      {id:'cat_pizza', name:'Pizza', emoji:'🍕', sort:2, active:true},
      {id:'cat_japonesa', name:'Japonesa', emoji:'🍣', sort:3, active:true},
      {id:'cat_brasileira', name:'Brasileira', emoji:'🍛', sort:4, active:true},
      {id:'cat_doces', name:'Doces', emoji:'🍰', sort:5, active:true},
      {id:'cat_bebidas', name:'Bebidas', emoji:'🥤', sort:6, active:true},
      {id:'cat_mercado', name:'Mercado', emoji:'🛒', sort:7, active:true},
      {id:'cat_saudavel', name:'Saudável', emoji:'🥗', sort:8, active:true}
    ],
    banners:[
      {id:'ban_1', title:'Primeiro pedido com desconto', body:'Use MENU10 e ganhe R$10,00 em compras acima de R$40,00.', cta:'Usar MENU10', coupon:'MENU10', active:true},
      {id:'ban_2', title:'Entrega grátis em lojas selecionadas', body:'Filtre por entrega grátis e veja ofertas perto de você.', cta:'Ver lojas', coupon:'FRETEGRATIS', active:true}
    ],
    restaurants:[
      {id:'r_burger', name:'Orange Burger House', legalName:'Orange Burger House LTDA', cnpj:'12.345.678/0001-90', ownerEmail:'dono@orangeburger.com', category:'Lanches', coverEmoji:'🍔', description:'Hambúrguer artesanal, combos e batata crocante.', minOrder:25, deliveryFee:6.99, freeDeliveryFrom:80, deliveryTime:32, preparationTime:18, deliveryRadiusKm:7.5, rating:4.8, reviewCount:186, street:'Av. Principal', number:'1200', neighborhood:'Centro', city:'São Paulo', state:'SP', cep:'01000-000', tags:['Cupom','Super loja','Mais pedido'], subcategories:['Hambúrguer','Combo','Porções'], paymentMethods:{pix:true, credit:true, debit:true, cash:true, vr:false}, schedule:{mon:'18:00-23:30',tue:'18:00-23:30',wed:'18:00-23:30',thu:'18:00-23:30',fri:'18:00-00:30',sat:'18:00-00:30',sun:'18:00-23:00'}, open:true, verified:true, superStore:true},
      {id:'r_pizza', name:'Forno Click Pizzaria', legalName:'Forno Click Pizzaria ME', cnpj:'98.765.432/0001-12', ownerEmail:'adm@fornoclick.com', category:'Pizza', coverEmoji:'🍕', description:'Pizzas tradicionais, especiais e doces no forno.', minOrder:39.9, deliveryFee:8.5, freeDeliveryFrom:120, deliveryTime:45, preparationTime:30, deliveryRadiusKm:9, rating:4.7, reviewCount:92, street:'Rua das Massas', number:'77', neighborhood:'Jardim', city:'São Paulo', state:'SP', cep:'01111-111', tags:['Família','Promoção'], subcategories:['Pizza grande','Pizza doce','Bebidas'], paymentMethods:{pix:true, credit:true, debit:true, cash:true, vr:false}, schedule:{mon:'18:00-23:00',tue:'18:00-23:00',wed:'18:00-23:00',thu:'18:00-23:00',fri:'18:00-00:00',sat:'18:00-00:00',sun:'18:00-23:00'}, open:true, verified:true, superStore:false},
      {id:'r_sushi', name:'Nami Sushi Express', legalName:'Nami Sushi Express LTDA', cnpj:'22.222.222/0001-22', ownerEmail:'nami@sushi.com', category:'Japonesa', coverEmoji:'🍣', description:'Combinados, temaki, yakisoba e pratos orientais.', minOrder:45, deliveryFee:0, freeDeliveryFrom:70, deliveryTime:38, preparationTime:24, deliveryRadiusKm:6, rating:4.9, reviewCount:221, street:'Rua Oriental', number:'555', neighborhood:'Liberdade', city:'São Paulo', state:'SP', cep:'01500-000', tags:['Entrega grátis','Top avaliação','Cupom'], subcategories:['Sushi','Temaki','Combinados'], paymentMethods:{pix:true, credit:true, debit:true, cash:false, vr:true}, schedule:{mon:'11:00-22:30',tue:'11:00-22:30',wed:'11:00-22:30',thu:'11:00-22:30',fri:'11:00-23:30',sat:'11:00-23:30',sun:'12:00-22:00'}, open:true, verified:true, superStore:true}
    ],
    products:[
      {id:'p_b1', restaurantId:'r_burger', name:'Combo Smash Duplo', category:'Combos', emoji:'🍔', price:39.9, promoPrice:34.9, stock:50, serves:'1 pessoa', weight:'420g', description:'Smash duplo, cheddar, bacon, batata e refri.', allergens:'Glúten, leite', nutrition:'Aprox. 980 kcal', prepTime:18, available:true, featured:true, options:[{group:'Adicionais',required:false,max:3,items:[{name:'Bacon extra',price:5},{name:'Cheddar extra',price:4},{name:'Onion rings',price:6}]},{group:'Ponto da carne',required:true,max:1,items:[{name:'Ao ponto',price:0},{name:'Bem passado',price:0}]}]},
      {id:'p_b2', restaurantId:'r_burger', name:'Batata Supreme', category:'Porções', emoji:'🍟', price:24.9, promoPrice:0, stock:40, serves:'2 pessoas', weight:'350g', description:'Batata com cheddar, bacon e molho especial.', allergens:'Leite', nutrition:'Aprox. 620 kcal', prepTime:12, available:true, featured:false, options:[{group:'Molho',required:false,max:2,items:[{name:'Maionese verde',price:2},{name:'Barbecue',price:2}]}]},
      {id:'p_b3', restaurantId:'r_burger', name:'Milkshake Chocolate', category:'Bebidas', emoji:'🥤', price:18.9, promoPrice:0, stock:25, serves:'1 pessoa', weight:'400ml', description:'Milkshake cremoso de chocolate.', allergens:'Leite', nutrition:'Aprox. 520 kcal', prepTime:8, available:true, featured:false, options:[]},
      {id:'p_p1', restaurantId:'r_pizza', name:'Pizza Calabresa Grande', category:'Pizzas', emoji:'🍕', price:59.9, promoPrice:49.9, stock:30, serves:'3 pessoas', weight:'8 fatias', description:'Calabresa, cebola, muçarela e orégano.', allergens:'Glúten, leite', nutrition:'Aprox. 1800 kcal', prepTime:30, available:true, featured:true, options:[{group:'Borda',required:false,max:1,items:[{name:'Catupiry',price:8},{name:'Cheddar',price:8}]}]},
      {id:'p_p2', restaurantId:'r_pizza', name:'Pizza Meio a Meio', category:'Pizzas', emoji:'🍕', price:69.9, promoPrice:0, stock:30, serves:'3 pessoas', weight:'8 fatias', description:'Escolha dois sabores especiais.', allergens:'Glúten, leite', nutrition:'Variável', prepTime:34, available:true, featured:false, options:[{group:'Sabores',required:true,max:2,items:[{name:'Frango catupiry',price:0},{name:'Portuguesa',price:0},{name:'Quatro queijos',price:3},{name:'Chocolate',price:5}]}]},
      {id:'p_s1', restaurantId:'r_sushi', name:'Combinado 32 peças', category:'Combinados', emoji:'🍱', price:89.9, promoPrice:79.9, stock:20, serves:'2 pessoas', weight:'32 peças', description:'Seleção de sushis, sashimis e uramakis.', allergens:'Peixe, soja', nutrition:'Aprox. 1100 kcal', prepTime:26, available:true, featured:true, options:[{group:'Molhos',required:false,max:2,items:[{name:'Tarê extra',price:2},{name:'Shoyu light',price:1}]}]},
      {id:'p_s2', restaurantId:'r_sushi', name:'Temaki Salmão', category:'Temakis', emoji:'🌯', price:34.9, promoPrice:0, stock:28, serves:'1 pessoa', weight:'1 unidade', description:'Temaki de salmão com cream cheese e cebolinha.', allergens:'Peixe, leite, soja', nutrition:'Aprox. 390 kcal', prepTime:16, available:true, featured:false, options:[]}
    ],
    coupons:[
      {id:'c_1', code:'MENU10', restaurantId:'', type:'fixed', value:10, minOrder:40, expiresAt:'2027-12-31', usageLimit:999, used:0, active:true},
      {id:'c_2', code:'FRETEGRATIS', restaurantId:'r_sushi', type:'delivery', value:0, minOrder:50, expiresAt:'2027-12-31', usageLimit:300, used:0, active:true}
    ],
    customer:{name:'', email:'', phone:'', cpf:'', birth:'', gender:'', photo:'', contactPreference:'whatsapp', marketing:false, terms:false, createdAt:new Date().toISOString(), lastAccess:new Date().toISOString(), status:'active'},
    addresses:[{id:'a_1', label:'Casa', type:'casa', cep:'', street:'', number:'', complement:'', neighborhood:'', city:'São Paulo', state:'SP', reference:'', instructions:'', lat:'', lng:'', isDefault:true}],
    payments:[{id:'pay_pix', type:'pix', label:'Pix', masked:'Chave Pix não cadastrada', active:true}],
    orders:[], reviews:[
      {id:'rev_demo_1', orderId:'demo_1', restaurantId:'r_burger', restaurantName:'Orange Burger House', customerName:'Mariana S.', rating:5, comment:'Pedido chegou rápido, bem embalado e o lanche estava muito bom.', photos:['data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27640%27%20height%3D%27420%27%20viewBox%3D%270%200%20640%20420%27%3E%0A%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20x2%3D%271%27%20y1%3D%270%27%20y2%3D%271%27%3E%3Cstop%20stop-color%3D%27%23fff2e6%27/%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ffffff%27/%3E%3C/linearGradient%3E%3C/defs%3E%0A%3Crect%20width%3D%27640%27%20height%3D%27420%27%20rx%3D%2742%27%20fill%3D%27url%28%23g%29%27/%3E%0A%3Ccircle%20cx%3D%27520%27%20cy%3D%2770%27%20r%3D%27110%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.16%27/%3E%0A%3Ccircle%20cx%3D%27110%27%20cy%3D%27350%27%20r%3D%27145%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.09%27/%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27190%27%20text-anchor%3D%27middle%27%20font-size%3D%2796%27%3E%F0%9F%8D%94%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27265%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27800%27%20font-size%3D%2730%27%20fill%3D%27%2328180f%27%3ECombo%20muito%20caprichado%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27305%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27700%27%20font-size%3D%2718%27%20fill%3D%27%238a6d5c%27%3EFoto%20de%20avalia%C3%A7%C3%A3o%20MenuClick%3C/text%3E%0A%3C/svg%3E'], createdAt:'2026-06-10T19:20:00.000Z'},
      {id:'rev_demo_2', orderId:'demo_2', restaurantId:'r_pizza', restaurantName:'Forno Click Pizzaria', customerName:'Rafael M.', rating:4, comment:'Pizza bem recheada e chegou quentinha. Gostei da borda.', photos:['data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27640%27%20height%3D%27420%27%20viewBox%3D%270%200%20640%20420%27%3E%0A%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20x2%3D%271%27%20y1%3D%270%27%20y2%3D%271%27%3E%3Cstop%20stop-color%3D%27%23fff7ed%27/%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ffffff%27/%3E%3C/linearGradient%3E%3C/defs%3E%0A%3Crect%20width%3D%27640%27%20height%3D%27420%27%20rx%3D%2742%27%20fill%3D%27url%28%23g%29%27/%3E%0A%3Ccircle%20cx%3D%27520%27%20cy%3D%2770%27%20r%3D%27110%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.16%27/%3E%0A%3Ccircle%20cx%3D%27110%27%20cy%3D%27350%27%20r%3D%27145%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.09%27/%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27190%27%20text-anchor%3D%27middle%27%20font-size%3D%2796%27%3E%F0%9F%8D%95%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27265%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27800%27%20font-size%3D%2730%27%20fill%3D%27%2328180f%27%3EPizza%20chegou%20quentinha%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27305%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27700%27%20font-size%3D%2718%27%20fill%3D%27%238a6d5c%27%3EFoto%20de%20avalia%C3%A7%C3%A3o%20MenuClick%3C/text%3E%0A%3C/svg%3E'], createdAt:'2026-06-11T21:05:00.000Z'},
      {id:'rev_demo_3', orderId:'demo_3', restaurantId:'r_sushi', restaurantName:'Nami Sushi Express', customerName:'Camila A.', rating:5, comment:'Apresentação bonita, peças frescas e entrega dentro do prazo.', photos:['data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%27http%3A//www.w3.org/2000/svg%27%20width%3D%27640%27%20height%3D%27420%27%20viewBox%3D%270%200%20640%20420%27%3E%0A%3Cdefs%3E%3ClinearGradient%20id%3D%27g%27%20x1%3D%270%27%20x2%3D%271%27%20y1%3D%270%27%20y2%3D%271%27%3E%3Cstop%20stop-color%3D%27%23fff4e6%27/%3E%3Cstop%20offset%3D%271%27%20stop-color%3D%27%23ffffff%27/%3E%3C/linearGradient%3E%3C/defs%3E%0A%3Crect%20width%3D%27640%27%20height%3D%27420%27%20rx%3D%2742%27%20fill%3D%27url%28%23g%29%27/%3E%0A%3Ccircle%20cx%3D%27520%27%20cy%3D%2770%27%20r%3D%27110%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.16%27/%3E%0A%3Ccircle%20cx%3D%27110%27%20cy%3D%27350%27%20r%3D%27145%27%20fill%3D%27%23ff7900%27%20opacity%3D%27.09%27/%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27190%27%20text-anchor%3D%27middle%27%20font-size%3D%2796%27%3E%F0%9F%8D%A3%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27265%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27800%27%20font-size%3D%2730%27%20fill%3D%27%2328180f%27%3ESushi%20bem%20apresentado%3C/text%3E%0A%3Ctext%20x%3D%27320%27%20y%3D%27305%27%20text-anchor%3D%27middle%27%20font-family%3D%27Arial%2C%20sans-serif%27%20font-weight%3D%27700%27%20font-size%3D%2718%27%20fill%3D%27%238a6d5c%27%3EFoto%20de%20avalia%C3%A7%C3%A3o%20MenuClick%3C/text%3E%0A%3C/svg%3E'], createdAt:'2026-06-12T12:45:00.000Z'}
    ], support:[], logs:[]
  };
  function clone(x){return JSON.parse(JSON.stringify(x));}
  function load(){
    try{ const raw=localStorage.getItem(KEY); if(!raw){ const d=clone(DEFAULT_DATA); save(d,false); return d; } const d=JSON.parse(raw); return normalize(d); }
    catch(e){ console.warn('MenuClick: resetando dados locais',e); const d=clone(DEFAULT_DATA); save(d,false); return d; }
  }
  function normalize(d){
    const base=clone(DEFAULT_DATA); const out=Object.assign(base,d||{});
    out.settings=Object.assign(base.settings,d.settings||{});
    ['categories','banners','restaurants','products','coupons','orders','addresses','payments','reviews','support','logs'].forEach(k=>{ if(!Array.isArray(out[k])) out[k]=base[k]; });
    if(Array.isArray(out.reviews) && out.reviews.length===0 && base.reviews?.length){ out.reviews=base.reviews; }
    out.customer=Object.assign(base.customer,d.customer||{});
    return out;
  }
  function save(data,log=true){
    if(log && data && data.customer) data.customer.lastAccess=new Date().toISOString();
    localStorage.setItem(KEY, JSON.stringify(data));
    queueCloudSave(data);
    return data;
  }
  function reset(){ localStorage.removeItem(KEY); const d=clone(DEFAULT_DATA); save(d,false); return d; }
  function uid(prefix='id'){ return prefix+'_'+Date.now().toString(36)+'_'+Math.random().toString(36).slice(2,8); }
  function money(n){ return Number(n||0).toLocaleString('pt-BR',{style:'currency',currency:'BRL'}); }
  function onlyNumber(v){return String(v||'').replace(/\D/g,'');}
  function text(v){ return String(v ?? '').replace(/[<>&]/g, m=>({'<':'&lt;','>':'&gt;','&':'&amp;'}[m])); }
  function slug(v){ return String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,''); }
  function q(sel,root=document){ return root.querySelector(sel); }
  function qa(sel,root=document){ return [...root.querySelectorAll(sel)]; }
  function formToObj(form){
    const o={};
    if(!form) return o;
    new FormData(form).forEach((v,k)=>{ o[k]=v; });
    qa('input[type=checkbox]',form).forEach(i=>{ o[i.name]=i.checked; });
    return o;
  }
  function fillForm(form,obj={}){
    if(!form) return;
    [...form.elements].forEach(el=>{
      if(!el.name) return;
      const v=obj[el.name];
      if(el.type==='checkbox') el.checked=!!v;
      else el.value = v ?? '';
    });
  }
  function addLog(data,action,detail){
    data.logs=data.logs||[];
    data.logs.unshift({id:uid('log'), action, detail, at:new Date().toISOString()});
    data.logs=data.logs.slice(0,150);
    save(data,false);
  }
  function toast(msg){
    let el=q('.toast');
    if(!el){ el=document.createElement('div'); el.className='toast'; document.body.appendChild(el); }
    el.textContent=msg; el.classList.add('show'); clearTimeout(el._t); el._t=setTimeout(()=>el.classList.remove('show'),2600);
  }
  function setActiveView(view){
    qa('[data-view]').forEach(b=>b.classList.toggle('active', b.dataset.view===view));
    qa('.admin-view').forEach(s=>s.classList.toggle('active', s.id==='view-'+view));
  }
  function applyBrand(data){
    const name=data.settings?.appName || 'MenuClick';
    const accent=data.settings?.accent || '#ff7900';
    document.documentElement.style.setProperty('--orange', accent);
    qa('.brand h1').forEach(e=>e.textContent=name);
    document.title=document.title.replace(/^.*?(\s\|)/, name+'$1');
  }
  function getRestaurant(data,id){ return (data.restaurants||[]).find(r=>r.id===id); }
  function getProducts(data,restaurantId){ return (data.products||[]).filter(p=>p.restaurantId===restaurantId); }
  function activeCategories(data){ return (data.categories||[]).filter(c=>c.active).sort((a,b)=>(+a.sort||0)-(+b.sort||0)); }
  function activeCoupons(data,restaurantId=''){
    const today=new Date().toISOString().slice(0,10);
    return (data.coupons||[]).filter(c=>c.active && (!c.expiresAt || c.expiresAt>=today) && (!restaurantId || !c.restaurantId || c.restaurantId===restaurantId));
  }
  function parseList(v){ return String(v||'').split(',').map(s=>s.trim()).filter(Boolean); }
  function parseOptions(raw){
    return String(raw||'').split('\n').map(line=>line.trim()).filter(Boolean).map(line=>{
      const [group,required,max,itemsRaw]=line.split('|');
      return {group:group||'Opções', required:String(required)==='true', max:Number(max||1), items:String(itemsRaw||'').split(',').filter(Boolean).map(p=>{ const [name,price]=p.split(':'); return {name:(name||'').trim(), price:Number(price||0)}; })};
    });
  }
  function optionsToRaw(options=[]){ return options.map(g=>`${g.group}|${!!g.required}|${g.max||1}|${(g.items||[]).map(i=>`${i.name}:${i.price||0}`).join(',')}`).join('\n'); }
  function downloadJSON(name,obj){
    const blob=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob); const a=document.createElement('a'); a.href=url; a.download=name; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  }

  /* ==========================
     MenuClick + Supabase
     Modo iniciante: sincroniza o estado do app inteiro na tabela public.app_state.
     Mantém localStorage como cache, então o app continua abrindo mesmo sem internet.
     ========================== */
  let cloudClient=null, cloudSaveTimer=null, cloudBusy=false, cloudLastError='';
  function cloudConfig(){
    const c=window.MENUCLICK_SUPABASE || {};
    return {
      enabled: c.enabled === true,
      url: String(c.url||'').trim(),
      publishableKey: String(c.publishableKey||c.anonKey||'').trim(),
      table: String(c.table||'app_state').trim(),
      rowId: String(c.rowId||'menuclick-main').trim()
    };
  }
  function cloudReady(){
    const c=cloudConfig();
    return !!(c.enabled && c.url.startsWith('https://') && c.publishableKey && !c.url.includes('COLE_AQUI') && !c.publishableKey.includes('COLE_AQUI') && window.supabase && window.supabase.createClient);
  }
  function cloudStatus(){ return { enabled: cloudReady(), configured: cloudConfig().enabled, lastError: cloudLastError }; }
  function getCloudClient(){
    if(!cloudReady()) return null;
    if(!cloudClient){ const c=cloudConfig(); cloudClient=window.supabase.createClient(c.url,c.publishableKey); }
    return cloudClient;
  }
  function isEmptyState(obj){ return !obj || (typeof obj==='object' && !Array.isArray(obj) && Object.keys(obj).length===0); }
  function queueCloudSave(data){
    if(cloudBusy || !cloudReady()) return;
    clearTimeout(cloudSaveTimer);
    cloudSaveTimer=setTimeout(()=>cloudPush(data,{silent:true}),700);
  }
  async function cloudPush(data,{silent=false}={}){
    const client=getCloudClient(); if(!client) return false;
    const c=cloudConfig();
    try{
      const payload=normalize(clone(data||load()));
      const { error } = await client.from(c.table).upsert({ id:c.rowId, data:payload, updated_at:new Date().toISOString() });
      if(error) throw error;
      cloudLastError='';
      if(!silent) toast('Dados enviados para o Supabase.');
      return true;
    }catch(err){
      cloudLastError=err?.message || String(err);
      console.error('MenuClick Supabase upload:',err);
      if(!silent) toast('Erro ao enviar para o Supabase. Veja o console.');
      return false;
    }
  }
  async function cloudPull({silent=false,reload=true}={}){
    const client=getCloudClient(); if(!client) return null;
    const c=cloudConfig();
    try{
      const { data:row, error } = await client.from(c.table).select('data,updated_at').eq('id',c.rowId).maybeSingle();
      if(error) throw error;
      if(!row || isEmptyState(row.data)){
        await cloudPush(load(),{silent:true});
        if(!silent) toast('Primeira sincronização criada no Supabase.');
        return load();
      }
      const remote=normalize(row.data);
      const remoteRaw=JSON.stringify(remote);
      const localRaw=localStorage.getItem(KEY)||'';
      if(remoteRaw !== localRaw){
        cloudBusy=true;
        localStorage.setItem(KEY,remoteRaw);
        cloudBusy=false;
        window.dispatchEvent(new CustomEvent('menuclick:cloud-sync',{detail:remote}));
        if(!silent) toast('Dados atualizados pelo Supabase.');
        if(reload) setTimeout(()=>location.reload(),250);
      }
      cloudLastError='';
      return remote;
    }catch(err){
      cloudBusy=false;
      cloudLastError=err?.message || String(err);
      console.error('MenuClick Supabase download:',err);
      if(!silent) toast('Erro ao buscar dados do Supabase. Veja o console.');
      return null;
    }
  }
  function initCloudSync(){
    if(!cloudReady()) return;
    cloudPull({silent:true,reload:true});
    // Verifica alterações feitas por outro painel/celular a cada 20 segundos.
    setInterval(()=>cloudPull({silent:true,reload:true}),20000);
  }
  setTimeout(initCloudSync,900);

  window.MC={KEY, DEFAULT_DATA, STATUS_LABELS, STATUS_STEPS, STORE_STATUSES, clone, load, save, reset, uid, money, onlyNumber, text, slug, q, qa, formToObj, fillForm, addLog, toast, setActiveView, applyBrand, getRestaurant, getProducts, activeCategories, activeCoupons, parseList, parseOptions, optionsToRaw, downloadJSON, cloudConfig, cloudReady, cloudStatus, cloudPush, cloudPull, initCloudSync};
})();
