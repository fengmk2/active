#!/usr/bin/env python

from datetime import datetime, timedelta
from os import path
from urlparse import parse_qs, urlparse
import json

def main():
    now = datetime.now() - timedelta(days=1)
    dirpath = path.dirname(path.realpath(__file__))
    logpath = path.join(dirpath, 'log/%d/%d/%d.log' % (now.year, now.month, now.day))
    # 125.120.145.106|1306260420128|/log?at=popup&app=fawave&uid=kdkhkblabbkmgfjfpbijlbijdemdodol&v=2011.3.3.0|Mozilla/5.0 (Macintosh; Intel Mac OS X 10_6_7) AppleWebKit/534.30 (KHTML, like Gecko) Chrome/12.0.742.60 Safari/534.30
    total = {}
    for line in open(logpath, 'rb'):
        items = line.split('|', 3)
        if len(items) < 3:
            continue
        urlinfo = urlparse(items[2])
        query = parse_qs(urlinfo.query)
        app = query.get('app')
        if not app:
            continue
        app = app[0]
        uid = query.get('uid')
        if not uid:
            continue
        uid = uid[0]
        app_total = total.get(app, {})
        user_total = app_total.get(uid, {})
        active = query.get('at', query.get('active'))
        if active:
            active = active[0]
            user_total[active] = user_total.get(active, 0) + 1
        version = query.get('v')
        if version:
            version = version[0]
            k = 'version_' + version
            user_total[k] = user_total.get(k, 0) + 1
        app_total[uid] = user_total;
        total[app] = app_total
    result = {}
    for app in total:
        app_total = total[app]
        app_result = result.get(app, {})
        app_result['users'] = len(app_total)
        for uid in app_total:
            user_total = app_total[uid]
            for k in user_total:
                key = k + '_users'
                app_result[key] = app_result.get(key, 0) + 1
                app_result[k] = app_result.get(k, 0) + user_total[k]
        result[app] = app_result
    print result
    f = open(logpath + '.json', 'wb')
    try:
        f.write(json.dumps({'total': result, 'date': now.strftime('%Y-%m-%d')}))
    finally:
        f.close()
    
    
if __name__ == '__main__':
    main()