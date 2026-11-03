import re, os, sys, time, json, html, urllib.request, urllib.parse, hashlib
BASE='https://eskiparamarket.com/'
ROOT=sys.argv[1]
CACHE=os.path.join(ROOT,'cache'); os.makedirs(CACHE,exist_ok=True)
UA='Mozilla/5.0 (compatible; demo-catalog-research; low-rate)'
SKIP={'cok-satanlar','populer-paralar','tavsiye-ettiklerimiz','tukenmek-uzere','tum-urunler'}
log=open(os.path.join(ROOT,'crawl_cats.log'),'a',encoding='utf-8')
def fetch(url):
    key=hashlib.md5(url.encode()).hexdigest()
    p=os.path.join(CACHE,key+'.html')
    if os.path.exists(p): return 200,open(p,encoding='utf-8').read()
    req=urllib.request.Request(urllib.parse.quote(url,safe=':/?&=%'),headers={'User-Agent':UA})
    try:
        with urllib.request.urlopen(req,timeout=40) as r:
            body=r.read().decode('utf-8','replace'); code=r.status
    except urllib.error.HTTPError as e:
        code=e.code; body=''
    except Exception as e:
        code=-1; body=''; log.write(f'ERR {url} {e}\n')
    time.sleep(1.0)
    if code==200: open(p,'w',encoding='utf-8').write(body)
    log.write(f'{code} {url}\n'); log.flush()
    return code,body
cats=[l.strip() for l in open(os.path.join(ROOT,'src','cats.txt'),encoding='utf-8') if l.strip() and not l.startswith('index.php')]
cats=[c for c in cats if c not in SKIP]
out={}
for c in cats:
    page=1; items=[]; name=None; code0=None
    while True:
        url=f'{BASE}{c}?limit=100' + (f'&page={page}' if page>1 else '')
        code,body=fetch(url)
        if page==1: code0=code
        if code!=200: break
        if name is None:
            m=re.search(r'<h1 class="title page-title">(?:<span>)?(.*?)(?:</span>)?</h1>',body,re.S)
            name=html.unescape(re.sub('<[^>]+>','',m.group(1))).strip() if m else None
        for blk in body.split('<div class="product-layout')[1:]:
            pid=re.search(r'name="product_id" value="(\d+)"',blk)
            href=re.search(r'<div class="name"><a href="([^"]+)"',blk)
            if not (pid and href): continue
            slug=urllib.parse.urlparse(html.unescape(href.group(1))).path.rstrip('/').split('/')[-1]
            nm=re.search(r'<div class="name"><a [^>]*>(.*?)</a>',blk,re.S)
            pr=re.search(r'class="price-normal">([^<]+)<',blk) or re.search(r'class="price-new">([^<]+)<',blk)
            old=re.search(r'class="price-old">([^<]+)<',blk)
            code_=re.search(r'Ürün Kodu:</span> <span>([^<]*)<',blk)
            labels=[html.unescape(x).strip() for x in re.findall(r'class="product-label[^"]*"><b>(.*?)</b>',blk)]
            out_of_stock='out-of-stock' in blk or 'Stokta Yok' in blk
            items.append(dict(id=pid.group(1),slug=urllib.parse.unquote(slug),name=html.unescape(nm.group(1)).strip() if nm else None,
                price=pr.group(1).strip() if pr else None, oldPrice=old.group(1).strip() if old else None,
                model=html.unescape(code_.group(1)).strip() if code_ else None, labels=labels, listOutOfStock=out_of_stock))
        nxt=re.search(r'<li><a href="[^"]*page=%d"'%(page+1),body) or re.search(r'page=%d"'%(page+1),body)
        if nxt and page<30: page+=1
        else: break
    out[c]=dict(name=name,status=code0,pages=page,products=items)
    print(c,code0,name,len(items),flush=True)
json.dump(out,open(os.path.join(ROOT,'categories.json'),'w',encoding='utf-8'),ensure_ascii=False,indent=1)
print('DONE')
