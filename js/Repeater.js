console.log("Repeter GO GO GO");

var Request_Method = "GET"; // 默认请求方式
var Request_IsXHR = false; // 是否为XHR请求
var id = 0; // 当前Tab唯一ID
var req_body_position = 2; // 请求体默认输入位置
var header_position = 1; // 请求头默认输入位置
var ContentType = "application/x-www-form-urlencoded"; // 默认请求类型
var METHODS = ["GET", "POST", "PUT", "DELETE", "OPTION", "HEAD"];
var CONTENT_TYPE = [
  "application/x-www-form-urlencoded",
  "multipart/form-data",
  "application/json",
  "application/xml",
  "application/javascript",
  "text/plain",
  "multipart/form-data; boundary=----WebKitFormBoundaryywB1rOnmpPkpqWtC",
];
var ENC = "DECODE";

// 向background发送消息
// LOAD加载URL
document.querySelector("#load").addEventListener(
  "click",
  function () {
    loadURL();
  },
  false
);

// 加载插件时自动加载URL
loadURL();

// LOAD URL
function loadURL() {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    document.querySelector("#URL").value = tabs[0].url;
    id = tabs[0].id;
    console.log("Loading Success, Current tabId Is", id);

    chrome.runtime.sendMessage(
      { action: "Get Session Storage", data: "request_body_" + id },
      function (response) {
        // 判断SESSION中是否存在该链接
        // 存在则存储取出METHOD、HEADER、REQUEST_BODY填充到表单中
        if (response.data === null) {
          return;
        }
        var body = response.data;
        var bodys = body.split("#-BUFSNAKE-#");
        chrome.runtime.sendMessage(
          { action: "Get Session Storage", data: "request_header_" + id },
          function (response) {
            var header = response.data;
            var headers = header.split("#-BUFSNAKE-#");

            var f_method = "";
            var f_header = "";
            var f_request_body = "";
            for (var i = 0; i < bodys.length; i++) {
              var body_ = JSON.parse(bodys[i]);
              if (body_.url === tabs[0].url) {
                f_method = body_.method;
                f_request_body = body_.requestBody;
              }
            }
            for (var i = 0; i < headers.length; i++) {
              var header_ = JSON.parse(headers[i]);
              if (header_.url === tabs[0].url) {
                f_header = header_.requestHeaders;
              }
            }
            // 填充表单，不存在则为默认值
            if (f_method != "") {
              Request_Method = f_method;
              for (var m = 0; m < METHODS.length; m++) {
                if (METHODS[m].toUpperCase() === f_method.toUpperCase()) {
                  document.querySelector("#METHOD > select")[m].selected = true;
                  break;
                }
              }
            }

            if (f_header !== undefined) {
              document.getElementById("defaultOpenHEADERFORM").click();
              document.querySelector("#HEADER-FORM").innerHTML = "";
              for (var m = 0; m < f_header.length; m++) {
                $(document.getElementById("HEADER-ADD")).trigger("click", [
                  f_header[m].name,
                  f_header[m].value,
                ]);
              }
            }

            if (f_request_body != "") {
              document.getElementById("defaultOpenREQBODYRAW").click();
              document.querySelector("#REQBODYRAW-TEXTAREA").value =
                decodeURIComponent(f_request_body);
            }
          }
        );
      }
    );
  });
}

// EMPTY Button
document.querySelector("#empty").addEventListener(
  "click",
  function () {
    console.log("Empty Success, Current tabId Is", id);
    document.querySelector("#URL").value = "";
    document.getElementById("defaultOpenHEADERFORM").click();
    document.querySelector("#HEADER-FORM").innerHTML = "";
    Request_Method = "GET";
    document.querySelector("#METHOD > select")[0].selected = true;

    document.getElementById("defaultOpenREQBODYRAW").click();
    document.querySelector("#REQBODYRAW-TEXTAREA").value = "";

    document.querySelector("#REQBODY-FORM").innerHTML = "";
  },
  false
);

// ❎ button count
var XHeaderCount = 0;
var XReqBodyCount = 0;

// COPY Button
document.querySelector("#copy").addEventListener(
  "click",
  function () {
    const input = document.createElement("textarea");
    input.value = document.querySelector("#URL").value;
    document.body.appendChild(input);
    input.select();
    if (document.execCommand("copy")) {
      document.execCommand("copy");
    }
    document.body.removeChild(input);
  },
  false
);

// About Button
document.querySelector("#aboutBTN").addEventListener(
  "click",
  function () {
    if (document.querySelector("#about").hidden) {
      document.querySelector("#about").hidden = false;
      document.querySelector("#operpage").hidden = true;
      document.querySelector("#aboutBTN").style.backgroundColor = "#1868E5";
    } else {
      document.querySelector("#about").hidden = true;
      document.querySelector("#operpage").hidden = false;
      document.querySelector("#aboutBTN").style.backgroundColor =
        "rgb(241 243 244)";
    }
  },
  false
);

// ENCODE Button
var encode = [
  "DECODE",
  "URL Encode",
  "URL Deep Encode",
  "Base64 Encode",
  "Hex Encode",
  "Unicode Encode",
  "MD5",
  "SHA1",
  "SHA256",
  "SHA512",
];

document.querySelector("#encode").addEventListener(
  "change",
  function (event) {
    ENC = encode[event.target.value];
    document.querySelector("#encode > select")["0"].selected = true;
  },
  false
);

// DECODE Button
var decode = [
  "DECODE",
  "URL Decode",
  "URL Deep Decode",
  "Base64 Decode",
  "Hex Decode",
  "Unicode Decode",
];

document.querySelector("#decode").addEventListener(
  "change",
  function (event) {
    ENC = decode[event.target.value];
    document.querySelector("#decode > select")["0"].selected = true;
  },
  false
);

// REQ-BODY ADD Button
document.querySelector("#REQBODY-ADD").addEventListener(
  "click",
  function () {
    var el = document.createElement("div");
    el.innerHTML = `<i id='r-icon' style="color: red;width:2%;" class="fa fa-times" aria-hidden="true">
        <input type="hidden" id="r-hidden" value="0">
    </i>
    <input type="text" id="r-key" list="headers" style="width: 40%;font: 12px Arial, Helvetica, sans-serif; color: #666; " placeholder="KEY">
    <button id="r-flag" type="button" style="width: 8%;font: 10px Arial, Helvetica, sans-serif; color: #666; padding: 1px 2px 1px 3px; margin-bottom: 1px; background-color: #ffffff; border: 1px solid #cacdd1;">
        <select id="select">
            <option value="0">TEXT</option>
            <option value="1">FILE</option>
        </select>
    </button>
    <input type="text" id="r-val" placeholder="VAL" style="width: 50%;font: 12px Arial, Helvetica, sans-serif; color: #666;">
    <textarea hidden id="r-content"></textarea>
    `;
    var form = document.querySelector("#REQBODY-FORM");
    el.querySelector("#r-icon").querySelector("#r-hidden").value =
      XReqBodyCount;
    el.querySelector("#r-flag").name = XReqBodyCount;
    el.querySelector("#r-val").name = XReqBodyCount;
    el.querySelector("#r-content").name = XReqBodyCount;
    XReqBodyCount += 1;
    el.querySelector("#r-icon").addEventListener(
      "click",
      function () {
        var el = document.querySelector("#REQBODY-FORM");
        var flag = parseInt(this.querySelector("#r-hidden").value);
        var key = el.querySelectorAll("#r-key");
        var r_flag = el.querySelectorAll("#r-flag");
        var content = el.querySelectorAll("#r-content");
        var val = el.querySelectorAll("#r-val");
        var icon = el.querySelectorAll("#r-icon");
        var flag_ = document.querySelectorAll("#r-hidden");
        for (var x = 0; x < flag_.length; x++) {
          if (flag == parseInt(flag_[x].value)) {
            el.removeChild(key[x]);
            el.removeChild(val[x]);
            el.removeChild(icon[x]);
            el.removeChild(r_flag[x]);
            el.removeChild(content[x]);
          }
        }
      },
      false
    );
    el.querySelector("#r-flag").addEventListener(
      "change",
      function (event) {
        var flag = parseInt(this.name);
        var flag_ = document.querySelectorAll("#r-hidden");
        for (var x = 0; x < flag_.length; x++) {
          if (flag === parseInt(flag_[x].value)) {
            if (event.target.value === "0") {
              console.log("set input type is text");
              document.querySelectorAll("#r-val")[x].type = "text";
            } else {
              console.log("set input type is file");
              document.querySelectorAll("#r-val")[x].type = "file";
            }
            break;
          }
        }
      },
      false
    );

    // 文件上传
    el.querySelector("#r-val").addEventListener(
      "change",
      function () {
        console.log("type", this.type);
        if (this.type === "text") {
          return;
        }
        var this_ = this;
        var fr = new FileReader();
        fr.onload = function () {
          this_.nextElementSibling.innerText = encodeURIComponent(fr.result);
        };
        fr.readAsText(this.files[0]);
      },
      false
    );

    form.appendChild(el.querySelector("#r-icon"));
    form.appendChild(el.querySelector("#r-key"));
    form.appendChild(el.querySelector("#r-flag"));
    form.appendChild(el.querySelector("#r-val"));
    form.appendChild(el.querySelector("#r-content"));
  },
  false
);

// HEADER ADD Button
$(document.querySelector("#HEADER-ADD")).bind(
  "click",
  function (event, key, val) {
    var el = document.createElement("div");
    el.innerHTML = `<i id='h-icon' style="color: red;width:2%;" class="fa fa-times" aria-hidden="true">
            <input type="hidden" id="h-hidden" value="0">
        </i>
            <input type="text" id="h-key" list="headers" style="width: 48%;font: 12px Arial, Helvetica, sans-serif; color: #666; " placeholder="KEY">
        <input type="text" id="h-val" placeholder="VAL" name="VAL" style="width: 50%;font: 12px Arial, Helvetica, sans-serif; color: #666;">`;
    var form = document.querySelector("#HEADER-FORM");
    el.querySelector("#h-icon").querySelector("#h-hidden").value = XHeaderCount;
    XHeaderCount += 1;
    el.querySelector("#h-icon").addEventListener(
      "click",
      function () {
        var el = document.querySelector("#HEADER-FORM");
        var flag = parseInt(this.querySelector("#h-hidden").value);
        var key = el.querySelectorAll("#h-key");
        var val = el.querySelectorAll("#h-val");
        var icon = el.querySelectorAll("#h-icon");
        var flag_ = document.querySelectorAll("#h-hidden");
        for (var x = 0; x < flag_.length; x++) {
          if (flag == parseInt(flag_[x].value)) {
            el.removeChild(key[x]);
            el.removeChild(val[x]);
            el.removeChild(icon[x]);
          }
        }
      },
      false
    );
    if (key !== "" && key !== undefined) {
      el.querySelector("#h-key").value = key;
      el.querySelector("#h-val").value = val;
    }
    form.appendChild(el.querySelector("#h-icon"));
    form.appendChild(el.querySelector("#h-key"));
    form.appendChild(el.querySelector("#h-val"));
  }
);

// 解析用户输入Cookie
function parseCookie(str) {
  var result = {};
  str = str.split(";");
  var index = 0;
  str.forEach(function (value) {
    value = value.trim();
    if (value.indexOf("=") !== -1) {
      var vs = value.split("=");
      result[decodeURIComponent(vs[0])] = decodeURIComponent(vs[1]);
    } else {
      if (value.length !== 0) {
        result["X-X-X-X-X-X-Repeater_" + index] = decodeURIComponent(value);
        index += 1;
      }
    }
  });
  return result;
}

// SEND Request
document.querySelector("#sendRequest").addEventListener(
  "click",
  function () {
    if (
      document.querySelector("#URL").value === "" ||
      !document.querySelector("#URL").value.startsWith("http")
    ) {
      return $.growl.error({
        title: "ERROR",
        message: "URL ERROR,PLZ LOAD",
      });
    }
    // content-type 为 json或xml 则先校验数据是否正确
    if (ContentType === "application/json") {
      try {
        JSON.parse(document.querySelector("#REQBODYRAW-TEXTAREA").value);
      } catch {
        return $.growl.error({
          title: "ERROR",
          message: "JSON Data Error",
        });
      }
    }

    if (req_body_position === 1) {
      if (Request_Method !== "GET" && Request_Method !== "POST") {
        return $.growl.error({
          title: "ERROR",
          message: "The Form Does Not Support GET And POST",
        });
      }
    }

    try {
      var key = document.querySelectorAll("#h-key");
      var val = document.querySelectorAll("#h-val");
      for (var j = 0; j < key.length; j++) {
        if (key[j].value.toLowerCase() !== "cookie") {
          continue;
        }
        if (val[j].value === "") {
          return $.growl.error({
            title: "ERROR",
            message: "COOKIE EMPTY<br>If you want to delete COOKIE, enter DEL",
          });
        }
        console.log("start to modify cookie");

        // 获取当前Cookie
        const url = new URL(document.querySelector("#URL").value);
        chrome.cookies.getAll({ url: url.origin }, function (cookies) {
          console.log("cookies", cookies);

          // 如何header中设置了Cookie字段，则删除当前全部Cookie，并重新设置
          for (var i = 0; i < cookies.length; i++) {
            chrome.cookies.remove(
              { name: cookies[i].name, url: url.origin },
              function (response) {
                console.log("remove cookie", response);
              }
            );
          }

          // 设置Cookie
          // name带=
          // value 如果name为空，则默认存储value
          console.log("use input cookie is", val[j].value);
          var cookies = parseCookie(val[j].value);
          if (val[j].value.toLowerCase() === "del") {
            cookies = {};
          }
          Object.keys(cookies).forEach(function (key) {
            if (key.indexOf("X-X-X-X-X-X-Repeater_") !== -1) {
              chrome.cookies.set(
                { value: cookies[key], url: url.origin },
                function (response) {
                  console.log("set cookie", response);
                }
              );
            } else {
              chrome.cookies.set(
                { name: key, value: cookies[key], url: url.origin },
                function (response) {
                  console.log("set cookie", response);
                }
              );
            }
          });
        });
        break;
      }
    } catch (error) {
      return $.growl.error({
        title: "ERROR",
        message: error,
      });
    }

    // 请求前修改请求信息，如果URL后面包含 xxxx 则进行Redirect
    // chrome.webRequest.onBeforeRequest.addListener(
    //     function(details) {
    //         if (!details.url.endsWith('is_not_get_request')) {
    //             return {}
    //         }
    //         return {
    //             redirectUrl: 'data:application/json;charset=UTF-8;base64,' +
    //                 Base64.encode(newResponse),
    //         }
    //     }, { urls: ['<all_urls>'] }, ['blocking', 'requestBody'],
    // )

    var header_flag = false;

    // 修改头信息
    if (header_position === 2) {
      header_flag = true;
      if (document.querySelector("#HEADERRAW-TEXTAREA").value === "") {
        document.querySelector("#HEADER-FORM").innerHTML = "";
      }
      document.getElementById("defaultOpenHEADERFORM").click();
    }

    // 在请求前修改header信息
    chrome.webRequest.onBeforeSendHeaders.addListener(
      function (details) {
        var key = document.querySelectorAll("#h-key");
        var val = document.querySelectorAll("#h-val");
        for (var i = 0; i < key.length; i++) {
          if (
            key[i].value === "" ||
            key[i].value.toLowerCase() === "content-type"
          ) {
            continue;
          }
          var flag = false;
          for (var j = 0; j < details.requestHeaders.length; j++) {
            if (
              key[i].value.toLowerCase() ===
              details.requestHeaders[j].name.toLowerCase()
            ) {
              details.requestHeaders[j].value = val[i].value;
              flag = true;
              break;
            }
          }
          if (!flag) {
            details.requestHeaders.push({
              name: key[i].value,
              value: val[i].value,
            });
          }
        }
        if (Request_IsXHR) {
          // X-Requested-With: XMLHttpRequest
          details.requestHeaders.push({
            name: "X-Requested-With",
            value: "XMLHttpRequest",
          });
        }
        if (ContentType !== "multipart/form-data") {
          details.requestHeaders.push({
            name: "Content-Type",
            value: ContentType,
          });
        }
        if (details.tabId === id) {
          return {
            requestHeaders: details.requestHeaders,
          };
        }
      },
      { urls: ["<all_urls>"] },
      ["blocking", "requestHeaders"]
    );

    // 同源判断 更新到同源
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (
        new URL(tabs[0].url).origin !==
        new URL(document.querySelector("#URL").value).origin
      ) {
        chrome.tabs.update({
          url: new URL(document.querySelector("#URL").value).origin,
        });
      }
    });

    // 三种方案: 非GET请求
    // 同域名/同协议的情况下不算跨域 -> 否则全部先update到#URL上
    // 1. chrome.tabs.upadte -> 采用redirectUrl进行传输数据
    // 2. CDP 拦截修改
    // 3. 在顶层创建表单，自动提交表单

    // 表单
    //  - from
    //  - json
    //  - xml
    //  - form-file
    //  - raw/binary/graphql(当做payload快速提交吧)
    /*
            application/x-www-form-urlencoded(form默认也支持)
            multipart/form-data; boundary=----WebKitFormBoundaryrGKCBY7qhFd3TrwA
            text/plain
            application/json
            text/xml
        */
    switch (Request_Method) {
      case "GET":
        console.log("GET", document.querySelector("#URL").value);
        chrome.tabs.query(
          { active: true, currentWindow: true },
          function (tabs) {
            chrome.tabs.update({
              url: document.querySelector("#URL").value,
            });
          }
        );
        break;
      default:
        // FORM Submit
        if (req_body_position === 1) {
          chrome.tabs.query(
            { active: true, currentWindow: true },
            function (tabs) {
              // get devtools form
              var message = {
                action: document.querySelector("#URL").value,
                method: "POST",
                enctype: ContentType,
                inputs: [],
              };
              var types = ["TEXT", "FILE"];
              var form = document.querySelector("#REQBODY-FORM");
              var type = form.querySelectorAll("#r-flag");
              var key = form.querySelectorAll("#r-key");
              var val = form.querySelectorAll("#r-val");
              var content = form.querySelectorAll("#r-content");
              for (var i = 0; i < type.length; i++) {
                var type_ =
                  types[parseInt(type[i].querySelector("select").value)];
                if (type_ === "TEXT") {
                  // 文本类型
                  var input = {
                    type: "text",
                    name: key[i].value,
                    value: val[i].value,
                  };
                  message.inputs.push(input);
                } else {
                  // 文件类型
                  var input = {
                    type: "file",
                    name: key[i].value,
                    file: {
                      bits: content[i].innerText,
                      name: val[i].files[0].name,
                      type: val[i].files[0].type,
                    },
                  };
                  message.inputs.push(input);
                }
              }
              console.log("FORM INFO", message);

              // 复制devtools中的表单到当前网页
              chrome.runtime.sendMessage(
                { action: "Load Form", data: JSON.stringify(message) },
                function (response) {
                  console.log("copy form", response);
                }
              );
            }
          );
        } else {
          // RAW Submit
          var req = {
            url: document.querySelector("#URL").value,
            method: Request_Method,
            body: document.querySelector("#REQBODYRAW-TEXTAREA").value,
          };
          chrome.runtime.sendMessage(
            { action: "Send Raw Data", data: JSON.stringify(req) },
            function (response) {
              console.log("SEND RAW DATA", response);
            }
          );
        }
        break;
    }

    if (header_flag) {
      document.getElementById("defaultOpenHEADERRAW").click();
    }
  },
  false
);

// REQ-BODY FORM
document.querySelector("#defaultOpenREQBODYFORM").addEventListener(
  "click",
  function () {
    CONTENT_TYPE = [
      "application/x-www-form-urlencoded",
      "multipart/form-data",
      "text/plain",
    ];
    var select = document.querySelector("#ContentTypeSel");
    select.innerHTML = "";
    for (var i = 0; i < CONTENT_TYPE.length; i++) {
      var opt = document.createElement("option");
      opt.value = i;
      opt.innerText = CONTENT_TYPE[i];
      select.appendChild(opt);
    }

    ContentType = "application/x-www-form-urlencoded";
    req_body_position = 1;
    document.querySelector("#REQBODYFORM").style.display = "block";
    document.querySelector("#REQBODYRAW").style.display = "none";
    document.querySelector("#defaultOpenREQBODYFORM").style.backgroundColor =
      "#1868E5";
    document.querySelector("#defaultOpenREQBODYRAW").style.backgroundColor =
      "#f1f3f4";
  },
  false
);

// REQ-BODY RAW
document.querySelector("#defaultOpenREQBODYRAW").addEventListener(
  "click",
  function () {
    CONTENT_TYPE = [
      "application/x-www-form-urlencoded",
      "text/plain",
      "application/json",
      "application/xml",
      "application/javascript",
      "multipart/form-data; boundary=----WebKitFormBoundaryywB1rOnmpPkpqWtC",
    ];
    var select = document.querySelector("#ContentTypeSel");
    select.innerHTML = "";
    for (var i = 0; i < CONTENT_TYPE.length; i++) {
      var opt = document.createElement("option");
      opt.value = i;
      opt.innerText = CONTENT_TYPE[i];
      select.appendChild(opt);
    }

    ContentType = "application/x-www-form-urlencoded";
    req_body_position = 2;
    document.querySelector("#REQBODYFORM").style.display = "none";
    document.querySelector("#REQBODYRAW").style.display = "block";
    document.querySelector("#defaultOpenREQBODYRAW").style.backgroundColor =
      "#1868E5";
    document.querySelector("#defaultOpenREQBODYFORM").style.backgroundColor =
      "#f1f3f4";
  },
  false
);

// HEADER FORM
document.querySelector("#defaultOpenHEADERFORM").addEventListener(
  "click",
  function () {
    header_position = 1;
    var header_raw = document.querySelector("#HEADERRAW-TEXTAREA").value;
    var header_raws = header_raw.split("\n");
    flag = false;
    for (var i = 0; i < header_raws.length; i++) {
      if (header_raws[i].indexOf(":") === -1) {
        continue;
      }
      var key = header_raws[i].split(":", 1)[0];
      var val = header_raws[i].replace(key + ":", "");
      key = key.trim();
      if (key === "") {
        continue;
      }
      flag = true;
      break;
    }
    if (flag) {
      document.querySelector("#HEADER-FORM").innerHTML = "";
      for (var i = 0; i < header_raws.length; i++) {
        var key = header_raws[i].split(":", 1)[0];
        var val = header_raws[i].replace(key + ":", "");
        key = key.trim();
        if (key === "" || key.toLowerCase() === "content-type") {
          continue;
        }
        val = val.trim();
        $(document.getElementById("HEADER-ADD")).trigger("click", [key, val]);
      }
    }

    document.querySelector("#HEADERFORM").style.display = "block";
    document.querySelector("#HEADERRAW").style.display = "none";
    document.querySelector("#defaultOpenHEADERFORM").style.backgroundColor =
      "#1868E5";
    document.querySelector("#defaultOpenHEADERRAW").style.backgroundColor =
      "#f1f3f4";
  },
  false
);

// HEADER RAW
document.querySelector("#defaultOpenHEADERRAW").addEventListener(
  "click",
  function () {
    // 如果FORM区域不为空，则转换格式
    var key = document.querySelectorAll("#h-key");
    var val = document.querySelectorAll("#h-val");
    var header_raw = "";
    for (var i = 0; i < key.length; i++) {
      if (key[i].value === "") {
        continue;
      }
      header_raw += key[i].value + ": " + val[i].value + "\n";
    }
    document.querySelector("#HEADERRAW-TEXTAREA").value = header_raw.trim();

    header_position = 2;
    document.querySelector("#HEADERFORM").style.display = "none";
    document.querySelector("#HEADERRAW").style.display = "block";
    document.querySelector("#defaultOpenHEADERRAW").style.backgroundColor =
      "#1868E5";
    document.querySelector("#defaultOpenHEADERFORM").style.backgroundColor =
      "#f1f3f4";
  },
  false
);

document.getElementById("defaultOpenREQBODYRAW").click();
document.getElementById("defaultOpenHEADERFORM").click();

// RequestMethod
document.querySelector("#METHOD > select").addEventListener(
  "change",
  function (event) {
    Request_Method = METHODS[event.target.value];
  },
  false
);

document.querySelector("#ContentTypeVal > select").addEventListener(
  "change",
  function (event) {
    ContentType = CONTENT_TYPE[event.target.value];
    if (
      ContentType ===
      "multipart/form-data; boundary=----WebKitFormBoundaryywB1rOnmpPkpqWtC"
    ) {
      document.querySelector(
        "#REQBODYRAW-TEXTAREA"
      ).value = `------WebKitFormBoundaryywB1rOnmpPkpqWtC
Content-Disposition: form-data; name="filename"; filename="test.jpeg"
Content-Type: image/jpeg

file-content
------WebKitFormBoundaryywB1rOnmpPkpqWtC--
Content-Disposition: form-data; name="name"
        
value
------WebKitFormBoundaryywB1rOnmpPkpqWtC--`;
    }
  },
  false
);

// XHR Button
document.querySelector("#XHR").addEventListener(
  "click",
  function (event) {
    if (Request_IsXHR) {
      Request_IsXHR = false;
      document.querySelector("#XHR").style.backgroundColor = "rgb(241 243 244)";
    } else {
      Request_IsXHR = true;
      document.querySelector("#XHR").style.backgroundColor = "#1868E5";
    }
    console.log(Request_IsXHR);
  },
  false
);

// 选中文字
// 先选中decode/encode，在选中需要加解密的地方
$(document).ready(function () {
  $("body").mouseup(function (e) {
    var txt = window.getSelection();
    if (txt.toString().length >= 1 && ENC !== "DECODE") {
      console.log("ENCTYPE", ENC, txt.toString());
      // 编码 txt.toString() 部分后
      var sources = txt.toString();
      try {
        var enc = edncode(ENC, txt.toString());
      } catch (e) {
        return $.growl.error({
          title: "ERROR",
          message: e,
        });
      }
      console.log();
      if (
        e.target.value === undefined ||
        e.target.value.indexOf(sources) === -1
      ) {
        return;
      }
      e.target.value = e.target.value.replace(sources, enc);
      ENC = "DECODE";
    }
  });
});

function edncode(flag, source) {
  var SHA1 = new Hashes.SHA1();
  var SHA256 = new Hashes.SHA256();
  var SHA512 = new Hashes.SHA512();
  var MD5 = new Hashes.MD5();
  switch (flag) {
    case "URL Encode":
      return encodeURI(source);
    case "URL Deep Encode":
      return encodeURIComponent(source);
    case "Base64 Encode":
      return btoa(source);
    case "Hex Encode":
      return String2Hex(source);
    case "Unicode Encode":
      return String2Uni(source);
    case "MD5":
      return MD5.hex(source);
    case "SHA1":
      return SHA1.hex(source);
    case "SHA256":
      return SHA256.hex(source);
    case "SHA512":
      return SHA512.hex(source);
    case "URL Decode":
      return decodeURI(source);
    case "URL Deep Decode":
      return decodeURIComponent(source);
    case "Base64 Decode":
      return atob(source);
    case "Hex Decode":
      return Hex2String(source);
    case "Unicode Decode":
      return Uni2String(source);
    default:
      $.growl.error({
        title: "ERROR",
        message: "Unknown Crypto",
      });
      return;
  }
}

function String2Uni(s) {
  var result = "";
  for (var i = 0; i < s.length; i++) {
    // Assumption: all characters are < 0xffff
    result += "\\u" + ("000" + s[i].charCodeAt(0).toString(16)).substr(-4);
  }
  return result;
}

function Uni2String(s) {
  return decodeURIComponent(JSON.parse('"' + s + '"'));
}

function String2Hex(s) {
  // utf8 to latin1
  var s = unescape(encodeURIComponent(s));
  var h = "";
  for (var i = 0; i < s.length; i++) {
    h += s.charCodeAt(i).toString(16);
  }
  return h;
}

function Hex2String(h) {
  var s = "";
  for (var i = 0; i < h.length; i += 2) {
    s += String.fromCharCode(parseInt(h.substr(i, 2), 16));
  }
  return decodeURIComponent(escape(s));
}

// jquery 消息弹窗
// $.growl({
//     title: '消息标题',
//     message: '消息内容!',
// })
// $.growl.error({
//     title: 'ERROR',
//     message: 'xxxx',
// })
// $.growl.notice({
//     title: '提醒标题',
//     message: '提醒消息内容!',
// })
// return $.growl.warning({
//     title: '警告标题',
//     message: '警告消息内容!',
// })
