addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
})

// Totally normal links to real actual news articles
const linkArray = new Array(
	{"name": "The Staggering Truth About Stamp Collecting", "url": "https://www.youtube.com/watch?v=NL6CDFn2i3I"},
	{"name": "15 Jaw-Dropping Trumpet Playing Secrets", "url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ"},
	{"name": "Can Steve Carell Save Papercraft?", "url": "https://www.youtube.com/watch?v=QH2-TGUlwu4"},
 );

const socialLinks = new Array(
	{"name": "LinkedIn", "svg": "https://simpleicons.org/icons/linkedin.svg", "url": "https://www.linkedin.com/in/mickeynash/"},
	{"name": "GitHub", "svg": "https://simpleicons.org/icons/github.svg", "url": "https://github.com/mckymsh/"},
	{"name": "Instagram", "svg": "https://simpleicons.org/icons/instagram.svg", "url": "https://www.instagram.com/mcky_msh/"},
	{"name": "Twitter", "svg": "https://simpleicons.org/icons/twitter.svg", "url": "https://twitter.com/mcky_msh"},
 );

/**
 * Respond with hello worker text
 * @param {Request} request
 */
// async function handleRequest(request) {
//   return new Response('Hello Mickey!', {
//     headers: { 'content-type': 'text/plain' },
//   })
// }

async function handleRequest(request) {
	const path = new URL(request.url).pathname;
	if(path == "/links"){
		return new Response(linkArray, {
			headers: {'content-type': 'text/JSON'},
		});
	}else{
		const page = await fetch("https://static-links-page.signalnerve.workers.dev");

		var transformer = new HTMLRewriter()
			.on("div#links", new LinkLister(linkArray))
			.on("div#profile", new StyleStripper())
			.on("img#avatar", new SrcSwapper("https://i.imgur.com/s2jzWWe.jpg"))
			.on("h1#name", new TitleTransformer("Mickey Nash"))
			.on("title", new TitleTransformer("Mickey Nash"))
			.on("div#social", new StyleStripper("padding: 10px"))
			.on("div#social", new LinkLister(socialLinks))
			.on("body", new ClassChanger("bg-gray-900", "bg-purple-600"))

		return new Response(transformer.transform(page).body, {
			headers: {'content-type': 'text/HTML'},
		});
	}
}

// I reuse this for both the original links and social links
class LinkLister{
	constructor(links){
		this.links = links;
	}

	async element(element){
		// TODO: Change to a map or something less ugly and ridiculous
		for (var i = 0; i < this.links.length; i++)
{			element.append("<a target='_blank' href='" + this.links[i].url + "'>", {html: true})
			if(this.links[i].svg){
				element.append("<img src='" + this.links[i].svg + "' alt='" + this.links[i].name + "'>", {html: true});
			}else{
				element.append(this.links[i].name, {html: true});
			}
			element.append("</a>", {html: true});
		}
	}
}

// Adapted from 
// https://blog.cloudflare.com/introducing-htmlrewriter/#htmlrewriter-in-action
// Heavy-handed apocalyptic style editing
class StyleStripper{
	constructor(newStyle){
		this.newStyle = newStyle;
	}

	async element(element){
		const attribute = element.getAttribute("style");
		if(attribute){
			if(!this.newStyle){
				element.removeAttribute("style");
			}else{
				// var currentStyle = element.getAttribute("style");
				element.setAttribute(
					"style",
					this.newStyle
				);
			}
		}
	}
}

class SrcSwapper{
	constructor(newSrc){
		this.newSrc = newSrc;
	}

	async element(element){
		element.setAttribute(
			"src",
			this.newSrc
		);
	}
}

class TitleTransformer{
	constructor(newTitle){
		this.newTitle = newTitle;
	}

	async element(element){
		element.setInnerContent(
			this.newTitle
		);
	}
}

// Not a user-friendly thing 
// (what if I only provide one argument? The whole thing would explode.)
// But it's fine for this scenario.
class ClassChanger{
	constructor(oldClass, newClass){
		this.oldClass = oldClass;
		this.newClass = newClass;
	}

	async element(element){
		const attribute = element.getAttribute("class")
	    if(attribute){
		    element.setAttribute(
		        "class",
		        attribute.replace(this.oldClass, this.newClass)
	        )
		}
	}
}
