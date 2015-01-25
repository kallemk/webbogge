displayView = function(currentView){  
    $('body').append(document.getElementById(currentView).text)
 
}
 
window.onload = function(){  
    
    displayView("welcomeview");
 
}