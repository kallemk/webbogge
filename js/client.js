displayView = function(currentView){  
    //$('body').append(document.getElementById(currentView).text)
    $('body').html(document.getElementById(currentView).text);
    if(currentView === "profileview"){
    	showMyInformation();
    	setWallContent();
    }
}

window.onload = function(){
	var token = getToken();
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
		window.alert("Both password fields must be the same");
	}else if ((pwd1.length || pwd2.length) < x){
		window.alert("The password must contain at least " + x + " characters");
	}else{ //Should this really be here, maybe it should be moved to an own function. But I don't know how to call that yet. Kalle mar skit!
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

function getToken(){
	return localStorage.getItem("myToken");
}

function setToken(token){
	localStorage.setItem("myToken",token);
}

function getEmail(){
	return localStorage.getItem("userEmail");
}

function setEmail(email){
	localStorage.setItem("userEmail",email);
}

function changePanel(active, firstInactive, secondInactive){
	active.style.display = 'block';
	firstInactive.style.display = 'none';
	secondInactive.style.display = 'none';
	if(firstInactive === browse || secondInactive === browse){
		$("#friend-info p").empty();
		$("#user-message-wall textarea").empty();
	}
}

function changePassword(){
	x = 5;
	var oldPassword = document.getElementById('old-pwd').value;
	var newPassword = document.getElementById('new-pwd').value;
	var newPassword2 = document.getElementById('new-pwd2').value;
	var token = getToken();
	if(newPassword!=newPassword2){
		window.alert("Both new password fields must be the same");
	}else if ((newPassword.length || newPassword2.length) < x){
		window.alert("The  new password must contain at least " + x + " characters");
	}else{
		var state = serverstub.changePassword(token, oldPassword, newPassword);
		if(state.success === true){
			alert(state.message);
		}else{
		alert(state.message);
		}
	}
	var pwdForm = document.getElementById('change-password');
	pwdForm.reset();
}

function showMyInformation(){
	var token = getToken();
	var user = serverstub.getUserDataByToken(token);
	$('#show-name').append(user.data.firstname + " " + user.data.familyname + "!");
	$('#show-email').append(user.data.email);
	$('#show-gender').append(user.data.gender);
	$('#show-city').append(user.data.city);
	$('#show-country').append(user.data.country);
}

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

function showFriendInfo(user){
	$("#friend-info p").empty();
	$('#show-name2').append("This is " + user.data.firstname + " " + user.data.familyname + "!");
	$('#show-email2').append(user.data.email);
	$('#show-gender2').append(user.data.gender);
	$('#show-city2').append(user.data.city);
	$('#show-country2').append(user.data.country);
	document.getElementById('user-email').value = "";
}

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

function getUserPost(){
	var token = getToken();
	var postContent = document.getElementById('to-user-wall').value;
	if(postContent === ""){
		alert("Write something!");
	}else{
		var email = getEmail();
		var user = serverstub.getUserDataByEmail(token, email);
		var state = serverstub.postMessage(token, postContent, user.data.email);
		newestPost(token, user, "#user-wall", "to-user-wall");
	}
}

function newestPost(token, user, messageWall, postWall){
	var messages = serverstub.getUserMessagesByEmail(token, user.data.email);
	var currentValue = $(messageWall).text();
	var author = (messages.data[0].writer + " says:" + "\n");
	var newValue = (author + messages.data[0].content + "\n" + currentValue);
	$(messageWall).val(newValue);
	document.getElementById(postWall).value = "";
}

function setWallContent(){
	var token = getToken();
	var user = serverstub.getUserDataByToken(token);
	var messages = serverstub.getUserMessagesByEmail(token, user.data.email);
	for (i = 0; i < messages.data.length; i++) {
		$('#my-wall').append(messages.data[i].writer + " says:" + "\n");
		$('#my-wall').append(messages.data[i].content + "\n");
	}
}

function setUserWallContent(){
	$("#user-message-wall textarea").empty();
	var token = getToken();
	var email = getEmail();
	var user = serverstub.getUserDataByEmail(token, email);
	var messages = serverstub.getUserMessagesByEmail(token, email);
	for (i = 0; i < messages.data.length; i++) {
		$('#user-wall').append(messages.data[i].writer + " says:" + "\n");
		$('#user-wall').append(messages.data[i].content + "\n");
	}
}