
      
     $(document).ready(function() {
          socket.emit('message', 'intro')
    });
          
     var $speechInput, // The input element, the speech box
      $recBtn, // Toggled recording button value
      recognition, // Used for accessing the HTML5 Speech Recognition API
      messageRecording = "Recording...",
      messageCouldntHear = "I couldn't hear you, could you say that again?",
      messageInternalError = "Oh no, there has been an internal server error",
      messageSorry = "I'm sorry, I don't have the answer to that yet.";

      $speechInput = $("#speech");
      $recBtn = $("#rec");
      
      var socket = io();
      
      $speechInput.keypress(function(event) {
        
         if (event.which == 13) {

          event.preventDefault();
          socketSend($speechInput.val());
          $("#speech").val("");
          $(".typetext").text("");
          
        }
        
      });
      
         $recBtn.on("click", function(event) {
          switchRecognition();
            $(".typetex").val("") 
              $(".typetex").text("") 
        });

        
        function switchRecognition() {
          if (recognition) {
            stopRecognition();
          } else {
            startRecognition();
          }
        }
        
        function startRecognition() {
          recognition = new webkitSpeechRecognition();
          recognition.continuous = false;
          recognition.interimResults = false;
          // socket.emit('ga-event', 'Mic recording')
          recognition.onstart = function(event) {
            $("#spokenResponse").addClass("is-active").find(".spoken-response__text").html("Recording...");
            // $("#spokenResponse").addClass("is-active").find(".typetext").text("Recording...");
            updateRec();
          };
          recognition.onresult = function(event) {
            recognition.onend = null;
        
            var text = "";
            for (var i = event.resultIndex; i < event.results.length; ++i) {
              text += event.results[i][0].transcript;
            }
            setInput(text);
            stopRecognition();
          };
          recognition.onend = function() {
            socketSend ("")
            stopRecognition();
          };
          recognition.lang = "en-US";
          recognition.start();
        }
        
        function stopRecognition() {
          if (recognition) {
            console.log("stop recognition")
            recognition.stop();
            recognition = null;

          }
          updateRec();
        }
        
        function setInput(text) {
          $speechInput.val(text);
          socketSend (text);
        }
        
        function updateRec() {
          $recBtn.text(recognition ? "Stop" : "Speak");
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
        
        
