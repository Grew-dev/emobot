
      
  $(document).ready(function() {
      socket.emit('message', 'intro')
});
      
  $speechInput = $("#speech");
  
  var socket = io();
  
  $speechInput.keypress(function(event) {
    
     if (event.which == 13) {

        event.preventDefault();
        socketSend($speechInput.val());
        $("#speech").val("");
        $(".typetext").text("");
        
    }
    
  });
    
    
    function setInput(text) {
      $speechInput.val(text);
      socketSend (text);
    }  

  socket.on('reply', function (reply) {
      
      console.log("reply: " + reply)
          
            var msg = new SpeechSynthesisUtterance();
            msg.voiceURI = "native";
            msg.text = reply;
            msg.lang = "en-US";
            window.speechSynthesis.speak(msg);

            var i = 0, howManyTimes = reply.length;

            for (var i = 0; i <=reply.length-1; i++) {

            
                setTimeout( function (i) {
          
                    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(reply.substring(0, (1+i++))); 
           
                }, 62 * i, i);
            }
            
            $("#response").text("reply: " + reply);

   })
    
    socket.on('emoji', function (emoji) {

        $("#emoji").text(emoji)
    })
    
    function socketSend (text) {

      socket.emit('message', text)
     
         if (text == "") {

           var msg = new SpeechSynthesisUtterance();
            msg.voiceURI = "native";
            msg.text = "I couldn't here you. Can you say that again?";
            msg.lang = "en-US";
            window.speechSynthesis.speak(msg);

            
          var i = 0, howManyTimes = msg.text.length;

            for (var i = 0; i <=msg.text.length-1; i++) {

                setTimeout( function (i) {

                    $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html(msg.text.substring(0, (1+i++))); 
           
                }, 62 * i, i);
            }

              
       
      } 
   }
    
    
