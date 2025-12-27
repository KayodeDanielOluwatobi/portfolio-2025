'use client'

import { FC, useEffect, useRef, useState } from "react"
import { motion, useSpring, AnimatePresence } from "framer-motion"

interface Position {
  x: number
  y: number
}

export interface SmoothCursorProps {
  cursorColor?: string
  cursorStrokeColor?: string
  cursor?: React.ReactNode
  springConfig?: {
    damping: number
    stiffness: number
    mass: number
    restDelta: number
  }
}

interface DefaultCursorSVGProps {
  fillColor: string
  strokeColor: string
}

interface RadiatingLinesProps {
  strokeColor: string
}

const DefaultCursorSVG: FC<DefaultCursorSVGProps> = ({ fillColor, strokeColor }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{ scale: 0.5 }}
    >
      <g>
        {/* Stroke path - rendered FIRST so fill covers any artifacts */}
        <motion.path
          d="M43.7146 40.6933L28.5431 6.34306C27.3556 3.65428 23.5772 3.69516 22.3668 6.32755L6.57226 40.6778C5.3134 43.4156 7.97238 46.298 10.803 45.2549L24.7662 40.109C25.0221 40.0147 25.2999 40.0156 25.5494 40.1082L39.4193 45.254C42.2261 46.2953 44.9254 43.4347 43.7146 40.6933Z"
          stroke={strokeColor}
          strokeWidth={7}
          fill="none"
          strokeLinejoin="miter"
          strokeLinecap="butt"
          animate={{ stroke: strokeColor }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
        {/* Fill path - rendered SECOND to cover stroke artifacts */}
        <motion.path
          d="M42.6817 41.1495L27.5103 6.79925C26.7269 5.02557 24.2082 5.02558 23.3927 6.79925L7.59814 41.1495C6.75833 42.9759 8.52712 44.8902 10.4125 44.1954L24.3757 39.0496C24.8829 38.8627 25.4385 38.8627 25.9422 39.0496L39.8121 44.1954C41.6849 44.8902 43.4884 42.9759 42.6817 41.1495Z"
          fill={fillColor}
          stroke="none"
          animate={{ fill: fillColor }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </g>
    </svg>
  )
}

// Radiating lines component - appears on link click
const RadiatingLines: FC<RadiatingLinesProps> = ({ strokeColor }) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={50}
      height={54}
      viewBox="0 0 50 54"
      fill="none"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -60%) scale(0.6) rotate(29deg)',
        transformOrigin: 'center center',
        pointerEvents: 'none',
      }}
    >
      <defs>
        <style>{`
          .radiating-line {
            stroke-width: 2.8px;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
          }
        `}</style>
      </defs>
      <g>
        <motion.line
          className="radiating-line"
          x1="10" y1="3" x2="13.5" y2="9"
          stroke={strokeColor}
          initial={{ pathLength: 1, opacity: 0 }}
          animate={{ pathLength: 0, opacity: [0, 1, 1, 0] }}
          transition={{ pathLength: { duration: 0.4, ease: "easeOut" }, opacity: { duration: 0.6, times: [0, 0.3, 1] } }}
        />
        <motion.line
          className="radiating-line"
          x1="25" y1="2" x2="24" y2="8.5"
          stroke={strokeColor}
          initial={{ pathLength: 1, opacity: 0 }}
          animate={{ pathLength: 0, opacity: [0, 1, 1, 0] }}
          transition={{ pathLength: { duration: 0.4, ease: "easeOut", delay: 0.05 }, opacity: { duration: 0.6, times: [0, 0.3, 1], delay: 0.05 } }}
        />
        <motion.line
          className="radiating-line"
          x1="38" y1="12" x2="32" y2="15.5"
          stroke={strokeColor}
          initial={{ pathLength: 1, opacity: 0 }}
          animate={{ pathLength: 0, opacity: [0, 1, 1, 0] }}
          transition={{ pathLength: { duration: 0.4, ease: "easeOut", delay: 0.1 }, opacity: { duration: 0.6, times: [0, 0.3, 1], delay: 0.1 } }}
        />
        <motion.line
          className="radiating-line"
          x1="3" y1="15" x2="9" y2="17"
          stroke={strokeColor}
          initial={{ pathLength: 1, opacity: 0 }}
          animate={{ pathLength: 0, opacity: [0, 1, 1, 0] }}
          transition={{ pathLength: { duration: 0.4, ease: "easeOut", delay: 0.15 }, opacity: { duration: 0.6, times: [0, 0.3, 1], delay: 0.15 } }}
        />
        <motion.line
          className="radiating-line"
          x1="5" y1="30" x2="10" y2="27"
          stroke={strokeColor}
          initial={{ pathLength: 1, opacity: 0 }}
          animate={{ pathLength: 0, opacity: [0, 1, 1, 0] }}
          transition={{ pathLength: { duration: 0.4, ease: "easeOut", delay: 0.2 }, opacity: { duration: 0.6, times: [0, 0.3, 1], delay: 0.2 } }}
        />
      </g>
    </svg>
  )
}

export function SmoothCursor({
  cursorColor = 'black',
  cursorStrokeColor = 'white',
  cursor,
  springConfig = {
    damping: 45,
    stiffness: 400,
    mass: 1,
    restDelta: 0.001,
  },
}: SmoothCursorProps) {
  const [isMoving, setIsMoving] = useState(false)
  const [isHoveringLink, setIsHoveringLink] = useState(false)
  const [showRadiatingLines, setShowRadiatingLines] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [cursorInHeroSection, setCursorInHeroSection] = useState(true)
  const [hasMouseInput, setHasMouseInput] = useState(false)
  
  // 👇 State to track device type
  const [isTouchDevice, setIsTouchDevice] = useState(false)
  // 👇 State to track if we HAVE CHECKED the device type yet
  const [isInputDetermined, setIsInputDetermined] = useState(false)

  const lastMousePos = useRef<Position>({ x: 0, y: 0 })
  const velocity = useRef<Position>({ x: 0, y: 0 })
  const lastUpdateTime = useRef(Date.now())
  const previousAngle = useRef(0)
  const accumulatedRotation = useRef(0)
  const resetRotationTimeout = useRef<NodeJS.Timeout | null>(null)
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null)
  
  const RESET_ROTATION_DELAY = 4000
  const RESET_ANGLE = -17
  const INACTIVITY_DELAY = 20000

  const cursorX = useSpring(0, springConfig)
  const cursorY = useSpring(0, springConfig)
  const rotation = useSpring(0, {
    ...springConfig,
    damping: 60,
    stiffness: 300,
  })
  const scale = useSpring(1, {
    ...springConfig,
    stiffness: 500,
    damping: 35,
  })
  const opacity = useSpring(1, {
    damping: 25,
    stiffness: 300,
  })

  // Smart input detection
  useEffect(() => {
    let mouseMovementDetected = false
    let touchDetected = false
    let inputDecided = false

    const handleMouseMove = (e: MouseEvent) => {
      if (touchDetected) return
      
      if (!mouseMovementDetected && (e.movementX !== 0 || e.movementY !== 0)) {
        mouseMovementDetected = true
        decideInput()
      }
    }

    const handleTouchStart = () => {
      if (!inputDecided) {
        touchDetected = true
        decideInput()
      }
    }

    const decideInput = () => {
      if (inputDecided) return
      inputDecided = true

      if (mouseMovementDetected && !touchDetected) {
        setHasMouseInput(true)
        setIsTouchDevice(false)
        document.body.style.cursor = "none"
      } else {
        setHasMouseInput(false)
        setIsTouchDevice(true)
        document.body.style.cursor = "auto"
      }

      // 👇 CONFIRM WE KNOW THE DEVICE TYPE NOW
      setIsInputDetermined(true)
      cleanup()
    }

    const fallbackTimer = setTimeout(() => {
      if (!inputDecided) {
        const userAgent = navigator.userAgent.toLowerCase()
        const hasTouchPoints = navigator.maxTouchPoints > 0
        const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|windows phone|mobile/.test(userAgent)
        
        if (isMobileUA || (hasTouchPoints && window.innerWidth < 1024)) {
          touchDetected = true
        } else {
          mouseMovementDetected = true
        }
        decideInput()
      }
    }, 500)

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('touchstart', handleTouchStart, { passive: true })

    const cleanup = () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('touchstart', handleTouchStart)
      clearTimeout(fallbackTimer)
      // 👇 RESTORE CURSOR ON UNMOUNT (Cleanup Fix)
      document.body.style.cursor = 'auto'
    }

    return cleanup
  }, [])

  const scheduleRotationReset = () => {
    if (resetRotationTimeout.current) {
      clearTimeout(resetRotationTimeout.current)
    }
    
    resetRotationTimeout.current = setTimeout(() => {
      const currentSpringRotation = rotation.get()
      
      let targetRotation = RESET_ANGLE
      while (targetRotation - currentSpringRotation > 180) {
        targetRotation -= 360
      }
      while (targetRotation - currentSpringRotation < -180) {
        targetRotation += 360
      }
      
      rotation.set(targetRotation)
      accumulatedRotation.current = targetRotation
      previousAngle.current = targetRotation
    }, RESET_ROTATION_DELAY)
  }

  const resetInactivityTimer = () => {
    if (inactivityTimeout.current) {
      clearTimeout(inactivityTimeout.current)
    }
    
    opacity.set(1)
    setIsVisible(true)
    
    inactivityTimeout.current = setTimeout(() => {
      opacity.set(0)
      setIsVisible(false)
    }, INACTIVITY_DELAY)
  }

  useEffect(() => {
    const updateVelocity = (currentPos: Position) => {
      const currentTime = Date.now()
      const deltaTime = currentTime - lastUpdateTime.current

      if (deltaTime > 0) {
        velocity.current = {
          x: (currentPos.x - lastMousePos.current.x) / deltaTime,
          y: (currentPos.y - lastMousePos.current.y) / deltaTime,
        }
      }

      lastUpdateTime.current = currentTime
      lastMousePos.current = currentPos
    }

    const smoothMouseMove = (e: MouseEvent) => {
      const currentPos = { x: e.clientX, y: e.clientY }
      updateVelocity(currentPos)
      resetInactivityTimer()

      const heroSection = document.querySelector('[data-cursor-brand]')
      if (heroSection) {
        const heroRect = heroSection.getBoundingClientRect()
        const heroEndPosition = window.scrollY + heroRect.bottom
        const cursorAbsoluteY = window.scrollY + e.clientY
        setCursorInHeroSection(cursorAbsoluteY < heroEndPosition)
      }

      const speed = Math.sqrt(
        Math.pow(velocity.current.x, 2) + Math.pow(velocity.current.y, 2)
      )

      cursorX.set(currentPos.x)
      cursorY.set(currentPos.y)

      if (speed > 0.1) {
        const currentAngle =
          Math.atan2(velocity.current.y, velocity.current.x) * (180 / Math.PI) +
          90

        let angleDiff = currentAngle - previousAngle.current
        if (angleDiff > 180) angleDiff -= 360
        if (angleDiff < -180) angleDiff += 360
        accumulatedRotation.current += angleDiff
        rotation.set(accumulatedRotation.current)
        previousAngle.current = currentAngle

        scale.set(0.95)
        setIsMoving(true)

        const timeout = setTimeout(() => {
          scale.set(1)
          setIsMoving(false)
          scheduleRotationReset()
        }, 150)

        return () => clearTimeout(timeout)
      }
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const isLink = target.closest('a') !== null
      
      if (isLink) {
        setShowRadiatingLines(true)
        setTimeout(() => {
          setShowRadiatingLines(false)
        }, 800)
        resetInactivityTimer()
      }
    }

    let rafId: number
    const throttledMouseMove = (e: MouseEvent) => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        smoothMouseMove(e)
        rafId = 0
      })
    }

    window.addEventListener("mousemove", throttledMouseMove)
    window.addEventListener("click", handleClick)
    resetInactivityTimer()

    return () => {
      window.removeEventListener("mousemove", throttledMouseMove)
      window.removeEventListener("click", handleClick)
      if (rafId) cancelAnimationFrame(rafId)
      if (resetRotationTimeout.current) clearTimeout(resetRotationTimeout.current)
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current)
    }
  }, [])

  useEffect(() => {
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.closest('a')) {
        setIsHoveringLink(true)
      }
    }
    
    const handleMouseOut = (e: MouseEvent) => {
      const relatedTarget = e.relatedTarget as HTMLElement
      if (!relatedTarget?.closest('a')) {
        setIsHoveringLink(false)
      }
    }

    document.addEventListener('mouseover', handleMouseOver)
    document.addEventListener('mouseout', handleMouseOut)

    return () => {
      document.removeEventListener('mouseover', handleMouseOver)
      document.removeEventListener('mouseout', handleMouseOut)
    }
  }, [])

  // 👇 STOP RENDER:
  // 1. If it's a touch device
  // 2. OR if we haven't figured out the device type yet (prevents peeking)
  if (isTouchDevice || !isInputDetermined) {
    return null
  }

  const cursorElement = cursor || (
    <DefaultCursorSVG 
      fillColor={cursorColor} 
      strokeColor={cursorStrokeColor} 
    />
  )

  return (
    <motion.div
      style={{
        position: "fixed",
        left: cursorX,
        top: cursorY,
        translateX: "-50%",
        translateY: "-50%",
        rotate: rotation,
        scale: scale,
        opacity: opacity,
        zIndex: 100,
        pointerEvents: "none",
        willChange: "transform",
      }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 30,
      }}
    >
      <motion.div
        animate={isHoveringLink ? { scale: [1, 1.15, 1] } : { scale: 1 }}
        transition={isHoveringLink ? { duration: 1.5, repeat: Infinity, ease: "easeInOut" } : { duration: 0.2 }}
      >
        {cursorElement}
      </motion.div>
      
      <AnimatePresence>
        {showRadiatingLines && (
          <RadiatingLines strokeColor={cursorInHeroSection ? cursorColor : '#FFFFFF'} />
        )}
      </AnimatePresence>
    </motion.div>
  )
}