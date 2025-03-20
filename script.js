document.addEventListener("DOMContentLoaded", () => {
  // Canvas setup for fireworks
  const canvas = document.getElementById("fireworksCanvas")
  const ctx = canvas.getContext("2d")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  const cake = document.querySelector(".cake")
  const candleCountDisplay = document.getElementById("candleCount")
  const leftFireworksContainer = document.getElementById("leftFireworks")
  const rightFireworksContainer = document.getElementById("rightFireworks")
  //const canvas = document.getElementById("fireworksCanvas")
  //const ctx = canvas.getContext("2d")
  const candles = []
  let audioContext
  let analyser
  let microphone
  const audio = new Audio("hbd.mp3")
  const fireworks = []
  const particles = []
  let birthdayText = []
  const showBirthdayText = false
  let fireworksInterval
  let isFireworksActive = false

  // Set canvas size
  //canvas.width = window.innerWidth
  //canvas.height = window.innerHeight

  // Colors for fireworks
  const colors = [
    "#ff48c4", // pink
    "#2bd1fc", // blue
    "#f3ea5f", // yellow
    "#c04df9", // purple
    "#ff3f3f", // red
    "#2bfc88", // green
  ]

  // Birthday text configuration
  const birthdayMessage = "HAPPY BIRTHDAY!"
  const textPositionX = canvas.width / 2
  const textPositionY = canvas.height / 3

  // Firework class
  class Firework {
    constructor(x, y, targetX, targetY, color) {
      this.x = x
      this.y = y
      this.targetX = targetX
      this.targetY = targetY
      this.color = color || colors[Math.floor(Math.random() * colors.length)]
      this.speed = 2
      this.angle = Math.atan2(targetY - y, targetX - x)
      this.velocity = {
        x: Math.cos(this.angle) * this.speed,
        y: Math.sin(this.angle) * this.speed,
      }
      this.brightness = 70
      this.alpha = 1
      this.radius = 2
    }

    update() {
      this.x += this.velocity.x
      this.y += this.velocity.y
      this.alpha -= 0.01

      // Check if firework reached target
      const distance = Math.sqrt(Math.pow(this.targetX - this.x, 2) + Math.pow(this.targetY - this.y, 2))
      if (distance < 5 || this.alpha <= 0) {
        return true // Explode
      }
      return false
    }

    draw() {
      ctx.globalAlpha = this.alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
    }
  }

  // Particle class for explosion
  class Particle {
    constructor(x, y, color) {
      this.x = x
      this.y = y
      this.color = color || colors[Math.floor(Math.random() * colors.length)]
      this.velocity = {
        x: (Math.random() - 0.5) * 8,
        y: (Math.random() - 0.5) * 8,
      }
      this.alpha = 1
      this.radius = Math.random() * 3 + 1
      this.friction = 0.95
      this.gravity = 0.1
      this.life = 100 + Math.random() * 100
      this.remainingLife = this.life
    }

    update() {
      this.velocity.x *= this.friction
      this.velocity.y *= this.friction
      this.velocity.y += this.gravity
      this.x += this.velocity.x
      this.y += this.velocity.y
      this.remainingLife--
      this.alpha = this.remainingLife / this.life

      return this.remainingLife <= 0
    }

    draw() {
      ctx.globalAlpha = this.alpha
      ctx.beginPath()
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
      ctx.fillStyle = this.color
      ctx.fill()
      ctx.closePath()
      ctx.globalAlpha = 1
    }
  }

  // Text particle class
  class TextParticle {
    constructor(x, y, char, color) {
      this.x = x
      this.y = y
      this.char = char
      this.targetX = x
      this.targetY = y
      this.color = color || colors[Math.floor(Math.random() * colors.length)]
      this.alpha = 0
      this.velocity = {
        x: (Math.random() - 0.5) * 20,
        y: (Math.random() - 0.5) * 20,
      }
      this.friction = 0.95
    }

    update() {
      // Move towards target position
      this.x += (this.targetX - this.x) * 0.1
      this.y += (this.targetY - this.y) * 0.1

      // Increase alpha until fully visible
      if (this.alpha < 1) {
        this.alpha += 0.02
      }
    }

    draw() {
      ctx.globalAlpha = this.alpha
      ctx.font = "bold 30px Arial"
      ctx.fillStyle = this.color
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"
      ctx.fillText(this.char, this.x, this.y)
      ctx.globalAlpha = 1
    }
  }

  // Create birthday text particles
  function createBirthdayText() {
    birthdayText = []
    const chars = birthdayMessage.split("")
    const letterSpacing = 30
    const startX = textPositionX - (chars.length * letterSpacing) / 2

    chars.forEach((char, i) => {
      const x = startX + i * letterSpacing
      const y = textPositionY
      const randomX = Math.random() * canvas.width
      const randomY = Math.random() * canvas.height
      const color = colors[Math.floor(Math.random() * colors.length)]

      const textParticle = new TextParticle(randomX, randomY, char, color)
      textParticle.targetX = x
      textParticle.targetY = y
      birthdayText.push(textParticle)
    })
  }

  // Launch a firework
  function launchFireworkCanvas(targetX, targetY) {
    const startX = Math.random() * canvas.width
    const startY = canvas.height
    const color = colors[Math.floor(Math.random() * colors.length)]

    fireworks.push(new Firework(startX, startY, targetX, targetY, color))
  }

  // Create explosion particles
  function createExplosion(x, y, color) {
    const particleCount = 80 + Math.floor(Math.random() * 40)
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(x, y, color))
    }
  }

  // Animation loop
  function animate() {
    requestAnimationFrame(animate)
    ctx.fillStyle = "rgba(0, 0, 0, 0.2)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Update and draw fireworks
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].draw()
      if (fireworks[i].update()) {
        // Firework reached target, create explosion
        createExplosion(fireworks[i].x, fireworks[i].y, fireworks[i].color)
        fireworks.splice(i, 1)
      }
    }

    // Update and draw particles
    for (let i = particles.length - 1; i >= 0; i--) {
      particles[i].draw()
      if (particles[i].update()) {
        particles.splice(i, 1)
      }
    }

    // Update and draw birthday text
    if (showBirthdayText) {
      birthdayText.forEach((particle) => {
        particle.update()
        particle.draw()
      })
    }
  }

  // Start animation
  animate()

  // Handle window resize
  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    if (showBirthdayText) {
      createBirthdayText()
    }
  })

  function updateCandleCount() {
    const activeCandles = candles.filter((candle) => !candle.classList.contains("out")).length
    candleCountDisplay.textContent = activeCandles
  }

  function addCandle(left, top) {
    const candle = document.createElement("div")
    candle.className = "candle"
    candle.style.left = left + "px"
    candle.style.top = top + "px"

    const flame = document.createElement("div")
    flame.className = "flame"
    candle.appendChild(flame)

    cake.appendChild(candle)
    candles.push(candle)
    updateCandleCount()
  }

  cake.addEventListener("click", (event) => {
    const rect = cake.getBoundingClientRect()
    const left = event.clientX - rect.left
    const top = event.clientY - rect.top
    addCandle(left, top)
  })

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength

    return average > 50 //ETO CHANGEEEEEE
  }

  function blowOutCandles() {
    let blownOut = 0

    // Only check for blowing if there are candles and at least one is not blown out
    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out")
            blownOut++

            // Launch a firework for each blown out candle
            //launchFirework(Math.random() * canvas.width, (Math.random() * canvas.height) / 2)
          }
        })
      }

      if (blownOut > 0) {
        updateCandleCount()
      }

      // If all candles are blown out, trigger celebration
      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(() => {
          triggerConfetti()
          //startFireworksShow()
          //showBirthdayText = true
          //createBirthdayText()
          intensifyFireworks() // Intensify the fireworks show
          audio.play()
        }, 200)
      }
    }
  }

  // Fireworks functions
  function createFireworkParticle(x, y, color) {
    const particle = document.createElement("div")
    particle.className = "firework-particle"
    particle.style.left = x + "px"
    particle.style.top = y + "px"
    particle.style.backgroundColor = color

    // Random direction
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 3
    const distance = 30 + Math.random() * 70

    // Set the animation
    particle.animate(
      [
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
        },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000 + Math.random() * 500,
        easing: "cubic-bezier(0.1, 0.8, 0.2, 1)",
      },
    )

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    }, 1500)

    return particle
  }

  function explodeFirework(x, y, container) {
    // More vibrant colors like in the reference image
    const colors = [
      "#ff48c4", // pink
      "#2bd1fc", // blue
      "#f3ea5f", // yellow
      "#c04df9", // purple
      "#ff3f3f", // red
      "#2bfc88", // green
    ]

    const firework = document.createElement("div")
    firework.className = "firework"
    firework.style.left = x + "px"
    firework.style.top = y + "px"
    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    container.appendChild(firework)

    // Create more particles for bigger explosions
    const particleCount = 40 + Math.floor(Math.random() * 30)
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particle = createFireworkParticle(x, y, color)
      container.appendChild(particle)
    }

    // Remove the firework center after animation
    setTimeout(() => {
      if (firework.parentNode) {
        firework.parentNode.removeChild(firework)
      }
    }, 1000)
  }

  function launchRocket(container, callback) {
    const rocket = document.createElement("div")
    rocket.className = "rocket"

    // Random horizontal position within the container
    const leftPos = 10 + Math.random() * 80
    rocket.style.left = leftPos + "px"

    container.appendChild(rocket)

    // When rocket reaches the top, explode
    setTimeout(() => {
      if (rocket.parentNode) {
        const x = leftPos
        const y = 50 + Math.random() * 100 // Explode somewhere in the top half

        rocket.parentNode.removeChild(rocket)
        if (callback) callback(x, y, container)
      }
    }, 1000)
  }

  function launchFirework(container) {
    launchRocket(container, explodeFirework)
  }

  // Start continuous fireworks show
  function startContinuousFireworks() {
    isFireworksActive = true

    // Launch fireworks from both sides at staggered intervals
    /*setInterval(() => {
      launchFirework(leftFireworksContainer)
    }, 1200)

    setInterval(() => {
      launchFirework(rightFireworksContainer)
    }, 1500)

    // Add random center fireworks occasionally
    setInterval(() => {
      const container = Math.random() > 0.5 ? leftFireworksContainer : rightFireworksContainer
      launchFirework(container)
    }, 2000)*/

    // Launch fireworks at random positions
    setInterval(() => {
      const targetX = Math.random() * canvas.width
      const targetY = (Math.random() * canvas.height) / 2
      launchFireworkCanvas(targetX, targetY)
    }, 300) // Launch a new firework every 300ms
  }

  // Intensify fireworks when all candles are blown out
  function intensifyFireworks() {
    // Burst of many fireworks
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const container = Math.random() > 0.5 ? leftFireworksContainer : rightFireworksContainer
        launchFirework(container)
      }, i * 200)
    }

    // Temporarily increase the frequency of fireworks
    const intensifiedInterval = setInterval(() => {
      const container = Math.random() > 0.5 ? leftFireworksContainer : rightFireworksContainer
      launchFirework(container)
    }, 300)

    // Return to normal frequency after 10 seconds
    setTimeout(() => {
      clearInterval(intensifiedInterval)
    }, 10000)

    // Burst of many fireworks
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        const targetX = Math.random() * canvas.width
        const targetY = (Math.random() * canvas.height) / 2
        launchFireworkCanvas(targetX, targetY)
      }, i * 100)
    }
  }

  // Start a fireworks show
  /*function startFireworksShow() {
    // Initial burst of fireworks
    for (let i = 0; i < 10; i++) {
      setTimeout(() => {
        launchFirework(Math.random() * canvas.width, (Math.random() * canvas.height) / 2)
      }, i * 300)
    }

    // Continue with periodic fireworks
    const fireworksInterval = setInterval(() => {
      launchFirework(Math.random() * canvas.width, (Math.random() * canvas.height) / 2)
    }, 800)

    // Stop after 15 seconds
    setTimeout(() => {
      clearInterval(fireworksInterval)
    }, 15000)
  }*/

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        microphone = audioContext.createMediaStreamSource(stream)
        microphone.connect(analyser)
        analyser.fftSize = 256
        setInterval(blowOutCandles, 200)
      })
      .catch((err) => {
        console.log("Unable to access microphone: " + err)
      })
  } else {
    console.log("getUserMedia not supported on your browser!")
  }

  // Launch a welcome firework
  /*setTimeout(() => {
    launchFirework(canvas.width / 2, canvas.height / 3)
  }, 1000)*/

  // Start continuous fireworks immediately
  startContinuousFireworks()
})

// confetti variable declaration
let confettiLib

function triggerConfetti() {
  confettiLib = confettiLib || (() => {}) // fallback in case the library isn't loaded
  confettiLib({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

function endlessConfetti() {
  const duration = 15 * 1000
  const end = Date.now() + duration
  ;(function frame() {
    confettiLib = confettiLib || (() => {}) // fallback in case the library isn't loaded
    confettiLib({
      particleCount: 50,
      spread: 90,
      origin: { y: 0 },
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

document.addEventListener("DOMContentLoaded", () => {
  const cake = document.querySelector(".cake")
  const candleCountDisplay = document.getElementById("candleCount")
  const leftFireworksContainer = document.getElementById("leftFireworks")
  const rightFireworksContainer = document.getElementById("rightFireworks")
  const candles = []
  let audioContext
  let analyser
  let microphone
  const audio = new Audio("hbd.mp3")
  let fireworksInterval
  let isFireworksActive = false

  function updateCandleCount() {
    const activeCandles = candles.filter((candle) => !candle.classList.contains("out")).length
    candleCountDisplay.textContent = activeCandles
  }

  function addCandle(left, top) {
    const candle = document.createElement("div")
    candle.className = "candle"
    candle.style.left = left + "px"
    candle.style.top = top + "px"

    const flame = document.createElement("div")
    flame.className = "flame"
    candle.appendChild(flame)

    cake.appendChild(candle)
    candles.push(candle)
    updateCandleCount()
  }

  cake.addEventListener("click", (event) => {
    const rect = cake.getBoundingClientRect()
    const left = event.clientX - rect.left
    const top = event.clientY - rect.top
    addCandle(left, top)
  })

  function isBlowing() {
    const bufferLength = analyser.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyser.getByteFrequencyData(dataArray)

    let sum = 0
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i]
    }
    const average = sum / bufferLength

    return average > 50 //ETO CHANGEEEEEE
  }

  function blowOutCandles() {
    let blownOut = 0

    // Only check for blowing if there are candles and at least one is not blown out
    if (candles.length > 0 && candles.some((candle) => !candle.classList.contains("out"))) {
      if (isBlowing()) {
        candles.forEach((candle) => {
          if (!candle.classList.contains("out") && Math.random() > 0.5) {
            candle.classList.add("out")
            blownOut++
          }
        })
      }

      if (blownOut > 0) {
        updateCandleCount()
      }

      // If all candles are blown out, trigger confetti after a small delay
      if (candles.every((candle) => candle.classList.contains("out"))) {
        setTimeout(() => {
          triggerConfetti()
          intensifyFireworks() // Intensify the fireworks show
          audio.play()
        }, 200)
      }
    }
  }

  // Fireworks functions
  function createFireworkParticle(x, y, color) {
    const particle = document.createElement("div")
    particle.className = "firework-particle"
    particle.style.left = x + "px"
    particle.style.top = y + "px"
    particle.style.backgroundColor = color

    // Random direction
    const angle = Math.random() * Math.PI * 2
    const speed = 2 + Math.random() * 3
    const distance = 30 + Math.random() * 70

    // Set the animation
    particle.animate(
      [
        {
          transform: "translate(0, 0) scale(1)",
          opacity: 1,
        },
        {
          transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(0)`,
          opacity: 0,
        },
      ],
      {
        duration: 1000 + Math.random() * 500,
        easing: "cubic-bezier(0.1, 0.8, 0.2, 1)",
      },
    )

    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle)
      }
    }, 1500)

    return particle
  }

  function explodeFirework(x, y, container) {
    const colors = ["#ff5c8a", "#ffb3c6", "#ff8fab", "#fb6f92", "#ff477e", "#ff85a1", "#ff99ac"]
    const firework = document.createElement("div")
    firework.className = "firework"
    firework.style.left = x + "px"
    firework.style.top = y + "px"
    firework.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)]
    container.appendChild(firework)

    // Create particles
    const particleCount = 30 + Math.floor(Math.random() * 20)
    for (let i = 0; i < particleCount; i++) {
      const color = colors[Math.floor(Math.random() * colors.length)]
      const particle = createFireworkParticle(x, y, color)
      container.appendChild(particle)
    }

    // Remove the firework center after animation
    setTimeout(() => {
      if (firework.parentNode) {
        firework.parentNode.removeChild(firework)
      }
    }, 1000)
  }

  function launchRocket(container, callback) {
    const rocket = document.createElement("div")
    rocket.className = "rocket"

    // Random horizontal position within the container
    const leftPos = 10 + Math.random() * 80
    rocket.style.left = leftPos + "px"

    container.appendChild(rocket)

    // When rocket reaches the top, explode
    setTimeout(() => {
      if (rocket.parentNode) {
        const rect = rocket.getBoundingClientRect()
        const containerRect = container.getBoundingClientRect()
        const x = leftPos
        const y = 50 + Math.random() * 100 // Explode somewhere in the top half

        rocket.parentNode.removeChild(rocket)
        if (callback) callback(x, y, container)
      }
    }, 1000)
  }

  function launchFirework(container) {
    launchRocket(container, explodeFirework)
  }

  // Start continuous fireworks
  function startContinuousFireworks() {
    isFireworksActive = true

    // Launch fireworks continuously from both sides
    setInterval(() => {
      launchFirework(leftFireworksContainer)
    }, 1200)

    setInterval(() => {
      launchFirework(rightFireworksContainer)
    }, 1500)
  }

  // Intensify fireworks when all candles are blown out
  function intensifyFireworks() {
    // Burst of many fireworks
    for (let i = 0; i < 15; i++) {
      setTimeout(() => {
        const container = Math.random() > 0.5 ? leftFireworksContainer : rightFireworksContainer
        launchFirework(container)
      }, i * 200)
    }

    // Temporarily increase the frequency of fireworks
    const intensifiedInterval = setInterval(() => {
      const container = Math.random() > 0.5 ? leftFireworksContainer : rightFireworksContainer
      launchFirework(container)
    }, 300)

    // Return to normal frequency after 10 seconds
    setTimeout(() => {
      clearInterval(intensifiedInterval)
    }, 10000)
  }

  if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new (window.AudioContext || window.webkitAudioContext)()
        analyser = audioContext.createAnalyser()
        microphone = audioContext.createMediaStreamSource(stream)
        microphone.connect(analyser)
        analyser.fftSize = 256
        setInterval(blowOutCandles, 200)
      })
      .catch((err) => {
        console.log("Unable to access microphone: " + err)
      })
  } else {
    console.log("getUserMedia not supported on your browser!")
  }

  // Start continuous fireworks immediately when page loads
  startContinuousFireworks()
})

// confetti variable declaration
let confetti

function triggerConfetti() {
  confetti = confetti || (() => {}) // fallback in case the library isn't loaded
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
  })
}

function endlessConfetti() {
  const duration = 15 * 1000
  const end = Date.now() + duration
  ;(function frame() {
    confetti = confetti || (() => {}) // fallback in case the library isn't loaded
    confetti({
      particleCount: 50,
      spread: 90,
      origin: { y: 0 },
    })

    if (Date.now() < end) {
      requestAnimationFrame(frame)
    }
  })()
}

