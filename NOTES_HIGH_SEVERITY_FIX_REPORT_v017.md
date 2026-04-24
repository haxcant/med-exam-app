# v0.1.17 high-severity notes fix report

本次根據第二批 high-risk audit 清單，逐項核對 ID 與 answer 後，僅重寫下列 30 題的 `explanation` 欄位；未改動 Firebase、同步、admin、app.js、index.html。

## Changed IDs

- JGYL-0019 升麻鱉甲湯
- JGYL-0032 桂枝加龍骨牡蠣湯
- JGYL-0039 皂莢丸
- JGYL-0046 茯苓桂枝甘草大棗湯
- JGYL-0047 栝蔞薤白白酒湯
- JGYL-0051 茯苓杏仁甘草湯
- JGYL-0054 厚朴七物湯
- JGYL-0070 旋覆花湯
- JGYL-0071 麻子仁丸
- JGYL-0072 甘薑苓朮湯
- JGYL-0074 小半夏茯苓湯
- JGYL-0075 小半夏加茯苓湯
- JGYL-0079 己椒藶黃丸
- JGYL-0082 小半夏湯
- JGYL-0083 厚朴大黃湯
- JGYL-0085 木防己湯
- JGYL-0086 木防己湯去石膏加茯苓芒硝湯
- JGYL-0087 澤瀉湯
- JGYL-0093 文蛤散
- JGYL-0098 栝蔞瞿麥丸
- JGYL-0099 蒲灰散
- JGYL-0101 越婢湯
- JGYL-0103 杏子湯
- JGYL-0104 防己茯苓湯
- JGYL-0105 蒲灰散
- JGYL-0107 越婢加朮湯
- JGYL-0108 耆芍桂酒湯
- JGYL-0110 枳朮湯
- JGYL-0112 茵陳蒿湯
- JGYL-0114 虛勞小建中湯

## 修正原則

- 移除「這句可白話理解為」「依方證處理」等模板廢話。
- 針對原 audit 指出的藥物幻覺，改回各方實際方義，例如皂莢丸只按皂莢一味、小半夏湯只按半夏生薑、澤瀉湯只按澤瀉白朮、防己茯苓湯不再混入豬苓澤瀉。
- 對通行本未詳方組成的杏子湯，明確標示不臆造藥物。
- 保留每題使用提醒：學習輔助與背誦提示，不是正式校注或臨床診療建議。

## Checks

- JSON parse: passed.
- Question count: 199.
- IDs modified: 30.
