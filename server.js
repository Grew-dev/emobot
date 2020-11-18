require('dotenv').config();
var express = require('express');
var app = express();
var path = require('path');
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(express.static(path.join(__dirname, '/public')));

var nlp = require('compromise');
var Sentiment = require('sentiment');
var sentiment = new Sentiment();

var Readline = require('readline')
var Rivescript = require('rivescript')

var axios = require("axios");
const googleTrends = require('google-trends-api');

const {getQuestion, getPersonName} = require('random-questions');
var randomMathQuestion = require('random-math-question');

var emotion = require('emoji-emotion');
var randomItem = require('random-item');

var conversationId = 0;

const introQuestions = require('./data/questions')

io.on('connection', function(socket){
  
  var bot = new Rivescript({async: true});

  var randItem = randomItem(introQuestions)

    socket.on('message', function(message) {

    if (conversationId == 0) {
      console.log("first connect")
      conversationId = socket.id
      console.log(conversationId)
    }
            
        console.log("message: " + message)
      
      if (message =='intro') {
        
          const conversationId = socket.id
          var randomGreeting = [
            "Hey.",
            "Hi!",
            "Hello.",
            "Hello!",
            "Hey!",
            "Hello human. Can I ask you something.",
            "Hello, human!",
            "Hello human!",
            "Nice to have you here, human.",
            "I'm a machine but I'm interested in knowing this: "
            ]
            
          var randMath = randomMathQuestion.get()
            
          var randomGreeting2 = [
            randItem,
            getQuestion(),
            "How are you?",
            "How are you doing today?",
            "How much is " + randMath.question + "?"
            ]
          
          socket.emit('reply', randomItem(randomGreeting) + ' ' + randomItem(randomGreeting2));
          
      } else {
      
        bot.loadDirectory('./brain').then(onReady).catch(onError);

      function onReady () {

        bot.sortReplies();

        var result = sentiment.analyze(message);
        // console.log("Bot is ready!");

        //negative
        if (result.score < -1) {

          console.log("negative message detected")

          if (bot._var.mood == 'happy') {
            var moodCommand = 'to neutral'
          } else if (bot._var.mood == 'offended') {
            var moodCommand = 'to offended'
            
          } else {
            var moodCommand = 'to sad'
          }

          bot.reply(socket.id, moodCommand).then(function(reply) {
            
            console.log("updated the mood " + moodCommand)

            bot.reply(socket.id, message).then(function(reply) {

              if (reply == 'ERR: No Reply Matched') {
                console.log("no rive script reply")
                console.log('mood: ' + bot._var.mood)
                // socket.emit('reply', 'No Rive script reply');
                
                console.log("empty message1:")
                console.log(message)
              
                dialogflowMessage (message, socket)
                sendEmoji (message, bot._var.mood, socket) 
            
              } else {

                console.log('bot reply: ' + reply)
                console.log('mood: ' + bot._var.mood)
                
      
                if (nlp(message).questions().data().length >0) {

                  socket.emit('reply', reply);
                  sendEmoji (message, bot._var.mood, socket) 

                } else {
                    sendEmoji (message, bot._var.mood, socket) 
                    socket.emit('reply', reply);

                }

              }
            });

         
          })
    
        //positive
        } else if (result.score > 1) {

          console.log("positive message")

          if (bot._var.mood == 'sad') {
            var moodCommand = 'to neutral'
          } else if (bot._var.mood == 'offended') {
            var moodCommand = 'to offended'
          } else {
            var moodCommand = 'to happy'
          }

          bot.reply(socket.id, moodCommand).then(function(reply) {
            
            console.log("changed mood " + moodCommand)
            console.log('mood: ' + bot._var.mood)
            


            bot.reply(socket.id, message).then(function(reply) {

              if (reply == 'ERR: No Reply Matched') {
                console.log("no rive script reply")
                //   socket.emit('reply', 'No Rive script reply');
                
                console.log("empty message2:")
                console.log(message)
                
                dialogflowMessage (message, socket)
                sendEmoji (message, bot._var.mood, socket) 
            
              } else {

                if (nlp(message).questions().data().length >0) {
                  
                  console.log("happy question detected")
                  console.log("Bot reply: " + reply)

                  var happyQuestion = randomItem(["I'm glad you asked! ", "Thanks for asking! ", "That's a great question! "]);
                  socket.emit('reply', reply);
                  sendEmoji (message, bot._var.mood, socket) 
                } else {

                  // var happyRandom = randomItem([" :)", ":)", " ", ":-)", " :-)", ";-)", " ;-)", ";)", " ;)", "8-)", " 8-)", ":D", ": D", " :D", " ;D", " ;D"]);
                  console.log("Bot reply: " + reply)
                  sendEmoji (message, bot._var.mood, socket) 
                    socket.emit('reply', reply);

                }

              }
            });

         
          })

        //neutral
        } else {

          if (bot._var.mood == 'sad') {
            var moodCommand = 'to sad'
          } else if (bot._var.mood == 'happy')  {
            var moodCommand = 'to happy'
          } else if (bot._var.mood == 'offended') {
            var moodCommand = 'to offended'
          } else {
            var moodCommand = 'to neutral'
          }

          bot.reply(socket.id, moodCommand).then(function(reply) {
            
            bot.reply(socket.id, message).then(function(reply) {

              console.log('keeping the mood as it is.')
              console.log('mood: ' + bot._var.mood)
 
              if (reply == 'ERR: No Reply Matched') {
                console.log("no rive script reply")
                
                  if (message == "" || message == null || message == undefined) {
                    console.log("stopping the process")
                    return
                    
                  } else {
                  
                    console.log("empty message3:")
                    console.log(message)
    
                    if (bot._var.mood == 'sad') {
                      
                      socket.emit('reply', 'I wont talk to you until you say nicer things.');
                      // typeMessage (socket, 'I wont talk to you until you say nicer things.')
                      sendEmoji (message, bot._var.mood, socket) 
                    } else {
                      dialogflowMessage (message, socket)
                      sendEmoji (message, bot._var.mood, socket) 
                        // socket.emit('reply', "I'm not sure about this");
                    }
                    
                  }
              
                } else {
                  console.log('bot reply: ' + reply)
  
                    socket.emit('reply', reply);
                  sendEmoji (message, bot._var.mood, socket) 
  
                }
                
              
            });
         
          })

        }
        
      }
        
      }
      function onError (error) {
        console.log("error with file")
        // typeMessage (socket, "error")
        dialogflowMessage (message, socket)
        sendEmoji (message, bot._var.mood, socket) 
      }

    })
    

});

function messageSimilarTopic (message, socket) {

  //able to detect a topic
  if (nlp(message).topics().data().length > 0) {
        
    var messageTopic = nlp(message).topics().data()[0].normal
    
    var url = 'http://api.datamuse.com/words?rel_rhy=' + messageTopic.replace(" ", "+");
    
    console.log(url)
    axios.get(url)
      .then(function (response) {

        //able to find a rhyming word
        // typeMessage (socket, 'Did you say ' + response.data[0].word + '?')
        socket.emit('reply', 'Did you say ' + response.data[0].word + '?');
        console.log(response.data[0].word);
      })
      .catch(function (error) {

        //not able to find a rhyming word
        messageSentiment (message, socket)
        console.log(error);
    });
  
  //not able to detect a topic
  } else {
    googleTrends.autoComplete({keyword: message})
    .then(function(results) {
      var googleJson = JSON.parse(results)
      var type = googleJson.default.topics[0].type

      if (nlp(type).toLowerCase().out() == 'topic') {
        messageSentiment (message, socket)
      } else {
          socket.emit('reply', "Are you talking about the " + nlp(type).toLowerCase().out() + "?");
        // typeMessage (socket, "Are you talking about the " + nlp(type).toLowerCase().out() + "?")
      }
    })
    .catch(function(err) {
      console.log("google api error")
      console.error(err);
      messageSentiment (message, socket)
    })
    
  }
}

function messageSentiment (message, socket) {
  var result = sentiment.analyze(message);

  //negative
  if (result.score < -1) {
    console.log("negative mood")
     socket.emit('reply', "I'm sorry to hear :(");
    // typeMessage (socket, "I'm sorry to hear :(")
  
  //positive
  } else if (result.score > 1) {

    console.log("positive mood")
    // typeMessage (socket, 'Nice to hear :)')
    socket.emit('reply', "Nice to hear :)");

  //neutral
  } else {

    messageFallback (message, socket)

  }
}

function messageFallback (message, socket) {
  
    socket.emit('reply', "I'm sorry, I didn't get that :(");

}


function dialogflowMessage (message, socket) {
  
  if (message == "" || message == "I couldn't here you. Can you say that again?") {
    socket.emit('reply', "I'm sorry, I didn't get that :(");
    
  } else {
    messageSimilarTopic (message, socket)

  }
}

function sendEmoji (message, botMood, socket) {
  
  if (botMood == 'offended') {
       var result = sentiment.analyze(message);
      
      var emojiArray = []
      
      var i;
      for (i = 0; i < emotion.slice(0, 129).length; i++) {
        
          if (emotion.slice(0, 129)[i].polarity == -3)
          emojiArray.push(emotion.slice(0, 129)[i].emoji)
          // console.log(emojiArray)
      }
        
       console.log(randomItem(emojiArray))
       socket.emit('emoji', randomItem(emojiArray))
  } else if (botMood == 'sad') {
       var result = sentiment.analyze(message);
      
      var emojiArray = []
      
      var i;
      for (i = 0; i < emotion.slice(0, 129).length; i++) {
        
          if (emotion.slice(0, 129)[i].polarity == -3)
          emojiArray.push(emotion.slice(0, 129)[i].emoji)
          // console.log(emojiArray)
      }
        
       console.log(randomItem(emojiArray))
       socket.emit('emoji', randomItem(emojiArray))
  } else if (botMood == 'happy') {
       var result = sentiment.analyze(message);
      
      var emojiArray = []
      
      var i;
      for (i = 0; i < emotion.slice(0, 129).length; i++) {
        
          if (emotion.slice(0, 129)[i].polarity == 3)
          emojiArray.push(emotion.slice(0, 129)[i].emoji)
          // console.log(emojiArray)
      }
        
       console.log(randomItem(emojiArray))
       socket.emit('emoji', randomItem(emojiArray))
  } else {
    
     var result = sentiment.analyze(message);
      
      var emojiArray = []
      
      var i;
      for (i = 0; i < emotion.slice(0, 129).length; i++) {
        
          if (emotion.slice(0, 129)[i].polarity == result.score)
          emojiArray.push(emotion.slice(0, 129)[i].emoji)
          // console.log(emojiArray)
      }
        
       console.log(randomItem(emojiArray))
       socket.emit('emoji', randomItem(emojiArray))
  }
  
}

http.listen((process.env.PORT || 8080), function(){
  console.log('listening on *:8080');
});