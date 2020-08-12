'use strict';

const state = {
	id: Math.random().toString(36).substring(7),
	url: window.location.href,
	isCodedScroll: false
};

function send(action, message, origin=null)
{
	if (!message) message = {};
	message.action = action;
	message.id = state.id;

	if (!origin) origin = "*";
	window.parent.postMessage(message, origin);
}

function initialize()
{
	const style = document.createElement("style");
	style.innerHTML = `
		::-webkit-scrollbar {
		    width: 0px;
		    position: fixed;
		}

		::-webkit-scrollbar-track {
		    background: transparent !important;
		}

		::-webkit-scrollbar-thumb {
		    background: rgba(0, 0, 0, 0.3) !important;
		    border-radius: 2rem !important;
		}
	`;
	document.head.appendChild(style);

	window.addEventListener("unload", unload);
	window.addEventListener("scroll", scroll);
}

function load()
{
	if (window.self !== window.top) 
	{
		send("hv-register", { url: state.url });

		const bodyList = document.querySelector("body");
		const observer = new MutationObserver((mutations) => 
		{
	        mutations.forEach((mutation) => 
	        {
	            if (state.href != document.location.href) 
	            {
	                state.url = document.location.href;
	                send("hv-register", { url: state.url });
	            }
	        });
	    });

	    var config = {
	        childList: true,
	        subtree: true
	    };

	    observer.observe(bodyList, config);
	}
}

function unload()
{
	if (window.self !== window.top) send("hv-unload", { });
}

function scroll(e)
{
	if (state.isCodedScroll)
	{
		state.isCodedScroll = false;
	}
	else
	{
		const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
		const scroll = window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop || 0;
		const documentHeight = Math.max(
		        document.body.scrollHeight || 0, 
		        document.documentElement.scrollHeight || 0,
		        document.body.offsetHeight || 0, 
		        document.documentElement.offsetHeight || 0,
		        document.body.clientHeight || 0, 
		        document.documentElement.clientHeight || 0
		    );

		const percentage = Math.ceil((scroll / (documentHeight - windowHeight)) * 100);
		send("hv-scroll", { scroll: percentage });
	}
}

function back()
{
	window.history.back();
}

function forward()
{
	window.history.forward();
}

function setScroll(percentage)
{
	state.isCodedScroll = true;
	const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
	const documentHeight = Math.max(
		        document.body.scrollHeight || 0, 
		        document.documentElement.scrollHeight || 0,
		        document.body.offsetHeight || 0, 
		        document.documentElement.offsetHeight || 0,
		        document.body.clientHeight || 0, 
		        document.documentElement.clientHeight || 0
		    );
	const y = (documentHeight - windowHeight) * (percentage / 100);
	window.scrollTo(0, y);
}

window.addEventListener("message", reciever, false);
function reciever(event)
{
	if (event.data.id !== state.id || event.data.from === state.id) return;

	switch (event.data.action)
	{
		case "hv-initialize": {
			initialize();
		} break;

		case "hv-back": {
			back();
		} break;

		case "hv-forward": {
			forward();
		} break;

		case "hv-setScroll": {
			const percentage = event.data.scroll;
			setScroll(percentage);
		} break;
	}
}

window.addEventListener("load", load);