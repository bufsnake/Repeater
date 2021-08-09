console.log('Repeter Background GO GO GO')

// 请求
// 获取对应的 请求方式、请求体、URL、Content-Type、TabId -> 保存全部
// 点击LOAD/点击Repeater 时根据 TabId 找到 当前URL对应的信息,没找到则加载默认信息
// requestId method requestHeaders tabId url
chrome.webRequest.onSendHeaders.addListener(
    function(details) {
        if (details.tabId === -1) {
            return
        }
        var headers = []
        for (var i = 0; i < details.requestHeaders.length; i++) {
            if (details.requestHeaders[i].name.toLowerCase() === 'content-type') {
                continue
            }
            headers.push(details.requestHeaders[i])
        }
        var data = {
            requestId: details.requestId,
            method: details.method,
            requestHeaders: headers,
            tabId: details.tabId,
            url: details.url,
        }
        if (sessionStorage.getItem('request_header_' + details.tabId) !== null) {
            sessionStorage.setItem(
                'request_header_' + details.tabId,
                sessionStorage.getItem('request_header_' + details.tabId) +
                '#-BUFSNAKE-#' +
                JSON.stringify(data),
            )
        } else {
            if (
                sessionStorage.getItem('request_body_' + details.tabId).length +
                ('#-BUFSNAKE-#' + JSON.stringify(data)).length >
                5000000
            ) {
                console.log('request header not storage')
            } else {
                console.log('request header info', details)
                sessionStorage.setItem(
                    'request_header_' + details.tabId,
                    JSON.stringify(data),
                )
            }
        }
    }, { urls: ['<all_urls>'] }, ['extraHeaders', 'requestHeaders'],
)

// get request body
/*
formData:
    taskkey: (3) ["1", "2", "2"]

raw: Array(1)
    0:
        bytes: 
            ArrayBuffer(39)

requestBody:
    error: "Unknown error."

保存 requestId,requestBody,tabId,url,method
*/
chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        if (details.tabId === -1) {
            return
        }

        if (details.requestBody !== undefined) {
            console.log('request body', details.requestBody)
        }

        // Form Data 拼接
        var body = ''
        if (
            details.requestBody !== undefined &&
            details.requestBody.formData !== undefined
        ) {
            Object.keys(details.requestBody.formData).forEach(function(key) {
                for (var i = 0; i < details.requestBody.formData[key].length; i++) {
                    body += key + '=' + details.requestBody.formData[key][i] + '&'
                }
            })
            body = body.substring(0, body.length - 1)
        }

        if (
            details.requestBody !== undefined &&
            details.requestBody.raw !== undefined
        ) {
            // 可见字符则打印，不可见字符则使用URL编码
            console.log('body is', details.requestBody.raw)
            for (var i = 0; i < details.requestBody.raw.length; i++) {
                var uint8View = new Uint8Array(details.requestBody.raw[i].bytes)
                for (var j = 0; j < uint8View.length; j++) {
                    body += urlencode(uint8View[j])
                }
            }
        }

        // Raw Data 拼接
        // error Data
        var data = {
            requestId: details.requestId,
            tabId: details.tabId,
            method: details.method,
            url: details.url,
            requestBody: body,
        }
        if (sessionStorage.getItem('request_body_' + details.tabId) === null) {
            sessionStorage.setItem(
                'request_body_' + details.tabId,
                JSON.stringify(data),
            )
        } else {
            if (
                sessionStorage.getItem('request_body_' + details.tabId).length +
                ('#-BUFSNAKE-#' + JSON.stringify(data)).length >
                5000000
            ) {
                console.log('body not storage')
            } else {
                sessionStorage.setItem(
                    'request_body_' + details.tabId,
                    sessionStorage.getItem('request_body_' + details.tabId) +
                    '#-BUFSNAKE-#' +
                    JSON.stringify(data),
                )
                console.log('request body info', details)
            }
        }
    }, { urls: ['<all_urls>'] }, ['requestBody'],
)

// tab close
chrome.tabs.onRemoved.addListener(function(tabid, removed) {
    console.log('tab close', tabid)
    sessionStorage.removeItem('request_body_' + tabid)
    sessionStorage.removeItem('request_header_' + tabid)
})

// window close
chrome.windows.onRemoved.addListener(function(windowid) {
    sessionStorage.clear()
})

function urlencode(number) {
    var char = [
        '%00',
        '%01',
        '%02',
        '%03',
        '%04',
        '%05',
        '%06',
        '%07',
        '%08',
        '%09',
        '%0A',
        '%0B',
        '%0C',
        '%0D',
        '%0E',
        '%0F',
        '%10',
        '%11',
        '%12',
        '%13',
        '%14',
        '%15',
        '%16',
        '%17',
        '%18',
        '%19',
        '%1A',
        '%1B',
        '%1C',
        '%1D',
        '%1E',
        '%1F',
        '%20',
        '%21',
        '%22',
        '%23',
        '%24',
        '%25',
        '%26',
        '%27',
        '%28',
        '%29',
        '%2A',
        '%2B',
        '%2C',
        '-',
        '.',
        '/',
        '0',
        '1',
        '2',
        '3',
        '4',
        '5',
        '6',
        '7',
        '8',
        '9',
        '%3A',
        '%3B',
        '%3C',
        '%3D',
        '%3E',
        '%3F',
        '%40',
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O',
        'P',
        'Q',
        'R',
        'S',
        'T',
        'U',
        'V',
        'W',
        'X',
        'Y',
        'Z',
        '%5B',
        '%5C',
        '%5D',
        '%5E',
        '_',
        '%60',
        'a',
        'b',
        'c',
        'd',
        'e',
        'f',
        'g',
        'h',
        'i',
        'j',
        'k',
        'l',
        'm',
        'n',
        'o',
        'p',
        'q',
        'r',
        's',
        't',
        'u',
        'v',
        'w',
        'x',
        'y',
        'z',
        '%7B',
        '%7C',
        '%7D',
        '%7E',
        '%7F',
        '%80',
        '%81',
        '%82',
        '%83',
        '%84',
        '%85',
        '%86',
        '%87',
        '%88',
        '%89',
        '%8A',
        '%8B',
        '%8C',
        '%8D',
        '%8E',
        '%8F',
        '%90',
        '%91',
        '%92',
        '%93',
        '%94',
        '%95',
        '%96',
        '%97',
        '%98',
        '%99',
        '%9A',
        '%9B',
        '%9C',
        '%9D',
        '%9E',
        '%9F',
        '%A0',
        '%A1',
        '%A2',
        '%A3',
        '%A4',
        '%A5',
        '%A6',
        '%A7',
        '%A8',
        '%A9',
        '%AA',
        '%AB',
        '%AC',
        '%AD',
        '%AE',
        '%AF',
        '%B0',
        '%B1',
        '%B2',
        '%B3',
        '%B4',
        '%B5',
        '%B6',
        '%B7',
        '%B8',
        '%B9',
        '%BA',
        '%BB',
        '%BC',
        '%BD',
        '%BE',
        '%BF',
        '%C0',
        '%C1',
        '%C2',
        '%C3',
        '%C4',
        '%C5',
        '%C6',
        '%C7',
        '%C8',
        '%C9',
        '%CA',
        '%CB',
        '%CC',
        '%CD',
        '%CE',
        '%CF',
        '%D0',
        '%D1',
        '%D2',
        '%D3',
        '%D4',
        '%D5',
        '%D6',
        '%D7',
        '%D8',
        '%D9',
        '%DA',
        '%DB',
        '%DC',
        '%DD',
        '%DE',
        '%DF',
        '%E0',
        '%E1',
        '%E2',
        '%E3',
        '%E4',
        '%E5',
        '%E6',
        '%E7',
        '%E8',
        '%E9',
        '%EA',
        '%EB',
        '%EC',
        '%ED',
        '%EE',
        '%EF',
        '%F0',
        '%F1',
        '%F2',
        '%F3',
        '%F4',
        '%F5',
        '%F6',
        '%F7',
        '%F8',
        '%F9',
        '%FA',
        '%FB',
        '%FC',
        '%FD',
        '%FE',
        '%FF',
    ]
    return char[number]
}

/*
接收开发者工具发出的消息 执行顶级JS
*/
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log('on message', request.action)
    if (request.action === 'Load Form') {
        // 解析data创建表单，自动提交
        console.log('on message', request.data)
        chrome.tabs.executeScript(
            null, {
                code: `
                console.log("start execute script");
                var form_data = JSON.parse(` +
                    JSON.stringify(request.data) +
                    `);
                var form_ele = document.createElement('form');
                form_ele.hidden = true;
                form_ele.setAttribute('id', "RepeaterSend");
                form_ele.setAttribute('action', form_data.action);
                form_ele.setAttribute('method', form_data.method);
                form_ele.setAttribute('enctype', form_data.enctype);
                console.log(form_data.inputs);
                for (var i = 0; i < form_data.inputs.length; i++) {
                    console.log(form_data.inputs[i]);
                    var inp = document.createElement('input');
                    inp.setAttribute('name', form_data.inputs[i].name);
                    if (form_data.inputs[i].type === 'file') {
                        inp.setAttribute('type', 'file');
                        let dt = new DataTransfer();
                        dt.items.add(
                            new File(
                                [decodeURIComponent(form_data.inputs[i].file.bits)],
                                form_data.inputs[i].file.name, { type: form_data.inputs[i].file.type },
                            ),
                        )
                        inp.files = dt.files;
                    } else {
                        inp.setAttribute('type', 'text');
                        inp.value = form_data.inputs[i].value;
                    }
                    form_ele.appendChild(inp);
                }
                document.body.appendChild(form_ele);
                document.querySelector("#RepeaterSend").submit();
                console.log("Success");
                `,
            },
            function(results) {
                console.log(results)
            },
        )
        sendResponse({ response: 'Load Finish' })
    } else if (request.action === 'Get Session Storage') {
        sendResponse({ data: sessionStorage.getItem(request.data) })
    } else if (request.action === 'Send Raw Data') {
        // send raw data
        var req = JSON.parse(request.data)
        console.log(request)
        chrome.tabs.executeScript(
            null, {
                code: `
                var opts = { "body": \`` + req.body + `\`, "method": "` + req.method + `", "credentials": "include" }
                if(opts.method === 'HEAD') {
                    opts = { "method": "` + req.method + `", "credentials": "include" }
                }
                fetch("` + req.url + `", opts).then(res => (
                    res.text()
                    .then(body => (
                        document.body.innerHTML = body
                    ))
                    .catch(error => (
                        document.body.innerHTML = error
                    ))
                ))
                .catch(error => (
                    document.body.innerHTML = error
                ))
                `,
            },
            function(results) {
                console.log('send raw data', results)
            },
        )
        sendResponse({ response: 'Send Success' })
    }
})