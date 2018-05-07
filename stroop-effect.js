//Speech recognition variables
var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition
var SpeechGrammarList = SpeechGrammarList || webkitSpeechGrammarList
var SpeechRecognitionEvent = SpeechRecognitionEvent || webkitSpeechRecognitionEvent

//Colors & grammar (Grammars appear to specify likely results for better accuracy)
var colors = ["red", "Orange", "yellow", "green", "blue", "purple", "black", "Brown", "Gray", "pink"];
var num_colors = colors.length;
var grammar = "#JSGF V1.0; grammar colors; public <color> = " + colors.join(" | ") + " ;"

//Add grammars to speech recognition, and specify other stuff
var recognition = new SpeechRecognition();
var speechRecognitionList = new SpeechGrammarList();
speechRecognitionList.addFromString(grammar, 1);
recognition.grammars = speechRecognitionList;
recognition.lang = 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

var test_sets = [
	{description: "Color-word match", match_color: true, last_color: "", start_time: 0, end_time: 0, total_time: 0, num_correct: 0},
	{description: "Color-word mismatch", match_color: false, last_color: "", start_time: 0, end_time: 0, total_time: 0, num_correct: 0}
];

var test_word = document.querySelector("#test-word");
var cases_per_set = 20;
var curr_set = 0;
var curr_case = 0;


document.body.onclick = function() {
	recognition.start();
	test_sets[0].start_time = Date.now();
	console.log('Ready to receive a color command.');
	
	//Pick first word/color
	var random_index = Math.floor(Math.random() * num_colors);
	var random_color = colors[random_index];
	test_word.style.color = random_color;
	test_word.innerHTML = random_color.toUpperCase();
	test_sets[0].last_color = random_color;
}



recognition.onresult = function(event) {
	var last = event.results.length - 1;
	var color_spoken = event.results[last][0].transcript;
	console.log(color_spoken);
	recognition.stop();
	
	if (color_spoken.includes(test_sets[curr_set].last_color))
		test_sets[curr_set].num_correct++;
	
	if (curr_case >= cases_per_set-1) {
		test_sets[curr_set].end_time = Date.now();
		if (++curr_set < test_sets.length) {
			test_sets[curr_set].start_time = Date.now();
			$("#test-set-num").text(curr_set + 1);
			curr_case=0;
		}
		else {
			var results = $("#results");
			$(test_sets).each(function() {
				this.total_time = this.end_time - this.start_time;
				results.append(this.description + ": " + (this.total_time/1000) + "<br>");
				results.append(this.description + ": " + (this.num_correct) + "<br>");
				return;
			});
		}
	} else
		curr_case++;
	$("#test-case-num").text(curr_case + 1);
	
	//Pick next word/color
	var random_index = Math.floor(Math.random() * num_colors);
	while (colors[random_index] == test_sets[curr_set].last_color)
		random_index = Math.floor(Math.random() * num_colors);
	var random_color = colors[random_index];
	test_word.innerHTML = random_color.toUpperCase();
	
	if (!test_sets[curr_set].match_color) {
		while (colors[random_index] == random_color)
			random_index = Math.floor(Math.random() * num_colors);
		random_color = colors[random_index];
	}
	
	test_word.style.color = random_color;
	test_sets[curr_set].last_color = random_color;
}

recognition.onend = function() {
	recognition.start();
}

recognition.onerror = function(event) {
	console.log('Error occurred in recognition: ' + event.error);
}