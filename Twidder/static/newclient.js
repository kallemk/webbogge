displayView = function(currentView){
    $('body').html(document.getElementById(currentView).text);
    if(currentView === "profileview"){
    	//showMyInformation();
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
    var formData = "firstname=" + firstname + "&familyname=" + familyname + "&gender=" + gender + "&city=" +city + "&country=" + country + "&email=" + email + "&password=" + password;

    callbackPost("POST", "sign_up", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        console.log("This displayed:");
        console.log(this);
        if (this.success){
            console.log("success");
            displayUserAlerts(this.message, view, "welcomeview");
            //setToken(response.data);
            //window.onload();
        }else{
            console.log("No success");
            displayUserAlerts(this.message, view, "welcomeview");
        }
    });
};

function signIn(view){
    console.log("Starting signin");

    var form = document.getElementById("log-in");
    var email =  form[0].value;
    var password = form[1].value;
    var formData = "email=" + email + "&password=" + password;
    console.log("formData:");
    console.log(formData);

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
            formData.reset();
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
	var token = getToken();

    callbackPost("POST", "get_user_by_token", "Content-type", "application/x-www-form-urlencoded", token, function(){
        console.log("This displayed:");
        console.log(this);
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







/* THIS IS THE OLD SIGNUP LEFT FOR EDUCATIONAL PURPOSE */
function signUpOld(view){
    console.log("Startar signup");
    var xmlhttp;
    var response;

    var form = document.getElementById("sign-up");

    var firstname =  form[0].value;
    var familyname = form[1].value;
    var gender = form[2].value;
    var city = form[3].value;
    var country = form[4].value;
    var email = form[5].value;
    var password = form[6].value;


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
    formData = "firstname=" + firstname + "&familyname=" + familyname + "&gender=" + gender + "&city=" +city + "&country=" + country + "&email=" + email + "&password=" + password;
    xmlhttp.send(formData);
}

function signInOld(view){
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