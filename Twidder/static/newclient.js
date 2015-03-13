displayView = function(currentView){
    $('body').html(document.getElementById(currentView).text);
    if(currentView === "profileview"){
    	showMyInformation();
    	//setWallContent();
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

var callbackPost = function(method, url, requestHeader, requestHeaderValue, param,  callback){
    console.log("Starting callbackFunction");
    var xmlhttp;
    xmlhttp = new XMLHttpRequest();
    xmlhttp.open(method, url, "true");
    xmlhttp.setRequestHeader(requestHeader, requestHeaderValue);
    xmlhttp.send(param);

    xmlhttp.onreadystatechange = function(){
        if(xmlhttp.readyState == 4 && xmlhttp.status == 200){
            callback.call(JSON.parse(xmlhttp.responseText));

        }
    };
};


var signUp = function(view){
    console.log("Starting signup");

    var form = document.getElementById("sign-up");
    var firstname =  form[0].value;
    var familyname = form[1].value;
    var gender = form[2].value;
    var city = form[3].value;
    var country = form[4].value;
    var email = form[5].value;
    var password = form[6].value;
    var password2 = form[7].value;


    if (signupValidation(view, password, password2)){
        var formData = "firstname=" + firstname + "&familyname=" + familyname + "&gender=" + gender + "&city=" +city + "&country=" + country + "&email=" + email + "&password=" + password;

        callbackPost("POST", "sign_up", "Content-type", "application/x-www-form-urlencoded", formData, function(){
            console.log("This displayed:");
            console.log(this);
            if (this.success){
                console.log("success");
                displayUserAlerts(this.message, view, "welcomeview");
		        form.reset();
                //setToken(response.data);
                //window.onload();
            }else{
                console.log("No success");
                displayUserAlerts(this.message, view, "welcomeview");
            }
        });
    }
};

function signIn(view){
    console.log("Starting signin");

    var form = document.getElementById("log-in");
    var email =  form[0].value;
    var password = form[1].value;
    var formData = "email=" + email + "&password=" + password;
    console.log("formData:");
    console.log(formData);


    var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
    new_uri += "//" + loc.host;
    new_uri += loc.pathname + "sign_in";
    console.log(new_uri);
    var ws = new WebSocket(new_uri);
    ws.onopen = function(){
        ws.send('suger');
    };
    ws.onmessage = function (msg) {
        console.log(msg.data);
    };

    callbackPost("POST", "sign_in", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        console.log("This displayed:");
        console.log(this);
        if (this.success){
            console.log("success, Token:");
            console.log(this.data);
            setToken(this.data);
            window.onload();

        }else{
            console.log("No success");
            displayUserAlerts(this.message, view, "welcomeview");
		    form.reset();
        }
    });
}

function signOut(view){
    console.log("Starting signout");
	var token = getToken();
    console.log(token);
    var tokenData = "token=" + token;

    callbackPost("POST", "sign_out", "Content-type", "application/x-www-form-urlencoded", tokenData, function(){
        console.log("This displayed:");
        console.log(this);
        if (this.success){
            console.log("success");
            localStorage.removeItem('myToken');
            window.onload();

        }else{
            console.log("No success");
            displayUserAlerts(this.message, view, "profileview");
        }
    });
}

/*The function appends the logged in user's info on the home tab*/
function showMyInformation(){
    console.log("Starting showMyInformation");
	var token = getToken();
	console.log(token);
	var tokenData = "token=" + token;

    callbackPost("POST", "get_user_by_token", "Content-type", "application/x-www-form-urlencoded", tokenData, function(){
        console.log("This displayed:");
        console.log(this.data);
        if (this.success){
            console.log("success");
            $('#show-name').append(this.data.firstname + " " + this.data.familyname + "!");
            $('#show-email').append(this.data.email);
            $('#show-gender').append(this.data.gender);
            $('#show-city').append(this.data.city);
            $('#show-country').append(this.data.country);

        }else{
            console.log("No success");
        }
    });
}

var signupValidation = function(view, pwd1, pwd2){
	var x = 5; //Set the minimum character length of the password
	if(pwd1!=pwd2){
		displayUserAlerts("Both password fields must be the same", view, "welcomeview");
		return false;
	}else if ((pwd1.length || pwd2.length) < x){
		displayUserAlerts("The password must contain at least " + x + " characters", view, "welcomeview");
		return false;
	}else{
	    return true;
	}
}

/*This function uses the input from the tab buttons to interpret
which tab that is the one that should be shown. The function changes
the style of the different div tags*/
function changePanel(active, firstInactive, secondInactive, view){
	eraseUserAlerts(view, "profileview");

	active.style.display = 'block';
	firstInactive.style.display = 'none';
	secondInactive.style.display = 'none';
	//Makes sure that the text fields in the browse tab are erased
	if(firstInactive === browse || secondInactive === browse){
		$("#friend-info p").empty();
		$("#user-message-wall textarea").empty();
		localStorage.removeItem("userEmail");
	}
}

function changePassword(view){
	x = 5;
	var oldPassword = document.getElementById('old-pwd').value;
	var newPassword = document.getElementById('new-pwd').value;
	var newPassword2 = document.getElementById('new-pwd2').value;
	console.log(newPassword);
	var token = getToken();
	var formData = "old_pwd=" + oldPassword + "&new_pwd=" + newPassword + "&token=" + token;
	if(newPassword!=newPassword2){
		displayUserAlerts("Both new password fields must be the same",view, "profileview");
	}else if ((newPassword.length || newPassword2.length) < x){
				displayUserAlerts("The  new password must contain at least " + x + " characters",view, "profileview");
	}else{
	    var formData = "old_pwd=" + oldPassword + "&new_pwd=" + newPassword + "&token=" + token;

        callbackPost("POST", "change_password", "Content-type", "application/x-www-form-urlencoded", formData, function(){
            console.log("This displayed:");
            console.log(this.data);
            displayUserAlerts(this.message, view, "profileview");
        });
	}
	//Erases the form content
	var pwdForm = document.getElementById('change-password');
	pwdForm.reset();
}

//Not ready with this yet

/*The function interprets what has been written in the search
field and sets up the user page*/
/*
function getUserByEmail(view){
    console.log("Starting getUserByEmail");
	var token = getToken();
	var userEmail = document.getElementById('user-email').value;
	var formData = "token=" + token + "&email" + userEmail;

	callbackPost("POST", "get_user_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        console.log("This displayed:");
        console.log(this.data);

        callbackPost("POST", "messages_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
            console.log("This displayed:");
            console.log(this.data);

        });
    });

	var userData = serverstub.getUserDataByEmail(token, userEmail);
	var userMessages = serverstub.getUserMessagesByEmail(token, userEmail);
	if(userData.success === true){
		eraseUserAlerts(view, "profileview");
		setEmail(userEmail);
		setUserWallContent();
		showFriendInfo(userData);
	}else{
		displayUserAlerts(userData.message, view, "profileview");
		document.getElementById('user-email').value = "";
	}
}*/

/*The function appends the information for the user
that has been searched for*/
function showFriendInfo(user){
	//Erases the content of the p tags in the div
	$("#friend-info p").empty();

	$('#show-name2').append("This is " + user.data.firstname + " " + user.data.familyname + "!");
	$('#show-email2').append(user.data.email);
	$('#show-gender2').append(user.data.gender);
	$('#show-city2').append(user.data.city);
	$('#show-country2').append(user.data.country);
	document.getElementById('user-email').value = "";
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