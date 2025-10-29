import { useEffect, useRef, useState } from "react";
import playerAvatar from "@/assets/player-avatar.png";
import { toast } from "sonner";

interface GameCanvasProps {
  onGameOver: (score: number) => void;
  onScoreUpdate: (score: number) => void;
}

interface Bird {
  x: number;
  y: number;
  velocity: number;
}

interface Pipe {
  x: number;
  gapY: number;
  passed: boolean;
}

const MEME_TEXTS = ["Modiji OP! 🔥", "Kya baat hai! 💪", "Challl be! 😎", "Jai Hind! 🇮🇳"];

const GameCanvas = ({ onGameOver, onScoreUpdate }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({
    bird: { x: 100, y: 300, velocity: 0 } as Bird,
    pipes: [] as Pipe[],
    score: 0,
    gameOver: false,
    frame: 0,
  });
  const imageRef = useRef<HTMLImageElement | null>(null);

  // Game constants
  const GRAVITY = 0.4;
  const JUMP_STRENGTH = -8;
  const BIRD_SIZE = 50;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 200;
  const PIPE_SPEED = 3;

  useEffect(() => {
    const img = new Image();
    img.src = playerAvatar;
    imageRef.current = img;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = Math.min(800, container.clientWidth);
        canvas.height = 600;
      }
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleInput = () => {
      if (!gameStarted) {
        setGameStarted(true);
        gameStateRef.current.pipes = [{ x: canvas.width, gapY: 250, passed: false }];
      }
      if (!gameStateRef.current.gameOver) {
        gameStateRef.current.bird.velocity = JUMP_STRENGTH;
      }
    };

    const handleClick = () => handleInput();
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp") {
        e.preventDefault();
        handleInput();
      }
    };

    canvas.addEventListener("click", handleClick);
    document.addEventListener("keydown", handleKeyPress);

    let animationFrameId: number;

    const gameLoop = () => {
      if (!ctx || !canvas) return;

      const state = gameStateRef.current;

      // Clear canvas
      ctx.fillStyle = "#87CEEB";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      if (!gameStarted) {
        // Draw start screen
        ctx.fillStyle = "#FF6B35";
        ctx.font = "bold 32px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Click or Press Space to Start!", canvas.width / 2, canvas.height / 2);
      } else if (!state.gameOver) {
        state.frame++;

        // Update bird physics
        state.bird.velocity += GRAVITY;
        state.bird.y += state.bird.velocity;

        // Spawn new pipes
        if (state.frame % 120 === 0) {
          const gapY = Math.random() * (canvas.height - PIPE_GAP - 100) + 50;
          state.pipes.push({ x: canvas.width, gapY, passed: false });
        }

        // Update pipes
        state.pipes.forEach((pipe) => {
          pipe.x -= PIPE_SPEED;

          // Check if bird passed pipe
          if (!pipe.passed && pipe.x + PIPE_WIDTH < state.bird.x) {
            pipe.passed = true;
            state.score++;
            onScoreUpdate(state.score);

            // Show meme text occasionally
            if (state.score % 3 === 0) {
              const memeText = MEME_TEXTS[Math.floor(Math.random() * MEME_TEXTS.length)];
              toast(memeText, { duration: 1000 });
            }
          }
        });

        // Remove off-screen pipes
        state.pipes = state.pipes.filter((pipe) => pipe.x > -PIPE_WIDTH);

        // Collision detection
        const birdLeft = state.bird.x;
        const birdRight = state.bird.x + BIRD_SIZE;
        const birdTop = state.bird.y;
        const birdBottom = state.bird.y + BIRD_SIZE;

        // Check ground/ceiling collision
        if (birdTop <= 0 || birdBottom >= canvas.height) {
          state.gameOver = true;
          onGameOver(state.score);
        }

        // Check pipe collision
        state.pipes.forEach((pipe) => {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
              state.gameOver = true;
              onGameOver(state.score);
            }
          }
        });

        // Draw pipes (as cartoon politicians)
        ctx.fillStyle = "#228B22";
        state.pipes.forEach((pipe) => {
          // Top pipe
          ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
          ctx.strokeStyle = "#1a6b1a";
          ctx.lineWidth = 3;
          ctx.strokeRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);

          // Bottom pipe
          ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.gapY - PIPE_GAP);
          ctx.strokeRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.gapY - PIPE_GAP);

          // Add emoji faces on pipes
          ctx.font = "40px Arial";
          ctx.textAlign = "center";
          ctx.fillText("🤓", pipe.x + PIPE_WIDTH / 2, pipe.gapY - 20);
          ctx.fillText("😵", pipe.x + PIPE_WIDTH / 2, pipe.gapY + PIPE_GAP + 40);
        });

        // Draw bird (player avatar)
        if (imageRef.current?.complete) {
          ctx.save();
          ctx.translate(state.bird.x + BIRD_SIZE / 2, state.bird.y + BIRD_SIZE / 2);
          const rotation = Math.min(Math.max(state.bird.velocity * 0.05, -0.5), 0.5);
          ctx.rotate(rotation);
          ctx.drawImage(imageRef.current, -BIRD_SIZE / 2, -BIRD_SIZE / 2, BIRD_SIZE, BIRD_SIZE);
          ctx.restore();
        } else {
          // Fallback if image not loaded
          ctx.fillStyle = "#FF6B35";
          ctx.beginPath();
          ctx.arc(state.bird.x + BIRD_SIZE / 2, state.bird.y + BIRD_SIZE / 2, BIRD_SIZE / 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameId);
      canvas.removeEventListener("click", handleClick);
      document.removeEventListener("keydown", handleKeyPress);
      window.removeEventListener("resize", resizeCanvas);
    };
  }, [gameStarted, onGameOver, onScoreUpdate]);

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-card border-4 border-primary">
      <canvas
        ref={canvasRef}
        className="w-full h-auto bg-accent/10 cursor-pointer"
      />
    </div>
  );
};

export default GameCanvas;
