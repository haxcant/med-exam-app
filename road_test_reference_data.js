window.ROAD_TEST_REFERENCE = {
  "version": "2026-04-11-roadtest-v2-caption-direct-final",
  "sourcePriority": [
    "captions.sbv",
    "道路考試參考圖片轉文字檔案.txt"
  ],
  "defaults": {
    "clipLeadSeconds": 1.0,
    "clipLagSeconds": 1.0
  },
  "notes": [
    "答案優先以 captions.sbv 為主，文字檔僅作補充整理與通則抽取。",
    "所有轉彎處都要打方向燈，並口誦【左右無來車，後方無來車】。",
    "所有停車再開的地方，都要口誦【左右無來車】。",
    "在行人穿越道，需要口誦【左右無行人】。",
    "後照鏡向外看45度以內看得到；超過45度稱為視線死角，需轉頭確認。",
    "本版維持字幕對照為主，將單獨成段但意義較弱的 B柱 提醒併入相鄰字幕段落。"
  ],
  "microSkills": [
    {
      "id": "left_signal",
      "title": "左方向燈使用模組",
      "summary": "凡起步、左轉、迴轉、由路邊切回主線、往左變換車道時，優先考慮左方向燈。",
      "useCases": [
        "起步",
        "左轉",
        "迴轉",
        "切入主線道",
        "往左變換車道"
      ],
      "coreSequence": [
        "先打左方向燈",
        "再做左右/後方安全確認",
        "必要時轉頭看到B柱",
        "確認安全後再起步或變換"
      ],
      "spokenExamples": [
        "【準備起步，打D檔，放手煞車】",
        "【進行變換車道，後方無來車】"
      ],
      "linkedModules": [
        "start_and_initial_turns",
        "resume_and_left_lane_change",
        "u_turn_sequence",
        "signalized_left_turn_to_slow_lane"
      ]
    },
    {
      "id": "right_signal",
      "title": "右方向燈使用模組",
      "summary": "凡右轉、右切車道、靠邊臨停、回到終點調整停車位置時，優先考慮右方向燈。",
      "useCases": [
        "右轉",
        "往右變換車道",
        "路邊臨時停車",
        "回終點找停車位"
      ],
      "coreSequence": [
        "先打右方向燈",
        "前方路口減速查看",
        "確認左右無來車與後方無來車",
        "必要時看左後方並轉頭看到B柱"
      ],
      "spokenExamples": [
        "【前方路口減速查看，進行變換車道】",
        "【前方路口減速查看，進行路邊臨時停車，左右無來車，後方無來車】"
      ],
      "linkedModules": [
        "start_and_initial_turns",
        "lane_change_fast_to_slow",
        "roadside_temporary_stop",
        "return_and_finish_stop"
      ]
    },
    {
      "id": "b_pillar_check",
      "title": "B柱轉頭確認",
      "summary": "凡牽涉變換車道、切入主線、靠邊臨停、起步後再切線等動作，都強調轉頭看到B柱。",
      "useCases": [
        "變換車道",
        "切回主線",
        "靠邊停車",
        "號誌起步後左轉"
      ],
      "coreSequence": [
        "頭部明顯轉動",
        "視線帶到B柱",
        "確認死角無車後再執行"
      ],
      "spokenExamples": [
        "【後方無來車】"
      ],
      "linkedModules": [
        "lane_change_fast_to_slow",
        "roadside_temporary_stop",
        "resume_and_left_lane_change",
        "signalized_left_turn_to_slow_lane"
      ]
    },
    {
      "id": "intersection_scan",
      "title": "路口減速查看",
      "summary": "幾乎所有路口前都要減速、左右查看並口誦左右無來車。",
      "useCases": [
        "直行通過路口",
        "右轉前",
        "左轉前",
        "迴轉前",
        "號誌路口起步前"
      ],
      "coreSequence": [
        "減速",
        "左右擺頭",
        "必要時加看後方",
        "口誦左右無來車"
      ],
      "spokenExamples": [
        "【前方路口減速查看】",
        "【左右無來車】"
      ],
      "linkedModules": [
        "start_and_initial_turns",
        "straight_intersection_checks",
        "u_turn_sequence",
        "post_uturn_speed_and_centering",
        "signalized_left_turn_to_slow_lane"
      ]
    },
    {
      "id": "lane_centering_and_speed",
      "title": "車道置中與速度控制",
      "summary": "路考中不只要做動作，還要保持車身在車道中央，特定路段速度約40且不可超過44。",
      "useCases": [
        "一般直線路段",
        "迴轉後直線",
        "標示40路段"
      ],
      "coreSequence": [
        "注意左右車道線間距",
        "不要壓線",
        "速度維持約40公里",
        "標示40路段最高不超過44公里"
      ],
      "spokenExamples": [],
      "linkedModules": [
        "straight_intersection_checks",
        "post_uturn_speed_and_centering"
      ]
    },
    {
      "id": "two_stage_door",
      "title": "兩段式開車門",
      "summary": "上車與下車都可拆成先短開門、再次觀察、再完全開門的固定流程。",
      "useCases": [
        "上車前",
        "收車下車"
      ],
      "coreSequence": [
        "先觀察左右或後方",
        "短開約15公分",
        "再次觀察",
        "確認安全後再完成開門/下車"
      ],
      "spokenExamples": [
        "【兩段式開車門】",
        "【左右無來車】",
        "【後方無來車】"
      ],
      "linkedModules": [
        "two_stage_door_entry",
        "return_and_finish_stop"
      ]
    }
  ],
  "modules": [
    {
      "id": "vehicle_exterior_check",
      "title": "車外安全檢查",
      "segmentRange": [
        1,
        6
      ],
      "summary": "依逆時針方向完成四輪、燈具與車底檢查，建立固定巡檢順序。",
      "keyActions": [
        "左前輪開始巡檢",
        "輪胎口誦胎紋/胎壓正常",
        "車頭/車尾查看燈具無破損",
        "每側必要時蹲下查看車底無異物"
      ],
      "spokenCore": [
        "【胎紋、胎壓正常】",
        "【車燈無破損】",
        "【車底無異物】"
      ],
      "tags": [
        "precheck",
        "exterior",
        "tires",
        "lights",
        "underbody"
      ]
    },
    {
      "id": "two_stage_door_entry",
      "title": "兩段式開車門上車",
      "segmentRange": [
        7,
        8
      ],
      "summary": "先短開門再複查，確認左右無來車後再開至上車角度。",
      "keyActions": [
        "先看左再看右",
        "車門先開約15公分",
        "身體不轉動再次觀察左右",
        "確認安全後開至約45度上車"
      ],
      "spokenCore": [
        "【兩段式開車門】",
        "【左右無來車】"
      ],
      "tags": [
        "entry",
        "door",
        "safety"
      ]
    },
    {
      "id": "cockpit_setup_and_engine_start",
      "title": "車內調整與發動前檢查",
      "segmentRange": [
        9,
        16
      ],
      "summary": "完成座椅鏡面與安全帶設定，再做紅火、儀表板、煞車與方向燈確認。",
      "keyActions": [
        "調整座椅/椅背/頭枕",
        "調整中央與左右後照鏡",
        "繫上安全帶",
        "確認P檔與手煞車",
        "開啟紅火觀察儀表",
        "踩煞車發動引擎",
        "測試煞車與左右方向燈"
      ],
      "spokenCore": [
        "【繫上安全帶】",
        "【確定檔位在P檔、手煞車已拉起】",
        "【開啟紅火】",
        "【引擎發動：儀表板正常】",
        "【試踩煞車：煞車正常】",
        "【試打左右方向燈：方向燈正常】"
      ],
      "tags": [
        "cockpit",
        "engine_start",
        "dashboard",
        "mirrors",
        "seatbelt"
      ]
    },
    {
      "id": "start_and_initial_turns",
      "title": "起步與前段轉彎",
      "segmentRange": [
        17,
        23
      ],
      "summary": "左方向燈起步、完成起駛觀察後右轉，再於下一路口左轉切入快車道。",
      "keyActions": [
        "左方向燈起步",
        "打D檔放手煞車",
        "轉頭查看前後左右",
        "右轉前減速查看",
        "右轉後補打左方向燈",
        "左轉走快車道並留意雙黃線"
      ],
      "spokenCore": [
        "【準備起步，打D檔，放手煞車】",
        "【左右無來車，後方無來車】",
        "【前方路口減速查看】"
      ],
      "tags": [
        "start",
        "left_signal",
        "right_turn",
        "left_turn",
        "fast_lane"
      ]
    },
    {
      "id": "lane_change_fast_to_slow",
      "title": "快車道切慢車道",
      "segmentRange": [
        24,
        26
      ],
      "summary": "右方向燈加口誦後確認後方，轉頭看到B柱再由快車道切入慢車道。",
      "keyActions": [
        "先打右方向燈",
        "口誦變換車道與安全確認",
        "轉頭時需看到B柱",
        "完成後穩定在慢車道中央"
      ],
      "spokenCore": [
        "【前方路口減速查看，進行變換車道】",
        "【左右無來車，後方無來車】"
      ],
      "tags": [
        "lane_change",
        "right_signal",
        "b_pillar",
        "slow_lane"
      ]
    },
    {
      "id": "roadside_temporary_stop",
      "title": "路邊臨時停車",
      "segmentRange": [
        27,
        35
      ],
      "summary": "右方向燈靠邊，確認後方與邊線距離，停妥後P檔與手煞車完成臨停。",
      "keyActions": [
        "右方向燈並再次檢查",
        "看左後方確認後方無來車",
        "頭需看到B柱",
        "車身靠近邊線但不可壓線",
        "停妥後打P檔拉手煞車",
        "放鬆腳煞車確認不滑動"
      ],
      "spokenCore": [
        "【前方路口減速查看，左右無來車，後方無來車】",
        "【前方路口減速查看，進行路邊臨時停車，左右無來車，後方無來車】",
        "【打P檔、拉手煞車】",
        "【路邊臨時停車完畢】"
      ],
      "tags": [
        "temporary_stop",
        "roadside",
        "right_signal",
        "parking_brake"
      ]
    },
    {
      "id": "resume_and_left_lane_change",
      "title": "由路邊切回主線並左切車道",
      "segmentRange": [
        36,
        39
      ],
      "summary": "左方向燈起步回主線，看到B柱後再左切變換車道。",
      "keyActions": [
        "踩煞車後打左方向燈",
        "打D檔放手煞車切回主線",
        "頭需看到B柱後起步",
        "再次左方向燈進行變換車道"
      ],
      "spokenCore": [
        "【切入主線道，打D檔，放手煞車，後方無來車】",
        "【進行變換車道，後方無來車】"
      ],
      "tags": [
        "resume",
        "left_signal",
        "merge",
        "lane_change",
        "b_pillar"
      ]
    },
    {
      "id": "straight_intersection_checks",
      "title": "直線行駛與路口減速查看",
      "segmentRange": [
        40,
        44
      ],
      "summary": "連續通過路口前都要減速查看，直線段保持車身與車道線間距。",
      "keyActions": [
        "每個路口前都減速查看",
        "口誦左右無來車",
        "留意兩側照後鏡與車身位置",
        "不可壓左右車道線"
      ],
      "spokenCore": [
        "【左右無來車】"
      ],
      "tags": [
        "straight",
        "intersection",
        "scan",
        "lane_centering"
      ]
    },
    {
      "id": "u_turn_sequence",
      "title": "迴轉流程",
      "segmentRange": [
        45,
        48
      ],
      "summary": "左方向燈配合路口減速查看，定點後迅速操作方向盤，迴轉後走外側車道。",
      "keyActions": [
        "左方向燈",
        "前方路口減速查看",
        "確認左右無來車",
        "到定點後迅速轉動方向盤",
        "迴轉後走外側車道"
      ],
      "spokenCore": [
        "【前方路口減速查看】",
        "【左右無來車】"
      ],
      "tags": [
        "u_turn",
        "left_signal",
        "outer_lane"
      ]
    },
    {
      "id": "post_uturn_speed_and_centering",
      "title": "迴轉後控速與置中",
      "segmentRange": [
        49,
        56
      ],
      "summary": "迴轉後保持在車道中央，避免壓線，並將車速維持在約40公里。",
      "keyActions": [
        "保持車道中央",
        "任何一側邊線都不可壓到",
        "多次路口減速查看",
        "速度約40公里",
        "標示40路段最高不超過44公里"
      ],
      "spokenCore": [
        "【前方路口減速查看】",
        "【左右無來車】"
      ],
      "tags": [
        "speed_control",
        "lane_centering",
        "intersection"
      ]
    },
    {
      "id": "signalized_left_turn_to_slow_lane",
      "title": "號誌路口左轉回慢車道",
      "segmentRange": [
        57,
        61
      ],
      "summary": "路口前打左方向燈，等待號誌後起步要左右擺頭，左轉後直接走慢車道並留意左後方插入車。",
      "keyActions": [
        "路口前打左方向燈",
        "等紅綠燈起步前做左右擺頭",
        "第一台更要明顯確認",
        "頭需看到B柱",
        "左轉後直接走慢車道",
        "注意左後方可能插入的車輛"
      ],
      "spokenCore": [
        "【前方路口減速查看】",
        "【左右無來車】",
        "【左右無來車，後方無來車】"
      ],
      "tags": [
        "traffic_light",
        "left_turn",
        "slow_lane",
        "b_pillar"
      ]
    },
    {
      "id": "return_and_finish_stop",
      "title": "回起終點與收車",
      "segmentRange": [
        62,
        71
      ],
      "summary": "回到起終點區域後依序停正、收車、兩段式開門下車並關門。",
      "keyActions": [
        "持續路口減速查看",
        "依需要打右或左方向燈調整位置",
        "回到起終點找空位停正",
        "P檔/手煞車/關風扇/關AC/熄火",
        "解開安全帶椅子退後",
        "先看後照鏡再探頭看後方",
        "兩段式開門下車",
        "最後關上車門"
      ],
      "spokenCore": [
        "【打右方向燈,左右無來車,後方無來車】",
        "【後方無來車】",
        "【左右無來車】"
      ],
      "tags": [
        "finish",
        "parking",
        "shutdown",
        "exit_vehicle"
      ]
    },
    {
      "id": "exam_general_rules",
      "title": "通用口訣與評分提醒",
      "segmentRange": [],
      "summary": "從補充文字整理出的通用規則，適合拿來出規則題。",
      "keyActions": [
        "所有轉彎都要打方向燈並口誦左右無來車後方無來車",
        "所有停車再開都要口誦左右無來車",
        "行人穿越道要口誦左右無行人",
        "超過45度死角必須轉頭觀察"
      ],
      "spokenCore": [
        "【左右無來車，後方無來車】",
        "【左右無來車】",
        "【左右無行人】"
      ],
      "tags": [
        "general_rules",
        "mnemonic",
        "grading"
      ]
    }
  ],
  "quizBlueprints": [
    {
      "id": "qb-signal-left-right",
      "type": "single_choice",
      "prompt": "此動作應打哪一側方向燈？",
      "answerRule": "依模組判斷左/右方向燈",
      "optionsHint": [
        "左方向燈",
        "右方向燈",
        "不用打方向燈",
        "雙黃燈"
      ]
    },
    {
      "id": "qb-callout",
      "type": "single_choice",
      "prompt": "此段應口誦哪句重點？",
      "answerRule": "以字幕口誦內容為準",
      "optionsHint": [
        "左右無來車",
        "後方無來車",
        "胎紋胎壓正常",
        "路邊臨時停車完畢"
      ]
    },
    {
      "id": "qb-observation-target",
      "type": "single_choice",
      "prompt": "此動作主要要確認哪個方向或位置？",
      "answerRule": "從字幕與模組擷取，例如左右、後方、B柱、車道線",
      "optionsHint": [
        "左右來車",
        "後方來車",
        "B柱死角",
        "車道邊線"
      ]
    },
    {
      "id": "qb-sequence",
      "type": "single_choice",
      "prompt": "此段正確動作順序為何？",
      "answerRule": "依字幕順序出題，例如打燈→觀察→換檔→放手煞車",
      "optionsHint": [
        "打燈→觀察→動作",
        "先動作再觀察",
        "只觀察不打燈",
        "直接加速"
      ]
    },
    {
      "id": "qb-speed-limit",
      "type": "single_choice",
      "prompt": "此路段速度控制重點是什麼？",
      "answerRule": "若字幕提到40公里或不超過44公里，優先出速限題",
      "optionsHint": [
        "約40公里",
        "可超過50公里",
        "愈慢愈好",
        "不限速度"
      ]
    }
  ],
  "segments": [
    {
      "index": 1,
      "id": "road-seg-001",
      "startSec": 0.66,
      "endSec": 5.66,
      "captionText": "(車輛檢查)從左前輪開始， 雙手壓輪胎，口誦【胎紋、胎壓正常】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 0.0,
      "clipEndSec": 6.66,
      "answerText": "(車輛檢查)從左前輪開始， 雙手壓輪胎，口誦【胎紋、胎壓正常】",
      "tags": [
        "tire_check"
      ]
    },
    {
      "index": 2,
      "id": "road-seg-002",
      "startSec": 5.66,
      "endSec": 10.766,
      "captionText": "查看左右車燈，【車燈無破損】 蹲下看車底，【車底無異物】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 4.66,
      "clipEndSec": 11.766,
      "answerText": "查看左右車燈，【車燈無破損】 蹲下看車底，【車底無異物】",
      "tags": [
        "light_check",
        "underbody_check"
      ]
    },
    {
      "index": 3,
      "id": "road-seg-003",
      "startSec": 10.766,
      "endSec": 20.0,
      "captionText": "檢查右前輪，雙手壓輪胎， 【胎紋、胎壓正常】 蹲下【車底無異物】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 9.766,
      "clipEndSec": 21.0,
      "answerText": "檢查右前輪，雙手壓輪胎， 【胎紋、胎壓正常】 蹲下【車底無異物】",
      "tags": [
        "tire_check",
        "underbody_check"
      ]
    },
    {
      "index": 4,
      "id": "road-seg-004",
      "startSec": 20.0,
      "endSec": 25.836,
      "captionText": "檢查右後輪，【胎紋、胎壓正常】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 19.0,
      "clipEndSec": 26.836,
      "answerText": "檢查右後輪，【胎紋、胎壓正常】",
      "tags": [
        "tire_check"
      ]
    },
    {
      "index": 5,
      "id": "road-seg-005",
      "startSec": 25.836,
      "endSec": 31.955,
      "captionText": "檢查左右車燈，【車燈無破損】； 蹲下看車底，【車底無異物】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 24.836,
      "clipEndSec": 32.955,
      "answerText": "檢查左右車燈，【車燈無破損】； 蹲下看車底，【車底無異物】",
      "tags": [
        "light_check",
        "underbody_check"
      ]
    },
    {
      "index": 6,
      "id": "road-seg-006",
      "startSec": 31.955,
      "endSec": 36.696,
      "captionText": "檢查左後輪，【胎紋、胎壓正常】； 蹲下看車底，【車底無異物】",
      "moduleId": "vehicle_exterior_check",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 30.955,
      "clipEndSec": 37.696,
      "answerText": "檢查左後輪，【胎紋、胎壓正常】； 蹲下看車底，【車底無異物】",
      "tags": [
        "tire_check",
        "underbody_check"
      ]
    },
    {
      "index": 7,
      "id": "road-seg-007",
      "startSec": 36.696,
      "endSec": 44.169,
      "captionText": "口誦【兩段式開車門】先看左、看右，確認【左右無來車】",
      "moduleId": "two_stage_door_entry",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 35.696,
      "clipEndSec": 45.169,
      "answerText": "口誦【兩段式開車門】先看左、看右，確認【左右無來車】",
      "tags": [
        "safe_left_right"
      ]
    },
    {
      "index": 8,
      "id": "road-seg-008",
      "startSec": 44.169,
      "endSec": 54.177,
      "captionText": "車門先開約15公分，身體不轉動， 再看左、看右確認【左右無來車】後， 再開至約45度上車",
      "moduleId": "two_stage_door_entry",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 43.169,
      "clipEndSec": 55.177,
      "answerText": "車門先開約15公分，身體不轉動， 再看左、看右確認【左右無來車】後， 再開至約45度上車",
      "tags": [
        "safe_left_right"
      ]
    },
    {
      "index": 9,
      "id": "road-seg-009",
      "startSec": 54.177,
      "endSec": 65.19,
      "captionText": "車內：口誦【調整座椅】【調整椅背】【調整頭枕】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 53.177,
      "clipEndSec": 66.19,
      "answerText": "車內：口誦【調整座椅】【調整椅背】【調整頭枕】",
      "tags": []
    },
    {
      "index": 10,
      "id": "road-seg-010",
      "startSec": 65.19,
      "endSec": 83.033,
      "captionText": "【繫上安全帶】【調整中央後照鏡、左右後照鏡】【確定檔位在P檔、手煞車已拉起】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 64.19,
      "clipEndSec": 84.033,
      "answerText": "【繫上安全帶】【調整中央後照鏡、左右後照鏡】【確定檔位在P檔、手煞車已拉起】",
      "tags": [
        "gear_p",
        "hand_brake"
      ]
    },
    {
      "index": 11,
      "id": "road-seg-011",
      "startSec": 83.033,
      "endSec": 89.773,
      "captionText": "鑰匙往外轉【開啟紅火】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 82.033,
      "clipEndSec": 90.773,
      "answerText": "鑰匙往外轉【開啟紅火】",
      "tags": [
        "ignition_on"
      ]
    },
    {
      "index": 12,
      "id": "road-seg-012",
      "startSec": 89.773,
      "endSec": 101.697,
      "captionText": "【油量、溫度、引擎、電瓶、手煞車燈、機油 正常】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 88.773,
      "clipEndSec": 102.697,
      "answerText": "【油量、溫度、引擎、電瓶、手煞車燈、機油 正常】",
      "tags": [
        "hand_brake"
      ]
    },
    {
      "index": 13,
      "id": "road-seg-013",
      "startSec": 101.697,
      "endSec": 107.723,
      "captionText": "踩煞車、發動引擎，口誦 【引擎發動：儀表板正常】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 100.697,
      "clipEndSec": 108.723,
      "answerText": "踩煞車、發動引擎，口誦 【引擎發動：儀表板正常】",
      "tags": [
        "engine_start"
      ]
    },
    {
      "index": 14,
      "id": "road-seg-014",
      "startSec": 107.723,
      "endSec": 112.89,
      "captionText": "開風扇 開AC； (發動後只會剩手煞車燈亮著)",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 106.723,
      "clipEndSec": 113.89,
      "answerText": "開風扇 開AC； (發動後只會剩手煞車燈亮著)",
      "tags": [
        "hand_brake"
      ]
    },
    {
      "index": 15,
      "id": "road-seg-015",
      "startSec": 112.89,
      "endSec": 117.89,
      "captionText": "口誦【試踩煞車：煞車正常】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 111.89,
      "clipEndSec": 118.89,
      "answerText": "口誦【試踩煞車：煞車正常】",
      "tags": []
    },
    {
      "index": 16,
      "id": "road-seg-016",
      "startSec": 117.89,
      "endSec": 123.89,
      "captionText": "口誦【試打左右方向燈：方向燈正常】",
      "moduleId": "cockpit_setup_and_engine_start",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 116.89,
      "clipEndSec": 124.89,
      "answerText": "口誦【試打左右方向燈：方向燈正常】",
      "tags": [
        "right_signal"
      ]
    },
    {
      "index": 17,
      "id": "road-seg-017",
      "startSec": 123.89,
      "endSec": 131.835,
      "captionText": "打左方向燈，口誦【準備起步，打D檔，放手煞車】",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 122.89,
      "clipEndSec": 132.835,
      "answerText": "打左方向燈，口誦【準備起步，打D檔，放手煞車】",
      "tags": [
        "left_signal",
        "gear_d",
        "hand_brake"
      ]
    },
    {
      "index": 18,
      "id": "road-seg-018",
      "startSec": 131.835,
      "endSec": 144.424,
      "captionText": "起駛前轉頭查看前後左右， 口誦【左右無來車，後方無來車】",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 130.835,
      "clipEndSec": 145.424,
      "answerText": "起駛前轉頭查看前後左右， 口誦【左右無來車，後方無來車】",
      "tags": [
        "safe_left_right",
        "rear_clear"
      ]
    },
    {
      "index": 19,
      "id": "road-seg-019",
      "startSec": 149.46,
      "endSec": 154.632,
      "captionText": "方向燈回正，打右邊方向燈",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 148.46,
      "clipEndSec": 155.632,
      "answerText": "方向燈回正，打右邊方向燈",
      "tags": []
    },
    {
      "index": 20,
      "id": "road-seg-020",
      "startSec": 154.632,
      "endSec": 158.551,
      "captionText": "前方路口減速查看；",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 153.632,
      "clipEndSec": 159.551,
      "answerText": "前方路口減速查看；",
      "tags": [
        "intersection_scan"
      ]
    },
    {
      "index": 21,
      "id": "road-seg-021",
      "startSec": 158.551,
      "endSec": 176.8,
      "captionText": "(行駛時出入都靠大門左側)",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 157.551,
      "clipEndSec": 177.8,
      "answerText": "(行駛時出入都靠大門左側)",
      "tags": []
    },
    {
      "index": 22,
      "id": "road-seg-022",
      "startSec": 176.8,
      "endSec": 184.328,
      "captionText": "【左右無來車、後方無來車】 右轉後打左方向燈",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 175.8,
      "clipEndSec": 185.328,
      "answerText": "【左右無來車、後方無來車】 右轉後打左方向燈",
      "tags": [
        "left_signal",
        "safe_left_right",
        "rear_clear"
      ]
    },
    {
      "index": 23,
      "id": "road-seg-023",
      "startSec": 184.328,
      "endSec": 198.949,
      "captionText": "【前方路口減速查看,左右無來車】； 左轉走快車道 此路口需特別注意雙黃線",
      "moduleId": "start_and_initial_turns",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 183.328,
      "clipEndSec": 199.949,
      "answerText": "【前方路口減速查看,左右無來車】； 左轉走快車道 此路口需特別注意雙黃線",
      "tags": [
        "safe_left_right",
        "intersection_scan",
        "fast_lane"
      ]
    },
    {
      "index": 24,
      "id": "road-seg-024",
      "startSec": 198.949,
      "endSec": 221.487,
      "captionText": "打右方向燈 【前方路口減速查看，進行變換車道】 【左右無來車，後方無來車】； 由快車道切換至慢車道，轉頭時需看到B柱",
      "moduleId": "lane_change_fast_to_slow",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 197.949,
      "clipEndSec": 222.487,
      "answerText": "打右方向燈 【前方路口減速查看，進行變換車道】 【左右無來車，後方無來車】； 由快車道切換至慢車道，轉頭時需看到B柱",
      "tags": [
        "b_pillar",
        "fast_lane",
        "intersection_scan",
        "lane_change",
        "rear_clear",
        "right_signal",
        "safe_left_right",
        "slow_lane"
      ]
    },
    {
      "index": 25,
      "id": "road-seg-025",
      "startSec": 221.487,
      "endSec": 227.835,
      "captionText": "完成變換車道後，持續穩定行駛於慢車道",
      "moduleId": "lane_change_fast_to_slow",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 220.487,
      "clipEndSec": 228.835,
      "answerText": "完成變換車道後，持續穩定行駛於慢車道",
      "tags": [
        "lane_change",
        "slow_lane"
      ]
    },
    {
      "index": 26,
      "id": "road-seg-026",
      "startSec": 227.835,
      "endSec": 250.585,
      "captionText": "打右方向燈，口誦【前方路口減速查看，左右無來車，後方無來車】；再看左後方【後方無來車】， 頭需看到B柱，車身盡量靠近道路邊線",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 226.835,
      "clipEndSec": 251.585,
      "answerText": "打右方向燈，口誦【前方路口減速查看，左右無來車，後方無來車】；再看左後方【後方無來車】， 頭需看到B柱，車身盡量靠近道路邊線",
      "tags": [
        "b_pillar",
        "intersection_scan",
        "rear_clear",
        "right_signal",
        "safe_left_right"
      ]
    },
    {
      "index": 27,
      "id": "road-seg-027",
      "startSec": 254.086,
      "endSec": 259.031,
      "captionText": "注意道路邊線不可壓到，",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 253.086,
      "clipEndSec": 260.031,
      "answerText": "注意道路邊線不可壓到，",
      "tags": []
    },
    {
      "index": 28,
      "id": "road-seg-028",
      "startSec": 259.031,
      "endSec": 263.92,
      "captionText": "打右方向燈；",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 258.031,
      "clipEndSec": 264.92,
      "answerText": "打右方向燈；",
      "tags": [
        "right_signal"
      ]
    },
    {
      "index": 29,
      "id": "road-seg-029",
      "startSec": 263.92,
      "endSec": 275.962,
      "captionText": "【前方路口減速查看，進行路邊臨時停車，左右無來車，後方無來車】， 頭需看到B柱",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 262.92,
      "clipEndSec": 276.962,
      "answerText": "【前方路口減速查看，進行路邊臨時停車，左右無來車，後方無來車】， 頭需看到B柱",
      "tags": [
        "b_pillar",
        "intersection_scan",
        "rear_clear",
        "safe_left_right",
        "temporary_stop"
      ]
    },
    {
      "index": 30,
      "id": "road-seg-030",
      "startSec": 276.487,
      "endSec": 282.489,
      "captionText": "【打P檔、拉手煞車】；",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 275.487,
      "clipEndSec": 283.489,
      "answerText": "【打P檔、拉手煞車】；",
      "tags": [
        "gear_p",
        "hand_brake"
      ]
    },
    {
      "index": 31,
      "id": "road-seg-031",
      "startSec": 282.489,
      "endSec": 285.312,
      "captionText": "放鬆腳煞車，確認不滑動後， 腳再回煞車",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 281.489,
      "clipEndSec": 286.312,
      "answerText": "放鬆腳煞車，確認不滑動後， 腳再回煞車",
      "tags": []
    },
    {
      "index": 32,
      "id": "road-seg-032",
      "startSec": 285.312,
      "endSec": 288.22,
      "captionText": "【路邊臨時停車完畢】",
      "moduleId": "roadside_temporary_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 284.312,
      "clipEndSec": 289.22,
      "answerText": "【路邊臨時停車完畢】",
      "tags": [
        "temporary_stop"
      ]
    },
    {
      "index": 33,
      "id": "road-seg-033",
      "startSec": 288.22,
      "endSec": 305.709,
      "captionText": "踩剎車，打左方向燈 【切入主線道，打D檔，放手煞車，後方無來車】； 頭需看到B柱後再起步",
      "moduleId": "resume_and_left_lane_change",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 287.22,
      "clipEndSec": 306.709,
      "answerText": "踩剎車，打左方向燈 【切入主線道，打D檔，放手煞車，後方無來車】； 頭需看到B柱後再起步",
      "tags": [
        "b_pillar",
        "gear_d",
        "hand_brake",
        "left_signal",
        "rear_clear"
      ]
    },
    {
      "index": 34,
      "id": "road-seg-034",
      "startSec": 312.292,
      "endSec": 324.866,
      "captionText": "打左方向燈，口誦 【進行變換車道，後方無來車】； 頭需看到B柱，沒車再變換車道",
      "moduleId": "resume_and_left_lane_change",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 311.292,
      "clipEndSec": 325.866,
      "answerText": "打左方向燈，口誦 【進行變換車道，後方無來車】； 頭需看到B柱，沒車再變換車道",
      "tags": [
        "b_pillar",
        "lane_change",
        "left_signal",
        "rear_clear"
      ]
    },
    {
      "index": 35,
      "id": "road-seg-035",
      "startSec": 325.374,
      "endSec": 335.325,
      "captionText": "前方路口減速查看，口誦【左右無來車】；",
      "moduleId": "straight_intersection_checks",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 324.374,
      "clipEndSec": 336.325,
      "answerText": "前方路口減速查看，口誦【左右無來車】；",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 36,
      "id": "road-seg-036",
      "startSec": 335.325,
      "endSec": 345.9,
      "captionText": "直線路段留意兩側照後鏡與車身、車道線間距",
      "moduleId": "straight_intersection_checks",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 334.325,
      "clipEndSec": 346.9,
      "answerText": "直線路段留意兩側照後鏡與車身、車道線間距",
      "tags": []
    },
    {
      "index": 37,
      "id": "road-seg-037",
      "startSec": 346.9,
      "endSec": 356.779,
      "captionText": "前方路口減速查看，口誦【左右無來車】；",
      "moduleId": "straight_intersection_checks",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 345.9,
      "clipEndSec": 357.779,
      "answerText": "前方路口減速查看，口誦【左右無來車】；",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 38,
      "id": "road-seg-038",
      "startSec": 359.782,
      "endSec": 367.28,
      "captionText": "行駛中隨時注意不要壓到左右車道線",
      "moduleId": "straight_intersection_checks",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 358.782,
      "clipEndSec": 368.28,
      "answerText": "行駛中隨時注意不要壓到左右車道線",
      "tags": []
    },
    {
      "index": 39,
      "id": "road-seg-039",
      "startSec": 368.28,
      "endSec": 376.28,
      "captionText": "再次通過路口前減速查看，口誦【左右無來車】",
      "moduleId": "straight_intersection_checks",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 367.28,
      "clipEndSec": 377.28,
      "answerText": "再次通過路口前減速查看，口誦【左右無來車】",
      "tags": [
        "safe_left_right"
      ]
    },
    {
      "index": 40,
      "id": "road-seg-040",
      "startSec": 390.736,
      "endSec": 394.142,
      "captionText": "打左方向燈",
      "moduleId": "u_turn_sequence",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 389.736,
      "clipEndSec": 395.142,
      "answerText": "打左方向燈",
      "tags": [
        "left_signal"
      ]
    },
    {
      "index": 41,
      "id": "road-seg-041",
      "startSec": 394.142,
      "endSec": 404.993,
      "captionText": "【前方路口減速查看】，配合準備迴轉",
      "moduleId": "u_turn_sequence",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 393.142,
      "clipEndSec": 405.993,
      "answerText": "【前方路口減速查看】，配合準備迴轉",
      "tags": [
        "intersection_scan",
        "u_turn"
      ]
    },
    {
      "index": 42,
      "id": "road-seg-042",
      "startSec": 405.0,
      "endSec": 413.136,
      "captionText": "確認【左右無來車】； 到達定點後迅速完成方向盤操作",
      "moduleId": "u_turn_sequence",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 404.0,
      "clipEndSec": 414.136,
      "answerText": "確認【左右無來車】； 到達定點後迅速完成方向盤操作",
      "tags": [
        "safe_left_right"
      ]
    },
    {
      "index": 43,
      "id": "road-seg-043",
      "startSec": 413.622,
      "endSec": 428.299,
      "captionText": "迴轉後走外側車道，",
      "moduleId": "u_turn_sequence",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 412.622,
      "clipEndSec": 429.299,
      "answerText": "迴轉後走外側車道，",
      "tags": [
        "u_turn"
      ]
    },
    {
      "index": 44,
      "id": "road-seg-044",
      "startSec": 428.299,
      "endSec": 435.58,
      "captionText": "持續注意兩側車道線，盡量讓車輛保持在車道中央",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 427.299,
      "clipEndSec": 436.58,
      "answerText": "持續注意兩側車道線，盡量讓車輛保持在車道中央",
      "tags": []
    },
    {
      "index": 45,
      "id": "road-seg-045",
      "startSec": 437.073,
      "endSec": 440.698,
      "captionText": "壓到任何一側邊線都會扣分，",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 436.073,
      "clipEndSec": 441.698,
      "answerText": "壓到任何一側邊線都會扣分，",
      "tags": []
    },
    {
      "index": 46,
      "id": "road-seg-046",
      "startSec": 440.698,
      "endSec": 446.58,
      "captionText": "【前方路口減速查看】【左右無來車】",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 439.698,
      "clipEndSec": 447.58,
      "answerText": "【前方路口減速查看】【左右無來車】",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 47,
      "id": "road-seg-047",
      "startSec": 452.31,
      "endSec": 457.31,
      "captionText": "行車速度盡量維持在約40公里左右",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 451.31,
      "clipEndSec": 458.31,
      "answerText": "行車速度盡量維持在約40公里左右",
      "tags": []
    },
    {
      "index": 48,
      "id": "road-seg-048",
      "startSec": 459.31,
      "endSec": 465.31,
      "captionText": "【前方路口減速查看】【左右無來車】",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 458.31,
      "clipEndSec": 466.31,
      "answerText": "【前方路口減速查看】【左右無來車】",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 49,
      "id": "road-seg-049",
      "startSec": 476.26,
      "endSec": 483.26,
      "captionText": "【前方路口減速查看】【左右無來車】",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 475.26,
      "clipEndSec": 484.26,
      "answerText": "【前方路口減速查看】【左右無來車】",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 50,
      "id": "road-seg-050",
      "startSec": 489.74,
      "endSec": 499.74,
      "captionText": "此路段須特別注意車速， 標示約40公里，最高速度不要超過44公里",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 488.74,
      "clipEndSec": 500.74,
      "answerText": "此路段須特別注意車速， 標示約40公里，最高速度不要超過44公里",
      "tags": []
    },
    {
      "index": 51,
      "id": "road-seg-051",
      "startSec": 499.74,
      "endSec": 505.374,
      "captionText": "【前方路口減速查看】【左右無來車】",
      "moduleId": "post_uturn_speed_and_centering",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 498.74,
      "clipEndSec": 506.374,
      "answerText": "【前方路口減速查看】【左右無來車】",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 52,
      "id": "road-seg-052",
      "startSec": 508.948,
      "endSec": 519.132,
      "captionText": "到路口前打左方向燈 【前方路口減速查看】【左右無來車】",
      "moduleId": "signalized_left_turn_to_slow_lane",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 507.948,
      "clipEndSec": 520.132,
      "answerText": "到路口前打左方向燈 【前方路口減速查看】【左右無來車】",
      "tags": [
        "left_signal",
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 53,
      "id": "road-seg-053",
      "startSec": 519.132,
      "endSec": 555.352,
      "captionText": "等紅綠燈後，起步前記得做左右擺頭； 尤其是第一台",
      "moduleId": "signalized_left_turn_to_slow_lane",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 518.132,
      "clipEndSec": 556.352,
      "answerText": "等紅綠燈後，起步前記得做左右擺頭； 尤其是第一台",
      "tags": []
    },
    {
      "index": 54,
      "id": "road-seg-054",
      "startSec": 555.584,
      "endSec": 565.729,
      "captionText": "口誦【左右無來車，後方無來車】；頭需看到B柱",
      "moduleId": "signalized_left_turn_to_slow_lane",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 554.584,
      "clipEndSec": 566.729,
      "answerText": "口誦【左右無來車，後方無來車】；頭需看到B柱",
      "tags": [
        "b_pillar",
        "safe_left_right",
        "rear_clear"
      ]
    },
    {
      "index": 55,
      "id": "road-seg-055",
      "startSec": 565.729,
      "endSec": 569.313,
      "captionText": "左轉後直接走慢車道，",
      "moduleId": "signalized_left_turn_to_slow_lane",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 564.729,
      "clipEndSec": 570.313,
      "answerText": "左轉後直接走慢車道，",
      "tags": [
        "slow_lane"
      ]
    },
    {
      "index": 56,
      "id": "road-seg-056",
      "startSec": 569.313,
      "endSec": 574.9,
      "captionText": "注意左側可能有違規插入的車輛，確認左後方來車",
      "moduleId": "signalized_left_turn_to_slow_lane",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 568.313,
      "clipEndSec": 575.9,
      "answerText": "注意左側可能有違規插入的車輛，確認左後方來車",
      "tags": []
    },
    {
      "index": 57,
      "id": "road-seg-057",
      "startSec": 574.9,
      "endSec": 589.74,
      "captionText": "【前方路口減速查看】【左右無來車】",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 573.9,
      "clipEndSec": 590.74,
      "answerText": "【前方路口減速查看】【左右無來車】",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 58,
      "id": "road-seg-058",
      "startSec": 589.74,
      "endSec": 603.08,
      "captionText": "【前方路口減速查看】【左右無來車】 注意道路邊線，白線不可壓到",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 588.74,
      "clipEndSec": 604.08,
      "answerText": "【前方路口減速查看】【左右無來車】 注意道路邊線，白線不可壓到",
      "tags": [
        "safe_left_right",
        "intersection_scan"
      ]
    },
    {
      "index": 59,
      "id": "road-seg-059",
      "startSec": 603.08,
      "endSec": 617.93,
      "captionText": "【前方路口減速查看(打右方向燈)左右無來車,後方無來車】",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 602.08,
      "clipEndSec": 618.93,
      "answerText": "【前方路口減速查看(打右方向燈)左右無來車,後方無來車】",
      "tags": [
        "right_signal",
        "safe_left_right",
        "rear_clear",
        "intersection_scan"
      ]
    },
    {
      "index": 60,
      "id": "road-seg-060",
      "startSec": 617.93,
      "endSec": 629.67,
      "captionText": "【前方路口減速查看(打左方向燈)左右無來車,後方無來車】",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 616.93,
      "clipEndSec": 630.67,
      "answerText": "【前方路口減速查看(打左方向燈)左右無來車,後方無來車】",
      "tags": [
        "left_signal",
        "safe_left_right",
        "rear_clear",
        "intersection_scan"
      ]
    },
    {
      "index": 61,
      "id": "road-seg-061",
      "startSec": 629.67,
      "endSec": 640.652,
      "captionText": "【打右方向燈,左右無來車,後方無來車】",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 628.67,
      "clipEndSec": 641.652,
      "answerText": "【打右方向燈,左右無來車,後方無來車】",
      "tags": [
        "right_signal",
        "safe_left_right",
        "rear_clear"
      ]
    },
    {
      "index": 62,
      "id": "road-seg-062",
      "startSec": 640.652,
      "endSec": 648.048,
      "captionText": "回到起終點區域，找空位將車輛停正",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 639.652,
      "clipEndSec": 649.048,
      "answerText": "回到起終點區域，找空位將車輛停正",
      "tags": []
    },
    {
      "index": 63,
      "id": "road-seg-063",
      "startSec": 650.67,
      "endSec": 671.105,
      "captionText": "停妥後依序  打P檔、拉手煞車、 關風扇、關AC、熄火",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 649.67,
      "clipEndSec": 672.105,
      "answerText": "停妥後依序  打P檔、拉手煞車、 關風扇、關AC、熄火",
      "tags": [
        "gear_p",
        "hand_brake"
      ]
    },
    {
      "index": 64,
      "id": "road-seg-064",
      "startSec": 671.105,
      "endSec": 680.427,
      "captionText": "解開安全帶、椅子退後，進行【兩段式開車門】；",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 670.105,
      "clipEndSec": 681.427,
      "answerText": "解開安全帶、椅子退後，進行【兩段式開車門】；",
      "tags": []
    },
    {
      "index": 65,
      "id": "road-seg-065",
      "startSec": 680.427,
      "endSec": 686.354,
      "captionText": "先看後照鏡，再把頭伸出車外看後方，確認【後方無來車】打開車門15公分【左右無來車】下車",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 679.427,
      "clipEndSec": 687.354,
      "answerText": "先看後照鏡，再把頭伸出車外看後方，確認【後方無來車】打開車門15公分【左右無來車】下車",
      "tags": [
        "safe_left_right",
        "rear_clear"
      ]
    },
    {
      "index": 66,
      "id": "road-seg-066",
      "startSec": 686.354,
      "endSec": 702.442,
      "captionText": "最後關上車門，道路考照動作全部完成",
      "moduleId": "return_and_finish_stop",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 685.354,
      "clipEndSec": 703.442,
      "answerText": "最後關上車門，道路考照動作全部完成",
      "tags": []
    },
    {
      "index": 67,
      "id": "road-seg-067",
      "startSec": 702.442,
      "endSec": 726.12,
      "captionText": "歡迎各位到忠正駕訓班學習開車，本班提供新型TOYOTA車輛供教學使用 今天示範的也是新車，未來學員到班上學車時，使用的車輛與教學環境皆相同",
      "moduleId": "supplementary_promo",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 701.442,
      "clipEndSec": 727.12,
      "answerText": "歡迎各位到忠正駕訓班學習開車，本班提供新型TOYOTA車輛供教學使用 今天示範的也是新車，未來學員到班上學車時，使用的車輛與教學環境皆相同",
      "tags": []
    },
    {
      "index": 68,
      "id": "road-seg-068",
      "startSec": 726.12,
      "endSec": 745.12,
      "captionText": "平時車輛整齊停放於車庫，駕訓班提供良好學習環境，也歡迎大家介紹親友前來學習",
      "moduleId": "supplementary_promo",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 725.12,
      "clipEndSec": 746.12,
      "answerText": "平時車輛整齊停放於車庫，駕訓班提供良好學習環境，也歡迎大家介紹親友前來學習",
      "tags": []
    },
    {
      "index": 69,
      "id": "road-seg-069",
      "startSec": 745.12,
      "endSec": 762.12,
      "captionText": "依照新制度，行車前都要做安全檢查；駕訓班也設置車棚，遇颱風或大雨考試時仍可進行檢查",
      "moduleId": "supplementary_promo",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 744.12,
      "clipEndSec": 763.12,
      "answerText": "依照新制度，行車前都要做安全檢查；駕訓班也設置車棚，遇颱風或大雨考試時仍可進行檢查",
      "tags": []
    },
    {
      "index": 70,
      "id": "road-seg-070",
      "startSec": 762.12,
      "endSec": 775.12,
      "captionText": "車輛可在停車棚內完成行車前安全檢查，這也是忠正駕訓班對學員安全與環境的用心",
      "moduleId": "supplementary_promo",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 761.12,
      "clipEndSec": 776.12,
      "answerText": "車輛可在停車棚內完成行車前安全檢查，這也是忠正駕訓班對學員安全與環境的用心",
      "tags": []
    },
    {
      "index": 71,
      "id": "road-seg-071",
      "startSec": 775.12,
      "endSec": 785.12,
      "captionText": "影片介紹到這裡，希望對各位有所幫助，謝謝大家，再見",
      "moduleId": "supplementary_promo",
      "clipLeadSeconds": 1.0,
      "clipLagSeconds": 1.0,
      "clipStartSec": 774.12,
      "clipEndSec": 786.12,
      "answerText": "影片介紹到這裡，希望對各位有所幫助，謝謝大家，再見",
      "tags": []
    }
  ]
};
