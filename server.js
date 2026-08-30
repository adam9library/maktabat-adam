const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

dotenv.config();
const app = express();
const PORT = Number(process.env.PORT || 3000);
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) throw new Error('Missing Supabase configuration');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);
app.use(express.json({limit:'1mb'}));
app.use(express.static(path.join(__dirname,'public')));

function userClient(req){
  const token=(req.headers.authorization||'').replace(/^Bearer\s+/i,'').trim();
  if(!token) return null;
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY,{global:{headers:{Authorization:`Bearer ${token}`}}});
}

app.get('/api/health',(req,res)=>res.json({ok:true}));
app.get('/api/config',(req,res)=>res.json({ok:true,supabaseUrl:process.env.SUPABASE_URL}));

app.get('/api/products', async (req,res)=>{
  try{
    const {data,error}=await supabase.from('products').select('*').order('id',{ascending:false});
    if(error) throw error;
    const products=(data||[]).map(p=>({
      ...p,
      name:p.name||p.product_name||'منتج',
      price:Number(p.price||0),
      category:p.category||p.subcategory||'أخرى',
      imageUrls:Array.isArray(p.image_urls)?p.image_urls.filter(Boolean):(p.image_url?[p.image_url]:[]),
      featured:Boolean(p.featured),
      available:p.available!==false
    })).filter(p=>p.available);
    res.json({ok:true,products});
  }catch(e){console.error(e);res.status(500).json({ok:false,message:'تعذر تحميل المنتجات من قاعدة البيانات.'});}
});

app.post('/api/auth/login',async(req,res)=>{
  try{
    const {identifier,password}=req.body||{};
    if(!identifier||!password) return res.status(400).json({ok:false,message:'أدخل بيانات تسجيل الدخول.'});
    const isPhone=/^[+0-9][0-9\s-]{7,}$/.test(identifier);
    const {data,error}=await supabase.auth.signInWithPassword(isPhone?{phone:identifier.replace(/[\s-]/g,''),password}:{email:identifier,password});
    if(error) return res.status(401).json({ok:false,message:error.message});
    res.json({ok:true,session:data.session,user:data.user});
  }catch(e){res.status(500).json({ok:false,message:'تعذر تسجيل الدخول.'});}
});

app.post('/api/auth/signup',async(req,res)=>{
  try{
    const email=String(req.body?.email||'').trim().toLowerCase();
    const phone=String(req.body?.phone||'').trim().replace(/[\s-]/g,'');
    const password=String(req.body?.password||'');
    const name=String(req.body?.name||'').trim();
    if(!name) return res.status(400).json({ok:false,message:'أدخل الاسم الكامل.'});
    if(!password || password.length<6) return res.status(400).json({ok:false,message:'كلمة المرور يجب أن تكون 6 أحرف أو أكثر.'});
    if(!email&&!phone) return res.status(400).json({ok:false,message:'أدخل البريد الإلكتروني أو رقم الهاتف.'});
    if(email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ok:false,message:'البريد الإلكتروني غير صحيح.'});
    if(phone && !/^\+[1-9]\d{7,14}$/.test(phone) && !/^0\d{9,14}$/.test(phone)) return res.status(400).json({ok:false,message:'رقم الهاتف غير صحيح. استخدم صيغة مثل +9647xxxxxxxxx.'});

    // When an email is provided, use email as the Supabase login identity.
    // The phone is kept as profile metadata so signup does not depend on Supabase SMS settings.
    const credentials=email?{email,password}:{phone,password};
    const {data,error}=await supabase.auth.signUp({
      ...credentials,
      options:{data:{name,phone:phone||''}}
    });
    if(error){
      const msg=String(error.message||'تعذر إنشاء الحساب.');
      if(/already registered|already exists|user already/i.test(msg)) return res.status(409).json({ok:false,message:'هذا البريد أو الرقم مستخدم مسبقاً. جرّب تسجيل الدخول.'});
      return res.status(400).json({ok:false,message:msg});
    }
    const needsEmailConfirmation=Boolean(data.user?.email && !data.session);
    res.json({
      ok:true,
      session:data.session||null,
      user:data.user||null,
      message:needsEmailConfirmation?'تم إنشاء الحساب. راجع بريدك الإلكتروني لتأكيد الحساب ثم سجّل الدخول.':'تم إنشاء الحساب وتسجيل الدخول.'
    });
  }catch(e){
    console.error('Signup error:',e);
    res.status(500).json({ok:false,message:e?.message||'تعذر إنشاء الحساب. تأكد من إعدادات Supabase ثم حاول مرة أخرى.'});
  }
});

app.post('/api/orders',async(req,res)=>{
  try{
    const client=userClient(req);
    if(!client) return res.status(401).json({ok:false,message:'انتهت جلسة تسجيل الدخول. سجل الدخول ثم حاول إتمام الطلب.'});
    const {data:{user},error:userError}=await client.auth.getUser();
    if(userError||!user) return res.status(401).json({ok:false,message:'جلسة تسجيل الدخول غير صالحة. سجل الدخول مرة أخرى.'});
    const {items,customer,payment_method,note}=req.body||{};
    if(!Array.isArray(items)||!items.length||!customer?.name||!customer?.phone||!customer?.address||!customer?.province||!customer?.city||!customer?.landmark||!payment_method)
      return res.status(400).json({ok:false,message:'بيانات الطلب غير مكتملة. تأكد من الاسم والهاتف والمحافظة والمدينة والعنوان وأقرب نقطة دالة.'});
    const address=`${customer.province} - ${customer.city} - ${customer.address}${customer.landmark?` - ${customer.landmark}`:''}`;
    const base=items.map(x=>({
      product_id:x.id||null,
      product_name:x.name,
      customer_name:customer.name,
      customer_phone:customer.phone,
      customer_address:address,
      payment_method,
      note:note||null,
      status:'new'
    }));

    // Keep the existing orders schema intact. First associate the user when supported,
    // then retry without user_id if the table predates that column.
    let result=await client.from('orders').insert(base.map(row=>({...row,user_id:user.id})));
    if(result.error && /user_id|column .* does not exist|schema cache/i.test(result.error.message||'')){
      console.warn('orders.user_id is not available; retrying with the existing schema');
      result=await client.from('orders').insert(base);
    }
    if(result.error && payment_method==='qr' && /payment_method|invalid input value|check constraint|enum/i.test(result.error.message||'')){
      console.warn('orders.payment_method does not accept qr; retrying as visa with QR note');
      result=await client.from('orders').insert(base.map(row=>({...row,payment_method:'visa',note:[row.note,'QR'].filter(Boolean).join(' - ')})));
    }
    if(result.error) throw result.error;
    const orderNo=`AD-${Date.now().toString().slice(-8)}`;
    res.json({ok:true,orderNo,createdAt:new Date().toISOString(),userId:user.id});
  }catch(e){console.error('Order error:',e);res.status(500).json({ok:false,message:e.message||'تعذر حفظ الطلب. تأكد من إعداد جدول orders وصلاحيات Supabase.'});}
});

app.get('*splat',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log(`مكتبة آدم تعمل على http://localhost:${PORT}`));
