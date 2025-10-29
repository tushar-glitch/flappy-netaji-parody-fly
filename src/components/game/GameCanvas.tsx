import { useEffect, useRef, useState } from "react";
import playerAvatar from "@/assets/player-avatar.png";
import gameBg from "@/assets/game-bg.jpg";
import obstacle1 from "@/assets/obstacle-1.png";
import obstacle2 from "@/assets/obstacle-2.png";
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
  const bgImageRef = useRef<HTMLImageElement | null>(null);
  const obstacle1Ref = useRef<HTMLImageElement | null>(null);
  const obstacle2Ref = useRef<HTMLImageElement | null>(null);
  const bgMusicRef = useRef<HTMLAudioElement | null>(null);
  const gameOverSoundRef = useRef<HTMLAudioElement | null>(null);

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

    const bgImg = new Image();
    bgImg.src = gameBg;
    bgImageRef.current = bgImg;

    const obs1 = new Image();
    obs1.src = obstacle1;
    obstacle1Ref.current = obs1;

    const obs2 = new Image();
    obs2.src = obstacle2;
    obstacle2Ref.current = obs2;

    // Initialize audio
    bgMusicRef.current = new Audio("/game-music.mp3");
    bgMusicRef.current.loop = true;
    bgMusicRef.current.volume = 0.3;

    gameOverSoundRef.current = new Audio("/game-over.mp3");
    gameOverSoundRef.current.volume = 0.5;

    return () => {
      bgMusicRef.current?.pause();
      gameOverSoundRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to fullscreen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const handleInput = () => {
      if (!gameStarted) {
        setGameStarted(true);
        gameStateRef.current.pipes = [{ x: canvas.width, gapY: 250, passed: false }];
        // Start background music
        bgMusicRef.current?.play().catch(e => console.log("Audio play failed:", e));
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

      // Draw background image
      if (bgImageRef.current?.complete) {
        ctx.drawImage(bgImageRef.current, 0, 0, canvas.width, canvas.height);
      } else {
        // Fallback color
        ctx.fillStyle = "#87CEEB";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

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
          bgMusicRef.current?.pause();
          gameOverSoundRef.current?.play().catch(e => console.log("Sound play failed:", e));
          onGameOver(state.score);
        }

        // Check pipe collision
        state.pipes.forEach((pipe) => {
          const pipeLeft = pipe.x;
          const pipeRight = pipe.x + PIPE_WIDTH;

          if (birdRight > pipeLeft && birdLeft < pipeRight) {
            if (birdTop < pipe.gapY || birdBottom > pipe.gapY + PIPE_GAP) {
              state.gameOver = true;
              bgMusicRef.current?.pause();
              gameOverSoundRef.current?.play().catch(e => console.log("Sound play failed:", e));
              onGameOver(state.score);
            }
          }
        });

        // Draw pipes using obstacle images
        state.pipes.forEach((pipe, index) => {
          const obstacleImg = index % 2 === 0 ? obstacle1Ref.current : obstacle2Ref.current;
          
          if (obstacleImg?.complete) {
            // Top obstacle (flipped upside down)
            ctx.save();
            ctx.translate(pipe.x + PIPE_WIDTH / 2, pipe.gapY / 2);
            ctx.scale(1, -1);
            ctx.drawImage(obstacleImg, -PIPE_WIDTH / 2, -pipe.gapY / 2, PIPE_WIDTH, pipe.gapY);
            ctx.restore();

            // Bottom obstacle
            const bottomHeight = canvas.height - pipe.gapY - PIPE_GAP;
            ctx.drawImage(
              obstacleImg,
              pipe.x,
              pipe.gapY + PIPE_GAP,
              PIPE_WIDTH,
              bottomHeight
            );
          } else {
            // Fallback to colored rectangles
            ctx.fillStyle = "#228B22";
            ctx.fillRect(pipe.x, 0, PIPE_WIDTH, pipe.gapY);
            ctx.fillRect(pipe.x, pipe.gapY + PIPE_GAP, PIPE_WIDTH, canvas.height - pipe.gapY - PIPE_GAP);
          }
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
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full cursor-pointer"
    />
  );
};

export default GameCanvas;
