import re, os, sys, time, json, html, urllib.request, urllib.parse, hashlib, datetime
ROOT=sys.argv[1]
CACHE=os.path.join(ROOT,'cache_p'); os.makedirs(CACHE,exist_ok=True)
UA='Mozilla/5.0 (compatible; demo-catalog-research; low-rate)'
log=open(os.path.join(ROOT,'crawl_products.log'),'a',encoding='utf-8')
def fetch(url):
    key=hashlib.md5(url.encode()).hexdigest(); p=os.path.join(CACHE,key+'.html')
    if os.path.exists(p): return 200,open(p,encoding='utf-8').read()
    req=urllib.request.Request(urllib.parse.quote(url,safe=':/?&=%'),headers={'User-Agent':UA})
    try:
        with urllib.request.urlopen(req,timeout=40) as r: body=r.read().decode('utf-8','replace'); code=r.status
    except urllib.error.HTTPError as e: code=e.code; body=''
    except Exception as e: code=-1; body=''; log.write(f'ERR {url} {e}\n')
    time.sleep(1.0)
    if code==200: open(p,'w',encoding='utf-8').write(body)
    log.write(f'{code} {url}\n'); log.flush(); return code,body
def txt(x): return html.unescape(re.sub(r'<[^>]+>',' ',x or '')).replace('\xa0',' ').strip()
urls=[]
for f in ['sm_product_page_1.xml','sm_product_page_2.xml']:
    s=open(os.path.join(ROOT,'src',f),encoding='utf-8').read()
    for m in re.finditer(r'<loc><!\[CDATA\[([^\]]+)\]\]></loc>.*?<lastmod>([^<]*)</lastmod>',s):
        urls.append((m.group(1),m.group(2)))
out=[]; today=datetime.date.today().isoformat()
for i,(u,lastmod) in enumerate(urls):
    code,s=fetch(u)
    rec=dict(sourceUrl=u,sitemapLastmod=lastmod,httpStatus=code,fetchedAt=today)
    if code==200:
        m=re.search(r'name="product_id" value="(\d+)"',s); rec['sourceId']=m and m.group(1)
        m=re.search(r'<h1 class="title page-title">(?:<span>)?(.*?)(?:</span>)?</h1>',s,re.S); rec['name']=txt(m.group(1)) if m else None
        j=s.find('<div class="product-right'); r=s[j:j+20000]
        m=re.search(r"class='autocalc-product-price'>([^<]*)<",r) or re.search(r"class='autocalc-product-special'>([^<]*)<",r)
        rec['priceText']=m and m.group(1)
        m=re.search(r"data-value='([\d.]+)' class='autocalc-product-(?:price|special)'",r); rec['priceValue']=m and float(m.group(1))
        m=re.search(r"data-value='([\d.]+)' class='autocalc-product-price'",r); rec['regularValue']=m and float(m.group(1))
        m=re.search(r'<li class="product-stock ([^"]*)"><b>[^<]*</b>\s*<span>([^<]*)</span>',r); rec['stockClass']=m and m.group(1); rec['stockText']=m and txt(m.group(2))
        m=re.search(r'<li class="product-model"><b>[^<]*</b>\s*<span>([^<]*)</span>',r); rec['model']=m and txt(m.group(1))
        m=re.search(r'<li class="product-manufacturer"><b>[^<]*</b>\s*<a[^>]*>([^<]*)</a>',r); rec['manufacturer']=m and txt(m.group(1))
        m=re.search(r'class="block-content block-description">(.*?)</div>',s,re.S); rec['descriptionText']=txt(m.group(1)) if m else None
        m=re.search(r"data-images='([^']*)'",s)
        try: rec['images']=[x['src'] for x in json.loads(html.unescape(m.group(1)))] if m else []
        except Exception: rec['images']=[]
        lab=s[s.find('<div class="product-image'):][:6000]
        rec['labels']=[txt(x) for x in re.findall(r'class="product-label[^"]*"><b>(.*?)</b>',lab)]
        m=re.search(r'"availability":"(?:http:\/\/schema.org\/)?(\w+)"',s); rec['ldAvailability']=m and m.group(1)
    out.append(rec)
    if i%25==0: print(i,code,rec.get('name'),flush=True); json.dump(out,open(os.path.join(ROOT,'products_raw.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
json.dump(out,open(os.path.join(ROOT,'products_raw.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('DONE',len(out))
