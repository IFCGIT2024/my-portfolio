from pathlib import Path
import json
from html.parser import HTMLParser
root=Path(__file__).resolve().parents[1]
lessons=json.loads((root/'data/lessons.json').read_text())
assert [l['id'] for l in lessons]==[f'{i:02}' for i in range(1,25)]
class Checker(HTMLParser):
 def handle_starttag(self,tag,attrs):
  assert tag not in {'script','iframe','object','embed'},tag
  assert all(not k.startswith('on')for k,v in attrs)
checker=Checker()
for l in lessons:
 assert len(l['worked']['steps'])>=4 and len(l['practice'])>=2
 assert all(l.get(k)for k in ['module','title','summary','goals','sections','check','transfer','sources'])
 serialized=json.dumps(l,ensure_ascii=False)
 assert 'assignment'not in serialized.lower(),l['id']
 for s in l['sections']:checker.feed(s['html'])
 for s in l['worked']['steps']:checker.feed(s['html'])
 for p in l['practice']:
  for k in ['prompt','hint','solution']:assert p[k];checker.feed(p[k])
 for k in ['prompt','solution']:assert l['transfer'][k];checker.feed(l['transfer'][k])
coverage=json.loads((root/'data/coverage.json').read_text())
counts={'Context Free Languages.pdf':26,'Parsers .pdf':27,'Pushdown Automata.pdf':13,'The Equivalence Theorem for CFLs and PDAs.pdf':28,'Designing Grammars and PDAs.pdf':19,'Pumping Lemma for CFLs.pdf':31}
assert len(coverage)==144
for name,count in counts.items():assert sorted(r['page']for r in coverage if r['deck']==name)==list(range(1,count+1)),name
assert sum(len(l['practice'])for l in lessons)==64
print('Content: 24 complete lessons, 112 practice/check/transfer tasks, and all 144 slide pages verified.')
