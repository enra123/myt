import {Component, ElementRef, AfterViewInit, ViewChild, HostListener } from '@angular/core';

@Component({
  selector: 'app-spinning-wheel',
  templateUrl: './spinning-wheel.component.html',
  styleUrls: ['./spinning-wheel.component.scss']
})
export class SpinningWheelComponent implements AfterViewInit {
  @ViewChild('myCanvas', { static: true })
  canvas: ElementRef<HTMLCanvasElement>;
  public ctx: CanvasRenderingContext2D
  public TOTALFRAME: number = 120
  public FRICTION: number = 0.97
  public MINCYCLE: number = 3
  public number: number = 0
  public canvasLength: number = 350
  public angleTest: number = 0
  private readonly probabilitiesCumulative: number[]
  private readonly probabilityDifferences: number[]
  private velocity: number
  private angle: number
  private frictionFactor: number
  private frame: number = 0
  private then: number = 0
  private fpsInterval = 1000/60
  private hueRatioFactor = 2.9 // 3.6 for complete hue cycle 0 ~ 360

  constructor() {
    // Values from Lost Ark official data
    this.probabilitiesCumulative = [
      0,
      22.9, // < 10
      44.46, // < 20
      62.47, // < 30
      76.7, // < 40
      87.15, // < 50
      93.83, // < 60
      96.73, // < 70
      98.11, // < 80
      99.14, // < 90
      100, // <= 100
    ]
    this.probabilityDifferences = [
      22.9, // < 10
      21.56, // < 20
      18.01, // < 30
      14.23, // < 40
      10.45, // < 50
      6.68, // < 60
      2.9, // < 70
      1.38, // < 80
      1.03, // < 90
      0.86, // <= 100
    ]
    this.angle = 0
    this.velocity = 0
    this.frictionFactor = 0
    /*
      distance = velocity * friction^1 + velocity * friction^2 + velocity * friction^3 + velocity * friction^4 ...
      til TOTALFRAME
                     = velocity(friction^1 + friction^2 + friction^3 + friction^4 ...)
      distance / velocity = friction^1 + friction^2 + friction^3 + friction^4 ...
      pre-computing the right side of the equation
     */
    for (let i = 1; i <= this.TOTALFRAME; i += 1) {
      this.frictionFactor += Math.pow(this.FRICTION, i)
    }
  }

  // getting a random 0 ~ 99.999999
  private getRandomProbability(): number {
    return Math.random() * 100
  }

  /* receiving 0 ~ 99.99999 and returning matching number referring to probabilitiesCumulative 0 ~ 100.00
     e.g. 22.9 -> 10, 43 -> 19.3228, 96.8 -> 70.507,
          98.43 -> 83.1068, 99.94 -> 99.3023
  */
  private getNumberFromProbability(p: number): number {
    const i = this.probabilitiesCumulative.findIndex((e) => { // guaranteed i > 0
      return p < e
    })
    const m = this.probabilitiesCumulative[i - 1]
    const d = this.probabilityDifferences[i - 1]
    let n = 10
    if (i >= 10) { // 100 inclusive
      n = 11
    }

    return (i - 1) * 10 + (p - m) / d * n
  }

  private getInitialVelocityFromNumber(x: number): number {
    let ta = x / 100 * 360 + 0.1 // target angle + buffer
    /* desired distance / velocity =  frictionFactor(pre-calculated in the constructor)
       initial velocity = desired distance / frictionFactor
     */
    return (360 * this.MINCYCLE + ta) / this.frictionFactor
  }

  private setDisplayNumber(angle: number) {
    const a = angle % 360
    this.number = Math.floor(this.getNumberFromProbability(a / 360 * 100))
  }

  private degToRad(deg: number): number {
    return deg * Math.PI / 180
  }

  getNumberStyle(): Object {
    if (this.number == 100){
      return {color: '#ff9a30', fontWeight: 800}
    }
    if (this.number > 89){
      return {color: '#c808fa', fontWeight: 700}
    }
    if (this.number > 69){
      return {color: '#0979f6', fontWeight: 600}
    }
    if (this.number > 29){
      return {color: '#13b63d', fontWeight: 500}
    }
    if (this.number > 9){
      return {color: '#e0c229', fontWeight: 200}
    }
    if (this.number > 0){
      return {color: '#b83734', fontWeight: 100}
    }
    return {color: 'grey', fontWeight: 100}
  }

  drawWheel() {
    let radius = this.ctx.canvas.width / 2
    for (let x = 180; x < 540; x += 0.1) { // starting from 12 o'clock and clockwise
      this.ctx.beginPath()
      this.ctx.moveTo(radius, radius)
      let hue = this.hueRatioFactor * this.getNumberFromProbability((x - 180) / 3.6)
      const hue10p = this.hueRatioFactor * 10
      if (hue >= hue10p && hue % hue10p < 0.1 ) { // every 10p line stands out
        hue = 33
      }
      if (x > 539.8) { // 100 part stands out as well
        hue = 56
      }
      this.ctx.strokeStyle = "hsla(" + hue + ", 100%, 50%, 1.0)"
      this.ctx.lineTo(radius * Math.sin(-this.degToRad(x)) + radius,
                      radius * Math.cos(-this.degToRad(x)) + radius);
      this.ctx.stroke();
    }
  }

  rotate() {
    if (!this.frame) return
    this.velocity *= this.FRICTION
    this.angle += this.velocity
    this.ctx.canvas.style.transform = 'rotate(-' + (this.angle % 360) + 'deg)'
    this.setDisplayNumber(this.angle)
    this.frame--
  }

  // rotate() the wheel in fixed fps
  update() {
    requestAnimationFrame(this.update.bind(this))
    let now = Date.now();
    let elapsed = now - this.then;

    // if enough time has elapsed, draw the next frame
    if (elapsed > this.fpsInterval) {
      this.then = now - (elapsed % this.fpsInterval);
      this.rotate();
    }
  }

  spin() {
    if (this.frame) return
    // reset
    this.angle = 0
    this.frame = this.TOTALFRAME
    this.ctx.canvas.style.transform = 'rotate(0deg)'
    // prepare and spin
    const r = this.getRandomProbability()
    this.velocity = this.getInitialVelocityFromNumber(r)
    this.then = Date.now();
    this.update()
  }

  setCanvasAndDraw(windowWidth: number) {
    let length = 320
    if (windowWidth > 400) {
      length = 370
    }
    if (windowWidth > 535) {
      length = 500
    }
    if (length != this.canvasLength) {
      this.ctx.canvas.width = length
      this.ctx.canvas.height = length
      this.canvasLength = length
      this.drawWheel()
    }
  }

  setCanvasManually() {
    if (this.angleTest < 0) this.angleTest = 360
    if (this.angleTest > 360) this.angleTest = 0
    this.ctx.canvas.style.transform = 'rotate(0deg)'
    this.ctx.canvas.style.transform = 'rotate(-' + (this.angleTest % 360) + 'deg)'
    this.setDisplayNumber(this.angleTest)
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.setCanvasAndDraw(event.target.innerWidth)
  }

  ngAfterViewInit() {
    const ctx = this.canvas.nativeElement.getContext('2d')
    if (!ctx || !(ctx instanceof CanvasRenderingContext2D)) {
        throw new Error('Failed to get 2D context');
    }
    this.ctx = ctx
    this.setCanvasAndDraw(window.innerWidth)
  }

}
