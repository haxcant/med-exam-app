import json
from pathlib import Path

root = Path(__file__).resolve().parents[1]
txt = (root / 'questions.js').read_text(encoding='utf-8')
arr = json.loads(txt[txt.find('['):txt.rfind(']')+1])

missing = [q['image'] for q in arr if not (root / q['image']).exists()]
print('question_count =', len(arr))
print('missing_images =', len(missing))
if missing:
    for x in missing[:20]:
        print('missing:', x)
    raise SystemExit(1)
print('ok')
