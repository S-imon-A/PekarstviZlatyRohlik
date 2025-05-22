export class Player{
    constructor(htmlImageElement, speed, startX, colliderElement, playerImage){
        this.leftInput = false
        this.rightInput = false

        this.direction = 0
        this.speed = speed
        this.x = startX
        this.lookDirection = 1

        this.element = htmlImageElement
        this.collider = colliderElement

        this.playerImage = playerImage
        this.animationIndex = 1
        this.currentAnimationFolder = "images/character_animation_push"
        this.rotationAnimationIndex = this.lookDirection

        const gameWindow = document.querySelector("#game")
        const computedGameWindowStyle = window.getComputedStyle(gameWindow)

        this.gameWindowWidth = parseFloat(computedGameWindowStyle.width.slice(0, computedGameWindowStyle.width.length - 2))

        const computedPlayerStyle = window.getComputedStyle(this.element)

        this.width = parseFloat(computedPlayerStyle.width.slice(0, computedPlayerStyle.width.length - 2))

        this.score = 0
    }

    onKeyDown(key){
        if (key === "a" || key === "A" || key === "ArrowLeft"){
            this.leftInput = true
        }

        if (key === "d" || key === "D" || key === "ArrowRight"){
            this.rightInput = true
        }
    }

    onKeyUp(key){
        if (key === "a" || key === "A" || key === "ArrowLeft"){
            this.leftInput = false
        }

        if (key === "d" || key === "D" || key === "ArrowRight"){
            this.rightInput = false
        }
    }
    
    checkCollision(deltaTime, fallingObjects){
        if (fallingObjects.length <= 0) return []
        
        let collidingObjects = []

        const colliderRect = this.collider.getBoundingClientRect()

        for (let i = 0; i < fallingObjects.length; i++){
            const fallingObject = fallingObjects[i].element
            const rect = fallingObject.getBoundingClientRect()

            let colX = rect.left >= colliderRect.left && rect.left <= colliderRect.left + colliderRect.width
                || rect.left + rect.width >= colliderRect.left && rect.left + rect.width <= colliderRect.left + colliderRect.width
            let colY = rect.top >= colliderRect.top && rect.top <= colliderRect.top + colliderRect.height 
                || rect.top + rect.height >= colliderRect.top && rect.top + rect.height <= colliderRect.top + colliderRect.height

            if (colX && colY){
                collidingObjects.push(fallingObjects[i])
            }
        }

        return collidingObjects
    }

    getAnimationFrame(folderPath, index){
        let strIndex = index.toString()

        while (strIndex.length < 4){
            strIndex = "0" + strIndex
        }

        return `${folderPath}/${strIndex}.png`
    }

    renderPushAnimation(){
        this.playerImage.setAttribute("src", this.getAnimationFrame("images/character_animation_push", this.animationIndex))
        this.animationIndex++
        if (this.animationIndex > 103){
            this.animationIndex = 1
        }
    }

    updateVisual(){
        this.element.style.left = `${this.x}px`

        this.element.style.transform = `scaleX(${this.lookDirection})`

        this.playerImage.setAttribute("src", this.getAnimationFrame(this.currentAnimationFolder, this.animationIndex))
        this.animationIndex++
        if (this.animationIndex > 103){
            this.animationIndex = 1
        }
    }

    update(deltaTime){
        if (this.leftInput && !this.rightInput){
            this.direction = -1
            this.lookDirection = -1
        }
        else if (this.rightInput && !this.leftInput){
            this.direction = 1
            this.lookDirection = 1
        }
        else {
            this.direction = 0
        }

        this.x += this.speed * this.direction * deltaTime

        if (this.x < 0) this.x = 0
        if (this.x + this.width > this.gameWindowWidth) this.x = this.gameWindowWidth - this.width

        if (this.direction === 0){
            this.currentAnimationFolder = "images/character_animation_idle"
        }
        else{
            this.currentAnimationFolder = "images/character_animation_push"
        }

        this.updateVisual()
    }
}