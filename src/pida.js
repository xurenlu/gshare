'use strict';
const _pida = (function () {
    let ObjProto = Object.prototype;
    let ArrayProto = Array.prototype;
    let toString = ObjProto.toString;
    let nativeIsArray = Array.isArray;
    let slice = ArrayProto.slice;
    let hasOwnProperty = ObjProto.hasOwnProperty;

    let navigator$1 = window.navigator;
    let document$1 = window.document;
    let userAgent = navigator$1.userAgent;
    let FuncProto = Function.prototype;
    let nativeBind = FuncProto.bind;
    let nativeForEach = ArrayProto.forEach;
    let nativeIndexOf = ArrayProto.indexOf;
    let breaker = {};
    const _ = {
        trim: function (str) {
            return str.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
        }
    };
    _.isElement = function (obj) {
        return !!(obj && obj.nodeType === 1);
    };
    _.isObject = function (obj) {
        return (obj === Object(obj) && !_.isArray(obj));
    };
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };

    _.bind = function (func, context) {
        let args, bound;
        if (nativeBind && func.bind === nativeBind) {
            return nativeBind.apply(func, slice.call(arguments, 1));
        }
        if (!_.isFunction(func)) {
            throw new TypeError();
        }
        args = slice.call(arguments, 2);
        bound = function () {
            if (!(this instanceof bound)) {
                return func.apply(context, args.concat(slice.call(arguments)));
            }
            let ctor = {};
            ctor.prototype = func.prototype;
            let self = new ctor();
            ctor.prototype = null;
            let result = func.apply(self, args.concat(slice.call(arguments)));
            if (Object(result) === result) {
                return result;
            }
            return self;
        };
        return bound;
    };
    _.bind_instance_methods = function (obj) {
        for (let func in obj) {
            if (typeof (obj[func]) === 'function') {
                obj[func] = _.bind(obj[func], obj);
            }
        }
    };
    _.each = function (obj, iterator, context) {
        if (obj === null || obj === undefined) {
            return;
        }
        if(obj instanceof chainable){
            _.each(obj.elements,iterator,context);
            return;
        }
        if (nativeForEach && obj.forEach === nativeForEach) {
            obj.forEach(iterator, context);
        } else if (obj.length === +obj.length) {
            for (let i = 0, l = obj.length; i < l; i++) {
                if (i in obj && iterator.call(context, obj[i], i, obj) === breaker) {
                    return;
                }
            }
        } else {
            for (let key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    if (iterator.call(context, obj[key], key, obj) === breaker) {
                        return;
                    }
                }
            }
        }
    };
    _.extend = function (obj) {
        _.each(slice.call(arguments, 1), function (source) {
            for (let prop in source) {
                if (source[prop] !== void 0) {
                    obj[prop] = source[prop];
                }
            }
        });
        return obj;
    };
    _.isArray = nativeIsArray || function (obj) {
        return toString.call(obj) === '[object Array]';
    };
    _.isFunction = function (f) {
        try {
            return /^\s*\bfunction\b/.test(f);
        } catch (x) {
            return false;
        }
    };

    _.isArguments = function (obj) {
        return !!(obj && hasOwnProperty.call(obj, 'callee'));
    };

    _.toArray = function (iterable) {
        if (!iterable) {
            return [];
        }
        if (iterable.toArray) {
            return iterable.toArray();
        }
        if (_.isArray(iterable)) {``
            return slice.call(iterable);
        }
        if (_.isArguments(iterable)) {
            return slice.call(iterable);
        }
        return _.values(iterable);
    };

    _.values = function (obj) {
        let results = [];
        if (obj === null) {
            return results;
        }
        _.each(obj, function (value) {
            results[results.length] = value;
        });
        return results;
    };

    _.identity = function (value) {
        return value;
    };

    _.include = function (obj, target) {
        let found = false;
        if (obj === null) {
            return found;
        }
        if (nativeIndexOf && obj.indexOf === nativeIndexOf) {
            return obj.indexOf(target) !== -1;
        }
        _.each(obj, function (value) {
            if (found || (found = (value === target))) {
                return breaker;
            }
        });
        return found;
    };

    _.includes = function (str, needle) {
        return str.indexOf(needle) !== -1;
    };

    _.isEmptyObject = function (obj) {
        if (_.isObject(obj)) {
            for (let key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    return false;
                }
            }
            return true;
        }
        return false;
    };

    _.isUndefined = function (obj) {
        return obj === void 0;
    };

    _.isString = function (obj) {
        return toString.call(obj) === '[object String]';
    };

    _.isDate = function (obj) {
        return toString.call(obj) === '[object Date]';
    };

    _.isNumber = function (obj) {
        return toString.call(obj) === '[object Number]';
    };

    _.timestamp = function () {
        Date.now = Date.now || function () {
            return +new Date;
        };
        return Date.now();
    };

    _.strip_empty_properties = function (p) {
        let ret = {};
        _.each(p, function (v, k) {
            if (_.isString(v) && v.length > 0) {
                ret[k] = v;
            }
        });
        return ret;
    };

    function getAllChildren(e) {
        if(e) {
            return e.all ? e.all : e.getElementsByTagName('*');
        }else{
            return [];
        }
    }

    let bad_whitespace = /[\t\r\n]/g;

    function hasClass(elem, selector) {
        let className = ' ' + selector + ' ';
        return ((' ' + elem.className + ' ').replace(bad_whitespace, ' ').indexOf(className) >= 0);
    }

    function getElementsBySelector(selector,root) {
        if (!window.document.getElementsByTagName) {
            return [];
        }
        let tokens = selector.split(' ');
        let token, bits, tagName, found, foundCount, i, j, k, elements, currentContextIndex;
        let currentContext;
        if(!root){
            currentContext = [window.document];
        }else{
            if(_.isArray(root)) {
                currentContext = root;
            }else {
                currentContext = [root];
            }
        }

        for (i = 0; i < tokens.length; i++) {
            token = tokens[i].replace(/^\s+/, '').replace(/\s+$/, '');
            if (token.indexOf('#') > -1) {
                bits = token.split('#');
                tagName = bits[0];
                let id = bits[1];
                let element = window.document.getElementById(id);
                if (!element || (tagName && element.nodeName.toLowerCase() !== tagName)) {
                    return [];
                }

                currentContext = [element];
                continue; // Skip to next token
            }
            if (token.indexOf('.') > -1) {
                bits = token.split('.');
                tagName = bits[0];
                let className = bits[1];
                if (!tagName) {
                    tagName = '*';
                }

                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName === '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (found[j].className &&
                        _.isString(found[j].className) &&
                        hasClass(found[j], className)
                    ) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                continue;
            }

            let token_match = token.match(/^(\w*)\[(\w+)([=~\|\^\$\*]?)=?"?([^\]"]*)"?\]$/);
            if (token_match) {
                tagName = token_match[1];
                let attrName = token_match[2];
                let attrOperator = token_match[3];
                let attrValue = token_match[4];
                if (!tagName) {
                    tagName = '*';
                }

                found = [];
                foundCount = 0;
                for (j = 0; j < currentContext.length; j++) {
                    if (tagName === '*') {
                        elements = getAllChildren(currentContext[j]);
                    } else {
                        elements = currentContext[j].getElementsByTagName(tagName);
                    }
                    for (k = 0; k < elements.length; k++) {
                        found[foundCount++] = elements[k];
                    }
                }
                currentContext = [];
                currentContextIndex = 0;
                let checkFunction; // This function will be used to filter the elements
                switch (attrOperator) {
                    case '=': // Equality
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName) === attrValue);
                        };
                        break;
                    case '~': // Match one of space seperated words
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName).match(new RegExp('\\b' + attrValue + '\\b')));
                        };
                        break;
                    case '|': // Match start with value followed by optional hyphen
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName).match(new RegExp('^' + attrValue + '-?')));
                        };
                        break;
                    case '^': // Match starts with value
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) === 0);
                        };
                        break;
                    case '$': // Match ends with value - fails with "Warning" in Opera 7
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName).lastIndexOf(attrValue) === e.getAttribute(attrName).length - attrValue.length);
                        };
                        break;
                    case '*': // Match ends with value
                        checkFunction = function (e) {
                            return (e.getAttribute(attrName).indexOf(attrValue) > -1);
                        };
                        break;
                    default:
                        checkFunction = function (e) {
                            return e.getAttribute(attrName);
                        };
                }
                currentContext = [];
                currentContextIndex = 0;
                for (j = 0; j < found.length; j++) {
                    if (checkFunction(found[j])) {
                        currentContext[currentContextIndex++] = found[j];
                    }
                }
                continue; // Skip to next token
            }
            tagName = token;
            found = [];
            foundCount = 0;
            for (j = 0; j < currentContext.length; j++) {
                elements = currentContext[j].getElementsByTagName(tagName);
                for (k = 0; k < elements.length; k++) {
                    found[foundCount++] = elements[k];
                }
            }
            currentContext = found;
        }
        return currentContext;
    }
    class chainable{
        elements=[];
        constructor(list) {
            this.elements = list
        }
        $(selector,root){
            return _.$(selector,root);
        }
        html(data){
            if(arguments.length===0){
                let results = []
                for(let obj of this.elements){
                    results.push(obj.innerHTML);
                }
                return results.join("")
            }else{
                for(let obj of this.elements){
                    obj.innerHTML = data;
                }
            }
            return this;
        }
        text(data){
            if(arguments.length===0){
                let results = []
                for(let obj of this.elements){
                    results.push(obj.innerText);
                }
                return results.join("")
            }else{
                for(let obj of this.elements){
                    obj.innerText = data;
                }
            }
            return this;
        }
        hide(data){
            for(let obj of this.elements){
                obj.hidden = true;
                if(obj.style.display) {
                    obj.setAttribute("data-old-display",obj.style.display);
                    obj.style.display="none";
                }
            }
            return this;
        }
        toggle(){
            for(let obj of this.elements){
                if(obj.hidden){
                    $(obj).show();
                }else{
                    $(obj).hide();
                }
            }
            return this;
        }
        show(){
            for(let obj of this.elements){
                obj.hidden = false;
                if(obj.getAttribute("data-old-display")){
                    obj.style.display = obj.getAttribute("data-old-display");
                }
            }
            return this
        }
        *[Symbol.iterator]() {
            for(let item of this.elements){
                yield new chainable([item]);
            }
        }
        on(event,callback){
            for(let item of this.elements) {
                _.addListener(item,event,callback);
            }
            return this
        }
        val(data){
            if(arguments.length===0){
                let results = []
                for(let obj of this.elements){
                    results.push(obj.value);
                }
                return results.join("")
            }else{
                for(let obj of this.elements){
                    obj.value = data;
                }
            }
            return this;
        }
        addClass(klass){
            for(let obj of this.elements){
                obj.value.classList.add(klass)
            }
            return this;
        }
        removeClass(klass){
            for(let obj of this.elements){
                obj.value.classList.remove(klass)
            }
            return this;
        }
        each(callback,context){
            _.each(this.elements,callback,context);
        }
    }
    _.$ = function (query,root) {
        if (_.isElement(query)) {
            return new chainable([query]);
        }
        if (!_.isString(query)){
            throw Error("query must be string or HTMLElement")
        }
        if(root===undefined){
            return new chainable(getElementsBySelector.call(this,query));
        }
        if (root instanceof chainable) {
            return new chainable(getElementsBySelector.call(this,query,root.elements));
        } else {
            return new chainable(getElementsBySelector.call(this, query, root));
        }
    };
    _.cookie = {
        get: function (name) {
            let nameEQ = name + '=';
            let ca = document$1.cookie.split(';');
            for (let i = 0; i < ca.length; i++) {
                let c = ca[i];
                while (c.charAt(0) === ' ') {
                    c = c.substring(1, c.length);
                }
                if (c.indexOf(nameEQ) === 0) {
                    return decodeURIComponent(c.substring(nameEQ.length, c.length));
                }
            }
            return null;
        },
        set: function (name, value, days, cross_subdomain, is_secure) {
            let cdomain = '', expires = '', secure = '';
            if (cross_subdomain) {
                let matches = document$1.location.hostname.match(/[a-z0-9][a-z0-9\-]+\.[a-z\.]{2,6}$/i),
                    domain = matches ? matches[0] : '';
                cdomain = ((domain) ? '; domain=.' + domain : '');
            }
            if (days) {
                let date = new Date();
                date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
                expires = '; expires=' + date.toGMTString();
            }

            if (is_secure) {
                secure = '; secure';
            }

            let new_cookie_val = name + '=' + encodeURIComponent(value) + expires + '; path=/' + cdomain + secure;
            document$1.cookie = new_cookie_val;
            return new_cookie_val;
        }


    };

    _.info = {
        browser: function (user_agent, vendor, opera) {
            vendor = vendor || ''; // vendor is undefined for at least IE9
            if (opera || _.includes(user_agent, ' OPR/')) {
                if (_.includes(user_agent, 'Mini')) {
                    return 'Opera Mini';
                }
                return 'Opera';
            } else if (/(BlackBerry|PlayBook|BB10)/i.test(user_agent)) {
                return 'BlackBerry';
            } else if (_.includes(user_agent, 'IEMobile') || _.includes(user_agent, 'WPDesktop')) {
                return 'Internet Explorer Mobile';
            } else if (_.includes(user_agent, 'Edge')) {
                return 'Microsoft Edge';
            } else if (_.includes(user_agent, 'FBIOS')) {
                return 'Facebook Mobile';
            } else if (_.includes(user_agent, 'Chrome')) {
                return 'Chrome';
            } else if (_.includes(user_agent, 'CriOS')) {
                return 'Chrome iOS';
            } else if (_.includes(user_agent, 'UCWEB') || _.includes(user_agent, 'UCBrowser')) {
                return 'UC Browser';
            } else if (_.includes(user_agent, 'FxiOS')) {
                return 'Firefox iOS';
            } else if (_.includes(vendor, 'Apple')) {
                if (_.includes(user_agent, 'Mobile')) {
                    return 'Mobile Safari';
                }
                return 'Safari';
            } else if (_.includes(user_agent, 'Android')) {
                return 'Android Mobile';
            } else if (_.includes(user_agent, 'Konqueror')) {
                return 'Konqueror';
            } else if (_.includes(user_agent, 'Firefox')) {
                return 'Firefox';
            } else if (_.includes(user_agent, 'MSIE') || _.includes(user_agent, 'Trident/')) {
                return 'Internet Explorer';
            } else if (_.includes(user_agent, 'Gecko')) {
                return 'Mozilla';
            } else {
                return '';
            }
        },
        browserVersion: function (userAgent, vendor, opera) {
            let browser = _.info.browser(userAgent, vendor, opera);
            let versionRegexs = {
                'Internet Explorer Mobile': /rv:(\d+(\.\d+)?)/,
                'Microsoft Edge': /Edge\/(\d+(\.\d+)?)/,
                'Chrome': /Chrome\/(\d+(\.\d+)?)/,
                'Chrome iOS': /CriOS\/(\d+(\.\d+)?)/,
                'UC Browser': /(UCBrowser|UCWEB)\/(\d+(\.\d+)?)/,
                'Safari': /Version\/(\d+(\.\d+)?)/,
                'Mobile Safari': /Version\/(\d+(\.\d+)?)/,
                'Opera': /(Opera|OPR)\/(\d+(\.\d+)?)/,
                'Firefox': /Firefox\/(\d+(\.\d+)?)/,
                'Firefox iOS': /FxiOS\/(\d+(\.\d+)?)/,
                'Konqueror': /Konqueror:(\d+(\.\d+)?)/,
                'BlackBerry': /BlackBerry (\d+(\.\d+)?)/,
                'Android Mobile': /android\s(\d+(\.\d+)?)/,
                'Internet Explorer': /(rv:|MSIE )(\d+(\.\d+)?)/,
                'Mozilla': /rv:(\d+(\.\d+)?)/
            };
            let regex = versionRegexs[browser];
            if (regex === undefined) {
                return null;
            }
            let matches = userAgent.match(regex);
            if (!matches) {
                return null;
            }
            return parseFloat(matches[matches.length - 2]);
        },

        os: function () {
            let a = userAgent;
            if (/Windows/i.test(a)) {
                if (/Phone/.test(a) || /WPDesktop/.test(a)) {
                    return 'Windows Phone';
                }
                return 'Windows';
            } else if (/(iPhone|iPad|iPod)/.test(a)) {
                return 'iOS';
            } else if (/Android/.test(a)) {
                return 'Android';
            } else if (/(BlackBerry|PlayBook|BB10)/i.test(a)) {
                return 'BlackBerry';
            } else if (/Mac/i.test(a)) {
                return 'Mac OS X';
            } else if (/Linux/.test(a)) {
                return 'Linux';
            } else {
                return '';
            }
        },

        referringDomain: function (referrer) {
            let split = referrer.split('/');
            if (split.length >= 3) {
                return split[2];
            }
            return '';
        },

        properties: function () {
            let ref = document$1.referrer;
            if (ref.length > 255) {
                ref = ref.substring(0, 255);
            }
            return _.extend(_.strip_empty_properties({
                'os': _.info.os(),
                'browser': _.info.browser(userAgent, navigator$1.vendor, window.opera),
                'referrer': ref,
            }), {
                'current_url': window.location.href,
                'browser_version': _.info.browserVersion(userAgent, navigator$1.vendor, window.opera)
            });
        }
    };
    _.addListener = (function () {
        let register_single_event = function (element, type, handler, oldSchool, useCapture) {
            if (!element) {
                console$1.error('No valid element provided to register_single_event');
                return;
            }
            if (element.addEventListener && !oldSchool) {
                element.addEventListener(type, handler, !!useCapture);
            } else {
                let ontype = 'on' + type;
                let old_handler = element[ontype]; // can be undefined
                element[ontype] = makeHandler(element, handler, old_handler);
            }
        };

        function makeHandler(element, new_handler, old_handlers) {
            return function (event) {
                event = event || fixEvent(window.event);
                if (!event) {
                    return undefined;
                }
                let ret = true;
                let old_result, new_result;

                if (_.isFunction(old_handlers)) {
                    old_result = old_handlers(event);
                }
                new_result = new_handler.call(element, event);
                if ((false === old_result) || (false === new_result)) {
                    ret = false;
                }
                return ret;
            };
        }

        function fixEvent(event) {
            if (event) {
                event.preventDefault = fixEvent.preventDefault;
                event.stopPropagation = fixEvent.stopPropagation;
            }
            return event;
        }

        fixEvent.preventDefault = function () {
            this.returnValue = false;
        };
        fixEvent.stopPropagation = function () {
            this.cancelBubble = true;
        };
        return function (element, type, handler, oldSchool, useCapture) {
            if (_.isElement(element)) {
                register_single_event(element, type, handler, oldSchool, useCapture);
            } else if (_.isArray(element)) {
                _.each(element, (item) => {
                    register_single_event(item, type, handler, oldSchool, useCapture);
                });
            }
        };
    })()
    let ie = !!(window.attachEvent && !window.opera);
    let wk = /webkit\/(\d+)/i.test(navigator.userAgent) && (RegExp.$1 < 525);
    let fn = [];
    let run = function () {
        for (let i = 0; i < fn.length; i++) fn[i]();
    };
    let d = document;
    _.onDomReady = (f) => {
        if (!ie && !wk && d.addEventListener) {
            return d.addEventListener('DOMContentLoaded', f, false);
        }
        if (fn.push(f) > 1) {
            return;
        }
        if (ie) {
            (function () {
                try {
                    d.documentElement.doScroll('left');
                    run();
                } catch (err) {
                    setTimeout(arguments.callee, 10);
                }
            })();
        } else if (wk) {
            let t = setInterval(function () {
                if (/^(loaded|complete)$/.test(d.readyState))
                    clearInterval(t), run();
            }, 10);
        }
    };
    _.jshook = {
        "pida_hooks": {},
        "add": function (hook_type, func) {
            _.jshook["pida_hooks"][hook_type] = func;
        },
        "init": function () {

            _.addListener(document.body, 'click', function (e) {
                e = e || window.event;
                try {
                    let hook_name = (e.target).getAttribute("data-pida-hook");
                    if (hook_name && _.jshook["pida_hooks"][hook_name]) {
                        _.jshook["pida_hooks"][hook_name].apply(e.target);
                        return false;
                    }
                } catch (ex) {
                    console.log("unknown error"+ex);
                }
            }, false, true);
        }
    };
    const initXhr = (options,resolve,reject)=>{
        if( !options){
            options = {}
        }
        let xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");
        xhr.withCredentials = options.withCredentials||false;
        xhr.timeout = options.timeout || 10*1000;

        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if( xhr.status === 200) {
                    try {
                        let json = JSON.parse(xhr.responseText);
                        resolve && resolve.call(xhr, json)
                    } catch (err) {
                        resolve && resolve.call(err)
                    }
                }else{
                    reject.call(xhr,"status not 200")
                }
            }
        }

        xhr.onerror = function(e){
            reject.call(xhr,e);
        }

        if(options.on) {
            for (let idx of ["abort", "load", "loaded", "loadstart", "progress", "timeout"]) {
                if(options.on[idx]) {
                    xhr["on"+idx] = options.on[idx];
                }
            }
        }

        return xhr;
    }
    _.post  = (url,options,data)=>{
        console.log("try post data ")
        console.log(data)
        return new Promise((resolve,reject)=>{
            let xhr = initXhr(options,resolve,reject);
            xhr.open('POST',url);
            if(options.headers){
                _.each(options.headers,(item,name)=> {
                    xhr.setRequestHeader(name,options.headers[name]);
                });
            }
            let name = "Object"
            try {
                name = Object.prototype.toString.call(data).match(/\[object (.*?)\]/)[1]
            }catch (e){

            }
            if(_.isString(data) || "FormData"===name){
                xhr.send(data)
            }else{
                xhr.send(JSON.stringify(data));
            }

        });
    }
    _.get = (url,options)=>{
        return new Promise((resolve,reject)=>{
            let xhr = initXhr(options,resolve,reject);
            xhr.open('GET',url);
            if(options.headers){
                _.each(options.headers,(item,name)=> {

                    xhr.setRequestHeader(name,options.headers[name]);
                });
            }
            xhr.send()
        });
    }
    _.chainable = chainable;
    return _;
})();
export default _pida;