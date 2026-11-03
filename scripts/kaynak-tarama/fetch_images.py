import os, sys, time, json, urllib.request, urllib.parse
ROOT=sys.argv[1]
OUT=os.path.join(ROOT,'images'); os.makedirs(OUT,exist_ok=True)
UA='Mozilla/5.0 (compatible; demo-catalog-research; low-rate)'
log=open(os.path.join(ROOT,'fetch_images.log'),'a',encoding='utf-8')
MAXIMG=4
idle=0
manifest_path=os.path.join(ROOT,'images_manifest.json')
manifest=json.load(open(manifest_path,encoding='utf-8')) if os.path.exists(manifest_path) else {}
while True:
    try: prods=json.load(open(os.path.join(ROOT,'products_raw.json'),encoding='utf-8'))
    except Exception: time.sleep(5); continue
    did=0
    for p in prods:
        sid=p.get('sourceId')
        if not sid: continue
        for i,u in enumerate((p.get('images') or [])[:MAXIMG]):
            key=f'{sid}-{i}'
            if key in manifest: continue
            path=os.path.join(OUT,key+'.jpg')
            try:
                req=urllib.request.Request(urllib.parse.quote(u,safe=':/?&=%'),headers={'User-Agent':UA})
                with urllib.request.urlopen(req,timeout=40) as r:
                    data=r.read(); ct=r.headers.get('Content-Type','')
                if not ct.startswith('image/') or len(data)<500: raise Exception(f'bad content {ct} {len(data)}')
                open(path,'wb').write(data)
                manifest[key]={'url':u,'status':200,'bytes':len(data)}
            except urllib.error.HTTPError as e:
                manifest[key]={'url':u,'status':e.code}
            except Exception as e:
                manifest[key]={'url':u,'status':-1,'error':str(e)[:200]}
            log.write(f"{manifest[key]['status']} {key} {u}\n"); log.flush()
            did+=1
            time.sleep(0.7)
            if did%40==0: json.dump(manifest,open(manifest_path,'w',encoding='utf-8'),ensure_ascii=False)
    json.dump(manifest,open(manifest_path,'w',encoding='utf-8'),ensure_ascii=False)
    done=os.path.exists(os.path.join(ROOT,'crawl_products.out')) and 'DONE' in open(os.path.join(ROOT,'crawl_products.out'),encoding='utf-8',errors='replace').read()
    if done and did==0: break
    if did==0: time.sleep(20)
print('DONE',len(manifest))
