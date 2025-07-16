export function createQuantumParticle(x: number, y: number) {
  const particle = document.createElement("div");
  particle.className =
    "fixed w-1 h-1 bg-pink-500 rounded-full shadow-[0_0_10px_#FF1493] pointer-events-none z-50 animate-pulse";
  particle.style.left = x + "px";
  particle.style.top = y + "px";
  particle.style.animation = "quantumFade 2s ease-out forwards";
  document.body.appendChild(particle);
  setTimeout(() => particle.remove(), 2000);
}
