import React, { useRef, useEffect, useMemo } from "react";

export class Ball {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  mass: number;
  color: string;

  constructor(
    x: number,
    y: number,
    vx: number,
    vy: number,
    radius: number,
    color: string
  ) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.radius = radius;
    this.mass = Math.PI * radius ** 3;
    this.color = color;
  }
}

const friction = 0.99;
const elasticity = 0.5;

interface TableProps {
  colorBall: string;
  onBallClick: () => void;
}

export const Field: React.FC<TableProps> = ({ colorBall, onBallClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const selectedBall = useRef<Ball | null>(null);
  const selectedBallForColor = useRef<Ball | null>(null);

  const balls = useMemo(() => {
    const numBalls = Math.floor(Math.random() * 20) + 5;
    const arr: Ball[] = [];

    for (let i = 0; i < numBalls; i++) {
      let radius = Math.floor(Math.random() * 20) + 5;
      let x = Math.random() * (1400 - 2 * radius) + radius;
      let y = Math.random() * (600 - 2 * radius) + radius;
      let vx = 0;
      let vy = 0;
      const color = `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      })`;
      arr.push(new Ball(x, y, vx, vy, radius, color));
    }
    return arr;
  }, []);

  const handleCollision = (ball: Ball, otherBall: Ball) => {
    const dx = otherBall.x - ball.x;
    const dy = otherBall.y - ball.y;
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    if (distance <= ball.radius + otherBall.radius) {
      const angle = Math.atan2(dy, dx);
      const overlap = ball.radius + otherBall.radius - distance;
      const ax = overlap * Math.cos(angle);
      const ay = overlap * Math.sin(angle);

      ball.x -= ax / 2;
      ball.y -= ay / 2;
      otherBall.x += ax / 2;
      otherBall.y += ay / 2;

      const normalX = dx / distance;
      const normalY = dy / distance;
      const relativeVelocityX = otherBall.vx - ball.vx;
      const relativeVelocityY = otherBall.vy - ball.vy;
      const dotProduct =
        relativeVelocityX * normalX + relativeVelocityY * normalY;

      const impulse =
        ((1 + elasticity) * dotProduct) / (ball.mass + otherBall.mass);
      ball.vx += impulse * otherBall.mass * normalX;
      ball.vy += impulse * otherBall.mass * normalY;
      otherBall.vx -= impulse * ball.mass * normalX;
      otherBall.vy -= impulse * ball.mass * normalY;
    }
  };

  useEffect(() => {
    if (selectedBallForColor.current && colorBall)
      selectedBallForColor.current.color = colorBall;

    selectedBallForColor.current = null;
  }, [colorBall, selectedBallForColor]);

  useEffect(() => {
    if (canvasRef.current && balls?.length) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      if (!ctx) return;

      const drawBalls = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#71c177";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        for (let i = 0; i < balls.length; i++) {
          const ball = balls[i];
          ctx?.beginPath();
          ctx?.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
          ctx.fillStyle = ball.color;
          ctx?.fill();

          for (let j = i + 1; j < balls.length; j++) {
            handleCollision(ball, balls[j]);
          }

          ball.vx *= friction;
          ball.vy *= friction;

          ball.x += ball.vx;
          ball.y += ball.vy;

          if (ball.x - ball.radius < 0 || ball.x + ball.radius > canvas.width) {
            ball.vx = -ball.vx;
            ball.x += ball.vx;
          }
          if (
            ball.y - ball.radius < 0 ||
            ball.y + ball.radius > canvas.height
          ) {
            ball.vy = -ball.vy;
            ball.y += ball.vy;
          }
        }

        requestAnimationFrame(drawBalls);
      };

      const handleMouseDown = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (let ball of balls) {
          const distance = Math.sqrt(
            (mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2
          );

          if (distance < ball.radius) {
            selectedBall.current = ball;
            break;
          }
        }
      };

      const handleMouseUp = () => {
        selectedBall.current = null;
      };

      const handleMouseMove = (event: MouseEvent) => {
        if (selectedBall.current) {
          const rect = canvas.getBoundingClientRect();
          const mouseX = event.clientX - rect.left;
          const mouseY = event.clientY - rect.top;

          const distance = Math.sqrt(
            (mouseX - selectedBall.current.x) ** 2 +
              (mouseY - selectedBall.current.y) ** 2
          );
          const angle = Math.atan2(
            selectedBall.current.y - mouseY,
            selectedBall.current.x - mouseX
          );
          const speed = distance * 0.1;

          selectedBall.current.vx = Math.cos(angle) * speed;
          selectedBall.current.vy = Math.sin(angle) * speed;
        }
      };

      const handleMouseClick = (event: MouseEvent) => {
        const rect = canvas.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;

        for (let ball of balls) {
          const distance = Math.sqrt(
            (mouseX - ball.x) ** 2 + (mouseY - ball.y) ** 2
          );

          if (distance < ball.radius) {
            selectedBallForColor.current = ball;
            onBallClick();
          }
        }
      };

      drawBalls();

      canvas.addEventListener("mousedown", handleMouseDown);
      canvas.addEventListener("mouseout", handleMouseUp);
      canvas.addEventListener("mouseup", handleMouseUp);
      canvas.addEventListener("mousemove", handleMouseMove);
      canvas.addEventListener("click", handleMouseClick);

      return () => {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseout", handleMouseUp);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleMouseClick);
      };
    }
  }, [canvasRef, balls, onBallClick]);

  return (
    <div className="container">
      <canvas ref={canvasRef} width={1200} height={800} />
    </div>
  );
};
