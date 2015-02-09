displayView = function(currentView){  
    $('body').html(document.getElementById(currentView).text);
    if(currentView === "profileview"){
    	showMyInformation();
    	setWallContent();
    }
}

window.onload = function(){
	var token = getToken();
	//Token is null/undefined when not logged in
    if(token === null || token === 'undefined'){
    	displayView("welcomeview");
    }else{
    	displayView("profileview");
    }
}

function signupValidation(){
	var x = 5; //Set the minimum character length of the password
	var pwd1 = document.getElementById("signup-pwd").value;
	var pwd2 = document.getElementById("signup-pwd2").value;
	if(pwd1!=pwd2){
		alert("Both password fields must be the same");
	}else if ((pwd1.length || pwd2.length) < x){
		alert("The password must contain at least " + x + " characters");
	}else{
		var dataObject = {
			email : document.getElementById("signup-email").value,
			password : document.getElementById("signup-pwd").value,
			firstname : document.getElementById("firstname").value,
			familyname : document.getElementById("lastname").value,
			gender : document.getElementById("gender").value,
			city : document.getElementById("city").value,
			country : document.getElementById("country").value
		};
		var state = serverstub.signUp(dataObject);
		alert(state.message);
		if(state.success === true){
			signIn(dataObject.email, dataObject.password);
		}
	}
}

/*Interprets the form fields fo further use in the sign in process*/
function loginForm(){
	var email = document.getElementById("email").value;
	var pwd = document.getElementById("pwd").value;
	signIn(email,pwd);
}


function signIn(email,password){
	var state = serverstub.signIn(email, password);
	if(state.success === true){
		setToken(state.data);
		alert(state.message);
		window.onload();
	}else{
		alert(state.message);
		var signInForm = document.getElementById('log-in');
		signInForm.reset();
	}
}

function signOut(){
	var token = getToken();
	var state = serverstub.signOut(token);
	if(state.success === true){
		alert(state.message);
		localStorage.removeItem('myToken');
		window.onload();
	}else{
		alert(state.message);
	}
}


/*This function uses the input from the tab buttons to interpret
which tab that is the one that should be shown. The function changes
the style of the different div tags*/
function changePanel(active, firstInactive, secondInactive){
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

function changePassword(){
	x = 5;
	var oldPassword = document.getElementById('old-pwd').value;
	var newPassword = document.getElementById('new-pwd').value;
	var newPassword2 = document.getElementById('new-pwd2').value;
	var token = getToken();
	if(newPassword!=newPassword2){
		alert("Both new password fields must be the same");
	}else if ((newPassword.length || newPassword2.length) < x){
		alert("The  new password must contain at least " + x + " characters");
	}else{
		var state = serverstub.changePassword(token, oldPassword, newPassword);
		if(state.success === true){
			alert(state.message);
		}else{
			alert(state.message);
		}
	}
	//Erases the form content
	var pwdForm = document.getElementById('change-password');
	pwdForm.reset();
}

/*The function appends the logged in user's info on the home tab*/
function showMyInformation(){
	var token = getToken();
	var user = serverstub.getUserDataByToken(token);
	$('#show-name').append(user.data.firstname + " " + user.data.familyname + "!");
	$('#show-email').append(user.data.email);
	$('#show-gender').append(user.data.gender);
	$('#show-city').append(user.data.city);
	$('#show-country').append(user.data.country);
}

/*The function interprets what has been written in the search
field and sets up the user page*/
function viewUser(){
	var token = getToken();
	var userEmail = document.getElementById('user-email').value;
	var userData = serverstub.getUserDataByEmail(token, userEmail);
	var userMessages = serverstub.getUserMessagesByEmail(token, userEmail);
	if(userData.success === true){
		alert(userData.message);
		setEmail(userEmail);
		setUserWallContent();
		showFriendInfo(userData);
	}else{
		alert(userData.message);
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

/*The function interprets the information of the posting
textarea and sends it to the function that appends the
post content on the wall*/
function getMyPost(){
	var token = getToken();
	var postContent = document.getElementById('to-my-wall').value;
	alert(postContent);
	if(postContent === ""){
		alert("Write something!");
	}else{
		var user = serverstub.getUserDataByToken(token);
		var state = serverstub.postMessage(token, postContent, user.data.email);
		newestPost(token, user, "#my-wall", "to-my-wall");
	}
}

/*The function interprets the information of the posting
textarea and sends it to the function that appends the
post content on the wall*/
function getUserPost(){
	var token = getToken();
	var email = getEmail();
	var postContent = document.getElementById('to-user-wall').value;
	if(postContent === ""){
		alert("Write something!");
	}else if(email === null || email === "undefined"){
		alert("You need to choose a user!");
		document.getElementById('to-user-wall').value = "";
	}else{
		var email = getEmail();
		var user = serverstub.getUserDataByEmail(token, email);
		var state = serverstub.postMessage(token, postContent, user.data.email);
		newestPost(token, user, "#user-wall", "to-user-wall");
	}
}

/*This function puts the most recent post on the signed in users
wall or the searched users wall*/
function newestPost(token, user, messageWall, postWall){
	var messages = serverstub.getUserMessagesByEmail(token, user.data.email);
	var currentValue = $(messageWall).text();
	var author = (messages.data[0].writer + " says:" + "\n");
	var newValue = (author + messages.data[0].content + "\n" + currentValue);
	$(messageWall).val(newValue);
	document.getElementById(postWall).value = "";
}

/*The function sets up the content of the logged in users wall*/
function setWallContent(){
	var token = getToken();
	var user = serverstub.getUserDataByToken(token);
	var messages = serverstub.getUserMessagesByEmail(token, user.data.email);
	for (i = 0; i < messages.data.length; i++) {
		$('#my-wall').append(messages.data[i].writer + " says:" + "\n");
		$('#my-wall').append(messages.data[i].content + "\n");
	}
}

/*The function sets up the content of the searched users wall*/
function setUserWallContent(){
	$("#user-message-wall textarea").empty();
	var token = getToken();
	var email = getEmail();
	if(email === null || email === "undefined"){
		alert("You need to choose a user!")
	}else{
		var user = serverstub.getUserDataByEmail(token, email);
		var messages = serverstub.getUserMessagesByEmail(token, email);
		for (i = 0; i < messages.data.length; i++) {
			$('#user-wall').append(messages.data[i].writer + " says:" + "\n");
			$('#user-wall').append(messages.data[i].content + "\n");
		}
	}
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