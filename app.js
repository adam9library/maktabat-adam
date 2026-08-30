const governorates={'بغداد':['بغداد','أبو غريب','المدائن','التاجي','الطارمية'],'البصرة':['البصرة','الزبير','أبو الخصيب','القرنة','الفاو','شط العرب'],'نينوى':['الموصل','تلعفر','الحمدانية','سنجار','الحضر','بعشيقة'],'أربيل':['أربيل','سوران','شقلاوة','كويسنجق','خبات','مخمور'],'السليمانية':['السليمانية','حلبجة','رانية','دوكان','جمجمال','كلار'],'دهوك':['دهوك','زاخو','سميل','العمادية','عقرة'],'كركوك':['كركوك','الحويجة','الدبس','الداقوق'],'الأنبار':['الرمادي','الفلوجة','حديثة','هيت','عانة','القائم','الرطبة'],'صلاح الدين':['تكريت','سامراء','بيجي','بلد','الدور','الشرقاط'],'ديالى':['بعقوبة','الخالص','المقدادية','بلدروز','خانقين','كفري'],'واسط':['الكوت','الحي','الصويرة','النعمانية','بدرة'],'بابل':['الحلة','المسيب','المحاويل','الهاشمية','القاسم'],'كربلاء':['كربلاء','الهندية','عين التمر'],'النجف':['النجف','الكوفة','المناذرة','المشخاب'],'القادسية':['الديوانية','الشامية','عفك','الحمزة','الدغارة'],'المثنى':['السماوة','الرميثة','الخضر','الوركاء','السلمان'],'ذي قار':['الناصرية','الشطرة','سوق الشيوخ','الرفاعي','الجبايش'],'ميسان':['العمارة','المجر الكبير','قلعة صالح','الكحلاء','علي الغربي']};
const fixedCategories=[
 {key:'mola',label:'ملازم',sub:'حسب الصفوف',icon:'📖'},
 {key:'books',label:'كتب',sub:'جميع الكتب',icon:'📚'},
 {key:'stationery',label:'قرطاسية',sub:'أقلام ودفاتر',icon:'✏️'},
 {key:'albums',label:'صور وألبومات',sub:'طباعة وتصميم',icon:'📷'},
 {key:'gifts',label:'هدايا',sub:'هدايا ومناسبات',icon:'🎁'},
 {key:'office',label:'أدوات مكتبية',sub:'منظمات وأدوات',icon:'🗂️'},
 {key:'electronics',label:'إلكترونيات',sub:'أجهزة وملحقات',icon:'🎧'},
 {key:'games',label:'ألعاب تعليمية',sub:'تعليم وترفيه',icon:'🧩'},
 {key:'services',label:'خدمات',sub:'صيانة وسوفتوير',icon:'🖥️'},
 {key:'other',label:'المزيد',sub:'منتجات أخرى',icon:'•••'}
];
const categoryAliases={mola:'ملازم',books:'كتب',stationery:'قرطاسية',albums:'صور وألبومات',gifts:'هدايا',office:'أدوات مكتبية',electronics:'إلكترونيات',games:'ألعاب تعليمية',services:'خدمات',other:'المزيد'};
function categoryLabel(v){const s=String(v||'').trim().toLowerCase();for(const c of fixedCategories){if(s===c.label.toLowerCase()||s===c.key)return c.label}if(s.includes('mola')||s.includes('worksheet')||s.includes('notebook'))return'ملازم';if(s.includes('book')||s.includes('كتب')||s.includes('كتاب'))return'كتب';if(s.includes('stationery')||s.includes('قرط'))return'قرطاسية';if(s.includes('album')||s.includes('photo')||s.includes('صور'))return'صور وألبومات';if(s.includes('gift')||s.includes('هدا'))return'هدايا';if(s.includes('office')||s.includes('مكتبي'))return'أدوات مكتبية';if(s.includes('elect')||s.includes('إلكتر'))return'إلكترونيات';if(s.includes('game')||s.includes('لعب'))return'ألعاب تعليمية';if(s.includes('service')||s.includes('خدم'))return'خدمات';return s||'المزيد'}
const categoryByLabel=label=>fixedCategories.find(c=>c.label===label)||fixedCategories.find(c=>c.label==='المزيد');
const FEES={SAMAWA:3000,OTHER:6000};
const state={screen:'home',category:'الكل',products:[],loading:true,error:'',cart:[],selected:null,qty:1,delivery:{province:'',city:'',name:'',address:'',landmark:'',phone:'',backup:''},payment:null,orderNo:'',session:null,user:null,carousel:0,authMode:'login'};
const main=document.getElementById('main'),nav=document.getElementById('bottomNav');
const money=n=>`${Number(n||0).toLocaleString('ar-IQ')} د.ع`;
const esc=s=>String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
const fee=()=>state.delivery.province==='المثنى'&&state.delivery.city==='السماوة'?FEES.SAMAWA:(state.delivery.province?FEES.OTHER:0);
const subtotal=()=>state.cart.reduce((s,x)=>s+Number(x.price||0)*x.qty,0);const total=()=>subtotal()+fee();
function productImage(p,cls='product-photo'){return p?.imageUrls?.[0]?`<img class="${cls}" src="${esc(p.imageUrls[0])}" alt="${esc(p.name)}" loading="lazy">`:`<div class="fallback-product">📚</div>`}
function render(){renderHeader();renderNav();const fn={home:renderHome,categories:renderCategories,products:renderProducts,detail:renderDetail,cart:renderCart,delivery:renderDelivery,payment:renderPayment,success:renderSuccess,account:renderAccount}[state.screen]||renderHome;fn()}
function renderHeader(){const count=state.cart.reduce((s,x)=>s+x.qty,0);document.getElementById('cartBadge').textContent=count;document.getElementById('cartBadge').classList.toggle('hidden',!count)}
function renderNav(){const items=[['home','⌂','الرئيسية'],['categories','▦','الأقسام'],['cart','🛒','السلة'],['orders','▤','طلباتي'],['account','♙','حسابي']];nav.innerHTML=items.map(([key,icon,label])=>`<button class="nav-item ${(state.screen===key||(key==='categories'&&state.screen==='products'))?'active':''}" data-nav="${key}"><span>${icon}</span><b>${label}</b>${key==='cart'&&state.cart.length?`<i>${state.cart.reduce((s,x)=>s+x.qty,0)}</i>`:''}</button>`).join('')}
function header(title='مكتبة آدم',back=''){return `<div class="screen-head">${back?`<button class="back-icon" data-go="${back}">‹</button>`:'<span class="head-spacer"></span>'}<div class="screen-title">${esc(title)}</div><img class="header-logo" src="/assets/adam-logo.jpeg" alt="شعار مكتبة آدم"></div>`}
function shell(inner){main.innerHTML=`<section class="content">${inner}</section>`}
function sectionTitle(title,action,label='عرض الكل'){return `<div class="section-row"><div class="section">${title}</div>${action?`<button class="link-btn" data-go="${action}">${label} ←</button>`:''}</div>`}
function categoryCard(c){return `<button class="category-card" data-category="${esc(c.label)}"><span class="cat-icon">${c.icon}</span><strong>${esc(c.label)}</strong><small>${esc(c.sub)}</small></button>`}
function categoriesGrid(){return fixedCategories.map(categoryCard).join('')}
function hero(){const featured=state.products.filter(p=>p.featured);const fp=featured.length?featured[state.carousel%featured.length]:null;return `<div class="hero"><div class="hero-copy"><div class="hero-brand">ADAM LIBRARY</div><h1>كل ما تحتاجه<br><span>في مكان واحد</span></h1><p>ملازم - كتب - قرطاسية - هدايا<br>والمزيد...</p><button class="gold-btn hero-btn" data-go="categories">تسوق الآن <span>←</span></button><div class="hero-dots">${(featured.length||3)?Array.from({length:Math.min(featured.length||3,3)},(_,i)=>`<i class="${i===(state.carousel%Math.min(featured.length||3,3))?'on':''}"></i>`).join(''):''}</div></div><div class="hero-art">${fp?productImage(fp,'hero-product'): '<div class="hero-stack"><span>📚</span><span>📓</span><span>🖊️</span></div>'}</div></div>`}
function featuredBlock(){const f=state.products.filter(p=>p.featured);if(!f.length)return'';return `<div class="featured-wrap">${sectionTitle('منتجات مميزة','products')}<div class="featured-strip">${f.map((p,i)=>`<button class="featured-card ${i===state.carousel%f.length?'active':''}" data-product="${esc(p.id)}">${productImage(p,'featured-photo')}<div><strong>${esc(p.name)}</strong><b>${money(p.price)}</b></div></button>`).join('')}</div></div>`}
function productCard(p){return `<article class="product-card"><button class="product-main" data-product="${esc(p.id)}"><div class="product-image">${productImage(p)}</div><div class="product-info"><strong>${esc(p.name)}</strong><small>${esc(categoryLabel(p.category))}</small><b>${money(p.price)}</b></div></button><button class="add-circle" data-add="${esc(p.id)}">+</button></article>`}
function renderHome(){shell(`${hero()}${sectionTitle('أقسام المكتبة','categories')}<div class="category-grid">${fixedCategories.slice(0,5).map(categoryCard).join('')}</div>${sectionTitle('أحدث المنتجات','products')}<div class="products-row">${state.loading?'<div class="muted">جاري تحميل المنتجات...</div>':state.error?`<div class="muted">${esc(state.error)}</div>`:state.products.slice(0,8).map(productCard).join('')}</div>${featuredBlock()}${sectionTitle('خدماتنا','products')}<div class="service-note"><span>🛠️</span><div><strong>خدمات مكتبة آدم</strong><small>صيانة أجهزة الكمبيوتر واللابتوبات • سوفتوير • خدمات مكتبية</small></div></div>`)}
function renderCategories(){shell(`${header('الأقسام','home')}<div class="page-title"><h1>الأقسام</h1><p>تصفح جميع أقسام المكتبة</p></div><div class="category-grid full">${categoriesGrid()}</div><div class="popular"><h2>الأقسام الأكثر تصفحاً</h2><div class="popular-row">${['الرابع العلمي','الخامس العلمي','السادس الإعدادي','الأول متوسط'].map((x,i)=>`<button data-category="كتب"><span>${['⚗️','⚛️','🧬','🎒'][i]}</span>${x}</button>`).join('')}</div></div>`)}
function renderProducts(){const items=state.category==='الكل'?state.products:state.products.filter(p=>categoryLabel(p.category)===state.category);shell(`${header(state.category,'categories')}<div class="page-title"><h1>${esc(state.category)}</h1><p>${items.length} منتج</p></div><div class="products-list">${items.length?items.map(productCard).join(''):'<div class="empty muted">لا توجد منتجات متوفرة في هذا القسم.</div>'}</div>`)}
function renderDetail(){const p=state.selected;if(!p){state.screen='products';return render()}shell(`${header('مكتبة آدم','products')}<div class="detail-image">${productImage(p,'detail-photo')}</div><div class="detail-meta"><div class="eyebrow">الرئيسية / ${esc(categoryLabel(p.category))}</div><h1>${esc(p.name)}</h1><div class="price-big">${money(p.price)}</div><div class="stock">✓ متوفر</div><div class="detail-card"><h3>الوصف</h3><p>${esc(p.description||'منتج متوفر في مكتبة آدم. السعر المعروض هو السعر المسجل في الموقع.')}</p></div><div class="qty"><button data-qty="-1">−</button><span>${state.qty}</span><button data-qty="1">+</button></div><button class="gold-btn" data-add-detail>أضف إلى السلة 🛒</button></div>`)}
function renderCart(){shell(`${header('السلة','home')}<div class="page-title"><h1>سلة المشتريات</h1><p>عدد المنتجات: ${state.cart.reduce((s,x)=>s+x.qty,0)}</p></div>${state.cart.length?`<div class="cart-list">${state.cart.map(x=>`<div class="cart-item"><button class="remove" data-remove="${esc(x.id)}">×</button><div class="product-image">${productImage(x)}</div><div class="product-info"><strong>${esc(x.name)}</strong><small>${esc(categoryLabel(x.category))}</small><b>${money(x.price*x.qty)}</b><div class="qty mini"><button data-update="${esc(x.id)}" data-delta="-1">−</button><span>${x.qty}</span><button data-update="${esc(x.id)}" data-delta="1">+</button></div></div></div>`).join('')}</div><div class="summary"><div class="summary-row"><span>المجموع الفرعي</span><strong>${money(subtotal())}</strong></div><div class="summary-row"><span>تكلفة التوصيل</span><strong>${fee()?money(fee()):'تحدد عند العنوان'}</strong></div><div class="summary-row total-row"><span>الإجمالي</span><strong class="price-big">${money(total())}</strong></div></div><button class="gold-btn" data-go="delivery">إتمام الطلب ←</button>`:'<div class="empty muted">السلة فارغة حالياً.</div>'}`)}
function renderDelivery(){const d=state.delivery,cities=governorates[d.province]||[];shell(`${header('إتمام الطلب','cart')}<div class="steps"><span class="done">1 السلة</span><span class="active">2 العنوان</span><span>3 الدفع</span><span>4 التأكيد</span></div><div class="page-title"><h1>بيانات التوصيل</h1><p>أدخل معلومات التوصيل بدقة</p></div><div class="form-card">${field('name','الاسم الكامل *',d.name)}${field('phone','رقم الهاتف *',d.phone,'','tel')}<label class="label">المحافظة *<div class="select-grid">${Object.keys(governorates).map(p=>`<button class="chip ${d.province===p?'active':''}" data-province="${esc(p)}">${esc(p)}</button>`).join('')}</div></label><label class="label">المنطقة / القضاء *<div class="select-grid">${cities.map(c=>`<button class="chip ${d.city===c?'active':''}" data-city="${esc(c)}">${esc(c)}</button>`).join('')}</div></label>${field('address','العنوان بالتفصيل *',d.address)}${field('landmark','أقرب نقطة دالة *',d.landmark,'مثال: قرب مدرسة / سوق')}${field('backup','رقم احتياطي (اختياري)',d.backup,'','tel')}</div><div class="summary"><div class="summary-row"><span>المجموع</span><strong>${money(subtotal())}</strong></div><div class="summary-row"><span>التوصيل</span><strong>${fee()?money(fee()):'—'}</strong></div><div class="summary-row total-row"><span>الإجمالي</span><strong class="price-big">${money(total())}</strong></div></div><button class="gold-btn" data-next-payment>متابعة إلى الدفع ←</button>`)}
function renderPayment(){shell(`${header('إتمام الطلب','delivery')}<div class="steps"><span class="done">1 السلة</span><span class="done">2 العنوان</span><span class="active">3 الدفع</span><span>4 التأكيد</span></div><div class="page-title"><h1>اختر طريقة الدفع</h1><p>اختر الطريقة المناسبة لك لإكمال عملية الدفع</p></div><button class="pay-card ${state.payment==='qr'?'active':''}" data-payment="qr"><span class="pay-icon">▣</span><div><strong>الدفع الإلكتروني عبر QR</strong><small>امسح الكود من تطبيق مصرفك وأدخل المبلغ المطلوب</small></div><em>${state.payment==='qr'?'●':'○'}</em></button><button class="pay-card ${state.payment==='cod'?'active':''}" data-payment="cod"><span class="pay-icon">💵</span><div><strong>الدفع عند الاستلام</strong><small>ادفع عند استلام طلبك</small></div><em>${state.payment==='cod'?'●':'○'}</em></button><div class="summary"><h3>ملخص الطلب</h3><div class="summary-row"><span>المجموع الفرعي</span><strong>${money(subtotal())}</strong></div><div class="summary-row"><span>تكلفة التوصيل</span><strong>${money(fee())}</strong></div><div class="summary-row total-row"><span>الإجمالي الكلي</span><strong class="price-big">${money(total())}</strong></div></div><button type="button" class="gold-btn" data-confirm>${state.payment==='qr'?'متابعة الدفع':'تأكيد الطلب'} 🔒</button>`)}
function renderSuccess(){main.innerHTML=`<div class="success"><div class="success-icon">✓</div><h1>تم استلام طلبك</h1><p>رقم الطلب: <b>${esc(state.orderNo)}</b></p><div class="price-big">${money(total())}</div><p class="muted">تم حفظ الطلب بنجاح.</p><button class="gold-btn" data-home-success>العودة للرئيسية</button></div>`;nav.innerHTML=''}
function renderAccount(){shell(`${header('حسابي','home')}<div class="auth">${state.session?`<div class="avatar">♙</div><h1>حسابي</h1><p class="muted">${esc(state.user?.email||state.user?.phone||'')}</p><button class="gold-btn" data-logout>تسجيل الخروج</button>`:`<div class="avatar">♙</div><h1>تسجيل الدخول</h1><p class="muted">سجل دخولك للوصول إلى حسابك وإتمام الطلبات.</p><div class="auth-tabs"><button class="chip ${state.authMode==='login'?'active':''}" data-auth-mode="login">تسجيل الدخول</button><button class="chip ${state.authMode==='signup'?'active':''}" data-auth-mode="signup">إنشاء حساب</button></div>${authForm(state.authMode)}`}</div>`)}
function authForm(mode){return mode==='login'?`${field('authIdentifier','البريد الإلكتروني أو رقم الهاتف','','','text')}${field('authPassword','كلمة المرور','','','password')}<button type="button" class="gold-btn" data-login>تسجيل الدخول</button>`:`${field('authName','الاسم الكامل','','','text')}${field('authEmail','البريد الإلكتروني','','','email')}${field('authPhone','رقم الهاتف (اختياري)','','','tel')}${field('authSignupPassword','كلمة المرور','','','password')}<button type="button" class="gold-btn" data-signup>إنشاء الحساب</button>`}
function field(k,label,v,ph='',type='text'){return `<label class="label">${label}<input class="input" data-field="${k}" value="${esc(v)}" placeholder="${esc(ph||label)}" type="${type}"></label>`}
function openQR(){document.getElementById('modal').innerHTML=`<div class="modal-card payment-modal"><button class="close" data-close>×</button><div class="mini-logo large"><strong>آدم</strong><small>ADAM LIBRARY</small></div><h2>الدفع الإلكتروني</h2><p>امسح الكود التالي من تطبيق مصرفك</p><div class="qr"><img src="/assets/payment-qr.jpeg" alt="QR"></div><div class="amount-card"><span>المبلغ المطلوب</span><strong>${money(total())}</strong><button data-copy-amount>نسخ المبلغ</button></div><label class="label">رقم العملية / ملاحظة (اختياري)<input class="input" data-field="paymentNote" placeholder="أدخل رقم العملية أو أي ملاحظة"></label><button type="button" class="gold-btn" data-qr-done="1">تم الدفع / متابعة</button></div>`;document.getElementById('modal').classList.remove('hidden')}
function closeModal(){document.getElementById('modal').classList.add('hidden')}
function toast(msg){const el=document.createElement('div');el.className='toast';el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),3000)}
function add(p){const e=state.cart.find(x=>String(x.id)===String(p.id));if(e)e.qty++;else state.cart.push({...p,qty:1});toast('تمت إضافة المنتج للسلة');render()}
async function loadProducts(){try{const r=await fetch('/api/products');const j=await r.json();if(!j.ok)throw Error();state.products=j.products||[]}catch(e){state.error='تعذر تحميل المنتجات من قاعدة البيانات.'}finally{state.loading=false;render()}}
async function apiJson(url, options={}){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),15000);
  try{
    const r=await fetch(url,{...options,signal:controller.signal});
    let j={};
    try{j=await r.json()}catch{}
    if(!r.ok||j.ok===false) throw Error(j.message||`تعذر تنفيذ العملية (${r.status})`);
    return j;
  }catch(e){
    if(e.name==='AbortError') throw Error('انتهت مهلة الاتصال بالخادم. تأكد أن Node.js يعمل ثم حاول مرة أخرى.');
    throw e;
  }finally{clearTimeout(timer)}
}
function setButtonBusy(btn,busy,label){if(!btn)return;if(busy){btn.dataset.oldLabel=btn.innerHTML;btn.disabled=true;btn.classList.add('is-busy');btn.innerHTML='جارِ التنفيذ...'}else{btn.disabled=false;btn.classList.remove('is-busy');if(btn.dataset.oldLabel)btn.innerHTML=btn.dataset.oldLabel}}
async function login(btn=document.querySelector('[data-login]')){
  const identifier=document.querySelector('[data-field="authIdentifier"]')?.value.trim(),password=document.querySelector('[data-field="authPassword"]')?.value;
  if(!identifier||!password)return toast('أدخل البريد/الهاتف وكلمة المرور');
  setButtonBusy(btn,true);
  try{
    const j=await apiJson('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({identifier,password})});
    state.session=j.session;state.user=j.user;localStorage.setItem('adam_session',JSON.stringify(j.session));toast('تم تسجيل الدخول بنجاح');render();
  }catch(e){toast(e.message)}finally{setButtonBusy(btn,false)}
}
async function signup(btn=document.querySelector('[data-signup]')){
  const body={
    name:document.querySelector('[data-field="authName"]')?.value.trim(),
    email:document.querySelector('[data-field="authEmail"]')?.value.trim(),
    phone:document.querySelector('[data-field="authPhone"]')?.value.trim(),
    password:document.querySelector('[data-field="authSignupPassword"]')?.value
  };
  if(!body.name)return toast('أدخل الاسم الكامل');
  if(!body.email&&!body.phone)return toast('أدخل البريد الإلكتروني أو رقم الهاتف');
  if(body.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email))return toast('أدخل بريد إلكتروني صحيح');
  if(body.phone && !/^[+0-9][0-9\s-]{7,}$/.test(body.phone))return toast('أدخل رقم هاتف صحيح');
  if(!body.password||body.password.length<6)return toast('كلمة المرور يجب أن تكون 6 أحرف أو أكثر');
  setButtonBusy(btn,true);
  try{
    const j=await apiJson('/api/auth/signup',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)});
    if(j.session){
      state.session=j.session;state.user=j.user;
      localStorage.setItem('adam_session',JSON.stringify(j.session));
      toast('تم إنشاء الحساب وتسجيل الدخول بنجاح');
      state.screen='home';render();
    }else{
      state.authMode='login';
      render();
      toast(j.message||'تم إنشاء الحساب. راجع بريدك لتأكيد الحساب ثم سجل الدخول.');
    }
  }catch(e){toast(e.message||'تعذر إنشاء الحساب.')}finally{setButtonBusy(btn,false)}
}
async function confirmOrder(btn=document.querySelector('[data-confirm]')){
  if(!state.payment)return toast('اختر طريقة الدفع أولاً');
  if(!state.session)return toast('سجل الدخول أولاً لإتمام الطلب');
  if(!state.cart.length)return toast('السلة فارغة');
  if(!state.session.access_token)return toast('انتهت جلسة الدخول. سجل الدخول مرة أخرى.');
  if(state.payment==='qr'&&!state.qrConfirmed)return openQR();
  setButtonBusy(btn,true);
  try{
    const note=state.payment==='qr'?`دفع QR${state.paymentNote?` - ${state.paymentNote}`:''}`:'';
    const j=await apiJson('/api/orders',{method:'POST',headers:{'Content-Type':'application/json',Authorization:`Bearer ${state.session.access_token}`},body:JSON.stringify({items:state.cart.map(x=>({id:x.id,name:x.name,price:x.price,qty:x.qty})),customer:state.delivery,payment_method:state.payment,note})});
    state.orderNo=j.orderNo||`AD-${Date.now().toString().slice(-6)}`;state.screen='success';render();
  }catch(e){
    toast(e.message||'تعذر إتمام الطلب.');
  }finally{setButtonBusy(btn,false)}
}
async function handleAppClick(e){
  const t=e.target.closest('button');
  if(!t)return;
  const d=t.dataset;
  e.preventDefault();
  try{
    if(d.action==='home'||d.nav==='home'||d.go==='home'){state.screen='home';return render()}
    if(d.action==='cart'||d.nav==='cart'||d.go==='cart'){state.screen='cart';return render()}
    if(d.nav==='categories'||d.go==='categories'){state.screen='categories';return render()}
    if(d.nav==='orders'){return toast('قسم طلباتي جاهز لربطه بسجل الطلبات')}
    if(d.nav==='account'||d.account||d.go==='account'){state.screen='account';return render()}
    if(d.go==='products'){state.screen='products';return render()}
    if(d.category){state.category=d.category;state.screen='products';return render()}
    if(d.product){state.selected=state.products.find(p=>String(p.id)===d.product);state.qty=1;state.screen='detail';return render()}
    if(d.add){const p=state.products.find(p=>String(p.id)===d.add);if(p)add(p);return}
    if(d.addDetail){for(let i=0;i<state.qty;i++)add(state.selected);return}
    if(d.qty){state.qty=Math.max(1,state.qty+Number(d.qty));return render()}
    if(d.update){const x=state.cart.find(x=>String(x.id)===d.update);if(x)x.qty=Math.max(1,x.qty+Number(d.delta));return render()}
    if(d.remove){state.cart=state.cart.filter(x=>String(x.id)!==d.remove);return render()}
    if(d.province){state.delivery.province=d.province;state.delivery.city='';return render()}
    if(d.city){state.delivery.city=d.city;return render()}
    if(d.nextPayment){const v=state.delivery;if(!v.name||!v.phone||!v.province||!v.city||!v.address||!v.landmark)return toast('يرجى إكمال معلومات التوصيل');state.screen='payment';return render()}
    if(d.payment){state.payment=d.payment;state.qrConfirmed=false;render();if(d.payment==='qr')openQR();return}
    if(Object.prototype.hasOwnProperty.call(d,'qrDone')){state.qrConfirmed=true;closeModal();return confirmOrder(t)}
    if(Object.prototype.hasOwnProperty.call(d,'copyAmount')){try{await navigator.clipboard.writeText(String(total()));toast('تم نسخ المبلغ')}catch{toast('تعذر النسخ تلقائياً')}return}
    if(Object.prototype.hasOwnProperty.call(d,'confirm'))return confirmOrder(t)
    if(d.homeSuccess){state.cart=[];state.payment=null;state.qrConfirmed=false;state.screen='home';return render()}
    if(d.authMode){state.authMode=d.authMode;return render()}
    if(Object.prototype.hasOwnProperty.call(d,'login'))return login(t)
    if(Object.prototype.hasOwnProperty.call(d,'signup'))return signup(t)
    if(Object.prototype.hasOwnProperty.call(d,'logout')){state.session=null;state.user=null;localStorage.removeItem('adam_session');return render()}
    if(Object.prototype.hasOwnProperty.call(d,'close'))return closeModal()
  }catch(err){console.error(err);toast(err?.message||'حدث خطأ غير متوقع. حاول مرة أخرى.')}
}
document.addEventListener('click',handleAppClick);
window.addEventListener('error',e=>{console.error(e.error||e.message);toast('حدث خطأ في التطبيق. حاول مرة أخرى.')});
window.addEventListener('unhandledrejection',e=>{console.error(e.reason);toast(e.reason?.message||'تعذر تنفيذ العملية. حاول مرة أخرى.')});
document.addEventListener('input',e=>{const k=e.target.dataset.field;if(!k)return;if(k in state.delivery)state.delivery[k]=e.target.value;else if(k==='paymentNote')state.paymentNote=e.target.value});
try{const s=JSON.parse(localStorage.getItem('adam_session')||'null');if(s?.access_token){state.session=s;state.user={email:s.user?.email,phone:s.user?.phone}}}catch{}
render();loadProducts();setInterval(()=>{if(state.screen==='home'&&state.products.length){state.carousel++;render()}},4500);
