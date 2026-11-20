// ==================== 存檔庫管理 (LocalStorage Multi-Agency Save System) ====================
const STORAGE_KEY = 'kpop_agency_tycoon_saves_v1';

function getAllSaves() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveCurrentAgency() {
  if (!state.agencyName) return;
  try {
    const saves = getAllSaves();
    const key = state.agencyName.trim().toUpperCase();
    saves[key] = {
      agencyName: key,
      week: state.week,
      money: state.money,
      fans: state.fans,
      reputation: state.reputation,
      musicShowWins: state.musicShowWins,
      roster: state.roster,
      auditionPool: state.auditionPool,
      groups: state.groups,
      activeDashGroupId: state.activeDashGroupId,
      discography: state.discography,
      activeSongs: state.activeSongs,
      logs: state.logs,
      usedNames: Array.from(state.usedNames),
      savedAt: new Date().toLocaleString('zh-Hant')
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));

    const indicator = document.getElementById('autosave-indicator');
    if (indicator) {
      indicator.textContent = '💾 已自動存檔';
      indicator.classList.remove('text-zinc-400');
      indicator.classList.add('text-emerald-400');
    }
  } catch (e) {
    console.warn('存檔失敗:', e);
  }
}

function loadAgencyFromSave(saveData) {
  state.agencyName = saveData.agencyName;
  state.week = saveData.week || 1;
  state.money = saveData.money ?? 80000;
  state.fans = saveData.fans || 0;
  state.reputation = saveData.reputation ?? 10;
  state.musicShowWins = saveData.musicShowWins || 0;
  state.roster = saveData.roster || [];
  state.auditionPool = saveData.auditionPool || [];
  state.selectedForDebut = [];
  state.groups = saveData.groups || [];
  state.activeDashGroupId = saveData.activeDashGroupId || (state.groups[0]?.id || null);
  state.discography = saveData.discography || [];
  state.activeSongs = saveData.activeSongs || [];
  state.logs = saveData.logs || [];
  state.usedNames = new Set(saveData.usedNames || state.roster.map(r => r.name));
}

function deleteAgencySave(nameKey) {
  const saves = getAllSaves();
  delete saves[nameKey];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(saves));
  checkAgencyNameInput();
  renderSavedAgenciesList();
}

// ==================== 遊戲狀態與資料庫 ====================
let selectedNewGameMoney = 80000;
let selectedNewGameRep = 10;

const state = {
  agencyName: 'NOVA ENTERTAINMENT',
  week: 1,
  money: 80000,
  fans: 0,
  reputation: 10,
  musicShowWins: 0,
  roster: [],
  auditionPool: [],
  selectedForDebut: [],
  groups: [],
  activeDashGroupId: null,
  discography: [],
  activeSongs: [],
  logs: [],
  usedNames: new Set()
};

const DAYS = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];

const SCHEDULES = {
  vocal: {
    short: '🎤 聲樂課',
    label: '🎤 聲樂特訓',
    desc: '唱功 +1 | 體力 -4 | 壓力 +3 | -$80',
    badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
    cost: 80
  },
  dance: {
    short: '💃 舞蹈課',
    label: '💃 舞蹈編排',
    desc: '舞蹈 +1 | 體力 -5 | 壓力 +3 | -$80',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-500/40',
    cost: 80
  },
  rap: {
    short: '🔥 饒舌課',
    label: '🔥 饒舌作詞',
    desc: '饒舌 +1 | 體力 -3 | 壓力 +2 | -$70',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
    cost: 70
  },
  variety: {
    short: '📺 綜藝通告',
    label: '📺 綜藝通告',
    desc: '魅力 +1 | 粉絲 +120 | +$350 | 壓力 +4',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
    cost: 0
  },
  busking: {
    short: '🎸 街頭路演',
    label: '🎸 街頭路演',
    desc: '唱/舞 +1 | 粉絲 +160 | 體力 -6 | -$40',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    cost: 40
  },
  fanmeet: {
    short: '💖 簽售見面',
    label: '💖 粉絲簽售',
    desc: '粉絲 +200 | +$600 | 壓力 +4 (需已出道)',
    badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
    cost: 60
  },
  rest: {
    short: '🛌 宿舍休假',
    label: '🛌 宿舍休假',
    desc: '體力 +14 | 壓力 -12 | 免費',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    cost: 0
  }
};

// ==================== 3,700+ 純原創素人練習生名字生成器 ====================
const KR_SURNAMES = [
  '金', '李', '朴', '崔', '鄭', '姜', '趙', '尹', '張', '林',
  '韓', '吳', '徐', '申', '權', '黃', '安', '宋', '全', '洪',
  '高', '文', '梁', '孫', '裴', '白', '許', '劉', '南', '沈',
  '盧', '河', '郭', '成', '車', '朱', '禹', '具', '閔', '柳'
];

const KR_GIVEN_NAMES = [
  { zh: '瑞希', en: 'Seohee' }, { zh: '智允', en: 'Jiyoon' }, { zh: '夏琳', en: 'Harin' },
  { zh: '宥娜', en: 'Yoona' }, { zh: '采琳', en: 'Chaerin' }, { zh: '秀雅', en: 'Sua' },
  { zh: '多恩', en: 'Daeun' }, { zh: '恩菲', en: 'Eunbi' }, { zh: '詩雅', en: 'Sia' },
  { zh: '佳律', en: 'Gayul' }, { zh: '藝娜', en: 'Yena' }, { zh: '敏彩', en: 'Minchae' },
  { zh: '知安', en: 'Jian' }, { zh: '娜律', en: 'Nayul' }, { zh: '彩恩', en: 'Chaeeun' },
  { zh: '度希', en: 'Dohee' }, { zh: '世琳', en: 'Serim' }, { zh: '惠律', en: 'Hyeyul' },
  { zh: '雅律', en: 'Ayul' }, { zh: '寶敏', en: 'Bomin' }, { zh: '昭律', en: 'Soyul' },
  { zh: '智安', en: 'Jian' }, { zh: '瑜彬', en: 'Yubin' }, { zh: '雪雅', en: 'Seola' },
  { zh: '海律', en: 'Haeyul' }, { zh: '圭琳', en: 'Gyurin' }, { zh: '禮恩', en: 'Yeeun' },
  { zh: '彩媛', en: 'Chaewon' }, { zh: '留娜', en: 'Ryuna' }, { zh: '舒雅', en: 'Seoa' },
  { zh: '知律', en: 'Jiyul' }, { zh: '瑞律', en: 'Seoyul' }, { zh: '恩律', en: 'Eunyul' },
  { zh: '允瑞', en: 'Yunseo' }, { zh: '泰琳', en: 'Taerin' }, { zh: '秀律', en: 'Suyul' },
  { zh: '孝琳', en: 'Hyorin' }, { zh: '宥琳', en: 'Yurim' }, { zh: '徐律', en: 'Seoyul' },
  { zh: '智律', en: 'Jiyul' }, { zh: '定恩', en: 'Jeongeun' }, { zh: '多律', en: 'Dayul' },
  { zh: '慧律', en: 'Hyeyul' }, { zh: '丹雅', en: 'Dana' }, { zh: '敏律', en: 'Minyul' },
  { zh: '宇彬', en: 'Woobin' }, { zh: '道律', en: 'Doyul' }, { zh: '俊宇', en: 'Junwoo' },
  { zh: '承浩', en: 'Seungho' }, { zh: '宰賢', en: 'Jaehyun' }, { zh: '旻宰', en: 'Minjae' },
  { zh: '知赫', en: 'Jihyuk' }, { zh: '順宇', en: 'Soonwoo' }, { zh: '圓俊', en: 'Wonjun' },
  { zh: '碩宇', en: 'Seokwoo' }, { zh: '勝宇', en: 'Seungwoo' }, { zh: '燦宇', en: 'Chanwoo' },
  { zh: '泳俊', en: 'Youngjun' }, { zh: '柱赫', en: 'Juhyuk' }, { zh: '賢宇', en: 'Hyunwoo' },
  { zh: '善宇', en: 'Sunwoo' }, { zh: '泰俊', en: 'Taejun' }, { zh: '在赫', en: 'Jaehyuk' },
  { zh: '道赫', en: 'Dohyuk' }, { zh: '廷宇', en: 'Jungwoo' }, { zh: '楷俊', en: 'Kaejun' }
];

const JP_SURNAMES = ['佐藤', '鈴木', '高橋', '田中', '渡邊', '伊藤', '山本', '中村', '小林', '加藤', '吉田', '山田', '佐佐木', '山口', '松本', '井上', '木村', '林', '清水', '山崎'];
const JP_GIVEN_NAMES = [
  { zh: '美咲', en: 'Misaki' }, { zh: '陽菜', en: 'Hina' }, { zh: '結衣', en: 'Yui' },
  { zh: '杏奈', en: 'Anna' }, { zh: '凜音', en: 'Rinne' }, { zh: '花音', en: 'Kanon' },
  { zh: '心音', en: 'Kokone' }, { zh: '芽依', en: 'Mei' }, { zh: '琴音', en: 'Kotone' },
  { zh: '遙香', en: 'Haruka' }, { zh: '彩花', en: 'Ayaka' }, { zh: '真優', en: 'Mayu' },
  { zh: '蓮斗', en: 'Rento' }, { zh: '悠斗', en: 'Yuto' }, { zh: '陸斗', en: 'Rikuto' },
  { zh: '颯太', en: 'Sota' }, { zh: '翔太', en: 'Shota' }, { zh: '海斗', en: 'Kaito' }
];

const TW_SURNAMES = ['陳', '林', '黃', '張', '李', '王', '吳', '劉', '蔡', '楊', '許', '鄭', '謝', '郭', '洪', '邱', '曾', '廖', '賴', '徐'];
const TW_GIVEN_NAMES = [
  { zh: '語希', en: 'Yuxi' }, { zh: '芯語', en: 'Xinyu' }, { zh: '沐晴', en: 'Muqing' },
  { zh: '芷若', en: 'Zhiruo' }, { zh: '星潼', en: 'Xingtong' }, { zh: '羽彤', en: 'Yutong' },
  { zh: '安琪', en: 'Angel' }, { zh: '思涵', en: 'Sihan' }, { zh: '若曦', en: 'Ruoxi' },
  { zh: '子軒', en: 'Zixuan' }, { zh: '宇辰', en: 'Yuchen' }, { zh: '柏翰', en: 'Bohan' },
  { zh: '承恩', en: 'Chengen' }, { zh: '宥嘉', en: 'Youjia' }, { zh: '品睿', en: 'Pinrui' }
];

const EN_FIRST_NAMES = ['Chloe', 'Hannah', 'Grace', 'Olivia', 'Mia', 'Sophia', 'Claire', 'Alice', 'Stella', 'Bella', 'Audrey', 'Evelyn', 'Lucas', 'Ethan', 'Liam', 'Noah', 'Leo', 'Jayden', 'Kevin', 'Dylan'];
const EN_LAST_NAMES = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Kang', 'Cho', 'Yoon', 'Jang', 'Lim', 'Han', 'Shin', 'Kwon', 'Song', 'Ahn', 'Yoo', 'Yang', 'Moon', 'Bae', 'Baek'];

const TOTAL_POSSIBLE_NAMES =
  (KR_SURNAMES.length * KR_GIVEN_NAMES.length) +
  (JP_SURNAMES.length * JP_GIVEN_NAMES.length) +
  (TW_SURNAMES.length * TW_GIVEN_NAMES.length) +
  (EN_FIRST_NAMES.length * EN_LAST_NAMES.length);

const RIVAL_SONGS = [
  { artist: 'aespa', title: 'Whiplash', power: 88 },
  { artist: 'IVE', title: 'HEYA', power: 85 },
  { artist: 'NewJeans', title: 'How Sweet', power: 86 },
  { artist: 'LE SSERAFIM', title: 'CRAZY', power: 82 },
  { artist: '(G)I-DLE', title: 'Klaxon', power: 80 },
  { artist: 'SEVENTEEN', title: 'MAESTRO', power: 87 },
  { artist: 'Stray Kids', title: 'Chk Chk Boom', power: 84 },
  { artist: 'RIIZE', title: 'Boom Boom Bass', power: 76 },
  { artist: 'KISS OF LIFE', title: 'Sticky', power: 74 },
  { artist: 'ILLIT', title: 'Magnetic', power: 83 }
];

const RANDOM_EVENTS = [
  {
    title: '🔥 成員直拍影片在 YouTube 瘋傳！',
    desc: '一段舞台直拍（Fancam）在網路上突破 300 萬觀看，各大論壇都在討論你家藝人的舞台魅力！',
    choices: [
      {
        text: '趁勢買下社群熱搜推廣 (-$3,000，粉絲大幅暴增)',
        action: () => {
          if (state.money < 3000) return alert('資金不足！');
          state.money -= 3000;
          addFansToAgency(4500);
          state.reputation += 4;
          addLog('🔥 抓住直拍爆紅契機順勢行銷，全社新增 4,500 名粉絲！', 'text-pink-400');
        }
      },
      {
        text: '保持自然熱度，讓口碑自然發酵 (免費，粉絲穩定增長)',
        action: () => {
          addFansToAgency(1800);
          state.reputation += 2;
          addLog('✨ 直拍口碑自然發酵，新增 1,800 名粉絲。', 'text-emerald-400');
        }
      }
    ]
  },
  {
    title: '💎 國際美妝品牌發來代言邀約',
    desc: '知名韓系彩妝品牌看中了旗下藝人的高顏值與潛力，希望簽下季度廣告代言！',
    choices: [
      {
        text: '接下代言！賺取豐厚廣告費 (+$14,000，全員壓力 +10)',
        action: () => {
          state.money += 14000;
          state.reputation += 3;
          state.roster.forEach(m => m.stress = Math.min(100, m.stress + 10));
          addLog('💰 成功簽下美妝品牌代言，進帳 $14,000！', 'text-emerald-400');
        }
      },
      {
        text: '為了專心準備音樂作品婉拒邀約 (聲望 +1，全員壓力 -5)',
        action: () => {
          state.reputation += 1;
          state.roster.forEach(m => m.stress = Math.max(0, m.stress - 5));
          addLog('🎵 婉拒商業代言專注音樂，獲得樂評人好評。', 'text-zinc-300');
        }
      }
    ]
  },
  {
    title: '⚠️ 匿名論壇出現惡意造謠貼文',
    desc: 'Pann 與 theqoo 論壇突然出現針對旗下練習生的不實校園霸凌指控，引起網友熱議。',
    choices: [
      {
        text: '委託頂級律師事務所強硬提告並發布聲明 (-$5,000，聲望 +3)',
        action: () => {
          if (state.money < 5000) return alert('資金不足！');
          state.money -= 5000;
          state.reputation += 3;
          addLog('⚖️ 公司強硬提告造謠者，粉絲大讚公關處理果斷！', 'text-emerald-400');
        }
      },
      {
        text: '冷處理等待風波過去 (聲望 -4，流失 800 粉絲)',
        action: () => {
          state.reputation = Math.max(0, state.reputation - 4);
          state.fans = Math.max(0, state.fans - 800);
          addLog('📉 謠言未及時澄清，部分路人粉選擇脫粉。', 'text-rose-400');
        }
      }
    ]
  },
  {
    title: '😤 練習室深夜爆發意見衝突',
    desc: '因為高強度練習與走位分配問題，兩位成員在練習室發生爭執，氣氛十分緊繃。',
    choices: [
      {
        text: '經理人親自出面請吃韓牛烤肉深談 (-$1,500，全員壓力 -20)',
        action: () => {
          state.money = Math.max(0, state.money - 1500);
          state.roster.forEach(m => m.stress = Math.max(0, m.stress - 20));
          addLog('🥩 一頓頂級韓牛化解了心結，團隊默契更上一層樓！', 'text-emerald-400');
        }
      },
      {
        text: '嚴厲訓斥並要求加練兩小時 (舞蹈 +2，全員壓力 +15)',
        action: () => {
          state.roster.forEach(m => {
            m.dance = Math.min(100, m.dance + 2);
            m.stress = Math.min(100, m.stress + 15);
          });
          addLog('💢 高壓管理雖然提升了整齊度，但成員們顯得相當疲憊。', 'text-amber-400');
        }
      }
    ]
  }
];

// ==================== 初始化與工具函式 ====================
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getMemberAvg(m) {
  return Math.round((m.vocal + m.dance + m.rap + m.visual + m.charm) / 5);
}

function getMemberGroup(memberId) {
  return state.groups.find(g => g.memberIds.includes(memberId)) || null;
}

function addFansToAgency(amount, specificGroupId = null) {
  state.fans += amount;
  if (specificGroupId) {
    const grp = state.groups.find(g => g.id === specificGroupId);
    if (grp) grp.fans += amount;
  } else if (state.groups.length > 0) {
    const share = Math.round(amount / state.groups.length);
    state.groups.forEach(g => g.fans += share);
  }
}

function generateUniqueTraineeIdentity() {
  let fullName = '';
  let nat = '韓國';
  let attempts = 0;

  do {
    const roll = Math.random();
    if (roll < 0.65) {
      const s = KR_SURNAMES[rand(0, KR_SURNAMES.length - 1)];
      const g = KR_GIVEN_NAMES[rand(0, KR_GIVEN_NAMES.length - 1)];
      fullName = `${s}${g.zh} (${g.en})`;
      nat = '韓國';
    } else if (roll < 0.80) {
      const s = JP_SURNAMES[rand(0, JP_SURNAMES.length - 1)];
      const g = JP_GIVEN_NAMES[rand(0, JP_GIVEN_NAMES.length - 1)];
      fullName = `${s}${g.zh} (${g.en})`;
      nat = '日本';
    } else if (roll < 0.90) {
      const s = TW_SURNAMES[rand(0, TW_SURNAMES.length - 1)];
      const g = TW_GIVEN_NAMES[rand(0, TW_GIVEN_NAMES.length - 1)];
      fullName = `${s}${g.zh} (${g.en})`;
      nat = '台灣';
    } else {
      const f = EN_FIRST_NAMES[rand(0, EN_FIRST_NAMES.length - 1)];
      const l = EN_LAST_NAMES[rand(0, EN_LAST_NAMES.length - 1)];
      fullName = `${f} ${l}`;
      nat = '美籍韓裔';
    }
    attempts++;
    if (attempts > 200) {
      fullName = `${fullName} #${rand(10, 99)}`;
      break;
    }
  } while (state.usedNames.has(fullName));

  state.usedNames.add(fullName);
  return { name: fullName, nat };
}

function generateTrainee() {
  const identity = generateUniqueTraineeIdentity();
  const vocal = rand(38, 78);
  const dance = rand(38, 78);
  const rap = rand(30, 75);
  const visual = rand(45, 85);
  const charm = rand(40, 82);
  const avg = Math.round((vocal + dance + rap + visual + charm) / 5);
  const signFee = Math.round(avg * 90);

  return {
    id: 't_' + Date.now() + '_' + Math.random().toString(36).substr(2, 6),
    name: identity.name,
    nat: identity.nat,
    age: rand(15, 22),
    vocal,
    dance,
    rap,
    visual,
    charm,
    stamina: 100,
    stress: rand(5, 20),
    signFee,
    salary: 550,
    weekPlan: ['vocal', 'dance', 'vocal', 'dance', 'rap', 'variety', 'rest'],
    role: null,
    groupId: null
  };
}

function refreshAuditionPool(free = false) {
  if (!free) {
    if (state.money < 2000) {
      alert('公司資金不足 $2,000，無法舉辦全球海選！');
      return;
    }
    state.money -= 2000;
    addLog('🔎 花費 $2,000 舉辦新一輪素人練習生海選。', 'text-zinc-300');
  }

  state.auditionPool = [];
  state.usedNames = new Set(state.roster.map(r => r.name));

  for (let i = 0; i < 4; i++) {
    state.auditionPool.push(generateTrainee());
  }
  renderAll();
}

function addLog(text, colorClass = 'text-zinc-300') {
  const year = Math.floor((state.week - 1) / 52) + 1;
  const weekInYear = ((state.week - 1) % 52) + 1;
  state.logs.unshift({
    time: `Y${year} W${weekInYear}`,
    text,
    colorClass
  });
  if (state.logs.length > 45) state.logs.pop();
}

// ==================== 開局 / 存檔自動偵測與切換邏輯 ====================
const agencyInputEl = document.getElementById('agency-name-input');
const saveStatusBadge = document.getElementById('save-status-badge');
const existingSavePreview = document.getElementById('existing-save-preview');
const existingSaveMeta = document.getElementById('existing-save-meta');
const newGameDiffBox = document.getElementById('new-game-difficulty-box');
const startGameBtn = document.getElementById('start-game-btn');

function checkAgencyNameInput() {
  const rawName = agencyInputEl.value.trim().toUpperCase();
  const saves = getAllSaves();

  if (rawName && saves[rawName]) {
    const s = saves[rawName];
    const yr = Math.floor(((s.week || 1) - 1) / 52) + 1;
    const wk = (((s.week || 1) - 1) % 52) + 1;
    saveStatusBadge.textContent = '📂 找到現有存檔記錄';
    saveStatusBadge.className = 'text-[11px] font-bold text-pink-400';

    existingSavePreview.classList.remove('hidden');
    existingSaveMeta.textContent = `進度：第 ${yr} 年 第 ${wk} 週 • 資金：$${(s.money ?? 0).toLocaleString()} • 團體：${(s.groups || []).length} 團 • 成員：${(s.roster || []).length} 人`;
    newGameDiffBox.classList.add('hidden');
    startGameBtn.textContent = `📂 讀取「${rawName}」存檔並繼續遊戲`;
    startGameBtn.className = 'w-full mt-2 py-3 rounded-xl font-black text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 transition shadow-lg shadow-emerald-600/30 cursor-pointer';
  } else {
    saveStatusBadge.textContent = '✨ 新公司名稱（將建立新存檔）';
    saveStatusBadge.className = 'text-[11px] font-bold text-emerald-400';

    existingSavePreview.classList.add('hidden');
    newGameDiffBox.classList.remove('hidden');
    startGameBtn.textContent = '🚀 正式成立新經紀公司';
    startGameBtn.className = 'w-full mt-2 py-3 rounded-xl font-black text-white bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-500 hover:to-purple-500 transition shadow-lg shadow-pink-600/30 cursor-pointer';
  }
}

function renderSavedAgenciesList() {
  const saves = getAllSaves();
  const keys = Object.keys(saves);
  const section = document.getElementById('saved-agencies-section');
  const listEl = document.getElementById('saved-agencies-list');

  if (keys.length === 0) {
    section.classList.add('hidden');
    return;
  }

  section.classList.remove('hidden');
  listEl.innerHTML = keys.map(k => {
    const s = saves[k];
    const yr = Math.floor(((s.week || 1) - 1) / 52) + 1;
    const wk = (((s.week || 1) - 1) % 52) + 1;
    return `
      <div class="flex items-center justify-between bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-800 rounded-xl px-3 py-2 transition">
        <button type="button" onclick="quickSelectSave('${k.replace(/'/g, "\\'")}')" class="text-left flex-1 cursor-pointer">
          <div class="text-xs font-black text-white">${s.agencyName}</div>
          <div class="text-[10px] text-zinc-400">Y${yr} W${wk} • $${(s.money ?? 0).toLocaleString()} • ${(s.groups || []).length} 團 • 最後存檔：${s.savedAt || ''}</div>
        </button>
        <button type="button" onclick="deleteAgencySave('${k.replace(/'/g, "\\'")}')" title="刪除此存檔" class="ml-2 px-2 py-1 text-xs text-zinc-500 hover:text-rose-400 cursor-pointer">✕</button>
      </div>
    `;
  }).join('');
}

window.quickSelectSave = function(nameKey) {
  agencyInputEl.value = nameKey;
  checkAgencyNameInput();
};

agencyInputEl.addEventListener('input', checkAgencyNameInput);

document.getElementById('delete-current-save-btn').addEventListener('click', () => {
  const rawName = agencyInputEl.value.trim().toUpperCase();
  if (rawName && confirm(`確定要刪除「${rawName}」的所有存檔記錄嗎？此動作無法復原。`)) {
    deleteAgencySave(rawName);
  }
});

// 難度選擇
document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => {
      b.classList.remove('border-2', 'border-pink-500', 'bg-pink-500/10');
      b.classList.add('border', 'border-zinc-700', 'bg-zinc-900/70');
    });
    btn.classList.remove('border', 'border-zinc-700', 'bg-zinc-900/70');
    btn.classList.add('border-2', 'border-pink-500', 'bg-pink-500/10');
    selectedNewGameMoney = parseInt(btn.dataset.money);
    selectedNewGameRep = parseInt(btn.dataset.rep);
  });
});

// 點擊進入遊戲（自動判斷讀取存檔或建立新公司）
startGameBtn.addEventListener('click', () => {
  const inputName = agencyInputEl.value.trim().toUpperCase() || 'NOVA ENTERTAINMENT';
  const saves = getAllSaves();

  document.getElementById('pool-size-badge').textContent = `${TOTAL_POSSIBLE_NAMES.toLocaleString()}+`;

  if (saves[inputName]) {
    loadAgencyFromSave(saves[inputName]);
    addLog(`📂 已載入「${state.agencyName}」營運記錄，歡迎回來繼續經營！`, 'text-emerald-400 font-bold');
  } else {
    state.agencyName = inputName;
    state.week = 1;
    state.money = selectedNewGameMoney;
    state.fans = 0;
    state.reputation = selectedNewGameRep;
    state.musicShowWins = 0;
    state.roster = [];
    state.auditionPool = [];
    state.selectedForDebut = [];
    state.groups = [];
    state.activeDashGroupId = null;
    state.discography = [];
    state.activeSongs = [];
    state.logs = [];
    state.usedNames = new Set();

    refreshAuditionPool(true);
    addLog(`🎉 新經紀公司「${state.agencyName}」正式掛牌成立！準備打造多組頂流韓團！`, 'text-pink-400 font-bold');
  }

  document.getElementById('setup-modal').classList.add('hidden');
  renderAll();
});

// 頂部切換公司按鈕
document.getElementById('switch-agency-btn').addEventListener('click', () => {
  saveCurrentAgency();
  checkAgencyNameInput();
  renderSavedAgenciesList();
  document.getElementById('setup-modal').classList.remove('hidden');
});

// 分頁切換
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active', 'bg-pink-500/15', 'text-pink-400', 'border', 'border-pink-500/30');
      b.classList.add('text-zinc-400');
    });
    btn.classList.add('active', 'bg-pink-500/15', 'text-pink-400', 'border', 'border-pink-500/30');
    btn.classList.remove('text-zinc-400');

    const target = btn.dataset.tab;
    document.querySelectorAll('.tab-panel').forEach(p => p.classList.add('hidden'));
    document.getElementById(`tab-${target}`).classList.remove('hidden');
  });
});

document.getElementById('refresh-audition-btn').addEventListener('click', () => refreshAuditionPool(false));

window.signTrainee = function(id) {
  if (state.roster.length >= 15) return alert('公司練習生與藝人總名額已滿（上限 15 人）！');
  const idx = state.auditionPool.findIndex(t => t.id === id);
  if (idx === -1) return;
  const trainee = state.auditionPool[idx];
  if (state.money < trainee.signFee) return alert('公司資金不足以支付簽約金！');

  state.money -= trainee.signFee;
  state.roster.push(trainee);
  state.auditionPool.splice(idx, 1);
  addLog(`✍️ 簽下素人練習生「${trainee.name}」（簽約金 $${trainee.signFee.toLocaleString()}）。`, 'text-emerald-400');
  renderAll();
};

// ==================== 多團出道企劃邏輯 ====================
window.toggleSelectDebut = function(id) {
  const member = state.roster.find(m => m.id === id);
  if (!member || member.groupId) return;

  const idx = state.selectedForDebut.indexOf(id);
  if (idx > -1) {
    state.selectedForDebut.splice(idx, 1);
  } else {
    if (state.selectedForDebut.length >= 5) return alert('單一團體最多只能選擇 5 名成員！');
    state.selectedForDebut.push(id);
  }
  renderTrainees();
};

document.getElementById('open-debut-modal-btn').addEventListener('click', () => {
  if (state.selectedForDebut.length < 3) return alert('請至少勾選 3 名未出道練習生才能組建新團體！');

  const container = document.getElementById('debut-roles-container');
  container.innerHTML = state.selectedForDebut.map(id => {
    const m = state.roster.find(t => t.id === id);
    return `
      <div class="flex items-center justify-between bg-zinc-900 p-2.5 rounded-xl border border-zinc-800">
        <span class="text-xs font-bold">${m.name}</span>
        <select data-member-id="${m.id}" class="role-select bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-pink-300">
          <option value="隊長 / 主唱">隊長 / 主唱</option>
          <option value="主唱 (Main Vocal)">主唱 (Main Vocal)</option>
          <option value="主舞 (Main Dancer)">主舞 (Main Dancer)</option>
          <option value="主饒舌 (Main Rapper)">主饒舌 (Main Rapper)</option>
          <option value="門面 / Center">門面 / Center</option>
          <option value="忙內 / 全能ACE">忙內 / 全能ACE</option>
        </select>
      </div>
    `;
  }).join('');

  document.getElementById('debut-modal').classList.remove('hidden');
});

document.getElementById('close-debut-modal').addEventListener('click', () => {
  document.getElementById('debut-modal').classList.add('hidden');
});

document.getElementById('confirm-debut-btn').addEventListener('click', () => {
  if (state.money < 15000) return alert('公司資金不足 $15,000 出道製作費！');
  const gName = document.getElementById('debut-group-name').value.trim().toUpperCase();
  const fName = document.getElementById('debut-fandom-name').value.trim().toUpperCase() || 'FANS';
  const concept = document.getElementById('debut-concept').value;

  if (!gName) return alert('請輸入團體名稱！');
  if (state.groups.some(g => g.name === gName)) return alert('公司旗下已有同名團體，請換一個團名！');

  state.money -= 15000;
  const newGroupId = 'grp_' + Date.now();
  const roleSelects = document.querySelectorAll('.role-select');
  const memberIds = [];

  roleSelects.forEach(sel => {
    const mid = sel.dataset.memberId;
    const member = state.roster.find(t => t.id === mid);
    if (member) {
      member.role = sel.value;
      member.groupId = newGroupId;
      member.salary = 1100;
      memberIds.push(mid);
    }
  });

  const initialFans = rand(2500, 4500);
  const newGroup = {
    id: newGroupId,
    name: gName,
    fandom: fName,
    concept,
    fans: initialFans,
    memberIds
  };

  state.groups.push(newGroup);
  state.activeDashGroupId = newGroupId;
  state.selectedForDebut = [];

  const avgStat = calculateGroupPower(newGroupId, 52);
  const debutSong = {
    groupId: newGroupId,
    groupName: gName,
    title: `${gName} DEBUT`,
    genre: concept,
    quality: avgStat,
    weeksCharting: 1,
    peakRank: Math.max(12, 100 - Math.round(avgStat * 0.75)),
    sales: rand(8000, 18000)
  };

  state.activeSongs.push(debutSong);
  state.discography.unshift({ ...debutSong });
  state.fans += initialFans;
  state.reputation += 8;

  document.getElementById('debut-group-name').value = '';
  document.getElementById('debut-fandom-name').value = '';
  document.getElementById('debut-modal').classList.add('hidden');

  addLog(`🌟 旗下第 ${state.groups.length} 組團體「${gName}」正式出道！粉絲名「${fName}」，出道曲空降音源榜第 ${debutSong.peakRank} 名！`, 'text-pink-400 font-bold');
  renderAll();
});

// ==================== Excel 每週行程拖曳系統 ====================
let scheduleDragData = null;

window.handlePaletteDragStart = function(e, scheduleKey) {
  scheduleDragData = { type: 'palette', scheduleKey };
  e.dataTransfer.effectAllowed = 'copy';
  e.dataTransfer.setData('text/plain', scheduleKey);
  e.currentTarget.classList.add('dragging-source');
};

window.handleCellDragStart = function(e, memberId, dayIdx, scheduleKey) {
  scheduleDragData = {
    type: 'cell',
    scheduleKey,
    fromMemberId: memberId,
    fromDayIdx: dayIdx
  };
  e.dataTransfer.effectAllowed = 'copyMove';
  e.dataTransfer.setData('text/plain', scheduleKey);
  e.currentTarget.classList.add('dragging-source');
};

window.handleScheduleDragEnd = function(e) {
  e.currentTarget.classList.remove('dragging-source');
  document.querySelectorAll('.excel-cell').forEach(el => el.classList.remove('drag-over'));
};

window.handleCellDragOver = function(e) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'copy';
  e.currentTarget.classList.add('drag-over');
};

window.handleCellDragLeave = function(e) {
  e.currentTarget.classList.remove('drag-over');
};

window.handleCellDrop = function(e, targetMemberId, targetDayIdx) {
  e.preventDefault();
  e.currentTarget.classList.remove('drag-over');
  if (!scheduleDragData) return;

  const targetMember = state.roster.find(m => m.id === targetMemberId);
  if (targetMember) {
    targetMember.weekPlan[targetDayIdx] = scheduleDragData.scheduleKey;
    saveCurrentAgency();
    renderSchedule();
  }
  scheduleDragData = null;
};

window.fillMemberWeek = function(memberId, scheduleKey) {
  if (!scheduleKey) return;
  const m = state.roster.find(t => t.id === memberId);
  if (m) {
    m.weekPlan = Array(7).fill(scheduleKey);
    saveCurrentAgency();
    renderSchedule();
  }
};

window.applyPresetWeek = function(preset) {
  state.roster.forEach(m => {
    if (preset === 'rest') {
      m.weekPlan = ['rest', 'rest', 'rest', 'rest', 'rest', 'rest', 'rest'];
    } else {
      m.weekPlan = ['vocal', 'dance', 'vocal', 'dance', 'rap', 'variety', 'rest'];
    }
  });
  saveCurrentAgency();
  renderSchedule();
};

// ==================== 回歸企劃 ====================
function updateComebackCost() {
  const mv = parseInt(document.getElementById('mv-budget-select').value);
  const promo = parseInt(document.getElementById('promo-budget-select').value);
  document.getElementById('total-comeback-cost').textContent = `$${(mv + promo).toLocaleString()}`;
}
document.getElementById('mv-budget-select').addEventListener('change', updateComebackCost);
document.getElementById('promo-budget-select').addEventListener('change', updateComebackCost);

document.getElementById('comeback-form').addEventListener('submit', (e) => {
  e.preventDefault();
  if (state.groups.length === 0) return;

  const groupId = document.getElementById('comeback-group-select').value;
  const grp = state.groups.find(g => g.id === groupId);
  if (!grp) return;

  const title = document.getElementById('album-title-input').value.trim().toUpperCase();
  const genre = document.getElementById('album-genre-select').value;
  const mvCost = parseInt(document.getElementById('mv-budget-select').value);
  const promoCost = parseInt(document.getElementById('promo-budget-select').value);
  const totalCost = mvCost + promoCost;

  if (state.money < totalCost) return alert(`公司資金不足 $${totalCost.toLocaleString()}！`);

  state.money -= totalCost;
  const budgetBonus = Math.round((mvCost + promoCost) / 2500);
  const quality = Math.min(100, calculateGroupPower(groupId, budgetBonus));
  const initialRank = Math.max(1, Math.min(95, 100 - Math.round(quality * 0.88 + Math.log10(grp.fans + 10) * 4)));
  const firstWeekSales = Math.round((grp.fans * 0.85) + (quality * 220) + rand(2000, 8000));
  const albumRevenue = Math.round(firstWeekSales * 3.5);

  state.money += albumRevenue;
  const newFans = Math.round(quality * 65 + rand(1500, 4000));
  addFansToAgency(newFans, groupId);
  state.reputation += Math.round(quality / 15);

  const newSong = {
    groupId,
    groupName: grp.name,
    title,
    genre,
    quality,
    weeksCharting: 1,
    peakRank: initialRank,
    sales: firstWeekSales
  };

  state.activeSongs = state.activeSongs.filter(s => s.groupId !== groupId);
  state.activeSongs.push(newSong);
  state.discography.unshift({ ...newSong });

  document.getElementById('album-title-input').value = '';
  addLog(`💿 「${grp.name}」攜新曲《${title}》華麗回歸！首週銷量 ${firstWeekSales.toLocaleString()} 張（營收 +$${albumRevenue.toLocaleString()}），空降 Melon 榜第 ${initialRank} 名！`, 'text-purple-400 font-bold');

  if (initialRank <= 3) {
    state.musicShowWins += 1;
    addLog(`🏆 恭喜！「${grp.name}」憑藉《${title}》空降橫掃音樂節目一位獎盃！`, 'text-amber-400 font-bold');
  }

  renderAll();
});

function calculateGroupPower(groupId, bonus = 0) {
  const grp = state.groups.find(g => g.id === groupId);
  if (!grp) return 50;
  const members = state.roster.filter(m => grp.memberIds.includes(m.id));
  if (members.length === 0) return 50;
  const total = members.reduce((acc, m) => acc + getMemberAvg(m), 0);
  return Math.min(100, Math.round(total / members.length + bonus));
}

// ==================== 推進下一週（逐日結算 7 天 Excel 排程） ====================
document.getElementById('next-week-btn').addEventListener('click', () => {
  state.week += 1;
  let weeklyIncome = 0;
  let weeklyExpense = 1500;

  state.roster.forEach(m => {
    weeklyExpense += m.salary;

    m.weekPlan.forEach(dayKey => {
      const sch = SCHEDULES[dayKey] || SCHEDULES.rest;
      weeklyExpense += sch.cost;

      switch (dayKey) {
        case 'vocal':
          m.vocal = Math.min(100, m.vocal + 1);
          m.stamina = Math.max(0, m.stamina - 4);
          m.stress = Math.min(100, m.stress + 3);
          break;
        case 'dance':
          m.dance = Math.min(100, m.dance + 1);
          m.stamina = Math.max(0, m.stamina - 5);
          m.stress = Math.min(100, m.stress + 3);
          break;
        case 'rap':
          m.rap = Math.min(100, m.rap + 1);
          m.stamina = Math.max(0, m.stamina - 3);
          m.stress = Math.min(100, m.stress + 2);
          break;
        case 'variety':
          m.charm = Math.min(100, m.charm + 1);
          addFansToAgency(rand(80, 150), m.groupId);
          weeklyIncome += 350;
          m.stamina = Math.max(0, m.stamina - 4);
          m.stress = Math.min(100, m.stress + 4);
          break;
        case 'busking':
          if (Math.random() < 0.5) m.vocal = Math.min(100, m.vocal + 1);
          else m.dance = Math.min(100, m.dance + 1);
          addFansToAgency(rand(110, 210), m.groupId);
          m.stamina = Math.max(0, m.stamina - 6);
          m.stress = Math.min(100, m.stress + 3);
          break;
        case 'fanmeet':
          if (m.groupId) {
            addFansToAgency(200, m.groupId);
            weeklyIncome += 600;
            m.stress = Math.min(100, m.stress + 4);
            m.stamina = Math.max(0, m.stamina - 3);
          } else {
            m.charm = Math.min(100, m.charm + 1);
          }
          break;
        case 'rest':
          m.stamina = Math.min(100, m.stamina + 14);
          m.stress = Math.max(0, m.stress - 12);
          break;
      }
    });

    if (m.stress >= 90) {
      m.stress = 55;
      m.stamina = 30;
      state.reputation = Math.max(0, state.reputation - 3);
      addLog(`🚑 警告！「${m.name}」因連日高壓排程在彩排時暈倒送醫，輿論批評公司血汗壓榨！`, 'text-rose-400 font-bold');
    }
  });

  state.groups.forEach(g => {
    if (g.fans > 0) {
      weeklyIncome += Math.round(g.fans * 0.22);
    }
  });

  state.activeSongs.forEach(song => {
    song.weeksCharting += 1;
    const delta = rand(-4, 7);
    song.peakRank = Math.min(100, Math.max(1, song.peakRank + delta));
    if (song.peakRank <= 5 && song.weeksCharting <= 4 && Math.random() < 0.45) {
      state.musicShowWins += 1;
      addFansToAgency(1200, song.groupId);
      addLog(`🏆 「${song.groupName}」憑藉《${song.title}》奪得本週音樂節目一位！`, 'text-amber-400 font-bold');
    }
  });

  const net = weeklyIncome - weeklyExpense;
  state.money += net;
  addLog(`📅 週結算完成：營收 +$${weeklyIncome.toLocaleString()} | 支出 -$${weeklyExpense.toLocaleString()} (淨利 ${net >= 0 ? '+' : ''}$${net.toLocaleString()})`, net >= 0 ? 'text-emerald-400' : 'text-zinc-400');

  if (state.roster.length > 0 && Math.random() < 0.35) {
    triggerRandomEvent();
  }

  if (state.money < -15000) {
    alert(`💀 「${state.agencyName}」負債超過 $15,000 宣告破產！該公司存檔已清除。`);
    deleteAgencySave(state.agencyName);
    location.reload();
    return;
  }

  renderAll();
});

function triggerRandomEvent() {
  const ev = RANDOM_EVENTS[rand(0, RANDOM_EVENTS.length - 1)];
  document.getElementById('event-title').textContent = ev.title;
  document.getElementById('event-desc').textContent = ev.desc;
  const choicesEl = document.getElementById('event-choices');
  choicesEl.innerHTML = '';

  ev.choices.forEach(c => {
    const btn = document.createElement('button');
    btn.className = 'w-full text-left p-3 rounded-xl bg-zinc-900 hover:bg-pink-500/20 border border-zinc-700 hover:border-pink-500 text-xs font-bold transition cursor-pointer';
    btn.textContent = c.text;
    btn.onclick = () => {
      c.action();
      document.getElementById('event-modal').classList.add('hidden');
      renderAll();
    };
    choicesEl.appendChild(btn);
  });

  document.getElementById('event-modal').classList.remove('hidden');
}

// ==================== 畫面渲染 ====================
function renderAll() {
  const year = Math.floor((state.week - 1) / 52) + 1;
  const weekInYear = ((state.week - 1) % 52) + 1;
  document.getElementById('header-agency-name').textContent = state.agencyName;
  document.getElementById('header-date').textContent = `第 ${year} 年 第 ${weekInYear} 週`;
  document.getElementById('header-group-badge').textContent = state.groups.length > 0
    ? `旗下現役團體：${state.groups.length} 團 (${state.groups.map(g => g.name).join('、')})`
    : '旗下現役團體：0 團';

  document.getElementById('stat-money').textContent = `$${state.money.toLocaleString()}`;
  document.getElementById('stat-money').className = `font-display font-black text-base ${state.money >= 0 ? 'text-emerald-400' : 'text-rose-400'}`;
  document.getElementById('stat-fans').textContent = state.fans.toLocaleString();
  document.getElementById('stat-rep').textContent = state.reputation;
  document.getElementById('stat-wins').textContent = `🏆 ${state.musicShowWins}`;

  renderDashboard();
  renderTrainees();
  renderSchedule();
  renderComeback();

  saveCurrentAgency();
}

window.selectDashGroup = function(groupId) {
  state.activeDashGroupId = groupId;
  renderDashboard();
};

function renderDashboard() {
  document.getElementById('dash-groups-count').textContent = state.groups.length;
  const tabsEl = document.getElementById('dash-group-tabs');
  const detailEl = document.getElementById('dash-group-detail');

  if (state.groups.length === 0) {
    tabsEl.innerHTML = '';
    detailEl.innerHTML = `<div class="text-center py-8 text-xs text-zinc-500 border border-dashed border-zinc-800 rounded-xl">目前尚無出道團體，請前往「練習生與多團出道企劃」招募成員並組建團體</div>`;
  } else {
    if (!state.activeDashGroupId || !state.groups.some(g => g.id === state.activeDashGroupId)) {
      state.activeDashGroupId = state.groups[0].id;
    }

    tabsEl.innerHTML = state.groups.map(g => {
      const isActive = g.id === state.activeDashGroupId;
      return `
        <button onclick="selectDashGroup('${g.id}')"
          class="px-3 py-1.5 rounded-lg text-xs font-black transition cursor-pointer ${isActive ? 'bg-pink-500 text-white shadow' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'}">
          ${g.name}
        </button>
      `;
    }).join('');

    const activeGroup = state.groups.find(g => g.id === state.activeDashGroupId);
    const members = activeGroup.memberIds.map(id => state.roster.find(m => m.id === id)).filter(Boolean);

    detailEl.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-zinc-800">
        <div>
          <h4 class="text-lg font-display font-black text-white">${activeGroup.name}</h4>
          <p class="text-xs text-zinc-400">粉絲名：${activeGroup.fandom} • 專屬粉絲數：<b class="text-pink-400">${activeGroup.fans.toLocaleString()}</b> • 綜合戰力：<b class="text-emerald-400">${calculateGroupPower(activeGroup.id)} 分</b></p>
        </div>
        <span class="px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-bold">
          概念：${activeGroup.concept}
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        ${members.map(m => `
          <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
            <div class="flex items-center justify-between mb-1">
              <span class="font-bold text-sm text-white">${m.name}</span>
              <span class="text-[10px] px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 font-bold">${m.role}</span>
            </div>
            <div class="grid grid-cols-3 gap-1 text-[11px] text-zinc-400 mt-2">
              <div>唱功 <span class="text-white font-bold">${m.vocal}</span></div>
              <div>舞蹈 <span class="text-white font-bold">${m.dance}</span></div>
              <div>魅力 <span class="text-white font-bold">${m.charm}</span></div>
            </div>
            <div class="mt-2.5 space-y-1">
              <div class="flex justify-between text-[10px]">
                <span class="text-zinc-400">體力</span>
                <span class="text-emerald-400">${m.stamina}%</span>
              </div>
              <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full bg-emerald-500" style="width:${m.stamina}%"></div>
              </div>
              <div class="flex justify-between text-[10px]">
                <span class="text-zinc-400">壓力值</span>
                <span class="${m.stress > 70 ? 'text-rose-400' : 'text-amber-400'}">${m.stress}%</span>
              </div>
              <div class="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div class="h-full ${m.stress > 70 ? 'bg-rose-500' : 'bg-amber-500'}" style="width:${m.stress}%"></div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  document.getElementById('news-log').innerHTML = state.logs.map(l => `
    <div class="flex items-start gap-2.5 text-xs border-b border-zinc-800/70 pb-2">
      <span class="px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono text-[10px] shrink-0">${l.time}</span>
      <span class="${l.colorClass} leading-relaxed">${l.text}</span>
    </div>
  `).join('');

  let chartItems = RIVAL_SONGS.map(s => ({
    artist: s.artist,
    title: s.title,
    score: s.power + rand(-3, 3),
    isPlayer: false
  }));

  state.activeSongs.forEach(song => {
    const playerScore = Math.max(10, 101 - song.peakRank);
    chartItems.push({
      artist: song.groupName,
      title: song.title,
      score: playerScore,
      isPlayer: true
    });
  });

  chartItems.sort((a, b) => b.score - a.score);
  const top10 = chartItems.slice(0, 10);

  document.getElementById('chart-list').innerHTML = top10.map((item, idx) => `
    <div class="flex items-center justify-between p-2.5 rounded-xl ${item.isPlayer ? 'bg-pink-500/20 border border-pink-500/40' : 'bg-zinc-900/70 border border-zinc-800/80'}">
      <div class="flex items-center gap-3">
        <span class="font-display font-black text-sm w-5 text-center ${idx < 3 ? 'text-emerald-400' : 'text-zinc-500'}">${idx + 1}</span>
        <div>
          <div class="text-xs font-bold ${item.isPlayer ? 'text-pink-300' : 'text-white'}">${item.title} ${item.isPlayer ? '🔥' : ''}</div>
          <div class="text-[11px] text-zinc-400">${item.artist}</div>
        </div>
      </div>
      <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">HOT</span>
    </div>
  `).join('');
}

function renderTrainees() {
  document.getElementById('audition-list').innerHTML = state.auditionPool.map(t => `
    <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
      <div class="flex items-center justify-between gap-2">
        <div>
          <div class="font-bold text-sm text-white">${t.name}</div>
          <div class="text-[11px] text-zinc-400">${t.nat} • ${t.age} 歲 • 均分 ${getMemberAvg(t)}</div>
        </div>
        <button onclick="signTrainee('${t.id}')" class="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-black text-white cursor-pointer shrink-0">
          簽約 $${t.signFee.toLocaleString()}
        </button>
      </div>
      <div class="grid grid-cols-5 gap-1 text-center mt-3 pt-2 border-t border-zinc-800 text-[10px]">
        <div><div class="text-zinc-500">唱功</div><div class="font-bold text-zinc-200">${t.vocal}</div></div>
        <div><div class="text-zinc-500">舞蹈</div><div class="font-bold text-zinc-200">${t.dance}</div></div>
        <div><div class="text-zinc-500">饒舌</div><div class="font-bold text-zinc-200">${t.rap}</div></div>
        <div><div class="text-zinc-500">外貌</div><div class="font-bold text-zinc-200">${t.visual}</div></div>
        <div><div class="text-zinc-500">魅力</div><div class="font-bold text-zinc-200">${t.charm}</div></div>
      </div>
    </div>
  `).join('');

  document.getElementById('roster-count').textContent = state.roster.length;
  const debutBtn = document.getElementById('open-debut-modal-btn');
  debutBtn.disabled = state.selectedForDebut.length < 3;
  debutBtn.textContent = `✨ 組建第 ${state.groups.length + 1} 團出道 (${state.selectedForDebut.length}/5)`;

  const rosterEl = document.getElementById('roster-list');
  if (state.roster.length === 0) {
    rosterEl.innerHTML = `<div class="col-span-full text-center py-12 text-xs text-zinc-500">尚未簽約任何練習生，請從左側海選名單發掘新人！</div>`;
    return;
  }

  rosterEl.innerHTML = state.roster.map(m => {
    const isSelected = state.selectedForDebut.includes(m.id);
    const grp = getMemberGroup(m.id);
    return `
      <div onclick="toggleSelectDebut('${m.id}')"
        class="p-4 rounded-xl border transition ${grp ? 'bg-purple-500/10 border-purple-500/40' : isSelected ? 'bg-pink-500/15 border-pink-500 cursor-pointer' : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-600 cursor-pointer'}">
        <div class="flex items-center justify-between mb-2">
          <div>
            <span class="font-bold text-sm text-white">${m.name}</span>
            <span class="ml-2 text-[10px] px-2 py-0.5 rounded-full ${grp ? 'bg-purple-500/30 text-purple-300 font-bold' : 'bg-zinc-800 text-zinc-400'}">
              ${grp ? `${grp.name} • ${m.role}` : '未出道練習生'}
            </span>
          </div>
          ${!grp ? `<input type="checkbox" ${isSelected ? 'checked' : ''} class="accent-pink-500 w-4 h-4 pointer-events-none" />` : ''}
        </div>
        <div class="grid grid-cols-5 gap-1 text-center bg-zinc-950/60 rounded-lg p-2 text-[11px]">
          <div><span class="text-zinc-500 block text-[9px]">唱功</span><b>${m.vocal}</b></div>
          <div><span class="text-zinc-500 block text-[9px]">舞蹈</span><b>${m.dance}</b></div>
          <div><span class="text-zinc-500 block text-[9px]">饒舌</span><b>${m.rap}</b></div>
          <div><span class="text-zinc-500 block text-[9px]">外貌</span><b>${m.visual}</b></div>
          <div><span class="text-zinc-500 block text-[9px]">魅力</span><b>${m.charm}</b></div>
        </div>
        <div class="flex justify-between text-[10px] text-zinc-400 mt-2">
          <span>週薪：$${m.salary}</span>
          <span>體力 ${m.stamina}% • 壓力 ${m.stress}%</span>
        </div>
      </div>
    `;
  }).join('');
}

function renderSchedule() {
  const paletteEl = document.getElementById('schedule-palette');
  paletteEl.innerHTML = Object.entries(SCHEDULES).map(([key, info]) => `
    <div draggable="true"
         ondragstart="handlePaletteDragStart(event, '${key}')"
         ondragend="handleScheduleDragEnd(event)"
         class="schedule-pill p-2.5 rounded-xl border ${info.badgeClass} cursor-grab active:cursor-grabbing select-none">
      <div class="text-xs font-black flex items-center justify-between">
        <span>${info.label}</span>
        <span class="text-[10px] opacity-70">⠿</span>
      </div>
      <div class="text-[10px] opacity-85 mt-1 leading-tight">${info.desc}</div>
    </div>
  `).join('');

  const filterSelect = document.getElementById('schedule-filter-group');
  const currentFilter = filterSelect.value;
  filterSelect.innerHTML = `
    <option value="ALL">顯示全部人員 (${state.roster.length})</option>
    <option value="TRAINEES">僅顯示未出道練習生</option>
    ${state.groups.map(g => `<option value="${g.id}">團體：${g.name}</option>`).join('')}
  `;
  if ([...filterSelect.options].some(o => o.value === currentFilter)) {
    filterSelect.value = currentFilter;
  }

  let filteredRoster = state.roster;
  if (filterSelect.value === 'TRAINEES') {
    filteredRoster = state.roster.filter(m => !m.groupId);
  } else if (filterSelect.value !== 'ALL') {
    filteredRoster = state.roster.filter(m => m.groupId === filterSelect.value);
  }

  const tbody = document.getElementById('excel-schedule-tbody');
  if (filteredRoster.length === 0) {
    tbody.innerHTML = `<tr><td colspan="10" class="text-center py-12 text-xs text-zinc-500">目前此分類下沒有成員，請先招募練習生或切換篩選條件。</td></tr>`;
    return;
  }

  tbody.innerHTML = filteredRoster.map(m => {
    const grp = getMemberGroup(m.id);
    return `
      <tr class="hover:bg-zinc-900/60">
        <td class="pl-3 py-2">
          <div class="font-bold text-xs text-white">${m.name}</div>
          <div class="text-[10px] ${grp ? 'text-pink-400 font-bold' : 'text-zinc-500'}">
            ${grp ? `${grp.name} (${m.role})` : '未出道練習生'}
          </div>
        </td>
        <td class="text-center">
          <div class="text-[10px] text-emerald-400 font-mono">體 ${m.stamina}%</div>
          <div class="text-[10px] font-mono ${m.stress > 70 ? 'text-rose-400 font-bold' : 'text-amber-400'}">壓 ${m.stress}%</div>
        </td>
        ${m.weekPlan.map((dayKey, dayIdx) => {
          const info = SCHEDULES[dayKey] || SCHEDULES.rest;
          return `
            <td ondragover="handleCellDragOver(event)"
                ondragleave="handleCellDragLeave(event)"
                ondrop="handleCellDrop(event, '${m.id}', ${dayIdx})"
                class="excel-cell text-center">
              <div draggable="true"
                   ondragstart="handleCellDragStart(event, '${m.id}', ${dayIdx}, '${dayKey}')"
                   ondragend="handleScheduleDragEnd(event)"
                   title="拖曳此格可複製到其他格子"
                   class="px-1.5 py-1.5 rounded-lg border text-[11px] font-bold cursor-grab active:cursor-grabbing select-none ${info.badgeClass}">
                ${info.short}
              </div>
            </td>
          `;
        }).join('')}
        <td class="text-center">
          <select onchange="fillMemberWeek('${m.id}', this.value); this.value='';"
            class="bg-zinc-900 border border-zinc-700 rounded px-1.5 py-1 text-[10px] text-zinc-300 focus:outline-none cursor-pointer">
            <option value="">整週套用...</option>
            ${Object.entries(SCHEDULES).map(([k, v]) => `<option value="${k}">${v.short}</option>`).join('')}
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

function renderComeback() {
  const locked = document.getElementById('comeback-locked-msg');
  const form = document.getElementById('comeback-form');
  const groupSelect = document.getElementById('comeback-group-select');

  if (state.groups.length > 0) {
    locked.classList.add('hidden');
    form.classList.remove('hidden');

    const prevVal = groupSelect.value;
    groupSelect.innerHTML = state.groups.map(g => `
      <option value="${g.id}">${g.name}（粉絲數：${g.fans.toLocaleString()} • 戰力：${calculateGroupPower(g.id)} 分）</option>
    `).join('');
    if ([...groupSelect.options].some(o => o.value === prevVal)) {
      groupSelect.value = prevVal;
    }
  } else {
    locked.classList.remove('hidden');
    form.classList.add('hidden');
  }

  const discoEl = document.getElementById('discography-list');
  if (state.discography.length === 0) {
    discoEl.innerHTML = `<div class="text-xs text-zinc-500 text-center py-8">尚未發行任何專輯</div>`;
  } else {
    discoEl.innerHTML = state.discography.map(d => `
      <div class="bg-zinc-900/90 border border-zinc-800 rounded-xl p-3.5">
        <div class="flex items-center justify-between gap-2">
          <div>
            <span class="text-[10px] font-black text-purple-400 uppercase">${d.groupName}</span>
            <div class="font-bold text-sm text-pink-300">《${d.title}》</div>
          </div>
          <span class="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">${d.genre}</span>
        </div>
        <div class="grid grid-cols-3 gap-2 mt-2 text-[11px] text-zinc-400">
          <div>最高排名：<b class="text-emerald-400">#${d.peakRank}</b></div>
          <div>首週銷量：<b class="text-white">${d.sales.toLocaleString()}</b></div>
          <div>專輯評分：<b class="text-purple-400">${d.quality}</b></div>
        </div>
      </div>
    `).join('');
  }
}

// 啟動時先檢查存檔清單並初始化開局畫面
checkAgencyNameInput();
renderSavedAgenciesList();