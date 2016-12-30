var state = 0,
	ws,
	context,
	oscillator,
	gainer;

// Support both the WebSocket and MozWebSocket objects
if ((typeof(WebSocket) == 'undefined') &&
    (typeof(MozWebSocket) != 'undefined')) {
	WebSocket = MozWebSocket;
}

function normalizeGain(gainval) {
  if (gainval < 0){
    gainval = 0;
  }
  if (gainval > 1){
    gainval = 1;
  } 

  return gainval;
}

// Create the socket with event handlers
function init() {
	//Create and open the socket
	ws = new WebSocket("ws://localhost:6437/");

	// On successful connection
	ws.onopen = function(event) {
		console.log('Connected to WebSocket');
	};

	// On message received
	ws.onmessage = function(event) {
		var obj = JSON.parse(event.data);
		if(state > 0) {
			if(obj.pointables.length > 0) {
				var value = obj.pointables[0].tipPosition[0];
				var modified = 350 - value;
				if( modified <= 0 ) {
					modified = 5;
				}
				modified = modified.toFixed(2);

				var gainval = normalizeGain((obj.pointables[0].tipPosition[1] - 25) / 600);

				oscillator.frequency.value = modified;
				gainer.gain.value = gainval;
				$('#frequency').text(modified + ' Hz');
			}			
		}
	};

	// On socket close
	ws.onclose = function(event) {
		ws = null;
		console.log('Connection closed.');
	}

	//On socket error
	ws.onerror = function(event) {
		alert("Received error");
	};
}

$(function() {
  init();

  $('#play').on('click', function() {
    state = 1;
    context = new AudioContext(),
    oscillator = context.createOscillator();
    gainer = context.createGain();
    gainer.connect(context.destination);
    oscillator.connect(gainer);
    oscillator.frequency.value = 901;
    oscillator.start();

    $(this).addClass('active');
    $('#stop').removeClass('active');
    $('#frequency').text('900.00 Hz');
  });

  $('#stop').click(function() {
    oscillator.stop();
    state = 0;

    $(this).addClass('active');
    $('#play').add('button.wave').removeClass('active');
  });

  $('button.wave').on('click', function() {
    if(state > 0) {
      $('button.wave').removeClass('active');
      $(this).addClass('active');
      oscillator.type = $(this).val();
    }
  });

});
