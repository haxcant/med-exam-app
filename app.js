(() => {
  const APP_ID = "med-exam-pwa";
  const STORAGE_KEY = "med-exam-progress-v1";
  const SESSION_KEY = "med-exam-session-v1";
  const SETTINGS_KEY = "med-exam-settings-v1";
  const IMAGE_ISSUES_KEY = "med-exam-image-issues-v1";
  const IMPORTED_WRONGS_KEY = "med-exam-imported-wrongs-v1";
  const PRE_IMPORT_SNAPSHOT_KEY = "med-exam-pre-import-snapshot-v1";
  const HARD_IMPORT_MAX_BYTES = 16 * 1024 * 1024;
  const FULL_MEMORY_IMPORT_MAX_BYTES = 8 * 1024 * 1024;
  const WRONG_HTML_IMPORT_MAX_BYTES = 16 * 1024 * 1024;
  const DANGEROUS_JSON_KEYS = new Set(["__proto__", "prototype", "constructor"]);
  const MEMORY_EXPORT_VERSION = 1;
  const LEGACY_PROGRESS_KEYS = ["driver-quiz-progress-v5", "driver-quiz-progress-v3", "driver-quiz-progress-v2", "driver-quiz-progress-v5"];
  const LEGACY_SESSION_KEYS = ["driver-quiz-session-v4"];
  const LEGACY_SETTINGS_KEYS = ["driver-quiz-settings-v4"];

  const ALL_QUESTIONS = Array.isArray(window.MED_QUESTION_BANK) ? window.MED_QUESTION_BANK.slice() : (Array.isArray(window.QUESTION_BANK) ? window.QUESTION_BANK.slice() : []);
  const QUESTION_MAP = new Map(ALL_QUESTIONS.map((q) => [q.id, q]));
  const HANDBOOK_EXPLANATIONS = window.HANDBOOK_EXPLANATIONS || {};
  const HANDBOOK_PAGES = window.HANDBOOK_PAGES || [];
  const NETWORK_REFERENCE_ANSWERS = window.NETWORK_REFERENCE_ANSWERS || {};
  const CATEGORY_LABELS = {
    all: "全部分類",
    jingui_formula: "金匱方證填空",
    internal_medicine: "內科",
    surgery: "外科",
    obgyn: "婦產科",
    pediatrics: "小兒科",
    emergency: "急診",
    pharmacology: "藥理",
    pathology: "病理",
    public_health: "公衛",
    warning_sign: "警告標誌（保留）",
    direction_sign: "指示/導行標誌",
    instruction_sign: "指示標誌",
    prohibition_sign: "禁制標誌",
    restriction_sign: "限制標誌",
    traffic_sign: "官方標誌題庫",
    regulatory_sign: "管制／規定標誌",
    road_marking: "交通標線",
    traffic_signal: "交通號誌",
    police_signal: "警察手勢",
    bike_hand_signal: "機車手勢",
    dashboard_indicator: "儀表燈號",
    construction_sign: "施工標誌",
    route_sign: "路線指示",
    service_sign: "服務設施標誌",
    traffic_law_choice: "汽車法規選擇題",
    traffic_law_truefalse: "汽車法規是非題",
    mechanical_choice: "機械常識選擇題",
    mechanical_truefalse: "機械常識是非題",
    single: "單題練習"
  };
  const PRACTICE_MODE_LABELS = {
    practice: "一般練習",
    wrongOnly: "只練錯題",
    exam: "模擬考",
    flashcard: "單字卡複習",
  };
  const QUESTION_MODE_LABELS = {
    imageToText: "看圖選名稱（保留）",
    textToImage: "看名稱選圖（保留）",
    mixed: "混合題型",
    textChoice: "條文挖空選方",
    trueFalse: "是非題",
  };
  const EXAM_SCOPE_LABELS = {
    official_small_car: "金匱條文填空",
    official_plus_mechanical: "醫學題庫加強模式",
    full_extended: "全部題庫模式",
  };
  const EXAM_SCOPE_DESCRIPTIONS = {
    official_small_car: "目前主題庫為《金匱要略》條文填空：將方名作為答案選項，原條文挖空作為題幹。",
    official_plus_mechanical: "保留給後續醫學題庫擴充，目前與金匱條文填空相同。",
    full_extended: "顯示目前載入的全部題庫。"
  };
  const SCORE_FILTER_LABELS = {
    any: "不限",
    gt: ">",
    lt: "<",
    eq: "="
  };
  const REWARD_LEVELS = [
    { key: "starter", label: "起步徽章", minPct: 0, nextPct: 10, note: "先把低分題刷起來，讓更多題目進入正分區。" },
    { key: "bronze", label: "銅牌學習者", minPct: 10, nextPct: 30, note: "你已經開始建立穩定記憶，接下來把熟題擴大到三成。" },
    { key: "silver", label: "銀牌學習者", minPct: 30, nextPct: 60, note: "基礎覆蓋率已成形，接下來把中間分數題拉到熟練。" },
    { key: "gold", label: "金牌學習者", minPct: 60, nextPct: 85, note: "你已經有很高覆蓋率，再把邊緣題清掉就很接近穩定上榜。" },
    { key: "diamond", label: "鑽石學習者", minPct: 85, nextPct: 100, note: "高覆蓋率區間。接下來維持錯題修正與模擬考穩定度。" },
  ];


const HANDBOOK_RULES = [
  { aliases: ["警告標誌"], page: 24, title: "警告標誌", text: "警告標誌為紅色正三角形，用來提醒前方可能出現特殊路況，駕駛人應提高警覺並預作防範。" },
  { aliases: ["停車再開"], page: 24, title: "遵行標誌", text: "停車再開標誌表示車輛必須先停車觀察，確認安全後才能再開。" },
  { aliases: ["讓路"], page: 24, title: "遵行標誌", text: "讓路標誌表示車輛必須慢行或停車，先讓幹線道車輛優先通行，再視情況續行。" },
  { aliases: ["單行道"], page: 24, title: "遵行標誌", text: "單行道標誌表示該道路為單向行車，進入後應依標誌所示方向行駛。" },
  { aliases: ["遵行方向", "道路遵行方向"], page: 24, title: "遵行標誌", text: "道路遵行方向標誌用來告示車輛應遵行的行駛方向。" },
  { aliases: ["靠右行駛"], page: 25, title: "禁止標誌", text: "靠右行駛標誌表示車輛必須靠分向設施的右側行駛。" },
  { aliases: ["禁止進入", "禁止任何車輛進入"], page: 25, title: "禁止標誌", text: "禁止進入標誌表示任何車輛都不准由該方向進入。" },
  { aliases: ["禁止迴車"], page: 25, title: "禁止標誌", text: "禁止迴車標誌表示前段道路不准迴車。" },
  { aliases: ["禁止超車"], page: 25, title: "禁止標誌", text: "禁止超車標誌表示該路段禁止超車。" },
  { aliases: ["禁止停車"], page: 25, title: "禁止標誌", text: "禁止停車標誌表示不得停放車輛，但臨時停車不在此限。" },
  { aliases: ["禁止臨時停車"], page: 25, title: "禁止標誌", text: "禁止臨時停車標誌表示該處連臨時停車也不允許。" },
  { aliases: ["禁止會車"], page: 25, title: "禁止標誌", text: "禁止會車標誌表示應讓已進入前方路段的來車優先通過，中途不得交會。" },
  { aliases: ["車輛總重限制"], page: 26, title: "限制標誌", text: "車輛總重限制標誌表示道路或橋梁可承載的重量有限，超限車輛不得通行。" },
  { aliases: ["車輛寬度限制"], page: 26, title: "限制標誌", text: "車輛寬度限制標誌表示前方道路條件特殊，超過標示寬度的車輛不得通行。" },
  { aliases: ["車輛高度限制"], page: 26, title: "限制標誌", text: "車輛高度限制標誌表示前方構造物高度有限，超高車輛不得通行。" },
  { aliases: ["車輛長度限制"], page: 26, title: "限制標誌", text: "車輛長度限制標誌表示前方道路或構造物對車長有限制，超長車輛不得通行。" },
  { aliases: ["最高速限"], page: 40, title: "速限標誌", text: "設有速限標誌或標線時，車輛應依其規定行駛，不得超速。" },
  { aliases: ["最低速限"], page: 40, title: "速限標誌", text: "最低速限標誌表示行駛速率不得低於標示值，以免影響車流安全。" },
  { aliases: ["國道路線編號"], page: 26, title: "指示標誌", text: "國道路線編號標誌用來指示國道路線之編號。" },
  { aliases: ["省道路線編號", "一般省道", "快速公路"], page: 26, title: "指示標誌", text: "省道路線編號標誌包含一般省道（藍底）與快速公路（紅底），用以指示省道路線之編號。" },
  { aliases: ["市、縣道路線編號", "市縣道路線編號", "縣、鄉道路線編號", "縣鄉道路線編號"], page: 26, title: "指示標誌", text: "縣、鄉道路線編號標誌用來指示縣道或鄉道路線之編號。" },
  { aliases: ["地名方向指示"], page: 26, title: "指示標誌", text: "地名方向指示標誌用來指示可通往的地點、方向與公路路線編號。" },
  { aliases: ["地名里程"], page: 26, title: "指示標誌", text: "地名里程標誌用來指示可通往地點及其里程。" },
  { aliases: ["地名標誌"], page: 26, title: "指示標誌", text: "地名標誌用來表示已到達某行政區或特定地點。" },
  { aliases: ["停車處"], page: 26, title: "指示標誌", text: "停車處標誌用來指示公共停車場的位置。" },
  { aliases: ["此路不通"], page: 26, title: "指示標誌", text: "此路不通標誌表示前方道路無出口，不能通行。" },
  { aliases: ["道路施工"], page: 27, title: "輔助標誌", text: "施工標誌表示前方道路施工，車輛應減速慢行或依指示改道。" },
  { aliases: ["分道"], page: 24, title: "警告標誌", text: "分道標誌提醒駕駛人注意分道行駛。" },
  { aliases: ["注意號誌"], page: 24, title: "警告標誌", text: "注意號誌標誌提醒前方設有號誌路口，應依號誌指示行車。" },
  { aliases: ["圓環"], page: 24, title: "警告標誌／圓環路權", text: "圓環標誌提醒駕駛人減速慢行，並讓已進入圓環內側或環道的車輛優先通行。" },
  { aliases: ["當心行人"], page: 24, title: "警告標誌", text: "當心行人標誌提醒駕駛人減速慢行並注意行人。" },
  { aliases: ["慢行"], page: 24, title: "警告標誌", text: "慢行標誌表示前方環境需要減速慢行，並作隨時停車準備。" },
  { aliases: ["有柵門鐵路平交道"], page: 24, title: "警告標誌", text: "有柵門鐵路平交道標誌提醒前方將有平交道，應減速並視情況及時停車。" },
  { aliases: ["無柵門鐵路平交道"], page: 52, title: "平交道注意事項", text: "無柵門平交道前更應落實停、看、聽，確認兩側確無列車後再通過。" },
  { aliases: ["行車分向線"], page: 28, title: "指示標線", text: "行車分向線為黃色虛線，用來劃分雙向車道，提醒車輛靠右分向行駛。" },
  { aliases: ["車道線"], page: 28, title: "指示標線", text: "車道線為白色虛線，用來劃分同向各車道，指示車輛依車道行駛。" },
  { aliases: ["路面邊線"], page: 28, title: "指示標線", text: "路面邊線為白色實線，用來標示路肩或路面外側邊緣。" },
  { aliases: ["快慢車道分隔線"], page: 28, title: "指示標線", text: "快慢車道分隔線為白色實線，用來劃分快車道與慢車道。" },
  { aliases: ["左彎待轉區線", "左轉待轉區"], page: 28, title: "指示標線", text: "左彎待轉區線表示左轉車輛可先進入待轉區等待，再依號誌完成左轉。" },
  { aliases: ["斑馬紋行人穿越道", "斑馬紋行人穿越道線"], page: 28, title: "指示標線", text: "斑馬紋行人穿越道線多設於路段中，供行人穿越道路使用。" },
  { aliases: ["枕木紋行人穿越道", "枕木紋行人穿越道線"], page: 28, title: "指示標線", text: "枕木紋行人穿越道線多設於交岔路口，提供行人穿越路口之專用空間。" },
  { aliases: ["指向線"], page: 28, title: "指示標線", text: "指向線以箭頭標示車輛應行駛的方向。" },
  { aliases: ["分向限制線"], page: 26, title: "禁制標線", text: "分向限制線為雙黃實線，用來劃分雙向車道，禁止車輛跨越行駛，也不得迴轉。" },
  { aliases: ["雙向禁止超車線"], page: 26, title: "禁制標線", text: "雙向禁止超車線為雙黃實線，表示雙向車輛都禁止超車、跨越或迴轉。" },
  { aliases: ["單向禁止超車線"], page: 27, title: "禁制標線", text: "單向禁止超車線為黃實線配黃虛線，實線側禁止超車，虛線側在安全情況下才可超車。" },
  { aliases: ["禁止變換車道線", "雙邊禁止變換車道線", "單邊禁止變換車道線"], page: 26, title: "禁制標線", text: "禁止變換車道線為白實線或白實線配白虛線，用來限制車輛變換車道。" },
  { aliases: ["禁止停車線"], page: 26, title: "禁制標線", text: "禁止停車線為黃實線，表示該路段不得停車。" },
  { aliases: ["禁止臨時停車線"], page: 26, title: "禁制標線", text: "禁止臨時停車線為紅實線，表示該路段連臨時停車也不允許。" },
  { aliases: ["停止線"], page: 26, title: "禁制標線", text: "停止線為白色實線，車輛停止時前懸部分不得超越此線。" },
  { aliases: ["機慢車停等區", "機慢車停等區線"], page: 26, title: "禁制標線", text: "機慢車停等區供大型重型機車以外之機慢車在紅燈時停等，其他車種不得占用。" },
  { aliases: ["禁行機車"], page: 26, title: "禁制標線", text: "禁行機車標字表示該車道禁止大型重型機車以外之機車通行。" },
  { aliases: ["網狀線"], page: 27, title: "禁制標線", text: "網狀線用來告示駕駛人不得在其範圍內臨時停車，以避免阻塞。" },
  { aliases: ["槽化線"], page: 27, title: "禁制標線", text: "槽化線用來引導車流按指定路線行駛，並禁止跨越與停車。" },
  { aliases: ["近障礙物線"], page: 27, title: "警告標線", text: "近障礙物線提醒前方有固定性障礙物，車輛應謹慎行駛，且禁止超車。" },
  { aliases: ["路中障礙物體線"], page: 27, title: "警告標線", text: "路中障礙物體線用來表示路中障礙物，提醒駕駛人提高警覺。" },
  { aliases: ["圓形綠燈", "圓形黃燈", "圓形紅燈", "箭頭綠燈", "行車管制號誌"], page: 29, title: "行車管制號誌", text: "行車管制號誌以紅、黃、綠燈控制通行：圓形綠燈准許直行或依規定左右轉，圓形黃燈表示紅燈將至，圓形紅燈表示禁止通行；箭頭綠燈則僅准許依箭頭方向行駛。" },
  { aliases: ["行人專用號誌"], page: 29, title: "行人專用號誌", text: "行人專用號誌中，站立行人紅燈表示禁止進入道路；行走行人綠燈表示可穿越道路，綠燈閃爍時已在道路上的人應儘速通過。" },
  { aliases: ["車道管制號誌"], page: 30, title: "車道管制號誌", text: "車道管制號誌常見兩種：垂直向下箭頭綠燈表示准許車輛在箭頭所指車道上行駛；叉形紅燈表示禁止車輛駛入該車道。" },
  { aliases: ["特種閃光黃燈號誌", "特種閃光「黃燈」號誌", "閃光黃燈"], page: 30, title: "特種閃光號誌", text: "閃光黃燈表示警告，車輛應減速接近，注意安全後小心通過。" },
  { aliases: ["特種閃光紅燈號誌", "特種閃光「紅燈」號誌", "閃光紅燈"], page: 30, title: "特種閃光號誌", text: "閃光紅燈表示停車再開，車輛應先停於交岔路口前，確認安全後再續行。" },
  { aliases: ["行人穿越道號誌"], page: 30, title: "特種交通號誌", text: "行人穿越道號誌以雙閃黃燈提醒駕駛人前方有斑馬紋行人穿越道，接近時應減速，如有行人穿越，須停於停止線前讓行人優先。" },
  { aliases: ["鐵路平交道號誌", "鐵路平交道"], page: 30, title: "特種交通號誌／平交道", text: "平交道號誌雙紅燈交替閃爍時，表示行人與車輛都禁止進入平交道；行經平交道應落實停、看、聽。" },
  { aliases: ["前後來車停止", "全部車輛停止", "右面來車停止", "左面來車停止", "右面來車速行", "左面來車速行", "右面來車左轉彎", "左面來車左轉彎", "前面來車停止"], page: 31, title: "交通指揮手勢", text: "交通指揮手勢大致分為停止、速行與轉彎三類；當號誌與交通指揮並用時，應優先遵從交通指揮人員的手勢。" },
  { aliases: ["靠山壁車", "道路外緣車"], page: 39, title: "山區道路優先路權", text: "山區會車時，靠山壁車輛應讓道路外緣車輛優先通過。" },
  { aliases: ["下坡車", "上坡車", "狹窄坡道"], page: 39, title: "狹窄坡道路權", text: "未劃分向車道的狹窄坡道上，下坡車應停車讓上坡車先行；但若下坡車已在坡道中途，上坡車應先禮讓。" },
  { aliases: ["右轉", "右轉方向"], page: 45, title: "交岔路口右轉", text: "右轉前應在距交岔路口30公尺前顯示右轉方向燈，先換入外側車道、右轉車道或慢車道，再進入路口後右轉。" },
  { aliases: ["左轉", "左右轉方向", "左轉方向"], page: 46, title: "交岔路口左轉", text: "左轉前應在距交岔路口30公尺前顯示方向燈，換入內側車道或左轉車道，並行至交岔路口中心處後再左轉，不得搶先占用來車道。" },
  { aliases: ["兩段式左轉", "機慢車兩段左轉"], page: 46, title: "機車兩段式左轉", text: "看到兩段式左轉標誌或禁行機車標誌時，機車應依規定採兩段式左轉。" },
  { aliases: ["迴車"], page: 46, title: "迴車", text: "迴車前應暫停並顯示左轉燈或手勢，看清無來往車輛及行人後才可迴轉；有彎道、坡路、狹路、狹橋、隧道標誌或平交道處不得迴車。" },
  { aliases: ["超車"], page: 44, title: "超車", text: "超越同車道前車前，應先按鳴喇叭二單響或變換燈光一次；待前車減速靠邊或表示允讓後，始可由左側保持安全間隔超越。" },
  { aliases: ["變換車道"], page: 42, title: "變換車道", text: "變換車道前應先顯示欲變換方向的方向燈，確認安全距離並讓直行車先行後再變換，不得以逼近或驟然變換車道迫使他車讓道。" },
  { aliases: ["行人穿越道"], page: 71, title: "行人優先", text: "行近行人穿越道前應減速慢行，在穿越道上有人通行時，應暫停讓行人先行通過。左、右轉跨越穿越道時，距離行人行進方向3公尺內應停讓。" },
  { aliases: ["安全帶"], page: 58, title: "安全帶", text: "汽車駕駛人、前座及後座乘客都應繫妥安全帶；肩帶應繞過肩膀橫過胸前，腰帶固定在腹部下方的髖骨位置。" },
  { aliases: ["安全座椅", "幼童用座椅"], page: 58, title: "安全座椅", text: "2歲以下幼童應坐於後座攜帶式嬰兒床或後向幼童座椅；2至4歲且18公斤以下者應使用幼童用座椅；較大兒童則應在後座使用安全帶。" },
  { aliases: ["手持方式使用行動電話", "行動電話", "電腦", "分心駕駛"], page: 66, title: "分心駕駛", text: "駕駛時以手持方式使用行動電話、電腦或其他裝置，屬分心駕駛，容易錯失關鍵路況資訊並增加事故風險。" },
  { aliases: ["娛樂性顯示設備"], page: 59, title: "娛樂性顯示設備", text: "起駛前應關閉駕駛人視線範圍內的娛樂性顯示設備，駕駛時不得操作或觀看。" },
  { aliases: ["酒駕", "飲酒", "酒精濃度"], page: 67, title: "酒後駕車與行車安全", text: "飲酒會讓反應時間變長、判斷力下降與視野縮小；飲酒後絕不開車，應改由指定駕駛、計程車、大眾運輸或代駕返家。" },
  { aliases: ["超速"], page: 41, title: "超速駕駛", text: "超速是重要肇事原因之一，會讓駕駛人反應不及，也會提高事故傷害嚴重度。" },
  { aliases: ["內輪差", "大型車"], page: 78, title: "大型車內輪差與視野死角", text: "大型車轉彎時內輪差明顯，且視野死角大；看到大型車打方向燈時應減速或暫停，避免進入其內輪差與死角範圍。" },
  { aliases: ["隧道"], page: 55, title: "行駛於長隧道", text: "行經隧道應開亮頭燈、保持安全距離、避免任意變換車道；隧道內不得臨時停車、迴車、倒車或超車。" },
  { aliases: ["高速公路", "快速公路", "市區快速道路"], page: 49, title: "高、快速公路注意事項", text: "行駛高、快速公路前應依速限行駛、保持安全距離、變換車道前先顯示方向燈並確認安全，且不得在車道中迴轉、倒車或任意停車。" },
  { aliases: ["爬坡道"], page: 49, title: "高、快速公路注意事項", text: "在設有爬坡道的長陡坡路段，車速低於最低速限的車輛應行駛爬坡道，其他車輛不得利用爬坡道超車。" },
  { aliases: ["安全距離"], page: 73, title: "路段中行車", text: "一般道路上建議小型車與前車保持至少2秒時距；高速或快速公路則依速率換算更長的安全距離。" },
  { aliases: ["疲勞駕駛"], page: 66, title: "疲勞駕駛", text: "疲勞會大幅提高事故風險，持續開車以不超過2小時為宜，若感到疲倦應儘速停車休息。" },
  { aliases: ["防禦駕駛"], page: 82, title: "防禦駕駛", text: "防禦駕駛的核心是不只避免撞到別人，也要避免被別人撞到；應預先發現危險並採取保護自己的反應。" },
  { aliases: ["安全帽"], page: 59, title: "安全帽", text: "機車駕駛人及附載人員都應正確配戴經檢驗合格的安全帽，扣環需確實繫緊。" },
  { aliases: ["幼童專用車", "校車", "教練車", "身心障礙者用特製車"], page: 80, title: "特殊車輛避讓", text: "遇到幼童專用車、校車、身心障礙者用特製車、教練車或道路考驗用車，駕駛人都應予以禮讓。" },
  { aliases: ["消防車", "救護車", "警備車", "工程救險車", "毒性化學物質災害事故應變車"], page: 80, title: "緊急任務車輛避讓", text: "遇執行緊急任務的消防車、救護車等，不論來自何方都應立即避讓，不得併駛、超越或跟隨急駛。" },
];

  const els = {
    examScopeSelect: document.getElementById("examScopeSelect"),
    practiceModeSelect: document.getElementById("practiceModeSelect"),
    questionModeSelect: document.getElementById("questionModeSelect"),
    categorySelect: document.getElementById("categorySelect"),
    questionCountSelect: document.getElementById("questionCountSelect"),
    masterySelect: document.getElementById("masterySelect"),
    scoreFilterOperatorSelect: document.getElementById("scoreFilterOperatorSelect"),
    scoreFilterValueInput: document.getElementById("scoreFilterValueInput"),
    quickFilterUnseenBtn: document.getElementById("quickFilterUnseenBtn"),
    quickFilterWrongBtn: document.getElementById("quickFilterWrongBtn"),
    quickFilterClearBtn: document.getElementById("quickFilterClearBtn"),
    answerTimeLimitInput: document.getElementById("answerTimeLimitInput"),
    autoNextCorrectDelayInput: document.getElementById("autoNextCorrectDelayInput"),
    autoNextWrongDelayInput: document.getElementById("autoNextWrongDelayInput"),
    soundVolumeInput: document.getElementById("soundVolumeInput"),
    soundVolumeValue: document.getElementById("soundVolumeValue"),
    soundTestBtn: document.getElementById("soundTestBtn"),
    restoreRecommendedBtn: document.getElementById("restoreRecommendedBtn"),
    maskTextToggle: document.getElementById("maskTextToggle"),
    shortcutOption1Input: document.getElementById("shortcutOption1Input"),
    shortcutOption2Input: document.getElementById("shortcutOption2Input"),
    shortcutOption3Input: document.getElementById("shortcutOption3Input"),
    shortcutOption4Input: document.getElementById("shortcutOption4Input"),
    shortcutNextInput: document.getElementById("shortcutNextInput"),
    startBtn: document.getElementById("startBtn"),
    continueBtn: document.getElementById("continueBtn"),
    imageReviewBtn: document.getElementById("imageReviewBtn"),
    resetSessionBtn: document.getElementById("resetSessionBtn"),
    exportBtn: document.getElementById("exportBtn"),
    exportWrongPrintBtn: document.getElementById("exportWrongPrintBtn"),
    exportMemoryBtn: document.getElementById("exportMemoryBtn"),
    importMemoryBtn: document.getElementById("importMemoryBtn"),
    flattenScoresBtn: document.getElementById("flattenScoresBtn"),
    importMemoryInput: document.getElementById("importMemoryInput"),
    clearWrongBookBtn: document.getElementById("clearWrongBookBtn"),
    clearAllProgressBtn: document.getElementById("clearAllProgressBtn"),
    bankCount: document.getElementById("bankCount"),
    wrongBookCount: document.getElementById("wrongBookCount"),
    answeredCount: document.getElementById("answeredCount"),
    accuracyCount: document.getElementById("accuracyCount"),
    masteredCoverageCount: document.getElementById("masteredCoverageCount"),
    masteredCoverageDetail: document.getElementById("masteredCoverageDetail"),
    totalPointsCount: document.getElementById("totalPointsCount"),
    mainContent: document.getElementById("mainContent"),
    wrongBookList: document.getElementById("wrongBookList"),
    installBtn: document.getElementById("installBtn"),
    versionSummary: document.getElementById("versionSummary"),
    scopeSummary: document.getElementById("scopeSummary"),
    filterSummary: document.getElementById("filterSummary"),
    rewardLevelLabel: document.getElementById("rewardLevelLabel"),
    rewardNextGoal: document.getElementById("rewardNextGoal"),
    rewardProgressBar: document.getElementById("rewardProgressBar"),
    rewardEncouragement: document.getElementById("rewardEncouragement"),
    badgeList: document.getElementById("badgeList"),
  };

  let progress = loadProgress();
  let session = loadSession();
  let settings = loadSettings();
  let imageIssues = loadImageIssues();
  let importedWrongs = loadImportedWrongs();
  let deferredPrompt = null;
  let answerTimeoutId = null;
  let countdownIntervalId = null;
  let autoNextTimeoutId = null;
  let feedbackCountdownIntervalId = null;
  let activeTimerState = null;
  let quizAudioContext = null;
  let audioUnlocked = false;

  init();


  function setQuizChromeMode(mode) {
    const body = document.body;
    if (!body) return;
    body.classList.remove("quiz-mode-active", "image-review-mode", "summary-mode", "empty-mode");
    if (mode === "question" || mode === "flashcard") body.classList.add("quiz-mode-active");
    else if (mode === "imageReview") body.classList.add("image-review-mode");
    else if (mode === "summary") body.classList.add("summary-mode");
    else body.classList.add("empty-mode");
  }

  function hasVisibleQuestionUi() {
    return !!document.querySelector(".quiz-card, .flashcard-wrap, .summary-card, .image-review-wrap");
  }

  function recoverEmptyUiChrome(reason = "") {
    const main = els?.mainContent;
    const body = document.body;
    if (!main || !body) return;
    const isEmpty = main.classList.contains("empty-state") || /第一次使用者|開始練習/.test(main.textContent || "");
    if (isEmpty && body.classList.contains("quiz-mode-active") && !hasVisibleQuestionUi()) {
      console.warn("[ui-recovery] reset quiz chrome while empty", reason);
      setQuizChromeMode("idle");
    }
  }

  function installUiRecoveryGuard() {
    const recover = () => {
      recoverEmptyUiChrome("guard");
      updateMobileRecoveryDock("guard");
    };
    window.addEventListener("pageshow", recover);
    window.addEventListener("focus", recover);
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) recover();
    });
    try {
      const observer = new MutationObserver(() => recover());
      observer.observe(document.body, { childList: true });
    } catch {}
    setTimeout(recover, 0);
    setTimeout(recover, 250);
    setTimeout(recover, 900);
    window.setInterval(recover, 2500);
  }

  function hasHiddenStartControls() {
    const controls = document.querySelector(".controls-panel");
    if (!controls) return true;
    try {
      const style = window.getComputedStyle(controls);
      return style.display === "none" || style.visibility === "hidden" || Number(style.opacity || 1) === 0;
    } catch {
      return false;
    }
  }

  function isLikelyMobileEmptyScreen() {
    const body = document.body;
    const main = els?.mainContent;
    if (!body || !main) return false;
    const hasQuizUi = hasVisibleQuestionUi();
    if (hasQuizUi) return false;
    const text = (main.textContent || "").replace(/\s+/g, " ").trim();
    const mainEmpty = !text || /第一次使用者|開始練習|卡住狀態/.test(text);
    return mainEmpty && (body.classList.contains("quiz-mode-active") || hasHiddenStartControls());
  }

  function ensureMobileRecoveryDock() {
    let dock = document.getElementById("mobileRecoveryDock");
    if (dock) return dock;
    dock = document.createElement("div");
    dock.id = "mobileRecoveryDock";
    dock.className = "mobile-recovery-dock hidden";
    dock.innerHTML = `
      <div class="mobile-recovery-text">畫面卡住或空白時可直接恢復。</div>
      <button type="button" class="primary-btn mobile-recovery-start">開始</button>
      <button type="button" class="ghost-btn mobile-recovery-reset">解除</button>
    `;
    document.body.appendChild(dock);
    dock.querySelector(".mobile-recovery-start")?.addEventListener("click", () => {
      document.body?.classList.remove("quiz-mode-active", "image-review-mode", "summary-mode");
      document.body?.classList.add("empty-mode");
      startSessionFromControls();
    });
    dock.querySelector(".mobile-recovery-reset")?.addEventListener("click", () => {
      clearAllTimers();
      session = null;
      try { localStorage.removeItem(SESSION_KEY); } catch {}
      setQuizChromeMode("idle");
      renderEmptyStartState("mobile-recovery-dock");
    });
    return dock;
  }

  function updateMobileRecoveryDock(reason = "") {
    const dock = ensureMobileRecoveryDock();
    const show = isLikelyMobileEmptyScreen();
    dock.classList.toggle("hidden", !show);
    if (show) {
      console.warn("[ui-recovery] mobile recovery dock visible", reason);
      document.body?.classList.add("mobile-recovery-visible");
    } else {
      document.body?.classList.remove("mobile-recovery-visible");
    }
  }

  function toggleExamDrawer(forceState = null) {
    const drawer = document.getElementById("examDrawer");
    const btn = document.getElementById("toggleDrawerBtn");
    if (!drawer) return;
    const nextOpen = forceState == null ? drawer.classList.contains("hidden") : !!forceState;
    drawer.classList.toggle("hidden", !nextOpen);
    if (btn) btn.textContent = nextOpen ? "收起面板" : "顯示面板";
  }

  function buildExamDrawerHtml(question = null) {
    const scope = session?.filters?.scope || getSelectedScope();
    const practiceMode = session?.filters?.practiceMode || "practice";
    const questionMode = question ? currentQuestionMode(question.id) : (session?.filters?.questionMode || settings.questionMode || "imageToText");
    const bankCount = String(els.bankCount?.textContent || "-");
    const wrongCount = String(els.wrongBookCount?.textContent || "-");
    const answered = String(els.answeredCount?.textContent || "-");
    const accuracy = String(els.accuracyCount?.textContent || "-");
    const positive = String(els.masteredCoverageCount?.textContent || "-");
    const positiveDetail = String(els.masteredCoverageDetail?.textContent || "");
    return `
      <div class="exam-drawer hidden" id="examDrawer">
        <div class="exam-drawer-card">
          <div class="exam-drawer-title">考試面板</div>
          <div class="exam-drawer-grid">
            <div><strong>範圍</strong><div>${escapeHtml(EXAM_SCOPE_LABELS[scope] || scope)}</div></div>
            <div><strong>模式</strong><div>${escapeHtml(PRACTICE_MODE_LABELS[practiceMode] || practiceMode)}</div></div>
            <div><strong>題型</strong><div>${escapeHtml(QUESTION_MODE_LABELS[questionMode] || questionMode)}</div></div>
            <div><strong>分類</strong><div>${escapeHtml(CATEGORY_LABELS[question?.category] || els.categorySelect?.value || "全部分類")}</div></div>
            <div><strong>題庫總數</strong><div>${escapeHtml(bankCount)}</div></div>
            <div><strong>錯題本</strong><div>${escapeHtml(wrongCount)}</div></div>
            <div><strong>累計作答</strong><div>${escapeHtml(answered)}</div></div>
            <div><strong>累計答對率</strong><div>${escapeHtml(accuracy)}</div></div>
            <div><strong>正分覆蓋率</strong><div>${escapeHtml(positive)}</div></div>
          </div>
          <div class="exam-drawer-note">${escapeHtml(positiveDetail || "")}</div>
          <div class="exam-drawer-note">${escapeHtml(refreshFilterSummaryText())}</div>
          <div class="exam-drawer-actions">
            <button id="drawerContinueBtn" class="secondary-btn">繼續答題</button>
            <button id="drawerExitBtn" class="ghost-btn danger">退出本模式</button>
          </div>
        </div>
      </div>
    `;
  }

  function buildExitSessionSummary() {
    if (!session) return "目前沒有進行中的題組。";
    const scope = EXAM_SCOPE_LABELS[session.filters?.scope || getSelectedScope()] || (session.filters?.scope || "");
    const mode = PRACTICE_MODE_LABELS[session.filters?.practiceMode || "practice"] || (session.filters?.practiceMode || "");
    const qmode = QUESTION_MODE_LABELS[session.filters?.questionMode || settings.questionMode || "imageToText"] || (session.filters?.questionMode || "");
    const remaining = Math.max(0, (session.queue?.length || 0) - (session.index || 0));
    return [
      `目前模式：${mode}`,
      `考試範圍：${scope}`,
      `題型：${qmode}`,
      `進度：第 ${Math.min((session.index || 0) + 1, session.queue?.length || 0)} / ${session.queue?.length || 0} 題`,
      `本輪已答：${session.answered || 0} 題，答對 ${session.correct || 0} 題`,
      `本輪目前連對：${session.currentStreak || 0} 題`,
      `剩餘：${remaining} 題`,
      ``,
      `確定要退出目前模式嗎？`
    ].join("\n");
  }

  function confirmExitCurrentMode() {
    if (!session) return;
    if (!window.confirm(buildExitSessionSummary())) return;
    clearAllTimers();
    session = null;
    localStorage.removeItem(SESSION_KEY);
    renderSessionOrEmpty();
  }

  function init() {
    window.addEventListener("pointerdown", unlockAudio, { passive: true });
    window.addEventListener("keydown", unlockAudio, { passive: true });
    hydrateControlsFromSettings();
    buildCategorySelect();
    refreshScopeSummary();
    refreshFilterSummary();
    refreshStats();
    refreshRewards();
    renderWrongBook();
    renderSessionOrEmpty();
    installUiRecoveryGuard();
    wireEvents();
    ensureCriticalBindings();
    registerPWA();
  }

  function ensureCriticalBindings() {
    const startBtn = document.getElementById("startBtn");
    if (startBtn && startBtn.dataset.boundStartSession !== "1") {
      startBtn.dataset.boundStartSession = "1";
      startBtn.addEventListener("click", startSessionFromControls);
    }
    const continueBtn = document.getElementById("continueBtn");
    if (continueBtn && continueBtn.dataset.boundContinueSession !== "1") {
      continueBtn.dataset.boundContinueSession = "1";
      continueBtn.addEventListener("click", () => renderSessionOrEmpty());
    }
  }

  function wireEvents() {
    els.examScopeSelect?.addEventListener("change", () => {
      settings.examScope = els.examScopeSelect.value || "official_small_car";
      saveSettings();
      buildCategorySelect();
      refreshScopeSummary();
      refreshFilterSummary();
      refreshStats();
      refreshRewards();
      renderWrongBook();
      renderSessionOrEmpty();
    });

    [
      els.practiceModeSelect,
      els.questionModeSelect,
      els.questionCountSelect,
      els.masterySelect,
      els.scoreFilterOperatorSelect,
      els.scoreFilterValueInput,
      els.answerTimeLimitInput,
      els.autoNextCorrectDelayInput,
      els.autoNextWrongDelayInput,
      els.soundVolumeInput,
      els.categorySelect,
      els.shortcutOption1Input,
      els.shortcutOption2Input,
      els.shortcutOption3Input,
      els.shortcutOption4Input,
      els.shortcutNextInput,
    ].forEach((node) => {
      node?.addEventListener("change", handleSettingChange);
      node?.addEventListener("input", handleSettingChange);
    });

    els.startBtn?.addEventListener("click", startSessionFromControls);
    els.continueBtn?.addEventListener("click", () => renderSessionOrEmpty());
    els.quickFilterUnseenBtn?.addEventListener("click", () => applyQuickScoreFilter("eq", 0));
    els.quickFilterWrongBtn?.addEventListener("click", () => applyQuickScoreFilter("lt", 0));
    els.quickFilterClearBtn?.addEventListener("click", () => applyQuickScoreFilter("any", 0));
    els.soundTestBtn?.addEventListener("click", () => playCorrectChime());
    els.restoreRecommendedBtn?.addEventListener("click", restoreRecommendedSettings);
    els.imageReviewBtn?.addEventListener("click", renderImageReview);
    els.resetSessionBtn?.addEventListener("click", () => {
      if (!confirm("確定要清除目前題組嗎？")) return;
      clearAllTimers();
      localStorage.removeItem(SESSION_KEY);
      session = null;
      renderSessionOrEmpty();
    });
    els.exportBtn?.addEventListener("click", exportWrongBook);
    els.exportWrongPrintBtn?.addEventListener("click", exportWrongBookPrintable);
    els.exportMemoryBtn?.addEventListener("click", exportFullMemory);
    els.importMemoryBtn?.addEventListener("click", () => els.importMemoryInput?.click());
    els.flattenScoresBtn?.addEventListener("click", flattenScoreDistribution);
    els.importMemoryInput?.addEventListener("change", handleImportLearningFile);
    els.maskTextToggle?.addEventListener("change", () => {
      settings.maskTextBeforeAnswer = !!els.maskTextToggle.checked;
      saveSettings();
      renderSessionOrEmpty();
    });
    els.clearWrongBookBtn?.addEventListener("click", () => {
      if (!confirm("確定要清空目前範圍的錯題本嗎？")) return;
      getScopedQuestions(getSelectedScope()).forEach((q) => {
        const item = questionProgress(q.id);
        item.inWrongBook = false;
        item.masteryStreak = 0;
      });
      saveProgress();
      refreshStats();
      refreshRewards();
      renderWrongBook();
      renderSessionOrEmpty();
    });
    els.clearAllProgressBtn?.addEventListener("click", () => {
      if (!confirm("確定要清空所有作答紀錄、積分與目前題組嗎？")) return;
      clearAllTimers();
      progress = defaultProgress();
      session = null;
      saveProgress();
      localStorage.removeItem(SESSION_KEY);
      refreshStats();
      refreshRewards();
      renderWrongBook();
      renderSessionOrEmpty();
    });
    els.installBtn?.addEventListener("click", async () => {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      deferredPrompt = null;
      els.installBtn.classList.add("hidden");
    });
    document.addEventListener("keydown", handleGlobalShortcuts);
  }

  function applyQuickScoreFilter(operator, value) {
    if (els.scoreFilterOperatorSelect) els.scoreFilterOperatorSelect.value = operator;
    if (els.scoreFilterValueInput) els.scoreFilterValueInput.value = String(value ?? 0);
    handleSettingChange();
  }

  function updateSoundVolumeLabel() {
    if (els.soundVolumeValue) els.soundVolumeValue.textContent = `${Math.round(sanitizeNonNegativeNumber(settings.soundVolumePct, 180))}%`;
  }

  function getSoundVolumeGain() {
    return Math.max(0, sanitizeNonNegativeNumber(settings.soundVolumePct, 180)) / 100;
  }

  function attachResilientImageHandlers(root = document) {
    root.querySelectorAll?.("img").forEach((img) => {
      if (img.dataset.retryBound === "1") return;
      img.dataset.retryBound = "1";
      img.addEventListener("error", () => {
        if (img.dataset.retryTried === "1") {
          img.classList.add("image-load-failed");
          img.title = "圖片載入失敗，可嘗試重新整理或點右上角卡住後重整。";
          return;
        }
        img.dataset.retryTried = "1";
        try {
          const u = new URL(img.currentSrc || img.src, window.location.href);
          u.searchParams.set("img_retry", String(Date.now()));
          img.src = u.toString();
        } catch {}
      });
    });
  }

  function handleSettingChange() {
    settings.examScope = getSelectedScope();
    settings.practiceMode = els.practiceModeSelect?.value || "practice";
    settings.questionMode = els.questionModeSelect?.value || "textChoice";
    settings.questionCount = Number(els.questionCountSelect?.value || 20);
    settings.masteryTarget = Number(els.masterySelect?.value || 2);
    settings.scoreFilterOperator = els.scoreFilterOperatorSelect?.value || "any";
    settings.scoreFilterValue = sanitizeInteger(els.scoreFilterValueInput?.value, 0);
    settings.answerTimeLimitSec = sanitizeNonNegativeNumber(els.answerTimeLimitInput?.value, 15);
    settings.autoNextCorrectDelaySec = sanitizeNonNegativeNumber(els.autoNextCorrectDelayInput?.value, 1);
    settings.autoNextWrongDelaySec = sanitizeNonNegativeNumber(els.autoNextWrongDelayInput?.value, 4);
    settings.soundVolumePct = sanitizeNonNegativeNumber(els.soundVolumeInput?.value, 180);
    settings.shortcutOption1 = normalizeShortcutSetting(els.shortcutOption1Input?.value, "1");
    settings.shortcutOption2 = normalizeShortcutSetting(els.shortcutOption2Input?.value, "2");
    settings.shortcutOption3 = normalizeShortcutSetting(els.shortcutOption3Input?.value, "3");
    settings.shortcutOption4 = normalizeShortcutSetting(els.shortcutOption4Input?.value, "4");
    settings.shortcutNext = normalizeShortcutSetting(els.shortcutNextInput?.value, "Enter");
    saveSettings();
    updateSoundVolumeLabel();
    refreshFilterSummary();
    buildCategorySelect();
    refreshStats();
    refreshRewards();
    renderWrongBook();
    renderSessionOrEmpty();
  }

  function hydrateControlsFromSettings() {
    if (els.examScopeSelect) els.examScopeSelect.value = settings.examScope || "official_small_car";
    if (els.practiceModeSelect) els.practiceModeSelect.value = settings.practiceMode || "practice";
    if (els.questionModeSelect) els.questionModeSelect.value = settings.questionMode || "textChoice";
    if (els.questionCountSelect) els.questionCountSelect.value = String(settings.questionCount || 20);
    if (els.masterySelect) els.masterySelect.value = String(settings.masteryTarget || 2);
    if (els.scoreFilterOperatorSelect) els.scoreFilterOperatorSelect.value = settings.scoreFilterOperator || "any";
    if (els.scoreFilterValueInput) els.scoreFilterValueInput.value = String(settings.scoreFilterValue ?? 0);
    if (els.answerTimeLimitInput) els.answerTimeLimitInput.value = String(settings.answerTimeLimitSec ?? 15);
    if (els.autoNextCorrectDelayInput) els.autoNextCorrectDelayInput.value = String(settings.autoNextCorrectDelaySec ?? 1);
    if (els.autoNextWrongDelayInput) els.autoNextWrongDelayInput.value = String(settings.autoNextWrongDelaySec ?? 4);
    if (els.soundVolumeInput) els.soundVolumeInput.value = String(settings.soundVolumePct ?? 180);
    updateSoundVolumeLabel();
    if (els.shortcutOption1Input) els.shortcutOption1Input.value = settings.shortcutOption1 || "1";
    if (els.shortcutOption2Input) els.shortcutOption2Input.value = settings.shortcutOption2 || "2";
    if (els.shortcutOption3Input) els.shortcutOption3Input.value = settings.shortcutOption3 || "3";
    if (els.shortcutOption4Input) els.shortcutOption4Input.value = settings.shortcutOption4 || "4";
    if (els.shortcutNextInput) els.shortcutNextInput.value = settings.shortcutNext || "Enter";
    if (els.maskTextToggle) els.maskTextToggle.checked = false;
  }

  function registerPWA() {
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      els.installBtn?.classList.remove("hidden");
    });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("./service-worker.js").catch(() => {});
    }
  }

  function getSelectedScope() {
    return els.examScopeSelect?.value || settings.examScope || "official_small_car";
  }

  function isOfficialSmallCarQuestion(question) {
    return !!(
      question?.id?.startsWith("JGYL-") ||
      question?.category === "jingui_formula"
    );
  }

  function isMechanicalQuestion(question) {
    return !!(question?.category && !isOfficialSmallCarQuestion(question));
  }

  function isQuestionInScope(question, scope) {
    if (!question) return false;
    if (scope === "official_small_car") return isOfficialSmallCarQuestion(question);
    if (scope === "official_plus_mechanical") return isOfficialSmallCarQuestion(question) || isMechanicalQuestion(question);
    return true;
  }

  function getScopedQuestions(scope = getSelectedScope()) {
    return ALL_QUESTIONS.filter((q) => isQuestionInScope(q, scope));
  }

  function buildCategorySelect() {
    const previousValue = els.categorySelect?.value || settings.category || "all";
    const scopedQuestions = getScopedQuestions();
    const categories = Array.from(new Set(scopedQuestions.map((q) => q.category)));
    const options = [{ value: "all", label: CATEGORY_LABELS.all }];
    categories.forEach((cat) => options.push({ value: cat, label: CATEGORY_LABELS[cat] || cat }));
    if (!els.categorySelect) return;
    els.categorySelect.innerHTML = options.map((opt) => `<option value="${escapeAttr(opt.value)}">${escapeHtml(opt.label)}</option>`).join("");
    els.categorySelect.value = options.some((opt) => opt.value === previousValue) ? previousValue : "all";
  }

  function refreshScopeSummary() {
    const scope = getSelectedScope();
    const scopedCount = getScopedQuestions(scope).length;
    const totalCount = ALL_QUESTIONS.length;
    if (els.versionSummary) {
      els.versionSummary.textContent = `v0.1.1｜${EXAM_SCOPE_LABELS[scope] || scope}：目前可用 ${scopedCount} 題；全部題庫共 ${totalCount} 題。`;
    }
    if (els.scopeSummary) {
      els.scopeSummary.textContent = EXAM_SCOPE_DESCRIPTIONS[scope] || "";
    }
  }

  function refreshFilterSummaryText() {
    const operator = els.scoreFilterOperatorSelect?.value || settings.scoreFilterOperator || "any";
    const value = sanitizeInteger(els.scoreFilterValueInput?.value ?? settings.scoreFilterValue, 0);
    const timeLimit = sanitizeNonNegativeNumber(els.answerTimeLimitInput?.value ?? settings.answerTimeLimitSec, 15);
    const autoNextCorrect = sanitizeNonNegativeNumber(els.autoNextCorrectDelayInput?.value ?? settings.autoNextCorrectDelaySec, 1);
    const autoNextWrong = sanitizeNonNegativeNumber(els.autoNextWrongDelayInput?.value ?? settings.autoNextWrongDelaySec, 4);
    let scoreText = "目前未啟用積分篩選；可用上方快捷按鈕快速套用「=0」或「<0」。";
    if (operator !== "any") {
      scoreText = `目前只會抽出積分 ${SCORE_FILTER_LABELS[operator]} ${value} 的題目。`;
    }
    const timeText = `每題限時 ${timeLimit > 0 ? `${timeLimit} 秒` : "不限時"}；答對後 ${autoNextCorrect > 0 ? `${autoNextCorrect} 秒` : "不自動"}，答錯後 ${autoNextWrong > 0 ? `${autoNextWrong} 秒` : "不自動"}。`;
    return `${scoreText} ${timeText}`;
  }

  function refreshFilterSummary() {
    const summaryText = refreshFilterSummaryText();
    if (els.filterSummary) {
      els.filterSummary.textContent = summaryText;
    }
  }

  function startSessionFromControls() {
    clearAllTimers();
    const masteryTarget = Number(els.masterySelect?.value || "2");
    const category = els.categorySelect?.value || "all";
    const practiceMode = els.practiceModeSelect?.value || "practice";
    const questionMode = els.questionModeSelect?.value || "textChoice";
    const requestedCount = Number(els.questionCountSelect?.value || "20");
    const scope = getSelectedScope();
    const scoreFilterOperator = els.scoreFilterOperatorSelect?.value || "any";
    const scoreFilterValue = sanitizeInteger(els.scoreFilterValueInput?.value, 0);
    const answerTimeLimitSec = sanitizeNonNegativeNumber(els.answerTimeLimitInput?.value, 15);
    const autoNextCorrectDelaySec = sanitizeNonNegativeNumber(els.autoNextCorrectDelayInput?.value, 1);
    const autoNextWrongDelaySec = sanitizeNonNegativeNumber(els.autoNextWrongDelayInput?.value, 4);

    let pool = getScopedQuestions(scope).filter((q) => category === "all" ? true : q.category === category);
    if (practiceMode === "wrongOnly") {
      pool = pool.filter((q) => questionProgress(q.id).inWrongBook);
    } else {
      pool = applyScoreFilter(pool, scoreFilterOperator, scoreFilterValue);
    }

    if (!pool.length) {
      const msg = practiceMode === "wrongOnly"
        ? "目前這個範圍／分類沒有錯題可練習。"
        : "這個範圍／分類在目前積分篩選下沒有可用題目。";
      alert(msg);
      return;
    }

    const queue = shuffle(pool).slice(0, Math.min(requestedCount, pool.length));
    const questionModeMap = {};
    queue.forEach((question) => {
      if (practiceMode === "flashcard") {
        questionModeMap[question.id] = deduceQuestionMode(question, questionMode);
      } else {
        questionModeMap[question.id] = questionMode === "mixed"
          ? deduceQuestionMode(question, Math.random() < 0.5 ? "imageToText" : "textToImage")
          : deduceQuestionMode(question, questionMode);
      }
    });

    session = {
      queue: queue.map((q) => q.id),
      index: 0,
      answered: 0,
      correct: 0,
      wrongIds: [],
      masteryTarget,
      answeredMap: {},
      questionModeMap,
      createdAt: new Date().toISOString(),
      filters: { scope, category, practiceMode, questionMode, requestedCount, scoreFilterOperator, scoreFilterValue, answerTimeLimitSec, autoNextCorrectDelaySec, autoNextWrongDelaySec },
      lastAnsweredQuestionId: "",
      currentStreak: 0,
      bestStreak: 0,
      flashRevealed: false,
      pointsDelta: 0,
    };
    saveSession();
    renderSessionOrEmpty();
  }

  function validateAndNormalizeSession() {
    if (!session || !Array.isArray(session.queue)) return { ok: false, reason: "no-session" };

    const originalLen = session.queue.length;
    const normalizedQueue = session.queue.filter((id) => typeof id === "string" && !!getQuestion(id));
    if (normalizedQueue.length !== originalLen) {
      console.warn("[session-repair] removed missing question ids", { originalLen, normalizedLen: normalizedQueue.length });
      session.queue = normalizedQueue;
      if (session.questionModeMap && typeof session.questionModeMap === "object") {
        const allowed = new Set(normalizedQueue);
        Object.keys(session.questionModeMap).forEach((id) => { if (!allowed.has(id)) delete session.questionModeMap[id]; });
      }
    }

    if (!session.queue.length) return { ok: false, reason: "empty-or-stale-session" };

    let idx = Number(session.index || 0);
    if (!Number.isFinite(idx) || idx < 0) idx = 0;
    session.index = Math.floor(idx);
    if (session.index > session.queue.length) session.index = session.queue.length;

    if (normalizedQueue.length !== originalLen) {
      try { saveSession(); } catch (error) { console.warn("[session-repair] save failed", error); }
    }

    return { ok: true, reason: "ok" };
  }

  function renderEmptyStartState(reason = "") {
    clearAllTimers();
    setQuizChromeMode("idle");
    els.mainContent.className = "panel quiz-panel empty-state";
    if (importedWrongs?.length) { renderImportedWrongs(); return; }
    const reasonNote = reason && reason !== "no-session"
      ? `<p class="secondary-meta">已自動解除舊題組或快取造成的卡住狀態（${escapeHtml(reason)}）。</p>`
      : "";
    els.mainContent.innerHTML = `
      <div class="empty-start-card">
        <p>第一次使用者只須點擊「開始練習」即可，題目會顯示在這裡。</p>
        ${reasonNote}
        <div class="actions compact empty-start-actions">
          <button id="emptyStartBtn" class="primary-btn" type="button">開始練習</button>
          <button id="emptyResetUiBtn" class="ghost-btn" type="button">解除卡住狀態</button>
        </div>
        <p class="secondary-meta">若手機刷新後只剩黑畫面，請按「解除卡住狀態」或重新整理；這不會清除錯題本與作答記憶。</p>
      </div>
    `;
    document.getElementById("emptyStartBtn")?.addEventListener("click", startSessionFromControls);
    document.getElementById("emptyResetUiBtn")?.addEventListener("click", () => {
      clearAllTimers();
      document.body?.classList.remove("quiz-mode-active", "image-review-mode", "summary-mode");
      document.body?.classList.add("empty-mode");
      session = null;
      try { localStorage.removeItem(SESSION_KEY); } catch {}
      renderEmptyStartState("manual-ui-reset");
    });
    attachResilientImageHandlers(els.mainContent);
    updateMobileRecoveryDock("empty-state-rendered");
  }

  function renderSessionOrEmpty() {
    const validation = validateAndNormalizeSession();
    if (!validation.ok) {
      if (validation.reason !== "no-session") {
        session = null;
        try { localStorage.removeItem(SESSION_KEY); } catch {}
      }
      renderEmptyStartState(validation.reason);
      return;
    }
    if (session.index >= session.queue.length) {
      clearAllTimers();
      renderSummary();
      return;
    }
    if ((session.filters?.practiceMode || "practice") === "flashcard") renderFlashcard();
    else renderQuestion();
  }


function renderQuestion() {
  clearAllTimers();
  const question = currentQuestion();
  if (!question) {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    renderEmptyStartState("missing-current-question");
    return;
  }
  setQuizChromeMode("question");

  const progressPct = Math.round((session.index / Math.max(session.queue.length, 1)) * 100);
  const practiceMode = session.filters?.practiceMode || "practice";
  const questionMode = currentQuestionMode(question.id);
  const optionPayload = questionMode === "textToImage" ? buildImageOptions(question) : buildTextOptions(question);
  const questionScore = questionProgress(question.id).score;

  const optionHtml = questionMode === "textToImage"
    ? optionPayload.options.map((opt, idx) => `
        <button class="image-option-btn" data-value="${escapeAttr(opt.id)}" data-index="${idx}">
          <span class="image-option-label">選項 ${idx + 1}</span>
          <span class="image-option-frame">
            ${buildMaskedMedia(opt, { alt: opt.answer, reveal: false, className: "masked-media option-media" })}
          </span>
        </button>
      `).join("")
    : optionPayload.options.map((opt, idx) => `
        <button class="option-btn" data-value="${escapeAttr(opt)}" data-index="${idx}">
          <span class="option-kbd">${escapeHtml(getOptionShortcutLabel(idx))}</span>
          <span class="option-text">${escapeHtml(opt)}</span>
        </button>
      `).join("");

  const mediaHtml = questionMode !== "textToImage" && question.image
    ? `<div class="image-card compact-image-card">${buildMaskedMedia(question, { alt: question.answer, reveal: false, className: "masked-media question-media" })}</div>`
    : "";

  const promptText = questionMode === "textToImage" ? `「${question.answer}」對應哪一個保留圖示？` : question.prompt;
  const optionListClass = questionMode === "textToImage" ? "image-option-grid" : "option-list";
  const scope = session.filters?.scope || getSelectedScope();
  const timeLimit = session.filters?.answerTimeLimitSec || 0;
  const contentLayoutClass = mediaHtml ? "question-content-grid has-media" : "question-content-grid";

  els.mainContent.className = "panel quiz-panel exam-active";
  els.mainContent.innerHTML = `
    <div class="quiz-header compact">
      <div class="badges">
        <span class="badge accent-badge">第 ${session.index + 1} / ${session.queue.length} 題</span>
        <span class="badge">${escapeHtml(EXAM_SCOPE_LABELS[scope] || scope)}</span>
        <span class="badge">${escapeHtml(PRACTICE_MODE_LABELS[practiceMode] || practiceMode)}</span>
        <span class="badge">${escapeHtml(QUESTION_MODE_LABELS[questionMode] || questionMode)}</span>
        <span class="badge">${escapeHtml(CATEGORY_LABELS[question.category] || question.category)}</span>
        <span class="badge ${questionScore > 0 ? "score-badge-positive" : questionScore < 0 ? "score-badge-negative" : ""}">本題積分 ${formatSignedNumber(questionScore)}</span>
        <span class="badge">答對 ${session.correct}</span>
        <span class="badge">答錯 ${session.wrongIds.length}</span>
        <span class="badge">連對 ${session.currentStreak || 0}</span>
      </div>
    </div>
    <div class="timer-wrap compact compact-tight">
      <span id="timerBadge" class="badge timer-badge">${timeLimit > 0 ? `剩餘 ${formatSeconds(timeLimit)}` : "不限時"}</span>
      <button id="pauseBtn" class="ghost-btn aux-btn">暫停</button>
      <button id="toggleDrawerBtn" class="ghost-btn aux-btn">顯示面板</button>
      <button id="exitModeBtn" class="ghost-btn danger">退出模式</button>
      <span class="secondary-meta">快捷鍵：${escapeHtml(buildShortcutSummary())} ｜ Space 暫停 / Esc 退出</span>
    </div>
    <div class="timer-bar-wrap"><div id="timerBar" class="timer-bar"></div></div>
    <div class="progress-wrap compact"><div class="progress-bar" style="width:${progressPct}%"></div></div>
    ${buildExamDrawerHtml(question)}
    <div class="quiz-card question-session-card bright compact-question-card">
      <div class="question-topline">
        <p class="prompt">${escapeHtml(promptText)}</p>
        <div class="question-source">出處：${escapeHtml(buildQuestionOriginLabel(question))}</div>
      </div>
      <div class="${contentLayoutClass}">
        ${mediaHtml ? `<div class="question-media-col">${mediaHtml}</div>` : ""}
        <div class="question-main-col">
          <div id="optionList" class="${optionListClass}">${optionHtml}</div>
          <div class="utility-row compact compact-question-actions">
            <div class="secondary-meta">答對 +1 分，答錯 / 逾時 / 不會 -1 分。</div>
            <div class="inline-action-group">
              <button id="searchQuestionQuickBtn" class="ghost-btn aux-btn">搜尋此題</button>
              ${buildYizongSourceButtonHtml(question)}
              ${buildAiVerifyButtonsHtml(question)}
              ${buildAiVerifyCopyToggleHtml()}
              <button id="dontKnowBtn" class="ghost-btn aux-btn">不會（-1）</button>
            </div>
          </div>
        </div>
      </div>
      <div id="feedbackMount"></div>
    </div>
  `;

  Array.from(document.querySelectorAll(questionMode === "textToImage" ? ".image-option-btn" : ".option-btn")).forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(question, btn.dataset.value, optionPayload, { selectedLabel: resolveSelectedLabel(questionMode, btn.dataset.value) }));
  });
  document.getElementById("dontKnowBtn")?.addEventListener("click", () => {
    handleAnswer(question, "__dont_know__", optionPayload, { forcedWrong: true, selectedLabel: "不會", reason: "dontKnow" });
  });
  document.getElementById("pauseBtn")?.addEventListener("click", togglePauseResume);
  document.getElementById("toggleDrawerBtn")?.addEventListener("click", () => toggleExamDrawer());
  document.getElementById("drawerContinueBtn")?.addEventListener("click", () => toggleExamDrawer(false));
  document.getElementById("drawerExitBtn")?.addEventListener("click", confirmExitCurrentMode);
  document.getElementById("exitModeBtn")?.addEventListener("click", confirmExitCurrentMode);
  bindQuestionSearchButton(question);
  bindYizongSourceButtons(question);
  bindAiVerifyButtons(question);
  bindAiVerifyCopyToggles();
  bindVerifyToolButton();
  attachResilientImageHandlers(els.mainContent);
  updateMobileRecoveryDock("question-rendered");
  startQuestionTimer(question);
}

function renderFlashcard() {
  clearAllTimers();
  const question = currentQuestion();
  if (!question) {
    session = null;
    try { localStorage.removeItem(SESSION_KEY); } catch {}
    renderEmptyStartState("missing-current-flashcard");
    return;
  }
  setQuizChromeMode("flashcard");

  const progressPct = Math.round((session.index / Math.max(session.queue.length, 1)) * 100);
  const questionMode = currentQuestionMode(question.id);
  const scope = session.filters?.scope || getSelectedScope();
  const qp = questionProgress(question.id);
  const revealed = !!session.flashRevealed;
  const promptText = question.prompt || question.answer;

  const frontContent = question.image
    ? `
      <div class="flashcard-image">${buildMaskedMedia(question, { alt: question.answer, reveal: false, className: "masked-media question-media" })}</div>
      <p class="flashcard-front-prompt">${escapeHtml(promptText)}</p>
      <p class="secondary-meta">先看圖與題目，想一遍答案，再翻面確認。</p>
    `
    : `
      <p class="flashcard-front-prompt">${escapeHtml(promptText)}</p>
      <p class="secondary-meta">先自己回想答案，再翻面確認。</p>
    `;

  const backContent = `
    <div class="flashcard-question-ref"><strong>題目：</strong>${escapeHtml(promptText)}</div>
    ${question.image ? `<div class="flashcard-image">${buildMaskedMedia(question, { alt: question.answer, reveal: true, className: "masked-media question-media" })}</div>` : ""}
    <p class="flashcard-answer">${escapeHtml(question.answer)}</p>
    ${buildAnswerExplanationHtml(question)}
    <p class="secondary-meta">本題目前積分 ${formatSignedNumber(qp.score)} ・ 題型 ${escapeHtml(QUESTION_MODE_LABELS[questionMode] || questionMode)} ・ 瀏覽快捷鍵：← 上一張／→ 下一張</p>
  `;

  els.mainContent.className = "panel quiz-panel exam-active";
  els.mainContent.innerHTML = `
    <div class="quiz-header">
      <div class="badges">
        <span class="badge accent-badge">第 ${session.index + 1} / ${session.queue.length} 張</span>
        <span class="badge">${escapeHtml(EXAM_SCOPE_LABELS[scope] || scope)}</span>
        <span class="badge">單字卡複習</span>
        <span class="badge">${escapeHtml(CATEGORY_LABELS[question.category] || question.category)}</span>
        <span class="badge ${qp.score > 0 ? "score-badge-positive" : qp.score < 0 ? "score-badge-negative" : ""}">本題積分 ${formatSignedNumber(qp.score)}</span>
      </div>
      <div class="badges">
        <span class="badge">已評分 ${session.answered}</span>
        <span class="badge">連續記得 ${session.currentStreak || 0}</span>
      </div>
    </div>
    <div class="progress-wrap"><div class="progress-bar" style="width:${progressPct}%"></div></div>
    ${buildExamDrawerHtml(question)}
    <div class="flashcard-wrap">
      <div class="flashcard ${revealed ? "back" : "front"}">
        <div class="question-source">出處：${escapeHtml(buildQuestionOriginLabel(question))}</div>
        ${revealed ? backContent : frontContent}
      </div>
      <div class="flashcard-toolbar"><button id="pauseBtn" class="ghost-btn aux-btn">暫停</button><button id="toggleDrawerBtn" class="ghost-btn aux-btn">顯示面板</button><button id="exitModeBtn" class="ghost-btn danger">退出模式</button><span class="secondary-meta">快捷鍵：← / → ｜ Space 暫停 / Esc 退出</span></div>
      <div class="flashcard-actions">
        <button id="prevCardBtn" class="secondary-btn" ${session.index <= 0 ? "disabled" : ""}>上一張</button>
        ${revealed
          ? `<button id="knownBtn" class="primary-btn">知道（+1）</button>
             <button id="unknownBtn" class="ghost-btn aux-btn">還不會（-1）</button>`
          : `<button id="flipBtn" class="primary-btn">翻面看答案</button>`}
        <button id="nextCardBtn" class="secondary-btn">下一張</button>
      </div>
    </div>
  `;

  document.getElementById("toggleDrawerBtn")?.addEventListener("click", () => toggleExamDrawer());
  document.getElementById("drawerContinueBtn")?.addEventListener("click", () => toggleExamDrawer(false));
  document.getElementById("drawerExitBtn")?.addEventListener("click", confirmExitCurrentMode);
  document.getElementById("exitModeBtn")?.addEventListener("click", confirmExitCurrentMode);
  document.getElementById("flipBtn")?.addEventListener("click", () => {
    session.flashRevealed = true;
    saveSession();
    renderFlashcard();
  });
  document.getElementById("knownBtn")?.addEventListener("click", () => {
    handleFlashcardGrade(question, true);
  });
  document.getElementById("unknownBtn")?.addEventListener("click", () => {
    handleFlashcardGrade(question, false);
  });
  document.getElementById("prevCardBtn")?.addEventListener("click", goToPreviousFlashcard);
  document.getElementById("nextCardBtn")?.addEventListener("click", goToNextFlashcardWithoutGrading);
  bindQuestionSearchButton(question);
  bindYizongSourceButtons(question);
  bindAiVerifyButtons();
  bindVerifyToolButton();
  attachResilientImageHandlers(els.mainContent);
}

function goToPreviousFlashcard() {
  if (!session || session.index <= 0) return;
  session.index -= 1;
  session.flashRevealed = false;
  saveSession();
  renderSessionOrEmpty();
}

function goToNextFlashcardWithoutGrading() {
  if (!session) return;
  session.index += 1;
  session.flashRevealed = false;
  saveSession();
  renderSessionOrEmpty();
}


  function unlockAudio() {
    try {
      if (!quizAudioContext) {
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        quizAudioContext = new Ctx();
      }
      if (quizAudioContext.state === "suspended") quizAudioContext.resume();
      audioUnlocked = true;
    } catch {
      audioUnlocked = false;
    }
  }

  function playCorrectChime() {
    try {
      unlockAudio();
      if (!quizAudioContext) return;
      const now = quizAudioContext.currentTime;
      const master = quizAudioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.08 * getSoundVolumeGain()), now + 0.02);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.8);
      master.connect(quizAudioContext.destination);

      [523.25, 659.25, 783.99].forEach((freq, idx) => {
        const osc = quizAudioContext.createOscillator();
        const gain = quizAudioContext.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.12 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.22);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.24);
      });
    } catch {}
  }

  function playWrongBuzz() {
    try {
      unlockAudio();
      if (!quizAudioContext) return;
      const now = quizAudioContext.currentTime;
      const master = quizAudioContext.createGain();
      master.gain.setValueAtTime(0.0001, now);
      master.gain.exponentialRampToValueAtTime(Math.max(0.0001, 0.08 * getSoundVolumeGain()), now + 0.01);
      master.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);
      master.connect(quizAudioContext.destination);

      [220, 180].forEach((freq, idx) => {
        const osc = quizAudioContext.createOscillator();
        const gain = quizAudioContext.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + idx * 0.14);
        gain.gain.setValueAtTime(0.0001, now + idx * 0.14);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.14 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.14 + 0.18);
        osc.connect(gain);
        gain.connect(master);
        osc.start(now + idx * 0.14);
        osc.stop(now + idx * 0.14 + 0.2);
      });
    } catch {}
  }


  function handleFlashcardGrade(question, known) {
    if (session.answeredMap[question.id]) return;
    if (known) playCorrectChime();
    else playWrongBuzz();

    applyQuestionResult(question, {
      isCorrect: !!known,
      selectedValue: known ? "__known__" : "__unknown__",
      selectedLabel: known ? "知道" : "還不會",
      mode: currentQuestionMode(question.id),
      reason: known ? "flashcardKnown" : "flashcardUnknown",
    });

    const qp = questionProgress(question.id);
    const autoNextDelaySec = sanitizeNonNegativeNumber(known ? session.filters?.autoNextCorrectDelaySec : session.filters?.autoNextWrongDelaySec, known ? 1 : 4);
    els.mainContent.querySelector(".flashcard-actions")?.insertAdjacentHTML("beforeend", `
      <div class="feedback ${known ? "good" : "bad"}">
        <div class="feedback-title ${known ? "good" : "bad"}">${known ? "已標記為知道" : "已標記為還不會"}</div>
        <div>本題積分現在為 <strong>${formatSignedNumber(qp.score)}</strong></div>
        <div class="feedback-countdown" id="flashcardNextCountdown"></div>
      </div>
    `);
    scheduleNext(autoNextDelaySec, "flashcardNextCountdown", advanceToNextQuestion);
  }

  function scrollFeedbackIntoView(feedbackMount, options = {}) {
    if (!feedbackMount) return;
    const shouldAutoScroll = window.matchMedia?.("(max-width: 900px)")?.matches || (feedbackMount.scrollHeight || 0) > 480;
    if (!shouldAutoScroll) return;
    const run = () => {
      try {
        feedbackMount.scrollIntoView({ behavior: options.immediate ? "auto" : "smooth", block: "start", inline: "nearest" });
      } catch {
        try {
          const top = feedbackMount.getBoundingClientRect().top + window.scrollY - 12;
          window.scrollTo({ top: Math.max(0, top), behavior: options.immediate ? "auto" : "smooth" });
        } catch {}
      }
    };
    requestAnimationFrame(() => window.setTimeout(run, 40));
  }

  function handleAnswer(question, selectedValue, optionPayload, meta = {}) {
    if (session.answeredMap[question.id]) return;
    clearAllTimers();

    const questionMode = currentQuestionMode(question.id);
    const isCorrect = meta.forcedWrong
      ? false
      : questionMode === "textToImage"
        ? selectedValue === question.id
        : question.kind === "true_false"
          ? canonicalizeTrueFalseValue(selectedValue) === canonicalizeTrueFalseValue(question.answer)
          : selectedValue === question.answer;

    if (isCorrect) playCorrectChime();
    else playWrongBuzz();

    applyQuestionResult(question, {
      isCorrect,
      selectedValue,
      selectedLabel: meta.selectedLabel || resolveSelectedLabel(questionMode, selectedValue),
      mode: questionMode,
      reason: meta.reason || "answered",
    });

    revealCurrentMaskedMedia();
    Array.from(document.querySelectorAll(questionMode === "textToImage" ? ".image-option-btn" : ".option-btn")).forEach((btn) => {
      btn.disabled = true;
      if (questionMode === "textToImage") {
        const buttonQuestion = getQuestion(btn.dataset.value);
        const imageAnswer = buttonQuestion ? buttonQuestion.id : btn.dataset.value;
        if (imageAnswer === question.id) btn.classList.add("correct");
        if (btn.dataset.value === selectedValue && imageAnswer !== question.id) btn.classList.add("wrong");
      } else {
        const answer = btn.dataset.value;
        const isAnswerMatch = question.kind === "true_false"
          ? canonicalizeTrueFalseValue(answer) === canonicalizeTrueFalseValue(question.answer)
          : answer === question.answer;
        const isSelectedMatch = question.kind === "true_false"
          ? canonicalizeTrueFalseValue(answer) === canonicalizeTrueFalseValue(selectedValue)
          : answer === selectedValue;
        if (isAnswerMatch) btn.classList.add("correct");
        if (isSelectedMatch && !isAnswerMatch) btn.classList.add("wrong");
      }
    });
    document.getElementById("dontKnowBtn")?.setAttribute("disabled", "disabled");

    const practiceMode = session.filters?.practiceMode || "practice";
    const feedbackMount = document.getElementById("feedbackMount");
    const sourceMeta = buildSourceMeta(question);
    const autoNextDelaySec = sanitizeNonNegativeNumber(isCorrect ? session.filters?.autoNextCorrectDelaySec : session.filters?.autoNextWrongDelaySec, isCorrect ? 1 : 4);
    const qp = questionProgress(question.id);
    const extraStatus = meta.reason === "timeout" ? "逾時未作答，已視為錯誤。" : meta.reason === "dontKnow" ? "已標記為不會，視為錯誤。" : "";

    if (practiceMode === "exam") {
      feedbackMount.innerHTML = `
        <div class="feedback neutral">
          <div class="feedback-title">已作答</div>
          <div>你的狀態：<strong>${escapeHtml(meta.selectedLabel || "已作答")}</strong></div>
          <div>本題積分：<strong>${formatSignedNumber(qp.score)}</strong></div>
          <small>模擬考模式不立即顯示正解，結束後統一回顧。${escapeHtml(extraStatus)}</small>
          <div class="actions compact">
            <button id="nextBtn" class="primary-btn next-btn">${session.index + 1 >= session.queue.length ? "看結果" : "下一題"}</button>
            <span class="feedback-countdown" id="nextCountdown"></span>
          </div>
        </div>
      `;
    } else {
      feedbackMount.innerHTML = `
        <div class="feedback ${isCorrect ? "good" : "bad"}">
          <div class="feedback-title ${isCorrect ? "good" : "bad"}">${isCorrect ? "答對了" : "答錯了"}</div>
          <div>正確答案：<strong>${escapeHtml(question.answer)}</strong></div>
          <div>本題積分：<strong>${formatSignedNumber(qp.score)}</strong></div>
          ${extraStatus ? `<div>${escapeHtml(extraStatus)}</div>` : ""}
          ${buildAnswerExplanationHtml(question)}
          <small>${escapeHtml(sourceMeta)}</small>
          <div class="actions compact">
            <button id="nextBtn" class="primary-btn next-btn">${session.index + 1 >= session.queue.length ? "看結果" : "下一題"}</button>
            <span class="feedback-countdown" id="nextCountdown"></span>
          </div>
        </div>
      `;
    }

    document.getElementById("nextBtn")?.addEventListener("click", advanceToNextQuestion);
    bindYizongSourceButtons();
    bindAiVerifyButtons();
    bindAiVerifyCopyToggles();
    bindVerifyToolButton();
    scrollFeedbackIntoView(feedbackMount, { immediate: meta.reason === "timeout" });
    scheduleNext(autoNextDelaySec, "nextCountdown");
  }

  function applyQuestionResult(question, { isCorrect, selectedValue, selectedLabel, mode, reason }) {
    const qp = questionProgress(question.id);
    session.answered += 1;
    session.lastAnsweredQuestionId = question.id;
    session.pointsDelta += isCorrect ? 1 : -1;
    if (isCorrect) {
      session.correct += 1;
      session.currentStreak = (session.currentStreak || 0) + 1;
      session.bestStreak = Math.max(session.bestStreak || 0, session.currentStreak);
    } else {
      session.wrongIds.push(question.id);
      session.currentStreak = 0;
    }

    session.answeredMap[question.id] = {
      questionId: question.id,
      selectedValue,
      selectedLabel,
      isCorrect,
      mode,
      reason,
    };

    qp.totalSeen += 1;
    qp.score += isCorrect ? 1 : -1;
    const nowIso = new Date().toISOString();
    qp.lastSeenAt = nowIso;
    qp.lastResult = isCorrect ? "correct" : "wrong";
    qp.lastSelectedValue = typeof selectedValue === "string" ? selectedValue : String(selectedValue ?? "");
    qp.lastSelectedLabel = typeof selectedLabel === "string" ? selectedLabel : String(selectedLabel ?? "");
    if (isCorrect) {
      qp.totalCorrect += 1;
      if (qp.inWrongBook) {
        qp.masteryStreak += 1;
        if (qp.masteryStreak >= (session.masteryTarget || 2)) {
          qp.inWrongBook = false;
          qp.masteryStreak = 0;
        }
      }
    } else {
      qp.totalWrong += 1;
      qp.inWrongBook = true;
      qp.masteryStreak = 0;
      qp.lastWrongAt = nowIso;
      qp.lastWrongSelectedValue = qp.lastSelectedValue;
      qp.lastWrongSelectedLabel = qp.lastSelectedLabel;
    }

    progress.meta.totalAnswered += 1;
    if (isCorrect) progress.meta.totalCorrect += 1;
    progress.meta.bestStreak = Math.max(progress.meta.bestStreak || 0, session.bestStreak || 0);
    saveProgress();
    saveSession();
    refreshStats();
    refreshRewards();
    renderWrongBook();
  }

  function renderSummary() {
    clearAllTimers();
    setQuizChromeMode("summary");
    const scorePct = session.queue.length ? Math.round((session.correct / session.queue.length) * 100) : 0;
    const practiceMode = session.filters?.practiceMode || "practice";
    const scope = session.filters?.scope || getSelectedScope();
    const answeredRecords = session.queue
      .map((id) => ({ question: getQuestion(id), record: session.answeredMap[id] }))
      .filter((x) => x.question && x.record);
    const wrongRecords = answeredRecords.filter((x) => !x.record.isCorrect);
    progress.meta.totalCompletedSessions += 1;
    saveProgress();
    refreshRewards();

    els.mainContent.className = "panel quiz-panel";
    els.mainContent.innerHTML = `
      <div class="summary-card">
        <h2>${practiceMode === "exam" ? "模擬考完成" : practiceMode === "flashcard" ? "單字卡複習完成" : "本次練習完成"}</h2>
        <div class="summary-grid">
          <div class="summary-mini-card"><span class="stat-label">範圍</span><strong>${escapeHtml(EXAM_SCOPE_LABELS[scope] || scope)}</strong></div>
          <div class="summary-mini-card"><span class="stat-label">模式</span><strong>${escapeHtml(PRACTICE_MODE_LABELS[practiceMode] || practiceMode)}</strong></div>
          <div class="summary-mini-card"><span class="stat-label">本次題數</span><strong>${session.queue.length}</strong></div>
          <div class="summary-mini-card"><span class="stat-label">正確率</span><strong>${scorePct}%</strong></div>
          <div class="summary-mini-card"><span class="stat-label">最長連續答對</span><strong>${session.bestStreak || 0}</strong></div>
          <div class="summary-mini-card"><span class="stat-label">本次積分變化</span><strong>${formatSignedNumber(session.pointsDelta || 0)}</strong></div>
        </div>
        <p class="session-encouragement">${buildSessionEncouragement(scorePct, session.bestStreak || 0, practiceMode)}</p>
        <p class="note">錯題已加入錯題本。若之後在錯題本模式連續答對達設定次數，會自動移出。</p>
        ${wrongRecords.length ? `
          <div>
            <h3>本次錯題</h3>
            <div class="wrong-list">
              ${wrongRecords.map(({ question, record }) => `
                <div class="wrong-item detail">
                  ${question.image ? `<img class="wrong-thumb" src="${escapeAttr(question.image)}" alt="${escapeAttr(question.answer)}">` : `<div class="wrong-thumb wrong-thumb-text">文字題</div>`}
                  <div class="wrong-item-main">
                    <div class="wrong-item-title">${escapeHtml(buildQuestionPreview(question))}</div>
                    <div class="wrong-item-meta">${escapeHtml(CATEGORY_LABELS[question.category] || question.category)} ・ ${escapeHtml(QUESTION_MODE_LABELS[record.mode] || record.mode)}</div>
                    ${buildOptionPreview(question) ? `<div class="wrong-item-note">選項：${escapeHtml(buildOptionPreview(question))}</div>` : ""}
                    <div class="wrong-item-note">你的答案：${escapeHtml(record.selectedLabel)} ｜ 正確答案：${escapeHtml(question.answer)}</div>
                    ${buildAnswerExplanationHtml(question)}
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        ` : `<div class="feedback good"><div class="feedback-title good">本次全對</div><div>這組題目沒有錯題。</div></div>`}
        <div class="actions">
          <button id="retryWrongBtn" class="primary-btn">只練本次錯題</button>
          <button id="flashcardWrongBtn" class="secondary-btn">錯題單字卡複習</button>
          <button id="newSessionBtn" class="ghost-btn">重新開始新題組</button>
        </div>
      </div>
    `;

    document.getElementById("newSessionBtn")?.addEventListener("click", () => {
      localStorage.removeItem(SESSION_KEY);
      session = null;
      renderSessionOrEmpty();
    });
    document.getElementById("retryWrongBtn")?.addEventListener("click", () => retrySummaryWrong("wrongOnly"));
    document.getElementById("flashcardWrongBtn")?.addEventListener("click", () => retrySummaryWrong("flashcard"));
    bindYizongSourceButtons();
    bindAiVerifyButtons();
    bindAiVerifyCopyToggles();
    bindVerifyToolButton();
    try {
      window.dispatchEvent(new CustomEvent("driverquiz:session-completed", {
        detail: {
          totalAnswered: Number(progress?.meta?.totalAnswered || 0),
          totalCorrect: Number(progress?.meta?.totalCorrect || 0),
          bestStreak: Number(progress?.meta?.bestStreak || 0),
          sessionQuestionCount: Number(session?.queue?.length || 0),
          completedAt: new Date().toISOString(),
        }
      }));
    } catch {}
  }

  function retrySummaryWrong(mode) {
    if (!session?.wrongIds?.length) {
      alert("本次沒有錯題。");
      return;
    }
    const questionMode = els.questionModeSelect?.value || "textChoice";
    const newQueue = shuffle(session.wrongIds.slice());
    const questionModeMap = {};
    newQueue.forEach((id) => {
      const q = getQuestion(id);
      questionModeMap[id] = deduceQuestionMode(q, questionMode === "mixed" ? (Math.random() < 0.5 ? "imageToText" : "textToImage") : questionMode);
    });
    session = {
      queue: newQueue,
      index: 0,
      answered: 0,
      correct: 0,
      wrongIds: [],
      masteryTarget: Number(els.masterySelect?.value || "2"),
      answeredMap: {},
      questionModeMap,
      createdAt: new Date().toISOString(),
      filters: {
        scope: getSelectedScope(),
        category: "all",
        practiceMode: mode,
        questionMode,
        requestedCount: newQueue.length,
        scoreFilterOperator: settings.scoreFilterOperator || "any",
        scoreFilterValue: settings.scoreFilterValue || 0,
        answerTimeLimitSec: sanitizeNonNegativeNumber(settings.answerTimeLimitSec, 15),
        autoNextCorrectDelaySec: sanitizeNonNegativeNumber(settings.autoNextCorrectDelaySec, 1),
        autoNextWrongDelaySec: sanitizeNonNegativeNumber(settings.autoNextWrongDelaySec, 4),
      },
      lastAnsweredQuestionId: "",
      currentStreak: 0,
      bestStreak: 0,
      flashRevealed: false,
      pointsDelta: 0,
    };
    saveSession();
    renderSessionOrEmpty();
  }


function renderWrongBook() {
  const scope = getSelectedScope();
  const wrongQuestions = getScopedQuestions(scope)
    .filter((q) => questionProgress(q.id).inWrongBook)
    .sort((a, b) => {
    const ap = questionProgress(a.id);
    const bp = questionProgress(b.id);
    return (bp.lastWrongAt || "").localeCompare(ap.lastWrongAt || "");
  });

  if (!wrongQuestions.length) {
    els.wrongBookList.className = "wrong-list empty-state";
    els.wrongBookList.textContent = "目前這個範圍沒有錯題。";
    return;
  }

  els.wrongBookList.className = "wrong-list";
  els.wrongBookList.innerHTML = wrongQuestions.map((q) => {
    const qp = questionProgress(q.id);
    return `
      <div class="wrong-item detail">
        ${q.image ? `<img class="wrong-thumb" src="${escapeAttr(q.image)}" alt="${escapeAttr(q.answer)}">` : `<div class="wrong-thumb wrong-thumb-text">文字題</div>`}
        <div class="wrong-item-main">
          <div class="wrong-item-title">${escapeHtml(buildQuestionPreview(q))}</div>
          <div class="wrong-item-meta">
            ${escapeHtml(CATEGORY_LABELS[q.category] || q.category)}
            ・答錯 ${qp.totalWrong} 次
            ・錯題移除進度 ${qp.masteryStreak || 0}/${Number(els.masterySelect?.value || "2")}
          </div>
          ${qp.lastWrongSelectedLabel ? `<div class="wrong-item-note">最近錯答：${escapeHtml(qp.lastWrongSelectedLabel)}</div>` : ""}
          <div class="wrong-item-note">正確答案：${escapeHtml(q.answer)}</div>
          ${buildOptionPreview(q) ? `<div class="wrong-item-note">選項：${escapeHtml(buildOptionPreview(q))}</div>` : ""}
          <div class="wrong-item-note">本題積分 <span class="wrong-item-score ${qp.score > 0 ? "score-badge-positive" : qp.score < 0 ? "score-badge-negative" : ""}">${formatSignedNumber(qp.score)}</span></div>
        </div>
        <div class="actions compact">
          <button class="small-btn" data-practice-id="${escapeAttr(q.id)}">練這題</button>
          <button class="small-btn" data-flash-id="${escapeAttr(q.id)}">單字卡</button>
        </div>
      </div>
    `;
  }).join("");

  Array.from(els.wrongBookList.querySelectorAll("[data-practice-id]")).forEach((btn) => {
    btn.addEventListener("click", () => startSingleQuestionSession(btn.dataset.practiceId, "wrongOnly"));
  });
  Array.from(els.wrongBookList.querySelectorAll("[data-flash-id]")).forEach((btn) => {
    btn.addEventListener("click", () => startSingleQuestionSession(btn.dataset.flashId, "flashcard"));
  });
}
  function startSingleQuestionSession(questionId, practiceMode) {
    const q = getQuestion(questionId);
    if (!q) return;
    const questionMode = els.questionModeSelect?.value || "textChoice";
    session = {
      queue: [questionId],
      index: 0,
      answered: 0,
      correct: 0,
      wrongIds: [],
      masteryTarget: Number(els.masterySelect?.value || "2"),
      answeredMap: {},
      questionModeMap: { [questionId]: deduceQuestionMode(q, questionMode === "mixed" ? "imageToText" : questionMode) },
      createdAt: new Date().toISOString(),
      filters: {
        scope: getSelectedScope(),
        category: "single",
        practiceMode,
        questionMode,
        requestedCount: 1,
        scoreFilterOperator: settings.scoreFilterOperator || "any",
        scoreFilterValue: settings.scoreFilterValue || 0,
        answerTimeLimitSec: sanitizeNonNegativeNumber(settings.answerTimeLimitSec, 15),
        autoNextCorrectDelaySec: sanitizeNonNegativeNumber(settings.autoNextCorrectDelaySec, 1),
        autoNextWrongDelaySec: sanitizeNonNegativeNumber(settings.autoNextWrongDelaySec, 4),
      },
      lastAnsweredQuestionId: "",
      currentStreak: 0,
      bestStreak: 0,
      flashRevealed: false,
      pointsDelta: 0,
    };
    saveSession();
    renderSessionOrEmpty();
  }

  function refreshStats() {
    const scope = getSelectedScope();
    const scopedQuestions = getScopedQuestions(scope);
    const entries = scopedQuestions.map((q) => questionProgress(q.id));
    const answered = entries.reduce((sum, x) => sum + (x.totalSeen || 0), 0);
    const correct = entries.reduce((sum, x) => sum + (x.totalCorrect || 0), 0);
    const wrongBookCount = entries.filter((x) => x.inWrongBook).length;
    const accuracy = answered ? Math.round((correct / answered) * 100) : 0;
    const positiveCount = entries.filter((x) => x.score >= 1).length;
    let positivePct = scopedQuestions.length ? Math.round((positiveCount / scopedQuestions.length) * 1000) / 10 : 0;
    if (positiveCount > 0 && positivePct === 0) positivePct = 0.1;
    const masteredCount = entries.filter((x) => x.score > 1).length;
    const totalPoints = entries.reduce((sum, x) => sum + (x.score || 0), 0);

    if (els.bankCount) els.bankCount.textContent = String(scopedQuestions.length);
    if (els.wrongBookCount) els.wrongBookCount.textContent = String(wrongBookCount);
    if (els.answeredCount) els.answeredCount.textContent = String(answered);
    if (els.accuracyCount) els.accuracyCount.textContent = answered ? `${accuracy}%` : "-";
    if (els.masteredCoverageCount) els.masteredCoverageCount.textContent = `${positivePct}%`;
    if (els.masteredCoverageDetail) els.masteredCoverageDetail.textContent = `正分 ${positiveCount} / ${scopedQuestions.length} 題；其中 >1 有 ${masteredCount} 題；本輪答對 ${session?.correct || 0} 題`;
    if (els.totalPointsCount) els.totalPointsCount.textContent = formatSignedNumber(totalPoints);
  }

  function refreshRewards() {
    const scope = getSelectedScope();
    const scopedQuestions = getScopedQuestions(scope);
    const entries = scopedQuestions.map((q) => questionProgress(q.id));
    const masteredCount = entries.filter((x) => x.score >= 1).length;
    const coveragePct = scopedQuestions.length ? (100 * masteredCount / scopedQuestions.length) : 0;
    const answered = entries.reduce((sum, x) => sum + x.totalSeen, 0);
    const bestStreak = progress.meta.bestStreak || 0;
    const level = getRewardLevel(coveragePct);
    const nextTargetPct = Math.min(level.nextPct, 100);
    const currentFloor = level.minPct;
    const progressToNext = nextTargetPct === currentFloor
      ? 100
      : Math.max(0, Math.min(100, ((coveragePct - currentFloor) / (nextTargetPct - currentFloor)) * 100));

    if (els.rewardLevelLabel) els.rewardLevelLabel.textContent = `目前等級：${level.label}`;
    if (els.rewardNextGoal) {
      els.rewardNextGoal.textContent = nextTargetPct >= 100
        ? `目前已到最高覆蓋級別。繼續維持模擬考穩定度與低分題清理。`
        : `距離下一級還需要把「正分覆蓋率（積分 ≥ 1）」推到 ${nextTargetPct.toFixed(0)}%。目前 ${coveragePct.toFixed(1)}%。`;
    }
    if (els.rewardProgressBar) els.rewardProgressBar.style.width = `${progressToNext}%`;
    if (els.rewardEncouragement) {
      els.rewardEncouragement.textContent = `${level.note} 目前此範圍累計作答 ${answered} 題，歷史最佳連續答對 ${bestStreak} 題。`;
    }
    if (els.badgeList) {
      const badges = buildBadges(coveragePct, answered, bestStreak);
      els.badgeList.innerHTML = badges.map((badge) => `
        <span class="badge-chip ${badge.locked ? "locked" : ""}">${escapeHtml(badge.label)}</span>
      `).join("");
    }
  }

  function getRewardLevel(coveragePct) {
    let current = REWARD_LEVELS[0];
    for (const level of REWARD_LEVELS) {
      if (coveragePct >= level.minPct) current = level;
    }
    return current;
  }

  function buildBadges(coveragePct, answered, bestStreak) {
    return [
      { label: coveragePct >= 10 ? "覆蓋率 10%" : "覆蓋率 10%（未解鎖）", locked: coveragePct < 10 },
      { label: coveragePct >= 30 ? "覆蓋率 30%" : "覆蓋率 30%（未解鎖）", locked: coveragePct < 30 },
      { label: coveragePct >= 60 ? "覆蓋率 60%" : "覆蓋率 60%（未解鎖）", locked: coveragePct < 60 },
      { label: coveragePct >= 85 ? "覆蓋率 85%" : "覆蓋率 85%（未解鎖）", locked: coveragePct < 85 },
      { label: answered >= 100 ? "累計作答 100 題" : "累計作答 100 題（未解鎖）", locked: answered < 100 },
      { label: answered >= 500 ? "累計作答 500 題" : "累計作答 500 題（未解鎖）", locked: answered < 500 },
      { label: bestStreak >= 10 ? "連續答對 10 題" : "連續答對 10 題（未解鎖）", locked: bestStreak < 10 },
      { label: bestStreak >= 30 ? "連續答對 30 題" : "連續答對 30 題（未解鎖）", locked: bestStreak < 30 },
    ];
  }

  function exportWrongBook() {
    const scope = getSelectedScope();
    const payload = getScopedQuestions(scope)
      .filter((q) => questionProgress(q.id).inWrongBook)
      .map((q) => ({
        id: q.id,
        answer: q.answer,
        prompt: q.prompt,
        options: q.options,
        category: q.category,
        image: q.image,
        stats: { ...questionProgress(q.id) },
        source: q.source,
        origin: buildQuestionOriginLabel(q),
      }));

    const envelope = {
      app: APP_ID,
      type: "wrong-book-export",
      version: 2,
      exportedAt: new Date().toISOString(),
      scope,
      items: payload,
    };

    const blob = new Blob([JSON.stringify(envelope, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `wrong-book-${scope}-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function buildPrintableWrongPayload() {
    // v0.1.4: this export is now the whole wrong book, not only the current session.
    return ALL_QUESTIONS
      .filter((question) => question && questionProgress(question.id).inWrongBook)
      .map((question) => {
        const qp = questionProgress(question.id);
        return {
          id: question.id,
          prompt: buildQuestionPreview(question),
          myChoice: qp.lastWrongSelectedLabel || "",
          correctAnswer: question.answer,
          origin: buildQuestionOriginLabel(question),
          image: question.image || "",
          stats: { ...qp },
          source: question.source || "",
        };
      });
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ""));
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async function enrichPrintableWrongPayloadWithImages(payload) {
    const enriched = [];
    for (const item of payload) {
      let imageDataUrl = item.image || "";
      if (imageDataUrl && !/^data:/i.test(imageDataUrl)) {
        try {
          const resp = await fetch(imageDataUrl);
          if (resp.ok) {
            const blob = await resp.blob();
            imageDataUrl = await blobToDataUrl(blob);
          }
        } catch (err) {
          console.warn("embed image failed", item.id, err);
        }
      }
      enriched.push({ ...item, image: imageDataUrl || "" });
    }
    return enriched;
  }

  function buildPrintableWrongHtml(payload) {
    const envelope = {
      app: APP_ID,
      type: "wrong-print-export",
      version: 2,
      exportedAt: new Date().toISOString(),
      items: payload,
    };
    const dataJson = JSON.stringify(envelope, null, 2);
    const rows = payload.map((item, idx) => `
      <article class="wrong-card">
        <h2>${idx + 1}. ${escapeHtml(item.prompt)}</h2>
        ${item.image ? `<div class="wrong-print-image"><img src="${escapeAttr(item.image)}" alt="${escapeAttr(item.correctAnswer || "題圖")}"></div>` : ""}
        ${item.myChoice ? `<div><strong>最近錯答：</strong>${escapeHtml(item.myChoice)}</div>` : ""}
        <div><strong>正確答案：</strong>${escapeHtml(item.correctAnswer || "")}</div>
        <div><strong>題目出處：</strong>${escapeHtml(item.origin || "")}</div>
      </article>
    `).join("");
    return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>錯題列印版</title><style>
      body{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;padding:24px;color:#111827;line-height:1.7;background:#fff}
      h1{margin:0 0 8px} .meta{color:#475569;margin-bottom:24px} .wrong-card{border:1px solid #cbd5e1;border-radius:14px;padding:16px;margin:0 0 14px;break-inside:avoid}
      h2{margin:0 0 10px;font-size:1.05rem} .choice-not-saved{color:#64748b} .wrong-print-image{margin:0 0 12px} .wrong-print-image img{max-width:100%;max-height:240px;border:1px solid #cbd5e1;border-radius:10px;display:block;background:#fff}
      @media print{body{padding:0.8cm} .wrong-card{page-break-inside:avoid}}
    </style></head><body><h1>錯題列印版</h1><p class="meta">匯出日期：${escapeHtml(new Date().toLocaleString())}｜共 ${payload.length} 題<br>說明：若為舊版錯題或匯入檔未包含最近錯答選項，列印版會省略「最近錯答」欄位，只保留正確答案與錯題統計。</p>${rows}<script id="wrongExportData" type="application/json">${dataJson.replace(/</g, "\u003c")}</script></body></html>`;
  }

  async function exportWrongBookPrintable() {
    const payload = buildPrintableWrongPayload();
    if (!payload.length) {
      alert("目前錯題本是空的，沒有可下載的錯題。請先作答並累積錯題後再下載。");
      return;
    }
    const enrichedPayload = await enrichPrintableWrongPayloadWithImages(payload);
    const html = buildPrintableWrongHtml(enrichedPayload);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wrong-book-print-${new Date().toISOString().slice(0,10)}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function formatBytesMiB(bytes) {
    const safe = Number(bytes || 0);
    return `${(safe / (1024 * 1024)).toFixed(2)} MiB`;
  }

  function containsDangerousJsonKeys(value, depth = 0) {
    if (depth > 64) return true;
    if (!value || typeof value !== "object") return false;
    if (Array.isArray(value)) return value.some((item) => containsDangerousJsonKeys(item, depth + 1));
    for (const key of Object.keys(value)) {
      if (DANGEROUS_JSON_KEYS.has(key)) return true;
      if (containsDangerousJsonKeys(value[key], depth + 1)) return true;
    }
    return false;
  }

  function validateImportFileSize(file) {
    const size = Number(file?.size || 0);
    if (!Number.isFinite(size) || size <= 0) throw new Error("empty");
    if (size > HARD_IMPORT_MAX_BYTES) {
      throw new Error(`檔案過大：目前匯入上限為 ${formatBytesMiB(HARD_IMPORT_MAX_BYTES)}。請先精簡檔案或改用本機備份整理。`);
    }
    const lowerName = String(file?.name || "").toLowerCase();
    if ((lowerName.endsWith('.html') || lowerName.endsWith('.htm')) && size > WRONG_HTML_IMPORT_MAX_BYTES) {
      throw new Error(`錯題列印版 HTML 過大：目前建議上限為 ${formatBytesMiB(WRONG_HTML_IMPORT_MAX_BYTES)}。`);
    }
    if (!(lowerName.endsWith('.html') || lowerName.endsWith('.htm')) && size > FULL_MEMORY_IMPORT_MAX_BYTES) {
      throw new Error(`JSON 檔案過大：目前匯入上限為 ${formatBytesMiB(FULL_MEMORY_IMPORT_MAX_BYTES)}。`);
    }
  }

  function savePreImportSnapshot() {
    try {
      const payload = buildFullMemoryPayload();
      localStorage.setItem(PRE_IMPORT_SNAPSHOT_KEY, JSON.stringify({ savedAt: new Date().toISOString(), payload }));
      return true;
    } catch (error) {
      console.warn("savePreImportSnapshot failed", error);
      return false;
    }
  }

  function restorePreImportSnapshot() {
    const raw = localStorage.getItem(PRE_IMPORT_SNAPSHOT_KEY);
    if (!raw) throw new Error("目前沒有可還原的匯入前備份。");
    const parsed = JSON.parse(raw);
    if (!parsed?.payload) throw new Error("匯入前備份內容無效。");
    return applyFullMemoryPayload(parsed.payload, "replace");
  }

  function pickPlainObject(value) {
    return value && typeof value === "object" && !Array.isArray(value) ? value : {};
  }

  function sanitizeImageIssueEntry(raw) {
    const item = pickPlainObject(raw);
    const note = typeof item.note === "string" ? item.note.slice(0, 500) : "";
    const flag = !!item.flag;
    if (!flag && !note) return null;
    return { flag, note };
  }

  function extractFullMemoryEnvelope(rawPayload) {
    const root = pickPlainObject(rawPayload);
    const nestedMemory = pickPlainObject(root.memory);
    const nestedData = pickPlainObject(root.data);
    const candidate = (nestedMemory.progress || nestedMemory.settings || nestedMemory.session || nestedMemory.imageIssues)
      ? nestedMemory
      : ((nestedData.progress || nestedData.settings || nestedData.session || nestedData.imageIssues) ? nestedData : root);
    return {
      app: typeof root.app === "string" ? root.app : "",
      type: typeof root.type === "string" ? root.type : "",
      version: Number(root.version || candidate.version || MEMORY_EXPORT_VERSION) || MEMORY_EXPORT_VERSION,
      exportedAt: typeof root.exportedAt === "string" ? root.exportedAt : (typeof candidate.exportedAt === "string" ? candidate.exportedAt : ""),
      progress: candidate.progress || (candidate.byQuestion || candidate.meta ? candidate : {}),
      settings: candidate.settings || {},
      session: candidate.session || {},
      imageIssues: candidate.imageIssues || {},
    };
  }

  function buildFullMemoryImportPreview(envelope, file) {
    const importedProgress = repairProgressSnapshot(envelope.progress || {});
    const byQuestion = importedProgress.byQuestion || {};
    const touchedCount = Object.keys(byQuestion).length;
    const wrongCount = Object.values(byQuestion).filter((item) => !!item?.inWrongBook).length;
    const answeredCount = Number(importedProgress.meta?.totalAnswered || 0);
    return {
      touchedCount,
      wrongCount,
      answeredCount,
      text: `檔案預覽

檔名：${file?.name || "(未命名)"}
大小：${formatBytesMiB(file?.size || 0)}
題目紀錄：${touchedCount} 題
累計作答：${answeredCount} 次
錯題本：${wrongCount} 題

確認後才會真正套用。套用前會先自動保存一份匯入前本機備份。`,
    };
  }

  function buildFullMemoryPayload() {
    return {
      app: APP_ID,
      type: "full-memory-export",
      version: MEMORY_EXPORT_VERSION,
      exportedAt: new Date().toISOString(),
      storageKeys: {
        progress: STORAGE_KEY,
        session: SESSION_KEY,
        settings: SETTINGS_KEY,
        imageIssues: IMAGE_ISSUES_KEY,
      },
      progress,
      session,
      settings,
      imageIssues,
    };
  }

  function exportFullMemory() {
    const payload = buildFullMemoryPayload();
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `med-exam-memory-${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function computeProgressMetaFromByQuestion(byQuestion, fallbackMeta = {}) {
    const meta = {
      totalAnswered: 0,
      totalCorrect: 0,
      bestStreak: Number(fallbackMeta?.bestStreak || 0),
      totalCompletedSessions: Number(fallbackMeta?.totalCompletedSessions || 0),
    };
    for (const item of Object.values(byQuestion || {})) {
      meta.totalAnswered += Number(item?.totalSeen || 0);
      meta.totalCorrect += Number(item?.totalCorrect || 0);
    }
    return meta;
  }

  function repairQuestionProgressRecord(raw) {
    const safeRaw = pickPlainObject(raw);
    const item = { ...defaultQuestionProgress(), ...safeRaw };
    const totalSeen = Math.max(0, Math.round(Number(item.totalSeen || 0)));
    const totalCorrect = Math.max(0, Math.round(Number(item.totalCorrect || 0)));
    const totalWrong = Math.max(0, Math.round(Number(item.totalWrong || 0)));
    const computedScore = totalCorrect - totalWrong;
    const rawScore = Number(item.score);
    const score = Number.isFinite(rawScore) ? Math.max(-999, Math.min(999, Math.round(rawScore))) : computedScore;
    const hasExplicitWrongBook = Object.prototype.hasOwnProperty.call(safeRaw, "inWrongBook");
    const inferredWrongBook = score < 0 || totalWrong > totalCorrect;
    const lastResult = ["correct", "wrong", "known", "unknown", ""].includes(String(item.lastResult || "")) ? String(item.lastResult || "") : "";
    return {
      totalSeen,
      totalCorrect,
      totalWrong,
      score,
      inWrongBook: hasExplicitWrongBook ? !!item.inWrongBook : inferredWrongBook,
      masteryStreak: Math.max(0, Math.round(Number(item.masteryStreak || 0))),
      lastWrongAt: typeof item.lastWrongAt === "string" ? item.lastWrongAt : "",
      lastSeenAt: typeof item.lastSeenAt === "string" ? item.lastSeenAt : "",
      lastResult,
      lastSelectedValue: typeof item.lastSelectedValue === "string" ? item.lastSelectedValue : "",
      lastSelectedLabel: typeof item.lastSelectedLabel === "string" ? item.lastSelectedLabel : "",
      lastWrongSelectedValue: typeof item.lastWrongSelectedValue === "string" ? item.lastWrongSelectedValue : "",
      lastWrongSelectedLabel: typeof item.lastWrongSelectedLabel === "string" ? item.lastWrongSelectedLabel : "",
    };
  }

  function repairProgressSnapshot(data) {
    const base = defaultProgress();
    const sourceByQuestion = data?.byQuestion && typeof data.byQuestion === "object" ? data.byQuestion : {};
    for (const [id, raw] of Object.entries(sourceByQuestion)) {
      base.byQuestion[id] = repairQuestionProgressRecord(raw);
    }
    const sourceMeta = data?.meta && typeof data.meta === "object" ? data.meta : {};
    base.meta = computeProgressMetaFromByQuestion(base.byQuestion, sourceMeta);
    return base;
  }

  function normalizeImportedWrongBookScores(targetProgress) {
    const snapshot = repairProgressSnapshot(targetProgress || {});
    for (const item of Object.values(snapshot.byQuestion || {})) {
      if (!item?.inWrongBook) continue;
      item.totalWrong = Math.max(1, Number(item.totalWrong || 0));
      item.totalSeen = Math.max(item.totalSeen || 0, item.totalWrong || 0, 1);
      item.masteryStreak = 0;
      if (!Number.isFinite(Number(item.score)) || Number(item.score) >= 0) {
        item.score = -1;
      }
      if (!item.lastWrongAt) item.lastWrongAt = item.lastSeenAt || new Date().toISOString();
    }
    snapshot.meta = computeProgressMetaFromByQuestion(snapshot.byQuestion, snapshot.meta);
    return snapshot;
  }

  function compareCoveragePriority(a, b) {
    const aSeen = Number(a?.totalSeen || 0);
    const bSeen = Number(b?.totalSeen || 0);
    if (aSeen !== bSeen) return aSeen - bSeen;
    const aScore = Number(a?.score || 0);
    const bScore = Number(b?.score || 0);
    if (aScore !== bScore) return aScore - bScore;
    const aCorrect = Number(a?.totalCorrect || 0);
    const bCorrect = Number(b?.totalCorrect || 0);
    if (aCorrect !== bCorrect) return aCorrect - bCorrect;
    const aSeenAt = typeof a?.lastSeenAt === "string" ? a.lastSeenAt : "";
    const bSeenAt = typeof b?.lastSeenAt === "string" ? b.lastSeenAt : "";
    if (aSeenAt !== bSeenAt) return aSeenAt.localeCompare(bSeenAt);
    return 0;
  }

  function compareConservativePriority(a, b) {
    const aScore = Number(a?.score || 0);
    const bScore = Number(b?.score || 0);
    if (aScore !== bScore) return bScore - aScore;
    const aWrongBook = !!a?.inWrongBook;
    const bWrongBook = !!b?.inWrongBook;
    if (aWrongBook !== bWrongBook) return aWrongBook ? -1 : 1;
    const aWrong = Number(a?.totalWrong || 0);
    const bWrong = Number(b?.totalWrong || 0);
    if (aWrong !== bWrong) return bWrong - aWrong;
    const aStreak = Number(a?.masteryStreak || 0);
    const bStreak = Number(b?.masteryStreak || 0);
    if (aStreak !== bStreak) return aStreak - bStreak;
    const aWrongAt = typeof a?.lastWrongAt === "string" ? a.lastWrongAt : "";
    const bWrongAt = typeof b?.lastWrongAt === "string" ? b.lastWrongAt : "";
    if (aWrongAt !== bWrongAt) return bWrongAt.localeCompare(aWrongAt);
    const aSeenAt = typeof a?.lastSeenAt === "string" ? a.lastSeenAt : "";
    const bSeenAt = typeof b?.lastSeenAt === "string" ? b.lastSeenAt : "";
    if (aSeenAt !== bSeenAt) return bSeenAt.localeCompare(aSeenAt);
    return 0;
  }

  function chooseMergedQuestionRecord(localRecord, incomingRecord, mode = "conservative") {
    const local = repairQuestionProgressRecord(localRecord);
    const incoming = repairQuestionProgressRecord(incomingRecord);
    if (JSON.stringify(local) === JSON.stringify(incoming)) return local;
    if (mode === "coverage") {
      return compareCoveragePriority(local, incoming) >= 0 ? local : incoming;
    }
    return compareConservativePriority(local, incoming) <= 0 ? local : incoming;
  }

  function flattenScoreDistribution() {
    const current = Object.values(progress?.byQuestion || {});
    const changedCount = current.reduce((sum, item) => sum + ((Number(item?.score || 0) > 1 || Number(item?.score || 0) < -1) ? 1 : 0), 0);
    if (!changedCount) {
      alert(`目前沒有需要平坦化的題目。

只有積分大於 1 或小於 -1 的題目會被調整。
此操作不會改變作答次數，只會把積分壓回 -1、0、1 區間。`);
      return;
    }
    if (!window.confirm(`將平坦化 ${changedCount} 題的積分：
- 大於 1 的題目改為 1
- 小於 -1 的題目改為 -1

此操作不會改變作答次數，但會改變本題積分。

確定要繼續嗎？`)) return;
    if (!window.confirm(`最後確認：這會把高積分與低積分題壓回 ±1，常用於修整舊檔或避免累積分數過度膨脹。

按「確定」才會執行。`)) return;
    for (const item of Object.values(progress?.byQuestion || {})) {
      const score = Number(item?.score || 0);
      if (score > 1) item.score = 1;
      else if (score < -1) item.score = -1;
    }
    progress.meta = computeProgressMetaFromByQuestion(progress.byQuestion, progress.meta);
    saveProgress();
    refreshStats();
    refreshRewards();
    renderWrongBook();
    renderSessionOrEmpty();
    alert(`已完成平坦化，共調整 ${changedCount} 題。

說明：
- 大於 1 的積分已改為 1
- 小於 -1 的積分已改為 -1
- 0、1、-1 不變

建議之後重新匯出一份完整記憶 JSON 作為新備份。`);
  }

  function askFullMemoryImportMode(contextLabel = "匯入完整記憶") {
    const answer = window.prompt(`${contextLabel}：請輸入模式代號

1 = 覆蓋本機
2 = 覆蓋率優先合併（放水取高）
3 = 保守合併（低分優先）

說明：
- 覆蓋：用匯入資料完整取代本機
- 覆蓋率優先：盡量保留較高覆蓋率 / 較高分，適合快速刷題
- 保守合併：優先保留較低分、較需要複習的一側

取消 = 不匯入`, "1");
    if (answer === null) return null;
    const normalized = String(answer).trim();
    if (normalized === "1") return "replace";
    if (normalized === "2") return "coverage";
    if (normalized === "3") return "conservative";
    alert(`未輸入有效代號，已取消匯入。
請輸入 1、2 或 3。`);
    return null;
  }

  function applyFullMemoryPayload(rawPayload, importModeOrReplaceAll = true) {
    const envelope = extractFullMemoryEnvelope(rawPayload || {});
    const importedProgress = normalizeImportedWrongBookScores(envelope.progress || {});
    const importedSettings = sanitizeImportedSettings(envelope.settings || {}, settings);
    const importedImageIssues = sanitizeImportedImageIssues(envelope.imageIssues || {});

    let importMode = importModeOrReplaceAll;
    if (typeof importModeOrReplaceAll === "boolean") importMode = importModeOrReplaceAll ? "replace" : "conservative";
    if (!["replace", "coverage", "conservative"].includes(String(importMode || ""))) importMode = "replace";

    if (importMode === "replace") {
      progress = importedProgress;
      settings = importedSettings;
      imageIssues = importedImageIssues;
    } else {
      progress = mergeProgress(progress, importedProgress, String(importMode));
      settings = { ...settings, ...importedSettings };
      imageIssues = mergeImageIssues(imageIssues, importedImageIssues);
    }

    progress = repairProgressSnapshot(progress);
    session = null;
    importedWrongs = [];
    saveProgress();
    saveSettings();
    saveImageIssues();
    saveImportedWrongs();
    try { localStorage.removeItem(SESSION_KEY); } catch {}

    let renderWarning = "";
    try {
      syncControlsFromSettings();
      refreshCategoryOptions();
      refreshStats();
      refreshRewards();
      renderWrongBook();
      renderSessionOrEmpty();
    } catch (renderErr) {
      console.warn("post-import render warning", renderErr);
      renderWarning = "\n\n資料已匯入，但畫面更新時出現警告；重新整理頁面即可。";
    }

    const modeLabel = importMode === "coverage" ? "覆蓋率優先合併（放水取高）" : importMode === "conservative" ? "保守合併（低分優先）" : "覆蓋匯入";

    return {
      ok: true,
      replaceAll: importMode === "replace",
      mode: importMode,
      warning: renderWarning,
      message: `${modeLabel} 已完成。

說明：本次匯入不再直接相加統計，已改用較安全的整筆挑選方式，避免同源資料互相合併後數值異常膨脹。若是舊 JSON 檔，系統也已自動重算總統計。` + renderWarning,
    };
  }

  function normalizeTextForMatching(value) {
    return String(value || "")
      .replace(/\s+/g, "")
      .replace(/[＿_]+/g, "＿＿＿＿")
      .trim();
  }

  function findQuestionForImportedWrongItem(item) {
    const rawId = String(item?.id || item?.questionId || "").trim();
    if (rawId && getQuestion(rawId)) return getQuestion(rawId);

    const rawPrompt = normalizeTextForMatching(item?.prompt || item?.question || item?.stem || "");
    const rawAnswer = String(item?.correctAnswer || item?.answer || "").trim();
    if (!rawPrompt && !rawAnswer) return null;

    let promptOnlyCandidate = null;
    for (const q of ALL_QUESTIONS) {
      const promptA = normalizeTextForMatching(buildQuestionPreview(q));
      const promptB = normalizeTextForMatching(q?.prompt || "");
      const promptMatches = rawPrompt && (rawPrompt === promptA || rawPrompt === promptB || promptA.includes(rawPrompt) || rawPrompt.includes(promptA));
      const answerMatches = !rawAnswer || String(q?.answer || "").trim() === rawAnswer;
      if (promptMatches && answerMatches) return q;
      if (promptMatches && !promptOnlyCandidate) promptOnlyCandidate = q;
    }
    return promptOnlyCandidate;
  }

  function normalizeImportedWrongItem(item) {
    const q = findQuestionForImportedWrongItem(item) || null;
    const stats = item?.stats && typeof item.stats === "object" ? item.stats : (item?.progress && typeof item.progress === "object" ? item.progress : null);
    const normalizedStats = stats ? {
      totalSeen: Number(stats.totalSeen || stats.seen || 0),
      totalCorrect: Number(stats.totalCorrect || stats.correct || 0),
      totalWrong: Number(stats.totalWrong || stats.wrong || 0),
      score: Number(stats.score || 0),
      inWrongBook: stats.inWrongBook !== undefined ? !!stats.inWrongBook : true,
      masteryStreak: Number(stats.masteryStreak || 0),
      lastWrongAt: typeof stats.lastWrongAt === "string" ? stats.lastWrongAt : "",
      lastSeenAt: typeof stats.lastSeenAt === "string" ? stats.lastSeenAt : "",
      lastResult: typeof stats.lastResult === "string" ? stats.lastResult : "",
      lastSelectedValue: typeof stats.lastSelectedValue === "string" ? stats.lastSelectedValue : "",
      lastSelectedLabel: typeof stats.lastSelectedLabel === "string" ? stats.lastSelectedLabel : "",
      lastWrongSelectedValue: typeof stats.lastWrongSelectedValue === "string" ? stats.lastWrongSelectedValue : "",
      lastWrongSelectedLabel: typeof stats.lastWrongSelectedLabel === "string" ? stats.lastWrongSelectedLabel : "",
    } : null;
    return {
      id: String(q?.id || item?.id || item?.questionId || "").trim(),
      prompt: String(item?.prompt || buildQuestionPreview(q) || "").trim(),
      myChoice: String(item?.myChoice || item?.lastWrongSelectedLabel || item?.selectedLabel || "").trim(),
      correctAnswer: String(item?.correctAnswer || item?.answer || (q?.answer || "")).trim(),
      origin: String(item?.origin || buildQuestionOriginLabel(q) || "").trim(),
      image: String(q?.image || (typeof item?.image === "string" && /^data:/i.test(item.image) ? "" : (item?.image || ""))).trim(),
      stats: normalizedStats,
    };
  }

  function buildProgressFromWrongImportItem(item) {
    const base = defaultQuestionProgress();
    const nowIso = new Date().toISOString();
    if (item.stats) {
      const totalSeen = Math.max(1, Number(item.stats.totalSeen || 0));
      const totalCorrect = Math.max(0, Number(item.stats.totalCorrect || 0));
      const totalWrong = Math.max(1, Number(item.stats.totalWrong || 0));
      const rawScore = Number(item.stats.score);
      const score = Number.isFinite(rawScore) ? Math.min(Math.round(rawScore), -1) : -1;
      return {
        totalSeen,
        totalCorrect,
        totalWrong,
        score,
        inWrongBook: true,
        masteryStreak: 0,
        lastWrongAt: item.stats.lastWrongAt || nowIso,
        lastSeenAt: item.stats.lastSeenAt || nowIso,
        lastResult: item.stats.lastResult || "wrong",
        lastSelectedValue: item.stats.lastSelectedValue || item.stats.lastWrongSelectedValue || "",
        lastSelectedLabel: item.stats.lastSelectedLabel || item.stats.lastWrongSelectedLabel || "",
        lastWrongSelectedValue: item.stats.lastWrongSelectedValue || item.stats.lastSelectedValue || "",
        lastWrongSelectedLabel: item.stats.lastWrongSelectedLabel || item.stats.lastSelectedLabel || item.myChoice || "",
      };
    }
    return {
      ...base,
      totalSeen: 1,
      totalWrong: 1,
      score: -1,
      inWrongBook: true,
      masteryStreak: 0,
      lastWrongAt: nowIso,
      lastSeenAt: nowIso,
      lastResult: "wrong",
      lastSelectedValue: "",
      lastSelectedLabel: item.myChoice || "",
      lastWrongSelectedValue: "",
      lastWrongSelectedLabel: item.myChoice || "",
    };
  }

  function recalcProgressMetaFromQuestions(targetProgress) {
    let totalAnswered = 0;
    let totalCorrect = 0;
    for (const item of Object.values(targetProgress?.byQuestion || {})) {
      totalAnswered += Number(item?.totalSeen || 0);
      totalCorrect += Number(item?.totalCorrect || 0);
    }
    targetProgress.meta = {
      totalAnswered,
      totalCorrect,
      bestStreak: Number(targetProgress?.meta?.bestStreak || 0),
      totalCompletedSessions: Number(targetProgress?.meta?.totalCompletedSessions || 0),
    };
    return targetProgress;
  }

  function applyImportedWrongsToProgress(items, replaceSameQuestion = false) {
    const base = sanitizeImportedProgress(progress);
    for (const raw of items) {
      const item = normalizeImportedWrongItem(raw);
      if (!item.id) continue;
      const incoming = buildProgressFromWrongImportItem(item);
      if (replaceSameQuestion || !base.byQuestion[item.id]) {
        base.byQuestion[item.id] = incoming;
      } else {
        const cur = repairQuestionProgressRecord(base.byQuestion[item.id] || defaultQuestionProgress());
        base.byQuestion[item.id] = {
          totalSeen: Math.max(Number(cur.totalSeen || 0), Number(incoming.totalSeen || 0), 1),
          totalCorrect: Math.max(Number(cur.totalCorrect || 0), Number(incoming.totalCorrect || 0), 0),
          totalWrong: Math.max(Number(cur.totalWrong || 0), Number(incoming.totalWrong || 0), 1),
          score: Math.min(Number(cur.score || 0), Number(incoming.score || -1), -1),
          inWrongBook: true,
          masteryStreak: 0,
          lastWrongAt: maxIsoString(cur.lastWrongAt, incoming.lastWrongAt) || new Date().toISOString(),
          lastSeenAt: maxIsoString(cur.lastSeenAt, incoming.lastSeenAt),
          lastResult: incoming.lastResult || cur.lastResult || "wrong",
          lastSelectedValue: incoming.lastSelectedValue || cur.lastSelectedValue || "",
          lastSelectedLabel: incoming.lastSelectedLabel || cur.lastSelectedLabel || "",
          lastWrongSelectedValue: incoming.lastWrongSelectedValue || cur.lastWrongSelectedValue || "",
          lastWrongSelectedLabel: incoming.lastWrongSelectedLabel || cur.lastWrongSelectedLabel || "",
        };
      }
    }
    return recalcProgressMetaFromQuestions(base);
  }

  async function handleImportLearningFile(event) {
    const file = event?.target?.files?.[0];
    if (!file) return;
    try {
      validateImportFileSize(file);
      const textRaw = await file.text();
      const trimmed = textRaw.replace(/^﻿/, "").trim();
      if (!trimmed) throw new Error("empty");

      let parsed = null;
      let kind = "";

      if (/^<!doctype html/i.test(trimmed) || /<html[\s>]/i.test(trimmed)) {
        const match = trimmed.match(/<script id=["']wrongExportData["'] type=["']application\/json["']>([\s\S]*?)<\/script>/i);
        if (match) {
          parsed = JSON.parse(match[1]);
          kind = "wrong-print";
        }
      }

      if (!parsed) parsed = JSON.parse(trimmed);
      if (containsDangerousJsonKeys(parsed)) throw new Error("dangerous-json-keys");

      if (!kind) {
        if (parsed && (parsed.app === APP_ID || parsed.app === "driver-quiz-pwa") && parsed.type === "full-memory-export") kind = "full-memory";
        else if (parsed && (parsed.app === APP_ID || parsed.app === "driver-quiz-pwa") && parsed.type === "wrong-book-export") kind = "wrong-book";
        else if (parsed && (parsed.app === APP_ID || parsed.app === "driver-quiz-pwa") && parsed.type === "wrong-print-export") kind = "wrong-print";
        else if (parsed && Array.isArray(parsed.items) && String(parsed.type || "").toLowerCase().includes("wrong")) kind = "wrong-book";
        else if (parsed && Array.isArray(parsed.items) && parsed.items.some((item) => item && (item.id || item.prompt || item.correctAnswer || item.answer))) kind = "wrong-book";
        else if (parsed && (parsed.progress || parsed.settings || parsed.session || parsed.imageIssues || parsed.memory || parsed.data || parsed.byQuestion || parsed.meta)) kind = "full-memory";
        else if (Array.isArray(parsed)) kind = "wrong-array";
      }

      if (kind === "full-memory") {
        const envelope = extractFullMemoryEnvelope(parsed);
        const preview = buildFullMemoryImportPreview(envelope, file);
        if (!window.confirm(preview.text)) return;
        const importMode = askFullMemoryImportMode("匯入完整記憶");
        if (!importMode) return;
        savePreImportSnapshot();
        const result = applyFullMemoryPayload(envelope, importMode);
        alert(`${result.message}\n\n模式說明：\n- 覆蓋：完整取代本機\n- 覆蓋率優先合併：放水取高，適合快速刷題\n- 保守合併：低分優先，適合避免弱點被沖淡\n\n本次套用前已自動保存一份匯入前本機備份。`);
      } else if (kind === "wrong-book" || kind === "wrong-array" || kind === "wrong-print") {
        const items = Array.isArray(parsed) ? parsed : Array.isArray(parsed.items) ? parsed.items : [];
        const normalizedItems = items
          .map((item) => normalizeImportedWrongItem(item))
          .filter((item) => item.prompt && item.id && getQuestion(item.id));
        if (!normalizedItems.length) throw new Error("empty wrongs: 匯入檔中沒有能對應到目前題庫的錯題。請確認這份 JSON 是由本系統目前題庫匯出的錯題 JSON / 錯題列印 HTML，或先更新到同一版題庫後再匯入。");

        const previewText = `檔案預覽

檔名：${file?.name || "(未命名)"}
大小：${formatBytesMiB(file?.size || 0)}
可辨識錯題：${normalizedItems.length} 題

確認後才會真正套用。套用前會先自動保存一份匯入前本機備份。`;
        if (!window.confirm(previewText)) return;
        const replaceSameQuestion = window.confirm(`按「確定」= 覆蓋同題既有積分/錯題狀態；按「取消」= 與目前記憶安全合併（不再累加、至少保留為錯題且積分 <= -1）。

注意：若匯入檔本身沒有附題目積分，系統會把這些題至少記成錯 1 次、積分 -1。`);
        savePreImportSnapshot();
        progress = applyImportedWrongsToProgress(normalizedItems, replaceSameQuestion);
        session = null;
        importedWrongs = [];
        saveProgress();
        saveImportedWrongs();
        try { localStorage.removeItem(SESSION_KEY); } catch {}
        syncControlsFromSettings();
        refreshCategoryOptions();
        refreshStats();
        refreshRewards();
        renderWrongBook();
        renderSessionOrEmpty();
        const negativeCount = normalizedItems.filter((item) => (questionProgress(item.id).score || 0) < 0).length;
        alert(`已匯入 ${normalizedItems.length} 題錯題檔，並${replaceSameQuestion ? "覆蓋" : "安全合併"}到目前學習記憶。

其中目前積分小於 0 的題數：${negativeCount} 題。

說明：錯題匯入現在不再累加分數；若同題已存在，系統至少會保留為錯題且積分 <= -1。

本次套用前已自動保存一份匯入前本機備份。`);
      } else {
        throw new Error("unknown format");
      }
    } catch (error) {
      console.error(error);
      const msg = String(error?.message || error || "");
      if (msg === "dangerous-json-keys") {
        alert("匯入失敗：檔案包含危險欄位（例如 __proto__ / prototype / constructor），系統已拒絕套用。\n\n請確認這是由本系統匯出的正常 JSON。");
      } else if (msg.includes("檔案過大") || msg.includes("HTML 過大") || msg.includes("JSON 檔案過大") || msg.includes("empty wrongs")) {
        alert(`匯入失敗：${msg}`);
      } else {
        alert("匯入失敗：請選擇本系統匯出的本機完整記憶備份 JSON、錯題本 JSON，或錯題本列印版 HTML。\n\n建議：若是錯題本 JSON 或列印版 HTML，請使用本頁『匯出錯題本 JSON』或『下載錯題本列印版』產生的檔案。若仍失敗，請保留該檔並回報。");
      }
    } finally {
      if (els.importMemoryInput) els.importMemoryInput.value = "";
    }
  }

  function loadImportedWrongs() {
    try {
      const raw = JSON.parse(localStorage.getItem(IMPORTED_WRONGS_KEY) || "[]");
      return Array.isArray(raw) ? raw.map((item) => normalizeImportedWrongItem(item)).filter((item) => item.prompt) : [];
    } catch {
      return [];
    }
  }

  function compactImportedWrongItem(item) {
    const normalized = normalizeImportedWrongItem(item);
    return {
      id: normalized.id,
      prompt: normalized.prompt,
      myChoice: normalized.myChoice,
      correctAnswer: normalized.correctAnswer,
      origin: normalized.origin,
      image: normalized.image,
      stats: normalized.stats ? { ...normalized.stats } : null,
    };
  }

  function saveImportedWrongs() {
    try {
      const compact = (importedWrongs || []).map((item) => compactImportedWrongItem(item));
      localStorage.setItem(IMPORTED_WRONGS_KEY, JSON.stringify(compact));
    } catch (error) {
      console.warn("saveImportedWrongs failed", error);
      try { localStorage.removeItem(IMPORTED_WRONGS_KEY); } catch {}
    }
  }

  function renderImportedWrongs() {
    if (!importedWrongs?.length) return;
    clearAllTimers();
    setQuizChromeMode("summary");
    els.mainContent.className = "panel quiz-panel";
    els.mainContent.innerHTML = `
      <div class="print-import-card">
        <div class="review-header"><h2>匯入錯題檢視</h2><p>以下為你從先前匯出檔匯入的錯題清單。</p></div>
        <div class="actions compact"><span class="badge accent-badge">共 ${importedWrongs.length} 題</span><button id="clearImportedWrongsBtn" class="ghost-btn danger">清除匯入內容</button></div>
        <div class="secondary-meta">為避免大量匯入資料造成卡頓，這裡最多預覽前 120 題；但所有匯入的錯題與積分都已寫入學習記憶。</div>
        <div class="wrong-list">
          ${importedWrongs.slice(0, 120).map((item) => `
            <div class="wrong-item detail">
              ${item.image ? `<img class="wrong-thumb" src="${escapeAttr(item.image)}" alt="${escapeAttr(item.correctAnswer || "題圖")}">` : `<div class="wrong-thumb wrong-thumb-text">匯入</div>`}
              <div class="wrong-item-main">
                <div class="wrong-item-title">${escapeHtml(item.prompt)}</div>
                ${item.myChoice ? `<div class="wrong-item-note">最近錯答：${escapeHtml(item.myChoice)}</div>` : ""}
                <div class="wrong-item-note">正確答案：${escapeHtml(item.correctAnswer || "")}</div>
                <div class="wrong-item-meta">${escapeHtml(item.origin || "")}</div>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
    document.getElementById("clearImportedWrongsBtn")?.addEventListener("click", () => {
      importedWrongs = [];
      saveImportedWrongs();
      renderSessionOrEmpty();
    });
  }

  function sanitizeImportedProgress(data) {
    return repairProgressSnapshot(data);
  }

  function sanitizeImportedSettings(data, fallback = settings) {
    const base = { ...(fallback || loadSettings()) };
    if (!data || typeof data !== "object") return base;
    return {
      ...base,
      examScope: data.examScope || base.examScope,
      practiceMode: data.practiceMode || base.practiceMode,
      questionMode: data.questionMode || base.questionMode,
      questionCount: Number(data.questionCount || base.questionCount || 20),
      masteryTarget: Number(data.masteryTarget || base.masteryTarget || 2),
      scoreFilterOperator: data.scoreFilterOperator || base.scoreFilterOperator || "any",
      scoreFilterValue: sanitizeInteger(data.scoreFilterValue, base.scoreFilterValue ?? 0),
      answerTimeLimitSec: sanitizeNonNegativeNumber(data.answerTimeLimitSec, base.answerTimeLimitSec ?? 15),
      autoNextCorrectDelaySec: resolveAutoNextDelayValue(data, "autoNextCorrectDelaySec", "autoNextDelaySec", base.autoNextCorrectDelaySec ?? 1),
      autoNextWrongDelaySec: resolveAutoNextDelayValue(data, "autoNextWrongDelaySec", "autoNextDelaySec", base.autoNextWrongDelaySec ?? 4),
      soundVolumePct: sanitizeNonNegativeNumber(data.soundVolumePct, base.soundVolumePct ?? 180),
      shortcutOption1: normalizeShortcutSetting(data.shortcutOption1, base.shortcutOption1 || "1"),
      shortcutOption2: normalizeShortcutSetting(data.shortcutOption2, base.shortcutOption2 || "2"),
      shortcutOption3: normalizeShortcutSetting(data.shortcutOption3, base.shortcutOption3 || "3"),
      shortcutOption4: normalizeShortcutSetting(data.shortcutOption4, base.shortcutOption4 || "4"),
      shortcutNext: normalizeShortcutSetting(data.shortcutNext, base.shortcutNext || "Enter"),
    };
  }

  function sanitizeImportedSession(data) {
    if (!data || !Array.isArray(data.queue) || !data.queue.length) return null;
    return {
      ...data,
      answeredMap: data.answeredMap && typeof data.answeredMap === "object" ? data.answeredMap : {},
      questionModeMap: data.questionModeMap && typeof data.questionModeMap === "object" ? data.questionModeMap : {},
      wrongIds: Array.isArray(data.wrongIds) ? data.wrongIds : [],
      filters: data.filters && typeof data.filters === "object" ? data.filters : {},
      currentStreak: Number(data.currentStreak || 0),
      bestStreak: Number(data.bestStreak || 0),
      flashRevealed: !!data.flashRevealed,
      pointsDelta: Number(data.pointsDelta || 0),
    };
  }

  function sanitizeImportedImageIssues(data) {
    const src = pickPlainObject(data);
    const out = {};
    for (const [id, raw] of Object.entries(src)) {
      if (DANGEROUS_JSON_KEYS.has(id)) continue;
      if (!QUESTION_MAP.has(String(id))) continue;
      const normalized = sanitizeImageIssueEntry(raw);
      if (normalized) out[id] = normalized;
    }
    return out;
  }

  function mergeProgress(localProgress, importedProgress, mode = "conservative") {
    const merged = repairProgressSnapshot(localProgress);
    const incoming = repairProgressSnapshot(importedProgress);
    const ids = new Set([...Object.keys(merged.byQuestion || {}), ...Object.keys(incoming.byQuestion || {})]);
    const byQuestion = {};
    for (const id of ids) {
      const localItem = merged.byQuestion[id];
      const incomingItem = incoming.byQuestion[id];
      if (localItem && incomingItem) byQuestion[id] = chooseMergedQuestionRecord(localItem, incomingItem, mode);
      else if (incomingItem) byQuestion[id] = repairQuestionProgressRecord(incomingItem);
      else if (localItem) byQuestion[id] = repairQuestionProgressRecord(localItem);
    }
    return {
      byQuestion,
      meta: computeProgressMetaFromByQuestion(byQuestion, {
        bestStreak: Math.max(Number(merged.meta?.bestStreak || 0), Number(incoming.meta?.bestStreak || 0)),
        totalCompletedSessions: Math.max(Number(merged.meta?.totalCompletedSessions || 0), Number(incoming.meta?.totalCompletedSessions || 0)),
      }),
    };
  }

  function mergeImageIssues(localIssues, importedIssues) {
    return { ...(localIssues || {}), ...(importedIssues || {}) };
  }

  function maxIsoString(a, b) {
    const aa = typeof a === "string" ? a : "";
    const bb = typeof b === "string" ? b : "";
    if (!aa) return bb;
    if (!bb) return aa;
    return aa >= bb ? aa : bb;
  }

  function buildTextOptions(question) {
    if (question.kind === "true_false") {
      return { options: getTrueFalseOptions(question) };
    }
    if (Array.isArray(question.options) && question.options.length >= 2) {
      const normalized = question.options.map(normalizeTrueFalseOption);
      return { options: normalized };
    }

    const scopedQuestions = getScopedQuestions(session?.filters?.scope || getSelectedScope());
    const sameCategoryAnswers = scopedQuestions.filter((q) => q.category === question.category && q.id !== question.id).map((q) => q.answer);
    const fallbackAnswers = scopedQuestions.filter((q) => q.id !== question.id).map((q) => q.answer);
    const optionPool = unique(shuffle(sameCategoryAnswers).concat(shuffle(fallbackAnswers))).filter((answer) => answer !== question.answer);
    return { options: shuffle([question.answer, ...optionPool.slice(0, 3)]) };
  }

  function buildImageOptions(question) {
    const scopedQuestions = getScopedQuestions(session?.filters?.scope || getSelectedScope());
    const sameCategory = scopedQuestions.filter((q) => q.category === question.category && q.id !== question.id && q.image);
    const fallback = scopedQuestions.filter((q) => q.id !== question.id && q.image);
    const pool = shuffle(sameCategory).concat(shuffle(fallback));
    const used = new Set([question.id]);
    const picked = [question];
    for (const candidate of pool) {
      if (used.has(candidate.id)) continue;
      used.add(candidate.id);
      picked.push(candidate);
      if (picked.length >= 4) break;
    }
    return { options: shuffle(picked) };
  }

  function shouldMaskText() {
    return false;
  }

  function questionHasMask(question) {
    return !!(question?.maskPct?.rects?.length || question?.mask?.rects?.length);
  }

  function buildMaskedMedia(question, { alt, reveal = false, className = "masked-media" } = {}) {
    if (!question || !question.image) return "";
    const maskRects = getMaskRects(question);
    const useMask = shouldMaskText() && !reveal && maskRects.length;
    return `
      <div class="${escapeAttr(className)} ${useMask ? "has-mask" : ""}" data-mask-active="${useMask ? "true" : "false"}">
        <img src="${escapeAttr(question.image)}" alt="${escapeAttr(alt || question.answer)}">
        ${useMask ? `<div class="mask-layer">${maskRects.map((rect) => `<span class="mask-rect" style="left:${rect.x}%;top:${rect.y}%;width:${rect.w}%;height:${rect.h}%"></span>`).join("")}</div>` : ""}
      </div>
    `;
  }

  function getMaskRects(question) {
    if (question?.maskPct?.rects?.length) return question.maskPct.rects;
    if (question?.mask?.rects?.length && question.mask.imageWidth && question.mask.imageHeight) {
      return question.mask.rects.map((r) => ({
        x: (100 * r.x) / question.mask.imageWidth,
        y: (100 * r.y) / question.mask.imageHeight,
        w: (100 * r.w) / question.mask.imageWidth,
        h: (100 * r.h) / question.mask.imageHeight
      }));
    }
    return [];
  }

  function revealCurrentMaskedMedia() {
    document.querySelectorAll(".masked-media.has-mask").forEach((node) => {
      node.classList.add("revealed");
      const layer = node.querySelector(".mask-layer");
      if (layer) layer.remove();
    });
  }

  function currentQuestion() {
    if (!session || session.index >= session.queue.length) return null;
    return getQuestion(session.queue[session.index]);
  }

  function deduceQuestionMode(question, requestedMode) {
    if (!question) return requestedMode || "imageToText";
    if (question.kind === "true_false") return "trueFalse";
    if (!question.image) return "textChoice";
    if (requestedMode === "textToImage") return "textToImage";
    return "imageToText";
  }

  function currentQuestionMode(questionId) {
    const question = typeof questionId === "string" ? getQuestion(questionId) : questionId;
    const requestedMode = session?.questionModeMap?.[typeof questionId === "string" ? questionId : question?.id] || settings.questionMode || "textChoice";
    return deduceQuestionMode(question, requestedMode);
  }

  function getQuestion(id) {
    return QUESTION_MAP.get(id) || null;
  }

  function questionProgress(id) {
    if (!progress.byQuestion[id]) {
      progress.byQuestion[id] = defaultQuestionProgress();
    }
    const item = progress.byQuestion[id];
    if (typeof item.score !== "number") item.score = 0;
    if (typeof item.totalSeen !== "number") item.totalSeen = 0;
    if (typeof item.totalCorrect !== "number") item.totalCorrect = 0;
    if (typeof item.totalWrong !== "number") item.totalWrong = 0;
    if (typeof item.inWrongBook !== "boolean") item.inWrongBook = false;
    if (typeof item.masteryStreak !== "number") item.masteryStreak = 0;
    if (typeof item.lastWrongAt !== "string") item.lastWrongAt = "";
    if (typeof item.lastSeenAt !== "string") item.lastSeenAt = "";
    if (typeof item.lastResult !== "string") item.lastResult = "";
    if (typeof item.lastSelectedValue !== "string") item.lastSelectedValue = "";
    if (typeof item.lastSelectedLabel !== "string") item.lastSelectedLabel = "";
    if (typeof item.lastWrongSelectedValue !== "string") item.lastWrongSelectedValue = "";
    if (typeof item.lastWrongSelectedLabel !== "string") item.lastWrongSelectedLabel = "";
    return item;
  }

  function loadProgress() {
    const data = readStorageObject(STORAGE_KEY, LEGACY_PROGRESS_KEYS);
    const byQuestion = data?.byQuestion && typeof data.byQuestion === "object" ? data.byQuestion : {};
    const meta = data?.meta && typeof data.meta === "object" ? data.meta : {};
    return {
      byQuestion,
      meta: {
        totalAnswered: Number(meta.totalAnswered || 0),
        totalCorrect: Number(meta.totalCorrect || 0),
        bestStreak: Number(meta.bestStreak || 0),
        totalCompletedSessions: Number(meta.totalCompletedSessions || 0),
      }
    };
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
      try {
        window.dispatchEvent(new CustomEvent("driverquiz:progress-saved", {
          detail: {
            totalAnswered: Number(progress?.meta?.totalAnswered || 0),
            totalCorrect: Number(progress?.meta?.totalCorrect || 0),
            bestStreak: Number(progress?.meta?.bestStreak || 0),
          }
        }));
      } catch {}
    } catch (error) {
      console.warn("saveProgress failed", error);
    }
  }

  function defaultProgress() {
    return {
      byQuestion: {},
      meta: { totalAnswered: 0, totalCorrect: 0, bestStreak: 0, totalCompletedSessions: 0 }
    };
  }

  function defaultQuestionProgress() {
    return {
      totalSeen: 0,
      totalCorrect: 0,
      totalWrong: 0,
      score: 0,
      inWrongBook: false,
      masteryStreak: 0,
      lastWrongAt: "",
      lastSeenAt: "",
      // v0.1.6: only keep aggregated per-question state plus the latest answer summary.
      // Do not keep full answer history to avoid localStorage / cloud backup growth.
      lastResult: "",
      lastSelectedValue: "",
      lastSelectedLabel: "",
      lastWrongSelectedValue: "",
      lastWrongSelectedLabel: "",
    };
  }

  function loadSession() {
    const data = readStorageObject(SESSION_KEY, LEGACY_SESSION_KEYS);
    if (!data || !Array.isArray(data.queue)) return null;
    return {
      ...data,
      answeredMap: data.answeredMap && typeof data.answeredMap === "object" ? data.answeredMap : {},
      questionModeMap: data.questionModeMap && typeof data.questionModeMap === "object" ? data.questionModeMap : {},
      wrongIds: Array.isArray(data.wrongIds) ? data.wrongIds : [],
      filters: data.filters && typeof data.filters === "object" ? data.filters : {},
      currentStreak: Number(data.currentStreak || 0),
      bestStreak: Number(data.bestStreak || 0),
      flashRevealed: !!data.flashRevealed,
      pointsDelta: Number(data.pointsDelta || 0),
    };
  }

  function saveSession() {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  }


function restoreRecommendedSettings() {
  settings.answerTimeLimitSec = 15;
  settings.autoNextCorrectDelaySec = 1;
  settings.autoNextWrongDelaySec = 4;
  if (els.answerTimeLimitInput) els.answerTimeLimitInput.value = "15";
  if (els.autoNextCorrectDelayInput) els.autoNextCorrectDelayInput.value = "1";
  if (els.autoNextWrongDelayInput) els.autoNextWrongDelayInput.value = "4";
  saveSettings();
  refreshFilterSummaryText();
  if (typeof renderSessionOrEmpty === "function") renderSessionOrEmpty();
  showToast("已恢復建議預設：每題 15 秒、答對 1 秒、答錯 4 秒。");
}

  function hasOwn(obj, key) {
    return !!obj && Object.prototype.hasOwnProperty.call(obj, key);
  }

  function resolveAutoNextDelayValue(data, splitKey, legacyKey, fallbackValue) {
    if (hasOwn(data, splitKey)) {
      return sanitizeNonNegativeNumber(data?.[splitKey], fallbackValue);
    }
    const legacy = Number.parseFloat(data?.[legacyKey]);
    if (Number.isFinite(legacy) && legacy > 0) {
      return legacy;
    }
    return fallbackValue;
  }

  function loadSettings() {
    const data = readStorageObject(SETTINGS_KEY, LEGACY_SETTINGS_KEYS);
    return {
      maskTextBeforeAnswer: false,
      examScope: data?.examScope || "official_small_car",
      practiceMode: data?.practiceMode || "practice",
      questionMode: data?.questionMode || "textChoice",
      questionCount: Number(data?.questionCount || 20),
      masteryTarget: Number(data?.masteryTarget || 2),
      scoreFilterOperator: data?.scoreFilterOperator || "any",
      scoreFilterValue: sanitizeInteger(data?.scoreFilterValue, 0),
      answerTimeLimitSec: sanitizeNonNegativeNumber(data?.answerTimeLimitSec, 15),
      autoNextCorrectDelaySec: resolveAutoNextDelayValue(data, "autoNextCorrectDelaySec", "autoNextDelaySec", 1),
      autoNextWrongDelaySec: resolveAutoNextDelayValue(data, "autoNextWrongDelaySec", "autoNextDelaySec", 4),
      soundVolumePct: sanitizeNonNegativeNumber(data?.soundVolumePct, 180),
      shortcutOption1: normalizeShortcutSetting(data?.shortcutOption1, "1"),
      shortcutOption2: normalizeShortcutSetting(data?.shortcutOption2, "2"),
      shortcutOption3: normalizeShortcutSetting(data?.shortcutOption3, "3"),
      shortcutOption4: normalizeShortcutSetting(data?.shortcutOption4, "4"),
      shortcutNext: normalizeShortcutSetting(data?.shortcutNext, "Enter"),
      aiVerifyCopyEnabled: data?.aiVerifyCopyEnabled !== false,
    };
  }

  function saveSettings() {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    } catch (error) {
      console.warn("saveSettings failed", error);
    }
  }

  function isAiVerifyCopyEnabled() {
    return settings?.aiVerifyCopyEnabled !== false;
  }

  function setAiVerifyCopyEnabled(enabled) {
    settings.aiVerifyCopyEnabled = !!enabled;
    saveSettings();
    syncAiVerifyCopyToggles();
  }

  function syncAiVerifyCopyToggles() {
    const enabled = isAiVerifyCopyEnabled();
    document.querySelectorAll?.(".ai-copy-toggle-input").forEach((input) => {
      input.checked = enabled;
    });
  }

  function buildAiVerifyCopyToggleHtml() {
    return `<label class="ai-copy-toggle" title="是否在開啟外部 AI 前複製完整查證 prompt"><input type="checkbox" class="ai-copy-toggle-input" ${isAiVerifyCopyEnabled() ? "checked" : ""}>複製</label>`;
  }

  function bindAiVerifyCopyToggles() {
    document.querySelectorAll?.(".ai-copy-toggle-input").forEach((input) => {
      if (input.dataset.copyToggleBound === "1") return;
      input.dataset.copyToggleBound = "1";
      input.addEventListener("change", () => setAiVerifyCopyEnabled(input.checked));
    });
    syncAiVerifyCopyToggles();
  }

  function readStorageObject(primaryKey, legacyKeys = []) {
    const keys = [primaryKey, ...legacyKeys];
    for (const key of keys) {
      try {
        const raw = localStorage.getItem(key);
        if (!raw) continue;
        const parsed = JSON.parse(raw);
        if (key !== primaryKey) localStorage.setItem(primaryKey, raw);
        return parsed;
      } catch {
        continue;
      }
    }
    return null;
  }

  function startQuestionTimer(question) {
    const limitSec = sanitizeNonNegativeNumber(session?.filters?.answerTimeLimitSec, 0);
    const timerBadge = document.getElementById("timerBadge");
    const timerBar = document.getElementById("timerBar");
    if (!timerBadge || !timerBar) return;
    if (limitSec <= 0) {
      activeTimerState = null;
      timerBadge.textContent = "不限時";
      timerBadge.classList.remove("warning", "danger");
      timerBar.style.width = "100%";
      updatePauseButton();
      return;
    }

    activeTimerState = {
      type: "answer",
      questionId: question.id,
      totalMs: limitSec * 1000,
      remainingMs: limitSec * 1000,
      paused: false,
      onExpire: () => handleAnswer(question, "__timeout__", null, { forcedWrong: true, selectedLabel: "逾時未作答", reason: "timeout" }),
    };
    startActiveTimerLoop();
  }

  function scheduleNext(delaySec, countdownElementId, onExpire = advanceToNextQuestion) {
    if (delaySec <= 0) {
      activeTimerState = null;
      updatePauseButton();
      return;
    }
    activeTimerState = {
      type: "autoNext",
      totalMs: delaySec * 1000,
      remainingMs: delaySec * 1000,
      paused: false,
      countdownElementId,
      onExpire: typeof onExpire === "function" ? onExpire : (() => advanceToNextQuestion()),
    };
    startActiveTimerLoop();
  }

  function startActiveTimerLoop() {
    if (!activeTimerState) return;
    clearRawTimerHandles();
    activeTimerState.lastTickAt = Date.now();
    updateActiveTimerDisplay();
    countdownIntervalId = window.setInterval(() => {
      if (!activeTimerState || activeTimerState.paused) return;
      const now = Date.now();
      const delta = now - (activeTimerState.lastTickAt || now);
      activeTimerState.lastTickAt = now;
      activeTimerState.remainingMs = Math.max(0, activeTimerState.remainingMs - delta);
      updateActiveTimerDisplay();
      if (activeTimerState.remainingMs <= 0) {
        const onExpire = activeTimerState.onExpire;
        clearAllTimers();
        onExpire?.();
      }
    }, 100);
    answerTimeoutId = window.setTimeout(() => {
      if (!activeTimerState || activeTimerState.paused) return;
      const onExpire = activeTimerState.onExpire;
      clearAllTimers();
      onExpire?.();
    }, activeTimerState.remainingMs + 50);
    updatePauseButton();
  }

  function updateActiveTimerDisplay() {
    const timerBadge = document.getElementById("timerBadge");
    const timerBar = document.getElementById("timerBar");
    const countdownEl = activeTimerState?.countdownElementId ? document.getElementById(activeTimerState.countdownElementId) : null;

    if (!activeTimerState) {
      if (timerBadge) timerBadge.classList.remove("warning", "danger");
      if (countdownEl) countdownEl.textContent = "";
      updatePauseButton();
      return;
    }

    if (activeTimerState.type === "answer") {
      const totalMs = Math.max(activeTimerState.totalMs, 1);
      const remainingSec = activeTimerState.remainingMs / 1000;
      if (timerBadge) {
        timerBadge.textContent = `${activeTimerState.paused ? "已暫停｜" : "剩餘 "}${formatSeconds(remainingSec)}`;
        timerBadge.classList.toggle("warning", !activeTimerState.paused && remainingSec <= Math.max(5, totalMs / 1000 * 0.3) && remainingSec > 2);
        timerBadge.classList.toggle("danger", !activeTimerState.paused && remainingSec <= 2);
      }
      if (timerBar) timerBar.style.width = `${Math.max(0, Math.min(100, (activeTimerState.remainingMs / totalMs) * 100))}%`;
    } else {
      const remainingSec = activeTimerState.remainingMs / 1000;
      if (timerBadge) {
        timerBadge.textContent = `${activeTimerState.paused ? "已暫停｜" : "下題倒數 "}${formatSeconds(remainingSec)}`;
        timerBadge.classList.remove("warning", "danger");
      }
      if (timerBar) timerBar.style.width = "100%";
      if (countdownEl) countdownEl.textContent = `${formatSeconds(remainingSec)} 後自動跳題`;
    }
    updatePauseButton();
  }

  function updatePauseButton() {
    const btn = document.getElementById("pauseBtn");
    if (!btn) return;
    if (!activeTimerState) {
      btn.textContent = "暫停";
      btn.disabled = true;
      return;
    }
    btn.disabled = false;
    btn.textContent = activeTimerState.paused ? "繼續" : "暫停";
  }

  function togglePauseResume() {
    if (!activeTimerState) return;
    if (activeTimerState.paused) {
      activeTimerState.paused = false;
      startActiveTimerLoop();
      return;
    }
    pauseActiveTimer();
  }

  function pauseActiveTimer() {
    if (!activeTimerState || activeTimerState.paused) return;
    activeTimerState.paused = true;
    clearRawTimerHandles();
    updateActiveTimerDisplay();
  }

  function clearRawTimerHandles() {
    if (answerTimeoutId) {
      clearTimeout(answerTimeoutId);
      answerTimeoutId = null;
    }
    if (countdownIntervalId) {
      clearInterval(countdownIntervalId);
      countdownIntervalId = null;
    }
    if (autoNextTimeoutId) {
      clearTimeout(autoNextTimeoutId);
      autoNextTimeoutId = null;
    }
    clearFeedbackCountdown();
  }

  function clearFeedbackCountdown() {
    if (feedbackCountdownIntervalId) {
      clearInterval(feedbackCountdownIntervalId);
      feedbackCountdownIntervalId = null;
    }
  }

  function clearAllTimers() {
    clearRawTimerHandles();
    activeTimerState = null;
    updatePauseButton();
  }

  function advanceToNextQuestion() {
    clearAllTimers();
    if (!session) return;
    session.index += 1;
    session.flashRevealed = false;
    saveSession();
    renderSessionOrEmpty();
  }


  const GENERIC_KEYWORD_PATTERNS = [
    /^(正確|錯誤|是|否|○|X)$/,
    /^(可以|不可以|不得|應|應該|是否|何者|下列|其他|敘述|圖示|判斷|答案|選項)$/,
    /^(左轉|右轉|直行|前方|後方|方向|內容|相關)$/,
    /^(公尺|公里|秒|分鐘|題號|頁碼|分類|編號)$/,
    /^依圖示判斷$/,
    /^下列何者為正確敘述$/,
    /^此題已先遮住圖示內的文字數字作答後自動顯示$/,
    /^\d+(\.\d+)?(公尺|公里|秒|分鐘|題|頁|分|年|月|日)?$/
  ];
  const GENERIC_KEYWORD_SET = new Set([
    "正確", "錯誤", "可以", "不可以", "不得", "應", "應該", "是否", "何者", "下列", "其他", "敘述", "圖示", "判斷", "答案", "選項",
    "左轉", "右轉", "直行", "公尺", "公里", "秒", "分鐘", "前方", "後方", "方向", "相關", "內容", "注意", "車輛", "駕駛人", "道路", "顯示", "表示"
  ]);

  function isGenericKeyword(value) {
    const text = String(value || "").replace(/\s+/g, " ").trim();
    if (!text) return true;
    if (text.length <= 1) return true;
    if (GENERIC_KEYWORD_PATTERNS.some((pattern) => pattern.test(text))) return true;
    if (GENERIC_KEYWORD_SET.has(text)) return true;
    const tokens = splitTokens(text);
    if (!tokens.length) return false;
    if (tokens.every((token) => GENERIC_KEYWORD_SET.has(token) || GENERIC_KEYWORD_PATTERNS.some((pattern) => pattern.test(token)))) return true;
    if (normalizeSearchText(text).length <= 2 && tokens.every((token) => token.length <= 2)) return true;
    return false;
  }

  function finalizeKeywordCandidates(values) {
    const list = [];
    const seen = new Set();
    for (const raw of values || []) {
      const text = String(raw || "").replace(/\s+/g, " ").trim();
      if (!text) continue;
      if (isGenericKeyword(text)) continue;
      const normalized = normalizeSearchText(text);
      if (!normalized || seen.has(normalized)) continue;
      if (normalized.length <= 3 && list.some((existing) => normalizeSearchText(existing).includes(normalized))) continue;
      seen.add(normalized);
      list.push(text);
    }
    return list.sort((a, b) => b.length - a.length);
  }

  function buildQuestionSearchProfile(question) {
    if (!question) return { phrases: [], tokens: [], displayTerms: [] };
    const prompt = String(question.prompt || "");
    const answer = String(question.answer || "");
    const options = Array.isArray(question.options) ? question.options.map((opt) => String(opt || "").trim()).filter(Boolean) : [];
    const rawCandidates = [];
    const addCandidate = (value) => {
      const text = String(value || "").trim();
      if (!text) return;
      rawCandidates.push(text);
    };

    Array.from(prompt.matchAll(/「([^」]+)」/g)).forEach((m) => addCandidate(m[1]));
    if (answer && !isGenericKeyword(answer)) addCandidate(answer);
    options.forEach((opt) => {
      if (!isGenericKeyword(opt)) addCandidate(opt);
    });

    const promptCore = prompt
      .replace(/^依圖示判斷[，：:]?/, "")
      .replace(/^下列何者為正確敘述[？?]?/, "")
      .replace(/[（(]\d+[）)]/g, " ")
      .replace(/[？?]$/, "")
      .trim();
    if (promptCore && promptCore.length <= 90 && !isGenericKeyword(promptCore)) addCandidate(promptCore);

    [question?.source?.topicLabel].filter(Boolean).forEach(addCandidate);

    const phrases = finalizeKeywordCandidates(rawCandidates);
    const tokenSource = [promptCore, answer, ...options, question?.source?.topicLabel].filter(Boolean).join(" ");
    const tokens = finalizeKeywordCandidates(splitTokens(tokenSource).filter((token) => token.length >= 2 && token.length <= 18));
    const displayTerms = finalizeKeywordCandidates([...phrases, ...tokens]).slice(0, 5);
    return { phrases, tokens, displayTerms };
  }

  function isJinguiQuestion(question) {
    const id = String(question?.id || "");
    const category = String(question?.category || "");
    const sourceText = [question?.source?.pdf, question?.source?.topicLabel, question?.prompt, question?.answer].filter(Boolean).join(" ");
    return id.startsWith("JGYL-") || category === "jingui_formula" || /金匱|金匮|仲景|方證|方证/.test(sourceText);
  }

  function isTrafficQuestion(question) {
    const category = String(question?.category || "");
    return /traffic|road|sign|signal|mechanical|dashboard|law|driver|car/.test(category);
  }

  function buildExternalSearchContextTerms(question) {
    if (isJinguiQuestion(question)) {
      return ["金匱要略", "醫宗金鑑", "方證", "白話註解"];
    }
    if (isTrafficQuestion(question)) {
      return ["駕駛人手冊"];
    }
    return ["醫學考試", "題庫", "查證"];
  }

  function buildQuestionSearchQuery(question) {
    const profile = buildQuestionSearchProfile(question);
    const parts = [];
    if (question?.prompt) parts.push(String(question.prompt).replace(/^依圖示判斷[，：:]?/, "").trim());
    if (question?.answer && !isGenericKeyword(question.answer)) parts.push(question.answer);
    if (profile.displayTerms.length) parts.push(profile.displayTerms.join(" "));
    if (question?.source?.pdf) parts.push(String(question.source.pdf).replace(/\.pdf$/i, ""));
    parts.push(...buildExternalSearchContextTerms(question));
    return parts.join(" ").replace(/\s+/g, " ").trim();
  }

  const OFFICIAL_LAW_RESOURCES = {
    "道路交通管理處罰條例": {
      law: "道路交通管理處罰條例",
      title: "道路交通管理處罰條例 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040012"
    },
    "道路交通安全規則": {
      law: "道路交通安全規則",
      title: "道路交通安全規則 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040013"
    },
    "道路交通標誌標線號誌設置規則": {
      law: "道路交通標誌標線號誌設置規則",
      title: "道路交通標誌標線號誌設置規則 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040014"
    },
    "道路交通安全講習辦法": {
      law: "道路交通安全講習辦法",
      title: "道路交通安全講習辦法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040017"
    },
    "高速公路及快速公路交通管制規則": {
      law: "高速公路及快速公路交通管制規則",
      title: "高速公路及快速公路交通管制規則 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=K0040019"
    },
    "違反道路交通管理事件統一裁罰基準及處理細則": {
      law: "違反道路交通管理事件統一裁罰基準及處理細則",
      title: "違反道路交通管理事件統一裁罰基準及處理細則 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0080029"
    },
    "道路交通事故處理辦法": {
      law: "道路交通事故處理辦法",
      title: "道路交通事故處理辦法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0080090"
    },
    "行人交通安全設施條例施行細則": {
      law: "行人交通安全設施條例施行細則",
      title: "行人交通安全設施條例施行細則 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=D0070307"
    },
    "空氣污染防制法": {
      law: "空氣污染防制法",
      title: "空氣污染防制法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=O0020001"
    },
    "汽車停車怠速管理辦法": {
      law: "汽車停車怠速管理辦法",
      title: "汽車停車怠速管理辦法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?kw=%E6%B1%BD%E8%BB%8A%E5%81%9C%E8%BB%8A%E6%80%A0%E9%80%9F%E7%AE%A1%E7%90%86%E8%BE%A6%E6%B3%95&pcode=O0020086"
    },
    "中華民國刑法": {
      law: "中華民國刑法",
      title: "中華民國刑法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?pcode=C0000001"
    },
    "民法": {
      law: "民法",
      title: "民法 - 全國法規資料庫",
      url: "https://law.moj.gov.tw/LawClass/LawAll.aspx?kw=%E6%B0%91%E6%B3%95&pcode=B0000001"
    }
  };

  function normalizeLawName(name) {
    return String(name || "")
      .replace(/（[^）]*）/g, "")
      .replace(/\([^)]*\)/g, "")
      .replace(/\s+/g, "")
      .trim();
  }

  function lookupOfficialLawResource(name) {
    const normalized = normalizeLawName(name);
    if (!normalized) return null;
    const direct = OFFICIAL_LAW_RESOURCES[normalized];
    if (direct) return direct;
    if (normalized.includes("道路交通管理處罰條例")) return OFFICIAL_LAW_RESOURCES["道路交通管理處罰條例"];
    if (normalized.includes("道路交通安全規則")) return OFFICIAL_LAW_RESOURCES["道路交通安全規則"];
    if (normalized.includes("道路交通標誌標線號誌設置規則")) return OFFICIAL_LAW_RESOURCES["道路交通標誌標線號誌設置規則"];
    if (normalized.includes("道路交通安全講習辦法")) return OFFICIAL_LAW_RESOURCES["道路交通安全講習辦法"];
    if (normalized.includes("高速公路及快速公路交通管制規則")) return OFFICIAL_LAW_RESOURCES["高速公路及快速公路交通管制規則"];
    if (normalized.includes("違反道路交通管理事件統一裁罰基準及處理細則")) return OFFICIAL_LAW_RESOURCES["違反道路交通管理事件統一裁罰基準及處理細則"];
    if (normalized.includes("道路交通事故處理辦法")) return OFFICIAL_LAW_RESOURCES["道路交通事故處理辦法"];
    if (normalized.includes("行人交通安全設施條例施行細則")) return OFFICIAL_LAW_RESOURCES["行人交通安全設施條例施行細則"];
    if (normalized.includes("空氣污染防制法")) return OFFICIAL_LAW_RESOURCES["空氣污染防制法"];
    if (normalized.includes("汽車停車怠速管理辦法")) return OFFICIAL_LAW_RESOURCES["汽車停車怠速管理辦法"];
    if (normalized.includes("刑法")) return OFFICIAL_LAW_RESOURCES["中華民國刑法"];
    if (normalized.includes("民法")) return OFFICIAL_LAW_RESOURCES["民法"];
    return null;
  }

  function collectOfficialLawResources(question) {
    const resources = [];
    const seen = new Set();
    const pushResource = (resource) => {
      if (!resource || !resource.url) return;
      if (seen.has(resource.url)) return;
      seen.add(resource.url);
      resources.push(resource);
    };
    const pushByName = (name) => pushResource(lookupOfficialLawResource(name));

    const basis = Array.isArray(question?.lawBasis) ? question.lawBasis.filter(Boolean) : [];
    basis.forEach((item) => pushByName(item?.law));

    const text = [
      question?.prompt,
      question?.answer,
      ...(Array.isArray(question?.options) ? question.options : []),
      question?.source?.topicLabel,
      question?.explanation
    ].filter(Boolean).join(" ");

    if (/高速公路|快速公路|交流道|匝道|路肩|加速車道|減速車道|服務區|休息站|高乘載|爬坡道/.test(text)) {
      pushByName("高速公路及快速公路交通管制規則");
    }
    if (/罰鍰|罰金|記點|違規點數|吊扣|吊銷|酒駕|拒測|無照|越級駕駛|肇事逃逸|裁罰|處罰|沒入/.test(text)) {
      pushByName("道路交通管理處罰條例");
      pushByName("違反道路交通管理事件統一裁罰基準及處理細則");
    }
    if (/事故|肇事|現場痕跡|標繪|警告設施|移置車輛|初步分析研判表|攝影或錄影/.test(text)) {
      pushByName("道路交通事故處理辦法");
    }
    if (/標誌|標線|號誌/.test(text)) {
      pushByName("道路交通標誌標線號誌設置規則");
    }
    if (/講習/.test(text)) {
      pushByName("道路交通安全講習辦法");
    }
    if (/怠速/.test(text)) {
      pushByName("汽車停車怠速管理辦法");
      pushByName("空氣污染防制法");
    }

    if (!resources.length && /^traffic_law_/.test(String(question?.category || ""))) {
      pushByName("道路交通安全規則");
      if (/處罰|罰鍰|吊扣|吊銷|記點/.test(text)) pushByName("道路交通管理處罰條例");
    }
    return resources;
  }

  function buildVerifyFocusItems(question, keywords) {
    const items = [];
    const basis = Array.isArray(question?.lawBasis) ? question.lawBasis.filter(Boolean) : [];
    basis.slice(0, 4).forEach((item) => {
      const head = [item?.law, item?.article, item?.paragraph].filter(Boolean).join("");
      const note = String(item?.note || item?.penaltyStandard || "").trim();
      if (head || note) items.push(`${head}${note ? `：${note}` : ""}`);
    });
    if (question?.source?.topicLabel) items.push(`先核對題型主題：${question.source.topicLabel}`);
    if (Array.isArray(keywords) && keywords.length) items.push(`關鍵詞：${keywords.join("、")}`);
    if (!items.length && question?.answer) items.push(`先比對官方正解：${question.answer}`);
    return items.slice(0, 5);
  }

  function buildVerifyToolDetailHtml(question) {
    const keywords = extractQuestionKeywordCandidates(question);
    const focusItems = buildVerifyFocusItems(question, keywords);

    if (isJinguiQuestion(question)) {
      const refs = Array.isArray(question?.source?.webReferences) ? question.source.webReferences.map((item) => String(item || "").trim()).filter(Boolean) : [];
      const sourceHtml = refs.length
        ? `<ul class="verify-tool-list">${refs.slice(0, 6).map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
        : `<div>本題未附網頁來源；建議以題幹、方名、《金匱要略》與醫宗金鑑進行外部查證。</div>`;
      const focusHtml = `
        <div class="verify-tool-card">
          <div class="verify-tool-card-title">查證重點</div>
          <ul class="verify-tool-list">
            <li>核對《金匱要略》原文、方名與題庫暫定答案是否一致。</li>
            <li>核對醫宗金鑑、醫砭宋本或中醫笈成中相同條文的方義與藥物組成。</li>
            <li>留意古文異體字、省略句、題幹抽字錯誤與類方鑑別。</li>
          </ul>
        </div>`;
      return `
        <div class="verify-tool-inline hidden">
          <div class="verify-tool-card">
            <div class="verify-tool-card-title">醫宗金鑑／原文來源</div>
            ${sourceHtml}
          </div>
          ${focusHtml}
        </div>
      `;
    }

    const handbook = getHandbookExplanation(question);
    const officialFallback = buildOfficialFallbackExplanation(question, keywords);
    const lawResources = collectOfficialLawResources(question);

    const handbookHtml = handbook
      ? `
        <div class="verify-tool-card">
          <div class="verify-tool-card-title">手冊對照</div>
          ${handbook.keyword && !isGenericKeyword(handbook.keyword) ? `<div class="verify-tool-keywords">檢索詞：${escapeHtml(handbook.keyword)}</div>` : ""}
          <div>${escapeHtml(handbook.text || "")}</div>
          <small>來源：駕駛人手冊 第 ${escapeHtml(String(handbook.page || "?"))} 頁 ・ ${escapeHtml(handbook.title || "相關章節")}</small>
        </div>`
      : officialFallback
        ? `
        <div class="verify-tool-card">
          <div class="verify-tool-card-title">題目重點</div>
          <div>${escapeHtml(officialFallback.text || "")}</div>
        </div>`
        : `
        <div class="verify-tool-card">
          <div class="verify-tool-card-title">題目重點</div>
          <div>目前沒有自動對上的手冊段落，可優先比對關鍵詞與官方法規連結。</div>
        </div>`;

    const focusHtml = focusItems.length
      ? `
        <div class="verify-tool-card">
          <div class="verify-tool-card-title">查證重點</div>
          <ul class="verify-tool-list">${focusItems.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>
        </div>`
      : "";

    const lawHtml = lawResources.length
      ? `
        <div class="verify-tool-card official-law-links-card">
          <div class="verify-tool-card-title">官方法規網址</div>
          <div class="verify-law-links">${lawResources.map((item) => `
            <a class="verify-law-link" href="${escapeAttr(item.url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(item.title)}</a>
          `).join("")}</div>
        </div>`
      : "";

    return `
      <div class="verify-tool-inline hidden">
        ${handbookHtml}
        ${focusHtml}
        ${lawHtml}
      </div>
    `;
  }

  function extractFirstUrlFromText(text) {
    const raw = String(text || "").trim();
    if (!raw) return "";
    const match = raw.match(/https?:\/\/[^\s，。；、)）\]】"'<>]+/i);
    if (!match) return "";
    return match[0].replace(/[。；，、]+$/g, "");
  }

  function isSafeExternalHttpUrl(url) {
    try {
      const parsed = new URL(String(url || ""));
      return parsed.protocol === "http:" || parsed.protocol === "https:";
    } catch {
      return false;
    }
  }

  function getYizongSourceUrl(question) {
    const source = question?.source || {};
    const refs = Array.isArray(source.webReferences)
      ? source.webReferences.map((item) => String(item || "").trim()).filter(Boolean)
      : [];

    const preferred = refs.find((item) => /醫宗金鑑|tchaa\.uncma\.com\.tw|\/u5\/book12\//i.test(item));
    let url = extractFirstUrlFromText(preferred || "");

    if (!url) {
      const explanation = String(question?.explanation || "");
      const yizongLine = (explanation.split(/\r?\n/).find((line) => /醫宗金鑑.*https?:\/\//.test(line)) || "");
      url = extractFirstUrlFromText(yizongLine);
    }

    if (!url) {
      const anyRef = refs.find((item) => /https?:\/\//i.test(item));
      url = extractFirstUrlFromText(anyRef || "");
    }

    return isSafeExternalHttpUrl(url) ? url : "";
  }

  function buildYizongSourceButtonHtml(question) {
    if (!isJinguiQuestion(question)) return "";
    const url = getYizongSourceUrl(question);
    if (!url) return "";
    const qid = question?.id ? String(question.id) : "";
    return `<button type="button" class="ghost-btn aux-btn yizong-source-btn" data-question-id="${escapeAttr(qid)}" title="開啟本題醫宗金鑑網頁來源">醫宗</button>`;
  }

  const AI_VERIFY_PROVIDERS = {
    chatgpt: {
      label: "GPT",
      homeUrl: "https://chatgpt.com/",
      // ChatGPT currently accepts the q parameter; hints=search is kept to bias toward web search.
      buildUrl: (prompt) => `https://chatgpt.com/?hints=search&q=${encodeURIComponent(prompt)}`,
      maxEncodedLength: 12000,
      note: "若輸入框未自動帶入，完整 prompt 已複製，可直接貼上。"
    },
    gemini: {
      label: "Gemini",
      homeUrl: "https://gemini.google.com/app",
      buildUrl: null,
      maxEncodedLength: 0,
      note: "Gemini 網頁版不穩定支援 URL 預填；本系統會先複製 prompt，再開啟頁面。"
    },
    perplexity: {
      label: "Perp",
      homeUrl: "https://www.perplexity.ai/",
      // Perplexity community search-engine pattern; full prompt is still copied as fallback.
      buildUrl: (prompt) => `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}&focus=internet`,
      maxEncodedLength: 9000,
      note: "若輸入框未自動帶入，完整 prompt 已複製，可直接貼上。"
    },
    grok: {
      label: "Grok",
      homeUrl: "https://grok.com/",
      buildUrl: (prompt) => `https://grok.com/?q=${encodeURIComponent(prompt)}`,
      maxEncodedLength: 9000,
      note: "若輸入框未自動帶入，完整 prompt 已複製，可直接貼上。"
    }
  };

  function buildAiVerifyButtonsHtml(question) {
    const qid = question?.id ? String(question.id) : "";
    return Object.entries(AI_VERIFY_PROVIDERS).map(([key, provider]) => (
      `<button type="button" class="ghost-btn aux-btn ai-verify-btn" data-ai-provider="${escapeAttr(key)}" data-question-id="${escapeAttr(qid)}" title="複製查證 prompt 並開啟 ${escapeAttr(provider.label)}">${escapeHtml(provider.label)}</button>`
    )).join("\n");
  }

  function questionOptionsForPrompt(question) {
    if (Array.isArray(question?.options) && question.options.length) {
      return question.options.map((opt, idx) => `${idx + 1}. ${String(opt || "")}`).join("\n");
    }
    if (question?.kind === "true_false") {
      return getTrueFalseOptions(question).map((opt, idx) => `${idx + 1}. ${String(opt || "")}`).join("\n");
    }
    return "（本題沒有明確選項欄位）";
  }

  function sourceReferencesForPrompt(question) {
    const refs = [];
    const source = question?.source || {};
    if (source.pdf) refs.push(`題庫 PDF：${String(source.pdf)}${source.page ? `，第 ${source.page} 頁` : ""}`);
    if (source.topicLabel) refs.push(`題庫主題：${String(source.topicLabel)}`);
    if (source.questionNo) refs.push(`題庫題號：${String(source.questionNo)}`);
    if (Array.isArray(source.webReferences)) {
      source.webReferences.forEach((item) => {
        const text = String(item || "").trim();
        if (text) refs.push(text);
      });
    }
    return refs.length ? refs.map((ref, idx) => `${idx + 1}. ${ref}`).join("\n") : "（本題沒有附外部來源 URL，請自行以題幹與方名搜尋可靠資料。）";
  }

  function compactSourceReferencesForPrompt(question) {
    const source = question?.source || {};
    const refs = [];
    if (Array.isArray(source.webReferences)) {
      source.webReferences.forEach((item) => {
        const text = String(item || "").trim();
        if (text && refs.length < 3) refs.push(text);
      });
    }
    if (!refs.length && source.pdf) refs.push(`題庫 PDF：${String(source.pdf)}${source.page ? `，第 ${source.page} 頁` : ""}`);
    return refs.length ? refs.join("；") : "請自行查《金匱要略》、醫宗金鑑、醫砭宋本、中醫笈成。";
  }

  function buildAiVerificationUrlPrompt(question) {
    const id = String(question?.id || "未知 ID");
    const prompt = String(question?.prompt || buildQuestionPreview(question) || "").replace(/\s+/g, " ").trim();
    const answer = String(question?.answer || "").trim();
    const options = questionOptionsForPrompt(question).replace(/\s+/g, " ").trim();
    const refs = compactSourceReferencesForPrompt(question);
    return [
      "請上網查證這題中醫經典考題，勿預設題庫答案正確，請用繁體中文回答。",
      `ID：${id}`,
      `題幹：${prompt}`,
      `選項：${options}`,
      `暫定答案：${answer || "未提供"}`,
      `來源線索：${refs}`,
      "請核對原文與版本、正確答案、詞句註釋、白話翻譯、辨證要點、病機、方子性質、治法、方義與組成、類方鑑別、記憶點、可疑錯誤與來源URL。"
    ].join("\n");
  }

  function buildAiVerificationPrompt(question) {
    const id = String(question?.id || "未知 ID");
    const prompt = String(question?.prompt || buildQuestionPreview(question) || "").trim();
    const answer = String(question?.answer || "").trim();
    const options = questionOptionsForPrompt(question);
    const sourceRefs = sourceReferencesForPrompt(question);
    const categoryLabel = CATEGORY_LABELS[question?.category] || question?.category || "未標示";

    return [
      "請扮演嚴謹的中醫經典與考題校訂助理，主動上網查證下列題目。",
      "不要預設題庫暫定答案一定正確；請用可靠來源驗證原文、方名、方義與選項。",
      "不要只重述題庫內容。請以《金匱要略》原文、醫宗金鑑、醫砭宋本、中醫笈成、可靠教材或官方方劑資料交叉核對。",
      "若查不到可靠來源，請明確標示不確定，不要編造方藥組成或臨床功效。",
      "",
      `題目 ID：${id}`,
      `分類：${categoryLabel}`,
      `題幹／原文：${prompt}`,
      `題庫暫定答案：${answer || "（未提供）"}`,
      "選項：",
      options,
      "",
      "本系統已附來源線索：",
      sourceRefs,
      "",
      "請依序輸出以下 14 點：",
      "1. 正確答案判定：答案是否正確？若錯，正確答案是什麼？",
      "2. 原文定位與版本校對：指出可查到的原文、篇章或條文脈絡，並說明題幹是否有抽字、異體字、錯字或省略。",
      "3. 詞句註釋：解釋古文關鍵字、罕見字、病名、症狀語與方證術語。",
      "4. 白話翻譯：把整條古文翻成現代中文，不要只說這是方證線索。",
      "5. 辨證要點：病位、寒熱、虛實、主症組合，以及如何與相近方區分。",
      "6. 病機：說明症狀形成的中醫機轉，必須對應題幹原文。",
      "7. 方子性質：此方屬於何種治療方向，為何適合本條文。",
      "8. 治法：用精簡中醫治法語言表述。",
      "9. 方義與藥物組成：列主要組成與配伍邏輯；不確定時請明說，不要捏造藥味。",
      "10. 類方鑑別：至少列 1–3 個容易混淆的方或條文，說明差異。",
      "11. 關鍵字記憶點：提供考試用短句。",
      "12. 可疑錯誤／需人工審閱處：列出本題可能仍需老師確認的點。",
      "13. 參考來源：列出實際查到的 URL、書名、篇名或資料庫名；不要只寫泛稱。",
      "14. 簡短考試筆記：用 3–5 行整理成可背誦版本。",
      "",
      "請用繁體中文回答。"
    ].join("\n");
  }

  async function copyTextToClipboard(text) {
    try {
      if (navigator.clipboard?.writeText && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      textarea.setAttribute("readonly", "");
      textarea.style.position = "fixed";
      textarea.style.left = "-9999px";
      textarea.style.top = "0";
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      const ok = document.execCommand("copy");
      textarea.remove();
      return !!ok;
    } catch {
      return false;
    }
  }

  function buildAiProviderUrl(provider, urlPrompt) {
    if (!provider?.buildUrl) return provider?.homeUrl || "";
    const encoded = encodeURIComponent(urlPrompt);
    if (encoded.length > provider.maxEncodedLength) return provider.homeUrl;
    return provider.buildUrl(urlPrompt);
  }

  async function openAiVerification(question, providerKey) {
    const provider = AI_VERIFY_PROVIDERS[providerKey] || AI_VERIFY_PROVIDERS.chatgpt;
    if (activeTimerState && !activeTimerState.paused) pauseActiveTimer();

    const prompt = buildAiVerificationPrompt(question);
    const urlPrompt = buildAiVerificationUrlPrompt(question);
    const copyEnabled = isAiVerifyCopyEnabled();
    const copied = copyEnabled ? await copyTextToClipboard(prompt) : false;
    const url = buildAiProviderUrl(provider, urlPrompt);
    let opened = null;
    try {
      opened = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      opened = null;
    }

    if (!opened) {
      window.alert([
        `瀏覽器阻擋了 ${provider.label} 外部頁面。`,
        copied ? "查證 prompt 已複製，可手動開啟 AI 後貼上。" : (copyEnabled ? "查證 prompt 複製失敗，請改用一般搜尋或手動複製題目。" : "你已關閉自動複製，請手動複製題目或重新勾選「複製」。")
      ].join("\n"));
      return;
    }

    if (!provider.buildUrl || url === provider.homeUrl) {
      window.setTimeout(() => {
        window.alert(`${provider.label} 已開啟。${copied ? "查證 prompt 已複製，請到輸入框貼上。" : (copyEnabled ? "但 prompt 複製可能失敗，請回本頁手動複製題目。" : "你已關閉自動複製；若頁面未帶入查詢，請回本頁重新勾選「複製」後再開。")}\n\n${provider.note || ""}`.trim());
      }, 80);
    }
  }

  function bindAiVerifyButtons(defaultQuestion = null) {
    const buttons = Array.from(document.querySelectorAll(".ai-verify-btn"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const providerKey = button.getAttribute("data-ai-provider") || "chatgpt";
        const qid = button.getAttribute("data-question-id") || defaultQuestion?.id || "";
        const targetQuestion = qid && QUESTION_MAP.has(qid) ? QUESTION_MAP.get(qid) : defaultQuestion;
        if (!targetQuestion) {
          window.alert("找不到這題資料，請重新整理頁面後再試。");
          return;
        }
        openAiVerification(targetQuestion, providerKey);
      });
    });
  }

  async function openYizongSource(question) {
    const url = getYizongSourceUrl(question);
    if (activeTimerState && !activeTimerState.paused) pauseActiveTimer();

    if (!url) {
      window.alert("本題目前沒有可直接開啟的醫宗金鑑網頁來源。可改用搜尋此題或 AI 查證按鈕。");
      return;
    }

    let opened = null;
    try {
      opened = window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      opened = null;
    }

    if (opened) return;

    const copied = await copyTextToClipboard(url);
    window.alert([
      "瀏覽器阻擋了醫宗金鑑來源分頁。",
      copied ? "來源網址已複製，可手動貼到瀏覽器開啟。" : "來源網址複製失敗，請改用搜尋此題。",
      url
    ].join("\n\n"));
  }

  function bindYizongSourceButtons(defaultQuestion = null) {
    const buttons = Array.from(document.querySelectorAll(".yizong-source-btn"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const qid = button.getAttribute("data-question-id") || defaultQuestion?.id || "";
        const targetQuestion = qid && QUESTION_MAP.has(qid) ? QUESTION_MAP.get(qid) : defaultQuestion;
        if (!targetQuestion) {
          window.alert("找不到這題資料，請重新整理頁面後再試。");
          return;
        }
        openYizongSource(targetQuestion);
      });
    });
  }

  function openQuestionSearch(question) {
    const query = buildQuestionSearchQuery(question);
    const prompt = buildQuestionPreview(question);
    if (activeTimerState && !activeTimerState.paused) {
      pauseActiveTimer();
    }

    if (!query) {
      window.alert(`目前沒有可用的搜尋關鍵詞。

題目：${prompt}`);
      return;
    }

    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    let opened = null;
    try {
      opened = window.open(url, "_blank", "noopener,noreferrer");
    } catch (err) {
      opened = null;
    }

    if (opened) return;

    try {
      navigator.clipboard?.writeText?.(query);
    } catch {}

    window.alert([
      "瀏覽器阻擋了外部搜尋分頁。",
      `題目：${prompt}`,
      `建議檢索詞：${query}`,
      "（檢索詞已嘗試複製到剪貼簿）"
    ].join("\n\n"));
  }

  function bindQuestionSearchButton(question) {
    const buttons = Array.from(document.querySelectorAll("#searchQuestionQuickBtn"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => openQuestionSearch(question));
    });
  }

  function bindVerifyToolButton() {
    const buttons = Array.from(document.querySelectorAll(".verify-tool-btn"));
    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        const block = button.closest(".search-tool-block");
        const panel = block?.querySelector(".verify-tool-inline");
        if (!panel) return;
        const shouldOpen = panel.classList.contains("hidden");
        panel.classList.toggle("hidden", !shouldOpen);
        button.setAttribute("aria-expanded", String(shouldOpen));
      });
    });
  }



  function getBaseExplanationText(question) {
    const text = String(question?.explanation || "").trim();
    if (!text) return "";
    if (/^依\s*.+整理。?$/.test(text)) return "";
    return text;
  }

  function formatExplanationText(text) {
    return escapeHtml(text).replace(/\r?\n/g, "<br>");
  }

function normalizeNetworkReferenceAnswer(question, rawText) {
  const text = String(rawText || "").trim();
  if (!text) return "";

  const qid = String(question?.id || "").trim();
  if (!/^tf-\d+/i.test(qid)) return text;

  let normalized = text.replace(/^資料顯示：\s*/, "").trim();

  const candidatePatterns = [
    /^(?:此圖示代表|此號誌為|圖中[^，。]*為|此標線為|這是警告標誌，表示|應為)「([^」]+)」/,
    /^(?:此圖示代表|此號誌為|圖中[^，。]*為|此標線為|這是警告標誌，表示|應為)([^，。]+)/,
  ];

  let candidate = "";
  for (const pattern of candidatePatterns) {
    const match = normalized.match(pattern);
    if (match && match[1]) {
      candidate = String(match[1]).trim();
      break;
    }
  }

  if (!candidate) {
    return /^可能是：/.test(normalized) ? normalized : `可能是：${normalized}`;
  }

  normalized = normalized
    .replace(/^(?:此圖示代表|此號誌為|圖中[^，。]*為|此標線為|這是警告標誌，表示|應為)/, "")
    .replace(/^「[^」]+」[,，]?/, "")
    .trim();

  if (normalized.startsWith('，') || normalized.startsWith(',')) {
    normalized = normalized.slice(1).trim();
  }

  return normalized ? `可能是：${candidate}。${normalized}` : `可能是：${candidate}`;
}

function getNetworkReferenceAnswer(question) {
  const text = String(NETWORK_REFERENCE_ANSWERS[question?.id] || "").trim();
  return normalizeNetworkReferenceAnswer(question, text);
}


function getHandbookExplanation(question) {
  const profile = buildQuestionSearchProfile(question);
  const keywords = profile.displayTerms;
  const semantic = findBestQuestionAwareHandbook(question, profile);
  const dynamic = findBestHandbookRule(profile.phrases.length ? profile.phrases : keywords);
  const snippet = findBestHandbookSnippet(question, profile.phrases.length ? profile.phrases : keywords);
  const exact = HANDBOOK_EXPLANATIONS[question?.id] || null;
  const exactRelevant = exact && isStaticHandbookRelevant(exact, keywords, question)
    ? { ...exact, keyword: !isGenericKeyword(exact.keyword || "") ? (exact.keyword || "") : (keywords[0] || ""), kind: exact.kind || "manual", score: 160 }
    : null;

  const candidates = [exactRelevant, dynamic, semantic, snippet].filter(Boolean);
  if (!candidates.length) return null;
  candidates.sort((a, b) => Number(b.score || 0) - Number(a.score || 0));
  const picked = candidates[0];
  if (picked && isGenericKeyword(picked.keyword || "")) picked.keyword = "";
  return picked;
}

function shouldPreferDynamicHandbook(question, keywords) {
  if (!question) return false;
  const prompt = String(question.prompt || "");
  return question.kind === "true_false"
    || /依圖示判斷/.test(prompt)
    || /下列何者為正確敘述/.test(prompt)
    || (!!keywords.length && ["正確", "錯誤"].includes(String(question.answer || "")));
}

function extractQuestionKeywordCandidates(question) {
  if (!question) return [];
  return buildQuestionSearchProfile(question).displayTerms;
}

function findBestQuestionAwareHandbook(question, profile = buildQuestionSearchProfile(question)) {
  if (!Array.isArray(HANDBOOK_PAGES) || !HANDBOOK_PAGES.length) return null;
  const phrases = (profile?.phrases || []).slice(0, 8);
  const tokens = (profile?.tokens || []).slice(0, 16);
  if (!phrases.length && !tokens.length) return null;

  let best = null;
  HANDBOOK_PAGES.forEach((pageEntry) => {
    const text = String(pageEntry?.text || "").trim();
    if (!text) return;
    const title = String(pageEntry?.title || "").trim();
    const searchable = `${title} ${text}`;
    const normalizedText = normalizeSearchText(searchable);
    let score = 0;
    let bestTerm = "";
    let bestIndex = -1;

    phrases.forEach((phrase) => {
      const normalizedPhrase = normalizeSearchText(phrase);
      if (!normalizedPhrase) return;
      const exactIndex = normalizedText.indexOf(normalizedPhrase);
      if (exactIndex >= 0) {
        const localScore = 160 + normalizedPhrase.length * 3 + (title.includes(phrase) ? 25 : 0);
        if (localScore > score) {
          score = localScore;
          bestTerm = phrase;
          bestIndex = text.indexOf(phrase);
        }
        return;
      }
      if (tokenOverlap(phrase, searchable)) {
        const localScore = 70 + commonTokenLength(phrase, searchable);
        if (localScore > score) {
          score = localScore;
          bestTerm = phrase;
          bestIndex = text.indexOf(splitTokens(phrase)[0] || phrase);
        }
      }
    });

    tokens.forEach((token) => {
      if (isGenericKeyword(token)) return;
      const normalizedToken = normalizeSearchText(token);
      if (!normalizedToken) return;
      if (normalizedText.includes(normalizedToken)) {
        const localScore = 18 + normalizedToken.length + (title.includes(token) ? 10 : 0);
        if (localScore > score) {
          score = localScore;
          bestTerm = token;
          bestIndex = text.indexOf(token);
        }
      }
    });

    if (!best || score > best.score) {
      if (score >= 34) {
        best = {
          title: pageEntry.title || "相關章節",
          page: pageEntry.page,
          text: extractSnippetAround(text, bestTerm, bestIndex),
          keyword: isGenericKeyword(bestTerm) ? "" : bestTerm,
          score,
          kind: "manual-search"
        };
      }
    }
  });
  return best;
}


function findBestHandbookRule(keywords) {
  if (!keywords?.length) return null;
  let best = null;
  for (const rule of HANDBOOK_RULES) {
    let score = 0;
    for (const keyword of keywords) {
      for (const alias of rule.aliases) {
        if (keyword === alias) score = Math.max(score, 100 + alias.length);
        else if (keyword.includes(alias)) score = Math.max(score, 80 + alias.length);
        else if (alias.includes(keyword)) score = Math.max(score, 60 + keyword.length);
        else if (tokenOverlap(keyword, alias)) score = Math.max(score, 40 + commonTokenLength(keyword, alias));
      }
    }
    if (!best || score > best.score) best = score > 0 ? { ...rule, keyword: pickBestKeywordForRule(keywords, rule.aliases), score, kind: "manual" } : best;
  }
  return best && best.score > 0 ? best : null;
}

function findBestHandbookSnippet(question, keywords) {
  if (!Array.isArray(HANDBOOK_PAGES) || !HANDBOOK_PAGES.length || !keywords?.length) return null;
  const isSignQuestion = /sign|traffic_sign|warning_sign|instruction_sign|direction_sign|prohibition_sign|restriction_sign/i.test(String(question?.category || "")) || /汽車標誌/.test(String(question?.source?.pdf || ""));
  const isLawQuestion = /traffic_law/.test(String(question?.category || ""));
  let best = null;

  for (const page of HANDBOOK_PAGES) {
    const text = String(page?.text || "");
    if (!text) continue;
    let score = 0;
    let bestKeyword = "";
    let bestIndex = -1;
    const normalizedPageText = normalizeSearchText(text);

    for (const keyword of keywords) {
      const normalizedKeyword = normalizeSearchText(keyword);
      if (!normalizedKeyword) continue;
      let localScore = 0;
      let localIndex = text.indexOf(keyword);

      if (localIndex >= 0) localScore = Math.max(localScore, 120 + keyword.length * 2);
      const normalizedIndex = normalizedPageText.indexOf(normalizedKeyword);
      if (normalizedIndex >= 0) localScore = Math.max(localScore, 90 + normalizedKeyword.length);
      if (tokenOverlap(keyword, text)) localScore = Math.max(localScore, 40 + commonTokenLength(keyword, text));

      if (localScore > score) {
        score = localScore;
        bestKeyword = keyword;
        bestIndex = localIndex >= 0 ? localIndex : normalizedIndex;
      }
    }

    if (!score) continue;
    if (isSignQuestion && (page.page >= 20 && page.page <= 31 || page.page >= 113 && page.page <= 123)) score += 18;
    if (isLawQuestion && page.page >= 32 && page.page <= 111) score += 10;
    if (/依圖示判斷/.test(String(question?.prompt || "")) && String(question?.answer || "") && text.includes(String(question.answer))) score += 40;
    if (/高速公路|快速公路|隧道|平交道/.test(String(question?.prompt || "") + String(question?.answer || "")) && page.page >= 47 && page.page <= 58) score += 14;
    if (/安全帶|安全座椅|安全帽/.test(String(question?.prompt || "") + String(question?.answer || "")) && page.page >= 58 && page.page <= 60) score += 12;

    const snippet = extractSnippetAround(text, bestKeyword || keywords[0] || "", bestIndex);
    const candidate = {
      page: page.page,
      title: page.title || "駕駛人手冊",
      text: snippet,
      keyword: bestKeyword || keywords[0] || "",
      score,
      kind: "manual-search"
    };
    if (!best || candidate.score > best.score) best = candidate;
  }

  return best && best.score >= 45 ? best : null;
}

function pickBestKeywordForRule(keywords, aliases) {
  for (const keyword of keywords) {
    if (aliases.some((alias) => keyword === alias || keyword.includes(alias) || alias.includes(keyword))) return keyword;
  }
  return keywords[0] || "";
}

function tokenOverlap(a, b) {
  const ta = splitTokens(a);
  const tb = splitTokens(b);
  return ta.some((token) => tb.includes(token));
}

function commonTokenLength(a, b) {
  const ta = splitTokens(a);
  const tb = splitTokens(b);
  return ta.filter((token) => tb.includes(token)).join("").length;
}

function splitTokens(text) {
  return String(text || "")
    .replace(/[「」：:()（）,，。；;／/、]/g, " ")
    .split(/\s+/)
    .filter((token) => token && token.length >= 2);
}

function normalizeSearchText(text) {
  return String(text || "").replace(/[「」：:()（）,，。；;／/\s、]/g, "");
}

function extractSnippetAround(text, keyword, indexHint = -1) {
  const source = String(text || "").trim();
  if (!source) return "";
  const keywordIndex = indexHint >= 0 ? indexHint : (keyword ? source.indexOf(keyword) : -1);
  if (keywordIndex >= 0) {
    const start = Math.max(0, keywordIndex - 60);
    const end = Math.min(source.length, keywordIndex + Math.max(150, keyword.length + 120));
    return trimSnippet(source.slice(start, end), start > 0, end < source.length);
  }
  return trimSnippet(source.slice(0, 220), false, source.length > 220);
}

function trimSnippet(text, hasPrefixEllipsis, hasSuffixEllipsis) {
  let snippet = String(text || "").replace(/\s+/g, " ").trim();
  if (snippet.length > 220) snippet = `${snippet.slice(0, 217).trim()}…`;
  if (hasPrefixEllipsis && !snippet.startsWith("…")) snippet = `…${snippet}`;
  if (hasSuffixEllipsis && !snippet.endsWith("…")) snippet = `${snippet}…`;
  return snippet;
}

function isStaticHandbookRelevant(exact, keywords, question) {
  const text = `${exact?.title || ""} ${exact?.text || ""}`;
  if (keywords.some((kw) => text.includes(kw))) return true;
  if (question?.answer && !["正確", "錯誤"].includes(question.answer) && text.includes(question.answer)) return true;
  return /警告標誌|禁制標誌|指示標誌|交通規則|安全駕駛/.test(text);
}

function buildOfficialFallbackExplanation(question, keywords) {
  const answer = String(question?.answer || "").trim();
  const sourceName = question?.source?.pdf ? "官方題庫重點" : "題目重點";
  const displayTerms = (keywords || []).filter((kw) => !isGenericKeyword(kw)).slice(0, 3);
  const keyLabel = displayTerms.join(" / ");
  if (!question) return null;

  if (question.kind === "true_false") {
    return {
      title: sourceName,
      text: `本題在官方題庫中的判定為「${answer || "未標示"}」。${keyLabel ? `可先從這些主題詞複習：${keyLabel}。` : "可先記住題幹描述與正確判定。"}`,
      kind: "official"
    };
  }

  if (answer) {
    return {
      title: sourceName,
      text: `本題正確答案是「${answer}」。${keyLabel ? `可優先檢查這些主題詞：${keyLabel}。` : "如手冊對應仍不夠清楚，可用下方按鈕直接搜尋此題。"}`,
      kind: "official"
    };
  }

  return null;
}

function buildLawBasisHtml(question) {
  const basis = Array.isArray(question?.lawBasis) ? question.lawBasis.filter(Boolean) : [];
  if (!basis.length) return "";
  const items = basis.map((item) => {
    const law = escapeHtml(item?.law || "");
    const article = escapeHtml(item?.article || "");
    const paragraph = escapeHtml(item?.paragraph || "");
    const note = escapeHtml(item?.note || item?.penaltyStandard || "");
    const head = [law, article, paragraph].filter(Boolean).join(" ");
    return `<li><strong>${head}</strong>${note ? `：${note}` : ""}</li>`;
  }).join("");
  return `
      <div class="feedback-explanation-block handbook-block law-basis-block">
        <div class="feedback-explanation-title">法規條文／裁罰基準</div>
        <ul style="margin:0; padding-left:1.1rem;">${items}</ul>
      </div>
    `;
}

function buildAnswerExplanationHtml(question) {
  const parts = [];
  const base = getBaseExplanationText(question);
  const keywords = extractQuestionKeywordCandidates(question);
  const jinguiQuestion = isJinguiQuestion(question);
  const handbook = jinguiQuestion ? null : getHandbookExplanation(question);
  const officialFallback = jinguiQuestion ? null : buildOfficialFallbackExplanation(question, keywords);
  const networkReference = jinguiQuestion ? "" : getNetworkReferenceAnswer(question);

  if (base) {
    parts.push(`
      <div class="feedback-explanation-block">
        <div class="feedback-explanation-title">題庫補充說明</div>
        <div>${formatExplanationText(base)}</div>
      </div>
    `);
  }

  if (networkReference) {
    parts.push(`
      <div class="feedback-explanation-block network-reference-block">
        <div class="feedback-explanation-title">網路搜到的參考答案</div>
        <div>${escapeHtml(networkReference)}</div>
        <small>註：此欄為整理後的網路參考說法，非官方標準答案，仍請以官方題庫、法規與手冊為準。</small>
      </div>
    `);
  }

  const lawBasisHtml = jinguiQuestion ? "" : buildLawBasisHtml(question);
  if (lawBasisHtml) parts.push(lawBasisHtml);

  if (handbook) {
    const safeKeyword = handbook.keyword && !isGenericKeyword(handbook.keyword) ? handbook.keyword : "";
    parts.push(`
      <div class="feedback-explanation-block handbook-block ${escapeAttr(handbook.kind || "manual")}">
        <div class="feedback-explanation-title">駕駛人手冊說明</div>
        ${safeKeyword ? `<div class="handbook-keyword">檢索詞：${escapeHtml(safeKeyword)}</div>` : ""}
        <div>${escapeHtml(handbook.text || "")}</div>
        <small>來源：駕駛人手冊 第 ${escapeHtml(String(handbook.page || "?"))} 頁 ・ ${escapeHtml(handbook.title || "相關章節")}</small>
      </div>
    `);
  }

  if (!handbook && officialFallback) {
    parts.push(`
      <div class="feedback-explanation-block handbook-block official">
        <div class="feedback-explanation-title">${escapeHtml(officialFallback.title)}</div>
        <div>${escapeHtml(officialFallback.text)}</div>
      </div>
    `);
  }

  if (!parts.length) {
    parts.push(`
      <div class="feedback-explanation-block handbook-block fallback">
        <div class="feedback-explanation-title">題目重點</div>
        <div>目前沒有自動對上的說明，你可以直接用下方按鈕把此題送到搜尋引擎查證。</div>
      </div>
    `);
  }

  parts.push(`
    <div class="answer-explanation-inline-note" style="margin-top:6px; color:var(--muted,#6b7280); font-size:12px; line-height:1.5;">
      <small>註：詳解僅供參考，請查官方。</small>
    </div>
  `);

  parts.push(`
    <div class="feedback-explanation-block handbook-block search-tool-block">
      <div class="search-tool-row">
        <button type="button" class="ghost-btn aux-btn verify-tool-btn" aria-expanded="false">搜尋此題</button>
        ${buildYizongSourceButtonHtml(question)}
        ${buildAiVerifyButtonsHtml(question)}
        ${buildAiVerifyCopyToggleHtml()}
        <span class="secondary-meta">AI 按鈕會依設定複製查證 prompt、暫停計時並外開頁面。</span>
      </div>
      ${buildVerifyToolDetailHtml(question)}
    </div>
  `);

  return `<div class="answer-explanation-stack">${parts.join("")}</div>`;
}

  function buildSourceMeta(question) {
    const sourcePage = question.source && question.source.page ? `PDF 第 ${question.source.page} 頁` : "來源頁未知";
    return [
      sourcePage,
      question.source?.signCode || "",
      question.source?.questionNo ? `題號 ${question.source.questionNo}` : "",
      question.source?.topicLabel || "",
    ].filter(Boolean).join(" / ");
  }

  function buildQuestionOriginLabel(question) {
    const source = question?.source || {};
    const sourceName = source.pdf ? String(source.pdf).replace(/\.pdf$/i, "") : "題庫來源未標示";
    const bits = [sourceName];
    if (source.questionNo) bits.push(`題號 ${source.questionNo}`);
    if (source.page) bits.push(`第 ${source.page} 頁`);
    if (source.classCode) bits.push(`分類 ${source.classCode}`);
    if (source.topicLabel) bits.push(source.topicLabel);
    return bits.join(" ／ ");
  }

  function resolveSelectedLabel(questionMode, selectedValue) {
    if (selectedValue === "__dont_know__") return "不會";
    if (selectedValue === "__timeout__") return "逾時未作答";
    if (questionMode === "textToImage") return getQuestion(selectedValue)?.answer || selectedValue;
    return normalizeTrueFalseOption(selectedValue);
  }

  function canonicalizeTrueFalseValue(value) {
    if (value === true) return "正確";
    if (value === false) return "錯誤";
    if (["○", "是", "正確"].includes(value)) return "正確";
    if (["X", "否", "錯誤"].includes(value)) return "錯誤";
    return value;
  }

  function getTrueFalseOptions(question) {
    const answerCanonical = canonicalizeTrueFalseValue(question?.answer);
    const optionCanonical = Array.isArray(question?.options)
      ? question.options.map(canonicalizeTrueFalseValue)
      : [];
    if (answerCanonical === "正確" || answerCanonical === "錯誤" || optionCanonical.includes("正確") || optionCanonical.includes("錯誤")) {
      return ["正確", "錯誤"];
    }
    return ["是", "否"];
  }

  function normalizeTrueFalseOption(value) {
    const canonical = canonicalizeTrueFalseValue(value);
    if (canonical === "正確" || canonical === "錯誤") return canonical;
    return value;
  }

  function applyScoreFilter(questions, operator, value) {
    if (!Array.isArray(questions)) return [];
    if (!operator || operator === "any") return questions.slice();
    const threshold = Number(value || 0);
    return questions.filter((q) => {
      const score = Number(questionProgress(q.id).score || 0);
      if (operator === "gt") return score > threshold;
      if (operator === "lt") return score < threshold;
      if (operator === "eq") return score === threshold;
      return true;
    });
  }

  function buildSessionEncouragement(scorePct, bestStreak, practiceMode) {
    if (practiceMode === "flashcard") {
      return bestStreak >= 10
        ? `這輪單字卡連續記得 ${bestStreak} 題，已經很接近穩定熟記。`
        : `單字卡適合快速掃過低分題；把不熟題反覆刷到正分區最有效。`;
    }
    if (scorePct >= 90) return `這組表現已經很穩，下一步應改用積分篩選，專打低分與零分題。`;
    if (scorePct >= 70) return `基礎已經有了，建議把「積分 < 1」作為篩選條件，集中補弱點。`;
    if (bestStreak >= 5) return `你已有一段連續答對，代表不是完全不會，接下來要縮小知識缺口。`;
    return `先不要追求刷很多題，先把低分題反覆做對，覆蓋率會上升得更快。`;
  }


function normalizeShortcutSetting(value, fallback) {
  const raw = String(value ?? fallback ?? "").trim();
  if (!raw) return fallback;
  const lowered = raw.toLowerCase();
  if (lowered === "enter") return "Enter";
  if (lowered === "space") return "Space";
  if (lowered === "arrowleft") return "ArrowLeft";
  if (lowered === "arrowright") return "ArrowRight";
  return raw.length === 1 ? raw : fallback;
}

function buildShortcutSummary() {
  return [
    `1:${settings.shortcutOption1 || "1"}`,
    `2:${settings.shortcutOption2 || "2"}`,
    `3:${settings.shortcutOption3 || "3"}`,
    `4:${settings.shortcutOption4 || "4"}`,
    `下一題:${settings.shortcutNext || "Enter"}`,
  ].join(" ｜ ");
}

function getOptionShortcutLabel(index) {
  return [settings.shortcutOption1 || "1", settings.shortcutOption2 || "2", settings.shortcutOption3 || "3", settings.shortcutOption4 || "4"][index] || String(index + 1);
}

function eventMatchesShortcut(event, shortcut) {
  if (!shortcut) return false;
  const expected = normalizeShortcutSetting(shortcut, shortcut);
  if (expected === "Space") return event.code === "Space" || event.key === " ";
  return String(event.key || "").toLowerCase() === String(expected).toLowerCase();
}

function handleGlobalShortcuts(event) {
  const target = event.target;
  const tag = target?.tagName?.toLowerCase();
  if (tag === "input" || tag === "select" || tag === "textarea" || target?.isContentEditable) return;
  if (!session || !session.queue?.length) return;

  if (event.key === "Escape") {
    event.preventDefault();
    confirmExitCurrentMode();
    return;
  }
  if (event.code === "Space" || event.key === " ") {
    event.preventDefault();
    togglePauseResume();
    return;
  }

  const practiceMode = session.filters?.practiceMode || "practice";
  if (practiceMode === "flashcard") {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPreviousFlashcard();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToNextFlashcardWithoutGrading();
      return;
    }
    if (eventMatchesShortcut(event, settings.shortcutNext || "Enter")) {
      const flipBtn = document.getElementById("flipBtn");
      if (flipBtn) {
        event.preventDefault();
        flipBtn.click();
      }
    }
    return;
  }

  const current = currentQuestion();
  if (!current) return;
  const alreadyAnswered = !!session.answeredMap[current.id];
  if (alreadyAnswered) {
    if (eventMatchesShortcut(event, settings.shortcutNext || "Enter")) {
      const nextBtn = document.getElementById("nextBtn");
      if (nextBtn) {
        event.preventDefault();
        nextBtn.click();
      }
    }
    return;
  }

  const optionButtons = Array.from(document.querySelectorAll("#optionList .option-btn, #optionList .image-option-btn"));
  const shortcuts = [settings.shortcutOption1, settings.shortcutOption2, settings.shortcutOption3, settings.shortcutOption4];
  const matchedIndex = shortcuts.findIndex((shortcut) => eventMatchesShortcut(event, shortcut));
  if (matchedIndex >= 0 && optionButtons[matchedIndex]) {
    event.preventDefault();
    optionButtons[matchedIndex].click();
  }
}


function loadImageIssues() {
  try {
    return JSON.parse(localStorage.getItem(IMAGE_ISSUES_KEY) || "{}");
  } catch {
    return {};
  }
}

function saveImageIssues() {
  try {
    localStorage.setItem(IMAGE_ISSUES_KEY, JSON.stringify(imageIssues || {}));
  } catch (error) {
    console.warn("saveImageIssues failed", error);
  }
}

function imageReviewQuestions() {
  const scope = getSelectedScope();
  const category = els.categorySelect?.value || "all";
  return getScopedQuestions(scope)
    .filter((q) => q.image)
    .filter((q) => category === "all" ? true : q.category === category)
    .sort((a, b) => {
      const sa = a.source || {};
      const sb = b.source || {};
      const pa = Number(sa.page || 0);
      const pb = Number(sb.page || 0);
      if (pa !== pb) return pa - pb;
      const qa = Number(sa.questionNo || 0);
      const qb = Number(sb.questionNo || 0);
      return qa - qb || String(a.id).localeCompare(String(b.id));
    });
}

function renderImageReview() {
  clearAllTimers();
  setQuizChromeMode("imageReview");
  const list = imageReviewQuestions();
  const scope = getSelectedScope();
  els.mainContent.className = "panel quiz-panel exam-active";
  if (!list.length) {
    els.mainContent.innerHTML = `<div class="empty-state">目前這個範圍 / 分類下沒有可檢視的圖片題。</div>`;
    return;
  }
  els.mainContent.innerHTML = `
    <div class="review-header">
      <h2>圖示檢視模式</h2>
      <p>依目前範圍與分類展開顯示圖片、題目、正確答案，可勾選有問題的題號後匯出回報。</p>
    </div>
    <div class="actions compact">
      <span class="badge accent-badge">${escapeHtml(EXAM_SCOPE_LABELS[scope] || scope)}</span>
      <span class="badge">共 ${list.length} 題圖片題</span>
      <button id="exportImageIssuesBtn" class="secondary-btn">匯出已標記題號</button>
      <button id="clearImageIssuesBtn" class="ghost-btn">清除所有圖示標記</button>
    </div>
    <div class="image-review-grid">
      ${list.map((q) => {
        const src = q.source || {};
        const issue = imageIssues[q.id] || {};
        const titleBits = [
          src.questionNo ? `題號 ${src.questionNo}` : q.id,
          src.pdf ? src.pdf.replace(/\.pdf$/i, "") : "",
          src.page ? `第 ${src.page} 頁` : ""
        ].filter(Boolean).join(" ・ ");
        return `
          <div class="image-review-card">
            <div class="image-review-top">
              <div class="image-review-title">${escapeHtml(titleBits)}</div>
              <label class="issue-check"><input type="checkbox" data-issue-id="${escapeAttr(q.id)}" ${issue.flag ? "checked" : ""}> 標記有問題</label>
            </div>
            <div class="image-review-body">
              <img class="image-review-thumb" src="${escapeAttr(q.image)}" alt="${escapeAttr(q.answer)}">
              <div class="image-review-main">
                <div class="wrong-item-title">${escapeHtml(buildQuestionPreview(q))}</div>
                ${buildOptionPreview(q) ? `<div class="wrong-item-note">選項：${escapeHtml(buildOptionPreview(q))}</div>` : ""}
                <div class="wrong-item-note">正確答案：${escapeHtml(q.answer)}</div>
                <input class="issue-note-input" data-issue-note-id="${escapeAttr(q.id)}" type="text" value="${escapeAttr(issue.note || "")}" placeholder="可選填：例如圖片抓錯、圖與題不符">
              </div>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
  Array.from(els.mainContent.querySelectorAll("[data-issue-id]")).forEach((node) => {
    node.addEventListener("change", () => {
      const id = node.dataset.issueId;
      imageIssues[id] = imageIssues[id] || {};
      imageIssues[id].flag = !!node.checked;
      saveImageIssues();
    });
  });
  Array.from(els.mainContent.querySelectorAll("[data-issue-note-id]")).forEach((node) => {
    node.addEventListener("change", () => {
      const id = node.dataset.issueNoteId;
      imageIssues[id] = imageIssues[id] || {};
      imageIssues[id].note = String(node.value || "").trim();
      saveImageIssues();
    });
  });
  document.getElementById("exportImageIssuesBtn")?.addEventListener("click", exportImageIssues);
  document.getElementById("clearImageIssuesBtn")?.addEventListener("click", () => {
    if (!confirm("確定要清除所有圖示標記嗎？")) return;
    imageIssues = {};
    saveImageIssues();
    renderImageReview();
  });
}

function exportImageIssues() {
  const payload = imageReviewQuestions()
    .filter((q) => imageIssues[q.id]?.flag || String(imageIssues[q.id]?.note || "").trim())
    .map((q) => ({
      id: q.id,
      questionNo: q.source?.questionNo || "",
      page: q.source?.page || "",
      pdf: q.source?.pdf || "",
      prompt: buildQuestionPreview(q),
      answer: q.answer,
      note: String(imageIssues[q.id]?.note || "").trim()
    }));
  if (!payload.length) {
    alert("目前沒有已標記的圖示題。");
    return;
  }
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `image-issues-${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

function buildQuestionPreview(question) {
  const prompt = String(question?.prompt || "").replace(/^依圖示判斷，?/, "依圖示判斷：");
  if (prompt) return truncateText(prompt, 150);
  return truncateText(String(question?.answer || ""), 110);
}

function buildOptionPreview(question) {
  if (Array.isArray(question?.options) && question.options.length) return question.options.join(" / ");
  if (question?.kind === "true_false") return getTrueFalseOptions(question).join(" / ");
  return "";
}

function truncateText(text, maxLen = 80) {
  const raw = String(text || "").replace(/\s+/g, " ").trim();
  return raw.length > maxLen ? `${raw.slice(0, maxLen - 1)}…` : raw;
}

  function shuffle(arr) {
    const copy = arr.slice();
    for (let i = copy.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function unique(arr) {
    return Array.from(new Set(arr));
  }

  function formatSignedNumber(value) {
    const num = Number(value || 0);
    return num > 0 ? `+${num}` : String(num);
  }

  function formatSeconds(value) {
    const num = Math.max(0, Number(value || 0));
    return num >= 10 ? `${num.toFixed(0)} 秒` : `${num.toFixed(1)} 秒`;
  }

  function sanitizeInteger(value, fallback = 0) {
    const num = Number.parseInt(value, 10);
    return Number.isFinite(num) ? num : fallback;
  }

  function sanitizeNonNegativeNumber(value, fallback = 0) {
    const num = Number.parseFloat(value);
    return Number.isFinite(num) && num >= 0 ? num : fallback;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function escapeAttr(value) {
    return escapeHtml(value);
  }

  function isSessionInProgress() {
    return !!(session && Array.isArray(session.queue) && session.queue.length && Number(session.index || 0) < session.queue.length && document.body.classList.contains("quiz-mode-active") && hasVisibleQuestionUi());
  }

  window.addEventListener("pageshow", () => {
    try {
      ensureCriticalBindings();
      renderSessionOrEmpty();
    } catch (err) {
      console.error("pageshow rebind failed", err);
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible") return;
    try {
      ensureCriticalBindings();
    } catch (err) {
      console.error("visibilitychange rebind failed", err);
    }
  });

  window.DriverQuizApp = {
    startSessionFromControls,
    renderSessionOrEmpty,
    ensureCriticalBindings,
  };

  window.DriverQuizMemory = {
    buildPayload: buildFullMemoryPayload,
    applyPayload: applyFullMemoryPayload,
    askImportMode: askFullMemoryImportMode,
    flattenScores: flattenScoreDistribution,
    restorePreImportSnapshot,
    getAnsweredCount: () => Number(progress?.meta?.totalAnswered || 0),
    isSessionInProgress,
  };
})();
