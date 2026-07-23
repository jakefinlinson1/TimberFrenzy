import sys,re
fn,kw=sys.argv[1],sys.argv[2]
b=int(sys.argv[3]) if len(sys.argv)>3 else 200
a=int(sys.argv[4]) if len(sys.argv)>4 else 200
d=open(fn,encoding='utf-8',errors='replace').read()
n=0
for m in re.finditer(re.escape(kw),d):
    n+=1;print(f"\n--- {n} @ {m.start()} ---\n"+d[max(0,m.start()-b):m.start()+a]())if False else print(f"\n--- {n} @ {m.start()} ---\n"+d[max(0,m.start()-b):m.start()+a])
print("TOTAL",n)
