// PeerToPeer system for Less
var debug = true;

var myId, opponentId;
var peer, conn;
var connected = false;
var first = true;


window.onload = function () {

  var btn = document.querySelector('#connectBtn');
  var idElement = document.querySelector('#opponentId');
  //var messageElement = document.querySelector("#message");
  //var sendMsg = document.querySelector("#sendMsg");
  //var dataElement = document.querySelector("#data");


  peer = new Peer();

  // Display and save our ID
  peer.on('open', function(id) {
    myId = id;
    document.querySelector("#myId").innerHTML = myId;
  });



  // Connect button clicked
  btn.addEventListener('click', function(event) {
    // Connect to given ID
    connect(idElement.value);
  });


  // Someone connected to us
  peer.on('connection', function(conn) {

    // Connect back
    if (!connected) {
      first = false;
      connect(conn.peer);
    }
    if (debug) console.log(conn.peer + " connected");

    // Received a message
    conn.on('data', function(data) {
      parseMessage(data);
      if (debug) console.log("Received message:   " + data);
    });
  });
}


function parseMessage(data) {
  var json = JSON.parse(data);

  if (json.type == "move") {
    movePiece(Number(json.pieceId), Number(json.x), Number(json.y), true);
  } else if (json.type == "grids") {
    grids = json.grids;
  }
}


function connect(peerId) {
  conn = peer.connect(peerId);
  connected = true;
  showGameUi();

  // Connection opened
  conn.on('open', function() {
    // Send generated grids
    if (first) {
      var tmpGrids = generateGrids();
      sendGrids(tmpGrids);
      grids = tmpGrids;
    }

    // Start the game with whites
    start(first);
  });
}


function sendGrids(tmpGrids) {
  var message = {
    type: "grids",
    grids: tmpGrids
  }
  message = JSON.stringify(message);

  conn.send(message);
  if (debug) console.log("Sending grids...");
}


function sendMove(pieceId, x, y) {
  var message = {
    type: "move",
    pieceId: pieceId,
    x: x,
    y: y
  }
  message = JSON.stringify(message);

  conn.send(message);
  if (debug) console.log("Sending move: " + message);
}
