var group = new THREE.Group();
var group0 = new THREE.Group();
var cubeSize = 2, dimensions = 3, spacing = 0.1;
var increment = cubeSize + spacing,
    maxExtent = (cubeSize * dimensions + spacing * (dimensions - 1)) / 2,
    allCubes = [];

var scene = new THREE.Scene(),
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000),
    renderer = new THREE.WebGLRenderer({ antialias: true });
var colours = [0x0051BA, 0x009E60, 0xC41E3A, 0xFF5800, 0xFFD500, 0xFFFFFF]
//                red,    green,     blue,   orange,   yellow,    white
//    faceMaterials = colours.map(function (c) {
//        return new THREE.MeshLambertMaterial({ color: c });
//    }),
//     cubeMaterials = [];
// for (var i = 0; i < colours.length; i++) {
//     cubeMaterials.push(new THREE.MeshBasicMaterial({ color: colours[i] }));
// }

function newCube(x, y, z, n) {
    cubeMaterials = [];
    for (var i = 0; i < colours.length; i++) {
        cubeMaterials.push(new THREE.MeshBasicMaterial({ color: colours[i] }));
    }
    var cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    var cube = new THREE.Mesh(cubeGeometry, cubeMaterials);
    cube.castShadow = true;
    // console.log(x, y, z);
    //cube.position = new THREE.Vector3(x, y, z);
    cube.name = n;
    cube.position.x = x;
    cube.position.y = y;
    cube.position.z = z;
    cube.rubikPosition = cube.position.clone();
    scene.add(cube);
    allCubes.push(cube);
}

var positionOffset = (dimensions - 1) / 2;
var n = 0;
for (var i = 0; i < dimensions; i++) {
    for (var j = 0; j < dimensions; j++) {
        for (var k = 0; k < dimensions; k++) {
            var x = (i - positionOffset) * increment,
                y = (j - positionOffset) * increment,
                z = (k - positionOffset) * increment;
            newCube(x, y, z, n);
            n += 1;
        }
    }
}

function showCube(x, y, z) {
    names = [];
    allCubes.forEach(cube => {
        //  if (cube.position.x - x < 0.1 && cube.position.y - y < 0.1 && cube.position.z - z < 0.1) {
        // if (Math.abs(cube.position.y - y) < 0.1) {
        //     names.push(cube.name);
        // }
        console.log(cube.name, cube.position)
    });
    console.log("top layer", names);
}


const axesHelper = new THREE.AxesHelper(50);
scene.add(axesHelper);

renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
camera.position.x = -5;
camera.position.y = 5;
camera.position.z = 10;
camera.lookAt(scene.position);
renderer.setClearColor(0x303030, 1.0);

function render() {
    renderer.render(scene, camera);
    requestAnimationFrame(render);

}

render()
var clickVector = camera.position.clone();
clickVector.x = 0;
clickVector.y = 0;
clickVector.z = 0;

function nearlyEqual(a, b, d) {
    d = d || 0.001;
    return Math.abs(a - b) <= d;
}

// https://threejs.org/docs/#api/en/objects/Group
// const group = new THREE.Group();

function setActiveGroup(axis, group) {
    // forEach and for index has problem here 
    // since index will change after scene.add() delete one element
    while (group.children.length > 0) {
        scene.add(group.children[0]);
    }
    if (clickVector) {
        allCubes.forEach(function (cube) {
            if (nearlyEqual(cube.rubikPosition[axis], clickVector[axis])) {
                group.attach(cube);
            }
        });
    } else {
        console.log("Nothing to move!");
    }
}

function releaseGroup(xyz) {
    let rc;
    rotate_clockwise ? rc = 1 : rc = -1;
    scene.remove(group);
    while (group.children.length > 0) {
        group.children[0].applyMatrix4(group.matrix);
        scene.add(group.children[0]);
    }
    group.rotation[xyz] += rc * Math.PI / 2; // 回正到初始方向，似乎有效
}

var rotate_clockwise = true;

function rotate(xyz) {
    let rc;
    rotate_clockwise ? rc = 1 : rc = -1;
    sleep(1300).then(() => { group.rotation[xyz] -= rc * Math.PI / 8 });
    sleep(300).then(() => { group.rotation[xyz] -= rc * Math.PI / 8 });
    sleep(600).then(() => { group.rotation[xyz] -= rc * Math.PI / 8 });
    sleep(900).then(() => { group.rotation[xyz] -= rc * Math.PI / 8 });
    sleep(2000).then(() => { releaseGroup(xyz); }); // <- 不release会异常复位
    names = [];
    group.children.forEach(function (cube) {
        names.push(cube.name);
        cube.updateMatrixWorld();
        cube.rubikPosition = cube.position.clone();
        cube.rubikPosition.applyMatrix4(group.matrix);
        cube.position.applyMatrix4(group.matrix);
    });
    console.log(group.matrix)
    // group.applyMatrix4(group.matrixWorld); // <- 导致异常复位
    console.log(names);
    // scene.remove(group);
    rotate_clockwise = true;
    // reset group

}

function sleep(time) {
    return new Promise((resolve) => setTimeout(resolve, time));
}

var m = 1;
function act(code) {
    if (code == "'") {
	    console.log("reverse");
	    rotate_clockwise = false
    }
    if (code == "c") {
        allCubes[0].material[m].color.r = 0;
        allCubes[0].material[m].color.g = 0;
        allCubes[0].material[m].color.b = 0;
        m += 1;
    }
    if (code == "p") {
        showCube(2.1, 2.1, 2.1);
        if (group.children.length == 0) {
            console.log("empty group")
        } else {
            console.log(group.children[0].position);
            names = []
            group.children.forEach(function (cube) {
                names.push(cube.name);
            });
            console.log(names);
        }

        names = []
        scene.children.forEach(function (cube) {
            names.push(cube.name);
        });
        console.log(names);
    }
    if (code == "U") {
        clickVector.y = 2.1;
        setActiveGroup("y", group);
        scene.add(group);
        rotate("y");
    }
    if (code == "R") {
        clickVector.x = 2.1;
        setActiveGroup("x", group);
        scene.add(group);
        rotate("x");
    }
    if (code == "L") {
        clickVector.x = -2.1;
        rotate_clockwise = !rotate_clockwise
        setActiveGroup("x", group);
        scene.add(group);
        rotate("x");
    }
}

window.onkeypress = function (evt) {
    evt = evt || window.event;
    var charCode = evt.keyCode || evt.which;
    var charStr = String.fromCharCode(charCode);
    // alert(charCode); 
    act(charStr);
};
