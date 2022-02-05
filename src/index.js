//pida.onDomReady(()=>{
import pida from 'pida'
import beselected from "beselected";
import listen from 'good-listener'
//import axios from "axios"
const purify = (text)=>{
    return text.replaceAll("'","").replaceAll('"','')
}
pida.onDomReady(()=>{
    let se = (beselected())
    se.init({
        popupCallback:(point)=>{
            let root = se.getPopupElement();
            root.innerHTML = se.getHtml();
        },
        mainHandler:(text)=>{
            console.log("main handler called");
            //console.log(se.selectedText);
            // console.log(JSON.stringify(text));

            let html =  "<form id='share-form-gotapi'  method='GET'  action='https://service.weibo.com/share/share.php' target='_blank'>";
            html += "<div data-theme='light' class='share-body'> <textarea name='title' style='display: block;'>";
            html += purify(se.selectedText) + "</textarea>";
            html += '<input type="hidden" id="gotapi_form_url" name="url" value="' + location.href+'"/>';
            html += '<input type="hidden" name="text" value="' + purify(se.selectedText)+'"/>' +
                "<a href='#'><img src='/assets/weibo.svg' width='32' data-hook='send-weibo'/></a>" +
                "<a href='#'><img src='/assets/twitter.svg' width='32' data-hook='send-twitter'/></a>";

            html += "</div></form>";

            //现在获取一下短网址;
            axios.get("https://gotapi.net/v3/api/shorten?url="+encodeURIComponent(location.href)
            +"&secret=lv1olxgc0n4dpzuf6k4wvfyqnq0qgnqcx5j").then((resp)=>{
                let data = (resp.data);
                if (data.code === 200) {

                    setTimeout(()=>{
                        document.getElementById("gotapi_form_url").value = "http://"+data.data;
                    },100);
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
})

const globalHooks = {

};
listen(document.body,"click",(evt)=>{
    let attr =evt.target.getAttribute("data-hook");
    if(attr){
        if(globalHooks[attr]){
            globalHooks[attr].call(evt.target,evt);
        }
    }
})
globalHooks["send-weibo"] = (evt)=>{
    let url = "https://service.weibo.com/share/share.php"
    let form = pida.$("#share-form-gotapi")[0]
    form.setAttribute("action",url)
    form.submit()
}
globalHooks["send-twitter"] =(evt)=>{
    let url = "https://twitter.com/intent/tweet"
    let form = pida.$("#share-form-gotapi")[0]
    form.setAttribute("action",url)
    form.submit()

}
