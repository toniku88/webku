import express from 'express';
import serverless from 'serverless-http';
import fs from "fs";
import unirest from "unirest";
import nodeGzip from "node-gzip";
const { gzip, ungzip} = nodeGzip;
import innertext from 'innertext';
import moment from 'moment';
const app = express();

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

const convertDb = async (data)=>{
	let data_back = {
		"title":null,
		"id": null,
	    "permalink": null,
	    "dateCreated": null,
	    "upvoteCount": null,
	    "content":null,
	    "attachments":[],
	    "author": {
	        "name": "Anonyme",
	        "avatar": null
	    },
	    "tag":[],
	    "comment":[],
	    "answer":[]
	};
	const title = await innertext(data.content);
	let text="";
	for(let i=0;i<=160;i++){
		if(title[i]!=undefined){
			text+=title[i];
		};
	};
	data_back.title = text+"...";
	data_back.id = data.databaseId;
	data_back.permalink = data.databaseId;
	data_back.dateCreated = data.created;
	data_back.content = data.content;
	data_back.attachments = data.attachments;

	if(data.author && data.author.nick){
		data_back.author.name = data.author.nick;
	};

	if(data.author && data.author.avatar && data.author.avatar.thumbnailUrl){
		data_back.author.avatar = data.author.avatar.thumbnailUrl;
	};

	let tag_name = "Anonyme";
	let tag_slug = "anonyme";
	if(data.subject && data.subject.name){
		tag_name = data.subject.name;
	};
	if(data.subject && data.subject.slug){
		tag_slug = data.subject.slug;
	};
	data_back.tag.push({
		"name":tag_name,
		"alt":tag_slug
	});

	if(data.answers && data.answers.nodes){
		data_back.upvoteCount = data.answers.nodes.length;
		for(let answer of data.answers.nodes){
			let format_answer = {
				"author":{
			        "name": "Anonyme",
			        "avatar": null
			    },
			    "content":null,
				"upvoteCount":null,
				"dateCreated":null,
				"comment":[],
				"id": null,
		        "acceptedAnswer": false,
		        "suggestedAnswer": true
			};
			format_answer.content = answer.content;
			format_answer.dateCreated = answer.created;
			format_answer.permalink = answer.databaseId;
			format_answer.id = answer.databaseId;
			format_answer.upvoteCount = answer.content.length;
			if(answer.author && answer.author.nick){
				format_answer.author.name = answer.author.nick;
			};

			if(answer.author && answer.author.avatar && answer.author.avatar.thumbnailUrl){
				format_answer.author.avatar = answer.author.avatar.thumbnailUrl;
			};
			data_back.answer.push(format_answer);
		};
	};
	return data_back;
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
		db = await convertDb(db);
            	console.log(db);
		  
		let str_file = `<!DOCTYPE html>
<html itemscope itemtype="https://schema.org/QAPage" lang="`+`$`+`{lang}">
<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link href="`+`$`+`{protocol}://`+`$`+`{domain}/favicon.ico" rel="shortcut icon" type="image/x-icon">
	<title>`+`$`+`{title}</title>
	<meta name="twitter:card" content="summary"/>
	<meta name="twitter:domain" content="`+`$`+`{domain}"/>
	<meta name="twitter:title" property="og:title" itemprop="name" content="`+`$`+`{title}"/>
	<meta name="twitter:description" property="og:description" content="`+`$`+`{description}"/>
	<meta name='description' itemprop="description" content="`+`$`+`{description}"/>
	<meta property="og:type" content= "website"/>
	<meta property="og:url" content="`+`$`+`{url}"/>
	<meta property="og:site_name" content="`+`$`+`{title-home}"/>
	<meta property="og:image" itemprop="image primaryImageOfPage" content="`+`$`+`{protocol}://`+`$`+`{domain}/img/icon.png"/>
	<link rel="canonical" href="`+`$`+`{url}">
	<link href="https://cdn.maskoding.id/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet" media="all"/>
	<link href="https://cdn.maskoding.id/css/sticky-footer-navbar.css" rel="stylesheet"/>
	<link rel="stylesheet" href="https://cdn.maskoding.id/bootstrap-icons/font/bootstrap-icons.css"/>
	<link rel="stylesheet"href="https://cdn.maskoding.id/animate.css/animate.min.css"/>
	<link rel="stylesheet"href="https://cdn.maskoding.id/css/stackoverflow-dark.min.css"/>
	<link href="https://cdn.maskoding.id/css/main.css" rel="stylesheet"/>
</head>
<body>
    `+`$`+`{navigation}
    <main itemprop="mainEntity" itemscope itemtype="https://schema.org/Question" class="container" style="padding-top: 20px;">
      <h1 itemprop="name" class="mt-1 fs-30 animate__animated animate__rubberBand animate__delay-1s"><a itemprop="url" href="`+`$`+`{url}" class="clr-black darkmode--activated">`+`$`+`{title}</a></h1>
      <div>
      	`+`$`+`{category}
      	<i class="bi bi-clock"></i><time itemprop="dateCreated" datetime="`+`$`+`{dateCreated}" class="mr-1 ml-1">`+`$`+`{dateMoment}</time>
      	<span itemprop="author" itemscope itemtype="http://schema.org/Person" class="mr-1 ml-1"><i class="bi bi-person-circle mr-1"></i><span itemprop="name" class="badge badge-info">`+`$`+`{authorName}</span></span>
      </div>
      <meta itemprop="upvoteCount" content="`+`$`+`{upvoteCount}"/>
      <div class="card mt-3 mb-3">
	      <h2 class="card-header fm">
	         <div class="align-items-center"><i class="bi bi-question-circle"></i> PERTANYAAN</div>
	      </h2>
	      <div class="card-body">
	         <div itemprop="text" class="card-text">
	         		`+`$`+`{content}
	         </div>
	      </div>
	      <div class="card-footer">
			    <h3 class="fs-15"><i class="bi bi-chat-dots mr-1"></i>`+`$`+`{commentCount} Dikomentari oleh <span class="badge badge-info fs-15">`+`$`+`{authorName}</span>.</h3>
			    <div class="list-group">`+`$`+`{comment}</div>
			  </div>
	    </div>
	   <div class="mt-1" id="banner-adsterra"></div>
      <div class="mt-1">
         <h2 class="card-header fm">
            <div class="align-items-center"><i class="bi bi-chat-right-dots mr-2"></i><span itemprop="answerCount">`+`$`+`{answerCount}</span> JAWABAN</div>
         </h2>
         <div class="card-body p-0">
            <ul class="list-group">`+`$`+`{answer}</ul>
         </div>
      </div>
      `+`$`+`{lastVisited}
      `+`$`+`{suggestContent}
  	</main>
    `+`$`+`{footer}
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
		
		let navigation = `<nav class="navbar navbar-expand-lg navbar-light bg-light border border-secondary-subtle">
  <div class="container-fluid">
    <a class="navbar-brand title-headers animate__animated animate__shakeX" href="/"><i class="bi bi-calculator d-inline-block mr-1"></i>`+`$`+`{title-home}</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="/">Home</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#about" id="about">About</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#contact" id="contact">Contact</a>
        </li>
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="#privacy-policy" id="privacy-policy">Privacy Policy</a>
        </li>
      </ul>
      <form class="d-flex  mt-1 mr-1">
        <input class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
        <button class="btn btn-outline-success" type="submit">Search</button>
      </form>
      <button type="button" class="btn btn-primary mt-1" data-bs-toggle="modal" data-bs-target="#exampleModal">Login</button>
    </div>
  </div>
</nav>
<!-- Modal -->
<div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
  <div class="modal-dialog">
    <div class="modal-content">
      <div class="modal-header">
        <h5 class="modal-title" id="exampleModalLabel">LOGIN</h5>
        <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
      </div>
      <div class="modal-body">
        <div class="input-group flex-nowrap mb-3">
			  <input type="text" class="form-control" placeholder="Username" aria-label="Username" aria-describedby="addon-wrapping">
			</div>
			<div class="input-group flex-nowrap mb-3">
			  <input type="password" class="form-control" placeholder="Password" aria-label="Password" aria-describedby="addon-wrapping">
			</div>
			<div class="col-12">
				<button class="btn btn-primary">Sign up</button>
			    <button class="btn btn-success">Sign in</button>
			  </div>
      </div>
    </div>
  </div>
</div>
<button aria-label="Kembali ke atas" id="backToTop" onclick="window.scrollTo({top: 0, behavior: 'smooth'});"><i class="bi bi-arrow-up"></i></button>
<script src="https://cdn.maskoding.id/bootstrap/dist/js/bootstrap.min.js"></script>
<script>
  const createModal = (data)=>{
    const btn_privacy_policy = document.getElementById(data.id);
    btn_privacy_policy.addEventListener("click",()=>{
      const el_modal = document.createElement("div");
      el_modal.setAttribute("class","modal");
      el_modal.innerHTML = '<div class="modal-dialog modal-xl modal-dialog-scrollable"><div class="modal-content"><div class="modal-header"><h1 class="modal-title">'+data.title+'</h1><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button></div><div class="modal-body" id="data-'+data.id+'"></div></div></div>';
      el_modal.addEventListener("hidden.bs.modal",()=>{
        el_modal.remove();
      });
      el_modal.addEventListener("shown.bs.modal",()=>{
        const id_dom = document.getElementById("data-"+data.id);
        id_dom.innerHTML = "Please Wait...";
        fetch(data["data-dom"])
        .then(response => response.text())
        .then(function (data) {
          id_dom.innerHTML = data;
        });
      });
      let modalPrivacyPolicy = new bootstrap.Modal(el_modal, {
        keyboard: false
      });
      modalPrivacyPolicy.toggle();
    });
  };
  createModal({
    "title":"Privacy Policy",
    "id":"privacy-policy",
    "data-dom":"./page/privacy-policy.html"
  });
  createModal({
    "title":"About",
    "id":"about",
    "data-dom":"./page/about.html"
  });
  createModal({
    "title":"Kontak",
    "id":"contact",
    "data-dom":"./page/contact.html"
  });
  </script>`;
		  
		str_file = await str_file.replace(/\$\{navigation\}/g,navigation);
		  
		let footer = `<footer class="footer">
   <div class="container">
      Design By <span >`+`$`+`{domain}</span>
   </div>
</footer>`;
		
		str_file = await str_file.replace(/\$\{footer\}/g,footer);
		  
		//--- inject data protocol --------
		const data_protocol = "https";
		str_file = await str_file.replace(/\$\{protocol\}/g,data_protocol);
		  
		//--- inject data domain --------
		const data_domain = req.headers.host;
		str_file = await str_file.replace(/\$\{domain\}/g,data_domain);
		  
		//--- inject data url --------
		const data_url = data_protocol+"://"+req.headers.host+req.path;
		str_file = await str_file.replace(/\$\{url\}/g,data_url);
		  
		//--- inject data lang --------
		let data_lang = "en";
		if(process.env["lang"]){
			data_lang = process.env["lang"];
		};
		str_file = await str_file.replace(/\$\{lang\}/g,data_lang);
		  
		//--- inject data title --------
		const data_title = db.title;
		str_file = await str_file.replace(/\$\{title\}/g,data_title);
		  
		//--- inject data title home --------
		const data_title_home = process.env["title_home"];
		str_file = await str_file.replace(/\$\{title-home\}/g,data_title_home);
		  
		//--- inject data content --------
		//-- remove element <a> but not remove inner element
		let data_content = db.content.replace(/<\/?a(?:(?= )[^>]*)?>/g,"");
		str_file = await str_file.replace(/\$\{content\}/g,(match)=>{
			return data_content;
		});
		
		//--- inject data description --------
		let data_description = await innertext(data_content);
		data_description = data_description.replace(/\"/g,"");
		let split_description = "";
		for(let i=0;i<data_description.length;i++) {
		    if(i<200){
		    	if(data_description[i]!=undefined){
		    		split_description+=data_description[i];
		    	}else{
		    		break;
		    	};
		    };
		    if(i>=200){
		    	break;
		    };
		};
		str_file = await str_file.replace(/\$\{description\}/g,split_description+"...");
		  
		//--- inject data id --------
		const data_id = db.id;
		str_file = await str_file.replace(/\$\{id\}/g,data_id);

		//--- inject data dateCreated --------
		let data_dateCreated = db.dateCreated;
		str_file = await str_file.replace(/\$\{dateCreated\}/g,data_dateCreated);

		//--- inject data dateMoment --------
		let data_dateMoment = moment(db.dateCreated).format('L');
		str_file = await str_file.replace(/\$\{dateMoment\}/g,data_dateMoment);

		//--- inject data upvoteCount --------
		let data_upvoteCount = db.upvoteCount;
		str_file = await str_file.replace(/\$\{upvoteCount\}/g,data_upvoteCount);

		//--- inject data answerCount --------
		let data_answerCount = db.answer.length;
		str_file = await str_file.replace(/\$\{answerCount\}/g,data_answerCount);

		//--- inject data commentCount --------
		let data_commentCount = db.comment.length;
		str_file = await str_file.replace(/\$\{commentCount\}/g,data_commentCount);
		  
		//--- inject data comment --------
		let data_comment = "";
		let timeDate = new Date().getTime();
		try{
			timeDate = moment(comment.date).format('L');
		}catch(e){
			timeDate = moment(timeDate).format('L');
		};
		for(let comment of db.comment){
			data_comment+=`<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
								    <div class="d-flex w-100 justify-content-between">
								      <h4 class="mb-1 fs-12"><i class="bi bi-chat-dots mr-1"></i>Dikomentari Oleh <span class="badge badge-info fs-15">`+comment.author+`</span></h5>
								    </div>
								    <div class="mb-1">`+comment.text+`</div>
								    <small class="text-muted fs-12"><i class="bi bi-clock mr-1"></i>`+timeDate+`</small>
								  </a>`;
		};
		str_file = await str_file.replace(/\$\{comment\}/g,data_comment);

		//--- inject data author --------
		let data_authorName = db.author.name;
		str_file = await str_file.replace(/\$\{authorName\}/g,data_authorName);

		//--- inject data category --------
		let data_category = "";
		for(let tag of db.tag){
			data_category+=`<span class="badge bg-light text-dark mr-1"><i class="bi bi-tag mr-1"></i>`+tag.name+`</span>`;
		};
		str_file = await str_file.replace(/\$\{category\}/g,data_category);
		  
		//--- inject data answer --------
		let data_answer = "";
		let count_answer=0;
		for(let answer of db.answer){
			count_answer+=1;
			if(answer.acceptedAnswer){
				let dom_comment = "";
				let timeNow = new Date().getTime();
				try{
					timeNow = moment(comment.date).format('L');
				}catch(e){
					timeNow = moment(timeNow).format('L');
				};
				for(let comment of answer.comment){
					dom_comment+=`<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
								    <div class="d-flex w-100 justify-content-between">
								      <h5 class="mb-1 fs-12"><i class="bi bi-chat-dots mr-1"></i>Dikomentari Oleh <span class="badge badge-info fs-15">`+comment.author+`</span></h5>
								    </div>
								    <div class="mb-1">`+comment.text+`</div>
								    <small class="text-muted fs-12"><i class="bi bi-clock mr-1"></i>`+timeNow+`</small>
								  </a>`;
				};
				data_answer+=`<li id="#`+answer.id+`" itemprop="acceptedAnswer" itemscope itemtype="https://schema.org/Answer" class="list-group-item border-success p-0 mt-3">
					  	<div class="card m-1">
							  <div class="card-body">
							    <h3 class="card-title fs-18"><a itemprop="url" id="`+answer.id+`" href="#`+answer.id+`">`+count_answer+`. Dijawab Oleh <i class="bi bi-person-circle mr-1"></i><span class="badge badge-info fs-15">`+answer.author.name+`</span></a><i class="bi bi-check2-circle ml-2 accept" title="Accepted Answer"></i></h3>
							    <meta itemprop="upvoteCount" content="`+answer.upvoteCount+`"/>
							    <meta itemprop="dateCreated" content="`+answer.dateCreated+`"/>
							    <div itemprop="text" class="card-text">`+answer.content+`</div>
							  </div>
							  <div class="card-footer">
							    <h4 class="fs-15"><i class="bi bi-chat-dots mr-1"></i>`+answer.comment.length+` Dikomentari Oleh <span class="badge badge-info fs-15">`+answer.author.name+`</span> answer</h4>
							    <div class="list-group">`+dom_comment+`</div>
							  </div>
							</div>
					  </li>`;
			}else{
				let dom_comment = "";
				let timeNow = new Date().getTime();
				try{
					timeNow = moment(comment.date).format('L');
				}catch(e){
					timeNow = moment(timeNow).format('L');
				};
				for(let comment of answer.comment){
					dom_comment+=`<a href="#" class="list-group-item list-group-item-action flex-column align-items-start">
								    <div class="d-flex w-100 justify-content-between">
								      <h5 class="mb-1 fs-12"><i class="bi bi-chat-dots mr-1"></i>Dikomentari Oleh <span class="badge badge-info fs-15">`+comment.author+`</span></h5>
								    </div>
								    <div class="mb-1">`+comment.text+`</div>
								    <small class="text-muted fs-12"><i class="bi bi-clock mr-1"></i> `+timeNow+`</small>
								  </a>`;
				};
				data_answer+=`<li id="#`+answer.id+`" itemprop="suggestedAnswer" itemscope itemtype="https://schema.org/Answer" class="list-group-item p-0 mt-3">
					  	<div class="card m-1">
							  <div class="card-body">
							    <h3 class="card-title fs-18"><a itemprop="url" id="`+answer.id+`" href="#`+answer.id+`">`+count_answer+`. Dijawab Oleh <i class="bi bi-person-circle mr-1"></i><span class="badge badge-info fs-15">`+answer.author.name+`</span></a></h3>
							    <meta itemprop="upvoteCount" content="`+answer.upvoteCount+`"/>
							    <meta itemprop="dateCreated" content="`+answer.dateCreated+`"/>
							    <div itemprop="text" class="card-text">`+answer.content+`</div>
							  </div>
							  <div class="card-footer">
							    <h4 class="fs-15"><i class="bi bi-chat-dots mr-1"></i>`+answer.comment.length+` Comments for <span class="badge badge-info fs-15">`+answer.author.name+`</span> answer</h4>
							    <div class="list-group">`+dom_comment+`</div>
							  </div>
							</div>
					  </li>`;
			};
			
		};
		str_file = await str_file.replace(/\$\{answer\}/g,data_answer);
		
		//--- inject data suggest content --------
		let dom_suggest_content="";
		try{
			str_file = await str_file.replace(/\$\{suggestContent\}/g,dom_suggest_content);
		}catch(e){
			str_file = await str_file.replace(/\$\{suggestContent\}/g,"");
		};
		  
		//--- inject data last visited --------
		let dom_last_visited="";
		try{
			str_file = await str_file.replace(/\$\{lastVisited\}/g,dom_last_visited);
		}catch(e){
			str_file = await str_file.replace(/\$\{lastVisited\}/g,"");
		};
		
		await res.writeHead(200,{
			"content-encoding": "gzip",
			"content-type":"text/html; charset=utf-8"
		});
		str_file = await gzip(str_file);
		await res.write(str_file);
		return res.end();
          };
        }catch(e){
		return next(e);
	};
      };
    };
  }else{
  	return next();
  };
});

export default app;
export const handler = serverless(app);
