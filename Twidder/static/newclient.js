displayView = function(currentView){
    $('body').html(document.getElementById(currentView).text);
    if(currentView === "profileview"){
    	showMyInformation();
    	setWallContent();
    }
};

window.onload = function(){
	var token = getToken();
	//Token is null/undefined when not logged in
    if(token === null || token === 'undefined'){
    	displayView("welcomeview");
    }else{
    	displayView("profileview");
    }
};

function signUp(view){
    console.log("Startar signup")
    var xmlhttp;
    var response;


    //var formData = document.getElementById("firstname");
    //var formData = "signup-email="+ "bajs@hotmail.com"

    //var formData = new FormData();
    //formData.append('firstname', document.getElementById("firstname").value);

    var formData = [];
    var form = document.getElementById("sign-up");

    formData["firstname"] =  form[0].value;
    //formData["familyname"] =  form[1].value;
    //formData["gender"] =  form[2].value;
    //formData["city"] =  form[3].value;
    //formData["country"] =  form[4].value;
    //formData["email"] =  form[5].value;
    //formData["password"] =  form[6].value;


    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "sign_up", "true");
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            response = JSON.parse(xmlhttp.responseText);
            if (response.success){
                setToken(response.data);
                window.onload();
            } else {
                displayUserAlerts(response.message, view, "welcomeview");
            }
        }
    };
    console.log(formData);
    xmlhttp.send(formData);
}

function signIn(view){
    var xmlhttp;
    var response;

    var formData = new FormData(document.getElementById("log-in"));

    xmlhttp = new XMLHttpRequest();
    xmlhttp.open("POST", "sign_in", true);
    xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            response = JSON.parse(xmlhttp.responseText);
            if (response.success){
                setToken(response.data);
                window.onload();
            } else {
                displayUserAlerts(response.message, view, "welcomeview");
                formData.reset();
            }
        }
    };

    xmlhttp.send(formData);
}

/*The function appends the current alert message on the appropriate view*/
function displayUserAlerts(message, view, state){
	if(state === "welcomeview"){
		$("#welcomeview-alert-text").empty();
		$('#welcomeview-alert-text').append(message);
	}else{
		$("#profileview-alert-text").empty();
		$('#profileview-alert-text').append(message);
	}
	view.style.backgroundColor = "#B74934";
}

/*The function erases all non relevant alerts*/
function eraseUserAlerts(view, state){
	if(state === "welcomeview"){
		$("#welcomeview-alert-text").empty();
	}else{
		$("#profileview-alert-text").empty();
	}
	view.style.backgroundColor = "1a56bb";
}

/*The functions below are used to make a quick call to
authenticate users*/
function getToken(){
	return localStorage.getItem("myToken");
}

function setToken(token){
	localStorage.setItem("myToken",token);
}

/*The functions below are used to make a quick call to
know if there is an active search request on the browse tab*/
function getEmail(){
	return localStorage.getItem("userEmail");
}

function setEmail(email){
	localStorage.setItem("userEmail",email);
}