// CONSTANTS
const gridSize = 6;     // x by x, grid is always a square
const blockSize = 100;   // x by x, block is always a square
const initSteps = 3;

var grids = [], pieces;
var turn = true;  // True - white, false - black
var steps = initSteps;

// Network variables
var mySide;
var myTurn;




// ----- Game logic -----
function start(first) {
  mySide = (first) ? "white" : "black";
  myTurn = first;


  generatePieces();
  drawGridsHtml();
  draw();


  // onclick for grid
  $("#container").on("click", "canvas", function() {
    // On canvas click function
    var pieceClicked = false;
    var id = $(this).attr("id");
    var xy = id.split("x");

    pieces.forEach((piece) => {
      if (piece.x == Number(xy[0]) && piece.y == Number(xy[1])) {
        if (piece.side == mySide) {
          deselectPieces();
          piece.selected = true;
          draw();
          pieceClicked = true;
        }
      }
    });

    // A non-piece canvas was clicked
    if (!pieceClicked) {
      var selectedPiece = getSelectedPieceId();
      var valid = false;

      if ( (pieces[selectedPiece].side == "white" && turn) || (pieces[selectedPiece].side == "black" && !turn) ) {
        if (myTurn == turn) {
            valid = true;
        }
      }

      if (selectedPiece != false && valid) {
        movePiece(selectedPiece, Number(xy[0]), Number(xy[1]));
      }
    }
  });
}

function getId(x, y) {
  return x+'x'+y;
}


function getHtml(x, y) {
  return '<canvas id="'+x+'x'+y+'" width="'+blockSize+'" height="'+blockSize+'"></canvas>';
}


function movePiece(pieceId, x, y, receiving) {
  if (!checkCollision(x, y)) {

    if (!receiving) {
      sendMove(pieceId, x, y);
    }
    pieces[pieceId].x = x;
    pieces[pieceId].y = y;
    step();
    draw();
  }
}

function checkCollision(x, y) {
  pieces.forEach((piece) => {
    if (piece.x == x && piece.y == y) return true;
  });
  return false;
}


function step() {
  steps--;
  if (steps <= 0) {
    turn = !turn;
    steps = initSteps;
  }
  updateTurnAndSteps();
}


function getSelectedPieceId() {
  for (i = 0; i < pieces.length; i++) {
    if (pieces[i].selected) return i;
  }
  return false;
}


function deselectPieces() {
  pieces.forEach((piece) => {
    piece.selected = false;
  });
}



// ----- Rendering -----
function updateTurnAndSteps() {
  var turnStr = (turn) ? "White" : "Black";
  $("#turn").html("Turn: " + turnStr + "<br>Steps: " + steps);
}


function draw() {
  clear();
  drawGrids();
  drawPieces();
  updateTurnAndSteps();
}


function clear() {
  for (x = 0; x < grids.length; x++) {
    for (y = 0; y < grids[0].length; y++) {
      var id = getId(grids[x][y].x, grids[x][y].y);
      var canvas = document.getElementById(id);
      var ctx = canvas.getContext("2d");

      ctx.fillStyle = "gray";
      ctx.fillRect(0, 0, blockSize, blockSize);
    }
  }
}


function drawGrids() {
  // Draw canvas
  for (y = 0; y < gridSize; y++) {
    for (x = 0; x < gridSize; x++) {
      // Draw walls
      var wallThickness = 10;
      var canvas = document.getElementById(x+'x'+y);
      var ctx = canvas.getContext("2d");

      ctx.fillStyle = "blue";

      if (grids[x][y].walls.top) {
        ctx.fillRect(0, 0, blockSize, wallThickness);
      }
      if (grids[x][y].walls.bottom) {
        ctx.fillRect(0, blockSize-wallThickness, blockSize, wallThickness);
      }
      if (grids[x][y].walls.right) {
        ctx.fillRect(blockSize-wallThickness, 0, wallThickness, blockSize);
      }
      if (grids[x][y].walls.left) {
        ctx.fillRect(0, 0, wallThickness, blockSize);
      }
    }
  }
}


function drawPieces() {
  var radius = blockSize / 3;
  var id, canvas, ctx, centerX, centerY;

  for (i = 0; i < pieces.length; i++) {
    var tmp = grids[pieces[i].x][pieces[i].y];
    id = getId(tmp.x, tmp.y);
    canvas = document.getElementById(id);
    ctx = canvas.getContext("2d");

    ctx.fillStyle = (pieces[i].side == "white") ? "white" : "black";
    ctx.beginPath();
    centerX = pieces[i].x+(blockSize/2);
    centerY = pieces[i].y+(blockSize/2);
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
    ctx.fill();

    if (pieces[i].selected) {
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'red';
      ctx.stroke();
    }
  }
}


function drawGridsHtml() {
  // Generate html
  for (x = 0; x < grids.length; x++) {
    for (y = 0; y < grids[0].length; y++) {
      $("#container").append(getHtml(grids[x][y].x, grids[x][y].y));
    }
    $("#container").append("<br>");
  }
}



// ----- Generating -----
function generateGrids() {
  var tmpGrids = [];

  for (x = 0; x < gridSize; x++) {
    tmpGrids[x] = [];
    for (y = 0; y < gridSize; y++) {
      // Random wall generation
      var arr = [];
      var chance = 90;  // Percentage 0-100
      var count = 2;
      for (i = 0; i < 4; i++) {
        if (Math.floor(Math.random() * 100) > chance && count > 0) {
          arr.push(true);
          count--;
        }
        else arr.push(false);
      }

      tmpGrids[x][y] =
      {
          x: x,
          y: y,

          walls: {
            top: arr[0],
            right: arr[1],
            bottom: arr[2],
            left: arr[3]
          }
      };
    }
  }
  return tmpGrids;
}


function generatePieces() {
  pieces = [
    {x: 0, y: 0, selected: false, side: "white"},
    {x: 0, y: 1, selected: false, side: "white"},
    {x: 1, y: 0, selected: false, side: "white"},
    {x: 1, y: 1, selected: false, side: "white"},
    {x: gridSize-2, y: gridSize-2, selected: false, side: "black"},
    {x: gridSize-2, y: gridSize-1, selected: false, side: "black"},
    {x: gridSize-1, y: gridSize-2, selected: false, side: "black"},
    {x: gridSize-1, y: gridSize-1, selected: false, side: "black"}
  ];
}
