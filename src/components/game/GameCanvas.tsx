import { useEffect, useRef, useState } from "react";
import playerAvatar from "@/assets/player-avatar.png";
import gameBg from "@/assets/game-bg.webp";
import obstacle1 from "@/assets/obstacle-1.jpg";
import obstacle2 from "@/assets/obstacle-2.jpg";
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

interface PipePart {
  x: number;
  y: number;
  width: number;
  height: number;
  passed: boolean;
  obstacleType: number;
  tilt: number;
}

interface PipePair {
  top: PipePart;
  bottom: PipePart;
}

const MEME_TEXTS = ["Modiji OP! 🔥", "Kya baat hai! 💪", "Challl be! 😎", "Jai Hind! 🇮🇳"];

const GameCanvas = ({ onGameOver, onScoreUpdate }: GameCanvasProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const gameStateRef = useRef({
    bird: { x: 100, y: 300, velocity: 0 } as Bird,
    pipes: [] as PipePair[],
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
  const BIRD_SIZE = 70;
  const PIPE_WIDTH = 80;
  const PIPE_GAP = 200;
  const PIPE_SPEED = 5;

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

    let num = Math.floor((Math.random()*3)+1)
    gameOverSoundRef.current = new Audio(`/game-over-${num}.mp3`);
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
        gameStateRef.current.pipes = []; // Start with no pipes
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
        if (state.frame % 75 === 0) {
          const gapY = Math.random() * (canvas.height - PIPE_GAP - 200) + 100;
          const tilt = (Math.random() - 0.5) * 0.5; // Random tilt between -0.25 and 0.25 radians

          const topPipe: PipePart = {
            x: canvas.width,
            y: 0,
            width: PIPE_WIDTH,
            height: gapY,
            passed: false,
            obstacleType: Math.random() < 0.5 ? 1 : 2,
            tilt: tilt,
          };

          const bottomPipe: PipePart = {
            x: canvas.width,
            y: gapY + PIPE_GAP,
            width: PIPE_WIDTH,
            height: canvas.height - gapY - PIPE_GAP,
            passed: false,
            obstacleType: Math.random() < 0.5 ? 1 : 2,
            tilt: tilt,
          };

          state.pipes.push({ top: topPipe, bottom: bottomPipe });
        }

        // Update pipes
        state.pipes.forEach((pipePair) => {
          pipePair.top.x -= PIPE_SPEED;
          pipePair.bottom.x -= PIPE_SPEED;

          // Check if bird passed pipe
          if (!pipePair.top.passed && pipePair.top.x + pipePair.top.width < state.bird.x) {
            pipePair.top.passed = true;
            pipePair.bottom.passed = true; // Mark both as passed
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
        state.pipes = state.pipes.filter(pipePair => pipePair.top.x + PIPE_WIDTH > 0 && pipePair.bottom.x + PIPE_WIDTH > 0);

        // Collision detection & Drawing
        const birdRect = { x: state.bird.x, y: state.bird.y, width: BIRD_SIZE, height: BIRD_SIZE };

        // Check ground/ceiling collision
        if (birdRect.y <= 0 || birdRect.y + birdRect.height >= canvas.height) {
          state.gameOver = true;
          bgMusicRef.current?.pause();
          gameOverSoundRef.current?.play().catch(e => console.log("Sound play failed:", e));
          onGameOver(state.score);
        }

        // Pipe collision and drawing
        state.pipes.forEach((pipePair) => {
          const { top, bottom } = pipePair;

          // --- Helper function for rotated rectangle collision ---
          const checkCollision = (pipe: PipePart) => {
            const birdCircle = { x: state.bird.x + BIRD_SIZE / 2, y: state.bird.y + BIRD_SIZE / 2, radius: BIRD_SIZE / 2 };

            // Transform bird's center to the pipe's coordinate system
            const translatedBirdX = birdCircle.x - (pipe.x + pipe.width / 2);
            const translatedBirdY = birdCircle.y - (pipe.y + pipe.height / 2);

            const rotatedBirdX = translatedBirdX * Math.cos(-pipe.tilt) - translatedBirdY * Math.sin(-pipe.tilt);
            const rotatedBirdY = translatedBirdX * Math.sin(-pipe.tilt) + translatedBirdY * Math.cos(-pipe.tilt);

            // Find the closest point on the pipe's rectangle to the bird's center
            const closestX = Math.max(-pipe.width / 2, Math.min(rotatedBirdX, pipe.width / 2));
            const closestY = Math.max(-pipe.height / 2, Math.min(rotatedBirdY, pipe.height / 2));

            // Calculate the distance between the closest point and the bird's center
            const distanceX = rotatedBirdX - closestX;
            const distanceY = rotatedBirdY - closestY;
            const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

            return distanceSquared < (birdCircle.radius * birdCircle.radius);
          };

          if (checkCollision(top) || checkCollision(bottom)) {
            state.gameOver = true;
            bgMusicRef.current?.pause();
            gameOverSoundRef.current?.play().catch(e => console.log("Sound play failed:", e));
            onGameOver(state.score);
          }

          // --- Draw Pipes ---
          const drawPipe = (pipe: PipePart, isTop: boolean) => {
            const obstacleImg = pipe.obstacleType === 1 ? obstacle1Ref.current : obstacle2Ref.current;
            if (!obstacleImg?.complete) {
              // Fallback to colored rectangles
              ctx.fillStyle = "#228B22";
              ctx.save();
              ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
              ctx.rotate(pipe.tilt);
              ctx.fillRect(-pipe.width / 2, -pipe.height / 2, pipe.width, pipe.height);
              ctx.restore();
              return;
            }

            ctx.save();
            ctx.translate(pipe.x + pipe.width / 2, pipe.y + pipe.height / 2);
            ctx.rotate(pipe.tilt);
            
            if (isTop) {
                ctx.scale(1, -1); // Flip top pipe
            }

            ctx.drawImage(
              obstacleImg,
              -pipe.width / 2,
              -pipe.height / 2,
              pipe.width,
              pipe.height
            );
            ctx.restore();
          };

          drawPipe(top, true);
          drawPipe(bottom, false);
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
