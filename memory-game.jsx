"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Heart,
  Star,
  Sun,
  Moon,
  Cloud,
  Flower2,
  Trophy,
  PartyPopper,
  Zap,
  Music,
  Plane,
  Car,
  Umbrella,
  Gift,
  Camera,
  Coffee,
  Gamepad2,
  Rocket,
  Palette,
  Bike,
} from "lucide-react"
import confetti from "canvas-confetti"

// Game states
const GAME_STATE = {
  START: "start",
  PLAYING: "playing",
  COMPLETED: "completed",
}

// Difficulty levels
const LEVELS = {
  EASY: {
    name: "Easy",
    pairs: 6,
    grid: "grid-cols-3", // 3x4 grid
    description: "6 pairs - 3×4 grid",
  },
  MEDIUM: {
    name: "Medium",
    pairs: 8,
    grid: "grid-cols-4", // 4x4 grid
    description: "8 pairs - 4×4 grid",
  },
  HARD: {
    name: "Hard",
    pairs: 10,
    grid: "grid-cols-5", // 4×5 grid
    description: "10 pairs - 4×5 grid",
  },
}

// All available icons
const ALL_ICONS = [
  { icon: Heart, color: "text-pink-500" },
  { icon: Star, color: "text-yellow-500" },
  { icon: Sun, color: "text-orange-500" },
  { icon: Moon, color: "text-purple-500" },
  { icon: Cloud, color: "text-blue-500" },
  { icon: Flower2, color: "text-green-500" },
  { icon: Zap, color: "text-yellow-400" },
  { icon: Music, color: "text-violet-500" },
  { icon: Plane, color: "text-sky-500" },
  { icon: Car, color: "text-red-500" },
  { icon: Umbrella, color: "text-indigo-500" },
  { icon: Gift, color: "text-pink-400" },
  { icon: Camera, color: "text-gray-300" },
  { icon: Coffee, color: "text-amber-600" },
  { icon: Gamepad2, color: "text-emerald-500" },
  { icon: Rocket, color: "text-rose-500" },
  { icon: Palette, color: "text-teal-500" },
  { icon: Bike, color: "text-lime-500" },
]

const createCards = (level) => {
  // Get the number of pairs for the selected level
  const numPairs = LEVELS[level].pairs

  // Select the required number of icons
  const selectedIcons = ALL_ICONS.slice(0, numPairs)

  const cards = []

  selectedIcons.forEach(({ icon, color }, index) => {
    cards.push({ id: index * 2, icon, color, isMatched: false }, { id: index * 2 + 1, icon, color, isMatched: false })
  })

  return cards.sort(() => Math.random() - 0.5)
}

export default function MemoryGame() {
  const [gameState, setGameState] = useState(GAME_STATE.START)
  const [level, setLevel] = useState("EASY")
  const [cards, setCards] = useState([])
  const [flippedIndexes, setFlippedIndexes] = useState([])
  const [matches, setMatches] = useState(0)
  const [isChecking, setIsChecking] = useState(false)
  const [moves, setMoves] = useState(0)
  const [startTime, setStartTime] = useState(null)
  const [endTime, setEndTime] = useState(null)

  const startGame = (selectedLevel) => {
    setLevel(selectedLevel)
    setCards(createCards(selectedLevel))
    setFlippedIndexes([])
    setMatches(0)
    setMoves(0)
    setIsChecking(false)
    setStartTime(Date.now())
    setEndTime(null)
    setGameState(GAME_STATE.PLAYING)
  }

  const triggerConfetti = () => {
    const duration = 3000
    const end = Date.now() + duration

    const runConfetti = () => {
      confetti({
        particleCount: 2,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: ["#ec4899", "#8b5cf6", "#3b82f6"],
      })

      confetti({
        particleCount: 2,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: ["#ec4899", "#8b5cf6", "#3b82f6"],
      })

      if (Date.now() < end) {
        requestAnimationFrame(runConfetti)
      }
    }

    runConfetti()
  }

  const handleCardClick = (clickedIndex) => {
    // Prevent clicking if already checking or card is already matched
    if (isChecking || cards[clickedIndex].isMatched) return
    // Prevent clicking if card is already flipped
    if (flippedIndexes.includes(clickedIndex)) return
    // Prevent clicking if two cards are already flipped
    if (flippedIndexes.length === 2) return

    // Add clicked card to flipped cards
    const newFlipped = [...flippedIndexes, clickedIndex]
    setFlippedIndexes(newFlipped)

    // Count as a move if this is the second card flipped
    if (newFlipped.length === 2) {
      setMoves(moves + 1)
    }

    // If we now have two cards flipped, check for a match
    if (newFlipped.length === 2) {
      setIsChecking(true)
      const [firstIndex, secondIndex] = newFlipped
      const firstCard = cards[firstIndex]
      const secondCard = cards[secondIndex]

      if (firstCard.icon === secondCard.icon) {
        // Match found
        setTimeout(() => {
          setCards(
            cards.map((card, index) =>
              index === firstIndex || index === secondIndex ? { ...card, isMatched: true } : card,
            ),
          )
          setFlippedIndexes([])
          const newMatches = matches + 1
          setMatches(newMatches)
          setIsChecking(false)

          // Check for game completion
          if (newMatches === cards.length / 2) {
            setEndTime(Date.now())
            setGameState(GAME_STATE.COMPLETED)
            triggerConfetti()
          }
        }, 500)
      } else {
        // No match - reset after delay
        setTimeout(() => {
          setFlippedIndexes([])
          setIsChecking(false)
        }, 1000)
      }
    }
  }

  const resetGame = () => {
    setGameState(GAME_STATE.START)
  }

  const formatTime = (milliseconds) => {
    if (!milliseconds) return "00:00"
    const totalSeconds = Math.floor(milliseconds / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // Calculate elapsed time
  const getElapsedTime = () => {
    if (gameState === GAME_STATE.COMPLETED && startTime && endTime) {
      return formatTime(endTime - startTime)
    } else if (gameState === GAME_STATE.PLAYING && startTime) {
      return formatTime(Date.now() - startTime)
    }
    return "00:00"
  }

  // Render start screen
  const renderStartScreen = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center space-y-8 p-8 bg-black/60 backdrop-blur-sm rounded-xl shadow-xl border border-purple-500/20 max-w-md w-full"
    >
      <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
        Memory Match Game
      </h1>

      <div className="text-center space-y-2">
        <p className="text-white text-lg">Select Difficulty Level</p>
        <p className="text-gray-400 text-sm">Higher levels have more cards to match</p>
      </div>

      <div className="flex flex-col w-full space-y-4">
        <Button
          onClick={() => startGame("EASY")}
          className="py-6 text-lg bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 border-0 shadow-md shadow-pink-900/20"
        >
          <div className="flex flex-col">
            <span>Easy</span>
            <span className="text-xs opacity-80">6 pairs - 3×4 grid</span>
          </div>
        </Button>

        <Button
          onClick={() => startGame("MEDIUM")}
          className="py-6 text-lg bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-0 shadow-md shadow-purple-900/20"
        >
          <div className="flex flex-col">
            <span>Medium</span>
            <span className="text-xs opacity-80">8 pairs - 4×4 grid</span>
          </div>
        </Button>

        <Button
          onClick={() => startGame("HARD")}
          className="py-6 text-lg bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-0 shadow-md shadow-blue-900/20"
        >
          <div className="flex flex-col">
            <span>Hard</span>
            <span className="text-xs opacity-80">10 pairs - 4×5 grid</span>
          </div>
        </Button>
      </div>
    </motion.div>
  )

  // Render game board
  const renderGameBoard = () => (
    <>
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 text-transparent bg-clip-text">
          Memory Match Game
        </h1>
        <div className="flex justify-center gap-8">
          <div className="px-4 py-2 bg-black/40 rounded-lg border border-purple-500/20">
            <p className="text-white">
              Matches: {matches} of {cards.length / 2}
            </p>
          </div>
          <div className="px-4 py-2 bg-black/40 rounded-lg border border-purple-500/20">
            <p className="text-white">Moves: {moves}</p>
          </div>
          <div className="px-4 py-2 bg-black/40 rounded-lg border border-purple-500/20">
            <p className="text-white">Time: {getElapsedTime()}</p>
          </div>
        </div>
      </div>

      <div
        className={`grid ${LEVELS[level].grid} gap-3 md:gap-4 p-4 md:p-6 rounded-xl bg-black/40 backdrop-blur-sm border border-purple-500/20`}
      >
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            initial={{ rotateY: 0 }}
            animate={{
              rotateY: card.isMatched || flippedIndexes.includes(index) ? 180 : 0,
            }}
            transition={{ duration: 0.3 }}
            className="perspective-1000"
          >
            <Card
              className={`relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 cursor-pointer transform-style-3d transition-all duration-300 ${
                card.isMatched
                  ? "bg-purple-900/40 border-purple-500/40"
                  : flippedIndexes.includes(index)
                    ? "bg-purple-800/40 border-purple-400/40"
                    : "bg-black/60 border-purple-800/40 hover:border-purple-600/60 hover:bg-black/80"
              }`}
              onClick={() => handleCardClick(index)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-purple-500/5 to-pink-500/5" />
              <AnimatePresence>
                {(card.isMatched || flippedIndexes.includes(index)) && (
                  <motion.div
                    initial={{ opacity: 0, rotateY: 180 }}
                    animate={{ opacity: 1, rotateY: 180 }}
                    exit={{ opacity: 0, rotateY: 180 }}
                    className="absolute inset-0 flex items-center justify-center backface-hidden"
                  >
                    <card.icon
                      className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
                        card.isMatched ? `${card.color} filter drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]` : card.color
                      }`}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
      </div>

      <Button
        onClick={resetGame}
        size="lg"
        className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 border-0 shadow-md shadow-purple-900/20 px-8"
      >
        Back to Menu
      </Button>
    </>
  )

  // Render completion screen
  const renderCompletionScreen = () => (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
    >
      <motion.div
        initial={{ scale: 0.8, y: 20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 15,
          stiffness: 300,
          delay: 0.2,
        }}
        className="bg-black/80 p-8 rounded-xl shadow-2xl border border-purple-500/30 max-w-md w-full mx-4"
      >
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <motion.div
              animate={{
                rotate: [0, 10, -10, 10, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Number.POSITIVE_INFINITY,
                repeatDelay: 1,
              }}
            >
              <Trophy className="w-20 h-20 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.5)]" />
            </motion.div>
          </div>

          <h2 className="text-3xl font-bold text-white">Congratulations!</h2>

          <div className="space-y-4">
            <p className="text-gray-300">You've completed the {LEVELS[level].name} level!</p>

            <div className="bg-purple-900/20 rounded-lg p-4 space-y-2 border border-purple-500/30">
              <p className="text-gray-300 text-sm flex justify-between">
                <span>Difficulty:</span>
                <span className="font-medium text-purple-400">{LEVELS[level].name}</span>
              </p>
              <p className="text-gray-300 text-sm flex justify-between">
                <span>Moves:</span>
                <span className="font-medium text-purple-400">{moves}</span>
              </p>
              <p className="text-gray-300 text-sm flex justify-between">
                <span>Time:</span>
                <span className="font-medium text-purple-400">{getElapsedTime()}</span>
              </p>
            </div>
          </div>

          <div className="flex flex-col space-y-3 pt-4">
            <Button
              onClick={() => startGame(level)}
              size="lg"
              className="bg-gradient-to-r from-pink-600 to-pink-700 hover:from-pink-500 hover:to-pink-600 border-0 shadow-md shadow-pink-900/20 flex items-center justify-center gap-2"
            >
              <PartyPopper className="w-5 h-5" />
              Play Again (Same Level)
            </Button>

            <Button
              onClick={resetGame}
              variant="outline"
              size="lg"
              className="border-purple-700 text-purple-300 hover:bg-purple-900/30 hover:border-purple-500 hover:text-purple-200"
            >
              Back to Menu
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 space-y-8 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900 via-gray-900 to-black">
      <AnimatePresence mode="wait">
        {gameState === GAME_STATE.START && renderStartScreen()}
        {gameState === GAME_STATE.PLAYING && renderGameBoard()}
        {gameState === GAME_STATE.COMPLETED && renderCompletionScreen()}
      </AnimatePresence>
    </div>
  )
}

