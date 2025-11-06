//OSCAR ALCARRIA LASERNA P5 JS

var renderer, scene, camera;
var cameraControls;
var robot, base, brazo, eje, rotula, antebrazo, mano, pinzaR, pinzaL;
var gui;
var keys = {};
var robotParams = {
    posX: 0,
    posZ: 0,
    giroBase: 0,
    giroBrazo: 0,
    giroAntebrazoY: 0,
    giroAntebrazoZ: 0,
    rotacionPinza: 0,
    aperturaPinza: 0,
    wireframe: false,
    animar: function() {
        iniciarAnimacion();
    }
};

var materials = { base: null, brazo: null, antebrazo: null, mano: null, pinza: null };

window.addEventListener('load', function() {
    init();
    loadScene();
    setupGUI();
    setupEventListeners();
    render();
});

function init() {
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setClearColor(new THREE.Color(0x222222));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.getElementById('container').appendChild(renderer.domElement);

    scene = new THREE.Scene();
    var aspectRatio = window.innerWidth / window.innerHeight;
    camera = new THREE.PerspectiveCamera(50, aspectRatio, 0.1, 10000);
    camera.position.set(300, 200, 300);

    cameraControls = { 
        target: new THREE.Vector3(0, 0, 0),
        update: function() { camera.lookAt(this.target); }
    };

    //luces
    var ambientLight = new THREE.AmbientLight(0x404040, 0.4);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(100, 200, 100);
    directionalLight.castShadow = true;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    var spotlight = new THREE.SpotLight(0xffffff, 1, 1000, Math.PI / 4, 0.1, 2);
    spotlight.position.set(200, 200, 200);
    spotlight.castShadow = true;
    scene.add(spotlight);

    window.addEventListener('resize', updateAspectRatio);
}


function crearHabitacion() {
    //textura de entorno para paredes
    let texturaHabitacion = new THREE.CubeTextureLoader().load([
        'images/posx.jpg', 'images/negx.jpg',
        'images/posy.jpg', 'images/negy.jpg',
        'images/posz.jpg', 'images/negz.jpg'
    ]);

    //material de la hab
    let materialHabitacion = new THREE.MeshBasicMaterial({
        color: 0xaaaaaa,
        envMap: texturaHabitacion,
        side: THREE.BackSide
    });

    const geometry = new THREE.BoxGeometry(1000, 1000, 1000);

    const habitacion = new THREE.Mesh(geometry, [
        materialHabitacion,
        materialHabitacion,
        materialHabitacion,
        null, //piso
        materialHabitacion,
        materialHabitacion
    ]);

    habitacion.position.set(0, 500, 0);

    scene.add(habitacion);
}
function createMaterials() {
    materials.base = new THREE.MeshLambertMaterial({ color: 0x35F527, transparent: true, opacity: 0.8, wireframe: robotParams.wireframe });
    materials.brazo = new THREE.MeshLambertMaterial({ color: 0x1004FA, transparent: true, opacity: 0.8, wireframe: robotParams.wireframe });
    materials.antebrazo = new THREE.MeshLambertMaterial({ color: 0x00CED1, transparent: true, opacity: 0.8, wireframe: robotParams.wireframe });
    materials.mano = new THREE.MeshLambertMaterial({ color: 0x8A2BE2, transparent: true, opacity: 0.8, wireframe: robotParams.wireframe });
    materials.pinza = new THREE.MeshLambertMaterial({ color: 0x000000, transparent: true, opacity: 0.8, wireframe: robotParams.wireframe });
}

function loadScene() {
    createMaterials();
    //metal
    let textureMetal = new THREE.TextureLoader().load('images/metal_128.jpg');

    let materialMetal = new THREE.MeshLambertMaterial({
        map: textureMetal,
        side: THREE.DoubleSide,
        wireframe: robotParams.wireframe
    });
    //piso
    let textureSuelo = new THREE.TextureLoader().load('images/pisometalico_1024.jpg');
    let suelo = new THREE.Mesh(
        new THREE.PlaneGeometry(1000, 1000),
        new THREE.MeshLambertMaterial({ map: textureSuelo })
    );
     //madera
    let textureWood = new THREE.TextureLoader().load('images/wood512.jpg');

    let materialWood = new THREE.MeshLambertMaterial({
        map: textureWood,
        side: THREE.DoubleSide,
        wireframe: robotParams.wireframe
    });
    //fix3: añadir materailes de madera y metal a updatewireframe
    materials.metal = materialMetal;
    materials.madera = materialWood;
    suelo.rotation.x = -Math.PI / 2;
    suelo.receiveShadow = true;
    scene.add(suelo);
    crearHabitacion();
   
    robot = new THREE.Object3D();
    scene.add(robot);

    //base
    base = new THREE.Mesh(
        new THREE.CylinderGeometry(50, 50, 15, 50),
        materialMetal
    );
    base.position.y = 15 / 2;
    base.castShadow = true;
    robot.add(base);

    //brazo
    brazo = new THREE.Object3D();

    //eje
    eje = new THREE.Mesh(
        new THREE.CylinderGeometry(20, 20, 18, 32),
        materialMetal
    );
    eje.rotation.x = -Math.PI / 2;
    eje.rotation.z = -Math.PI / 2;
    eje.castShadow = true;
    brazo.add(eje);

    //esparrago
    let esparrago = new THREE.Mesh(
        new THREE.BoxGeometry(18, 120, 12),
        materialMetal
    );
    esparrago.position.y = 3 * 20;
    esparrago.castShadow = true;
    brazo.add(esparrago);

    //entorno
    let texturaEntorno = new THREE.CubeTextureLoader().load([
        'images/posx.jpg', 'images/negx.jpg',
        'images/posy.jpg', 'images/negy.jpg',
        'images/posz.jpg', 'images/negz.jpg'
    ]);
    //rotula
    rotula = new THREE.Mesh(
        new THREE.SphereGeometry(20, 20, 20),
        new THREE.MeshPhongMaterial({ color: 0xFFD700, envMap: texturaEntorno, shininess: 100 })
    );
    rotula.position.y = 120;
    rotula.castShadow = true;
    brazo.add(rotula);

    brazo.position.y = 15;
    base.add(brazo);

    //antebrazo
    antebrazo = new THREE.Object3D();

    //disco
    let disco = new THREE.Mesh(
        new THREE.CylinderGeometry(22, 22, 6, 32),
        materialWood
    );
    disco.castShadow = true;
    antebrazo.add(disco);

     //nervios
    for (let i = 0; i < 4; i++) {
        let nervio = new THREE.Mesh(
            new THREE.BoxGeometry(4, 80, 4),
            materialWood
        );
        nervio.position.y = 80 / 2;
        let angle = (i * Math.PI) / 2;
        let dist = 12;
        nervio.position.x = Math.cos(angle) * dist;
        nervio.position.z = Math.sin(angle) * dist;
        nervio.castShadow = true;
        antebrazo.add(nervio);
    }

    //mano
    mano = new THREE.Mesh(
        new THREE.CylinderGeometry(15, 15, 40, 32),
        materialWood
    );
    mano.rotation.z = Math.PI / 2;
    mano.position.y = 80;
    mano.castShadow = true;
    antebrazo.add(mano);


    function crearPinza(material) {

        let longitudPieza = 38;
        let alto = 20;
        let alto2 = 15;
        let ancho = 19;
        let grosor = 4;
        let grosor2 = 2;

        let difAltura = Math.abs(alto - alto2);

        // Vértices (mismo orden que en THREE.Geometry)
        const vertices = new Float32Array([
            0, 0, 0,
            grosor, 0, 0,
            0, 0, ancho,
            grosor, 0, ancho,
            0, -alto, ancho,
            0, -alto, 0,
            grosor, -alto, 0,
            grosor, -alto, ancho,
            0, -alto2 - difAltura / 2, longitudPieza,
            grosor2, -alto2 - difAltura / 2, longitudPieza,
            0, -difAltura / 2, longitudPieza,
            grosor2, -difAltura / 2, longitudPieza
        ]);

        // Índices (caras) igual que Face3 de tu función original
        const indices = [
            0, 2, 1,
            1, 2, 3,
            0, 5, 2,
            5, 4, 2,
            0, 5, 6,
            5, 6, 4,
            4, 6, 7,
            0, 6, 1,
            1, 6, 3,
            6, 7, 3,
            3, 2, 4,
            3, 4, 7,
            3, 10, 11,
            2, 10, 3,
            2, 4, 10,
            4, 8, 10,
            4, 7, 8,
            7, 9, 8,
            10, 8, 11,
            11, 8, 9,
            3, 11, 7,
            7, 9, 11
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        material.side = THREE.DoubleSide;

        const pinza = new THREE.Mesh(geometry, material);

        pinza.position.x = alto / 2;
        pinza.castShadow = true;
        pinza.receiveShadow = true;

        return pinza;
    }

    // Pinzas
    pinzaR = crearPinza(materials.pinza);
    pinzaR.rotation.z = -Math.PI / 2;
    pinzaR.position.y = 13;
    mano.add(pinzaR);

    pinzaL = crearPinza(materials.pinza);
    pinzaL.rotation.z = -Math.PI / 2;
    pinzaL.position.y = -10;
    mano.add(pinzaL);

    antebrazo.position.y = 2;
    rotula.add(antebrazo);

    scene.add(new THREE.AxesHelper(100));
}

//funcion de la interfaz para animación
function setupGUI() {
    gui = new dat.GUI();

    let folderRobot = gui.addFolder('Control Robot');
    folderRobot.add(robotParams, 'giroBase', -180, 180).name('Giro Base');
    folderRobot.add(robotParams, 'giroBrazo', -45, 45).name('Giro Brazo');
    folderRobot.add(robotParams, 'giroAntebrazoY', -180, 180).name('Giro Antebrazo Y');
    folderRobot.add(robotParams, 'giroAntebrazoZ', -90, 90).name('Giro Antebrazo Z');
    folderRobot.add(robotParams, 'rotacionPinza', -40, 220).name('Giro Pinza');
    folderRobot.add(robotParams, 'aperturaPinza', 0, 15).name('Separación Pinza');
    folderRobot.add(robotParams, 'wireframe').name('Wireframe').onChange(updateWireframe);
    gui.add(robotParams, 'animar').name('Anima');
    folderRobot.open();
}

function setupEventListeners() {
    document.addEventListener('keydown', onKeyDown, false);
    document.addEventListener('keyup', onKeyUp, false);
    
    let mouseDown = false;
    let mouseX = 0, mouseY = 0;
    renderer.domElement.addEventListener('mousedown', function(event) {
        mouseDown = true;
        mouseX = event.clientX;
        mouseY = event.clientY;
    });
    renderer.domElement.addEventListener('mouseup', function() {
        mouseDown = false;
    });
    renderer.domElement.addEventListener('mousemove', function(event) {
        if (!mouseDown) return;
        let deltaX = event.clientX - mouseX;
        let deltaY = event.clientY - mouseY;
        let spherical = new THREE.Spherical();
        spherical.setFromVector3(camera.position.clone().sub(cameraControls.target));
        spherical.theta -= deltaX * 0.01;
        spherical.phi += deltaY * 0.01;
        spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi));
        camera.position.copy(cameraControls.target).add(new THREE.Vector3().setFromSpherical(spherical));
        mouseX = event.clientX;
        mouseY = event.clientY;
    });

    renderer.domElement.addEventListener('wheel', function(event) {
        let direction = event.deltaY > 0 ? 1 : -1;
        let factor = 1 + direction * 0.1;
        camera.position.multiplyScalar(factor);
    });
}

function onKeyDown(event) { keys[event.code] = true; }
function onKeyUp(event) { keys[event.code] = false; }

function handleKeyboard() {
    const speed = 2;
    if (keys['ArrowUp']) robotParams.posZ -= speed;
    if (keys['ArrowDown']) robotParams.posZ += speed;
    if (keys['ArrowLeft']) robotParams.posX -= speed;
    if (keys['ArrowRight']) robotParams.posX += speed;
}

function updateWireframe() {
    Object.values(materials).forEach(material => {
        if (material) { material.wireframe = robotParams.wireframe; }
    });
}

function updateRobot() {
    robot.position.set(robotParams.posX, 0, robotParams.posZ);
    base.rotation.y = THREE.MathUtils.degToRad(robotParams.giroBase);
    //fix2: rotar sobre el eje z
    brazo.rotation.z = THREE.MathUtils.degToRad(robotParams.giroBrazo);
    antebrazo.rotation.y = THREE.MathUtils.degToRad(robotParams.giroAntebrazoY);
    antebrazo.rotation.z = THREE.MathUtils.degToRad(robotParams.giroAntebrazoZ);
    mano.rotation.x = THREE.MathUtils.degToRad(robotParams.rotacionPinza);
    pinzaR.position.y = 13 + robotParams.aperturaPinza;
    pinzaL.position.y = -10 - robotParams.aperturaPinza;
}

function iniciarAnimacion() {
    if (typeof TWEEN !== 'undefined') {
        TWEEN.removeAll();
        new TWEEN.Tween(robotParams)
            .to({ giroBase: 180 }, 2000)
            .easing(TWEEN.Easing.Quadratic.Out)
            .start()
            .chain(new TWEEN.Tween(robotParams)
                .to({ giroBrazo: -30, giroAntebrazoY: 45 }, 1500)
                .easing(TWEEN.Easing.Cubic.InOut)
                .chain(new TWEEN.Tween(robotParams)
                    .to({ aperturaPinza: 15 }, 1000)
                    .easing(TWEEN.Easing.Elastic.Out)
                    .chain(new TWEEN.Tween(robotParams)
                        .to({ rotacionPinza: 180, giroAntebrazoZ: -45 }, 2000)
                        .easing(TWEEN.Easing.Bounce.Out)
                        .chain(new TWEEN.Tween(robotParams)
                            .to({ giroBase: 0, giroBrazo: 0, giroAntebrazoY: 0, giroAntebrazoZ: 0, rotacionPinza: 0, aperturaPinza: 0 }, 3000)
                            .easing(TWEEN.Easing.Exponential.Out)
                        )
                    )
                )
            );
    }
}

function updateAspectRatio() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
}

function update() {
    handleKeyboard();
    updateRobot();
    cameraControls.update();
    if (typeof TWEEN !== 'undefined') { TWEEN.update(); }
}

function render() {
    requestAnimationFrame(render);
    update();
    renderer.render(scene, camera);
}
