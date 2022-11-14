var a = [];
let size = 10;
let minlargest;
let cellw;
let temp;
let beta = 0.2;
let j = -1;
let spinmap;
let stepnum = 1;
var pause = 0;
var start;

function setup() {
  W = window.innerWidth;
	H = window.innerHeight;
  canvas = createCanvas(W, H);
  minlargest = Math.min(W,H);
  cellw = minlargest/(size+1);
  start = millis();
  initArray();
  monteCarloStepv1();
  monteCarloGraphic();
}

function draw(){
  if (!pause && ((millis()-start)/300)>stepnum){
    if (stepnum%3==0) monteCarloStepv1();
    else if (stepnum%3==1) monteCarloStepv2();
    else if (stepnum%3==2) monteCarloStepv3();
    monteCarloGraphic();
    stepnum+=1;
  }
}

function monteCarloStepv1(){
  print(1)
  for (var b of a) {
    for (var c of b){
      c.group = 0;
      c.visited = false;
      c.connections = {down:false,right:false};
    }
  }
  findConnections();
}

function monteCarloStepv2(){
  print(2)
  deleteSomeBonds();
  let maxgroupid = findIslands();
  spinmap = Array.from(
    {length: maxgroupid},
    () => round(Math.random())
  );
}

function monteCarloStepv3(){
  print(3)
  reassignSpinGroups(spinmap);
  // getChi();
}

function monteCarloStep(){
  monteCarloStepv1();
  monteCarloStepv2();
  monteCarloStepv3();
}

function monteCarloGraphic(){
  background(167,167,183);
  drawLines();
  drawGrid();
}

class Spin {
  constructor(pixcoord,val,connections,group){
    this.pixcoord = pixcoord;
    this.val = val;
    this.connections = connections;
    this.group = group;
    this.visited = false;
  }
  draw(){
    if (this.val){
      fill(84,84,100);
    } else {
      fill(167,167,183);
    }
    stroke(84,84,100);
    strokeWeight(cellw/30);
    ellipse(this.pixcoord.x,this.pixcoord.y,cellw/3,cellw/3);
  }
  updatePixCoords(x,y){
    this.pixcoord = {x:x,y:y};
  }
}

function isDeleteBond(){
  if (Math.random(0,1)<Math.pow(Math.E,4*beta*j)) return true;
  return false;
}

function initArray(){
  a = [];
  for (var y=0; y<size; y+=1){
    a.push([]);
    for (var x=0; x<size; x+=1){
      a[y].push(new Spin(
        {x:(1+x)*cellw,y:(1+y)*cellw},
        round(Math.random()),
        {down:false,right:false},
        0
      ));
    }
  }
}

function updateXYArray(){
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      a[y][x].updatePixCoords((1+x)*cellw,(1+y)*cellw);
    }
  }
}

function findConnections(){
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      if (a[(y+1+size)%size][x].val==a[y][x].val)
        a[y][x].connections.down = true;
      else
        a[y][x].connections.down = false;
      if (a[y][(x+1+size)%size].val==a[y][x].val)
        a[y][x].connections.right = true;
      else
        a[y][x].connections.right = false;
    }
  }
}

function dfs(nextcoords,group){
  let current = a[nextcoords.y][nextcoords.x];
  if (!current.visited){
    let left = a[nextcoords.y][(nextcoords.x-1+size)%size];
    let up = a[(nextcoords.y-1+size)%size][nextcoords.x];
    current.visited = true;
    current.group = group;
    if (left.connections.right) dfs({x:(nextcoords.x-1+size)%size,y:nextcoords.y},group);
    if (current.connections.right) dfs({x:(nextcoords.x+1+size)%size,y:nextcoords.y},group);
    if (up.connections.down) dfs({x:nextcoords.x,y:(nextcoords.y-1+size)%size},group);
    if (current.connections.down) dfs({x:nextcoords.x,y:(nextcoords.y+1+size)%size},group);
  }
}

function findIslands(){
  var groupid = 0;
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      a[y][x].visited = false;
    }
  }
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      if (!a[y][x].visited) {dfs({x:x,y:y},groupid);groupid+=1;}
    }
  }
  return groupid;
}

function drawGrid(){
  for (var b of a) {
    for (var c of b){
      c.draw();
    }
  }
}

function drawLines(){
  stroke(84,84,100);
  strokeWeight(cellw/50);
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      if (a[y][x].connections.right) line(a[y][x].pixcoord.x+cellw,a[y][x].pixcoord.y,a[y][x].pixcoord.x,a[y][x].pixcoord.y);
      if (a[y][x].connections.down) line(a[y][x].pixcoord.x,a[y][x].pixcoord.y+cellw,a[y][x].pixcoord.x,a[y][x].pixcoord.y);
    }
  }
  for (var i=0; i<size; i+=1) {
    if (a[size-1][i].connections.down) line(a[size-1][i].pixcoord.x,cellw,a[size-1][i].pixcoord.x,0);
    if (a[i][size-1].connections.right) line(0,a[i][size-1].pixcoord.y,cellw,a[i][size-1].pixcoord.y);
  }
}

function deleteSomeBonds(){
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      if (a[y][x].connections.right && isDeleteBond()){
        a[y][x].connections.right = false;
      }
      if (a[y][x].connections.down && isDeleteBond()){
        a[y][x].connections.down = false;
      }
    }
  }
}

function reassignSpinGroups(mapping){
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      a[y][x].val = mapping[a[y][x].group];
    }
  }
}

function getChi(){
  var m = 0;
  var msq = 0;
  for (var y=0; y<size; y+=1){
    for (var x=0; x<size; x+=1){
      m += 2*a[y][x].val-1;
    }
  }
  m /= size*size;
  msq = m*m;
  print(m, msq)
}

function mouseClicked() {
  if (pause==false) {
    pause = true;
    start = (millis()-start)%300+stepnum;
    print('pause')
  }
  else {
    pause = false;
    start += millis()%300;
    print('play')
  }
}

window.onresize = function() {
  resizeCanvas(windowWidth, windowHeight);
  W = windowWidth;
  H = windowHeight
  minlargest = Math.min(W,H);
  // cellw = minlargest/(size+1);
  // updateXYArray();
  // background(167,167,183);
  // findConnections();
  // findIslands();
  // drawLines();
  // drawGrid();
};
