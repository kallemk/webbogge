displayView = function(currentView){
    document.getElementById("script-container").innerHTML = document.getElementById(currentView).innerHTML;
    //$('body').html(document.getElementById(currentView).text);
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

var socketDriver = function(){
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
        ws.send(localStorage.getItem('myToken'));
    };
    ws.onmessage = function (response) {
        if(response.data == getToken()){
            displayUserAlerts("You have been logged in somewhere else.");
            signOut();
        }else{
            console.log('Something is wrong')
        }
    };

    ws.onclose = function () {
        console.log("The connections has closed.");
    };
};

var callbackPost = function(method, url, requestHeader, requestHeaderValue, param,  callback){
    console.log("Starting callbackPost");
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


var signUp = function(){
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


    if (signupValidation(firstname, familyname, gender, city, country, email, password, password2)){
        var formData = "firstname=" + firstname + "&familyname=" + familyname + "&gender=" + gender + "&city=" +city + "&country=" + country + "&email=" + email + "&password=" + password;

        callbackPost("POST", "sign_up", "Content-type", "application/x-www-form-urlencoded", formData, function(){
            console.log("This displayed:");
            console.log(this);
            if (this.success){
                console.log("success");
                displayUserAlerts(this.message);
		        form.reset();
                //setToken(response.data);
                //window.onload();
            }else{
                console.log("No success");
                displayUserAlerts(this.message);
            }
        });
    }
};

function signIn(){
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
            socketDriver();
            window.onload();

        }else{
            console.log("No success");
            displayUserAlerts(this.message);
		    form.reset();
        }
    });
}

function signOut(){
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
            displayUserAlerts(this.message);
        }
    });
}

/*The function appends the logged in user's info on the home tab*/
function showMyInformation(){
    console.log("Starting showMyInformation");
	var tokenData = "token=" + getToken();

    callbackPost("POST", "get_user_by_token", "Content-type", "application/x-www-form-urlencoded", tokenData, function(){
        if (this.success){
            $('#show-name').append(this.data.firstname + " " + this.data.familyname + "!");
            $('#show-email').append(this.data.email);
            $('#show-gender').append(this.data.gender);
            $('#show-city').append(this.data.city);
            $('#show-country').append(this.data.country);
        }
    });
}


/* This function tests all the fields in the sign up form and returns false if something is missing.
It returns true if the data provided in the form is correct*/
var signupValidation = function(firstname, familyname, gender, city, country, email, pwd1, pwd2){
    //Got this re string from http://stackoverflow.com/questions/46155/validate-email-address-in-javascript
    var re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    var x = 5; //Set the minimum character length of the password
    if(firstname == ""){
        displayUserAlerts("Please fill in the first name field");
        return false;
    }else if(familyname == ""){
        displayUserAlerts("Please fill in the last name field");
        return false;
    }else if(gender == ""){
        displayUserAlerts("Please fill in the gender field");
        return false;
    }else if(city == ""){
        displayUserAlerts("Please fill in the city field");
        return false;
    }else if(country == ""){
        displayUserAlerts("Please fill in the country field");
        return false;
    }else if(email == ""){
        displayUserAlerts("Please fill in the email field");
        return false;
    }else if(re.test(email) == false){
        displayUserAlerts("Please enter a valid email");
        return false;
    }else if(pwd1!=pwd2){
		displayUserAlerts("Both password fields must be the same");
		return false;
	}else if ((pwd1.length || pwd2.length) < x){
		displayUserAlerts("The password must contain at least " + x + " characters");
		return false;
	}else{
	    return true;
	}
}


/*This function uses the input from the tab buttons to interpret
which tab that is the one that should be shown. The function changes
the style of the different div tags*/
function changePanel(active, first, second, third){

	active.style.display = 'block';
	first.style.display = 'none';
	second.style.display = 'none';
    third.style.display = 'none';
	//Makes sure that the text fields in the browse tab are erased
	if(first === browse || second === browse || third === browse){
		$("#friend-info p").empty();
		$("#user-message-wall textarea").empty();
		localStorage.removeItem("userEmail");
	}
}

/* This function is used to validate the change passwor form
 and then calling the change_password route which returns sucess and a message
 It also erases the form content*/
function changePassword(){
	x = 5;
	var oldPassword = document.getElementById('old-pwd').value;
	var newPassword = document.getElementById('new-pwd').value;
	var newPassword2 = document.getElementById('new-pwd2').value;
	var formData = "old_pwd=" + oldPassword + "&new_pwd=" + newPassword + "&token=" + getToken();
	if(newPassword!=newPassword2){
		displayUserAlerts("Both new password fields must be the same");
	}else if ((newPassword.length || newPassword2.length) < x){
				displayUserAlerts("The  new password must contain at least " + x + " characters");
	}else{
        callbackPost("POST", "change_password", "Content-type", "application/x-www-form-urlencoded", formData, function(){
            displayUserAlerts(this.message);
        });
	}
	//Erases the form content
	var pwdForm = document.getElementById('change-password');
	pwdForm.reset();
}


/* This function is used to provide the correct email form the userpage
 for the getUserByEmail when refreshing the messages */
function refreshUser(){
    console.log("Starting refreshUser");
    var userEmail = document.getElementById('show-email2').innerHTML;
    getUserByEmail(userEmail);
}

/* This function is used when the user profile will be shown.
It gets the correct email and passes it to getUserByEmail*/
function getUser(){
    console.log("Starting getUser");
    var userEmail = document.getElementById('user-email').value;
    console.log(userEmail);
    getUserByEmail(userEmail);
}

/*The function interprets what has been written in the search
field and sets up the user page.
It is also used for refreshing the messages of a user*/
function getUserByEmail(userEmail){
    console.log("Starting getUserByEmail");
	var formData = "token=" + getToken() + "&email=" + userEmail;
	console.log(formData);

	callbackPost("POST", "get_user_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        var userData = this;
        if(userData.success === true){
            showFriendInfo(userData);
            callbackPost("POST", "messages_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
                var userMessages = this;
                console.log(userMessages);
                console.log(userMessages.data[0].message);
                setUserWallContent(userMessages);
            });
        }else{
            displayUserAlerts(userData.message);
            document.getElementById('user-email').value = "";
        }
    });
}

/*The function interprets the information of the posting
textarea and sends it to the function that appends the
post content on the wall*/
function getUserPost(){
	var token = getToken();
	var tokenData = "token=" + token;
	var postContent = document.getElementById('to-user-wall').value;
	var email = document.getElementById('show-email2').innerHTML;
	console.log("Titta!");
	console.log(email);
	if(postContent === ""){
		displayUserAlerts("Write something!");
	}else if(email === null || email === "undefined"){
		displayUserAlerts("You need to choose a user!");
		document.getElementById('to-user-wall').value = "";
	}else{
		var postData = "token=" + token + "&message=" + postContent + "&email_wall=" + email + "&email=" + email;

		callbackPost("POST", "post_message", "Content-type", "application/x-www-form-urlencoded", postData, function(){
		    displayUserAlerts(this.message);
            if(this.success){
                document.getElementById("to-user-wall").value = "";
                callbackPost("POST", "messages_by_email", "Content-type", "application/x-www-form-urlencoded", postData, function(){
                    console.log(this);
                    console.log(this.data);
                    console.log(this.data.messages);
                    setUserWallContent(this);
                });
            }
        });
	}
}

/*The function interprets the information of the posting
textarea and sends it to the function that appends the
post content on the wall*/
function getMyPost(){
	var postContent = document.getElementById('to-my-wall').value;
	if(postContent === ""){
		displayUserAlerts("Write something!");
	}else{
        var token = getToken();
        var email_wall = document.getElementById('show-email').innerHTML;
		var postData = "token=" + token + "&message=" + postContent + "&email_wall=" + email_wall;

		callbackPost("POST", "post_message", "Content-type", "application/x-www-form-urlencoded", postData, function(){
		    displayUserAlerts(this.message);
	        if(this.success){
	            document.getElementById("to-my-wall").value = "";
	            setWallContent();
            }
        });
	}
}



/*The function sets up the content of the logged in users wall*/
function setWallContent(){
	$("#message-wall textarea").empty();
	var tokenData = "token=" + getToken();
	callbackPost("POST", "messages_by_token", "Content-type", "application/x-www-form-urlencoded", tokenData, function(){
        if (this.success){
            for (i = (this.data.length -1); i > -1; i--) {
                $('#my-wall').append(this.data[i].email_sender + " says:" + "\n");
                $('#my-wall').append(this.data[i].message + "\n");
            }
	    }
	});
}

/*The function sets up the content of the searched users wall*/

function setUserWallContent(userMessages){
    console.log("Starting setuserwallcontent");
    console.log(userMessages);
    console.log(userMessages.data[0].message);
	$("#user-message-wall textarea").empty();
    for (i = (userMessages.data.length -1); i > -1; i--) {
        $('#user-wall').append(userMessages.data[i].email_sender + " says:" + "\n");
        console.log(userMessages.data[i].message);
        $('#user-wall').append(userMessages.data[i].message + "\n");
    }
}

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

/*The function appends the current alert message*/
function displayUserAlerts(message){
	var alertBox = document.getElementById('alert');
    alertBox.style.display = "block";
    document.getElementById("alertMessage").innerHTML = message;
    setTimeout(function(){alertBox.style.display = "none";}, 3000);
}

/*The functions below are used to make a quick call to
authenticate users*/
function getToken(){
	return localStorage.getItem("myToken");
}

function setToken(token){
	localStorage.setItem("myToken",token);
}


/* The following functions are used to drag and drop smileys */

/* Used by elements that can be dragged */
function allowDrop(ev) {
    ev.preventDefault();
}


/* Specifies what should happen when the element is dragged */
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
    var smiley = ev.dataTransfer.getData("text");
    // Depending on which smiley is dragged, different proxy images will be shown
    if (smiley == "smiley1"){
        var img = document.createElement("img");
        img.src = "static/img/smile.png";
    }else if (smiley == "smiley2"){
        var img = document.createElement("img");
        img.src = "static/img/sad.png";
    }else if (smiley == "smiley3"){
        var img = document.createElement("img");
        img.src = "static/img/happy.png";
    }
    ev.dataTransfer.setDragImage(img, 0, 0);
}

/* Specifies what should happen at the drop event */
function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    // If there is something wiritten in the textare the smiley is added after the text.
    ev.target.value += document.getElementById(data).children[0].innerHTML;
}

/* The following functions are used to handle the data visualisation.
CHart.js is used to create the charts, please see http://www.chartjs.org/ */

function liveMessage():
    console.log("Starting liveMessage");


function liveLogin():
    console.log("Starting liveLogin");



function loadCharts(){
    chartLoginLoad();
    chartMessageLoad();
    chartTopLoad();
}


function chartLoginLoad(){

    //var logged_out = total - logged_in;

    var doughnutData = [
    {
        value: 6,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Logged in users"
    },
    {
        value: 8,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Logged out users"
    }
    ];

    var ctx = document.getElementById("login-chart-area").getContext("2d");
	window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {responsive : true});
};


function chartMessageLoad(){


    var doughnutData = [
    {
        value: 5,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Your messages"
    },
    {
        value: 16,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Others messages"
    }
    ];

    var ctx = document.getElementById("message-chart-area").getContext("2d");
    window.Doughnut = new Chart(ctx).Doughnut(doughnutData, {responsive : true});
};


function chartTopLoad(){

	var barChartData = {
		labels : ["January","February","March"],
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(220,220,220,0.75)",
				highlightStroke: "rgba(220,220,220,1)",
				data : [13, 9, 5]
			}
		]

	}

    var ctx = document.getElementById("top-chart-area").getContext("2d");
    window.myBar = new Chart(ctx).Bar(barChartData, {
        responsive : true
    });
}
