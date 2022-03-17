class Node {
    constructor(id) {
        this.id = id;
        this.neighbours = {}
        this.position = createVector(0, 0);
    }

    setPosition(x, y) {
        this.position = createVector(x, y);
    }
}


class Graph {
    constructor(N) {
        this.nodes = [];
        this.currentPath = []; 
        for (let i = 0; i < N; i++) {
            this.nodes.push(new Node(i));
            this.currentPath.push(i)
        }
    }

    evualuateCostSolution(solution) {
        let cost = 0;
        for (let i = 0; i < solution.length; i++) {
            const currId = solution[i];
            const node1 = this.getNodeById(currId);
            const nextId = (i < solution.length - 1) ? solution[i+1] : solution[0];
            const node2 = this.getNodeById(nextId);

            cost += node1.position.dist(node2.position);
        }

        return cost;

    }
    setcurrentPath(path) {
        this.currentPath = path;
    }

    /**
     * Connects and assigns positions to Graph Nodes
     * based on a JSON.
     * JSON of the format: {nodes: [<Node>, <Node>, ... ]}, where Node: 
     * {
     *  "id": 0,
     *  "neighbours":[id1, id2, ..., idn],
     *  "position": {"x": <float>, "y": <float> }
     * }
     * 
     */
    constructGraphFromJSON(jsonObj) {
        const jsonNodes = jsonObj["nodes"];
        jsonNodes.forEach(nodeObj => {
            const id = nodeObj.id;
            const position = nodeObj.position;
            
            const graphNode = this.nodes[id];
            graphNode.setPosition(parseFloat(position.x), parseFloat(position.y));            
        })
    }

    getNodeById(id) {
        return this.nodes[id];
    }

    paintLineByNodesIds(id1, id2) {
        const n1 = this.getNodeById(id1);
        const n2 = this.getNodeById(id2);

        strokeWeight(1);
        stroke(255);
        line(n1.position.x, n1.position.y, n2.position.x, n2.position.y);
    }

    display() {
        this.nodes.forEach(node => {
            fill(255);
            ellipse(node.position.x, node.position.y, 7);
        })

        const pathLength = this.currentPath.length
        for (let i = 0; i < pathLength; i++) {
            const id1 =  this.currentPath[i];
            const id2 = (i < pathLength - 1) ? this.currentPath[i+1] : this.currentPath[0];
            this.paintLineByNodesIds(id1, id2);
        }
    }
}





function randomPermutation(cities) {
    // mantenemos la ciudad inicial
    const initial = cities[0];
    let restCities = cities.slice(1);
    shuffle(restCities, true);
    return [initial].concat(restCities);
}

function solutionCost(solution) {
    return graph.evualuateCostSolution(solution)
}

function createNeighbours(current) {
    let perm = current.slice();
    let c1 = random(perm);
    let c2 = random(perm);

    let exclude = [c1];

    const prev = (c1 === 0) ? perm.length - 1 : c1-1;
    exclude.push(prev);

    const next = (c1 === perm.length - 1) ? 0 : c1+1;
    exclude.push(next)

    while (exclude.includes(c2)) c2 = random(perm);

    if (c2 < c1) {
        let tmp = c1;
        c1 = c2;
        c2 = tmp;
    }

    let path = perm.slice(c1, c2).reverse()

    perm.splice(c1, path.length, ...path)

    return perm;
}

function shouldAccept(candidateCost, bestCost) {
    if (candidateCost < bestCost ) return true;
    return Math.exp((bestCost - candidateCost) / temperature) > random()
}

let graph;
const max_iter = 1000;
let temperature = 100000;
const temp_change = 0.98;
let i = 0;
let currentSolution;
let bestCost;
let PLAY = false;

function setup() {
    createCanvas(1000, 800);
    graph = new Graph(graphJson.nodes.length);
    graph.constructGraphFromJSON(graphJson);
    currentSolution = randomPermutation(graph.currentPath);
    bestCost = solutionCost(currentSolution);
    button = createButton("Play");
    button.mousePressed(togglePlay);
    button.position(width-50, height-50);
    button.style('border', 'none');
    button.style('height', '40px');
    button.style('font-weight', 'bold');
}

function togglePlay() {
    PLAY = !PLAY;
}

function displayText(best, iterm_num) {
    strokeWeight(0);
    textFont('Helvetica');
    textSize(15);
    text(`Best Distance: ${best.toFixed(2)}          Iteration: ${iterm_num}/${max_iter}` , height/2-50, width-220)
}


function draw() {
    background(0);
    if (i < max_iter && PLAY) {
        const candidate = createNeighbours(currentSolution);
        const candidateCost = graph.evualuateCostSolution(candidate);
        temperature *= temp_change;

        if (shouldAccept(candidateCost, bestCost)) {
            currentSolution = candidate;
            bestCost = candidateCost;
        }

        graph.setcurrentPath(currentSolution);
        graph.display();
        if (i % 20 === 0) {
            console.log(i)
            displayText(bestCost, i);
        }

        i++;
    }
    
    graph.display();
    displayText(bestCost, i);
}