/* statics */
lang = {
	'next': 'Next',
	'close': 'Close',
	'back': 'Back',
	'firstScreen': {
		'question': 'Do you have a quick moment?',
		'text': 'We\'d love your feedback!',
	},
	'endScreen': {
		'text': 'Thank you for your feedback!'
	}

}

api = {
	'token' :"",
	'surveyId': "272240181"
}


/* utils */
function fadeOut(el, callback = ''){
  el.style.opacity = 1;

  (function fade() {
    if ((el.style.opacity -= .1) < 0) {
      el.style.display = "none";
      	if(is_function(callback)) {
            callback();
        }
    } else {
      requestAnimationFrame(fade);
    }
  })();
};

/*  özellikle prototype eklemedim */
function fadeIn(el, display, callback = ''){
  el.style.opacity = 0;
  el.style.display = display || "block";

  (function fade() {
    var val = parseFloat(el.style.opacity);
    if (!((val += .1) > 1)) {
      el.style.opacity = val;
      requestAnimationFrame(fade);
    } else {
	 	if(is_function(callback)) {
            callback();
        }
    }
  })();
};

function is_function( object_to_check ) {
    return object_to_check && {}.toString.call( object_to_check ) === '[object Function]';
}


Object.prototype.insert_element = function(options, onClick = function(){ }) {

	var el = this;

	var defaults = { 									
		"tag" : "div",
		"content" : false,
		"value" : false,
		"type" : false,
		"id" : false,
		"classes" : false,
		"for": false
    };

    options = Object.assign({}, defaults, options);

    /* console.log(options); */

    var item = document.createElement(options.tag);

    if(options.value)
    	item.setAttribute("value", options.value);

    if(options.content)
    	item.innerHTML = options.content;

    if(options.type) 
		item.setAttribute("type", options.type);

    if(options.id) 
    	item.setAttribute("id", options.id);

    if(options.classes) 
    	item.setAttribute("class", options.classes);

    if(options.for) 
    	item.setAttribute("for", options.for);

    item.addEventListener( 'click', onClick);

    el.appendChild(item);

    return item;
}

/* actions */
function collectorAction() {
	var r = new XMLHttpRequest();
	r.open("GET", "https://api.surveymonkey.com/v3/surveys/"+api.surveyId+"/collectors", true);
	r.setRequestHeader('Authorization', 'Bearer ' + api.token);
	r.onreadystatechange = function () {
	  if (r.readyState != 4 || r.status != 200) return;
	  	obj = JSON.parse(r.responseText);
	  	console.log(obj)
	};
	r.send();
}

function responseAction(collectorID) {
	var r = new XMLHttpRequest();
	r.open("GET", "https://api.surveymonkey.com/v3/surveys/"+collectorID+"/responses", true);
	r.setRequestHeader('Authorization', 'Bearer ' + api.token);
	r.onreadystatechange = function () {
	  if (r.readyState != 4 || r.status != 200) return;
	  	obj = JSON.parse(r.responseText);
	  	console.log(obj)
	};
	r.send();
}

function closeScreenAction() {
	var surveyPop = document.getElementById('survey-pop');
	fadeOut(surveyPop);
}

function callBackPageAction(num) {
	if(num<=1) {
		firstScreen();
	} else {
		pageScreen((num-1));
	}
}

function changeDotAction(num) {
	var stepArea = document.getElementById('step-area');
	 for (i = 0; i < (stepArea.children.length); i++) {
	 	stepArea.children[i].setAttribute("class", "step");
	 }
	var stepDot = document.getElementById('step-'+num);
	stepDot.setAttribute("class", "step active");
}


/* helpers */
function setDots(count) {
	var stepArea = document.getElementById('step-area');
	stepArea.insert_element({tag: 'button', classes: 'step active', id: 'step-first'});
	for (i = 1; i < (count+1); i++) {
	 	stepArea.insert_element({tag: 'button', classes: 'step', id: 'step-'+i});
	}
	stepArea.insert_element({tag: 'button', classes: 'step', id: 'step-last'});
}

/* app */
function firstScreen(is_start = false) {
	changeDotAction('first');
	var surveyPop = document.getElementById('survey-pop');
	var surveyBody = document.getElementById('box-root');
	fadeIn(surveyPop, 'block', function(){
		surveyBody.innerHTML = "";
		surveyBody.insert_element({ tag: 'h1', content: lang.firstScreen.question, classes: 'question mt-5 text-center'});
		surveyBody.insert_element({ tag: 'h2', content: lang.firstScreen.text, classes: 'text mt-3 text-center'});
		var div = surveyBody.insert_element({ classes: 'mt-5 text-center'});
		div.insert_element({ tag: 'button', content: lang.next, classes: 'button button-warning', id: 'first-next'}, function() {
			if(is_start)
				collectorAction();
			pageScreen(1);
		});
	});

}

function pageScreen(num) {
	changeDotAction(num);
	var surveyBody = document.getElementById('box-root');	
	fadeOut(surveyBody, function(){
		surveyBody.innerHTML = "";
		fadeIn(surveyBody, 'block', function(){

			var questions = window.localStorage.getItem('questions');
			if(questions) {

				surveyBody.insert_element({ tag: 'button', content: lang.back, classes: 'button button-secondary', id: 'back-page'}, function() {
						callBackPageAction(num);
				});

				questions = JSON.parse(questions);
				var question = questions.pages[(num-1)].questions[0];
				surveyBody.insert_element({ tag: 'h2', content: question.headings[0].heading, classes: 'question mt-2 text-center'});
				surveyBody.insert_element({ tag: 'hr', classes: 'mt-1 hr'});
				var fieldset =surveyBody.insert_element({ tag: 'fieldset', classes: 'rating'});
				var label;
				var choise;

				for(var i = question.answers.choices.length; i--;) {
					choise = question.answers.choices[i];
					console.log(choise);

					fieldset.insert_element({tag: 'input', type: 'radio', i, id:'star-'+i }, function(){
						/* save section */
						return true;
					});
					label = fieldset.insert_element({tag: 'label', for: 'star-'+i, classes: 'full'});
					label.insert_element({tag: 'span', content: choise.text}); 	
				}
				var div = surveyBody.insert_element({ classes: 'mt-1 text-center' });
				div.insert_element({ tag: 'button',  content: lang.next, classes: 'button button-warning', id: 'first-next'}, function() {
					if(questions.pages.length<(num+1)) {
						endScreen();	
					} else {
						pageScreen((num+1));
					}
				
				});

			}
		})
	});

	console.log(num);
}

function endScreen() {
	changeDotAction('last');
	var surveyBody = document.getElementById('box-root');
	fadeOut(surveyBody, function(){
		surveyBody.innerHTML = "";
		fadeIn(surveyBody, 'block', function(){
			surveyBody.insert_element({ tag: 'i', classes: 'icon check mt-5 text-center'});
			surveyBody.insert_element({ tag: 'h1', content: lang.endScreen.text, classes: 'question mt-5 text-center'});
		})
	});
	
}


function _init() {
	var surveyPop = document.getElementsByTagName("BODY")[0].insert_element({id:"survey-pop"});
	var surveyPopBox = surveyPop.insert_element({ classes: "box" });
	var surveyHeader = surveyPopBox.insert_element({ id: "box-header" });
	surveyHeader.insert_element({tag:'button', classes:'close', id:'close-pop'}, function() {
		closeScreenAction();
	});

	var surveyPopBoxBody = surveyPopBox.insert_element({ classes: 'box-body'});
	surveyPopBoxBody.insert_element({ id: 'box-root'});
	surveyPopBoxBody.insert_element({ id: 'step-area'});

	var r = new XMLHttpRequest();
	r.open("GET", "https://api.surveymonkey.com/v3/surveys/"+api.surveyId+"/details", true);
	r.setRequestHeader('Authorization', 'Bearer ' + api.token);
	r.onreadystatechange = function () {
	  if (r.readyState != 4 || r.status != 200) return;
	  	obj = JSON.parse(r.responseText);
	  	setDots(obj.page_count);
	  	window.localStorage.setItem('questions', JSON.stringify(obj));
	  	setTimeout(function(){
		   firstScreen(true);
		}, 5); // todo: 5000
	};
	r.send();
}

_init();

/* note: id'ler çalışabilir (entegre edilen sayfaya). id'leri generate etmek mümkün. */