import { createApp } from 'vue'	 

let app = createApp({
    data() {
        return {
            formula: "sin(x² + y² + time/2) / (x² + y² + 1)",
            color1: "#ff0000",
            color2: "ffff00",
            step: 0.3,
            xInterval: 4,
            yInterval: 4,
            t: 0,
            renderTime: 0,
            autoStep: false,
            ballSize: 0.05,
            cam: {
                x: 0,
                y: 0,
                z: 4,
                dx: 0,
                dz: 0,
                v: 0
            },
            skyColor: "#111"
        } 
    },
    methods:{
        copyLink() {
            // Copy this.sharelink to clipboard and alert the user
            navigator.clipboard.writeText(this.sharelink).then(() => {
                alert("Link copiado al portapapeles")
            })
        },
        camina(){
            // this.cam.v = 0.03
        },
        detente() {
            // this.cam.v = 0
        }
    },
    computed: {
        sharelink: function() {
            let url = new URL(window.location.href)
            url.searchParams.set("formula", this.formula)
            url.searchParams.set("color1", this.color1)
            url.searchParams.set("color2", this.color2)
            url.searchParams.set("step", this.step)
            url.searchParams.set("xInterval", this.xInterval)
            url.searchParams.set("yInterval", this.yInterval)
            url.searchParams.set("ballSize", this.ballSize)
            url.searchParams.set("skyColor", this.skyColor)
            return url
        },
        parseFunction: function() { 

        },
        getPlotValues2D: function() {

        },
        getPlotValues3D: function() {
            if(this.autoStep) {   
                let p = performance.now()
                if (4 * (this.xInterval / this.step) * (this.yInterval / this.step) > 10000) {
                    this.step = 1
                }
                if (p - this.renderTime > 1000 && this.renderTime !== 0) {
                    this.step = 1
                } else if (p - this.renderTime > 1.3 * 1000 / 60) {
                    if(Date.now() % 5 === 0) {
                        this.step = parseFloat(this.step) * 1.1
                    }
                } else if (p - this.renderTime < 1.05 * 1000 / 60) {
                    if(Date.now() % 5 === 0) {
                        this.step = Math.max(0.01, parseFloat(this.step) * 0.9)
                    }
                }
                this.renderTime = p
            }

            let valores = []
            let minX = parseFloat(-this.xInterval)
            let maxX = parseFloat(this.xInterval)
            let minY = parseFloat(-this.yInterval)
            let maxY = parseFloat(this.yInterval)
            let step = parseFloat(this.step)

            let cleanFormula = this.formula.replaceAll("^","**").replace("time", this.t)
            cleanFormula = cleanFormula.replaceAll("sin", "Math.sin").replaceAll("cos", "Math.cos").replaceAll("tan", "Math.tan")
            cleanFormula = cleanFormula.replaceAll("atan", "Math.atan").replaceAll("acos", "Math.acos").replaceAll("asin", "Math.asin")
            cleanFormula = cleanFormula.replaceAll("atan2", "Math.atan2")
            
            cleanFormula = cleanFormula.replaceAll("sqrt", "Math.sqrt").replaceAll("log", "Math.log").replaceAll("exp", "Math.exp")
            cleanFormula = cleanFormula.replaceAll("pow", "Math.pow")
            
            cleanFormula = cleanFormula.replaceAll("abs", "Math.abs").replaceAll("floor", "Math.floor").replaceAll("ceil", "Math.ceil")
            cleanFormula = cleanFormula.replaceAll("max", "Math.max").replaceAll("min", "Math.min")
            
            cleanFormula = cleanFormula.replaceAll("²", "**2").replaceAll("³", "**3").replaceAll("⁴", "**4").replaceAll("⁵", "**5").replaceAll("⁶", "**6").replaceAll("⁷", "**7").replaceAll("⁸", "**8").replaceAll("⁹", "**9")
            cleanFormula = cleanFormula.replaceAll("PI", "Math.PI").replaceAll("E", "Math.E")
            cleanFormula = cleanFormula.replaceAll("random", "Math.random")
            /*          
            */
            

            for (let x = minX; x <= maxX; x += step) {
                for (let y = minY; y <= maxY; y += step) {
                    let  valY = 0
                    try {
                        valY = eval(cleanFormula)
                        
                    } catch (e) {
                        console.error(e)
                    }

                    // Convert color1 and color2 to RGB
                    let r1 = parseInt(this.color1.substring(1, 3), 16)
                    let g1 = parseInt(this.color1.substring(3, 5), 16)
                    let b1 = parseInt(this.color1.substring(5, 7), 16)
                    let r2 = parseInt(this.color2.substring(1, 3), 16)
                    let g2 = parseInt(this.color2.substring(3, 5), 16)
                    let b2 = parseInt(this.color2.substring(5, 7), 16)

                    valores.push({
                        x: x,
                        y:  valY,
                        z: y,
                        r: this.ballSize,
                        color: {
                            r: Math.floor(r1 + (r2 - r1) * (x - minX) / (maxX - minX)),
                            g: Math.floor(g1 + (g2 - g1) * (x - minX) / (maxX - minX)),
                            b: Math.floor(b1 + (b2 - b1) * (x - minX) / (maxX - minX))
                            // r: 255, //Math.floor((-x + 7) * 25),
                            // g: Math.floor((-y + 7) * 25),  
                            // b: 20
                        }
                    })
                }
            }
            return valores
        }
    },
    created() {
        // Get url parameters and set them to the data
        this.formula = new URLSearchParams(window.location.search).get("formula") || this.formula
        this.color1 = new URLSearchParams(window.location.search).get("color1") || this.color1
        this.color2 = new URLSearchParams(window.location.search).get("color2") || this.color2
        this.step = new URLSearchParams(window.location.search).get("step") || this.step
        this.xInterval = new URLSearchParams(window.location.search).get("xInterval") || this.xInterval
        this.yInterval = new URLSearchParams(window.location.search).get("yInterval") || this.yInterval
        this.ballSize = new URLSearchParams(window.location.search).get("ballSize") || this.ballSize
        this.skyColor = new URLSearchParams(window.location.search).get("skyColor") || this.skyColor

    },
    mounted() {
        // Time
        this.t = 0
        
        const animate = () => {
            this.t += 0.1

            let player = document.getElementById("camara")
            let angle = player.getAttribute("rotation")
            this.cam.dz = -Math.cos(angle.y * Math.PI / 180)
            this.cam.dx = -Math.sin(angle.y * Math.PI / 180)
            // console.log(angle.y, this.cam.dx, this.cam.dz)

            this.cam.x += this.cam.dx * this.cam.v
            this.cam.z += this.cam.dz * this.cam.v
            window.requestAnimationFrame(animate)
        }

        window.requestAnimationFrame(animate)
    }
}).mount('#app')

window.app = app
