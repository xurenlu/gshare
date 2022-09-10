//pida.onDomReady(()=>{
import pida from 'pida'
import beselected from "beselected";
(function(secret) {
    const staticHost = "https://static.yuanfenxi.com/"
    let goldImg = staticHost + "gshare/gold.png"
    let weiboImg = staticHost + 'gshare/weibo.svg'
    let twitterImg = staticHost + "gshare/twitter.svg"

    const purify = (text) => {
        return text.replaceAll("'", "").replaceAll('"', '')
    }
    let se = beselected()
    
        se.init({
            trigger:document.body,
            popupCallback: (point) => {
                let root = se.getPopupElement();
                root.innerHTML = se.getHtml();
            },
            rightHandler:()=>{
                return "</div>"
                    +'<div class="gotapi-bottom"><span>金句卡片生成较慢。请耐心等几秒...</span>'
                    + '</div>'+"</div></div>";
            },
            mainHandler: (text) => {
                console.log("main handler called");


                let html = "<form id='share-form-gotapi'  method='GET'  action='https://service.weibo.com/share/share.php' target='_blank'>";
                html += "<div data-theme='light' class='share-body'> <textarea name='title' style='display: block;'>";
                html += purify(se.selectedText) + "</textarea>";
                html += '<input type="hidden" id="gotapi_form_url" name="url" value="' + location.href + '"/>';
                html += "<a href='#'><img src='" + weiboImg + "' width='32' data-hook='send-weibo'/></a>" +
                    "<a href='#'><img src='" + twitterImg + "' width='32' data-hook='send-twitter'/></a>"
                    + '<a href="#"><img src="' + goldImg + '" width="32" data-hook="share-card"/></a>'

                html += "</div></form>";

                //现在获取一下短网址;
                pida.get("https://gotapi.net/v3/api/shorten?url=" + encodeURIComponent(location.href)
                    + "&secret="+secret, {}).then((data) => {
                    if (data.code === 200) {
                        setTimeout(() => {
                            document.getElementById("gotapi_form_url").value = "http://" + data.data;
                        }, 100);
                    }
                })
                return html;
                /**+se.selectedText.toString()+"</textarea> "
                 + '<input name="url" value="' +'"/'> +
                 "<img src='/assets/weibo.svg' width='32' data-hook='send-weibo'/>" +
                 "<a href='#'><img src='/assets/twitter.svg' width='32' data-hook='send-weibo'/></a></form>";
                 */
            }
        })
        se.loadStyle("#share-form-gotapi img{ padding-left:5px; } \n" +
            ".share-body { display:block;clear:both;}" +
            ".share-body textarea {display:block;min-height:120px;margin:8px 16px;}")
//})


    const globalHooks = {};
    pida.addListener(document.body, "click", (evt) => {
            let attr = evt.target.getAttribute("data-hook");
            if (attr) {
                if (globalHooks[attr]) {
                    globalHooks[attr].call(evt.target, evt);
                }
            }
    })


    globalHooks["share-card"] = (evt) => {
        let url = "https://poet.404.ms/"
        let form = pida.$("#share-form-gotapi").elements[0]
        form.setAttribute("action", url)
        form.submit()
    }
    globalHooks["send-weibo"] = (evt) => {
        let url = "https://service.weibo.com/share/share.php"
        let form = pida.$("#share-form-gotapi").elements[0]
        form.setAttribute("action", url)
        form.submit()
    }
    globalHooks["send-twitter"] = (evt) => {
        let url = "https://twitter.com/intent/tweet"
        let form = pida.$("#share-form-gotapi").elements[0]
        form.setAttribute("action", url)
        form.submit()

    }
})("lv1070xr8dxf0f77i93bhihj61hwhr30438")
