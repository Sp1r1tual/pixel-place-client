import { useEffect } from "react";

interface IUsePixelBackgroundProps {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  pixelCount?: number;
  colors?: string[];
}

const usePixelBackground = ({
  canvasRef,
  pixelCount = 150,
  colors = ["#2563EB", "#22D3EE", "#9333EA", "#4ADE80"],
}: IUsePixelBackgroundProps) => {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    type Pixel = {
      x: number;
      y: number;
      size: number;
      alpha: number;
      speed: number;
      color: string;
      offset: number;
    };

    const pixels: Pixel[] = [];

    for (let i = 0; i < pixelCount; i++) {
      let color: string;

      if (colors.length > 0) {
        color = colors[Math.floor(Math.random() * colors.length)]!;
      } else {
        color = "#2563EB";
      }

      pixels.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 1,
        alpha: Math.random(),
        speed: Math.random() * 0.5 + 0.2,
        color,
        offset: Math.random() * Math.PI * 2,
      });
    }

    let mouseX = 0;
    let mouseY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("resize", handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      pixels.forEach((p) => {
        const dx = (mouseX - width / 2) * 0.02 * p.size;
        const dy = (mouseY - height / 2) * 0.02 * p.size;
        const wave = Math.sin(Date.now() / 1000 + p.offset) * 3;

        ctx.fillStyle = `rgba(${parseInt(p.color.slice(1, 3), 16)},${parseInt(
          p.color.slice(3, 5),
          16,
        )},${parseInt(p.color.slice(5, 7), 16)},${p.alpha})`;
        ctx.fillRect(p.x + dx, p.y + dy + wave, p.size, p.size);

        p.alpha += p.speed * 0.01;
        if (p.alpha > 1) p.alpha = 0;
      });

      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("resize", handleResize);
    };
  }, [canvasRef, pixelCount, colors]);
};

export { usePixelBackground };
