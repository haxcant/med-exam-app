import json
import re
from pathlib import Path

root = Path(__file__).resolve().parents[1]
med_js = (root / 'med_questions.js').read_text(encoding='utf-8')
match = re.search(r'window\.MED_QUESTION_BANK\s*=\s*(\[.*\])\s*;\s*$', med_js, re.S)
if not match:
    raise SystemExit('cannot find window.MED_QUESTION_BANK array')
arr = json.loads(match.group(1))

ids = set()
errors = []
for i, q in enumerate(arr):
    qid = q.get('id')
    if not qid:
        errors.append(f'question[{i}] missing id')
    elif qid in ids:
        errors.append(f'duplicate id: {qid}')
    ids.add(qid)
    for key in ['prompt', 'answer', 'options']:
        if key not in q:
            errors.append(f'{qid or i} missing {key}')
    if isinstance(q.get('options'), list):
        if q.get('answer') not in q['options']:
            errors.append(f'{qid or i} answer not in options')
        if len(q['options']) < 2:
            errors.append(f'{qid or i} too few options')
    else:
        errors.append(f'{qid or i} options is not list')

print('med_question_count =', len(arr))
print('errors =', len(errors))
if errors:
    for e in errors[:30]:
        print('error:', e)
    raise SystemExit(1)
print('ok')
