import pida from "./pida"

export default () => {
    let obj = {
        selectedText:""
    }
    let rootId = "b-drag-div"
    let E = "bsMorePanelHolder"
    let u = !1, q, p, o;
    const stopProp = (a) => {
        a = a || e.event || {};
        a.stopPropagation ? a.stopPropagation() : a.cancelBubble = !0
    }
    const loadStyle = (a) => {
        let b = document.createElement("style");
        b.setAttribute("type", "text/css");
        b.styleSheet ? b.styleSheet.cssText = a : b.appendChild(document.createTextNode(a));
        console.log(b)
        document.getElementsByTagName("head")[0].appendChild(b)
    }
    const defaultSetup = () => {
        let a;
        let o = "Gotapi.net提供划词支持";
        let d = a * 36;
        let e = 16 * (o.length + 1) + 16;

        a = "#" + rootId + " {position:absolute;background-color:#fff;*display:inline;zoom:1;display:inline-block;display:none;}\n";
        a += ".gotapi-drag-wrapper {padding:2px 10px;border:2px solid rgb(8,63,12);border-radius:8px;overflow:hidden;width:" + (Math.min(d, e)) + "px;}\n";
        a += ".gotapi-drag-wrapper .gotapi-bottom { border-top:1px solid #e9e9e9;text-indent:2em;height:25px;*height:18px;font-size:15px;padding:2px;color:#aaa; }";
        a += ".gotapi-drag-arrow {position:absolute;margin:-4px 40px;width:10px;height:5px;background:url(/assets/arrow.gif) no-repeat;}\n";
        a += ".gotapi-drag-wrapper .gotapicaptain {display:block;background:#fff;overflow:hidden;height:25px;*height:18px;font-size:15px;}\n";
        a += ".gotapi-drag-wrapper .gotapicaptain span {float:left;}\n";
        a += ".gotapi-drag-wrapper .gotapicaptain .gpclose {cursor:pointer;float:right;font-family:Arial,\u5b8b\u4f53,sans-serif;font-weight:bold;width:22px;height:22px;text-align:center;position:relative;right:2px;top:2px;}\n";
        a += ".gotapi-drag-wrapper .gotapi-list {height:40px;margin-top:5px;}\n";
        a += ".gotapi-drag-wrapper .gotapi-list .listitem {float:left;height:30px;width:34px;margin:0 1px;padding:5px 0 0;cursor:pointer;text-align:center;list-style:none;zoom:1;vertical-align:top;}\n";
        a += ".gotapi-drag-wrapper .gotapi-list .listitem:hover {border-radius:3px;background-color:#e9e9e9;}\n";
        a += ".gotapi-drag-wrapper .gotapi-list .gotapiicon {width:24px;height:24px;margin:0 auto;display:block;}\n";
        a += ".gotapi-drag-wrapper .gotapi-popup-content { padding-top:15px; \n}";
        loadStyle(a);
        pida.addListener(document.body,"click",(evt)=>{
            if(evt.target.getAttribute("data-close")) {

                let target = evt.target.getAttribute("data-target")
                console.log(pida.$("#"+target));

                try {
                    obj.shown = false;
                    pida.$("#"+target).hide();

                } catch (e) {

                }
            }
        });
    };
    const defaultLeftHandler = () => {
        let c = '<div class="gotapi-list">';
        c = c + '<span class="gotapi-drag-arrow BSHARE_IMAGE_NO"></span>';
        c = c + '<div class="gotapi-drag-wrapper">'
        c = c +     '<div class="gotapicaptain">'
            + '<a class="gpclose" title="close" ><img data-close="true" src="https://static.yuanfenxi.com/gshare/close.svg" widht="22" height="22" class="data-close-popup" data-target="'+rootId+'"/></a></div>'

      c += "<div class='gotapi-popup-content'>"

        return c;
    }
    const defaultRightHandler = () => {
        return "</div>"
        +'<div class="gotapi-bottom"><span>Gotapi提供划词支持...</span>'
           + '</div>'+"</div></div>";
    }
    const defaultMainHandler = (selectedText) => {
        return "这是一段需要自定义的文字";
    }
    const position = (a) => {
        return {
            left: a.pageX || a.clientX + eventCallbacks.scrollLeft - eventCallbacks.clientLeft,
            top: a.pageY || a.clientY + eventCallbacks.scrollTop - eventCallbacks.clientTop
        }
    }
    const getSelectText = ()=>{
        let selectedText = "";
        if (window.getSelection) {
            selectedText = window.getSelection().toString();
        } else if (document.getSelection) {
            selectedText = document.getSelection();
        } else if (document.selection) try {
            selectedText = document.selection.createRange().text
        } catch (c) {
        }
        return selectedText;
    }

    const eventCallbacks = {
        onmousedown: function (a) {
            p = position(a || window.event)
        },
        onmouseup: function (event) {
            event = event || window.event;
            q = position(event);
            if (!p || !q || p.left !== q.left || p.top !== q.top) {
                u = true;
            }
            let selectedText = getSelectText();
            if (selectedText.length !== 0 && u &&!obj.shown) {
                let point = position(event);
                obj.selectedText = selectedText;
                setTimeout(function () {
                    defaultPopupCallback(point);
                    obj.options.popupCallback(point);
                    obj.shown = true;
                }, 100);
                u = !1;
                stopProp(event)
            }

        }
    };

    const getHTML = ()=>{
        let options = obj.options;
        return options.leftHandler(options) + options.mainHandler(options,getSelectText()) + options.rightHandler(options);
    }

    const defaultPopupCallback = (point)=>{
        let j = document.getElementById(rootId);
        j.style.top = point.top + 15 + "px";
        j.style.left = point.left - 40 + "px";
        j.style.display = "inline-block"
    }

    const getPopupElement= ()=>{
        return document.getElementById(rootId);
    }
    const setup = (options) => {
        if (!options.setupHandler) {
            options.setupHandler = defaultSetup;
        }
        if (!options.mainHandler) {
            options.mainHandler = defaultMainHandler;
        }
        if (!options.leftHandler) {
            options.leftHandler = defaultLeftHandler;
        }
        if (!options.rightHandler) {
            options.rightHandler = defaultRightHandler;
        }
        if (!options.popupCallback) {
            options.popupCallback = defaultPopupCallback;
        }
        if(!options.trigger) {
            options.trigger = ".gotapi-share"
        }
        console.log(options)
        options.setupHandler(options);
        obj.options = options;
        let html = getHTML();
        let j = document.getElementById(rootId);
        if (!j) {
            j = document.createElement("div")
            j.innerHTML = html
            j.setAttribute("id", rootId)
            document.body.appendChild(j)
        }


        pida.$(options.trigger).on("mousedown", eventCallbacks.onmousedown);
        pida.$(options.trigger).on("mouseup", eventCallbacks.onmouseup);
        pida.addListener(document.body, "mouseup", (a) => {
            a = a || window.event;
            for (a = a.srcElement || a.target; a;) {
                if (a.id === rootId || a.id === E) return;
                a = a.parentNode
            }
            j.style.display = "none";
        });
    }


    obj.defaultSetup = defaultSetup
    obj.defaultLeftHandler = defaultLeftHandler;
    obj.defaultMainHandler = defaultMainHandler;
    obj.defaultRightHandler = defaultRightHandler;
    obj.defaultPopupCallback = defaultPopupCallback;
    obj.getPopupElement = getPopupElement;
    obj.getHtml = getHTML;
    obj.init = setup;
    obj.loadStyle = loadStyle;
    return obj;
}