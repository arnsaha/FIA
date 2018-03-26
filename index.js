'use strict';

const functions = require('firebase-functions'); // Cloud Functions for Firebase library
const DialogflowApp = require('actions-on-google').DialogflowApp; // Google Assistant helper library
var nodemailer = require('nodemailer');
var firebase = require('firebase-admin');
firebase.initializeApp(functions.config().firebase);
var firestore= firebase.firestore();
const gmailEmail = functions.config().gmail.email;
const gmailPassword = functions.config().gmail.password;
const mailTransport = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});
const mailOptions = {
    from: '"Spammy Corp." <noreply@firebase.com>',
    to: val.email,
  };
exports.dialogflowFirebaseFulfillment = functions.https.onRequest((request, response) => {
  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));
 
  if (request.body.result) {
    processV1Request(request, response);
  } else if (request.body.queryResult) {
    processV2Request(request, response);
  } else {
    console.log('Invalid Request');
    return response.status(400).end('Invalid Webhook Request (expecting v1 or v2 webhook request)');
  }
});
/*
* Function to handle v1 webhook requests from Dialogflow
*/
function processV1Request (request, response) {
    console.log('Request in V1');
}

/*
* Function to handle v2 webhook requests from Dialogflow
*/
function processV2Request (request, response) {
    console.log('Request in V2');
  // An action is a string used to identify what needs to be done in fulfillment
  let action = (request.body.queryResult.action) ? request.body.queryResult.action : 'default';
  // Parameters are any entites that Dialogflow has extracted from the request.
  let parameters = request.body.queryResult.parameters || {}; // https://dialogflow.com/docs/actions-and-parameters
  // Contexts are objects used to track and store conversation state
  let inputContexts = request.body.queryResult.contexts; // https://dialogflow.com/docs/contexts
  // Get the request source (Google Assistant, Slack, API, etc)
  let requestSource = (request.body.originalDetectIntentRequest) ? request.body.originalDetectIntentRequest.source : undefined;
  // Get the session ID to differentiate calls from different users
  let session = (request.body.session) ? request.body.session : undefined;
  // Create handlers for Dialogflow actions as well as a 'default' handler

 
  if (action ==='validateSSN'){
      console.log(' validateSSN Action performed');
      console.log('Parameters Recieved',parameters); 
      var participantSSN; 
	  var participantEmail;
      for(var key in parameters) {
          if(key==='ssnNumber'){
            participantSSN =parameters[key];
          }else if(key==='email'){
			 participantEmail= parameters[key];
		  }		  
      }
      console.log('SSN Got ',participantSSN);
	   console.log('Eamil  Got ',participantEmail);
	   if(participantSSN){
		   // If we only have SSN
      var participantStoreRef = firestore.collection('fidelity_participant');
       var qyeryRef=participantStoreRef.where('ssn','==',participantSSN).get()
      .then(snapshot => {
          console.log('Database hitted');
        if(snapshot.size===1){
			
            return sendResponse('Your SSN is verified , provid your new email Id ');
        }else{
           return  sendResponse('Your SSN is not found ');
        }
 return ;        
      })
      .catch(err => {
          console.log('Error getting documents', err);
          return sendResponse('System is currently facing difficulty to serve you , please try again after sometime');
      });
	   }
	   else if(!participantSSN ==='undefined' &&  !participantEmail=== 'undefined' ){
		   //Verify SSN and update the email id 
	   }
		   
 //   console.log(ssn);
  }

 
}
function sendResponse (responseToUser) {
    // if the response is a string send it as a response to the user
    if (typeof responseToUser === 'string') {
        let responseJson = {};
        responseJson.speech = responseToUser; // spoken response
        responseJson.displayText = responseToUser; // displayed response
        response.json(responseJson); // Send response to Dialogflow
    } else {
        // If the response to the user includes rich responses or contexts send them to Dialogflow
        let responseJson = {};

        // If speech or displayText is defined, use it to respond (if one isn't defined use the other's value)
        responseJson.speech = responseToUser.speech || responseToUser.displayText;
        responseJson.displayText = responseToUser.displayText || responseToUser.speech;

        // Optional: add rich messages for integrations (https://dialogflow.com/docs/rich-messages)
        responseJson.data = responseToUser.richResponses;

        // Optional: add contexts (https://dialogflow.com/docs/contexts)
        responseJson.contextOut = responseToUser.outputContexts;

        response.json(responseJson); // Send response to Dialogflow
    }
}
function sendEmailToParticipant(){
	const mailOptions = {
    from: '"Spammy Corp." <noreply@firebase.com>',
    to: val.email,
	
	mailOptions.subject = subscribed ? 'Thanks and Welcome!' : 'Sad to see you go :`(';
    mailOptions.text = subscribed ? 'Thanks you for subscribing to our newsletter. You will receive our next weekly newsletter.' : 'I hereby confirm that I will stop sending you the newsletter.';

   return mailTransport.sendMail(mailOptions)
    .then(() => console.log(`New ${subscribed ? '' : 'un'}subscription confirmation email sent to:`, val.email))
    .catch((error) => console.error('There was an error while sending the email:', error));
  };
}