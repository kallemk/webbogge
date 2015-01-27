displayView = function(currentView){  
    $('body').append(document.getElementById(currentView).text)
 
}
 
window.onload = function(){  
    
    displayView("welcomeview");
 
}

function signupValidation(){
	var x = document.getElementById("signup-pwd").value;
	var y = document.getElementById("signup-pwd2").value;
	if(x!=y){
		window.alert("Both password fields must be the same");
	}
}