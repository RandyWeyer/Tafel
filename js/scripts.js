var running = false;
var dragging = false;

//https://stackoverflow.com/questions/21864989/draw-lines-between-2-elements-in-html-page
var newCanvas;
var lineId = [];
var selectedObjects = [];
var uniqueId = 0;

const cardHtml = (
  '<div class="card">'+
  '<div class = "input-form">'+
  '<div class="form-group">'+
  '<label for="input-title">Title</label>'+
  '<input type="text" class="form-control" id="input-title">'+
  '</div>'+
  '<div class="form-group">'+
  '<label for="input-note">Note:</label>'+
  '<textarea type="text" lines="8" class="form-control" id="input-note"></textarea>'+
  '</div>'+
  '<button class="btn btn-primary save-card">Save</button>'+
  '</div>'+
  '<div class="card-body">'+
  '<h5 id="output-title">5</h5>'+
  '<p id="output-note">9</p>'+
  '<button class="btn btn-primary edit-card">Edit</button>'+
  '</div>'+
  '</div>'
)

$(function()
{
  //Start Drag
  $(".draggable").dblclick(function()
  {
    addId(this);
  });

  $("#add-card").click(function()
  {
    var element = $('<div id="'+uniqueId+'" class="draggable"></div>');
    uniqueId++;
    element.html(cardHtml);
    //append it to input-card
    $("#input-card").append(element);
    //make it "draggable"
    element.draggable({
      // event handlers
      start: noop,
      drag:  connect,
      stop:  noop
    }).dblclick(function(){addId(this);});

    //Add Click events to buttons save-card and edit-card in the card using DOM Traversal
    element.find(".save-card").click(function(){saveInfo(this);});
    element.find(".edit-card").click(function(){editInfo(this);});
  });
  newCanvas = new Canvas("canvas");
  connectObjects();

  $("#btn-color").click(function()
  {
    //getHexColor();
  });
});

function grid()
{
  var w = newCanvas.width;
  var h = newCanvas.height;
  var tempCtx = newCanvas.ctx;

  /**
  * i is used for both x and y to draw
  * a line every 5 pixels starting at
  * .5 to offset the canvas edges
  */
  for(var i = .5; i < w || i < h; i += 30) {
    // draw horizontal lines
    tempCtx.moveTo( i, 0 );
    tempCtx.lineTo( i, h);
    // draw vertical lines
    tempCtx.moveTo( 0, i );
    tempCtx.lineTo( w, i);
  }
  tempCtx.strokeStyle = 'hsla(0, 0%, 40%, .05)';
  tempCtx.stroke();
}

function clear() {
  newCanvas.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
  newCanvas.ctx.fillRect(0,0,canvas.width,canvas.height);
  grid();
}

function draw() {
  clear();
  window.requestAnimationFrame(draw);
}

function getHexColor(){
  return $("#color-selection").val();
}

function resizeCanvas()
{
  console.log("test one");
  newCanvas.setToWindow();
  connect();
  //draw();
}

function saveInfo(id)
{
  var parent = $(id).parent().parent();
  var title = parent.find("#input-title").val();
  var note = parent.find("#input-note").val();
  parent.find("#output-title").text(title);
  parent.find("#output-note").text(note);
  parent.find(".card-body").show();
  parent.find(".input-form").hide();
}

function editInfo(id)
{
  var parent = $(id).parent().parent();
  var title = parent.find("#output-title").text();
  var note = parent.find("#output-note").text();
  parent.find("#input-title").val(title);
  parent.find("#input-note").val(note);
  parent.find(".card-body").hide();
  parent.find(".input-form").show();
}

function connectObjects()
{
  connect();
  $(".draggable").draggable({
    // event handlers
    start: noop,
    drag:  connect,
    stop:  noop
  });
}

function noop(){}

function connect(){
  newCanvas.ctx.clearRect(0,0,newCanvas.canvas.width,newCanvas.canvas.height);
  //console.log(newCanvas.connectors[0]);
  //console.log(newCanvas.offset.top);
  var topOffset = newCanvas.offset.top;
  var leftOffset = newCanvas.offset.left;
  //newCanvas.ctx.translate(0,-60);
  for(var i=0;i<newCanvas.connectors.length;i++)
  {
    // this.connectors.push({from:id1,to:id2});
    var connection = newCanvas.connectors[i];

    var c={from:$(connection[0]),to:$(connection[1])};
    var eFrom=c.from;
    var eTo=c.to;
    var pos1=eFrom.offset();
    var pos2=eTo.offset();
    newCanvas.ctx.beginPath();
    //moveTo creates a point on cavas
    newCanvas.ctx.moveTo(pos1.left+16-leftOffset,pos1.top+16-topOffset);
    //creates a line to the new point
    newCanvas.ctx.lineTo(pos2.left+16-leftOffset,pos2.top+16-topOffset);
    //console.log(newCanvas.connectors[0])
    //creates the line
    newCanvas.ctx.stroke();
  }
  //console.log(newCanvas.connectors[0])
}

function addId(tempId)
{
  lineId.push(tempId);

  if($(tempId).hasClass("card-selected"))
  {
    $(tempId).removeClass("card-selected");
  }
  else
  {
    $(tempId).addClass("card-selected");
  }

  if(lineId.length > 1)
  {
    //console.log(lineId);
    var reverseArr = lineId.slice();
    reverseArr.reverse();
    if(newCanvas.indexOf(lineId)!=-1)
    {
      console.log("Test One");
      newCanvas.removeAt(newCanvas.indexOf(lineId));
    }
    else if(newCanvas.indexOf(reverseArr)!=-1)
    {
      console.log("Test Two");
      newCanvas.removeAt(newCanvas.indexOf(reverseArr));
    }
    else if(lineId[0]!=lineId[1])
    {
      console.log("Test Three");
      newCanvas.push(lineId[0],lineId[1]);

    }
    lineId.forEach(function(line){
      $(line).removeClass("card-selected");
    });

    lineId = [];
    connect();
  }
}

function Canvas(canvasID)
{
  this.canvas = document.getElementById("canvas");
  this.offset = $("#"+canvasID).offset();
  this.ctx = canvas.getContext("2d");
  this.setToWindow();
  this.ctx.lineWidth = 3;
  this.connectors = [];
}

Canvas.prototype.setWidth = function(input)
{
  this.canvas.width = input;
  this.width = input;
}

Canvas.prototype.setHeight = function(input)
{
  this.canvas.height = input;
  this.height = input;
}

Canvas.prototype.setToWindow = function()
{
  this.setWidth(window.innerWidth);
  this.setHeight(window.innerHeight);
}

Canvas.prototype.push = function(id1,id2)
{
  this.connectors.push([id1,id2]);
}

Canvas.prototype.indexOf = function(idArr)
{
  var counter = 0;
  var location = -1;

  this.connectors.forEach(function(connector){
    if(connector[0]===idArr[0]&&connector[1]===idArr[1])
    {
      location = counter;
    }
    counter++;
  });
  return (location);
}

Canvas.prototype.removeAt = function(location)
{
  if(this.connectors.length === 1)
  {
    this.connectors.pop();
  }
  else if (location === 0) {
    this.connectors.shift();
  }
  else
  {
    this.connectors.splice(location,location);
  }
}
