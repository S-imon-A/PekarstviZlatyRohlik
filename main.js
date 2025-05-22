import { Player } from "./player.js"
import { FallingObject } from "./falling_object.js"
import { Random } from "./utils/random.js"
import { AbbreviateNumber } from "./utils/abbreviations.js"

const fallingObjectData = [
    {
        objectImage: "images/Bread.png",
        objectHeight: 100,
        objectWidth: 100,
        objectPoints: 1,
        objectRoundTimeAdd: 15,
        objectRoundTimeRemove: 20,
        objectChance: 1000
    },
    {
        objectImage: "images/DiamondBread.png",
        objectHeight: 100,
        objectWidth: 100,
        objectPoints: 10,
        objectRoundTimeAdd: 20,
        objectRoundTimeRemove: 20,
        objectChance: 100
    },
    {
        objectImage: "images/EmeraldBread.png",
        objectHeight: 100,
        objectWidth: 100,
        objectPoints: 75,
        objectRoundTimeAdd: 30,
        objectRoundTimeRemove: 20,
        objectChance: 1
    },
    {
        objectImage: "images/BurnedBread.png",
        objectHeight: 100,
        objectWidth: 100,
        objectPoints: -5,
        objectRoundTimeAdd: -50,
        objectRoundTimeRemove: -5,
        objectChance: 250
    }
]
const gameWindow = document.querySelector("#game")
const score = document.querySelector("#score")
const scoreDiv = document.querySelector("#score-div")
const nav = document.querySelector("nav")
const resetButton = document.querySelector("#reset-button")
const resetBackgroundFade = document.querySelector("#reset-background-fade")

let player
let collider
let colliderRect
let logo = null
let logoPosition = [0, 0]
let offsetY = 0
let fallingObjects = []
let fallingObjectDelay = 0
let isGame = false
let popUps = []
let roundTime = 100
let isGameOver = false
let navBGDuration = 0
let gameTime = 0
let curFallSpeed = 3.5
let spawnRanges = []
let windowSpawnMargin = 100
let windowSpawnSections = 6

function getRandomFallingObject(){
    let totalChance = 0

    fallingObjectData.forEach(fallingObject => {
        totalChance += fallingObject.objectChance
    })

    let chance = Random.getNumber(0, totalChance)
    let currentChance = 0

    for (let i = 0; i < fallingObjectData.length; i++){
        const fallingObject = fallingObjectData[i]

        if (chance >= currentChance && chance < currentChance + fallingObject.objectChance){
            return fallingObject

            break
        }
        else{
            currentChance += fallingObject.objectChance
        }
    }

    return fallingObjectData[0]
}

function getRandomSpawnPosition(pickedFallingObject){
    const computedGameWindowStyle = window.getComputedStyle(gameWindow)
    let width = parseFloat(computedGameWindowStyle.width.slice(0, computedGameWindowStyle.width.length -1))
    width -= pickedFallingObject.objectWidth + (windowSpawnMargin * 2)

    if (spawnRanges.length <= 0){
        let current = 0

        for (let i = 0; i < windowSpawnSections; i++){
            let spawnRange = [current + windowSpawnMargin, current + width/windowSpawnSections + windowSpawnMargin]

            spawnRanges.push(spawnRange)

            current += width/windowSpawnSections + 1
        }
    }
    
    let randomNumber = Random.getNumber(0, spawnRanges.length - 1)
    let spawnRange = spawnRanges[randomNumber]

    spawnRanges.splice(randomNumber, 1)

    return Random.getNumber(spawnRange[0], spawnRange[1])
}

function createFallingObject(){
    const pickedFallingObject = getRandomFallingObject()

    const fallingObjectElement = document.createElement("div")
    fallingObjectElement.classList.add("falling-object")
    fallingObjectElement.style.backgroundImage = `url("${pickedFallingObject.objectImage}")`
    fallingObjectElement.style.backgroundSize = "100% 100%"
    fallingObjectElement.style.visibility = "hidden"
    fallingObjectElement.style.height = `${pickedFallingObject.objectHeight}px`
    fallingObjectElement.style.width = `${pickedFallingObject.objectWidth}px`
    gameWindow.append(fallingObjectElement)

    let newFallingObject = new FallingObject(
        fallingObjectElement, curFallSpeed, getRandomSpawnPosition(pickedFallingObject), 0, pickedFallingObject.objectPoints, pickedFallingObject.objectRoundTimeAdd, pickedFallingObject.objectRoundTimeRemove
    )

    fallingObjects.push(newFallingObject)
}

function handleFallingObjects(deltaTime){
    let fallingObjectsToRemove = []

    for (let i = 0; i < fallingObjects.length; i++){
        const fallingObject = fallingObjects[i]

        if (!fallingObject.outOfBounds){
            fallingObject.update(deltaTime)
        }
        else{
            fallingObjectsToRemove.push(fallingObject)
        }
    }

    for (let i = 0; i < fallingObjectsToRemove.length; i++){
        const fallingObjectToRemove = fallingObjectsToRemove[i]

        let removeIndex = -1

        for (let j = 0; j < fallingObjects.length; j++){
            const fallingObject = fallingObjects[i]

            if (fallingObject !== fallingObjectToRemove) continue

            removeIndex = j

            break
        }

        roundTime -= fallingObjectToRemove.roundTimeRemove

        if (fallingObjectToRemove.roundTimeRemove < 0){
            navBGDuration += 1.5
        }

        if (removeIndex >= 0){
            fallingObjects[removeIndex].element.remove()

            fallingObjects.splice(removeIndex, 1)
        }
    }
}

function handleCollidingObjects(collidingObjects){
    for (let i = 0; i < collidingObjects.length; i++){
        const collidingObject = collidingObjects[i]

        player.score += collidingObject.points
        score.innerText = AbbreviateNumber(player.score, ",")

        scoreDiv.style.animation = "score-pop 0.2s 1 linear"
        scoreDiv.style.opacity = "1"

        createPopUp(collidingObject.element.getBoundingClientRect(), collidingObject.points)

        roundTime += collidingObject.roundTimeAdd
        if (roundTime > 100) roundTime = 100
        navBGDuration += 1.5

        collidingObject.roundTimeRemove = 0
        collidingObject.outOfBounds = true
    }
}

function displayGameOver(){
    resetButton.style.opacity = "0"
    resetButton.style.visibility = "visible"
    resetButton.style.animation = "background-fade-in 1s 1 linear forwards"
    scoreDiv.style.top = "40%"
    resetBackgroundFade.style.visibility = "visible"
    resetBackgroundFade.style.animation = "background-fade-in 1s 1 linear forwards"
    isGame = false
    logo = null
    player.element.style.animation = "none"
}

function resetGame(){
    isGameOver = false

    resetButton.style.visibility = "hidden"
    resetButton.style.animation = "background-fade-out 1s 1 linear forwards"
    resetBackgroundFade.style.animation = "background-fade-out 1s 1 linear forwards"
    scoreDiv.style.top = "14%"
    roundTime = 100
    fallingObjectDelay = 0
    player.score = 0

    fallingObjects.forEach(fallingObject => {
        fallingObject.element.remove()
    })
    fallingObjects = []

    const _logo = document.querySelector("#init-logo-piece")
    _logo.style.left = "63px"
    _logo.style.top = "22px"
    offsetY = 0

    player.x = 80
    player.lookDirection = 1
    player.update(0)

    navBGDuration = 0
    curFallSpeed = 3.5

    score.innerText = AbbreviateNumber(0, ",")

    runInitAnimation()
}   

function runInitAnimation(){
    if (logo) return
    if (isGameOver) return

    logo = document.querySelector("#init-logo-piece")
    const logoWhiteBG = document.querySelector("#init-logo-piece-white")

    logoWhiteBG.style.visibility = "visible"
    logo.style.visibility = "visible"

    const computedLogoStyle = window.getComputedStyle(logo)
    logoPosition = [
        parseFloat(computedLogoStyle.left.slice(0, computedLogoStyle.left.length - 2)),
        parseFloat(computedLogoStyle.top.slice(0, computedLogoStyle.top.length - 2))
    ] 

    gameWindow.style.zIndex = 100

    collider = document.querySelector("#collider")  
    colliderRect = collider.getBoundingClientRect()
    
    player.element.style.visibility = "visible"
    player.element.style.animation = "player-move 0.75s 1 linear"

    const h1 = document.querySelector("h1")
    h1.style.animation = "background-fade-out 0.3s 1 linear forwards"

    const h2 = document.querySelector("h2")
    h2.style.animation = "background-fade-out 0.3s 1 linear forwards"

    const mainButton = document.querySelector("#nase-pecivo")
    mainButton.style.animation = "background-fade-out 0.3s 1 linear forwards"

    const backgroundImage = document.querySelector("#background-image")
    backgroundImage.style.animation = "background-fade-out 1s 1 linear forwards"

    const backgroundImage2 = document.querySelector("#background-image-2")
    backgroundImage2.style.animation = "background-fade-in 1s 1 linear forwards"

    scoreDiv.style.animation = "background-fade-in 1s 1 linear"

    const buttons = nav.querySelectorAll("button")
    buttons.forEach(button => {
        button.style.animation = "background-fade-out 0.3s 1 linear forwards"
    })

    const navDiv = document.querySelector("#nav-div") 
    navDiv.style.animation = "background-fade-out 0.3s 1 linear forwards"
}

function createPopUp(fallingObjectRect, add){
    const popUpElement = document.querySelector(".pop-div").cloneNode(true)

    popUpElement.classList.remove("pop-div")
    popUpElement.classList.add("pop-div-p")

    for (let i = 0; i < popUpElement.children.length; i++){
        const childNode = popUpElement.children[i]

        if (!childNode.classList.contains("pop")) continue

        childNode.innerText = `+  ${add}`
    }

    popUpElement.style.left = "400px"
    popUpElement.style.top = "-50px"
    popUpElement.style.animation = "pop-up 1s 1 linear"
    player.element.append(popUpElement)

    popUps.push(popUpElement)

    popUpElement.addEventListener("animationend", () => {
        popUpElement.remove()
    })
}

function handlePopUps(){
    let transformString = "scaleX(-1)"

    if (player.element.style.transform === transformString){
        transformString = "scaleX(-1)"
    }
    else {
        transformString = "scaleX(1)"
    }

    for (let i = 0; i < popUps.length; i++){
        const popUp = popUps[i]

        popUp.style.transform = transformString
    }
}

let lastTime = 0
function mainLoop(time){
    const deltaTime = (time - lastTime) / 10
    lastTime = time

    if (isGame){
        player.update(deltaTime)
        handleFallingObjects(deltaTime)
        handleCollidingObjects(player.checkCollision(deltaTime, fallingObjects))

        let fallMin = 10

        if (gameTime < 1000){
            curFallSpeed = 3.5
            fallMin = 10
        }
        else if (gameTime < 1500){
            curFallSpeed = 4
            fallMin = 9
        }
        else if (gameTime < 2000){
            curFallSpeed = 4
            fallMin = 8
        }
        else if (gameTime < 2500){
            curFallSpeed = 4
            fallMin = 7
        }
        else if (gameTime < 3000){
            curFallSpeed = 4
            fallMin = 6
        }
        else if (gameTime < 3500){
            curFallSpeed = 4
            fallMin = 5
        }
         else if (gameTime < 4000){
            curFallSpeed = 4
            fallMin = 4
        }
        else if (gameTime < 5000){
            curFallSpeed = 5
            fallMin = 3
        }
        else if (gameTime < 10000){
            curFallSpeed = 6
            fallMin = 6
        }
        else if (gameTime < 20000){
            curFallSpeed = 6 + gameTime/10000
            fallMin = 5 - gameTime/100000
        }

        fallingObjectDelay += 0.05 * deltaTime

        if (fallingObjectDelay > fallMin){
            fallingObjectDelay = 0

            if (gameTime > 5000){
                setTimeout(() => {
                    createFallingObject()
                }, 500)
            }
            if (gameTime > 20000){
                setTimeout(() => {
                    createFallingObject()
                }, 1000)
            }

            createFallingObject()
        }
        
        handlePopUps()

        if (roundTime <= 0){
            nav.style.width = `${0}%`

            if (!isGameOver){
                isGameOver = true

                displayGameOver()
            }
        }
        else{
            roundTime -= 0.05 * deltaTime + gameTime/100000
            nav.style.width = `${roundTime}%`
        }

        if (navBGDuration > 0){
            navBGDuration -= 0.1 * deltaTime
            nav.style.backgroundColor = "rgba(255, 215, 0, 0.86)"
        }
        else {
            nav.style.backgroundColor = "rgba(255, 215, 0, 0.56)"
        }

        gameTime += deltaTime
    }
    else{
        if (logo){
            let finish = true

            if (logoPosition[0] < colliderRect.left + 50){
                logoPosition[0] += 5 * deltaTime

                logo.style.left = `${logoPosition[0]}px`
            }

            if (logoPosition[1] < colliderRect.top){
                logoPosition[1] += 5 * deltaTime - offsetY * deltaTime

                logo.style.top = `${logoPosition[1]}px`

                finish = false
            }

            offsetY -= 0.1

            if (finish){
                logo.style.visibility = "hidden"
                isGame = true
                player.score += 1
                score.innerText = player.score
                navBGDuration += 1.5
                gameTime = 0
                setTimeout(() => {
                    scoreDiv.style.animation = "score-pop 0.2s 1 linear"
                    scoreDiv.style.opacity = "1"

                    createPopUp(logo.getBoundingClientRect(), 1)
                }, 100)
            }

            player.renderPushAnimation()
        }
    }
    
    window.requestAnimationFrame(mainLoop)
}

function setup(){
    player = new Player(document.querySelector("#player"), 6, 80, document.querySelector("#collider"), document.querySelector("#character"))
    player.update(0)

    document.addEventListener("keydown", (e) => {
        player.onKeyDown(e.key)

        if (e.key === " "){
            runInitAnimation()
        }
    })
    document.addEventListener("keyup", (e) => {
        player.onKeyUp(e.key)
    })

    scoreDiv.addEventListener("animationend", () => {
        scoreDiv.style.animation = "none"
        scoreDiv.style.opacity = "1"
    })

    resetButton.addEventListener("click", resetGame)

    resetBackgroundFade.addEventListener("animationend", () => {
        resetBackgroundFade.style.animation = "none"

        if (isGameOver){
            resetBackgroundFade.style.opacity = "1"
        }
        else{
            resetBackgroundFade.style.opacity = "0"
        }
    })
    resetButton.addEventListener("animationend", () => {
        resetButton.style.animation = "none"

        if (isGameOver){
            resetButton.style.opacity = "1"
        }
        else{
            resetButton.style.opacity = "0"
        }
    })

    window.addEventListener("load", () => {
        const imagesToPreload = []

        for (let i = 0; i < 103; i++){
            let strIndex = i.toString()

            while (strIndex.length < 4){
                strIndex = "0" + strIndex
            }

            imagesToPreload.push(`images/character_animation_push/${strIndex}.png`)
        }

        imagesToPreload.forEach(src => {
            const img = new Image()
            img.src = src
        })
    })

    window.requestAnimationFrame(mainLoop)
}

setup()