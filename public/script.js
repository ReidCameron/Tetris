//Game Variables and Constants
const EMPTY = "#0004"
let grid = Array.from({length: 200}, () => { return {color: EMPTY}})
const tetrominoes = [
    { arr: [0,0,0,0,1,1,1,1,0,0,0,0,0,0,0,0], sz:4, color: '#00f0f0'}, //I
    { arr: [1,0,0,1,1,1,0,0,0], sz:3, color: '#0000f0'}, //J
    { arr: [0,0,1,1,1,1,0,0,0], sz:3, color: '#f0a000'}, //L
    { arr: [1,1,1,1], sz:2, color: '#f0f000'}, //O
    { arr: [0,1,1,1,1,0,0,0,0], sz:3, color: '#00f000'}, //S
    { arr: [0,1,0,1,1,1,0,0,0], sz:3, color: '#a000f0'}, //T
    { arr: [1,1,0,0,1,1,0,0,0], sz:3, color: '#f00000'}, //Z
]

let lastTime = 0;
let DELAY = 500//in ms
let queue = [];
let tmo = null; //tetromino object
let anchor = 0; //vertical position of tmo
let dx; //horiziontal position of tmo
let score = 0;
let highscore = 0;
let linesCleared = 0;
let paused = false;
let acceptScore = false;
let ghostAnchor = -1;

document.querySelector(".start").addEventListener("click", ()=>{
    acceptScore = true;
    document.getElementById("controls").style.display = 'none';
    resetGame();
})



//Game Loop
window.requestAnimationFrame(gameLoop);
function gameLoop(timeStamp) {
    
    //Game Logic
    if(timeStamp - lastTime >= DELAY && !paused){
        //Reset Timer Variable
        lastTime = timeStamp;

        //create tmo if none exists
        if(tmo == null) nextTmo();
        else dropTmo()
    }
    
    draw()
    window.requestAnimationFrame(gameLoop);
}
function nextTmo(){
    if(queue.length <= 3){
        //bag randomizer
        let tmos = tetrominoes.slice(0)
        //shuffle
        for(let i = tmos.length - 1; i > 0; i--){
            let j = Math.floor(Math.random() * (tmos.length));
            let temp = tmos[i];
            tmos[i] = tmos[j];
            tmos[j] = temp;
        }
        queue = queue.concat(tmos.slice(0));
    }

    //Set Next TMO
    tmo = JSON.parse(JSON.stringify(queue.shift()));
    anchor = 0;
    dx = (tmo.sz === 2)? 4:3;

    //update tmo viewer
    for(let i = 0; i < 3; i++){
        let nextTmo = queue.slice(i,i+1)[0];
        let nextDx = 0;
        let nextA = (nextTmo.sz==4)? -1:0;
        for(let y = 0; y < 4; y++){
            for(let x = 0; x < 4; x++){
                let idx = x + y*4;
                document.getElementById(`v${i+1}-${idx}`).style.backgroundColor = '#081840';
                document.getElementById(`v${i+1}-${idx}`).classList.remove("bevel");
                if(y >= nextA && y < nextA + nextTmo.sz){
                    if(x >= nextDx && x < nextDx + nextTmo.sz && nextTmo.arr[(x - nextDx) + (y-nextA)*nextTmo.sz] === 1){
                        document.getElementById(`v${i+1}-${idx}`).style.backgroundColor = nextTmo.color;
                        document.getElementById(`v${i+1}-${idx}`).classList.add("bevel");
                    }
                }
            }
        }
    }

    //check if losing
    if(checkPlace(anchor, dx)){
        if(checkPlace(anchor - 1, dx)){
            resetGame();
        } else {
            anchor--;
        }
    }
}
function dropTmo(){
    if(tmo == null) return;
    //Drop Real Piece
    let res = checkPlace(anchor + 1, dx)
    anchor++;
    if(res){
        saveTmo();
        scoreLines();
    } 
}
function scoreLines(){
    //Find every full row
    let fullRows = []
    for(let y = 0; y < 20; y++){
        let full = true; //true if row is full
        //check row
        for(let x = 0; x < 10; x++){
            if(y == 19){

            }
            if(grid[x + y*10].color == EMPTY){
                full = false;
            }
        }
        if(full){
            fullRows.push(y)
        }
    }
    
    fullRows.forEach( (v,i) => {
        //delete rows
        for(let x = 0; x < 10; x++){
            grid[x + v*10].color = EMPTY
        }
        //move rows down
        for(let y = v; y >= 0; y--){
            for(let x = 0; x < 10; x++){
                if(y > 0){
                    grid[x + y*10].color = grid[x + (y-1)*10].color
                } else {
                    grid[x + y*10].color = EMPTY
                }
            }
        }
    });
    
    if(!acceptScore) return;
    //handle scoring
    let consecLines = 1;
    let tempScore = 0;
    for(let i = 0; i < fullRows.length-1;i++){
        if((fullRows[i+1] - fullRows[i] > 1)){
            tempScore += 100 * (2**(consecLines - 1))
            consecLines = 1;
        } else {
            consecLines++;
        }
    }
    if(fullRows.length > 0){
        tempScore += 100 * (2**(consecLines-1))
    }
    score += tempScore //add points for line clear
    score += 10; // add points for piece dropping

    if(score > highscore) highscore = score;

    document.querySelector(".current").textContent = score;
    document.querySelector(".high").textContent = highscore;

    //decrease delay time
    linesCleared += fullRows.length;
    let tempD = 500 - Math.floor(linesCleared / 5) * 40;
    DELAY = (tempD < 125)? 125: tempD;
}

function checkPlace(nextA, nextdx){
    let exTmo = tmo;
    for(let y = nextA; y < nextA + exTmo.sz; y++){
        for(let x = nextdx; x < nextdx + exTmo.sz; x++){
            if(y > 19){
                if (exTmo.arr[(x - nextdx) + (y-nextA)*exTmo.sz] === 1){
                    return true;
                }
            } else if(grid[x + y*10] && grid[x + y*10].color != EMPTY && exTmo.arr[(x - nextdx) + (y-nextA)*exTmo.sz] === 1){
                return true;
            }
        }
    }
    //Retrun false if nothing is blocking/touching the current tmo
    return false;
}
function saveTmo(){
    anchor--;
    if(anchor <= -1){
        resetGame();
        return;
    }
    for(let y = anchor; y < anchor + tmo.sz; y++){
        for(let x = dx; x < dx + tmo.sz; x++){
            if(tmo.arr[(x - dx) + (y-anchor)*tmo.sz] === 1){
                grid[x + y*10].color = tmo.color;
            }
        }
    }
    tmo = null;
    ghostAnchor = -1;
    // nextTmo()
}

function draw(){
    //Calculate position of Ghost Piece
    if(tmo !=null){
        for(i = anchor; i < 20; i++){
            if(checkPlace(i, dx)){
                ghostAnchor = i - 1;
                break;
            }
        }
    }
    //draw grid
    for(let y = 0; y < 20; y++){
        for(let x = 0; x < 10; x++){
            let idx = x + y*10;
            //draw grid
            document.getElementById(`${idx}`).style.backgroundColor = grid[idx].color;
            if(grid[idx].color != EMPTY){
                document.getElementById(`${idx}`).classList.add("bevel");
                document.getElementById(`${idx}`).classList.remove("ghost");
            } else {
                document.getElementById(`${idx}`).classList.remove("bevel");
                document.getElementById(`${idx}`).classList.remove("ghost");
            }
            //draw tmo
            if(tmo !=null){
                if(y >= anchor && y < anchor + tmo.sz && x >= dx &&
                     x < dx + tmo.sz && tmo.arr[(x - dx) + (y-anchor)*tmo.sz] === 1){
                        document.getElementById(`${idx}`).style.backgroundColor = tmo.color;
                        document.getElementById(`${idx}`).classList.add("bevel");
                } else {
                    if(ghostAnchor > 0 && ghostAnchor != anchor ){
                        if(y >= ghostAnchor && y < ghostAnchor + tmo.sz){
                            if(x >= dx && x < dx + tmo.sz && tmo.arr[(x - dx) + (y-ghostAnchor)*tmo.sz] === 1){
                                document.getElementById(`${idx}`).classList.add("ghost");
                            }
                        }
                    }
                }
            }
        }
    }
}
function shift(inc){
    if(tmo == null) return;

    //true if tmo is inside bounds
    let inside = true;

    //check out of bounds horizontally
    if( (dx + inc <= -1) || (dx + tmo.sz - 1 + inc >= 10)){
        inside = (checkOOB(inc) === 0);
    }
    //check intersection with other pieces
    inside = inside && !checkPlace(anchor, dx + inc)

    //Inc position of tmo if result is inside bounds
    if (inside) dx += inc;
}
function rotate(isClockwise){
    if(tmo == null) return;
    //Transpose Array
    let arr = Array.from({length: tmo.arr.length}, () => { return 0})
    tmo.arr.forEach((v,i) =>{
        let x = i % tmo.sz;
        let y = Math.floor(i / tmo.sz);
        arr[x*tmo.sz + y] = v;
    })

    //Swap columns
    arr = arr.map((v,i) => {
        let x = i % tmo.sz;
        let y = Math.floor(i / tmo.sz);
        if(isClockwise){
            let newX = tmo.sz - x - 1;
            return arr[newX + y*tmo.sz]
        } else {
            let newY = tmo.sz - y - 1;
            return arr[x + newY*tmo.sz]
        }
    })

    //check if outside bounds
    tmo.arr = arr;
    if( (dx <= -1) || (dx + tmo.sz >= 11)){
        dx += checkOOB(0);
    }
    if( (dx <= -1) || (dx + tmo.sz >= 11)){
        dx += checkOOB(0);
    }
}

function checkOOB(inc){
    if(tmo == null) return;
    // console.log('dx at check: ', dx)
    if(inc < 0 || (dx < 5 && inc === 0)){
        for(y=0;y<tmo.sz;y++){
            let idx = y*tmo.sz - (dx + inc + 1);
            // console.log('idx: ', idx)
            if(tmo.arr[idx] === 1){
                // console.log('too far left')
                return 1
            }
        }
    } else if(inc > 0 || (dx > 5 && inc === 0)){
        for(y=0;y<tmo.sz;y++){
            let idx = (9 - (dx )) + y*tmo.sz;
            // console.log('idx: ', idx)
            if(tmo.arr[idx] === 1){
                // console.log('too far right')
                return -1
            }
        }
    }
    // console.log('cob', 0)
    return 0;
}
function hardDrop(){
    if(tmo == null) return;
    for(let nextA = anchor; nextA < 20; nextA++){
        if(checkPlace(nextA, dx)){
            anchor = --nextA;
            break;
        }
    }
}
function resetGame(){
    grid = Array.from({length: 200}, () => { return {color: EMPTY}})
    DELAY = 500//in ms
    queue = [];
    tmo = null;
    score = 0;
    linesCleared = 0;
    document.querySelector(".current").textContent = score;
}
window.addEventListener("keydown", function (event) {
    switch (event.key) {
        case "ArrowDown":
            if(event.ctrlKey) hardDrop();
                else dropTmo();
            break;
        case "ArrowUp":
            rotate(!(event.ctrlKey))
            break;
        case "ArrowLeft":
            if(event.ctrlKey) {
                for(let i = 0; i < 10; i++)
                    shift(-1)
            } else shift(-1)
            break;
        case "ArrowRight":
            if(event.ctrlKey) {
                for(let i = 0; i < 10; i++)
                    shift(1)
            } else shift(1)
            break;
        case "r":
            resetGame();
            break;
        case "p":
            paused=!paused;
            break;
        default:
    }
});