/* Function that does the required operations for the views when they are loaded */
displayView = function(currentView){
    //Appends the script to the script-container id in the HTML document
    document.getElementById("script-container").innerHTML = document.getElementById(currentView).innerHTML;
    if(currentView === "profileview"){
        //Used to set up the profile info and the message wall
    	showMyInformation();
    	setWallContent();
        //Gets the tab that should be displayed on the refresh
        var id = localStorage.getItem('activeTab');
        //Set display:none to all tabs
        changePanel();
        //Set display:block to the active tab
        document.getElementById(id).style.display = 'block';
    }else if(currentView === "welcomeview"){
        localStorage.setItem("activeTab",'home');
    }
};

/* Function that is called to load the window.
 Depending on if there is a token or not welcomeview or profile view will be called*/
window.onload = function(){
	var token = getToken();
	//Token is null/undefined when not logged in
    if(token === null || token === 'undefined'){
    	displayView("welcomeview");
    }else{
        socketDriver();
    	displayView("profileview");
    }
};

/* Functions that handles and initialises websockets.*/
var socketDriver = function(){
    //Sets up the url path for the websocket
    var loc = window.location, new_uri;
        if (loc.protocol === "https:") {
            new_uri = "wss:";
        } else {
            new_uri = "ws:";
        }
    new_uri += "//" + loc.host;
    new_uri += "/sign_in";
    var ws = new WebSocket(new_uri);
    ws.onopen = function(){
        console.log("Connection has opened with url:");
        console.log(new_uri);
        ws.send(localStorage.getItem('myToken'));
    };
    /* Depending on which kinde of data is provided this function handles it differently. */
    ws.onmessage = function (response) {
        parsed = JSON.parse(response.data);
        if(parsed.token == getToken()){
            displayUserAlerts("You have been logged in somewhere else.");
            signOut();
        }else if(parsed.type == "live_login"){
            updateLogin(parseInt(parsed.data.online_users), parseInt(parsed.data.total_users));
        }else if(parsed.type == "live_message"){
            updateMessage(parseInt(parsed.data.user_messages), parseInt(parsed.data.total_messages), parsed.data.top_list);
        }else{
            console.log('Something else happened')
        }
    };

    ws.onclose = function () {
        console.log("The connections has closed.");
    };
};


/* This is the callback function that is used to handle the XMLHttpRequests for each route in the server.
 The function is very generic and all parameters for it has to be given when it is called.*/
var callbackPost = function(method, url, requestHeader, requestHeaderValue, param,  callback){
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

/* The function is used to sign up a user with the given data in the form.
 If the data is written in a faulty way signupValidation woll be false and the user won't be signed up.*/
var signUp = function(){
    //Assigns the different components of the form to user variables
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
            if (this.success){
                displayUserAlerts(this.message);
		        form.reset();
            }else{
                displayUserAlerts(this.message);
                form.reset();
            }
        });
    }
};

/* The function is used to sign the user with the given email and password.
The socket connection is initiated */
function signIn(){
    //Assigns the different components of the form to user variables
    var form = document.getElementById("log-in");
    var email =  form[0].value;
    var password = form[1].value;
    var formData = "email=" + email + "&password=" + password;

    callbackPost("POST", "sign_in", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        if (this.success){
            setToken(this.data);
            //Initiates the socket connection
            socketDriver();
            //Sets the url when logged in to home
            window.history.pushState({}, '', '/home');
            displayView("profileview");
        }else{
            displayUserAlerts(this.message);
		    form.reset();
        }
    });
}

/* The function signs out the user according to the token in local storage */
function signOut(){
	var token = getToken();
    var tokenData = "token=" + token;

    callbackPost("POST", "sign_out", "Content-type", "application/x-www-form-urlencoded", tokenData, function(){
        if (this.success){
            localStorage.removeItem('myToken');
            //Makes the url go back to default when arriving to the start page on welcome view
            window.history.replaceState(null,'','/');
            displayView("welcomeview");
        }else{
            displayUserAlerts(this.message);
        }
    });
}

/*The function appends the logged in user's info on the home tab*/
function showMyInformation(){
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
    var y = 50; //Set the maximum character length of all parameters
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
	}else if((firstname.length || familyname.length || gender.length || city.length || country.length || email.length || pwd1.length || pwd2.length) > y){
        displayUserAlerts("The maximum number of characters is " + y);
    }else{
	    return true;
	}
};


/*This function sets all tabs to display:none*/
function changePanel(){
    document.getElementById('account').style.display = 'none';
    document.getElementById('browse').style.display = 'none';
    document.getElementById('home').style.display = 'none';
    document.getElementById('account').style.display = 'none';
}

/*Makes sure that the text fields in the browse tab are erased*/
function clearBrowse(){
    $("#friend-info p").empty();
    $("#user-message-wall textarea").empty();
    localStorage.removeItem("userEmail")
}

/* This function is used to validate the change passwor form
 and then calling the change_password route which returns sucess and a message
 It also erases the form content*/
function changePassword(){
	x = 5;
    y = 50;
	var oldPassword = document.getElementById('old-pwd').value;
	var newPassword = document.getElementById('new-pwd').value;
	var newPassword2 = document.getElementById('new-pwd2').value;
	var formData = "old_pwd=" + oldPassword + "&new_pwd=" + newPassword + "&token=" + getToken();
	if(newPassword!=newPassword2){
		displayUserAlerts("Both new password fields must be the same");
	}else if ((newPassword.length || newPassword2.length) < x){
            displayUserAlerts("The  new password must contain at least " + x + " characters");
	}else if((oldPassword.length || newPassword.length || newPassword2.length) > y){
        displayUserAlerts("The maximum number of characters is " + y);
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
    var userEmail = document.getElementById('show-email2').innerHTML;
    getUserByEmail(userEmail);
}

/* This function is used when the user profile will be shown.
It gets the correct email and passes it to getUserByEmail*/
function getUser(){
    var userEmail = document.getElementById('user-email').value;
    getUserByEmail(userEmail);
}

/*The function interprets what has been written in the search
field and sets up the user page.
It is also used for refreshing the messages of a user*/
function getUserByEmail(userEmail){
	var formData = "token=" + getToken() + "&email=" + userEmail;

	callbackPost("POST", "get_user_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
        var userData = this;
        if(userData.success === true){
            showFriendInfo(userData);
            callbackPost("POST", "messages_by_email", "Content-type", "application/x-www-form-urlencoded", formData, function(){
                var userMessages = this;
                setUserWallContent(userMessages);
            });
        }else{
            displayUserAlerts(userData.message);
            //Clears the user-email field
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
	$("#user-message-wall textarea").empty();
    for (i = (userMessages.data.length -1); i > -1; i--) {
        $('#user-wall').append(userMessages.data[i].email_sender + " says:" + "\n");
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
    //Erases the content of the user-email search field
	document.getElementById('user-email').value = "";
}

/*The function displays the current alert message*/
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

/* Used to set the token in the local storage */
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

/*The following code adds URL paths to the different routes*/
page.start();

page('/browse', function(){
    //Set all the panels to display:none
    changePanel();
    //Set the current tab to display:block
    document.getElementById('browse').style.display = 'block';
    //Set the current tab to active, makes the browser stay at current tab when refreshed
    localStorage.setItem("activeTab", 'browse');
});

page('/home', function(){
    changePanel();
    clearBrowse();
    document.getElementById('home').style.display = 'block';
    localStorage.setItem("activeTab", 'home');
});

page('/account', function(){
    changePanel();
    clearBrowse();
    document.getElementById('account').style.display = 'block';
    localStorage.setItem("activeTab", 'account');
});


/* The following functions are used to handle the data visualisation.
Chart.js is used to create the charts, please see http://www.chartjs.org/ */

/* The function sends the correct parameters to chartLoginLoad */
function updateLogin(logged_in, total){
    chartLoginLoad(logged_in, total);
}


/* The function sends the correct parameters to chartMessageLoad and chartTopLoad */
function updateMessage(user_messages, total_messages, top_list){
    chartMessageLoad(user_messages, total_messages);
    chartTopLoad(top_list);
}


/* Function that handles the input parameters and uses them to load the data for the loggedin/total users chart */
function chartLoginLoad(logged_in, total){

    var logged_out = total - logged_in;

    var doughnutData = [
    {
        value: logged_in,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Logged in users"
    },
    {
        value: logged_out,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Logged out users"
    }
    ];

    var ctx = document.getElementById("login-chart-area").getContext("2d");
	window.myDoughnut = new Chart(ctx).Doughnut(doughnutData, {responsive : true});
}


/* Function that handles the input parameters
and uses them to load the data for the users messages/total messages chart */
function chartMessageLoad(user_messages, total_messages){
    var other_messages = total_messages - user_messages;

    var doughnutData = [
    {
        value: user_messages,
        color:"#F7464A",
        highlight: "#FF5A5E",
        label: "Your messages"
    },
    {
        value: other_messages,
        color: "#46BFBD",
        highlight: "#5AD3D1",
        label: "Others messages"
    }
    ];

    var ctx = document.getElementById("message-chart-area").getContext("2d");
    window.Doughnut = new Chart(ctx).Doughnut(doughnutData, {responsive : true});
}


/* Function that handles the input parameters
and uses them to load the data for the top posting users chart */
function chartTopLoad(top_list){

    var labels_temp = []
    var data_temp = []
    for (i in top_list){
        labels_temp.push(top_list[i]['email'])
        data_temp.push(parseInt(top_list[i]['messages']))
    }

	var barChartData = {
		labels : labels_temp,
		datasets : [
			{
				fillColor : "rgba(220,220,220,0.5)",
				strokeColor : "rgba(220,220,220,0.8)",
				highlightFill: "rgba(220,220,220,0.75)",
				highlightStroke: "rgba(220,220,220,1)",
				data : data_temp
			}
		]

	};

    var ctx = document.getElementById("top-chart-area").getContext("2d");
    window.myBar = new Chart(ctx).Bar(barChartData, {
        responsive : true
    });
}
