import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
const app = express();

let str_file = `<!DOCTYPE html>
<html itemscope itemtype="https://schema.org/QAPage" lang="${lang}">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="${protocol}://${domain}/favicon.ico" rel="shortcut icon" type="image/x-icon">
	<title>${title}</title>
	<meta name="twitter:card" content="summary"/>
	<meta name="twitter:domain" content="${domain}"/>
	<meta name="twitter:title" property="og:title" itemprop="name" content="${title}"/>
	<meta name="twitter:description" property="og:description" content="${description}"/>
	<meta name='description' itemprop="description" content="${description}"/>
	<meta name="google-site-verification" content="AzfCArmMGkdDQR1DKtuqQ6mPK5oaTxjklWnVthVAbME"/>
	<meta property="og:type" content= "website"/>
	<meta property="og:url" content="${url}"/>
	<meta property="og:site_name" content="${title-home}"/>
	<meta property="og:image" itemprop="image primaryImageOfPage" content="${protocol}://${domain}/img/icon.png"/>
	<link rel="canonical" href="${url}">
	<link href="https://cdn.maskoding.id/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" media="all"/>
	<link href="https://cdn.maskoding.id/css/sticky-footer-navbar.css" rel="stylesheet"/>
	<link rel="stylesheet" href="https://cdn.maskoding.id/bootstrap-icons/font/bootstrap-icons.css"/>
	<link rel="stylesheet"href="https://cdn.maskoding.id/animate.css/animate.min.css"/>
	<link rel="stylesheet"href="https://cdn.maskoding.id/css/stackoverflow-dark.min.css"/>
	<link href="https://cdn.maskoding.id/css/main.css" rel="stylesheet"/>
</head>
<body>
    ${navigation}
    <main itemprop="mainEntity" itemscope itemtype="https://schema.org/Question" class="container" style="padding-top: 20px;">
      <h1 itemprop="name" class="mt-1 fs-30 animate__animated animate__rubberBand animate__delay-1s"><a itemprop="url" href="${url}" class="clr-black darkmode--activated">${title}</a></h1>
      <div>
      	${category}
      	<i class="bi bi-clock"></i><time itemprop="dateCreated" datetime="${dateCreated}" class="mr-1 ml-1">${dateMoment}</time>
      	<span itemprop="author" itemscope itemtype="http://schema.org/Person" class="mr-1 ml-1"><i class="bi bi-person-circle mr-1"></i><span itemprop="name" class="badge badge-info">${authorName}</span></span>
      </div>
      <meta itemprop="upvoteCount" content="${upvoteCount}"/>
      <div class="card mt-3 mb-3">
	      <h2 class="card-header fm">
	         <div class="align-items-center"><i class="bi bi-question-circle"></i> PERTANYAAN</div>
	      </h2>
	      <div class="card-body">
	         <div itemprop="text" class="card-text">
	         		${content}
	         </div>
	      </div>
	      <div class="card-footer">
			    <h3 class="fs-15"><i class="bi bi-chat-dots mr-1"></i>${commentCount} Dikomentari oleh <span class="badge badge-info fs-15">${authorName}</span>.</h3>
			    <div class="list-group">${comment}</div>
			  </div>
	    </div>
	   <div class="mt-1" id="banner-adsterra"></div>
      <div class="mt-1">
         <h2 class="card-header fm">
            <div class="align-items-center"><i class="bi bi-chat-right-dots mr-2"></i><span itemprop="answerCount">${answerCount}</span> JAWABAN</div>
         </h2>
         <div class="card-body p-0">
            <ul class="list-group">${answer}</ul>
         </div>
      </div>
      ${lastVisited}
      ${suggestContent}
  	</main>
    ${footer}
   <!-- <script src="https://cdn.maskoding.id/darkmode-js/lib/darkmode-js.min.js"></script> -->
   <script src="https://cdn.maskoding.id/js/highlight.min.js"></script>
   <script type="text/x-mathjax-config">
   	MathJax.Hub.Config({
		"HTML-CSS": {
		    preferredFont: "TeX",
		    availableFonts: ["STIX", "TeX"],
		    linebreaks: {
		        automatic: true
		    },
		    EqnChunk: (MathJax.Hub.Browser.isMobile ? 10 : 50)
		},
		tex2jax: {
		    inlineMath: [
		        ["$", "$"],
		        ["\\\\(", "\\\\)"]
		    ],
		    displayMath: [
		        ["$$", "$$"],
		        ["\\[", "\\]"]
		    ],
		    processEscapes: true,
		    ignoreClass: "tex2jax_ignore|dno"
		},
		TeX: {
		    extensions: ["begingroup.js"],
		    noUndefined: {
		        attributes: {
		            mathcolor: "red",
		            mathbackground: "#FFEEEE",
		            mathsize: "90%"
		        }
		    },
		    Macros: {
		        href: "{}"
		    }
		},
		messageStyle: "none",
		styles: {
		    ".MathJax_Display, .MathJax_Preview, .MathJax_Preview > *": {
		        "background": "inherit"
		    }
		},
		SEEditor: "mathjaxEditing"
		});
		(async ()=>{
		const all_el_img = await document.querySelectorAll("img");
		for(let name_attr of [
			"data-src"
		]){
			for(let el_img of all_el_img){
				const data_src = await el_img.getAttribute(name_attr);
				if(data_src){
					await el_img.setAttribute("src",data_src);
				};
				await el_img.setAttribute("style","opacity: inherit;display: block;max-width:100%;max-width: 100%;margin: auto;text-align: center;");
			};
		};
		return;
		})();
		/* (async ()=>{
			const options = {
				time: '0.5s', // default: '0.3s'
			  mixColor: '#fff', // default: '#fff'
			  backgroundColor: '#fff',  // default: '#fff'
			  buttonColorDark: '#100f2c',  // default: '#100f2c'
			  buttonColorLight: '#fff', // default: '#fff'
			  saveInCookies: false, // default: true,
			  label: '<i class="bi bi-lightbulb text-white"></i>', // default: ''
			};
			const darkmode = new Darkmode(options);
			darkmode.showWidget();
			document.querySelector(".darkmode-toggle").setAttribute("style","z-index: 100;");
		})();
		*/
		document.querySelectorAll('pre code').forEach((el) => {
			hljs.highlightElement(el);
		});
   </script>
	<script id="MathJax-script" async src="https://cdn.maskoding.id/mathjax/MathJax.js?config=TeX-AMS_HTML-full"></script>
	<script src="https://cdn.maskoding.id/bootstrap/dist/js/bootstrap.min.js"></script>
</body>
</html>`;

const curlContent = async (id)=>{
  return new Promise((resolve)=>{
    const api_db = "http://"+process.env["serverDb"]+"/get?key="+process.env["key"]+"&target=content&file="+id;
    unirest.get(api_db).then((response) => {
      resolve(response.body);
    }).catch((e)=>{
       resolve("err");
    });
  });
};

app.use( async (req,res,next)=>{
  if(req.path.indexOf("/tugas/")==0){
    const path = req.path.split("/tugas/")[1];
    if(path){
      let data = await curlContent(path);
      if(data!="err"){
        try{
          data = await JSON.parse(data);
          if(data.status==true && data.data){
            	let db = data.data;
            	console.log(db);
		await res.writeHead(200,{
			"content-encoding": "gzip",
			"content-type":"text/html; charset=utf-8"
		});
		str_file = await gzip(str_file);
		await res.write(str_file);
		return res.end();
          };
        }catch(e){};
      };
    };
  };
  return next();
});

export default app;
export const handler = serverless(app);
