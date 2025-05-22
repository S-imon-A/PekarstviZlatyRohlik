export class FallingObject{
    constructor(htmlImageElement, fallSpeed, startX, startY, points, roundTimeAdd, roundTimeRemove){
        this.x = startX
        this.y = startY
        this.fallSpeed = fallSpeed
        this.element = htmlImageElement
        this.points = points
        this.roundTimeAdd = roundTimeAdd
        this.roundTimeRemove = roundTimeRemove

        const gameWindow = document.querySelector("#game")
        const computedGameWindowStyle = window.getComputedStyle(gameWindow)

        this.gameWindowHeight = parseFloat(computedGameWindowStyle.height.slice(0, computedGameWindowStyle.height.length - 2))

        const computedObjectStyle = window.getComputedStyle(this.element)

        this.height = parseFloat(computedObjectStyle.height.slice(0, computedObjectStyle.height.length - 2))

        this.outOfBounds = false
    }

    updateVisual(){
        this.element.style.left = `${this.x}px`
        this.element.style.top = `${this.y}px`

        this.element.style.visibility = "visible"
    }

    update(deltaTime){
        this.y += this.fallSpeed * deltaTime

        if (this.y + this.height >= this.gameWindowHeight){
            this.outOfBounds = true
        }
        else{
            this.updateVisual()
        }
    }
}