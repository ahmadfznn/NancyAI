"use client";

import { auth, googleProvider } from "@/lib/firebase";
import {
  browserSessionPersistence,
  getRedirectResult,
  onAuthStateChanged,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithRedirect,
} from "firebase/auth";
import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const Login = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [Loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonText, setButtonText] = useState("Initialize Connection");
  const cardRef = useRef<HTMLDivElement | null>(null);
  const particlesRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const createParticles = () => {
      if (!particlesRef.current) return;

      const particleCount = 50;
      const particles: HTMLDivElement[] = [];

      for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className =
          "absolute w-0.5 h-0.5 bg-gradient-to-r from-pink-500 to-pink-300 rounded-full opacity-60";
        particle.style.left = Math.random() * 100 + "%";
        const delay = Math.random() * 8;
        const duration = Math.random() * 3 + 5;
        particle.style.animation = `float ${duration}s linear ${delay}s infinite`;

        particles.push(particle);
        particlesRef.current.appendChild(particle);
      }

      return () => {
        particles.forEach((particle) => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        });
      };
    };

    const cleanup = createParticles();
    return cleanup;
  }, []);

  // Mouse tracking effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;

      const card = cardRef.current as HTMLDivElement;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 20;
      const rotateY = (centerX - x) / 20;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    };

    const handleMouseLeave = () => {
      const card = cardRef.current as HTMLDivElement | null;
      if (card) {
        card.style.transform =
          "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  const handleSubmit = async (e?: React.MouseEvent<HTMLButtonElement>) => {
    if (e) e.preventDefault();
    setLoading(true);
    setButtonText("ESTABLISHING NEURAL LINK...");

    setTimeout(() => {
      setButtonText("CONNECTION ESTABLISHED ✨");
      setTimeout(() => {
        setButtonText("Initialize Connection");
        setLoading(false);
      }, 2000);
    }, 2000);
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement!.style.transform = "scale(1.02)";
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.parentElement!.style.transform = "scale(1)";
  };

  useEffect(() => {
    console.log("🚀 useEffect Called");

    setPersistence(auth, browserSessionPersistence).catch(console.error);

    const handleRedirect = async () => {
      try {
        const result = await getRedirectResult(auth);

        if (!result) {
          console.warn("🛑 getRedirectResult returned null (no login info)");
        } else {
          console.log("✅ Redirect login success:", result.user.email);

          const idToken = await result.user.getIdToken();
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const data = await res.json();
          console.log("🍪 Session response:", data);

          if (data?.success) {
            router.push(`/chat`);
          } else {
            setError("Session creation failed.");
          }
          return;
        }
      } catch (err: any) {
        console.error("🔥 Redirect login error:", err);
        setError(err.message);
      }

      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        if (user) {
          console.log("🙌 User detected via authStateChanged:", user.email);

          const idToken = await user.getIdToken();
          const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ idToken }),
          });

          const data = await res.json();
          console.log("🍪 Session response:", data);

          if (data?.success) {
            router.push(`/chat`);
          } else {
            setError("Session creation failed (authStateChanged).");
          }
        }
        setLoading(false);
      });

      return () => unsubscribe();
    };

    handleRedirect();
  }, []);

  // 🔐 Google Login Trigger
  const loginWithGoogle = async () => {
    setLoading(true);
    setError(null);

    googleProvider.setCustomParameters({
      prompt: "select_account",
    });

    try {
      console.log("🌀 Redirecting to Google login...");
      await signInWithRedirect(auth, googleProvider);
    } catch (err: any) {
      console.error("🔥 signInWithRedirect failed:", err);
      setError(err.message);
    }
  };

  // const loginWithGoogle = async () => {
  //   googleProvider.setCustomParameters({
  //     prompt: "select_account",
  //   });
  //   await signInWithRedirect(auth, googleProvider);

  // console.log("🌀 Trying Google login...");
  // await handleSubmit();
  // setLoading(true);
  // setError(null);

  // try {
  //   googleProvider.setCustomParameters({
  //     prompt: "select_account",
  //   });

  //   const userCred = await signInWithPopup(auth, googleProvider);
  //   console.log("✅ Sign-in success:", userCred);

  //   const idToken = await userCred.user.getIdToken();
  //   console.log("🪪 ID Token:", idToken);

  //   const res = await fetch("/api/login", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ idToken }),
  //   });

  //   const data = await res.json();
  //   console.log("🍪 Session response:", data);

  //   router.push(`/chat/${userCred.user.uid}`);
  // } catch (err: any) {
  //   console.error("🔥 Google login error:", err);
  //   setError(err.message);
  // } finally {
  //   setLoading(false);
  // }
  // };

  const loginWithEmail = async () => {
    await handleSubmit();
    setLoading(true);
    setError(null);
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await userCred.user.getIdToken();
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error("Login failed. Please check your credentials.");
      }
      router.push(`/chat`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style jsx>{`
        @import url("https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;700;900&family=Rajdhani:wght@300;400;500;600;700&display=swap");

        @keyframes float {
          0% {
            transform: translateY(100vh) translateX(0px);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          90% {
            opacity: 0.6;
          }
          100% {
            transform: translateY(-100px) translateX(100px);
            opacity: 0;
          }
        }

        @keyframes gradientShift {
          0%,
          100% {
            opacity: 0.3;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes cardFloat {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-5px);
          }
        }

        @keyframes borderGlow {
          0%,
          100% {
            opacity: 0.5;
          }
          50% {
            opacity: 1;
          }
        }

        @keyframes logoGlow {
          0% {
            filter: drop-shadow(0 0 5px rgba(255, 0, 132, 0.5));
          }
          100% {
            filter: drop-shadow(0 0 20px rgba(255, 77, 166, 0.8));
          }
        }

        @keyframes iconPulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .font-orbitron {
          font-family: "Orbitron", monospace;
        }

        .font-rajdhani {
          font-family: "Rajdhani", sans-serif;
        }

        .gradient-bg {
          background: linear-gradient(
            135deg,
            #0a0a0a 0%,
            #1a0a1a 25%,
            #000510 50%,
            #0f0517 75%,
            #0a0a0a 100%
          );
        }

        .gradient-overlay {
          background: radial-gradient(
              circle at 20% 30%,
              rgba(255, 0, 132, 0.1) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 80% 70%,
              rgba(255, 77, 166, 0.08) 0%,
              transparent 50%
            ),
            radial-gradient(
              circle at 50% 50%,
              rgba(138, 43, 226, 0.05) 0%,
              transparent 70%
            );
          animation: gradientShift 10s ease-in-out infinite;
        }

        .registration-card {
          background: rgba(10, 10, 10, 0.9);
          backdrop-filter: blur(20px) saturate(180%);
          animation: cardFloat 6s ease-in-out infinite;
          position: relative;
        }

        .registration-card::before {
          content: "";
          position: absolute;
          top: -1px;
          left: -1px;
          right: -1px;
          bottom: -1px;
          background: linear-gradient(
            45deg,
            #ff0084,
            transparent,
            #ff4da6,
            transparent
          );
          border-radius: 24px;
          z-index: -1;
          animation: borderGlow 3s ease-in-out infinite;
        }

        .logo-text {
          background: linear-gradient(
            135deg,
            #ff0084 0%,
            #ff4da6 50%,
            #ffffff 100%
          );
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: logoGlow 2s ease-in-out infinite alternate;
        }

        .btn-shine::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(255, 255, 255, 0.2),
            transparent
          );
          transition: left 0.5s;
        }

        .btn-shine:hover::before {
          left: 100%;
        }

        .glow-effect-1 {
          background: radial-gradient(
            circle,
            rgba(255, 0, 132, 0.1) 0%,
            transparent 70%
          );
          animation: float 8s ease-in-out infinite;
        }

        .glow-effect-2 {
          background: radial-gradient(
            circle,
            rgba(255, 77, 166, 0.08) 0%,
            transparent 70%
          );
          animation: float 8s ease-in-out infinite;
          animation-delay: -4s;
        }

        .input-focus:focus + .input-icon {
          color: #ff0084;
          animation: iconPulse 0.6s ease;
        }
      `}</style>

      <div className="gradient-bg w-screen min-h-screen overflow-hidden relative font-rajdhani">
        {/* Animated Background Particles */}
        <div
          ref={particlesRef}
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10"
        />

        {/* Gradient Overlay */}
        <div className="gradient-overlay absolute top-0 left-0 w-full h-full z-10" />

        {/* Glow Effects */}
        <div className="glow-effect-1 absolute top-[10%] left-[10%] w-48 h-48 rounded-full pointer-events-none z-10" />
        <div className="glow-effect-2 absolute top-[60%] right-[10%] w-48 h-48 rounded-full pointer-events-none z-10" />

        {/* Main Container */}
        <div className="flex justify-center items-center min-h-screen p-5 relative z-20">
          <div
            ref={cardRef}
            className="registration-card border border-pink-500/30 rounded-3xl p-10 w-full max-w-md shadow-2xl transition-all duration-300 hover:shadow-pink-500/20 hover:-translate-y-0.5"
          >
            {/* Header */}
            <div className="text-center mb-9">
              <h1 className="logo-text font-orbitron text-4xl font-black mb-2 tracking-wider">
                FANCY AI
              </h1>
              <p className="text-white/80 text-lg font-light tracking-wide mb-1">
                Welcome to the Future
              </p>
              <p className="text-pink-300 text-sm font-medium tracking-wider">
                Unlock the consciousness of tomorrow
              </p>
            </div>

            {/* Form */}
            <div className="space-y-6">
              <div className="relative transition-transform duration-300">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="input-focus w-full pl-12 pr-5 py-4 bg-black/60 border border-pink-300/30 rounded-2xl text-white text-base font-medium placeholder-white/50 outline-none transition-all duration-300 focus:border-pink-500 focus:shadow-lg focus:shadow-pink-500/30 focus:bg-black/80 backdrop-blur-md"
                  placeholder="Neural Link Email Address"
                  required
                />
                <div className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 text-xl transition-all duration-300">
                  📧
                </div>
                <div className="text-red-500 text-sm mt-1">
                  {error && <span>{error}</span>}
                </div>
              </div>

              <div className="relative transition-transform duration-300">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  className="input-focus w-full pl-12 pr-5 py-4 bg-black/60 border border-pink-300/30 rounded-2xl text-white text-base font-medium placeholder-white/50 outline-none transition-all duration-300 focus:border-pink-500 focus:shadow-lg focus:shadow-pink-500/30 focus:bg-black/80 backdrop-blur-md"
                  placeholder="Quantum Security Key"
                  required
                />
                <div className="input-icon absolute left-4 top-1/2 -translate-y-1/2 text-pink-300 text-xl transition-all duration-300">
                  🔐
                </div>
                <div className="text-red-500 text-sm mt-1">
                  {error && <span>{error}</span>}
                </div>
              </div>

              <button
                type="button"
                onClick={loginWithEmail}
                disabled={Loading}
                className={`btn-shine w-full py-4 rounded-2xl text-white text-lg font-semibold tracking-wide uppercase transition-all duration-300 relative overflow-hidden ${
                  Loading
                    ? "bg-gradient-to-r from-green-400 to-blue-400"
                    : "bg-gradient-to-r from-pink-500 to-pink-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-pink-500/40"
                }`}
              >
                {buttonText}
              </button>

              {/* Divider */}
              <div className="flex items-center my-6 text-white/50 text-sm">
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent"></div>
                <span className="px-5 font-light tracking-wide">
                  OR SYNC WITH
                </span>
                <div className="flex-1 h-px bg-gradient-to-r from-transparent via-pink-300/30 to-transparent"></div>
              </div>

              <button
                type="button"
                onClick={loginWithGoogle}
                className="w-full py-4 bg-white/5 border border-white/20 rounded-2xl text-white text-base font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:bg-white/10 hover:border-pink-300/50 hover:-translate-y-0.5 backdrop-blur-md"
              >
                <div className="w-5 h-5 bg-gradient-to-r from-blue-500 via-yellow-500 to-red-500 rounded"></div>
                Neural Sync with Google
              </button>

              {/* Link to Register Page */}
              <div className="text-center mt-4">
                <Link
                  href="/register"
                  className="text-pink-300 hover:underline font-semibold"
                >
                  Don&apos;t have an account? register here
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
