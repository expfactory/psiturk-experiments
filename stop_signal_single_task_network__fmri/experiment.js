/* ************************************ */
/*       Define Helper Functions        */
/* ************************************ */

//Functions added for in-person sessions
function genITIs() { 
	mean_iti = 0.5 //mean and standard deviation of 0.5 secs
	min_thresh = 0
	max_thresh = 4

	lambda = 1/mean_iti
	iti_array = []
	for (i=0; i < exp_len; i++) {
		curr_iti = - Math.log(Math.random()) / lambda;
		while (curr_iti > max_thresh || curr_iti < min_thresh) {
			curr_iti = - Math.log(Math.random()) / lambda;
		}
		iti_array.push(curr_iti*1000) //convert ITIs from seconds to milliseconds

	}
	return(iti_array)
}

function getITI_stim() { //added for fMRI compatibility
	var currITI = ITIs_stim.shift()
	return currITI
}

function getITI_resp() { //added for fMRI compatibility
	var currITI = ITIs_resp.shift()
	return currITI
}

//feedback functions added for in-person version
var getRefreshFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + refresh_feedback_text + '</font></p></div></div>'
}

var getRefreshTrialID = function() {
	return refresh_trial_id
}

var getRefreshFeedbackTiming = function() {
	return refresh_feedback_timing
}

var getRefreshResponseEnds = function() {
	return refresh_response_ends
}
//



function getDisplayElement() {
    $('<div class = display_stage_background></div>').appendTo('body')
    return $('<div class = display_stage></div>').appendTo('body')
}

function addID() {
  jsPsych.data.addDataToLastTrial({exp_id: 'stop_signal_single_task_network__fmri'})
}

function assessPerformance() {
	var experiment_data = jsPsych.data.getTrialsOfType('stop-signal')
	var missed_count = 0
	var trial_count = 0
	var rt_array = []
	var rt = 0
	var correct = 0
	var all_trials = 0
	
	console.log(experiment_data.length)
	
	//record choices participants made
	var choice_counts = {}
	choice_counts[-1] = 0
	choice_counts[77] = 0
	choice_counts[90] = 0
	
	for (var i = 0; i < experiment_data.length; i++) {
		if (experiment_data[i].trial_id == 'test_trial') {
			all_trials += 1
			key = experiment_data[i].key_press
			choice_counts[key] += 1
			if (experiment_data[i].stop_signal_condition == 'go'){
				trial_count += 1
			}
			
			if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
				if (experiment_data[i].key_press == experiment_data[i].correct_response){
					correct += 1
				}
			} else if ((experiment_data[i].stop_signal_condition == 'stop') && (experiment_data[i].rt != -1)){
				rt = experiment_data[i].rt
				rt_array.push(rt)
			} else if ((experiment_data[i].stop_signal_condition == 'go') && (experiment_data[i].rt == -1)){
				missed_count += 1
			}
		}
	}

	
	//calculate average rt
	var avg_rt = -1
	if (rt_array.length !== 0) {
		avg_rt = math.median(rt_array)
	} 
	//calculate whether response distribution is okay
	var responses_ok = true
	Object.keys(choice_counts).forEach(function(key, index) {
		if (choice_counts[key] > all_trials * 0.85) {
			responses_ok = false
		}
	})
	var missed_percent = missed_count/trial_count
	var accuracy = correct / trial_count
	credit_var = (missed_percent < 0.25 && avg_rt > 200 && responses_ok && accuracy > 0.60)
	jsPsych.data.addDataToLastTrial({final_credit_var: credit_var,
									 final_missed_percent: missed_percent,
									 final_avg_rt: avg_rt,
									 final_responses_ok: responses_ok,
									 final_accuracy: accuracy})
}


var getFeedback = function() {
	return '<div class = bigbox><div class = picture_box><p class = block-text><font color="white">' + feedback_text + '</font></p></div></div>'
}


var getCategorizeFeedback = function(){
	curr_trial = jsPsych.progress().current_trial_global - 1
	trial_id = jsPsych.data.getDataByTrialIndex(curr_trial).trial_id
	if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'go')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text_list
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1)){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Incorrect</font></div></div>' + prompt_text_list
	
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1){
			
			
			return '<div class = fb_box><div class = center-text><font size = 20>Respond Faster!</font></div></div>' + prompt_text_list
	
		}
	} else if ((trial_id == 'practice_trial') && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop')){
		if (jsPsych.data.getDataByTrialIndex(curr_trial).rt == -1){
			return '<div class = fb_box><div class = center-text><font size = 20>Correct!</font></div></div>' + prompt_text_list
		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).rt != -1){
			return '<div class = fb_box><div class = center-text><font size = 20>There was a star.</font></div></div>' + prompt_text_list
		}
	
	}
}

var createTrialTypes = function(numTrialsPerBlock){
	var unique_combos = stop_signal_conditions.length*totalShapesUsed
	
	var stims = []
	for (var x = 0; x < stop_signal_conditions.length; x++){
		for (var j = 0; j < totalShapesUsed; j++){
			stim = {
				stim: shapes[j],
				correct_response: possible_responses[j][1],
				stop_signal_condition: stop_signal_conditions[x]
			}
			stims.push(stim)
		}	
	}
		
	var iteration = numTrialsPerBlock/unique_combos
	
	stims = jsPsych.randomization.repeat(stims,iteration)
	return stims
}

//Creates a sufficient refresh block
var createRefreshTrials = function(numRefreshIterations){

	
	var stims = []
	for (var x = 0; x < stop_signal_conditions.length; x++){
		for (var j = 0; j < 2; j++){ //only grab 1 circle and 1 square per condition, not 2.
			stim = {
				stim: shapes[j+1],
				correct_response: possible_responses[j+1][1],
				stop_signal_condition: stop_signal_conditions[x]
			}
			stims.push(stim)
		}	
	}
	
	stims = jsPsych.randomization.repeat(stims,numRefreshIterations)
		while (stims[0].stop_signal_condition == 'stop') { //if first trial is a stop trial, reorder trials.
			stims = jsPsych.randomization.repeat(stims,numRefreshIterations)
		}
	return stims
}




var getStopStim = function(){
	return preFileType  + 'stopSignal' + fileTypePNG
}

var getStim = function(){

	if(exp_phase == "practice1"){
		stim = stims.pop()
		shape = stim.stim
		correct_response = stim.correct_response
		stop_signal_condition = "practice_no_stop"
		
	} else if ((exp_phase == "test") || (exp_phase == "practice2")){
		stim = stims.pop()
		shape = stim.stim
		stop_signal_condition = stim.stop_signal_condition
		correct_response = stim.correct_response
		

		
		if(stop_signal_condition == "stop"){
			correct_response = -1
		} 
	}
	
	stim = {
		image: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>' + preFileType  + shape + fileTypePNG + '</div>',
		data: { 
			stim: shape,
			stop_signal_condition: stop_signal_condition,
			correct_response: correct_response
			}
	}
	stimData = stim.data
	return stim.image
}

var getRefreshStim = function(){

	stim = refreshStims.pop()
	shape = stim.stim
	stop_signal_condition = stim.stop_signal_condition
	correct_response = stim.correct_response
	
	if(stop_signal_condition == "stop"){
		correct_response = -1
	} 
	
	stim = {
		image: '<div class = bigbox><div class = centerbox><div class = gng_number><div class = cue-text>' + preFileType  + shape + fileTypePNG + '</div>',
		data: { 
			stim: shape,
			stop_signal_condition: stop_signal_condition,
			correct_response: correct_response
			}
	}
	stimData = stim.data
	return stim.image
}


function getSSD(){
	return SSD
}

function getSSType(){
	return stop_signal_condition
}




var appendData = function(){
	curr_trial = jsPsych.progress().current_trial_global
	current_trial+=1

	if (exp_phase == "practice1"){
		currBlock = practiceCount
	} else if (exp_phase == "practice2"){
		currBlock = practiceStopCount
	} else if (exp_phase == "test"){
		currBlock = testCount
	}
	
	if ((exp_phase == "practice1") || (exp_phase == "practice2") || (exp_phase == "test")){
		jsPsych.data.addDataToLastTrial({
			stim: stimData.stim,
			correct_response: correct_response,	
			current_block: currBlock,
			current_trial: current_trial,
			stop_signal_condition: stimData.stop_signal_condition
		})
		
		if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press == correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 1,
			})

		} else if (jsPsych.data.getDataByTrialIndex(curr_trial).key_press != correct_response){
			jsPsych.data.addDataToLastTrial({
				correct_trial: 0,
			})
		}
	}
	
	
	if ((exp_phase == "test") || (exp_phase == "practice2")){	
		
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD < maxSSD)){
			jsPsych.data.addDataToLastTrial({stop_acc: 1})
			SSD+=50
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != -1) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'stop') && (SSD > minSSD)){
			jsPsych.data.addDataToLastTrial({stop_acc: 0})
			SSD-=50
		}
		
	
		if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press == jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 1})
		} else if ((jsPsych.data.getDataByTrialIndex(curr_trial).key_press != jsPsych.data.getDataByTrialIndex(curr_trial).correct_response) && (jsPsych.data.getDataByTrialIndex(curr_trial).stop_signal_condition == 'go')){
			jsPsych.data.addDataToLastTrial({go_acc: 0})
		}
		
	}
	
}

/* ************************************ */
/*    Define Experimental Variables     */
/* ************************************ */


// generic task variables
var sumInstructTime = 0 //ms
var instructTimeThresh = 0 ///in seconds
var credit_var = 0
var run_attention_checks = true


var practice_len = 24 // 24 must be divisible by 12
var exp_len = 216 //192 //=~8:40 //240 = ~10:50 //144 = original ~6:50 // must be divisible by 12 --- if 216, could do 72 numTrialsPerBlock
var numTrialsPerBlock = 72 //48 // must be divisible by 12 
var numTestBlocks = exp_len / numTrialsPerBlock
var practice_thresh = 3 // 3 blocks of 12 trials

var accuracy_thresh = 0.80
var missed_thresh = 0.10
var SSD = 350
var maxSSD = 1000
var minSSD = 0 
var current_trial = 0


var rt_thresh = 1000;
var missed_response_thresh = 0.10;
var accuracy_thresh = 0.75;

var maxStopCorrect = 0.70
var minStopCorrect = 0.30

var maxStopCorrectPractice = 1
var minStopCorrectPractice = 0


var stop_signal_conditions = ['go','go','stop']
var shapes = ['circle','circle','square','square']
//'hourglass', 'Lshape', 'moon', 'oval', 'rectangle', 'rhombus', 'tear', 'trapezoid'
var color = "black"
var totalShapesUsed = 4


var possible_responses = [['index finger', 89], ['index finger', 89], ['middle finger', 71], ['middle finger', 71]] //fmri responses - keys: BYGRM = thumb->pinky


var postFileType = "'></img>"
var pathSource = "/static/experiments/stop_signal_single_task_network__fmri/images/"
var fileType = ".png"
var preFileType = "<img class = center src='"

var fileTypePNG = ".png'></img>"
var preFileType = "<img class = center src='/static/experiments/stop_signal_single_task_network__fmri/images/"


var images = []
for(i=0;i<shapes.length;i++){
	images.push(pathSource + shapes[i] + '.png')
}
jsPsych.pluginAPI.preloadImages(images);



var prompt_text_list = '<ul style="text-align:left;">'+
						'<li>' + shapes[0] + ': ' + possible_responses[0][0] + '</li>' +
						'<li>' + shapes[2] + ': ' + possible_responses[2][0] + '</li>' +
						'<li>Do not respond if a star appears!</li>' +
					  '</ul>'

var prompt_text = '<div class = prompt_box>'+
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">' + shapes[0] + ': ' + possible_responses[0][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">' + shapes[2] + ': ' + possible_responses[2][0] + '</p>' +
					  '<p class = center-block-text style = "font-size:16px; line-height:80%%;">Do not respond if a star appears!</p>' +
				  '</div>'
	  


var stims = createTrialTypes(numTrialsPerBlock)



var exp_phase = "practice2"
var exp_phase = "test"

//ADDED FOR SCANNING
//fmri variables
var ITIs_stim = []
var ITIs_resp = []
var numRefreshIterations = 1 //run through the whole space of trial types 1 time
var refreshStims = createRefreshTrials(numRefreshIterations)

//refresh feedback variables
var refresh_feedback_text = '<div class = instructbox>'+ //'<div class = centerbox>'+
'<p class = instruct-text>In this task, you will see shapes appear on the screen one at a time. </p>' +
'<p class = instruct-text>Only one response is correct for each shape.</p>'+
'<p class = instruct-text>If the shape is a '+shapes[0]+', press your '+possible_responses[0][0]+'.</p>'+
'<p class = instruct-text>If the shape is a '+shapes[2]+', press your '+possible_responses[2][0]+'.</p>'+
//'<p class = block-text>You should respond as quickly and accurately as possible to each shape.</p>'+
'<p class = instruct-text>On some trials, a star will appear around the shape.  The star will appear with, or shortly after the shape appears.</p>'+
'<p class = instruct-text><b>If you see a star appear, please try your best to withhold your response on that trial.</b></p>'+
'<p class = instruct-text>If the star appears on a trial, and you try your best to withhold your response, you will find that you will be able to stop sometimes but not always.</p>'+
'<p class = instruct-text>Please do not slow down your responses in order to wait for the star.  You should respond as quickly and accurately as possible to each shape.</p>'+
'<p class = instruct-text>During practice, you will see a reminder of the rules.  <i> This will be removed for the test</i>. </p>'+ 
'<p class = instruct-text>To let the experimenters know when you are ready to begin, please press any button. </p>'+
'</div>'
var refresh_trial_id = "instructions"
var refresh_feedback_timing = -1
var refresh_response_ends = true

//variables for tracking number of blocks completed
var practiceCount=0
var practiceStopCount=0

/* ************************************ */
/*        Set up jsPsych blocks         */
/* ************************************ */
var end_block = {
	type: 'poldrack-text',
	data: {
		exp_id: "stop_signal_single_task_network__fmri",
		trial_id: "end"
	},
	timing_response: 10000,
	text: '<div class = centerbox>'+
	'<p class = center-block-text>Thanks for completing this task!</p>'+
	'</div>',
	cont_key: [32],
	timing_post_trial: 0,
	on_finish: function(){
  	assessPerformance()
  }
};



var refresh_feedback_block = {
	type: 'poldrack-single-stim',
	stimulus: getRefreshFeedback,
	data: {
		trial_id: getRefreshTrialID
	},
	choices: [32],

	timing_post_trial: 0,
	is_html: true,
	timing_response: getRefreshFeedbackTiming, //10 seconds for feedback
	timing_stim: getRefreshFeedbackTiming,
	response_ends_trial: getRefreshResponseEnds,
	on_finish: function() {
		refresh_trial_id = "practice-no-stop-feedback"
		refresh_feedback_timing = 10000
		refresh_response_ends = false

	} 

};




var ITI_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "fixation",
	},
	timing_post_trial: 0,
	timing_stim: getITI_stim, //500
	timing_response: getITI_resp //500
};

var refresh_fixation_block = {
	type: 'poldrack-single-stim',
	stimulus: '<div class = centerbox><div class = fixation>+</div></div>',
	is_html: true,
	choices: 'none',
	data: {
		trial_id: "prompt_fixation",
	},
	timing_post_trial: 0,
	timing_stim: 500, //500
	timing_response: 500, //500
	prompt: prompt_text_list
};


var feedback_text = 'The test will begin shortly.'// Press <i>any button</i> to begin.'
var test_feedback_block = {
	type: 'poldrack-single-stim',
	data: {
		trial_id: "practice-no-stop-feedback"
	},
	choices: 'none',
	stimulus: getFeedback,
	timing_post_trial: 0,
	is_html: true,
	timing_response: 10000, //10 seconds
	response_ends_trial: false, 

};
/********************************************/
/*				Set up nodes				*/
/********************************************/

var SSD_setup_block = {
	type: 'survey-text',
	data: {
		trial_id: "SSD_setup"
	},
	questions: [
		[
			"<p class = center-block-text>SSD:</p>"
		]
	], on_finish: function(data) {
		SSD = parseInt(data.responses.slice(7, 10))
		SSD = math.max(100,math.min(400,SSD))
		ITIs_stim = genITIs()
		ITIs_resp = ITIs_stim.slice(0) //make a copy of ITIs so that timing_stimulus & timing_response are the same
	}
}


numRefreshTrials = stop_signal_conditions.length*2*numRefreshIterations//stop_signal_conditions.length*totalShapesUsed * numRefreshIterations
var refreshTrials = []
refreshTrials.push(refresh_feedback_block)
for (i = 0; i < numRefreshTrials; i++) {

	var refresh_block = {
		type: 'stop-signal',
		stimulus: getRefreshStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			trial_id: "practice_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1], possible_responses[2][1]],
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		prompt: prompt_text_list,
		fixation_default: true,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	var categorize_block = {
		type: 'poldrack-single-stim',
		data: {
			trial_id: "practice-stop-feedback"
		},
		choices: 'none',
		stimulus: getCategorizeFeedback,
		timing_post_trial: 0,
		is_html: true,
		timing_stim: 500, //500
		timing_response: 500, //500
		response_ends_trial: false, 

	};

	refreshTrials.push(refresh_fixation_block)
	refreshTrials.push(refresh_block)
	refreshTrials.push(categorize_block)
}

var refreshNode = {
	timeline: refreshTrials,
	loop_function: function(data) {
		current_trial = 0
		stims = createTrialTypes(numTrialsPerBlock)
		
		var total_trials = 0
		
		var sum_stop_rt = 0;
		var sum_go_rt = 0;
		
		var sumGo_correct = 0;
		var sumStop_correct = 0;
		
		var num_go_responses = 0;
		var num_stop_responses = 0;
		
		var go_length = 0;
		var stop_length = 0
		
		for (i = 0; i < data.length; i++) {
			if (data[i].trial_id == "practice_trial"){
				total_trials += 1
			}
			
			if (data[i].stop_signal_condition == "go"){
				go_length += 1
				if (data[i].rt != -1) {
					num_go_responses += 1
					sum_go_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}				
			} else if (data[i].stop_signal_condition == "stop") {
				stop_length += 1
				if (data[i].rt != -1){
					num_stop_responses += 1
					sum_stop_rt += data[i].rt
				} else if (data[i].rt == -1){
					sumStop_correct += 1
				}				
			} 
		}
		
		var average_rt = sum_go_rt / num_go_responses;
		var missed_responses = (go_length - num_go_responses) / go_length
		
		var aveShapeRespondCorrect = sumGo_correct / go_length 
		
		var stop_signal_respond = num_stop_responses / stop_length
		
		
		

		refresh_feedback_text = "<br><p class = instruct-text>Please take this time to read your feedback and to take a short break." //Press any button to continue."

		
		if ((aveShapeRespondCorrect > accuracy_thresh) && (stop_signal_respond < maxStopCorrectPractice) && (stop_signal_respond > minStopCorrectPractice)){
			refresh_feedback_text += '</p><p class = instruct-text>Done with this practice. The test session will begin shortly.'
			exp_phase = "test"
			return false;
		
		} else {
			if (aveShapeRespondCorrect < accuracy_thresh) {
				refresh_feedback_text +=
				'</p><p class = instruct-text>Remember:<br>' +
				prompt_text_list
			}
			if (average_rt > rt_thresh) {
				refresh_feedback_text +=
				'</p><p class = instruct-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
			}
			if (missed_responses > missed_response_thresh){
				if(aveShapeRespondCorrect < accuracy_thresh){
					refresh_feedback_text +=
					'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.'
						
			
				} else {
					refresh_feedback_text +=
					'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.<br>' +
					prompt_text_list
				}
			}
			
			
			if (stop_signal_respond === maxStopCorrectPractice){
				refresh_feedback_text +=
				'</p><p class = instruct-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
			}
		
			if (stop_signal_respond === minStopCorrectPractice){
				refresh_feedback_text +=
				'</p><p class = instruct-text>You have been responding too slowly.  Please respond as quickly and accurately to each stimulus that requires a response.'
		
			}
			
			refresh_feedback_text += '</p><p class = instruct-text>Done with this practice. The test session will begin shortly.'
			exp_phase = "test"
			return false	
			
		}
	}
}

var testTrials0 = []
// testTrials.push(test_feedback_block)
for (i = 0; i < numTrialsPerBlock; i++) {

	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			trial_id: "test_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1], possible_responses[2][1]],
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		fixation_default: true,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	testTrials0.push(ITI_fixation_block)
	testTrials0.push(test_block)
}

var testTrials = []
testTrials.push(test_feedback_block)
for (i = 0; i < numTrialsPerBlock; i++) {

	var test_block = {
		type: 'stop-signal',
		stimulus: getStim,
		SS_stimulus: getStopStim,
		SS_trial_type: getSSType,
		data: {
			trial_id: "test_trial"
		},
		is_html: true,
		choices: [possible_responses[0][1], possible_responses[2][1]],
		timing_stim: 1000, //1000
		timing_response: 2000, //2000
		response_ends_trial: false,
		SSD: getSSD,
		timing_SS: 500, //500
		timing_post_trial: 0,
		on_finish: appendData,
		fixation_default: true,
		on_start: function(){
			stoppingTracker = []
			stoppingTimeTracker = []
		}
	}
	testTrials.push(ITI_fixation_block)
	testTrials.push(test_block)
}

var testCount = 0
var testNode0 = {
	timeline: testTrials0, 
	loop_function: function(data) {
		current_trial = 0
		testCount += 1
		stims = createTrialTypes(numTrialsPerBlock)
		
		var total_trials = 0
		
		var sum_stop_rt = 0;
		var sum_go_rt = 0;
		
		var sumGo_correct = 0;
		var sumStop_correct = 0;
		
		var num_go_responses = 0;
		var num_stop_responses = 0;
		
		var go_length = 0;
		var stop_length = 0
		
		for (i = 0; i < data.length; i++) {
			if (data[i].trial_id == "test_trial"){
				total_trials += 1
			}
			
			if (data[i].stop_signal_condition == "go"){
				go_length += 1
				if (data[i].rt != -1) {
					num_go_responses += 1
					sum_go_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}				
			} else if (data[i].stop_signal_condition == "stop") {
				stop_length += 1
				if (data[i].rt != -1){
					num_stop_responses += 1
					sum_stop_rt += data[i].rt
				} else if (data[i].rt == -1){
					sumStop_correct += 1
				}				
			}
		}
		
		var average_rt = sum_go_rt / num_go_responses;
		var missed_responses = (go_length - num_go_responses) / go_length
		
		var aveShapeRespondCorrect = sumGo_correct / go_length 
		
		var stop_signal_respond = num_stop_responses / stop_length
		

		feedback_text = "<br><p class = instruct-text>Please take this time to read your feedback and to take a short break."
		feedback_text += "</p><p class = instruct-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
			
		if (aveShapeRespondCorrect < accuracy_thresh) {
			feedback_text +=
				'</p><p class = instruct-text>Your accuracy is too low. Remember:<br>' +
				prompt_text_list
		}
		if (average_rt > rt_thresh) {
			feedback_text +=
			'</p><p class = instruct-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
		}
		if (missed_responses > missed_response_thresh){
			if(aveShapeRespondCorrect < accuracy_thresh){
				feedback_text +=
				'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.'
					
				
			} else {
				feedback_text +=
				'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.<br>' +
				prompt_text_list
			}
		}
			
		if (stop_signal_respond > maxStopCorrect){
			feedback_text +=
			'</p><p class = instruct-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
		}
		
		if (stop_signal_respond < minStopCorrect){
			feedback_text +=
			'</p><p class = instruct-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.'
		
		}
			
			
			
		return false;
		
	}
}


var testNode = {
	timeline: testTrials, //[test_feedback_node, testTrials],
	loop_function: function(data) {
		current_trial = 0
		testCount += 1
		stims = createTrialTypes(numTrialsPerBlock)
		
		var total_trials = 0
		
		var sum_stop_rt = 0;
		var sum_go_rt = 0;
		
		var sumGo_correct = 0;
		var sumStop_correct = 0;
		
		var num_go_responses = 0;
		var num_stop_responses = 0;
		
		var go_length = 0;
		var stop_length = 0
		
		for (i = 0; i < data.length; i++) {
			if (data[i].trial_id == "test_trial"){
				total_trials += 1
			}
			
			if (data[i].stop_signal_condition == "go"){
				go_length += 1
				if (data[i].rt != -1) {
					num_go_responses += 1
					sum_go_rt += data[i].rt;
					if (data[i].key_press == data[i].correct_response) {
						sumGo_correct += 1
					}
				}				
			} else if (data[i].stop_signal_condition == "stop") {
				stop_length += 1
				if (data[i].rt != -1){
					num_stop_responses += 1
					sum_stop_rt += data[i].rt
				} else if (data[i].rt == -1){
					sumStop_correct += 1
				}				
			}
		}
		
		var average_rt = sum_go_rt / num_go_responses;
		var missed_responses = (go_length - num_go_responses) / go_length
		
		var aveShapeRespondCorrect = sumGo_correct / go_length 
		
		var stop_signal_respond = num_stop_responses / stop_length
		

		feedback_text = "<br><p class = instruct-text>Please take this time to read your feedback and to take a short break."
		feedback_text += "</p><p class = instruct-text>You have completed: "+testCount+" out of "+numTestBlocks+" blocks of trials."
		
		if (testCount == numTestBlocks) {
			feedback_text += '</p><p class = instruct-text>Done with this test.' //If you have been completing tasks continuously for an hour or more, please take a 15-minute break before starting again.'
			
			return false;
		} else {
			
			if (aveShapeRespondCorrect < accuracy_thresh) {
				feedback_text +=
					'</p><p class = instruct-text>Your accuracy is too low. Remember:<br>' +
					prompt_text_list
			}
			if (average_rt > rt_thresh) {
				feedback_text +=
				'</p><p class = instruct-text>You have been responding too slowly, please respond to each shape as quickly and as accurately as possible.'
			}
			if (missed_responses > missed_response_thresh){
				if(aveShapeRespondCorrect < accuracy_thresh){
					feedback_text +=
					'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.'
							
				
				} else {
					feedback_text +=
					'</p><p class = instruct-text>We have detected a number of trials that <i>required a response</i>, where no response was made.  Please <i>ensure that you are responding accurately and quickly  </i>to the shapes.<br>' +
					prompt_text_list
				}
			}
			
			if (stop_signal_respond > maxStopCorrect){
				feedback_text +=
				'</p><p class = instruct-text>You have not been stopping your response when stars are present.  Please try your best to stop your response if you see a star.'
			}
		
			if (stop_signal_respond < minStopCorrect){
				feedback_text +=
				'</p><p class = instruct-text>Do not slow down and wait for the star to appear. Please respond as quickly and accurately as possible when a star does not appear.'
		
			}		
			
			return true;
		}
	}
}


/* ************************************ */
/*          Set up Experiment           */
/* ************************************ */

var stop_signal_single_task_network__fmri_experiment = []

stop_signal_single_task_network__fmri_experiment.push(SSD_setup_block) //exp_input

test_keys(stop_signal_single_task_network__fmri_experiment, [possible_responses[0][1], possible_responses[2][1]])
//out of scanner practice
// stop_signal_single_task_network__fmri_experiment.push(practiceStopNode)
// stop_signal_single_task_network__fmri_experiment.push(practice_feedback_block);

//in scanner practice
stop_signal_single_task_network__fmri_experiment.push(refreshNode);
stop_signal_single_task_network__fmri_experiment.push(refresh_feedback_block);

//in scanner test
cni_bore_setup(stop_signal_single_task_network__fmri_experiment)
stop_signal_single_task_network__fmri_experiment.push(testNode0);
stop_signal_single_task_network__fmri_experiment.push(testNode);
stop_signal_single_task_network__fmri_experiment.push(test_feedback_block);

stop_signal_single_task_network__fmri_experiment.push(end_block);





