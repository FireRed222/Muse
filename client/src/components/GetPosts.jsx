import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../store/useStore";
import { useQuery } from "@tanstack/react-query";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCards, Navigation } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import Particles from "react-tsparticles";
import { loadStarsPreset } from "tsparticles-preset-stars";
import { loadFull } from "tsparticles";

import WavyText from "./WavyText/WavyText";
import "swiper/css";
import "swiper/css/effect-cards";
import "./GetPosts.css";

const GetPosts = () => {
  const { fetchData } = useStore();
  const { isLoading, error, data } = useQuery({
    queryKey: ["posts"],
    queryFn: () => fetchData("https://muse-backend-hsdb.onrender.com/posts"),
    staleTime: 60 * 1000,
  });

  const analyserRef = useRef(null);
  const dataArrayRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef(null);
  const sizeScaleRef = useRef(1);

  const audioRef = useRef(new Audio());
  const audioCtxRef = useRef(null);
  const sourceNodeRef = useRef(null);
  const navigationPrevRef = useRef(null);
  const navigationNextRef = useRef(null);
  const userPausedRef = useRef(false);

  const swiperRef = useRef(null);

  const [glowColor, setGlowColor] = useState("#ffffff");
  const [glowColorAlt, setGlowColorAlt] = useState("#eeeeee");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPageReady, setIsPageReady] = useState(false);
  const [particlesVisible, setParticlesVisible] = useState(true);
  const [particlesKey, setParticlesKey] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playTransition, setPlayTransition] = useState(false);

  useEffect(() => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext ||
        window.webkitAudioContext)();
      try {
        sourceNodeRef.current = audioCtxRef.current.createMediaElementSource(
          audioRef.current
        );
        sourceNodeRef.current.connect(audioCtxRef.current.destination);
      } catch (err) {
        console.warn("Could not create MediaElementSource:", err);
      }
    }
  }, []);

  const setupAudioAnalyzer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    if (!audioCtxRef.current || !sourceNodeRef.current) return;

    const analyser = audioCtxRef.current.createAnalyser();
    analyser.fftSize = 64;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    try {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current.connect(analyser);
      analyser.connect(audioCtxRef.current.destination);
    } catch (err) {
      console.warn("Audio connection error:", err);
    }

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;

    let lastAvg = 0;

    const animate = () => {
      if (!analyserRef.current || !particlesRef.current) return;

      analyserRef.current.getByteFrequencyData(dataArrayRef.current);
      const avg =
        dataArrayRef.current.reduce((a, b) => a + b, 0) /
        dataArrayRef.current.length;

      const targetScale = 1 + avg / 64;
      const currentScale = sizeScaleRef.current;
      const lerpFactor = 0.12;

      const easedScale =
        currentScale + (targetScale - currentScale) * lerpFactor;
      sizeScaleRef.current = easedScale;

      const isKick = avg > 130 && avg - lastAvg > 20;
      lastAvg = avg;

      const dynamicOpacity = Math.min(1, 0.4 + avg / 256);
      const dynamicGlow = 1 + avg / 50;

      if (particlesRef.current?.setOptions) {
        particlesRef.current.setOptions({
          background: { color: "transparent" },
          fullScreen: { enable: true, zIndex: 0 },
          particles: {
            number: {
              value: 80,
              density: { enable: true, area: 800 },
            },
            color: { value: "#ffffff" },
            shape: { type: "star" },
            opacity: {
              value: 0.8,
              random: true,
              animation: {
                enable: true,
                speed: 0.5,
                minimumValue: 0.3,
                sync: false,
              },
            },
            size: {
              value: { min: 0.5, max: 3 * sizeScaleRef.current },
              animation: {
                enable: true,
                speed: 2,
                minimumValue: 0.3,
                sync: false,
              },
            },
            move: {
              enable: true,
              speed: 0.1,
              random: true,
              direction: "none",
              outModes: { default: "out" },
            },
            shadow: {
              enable: true,
              color: "#ffffff",
              blur: 6 * sizeScaleRef.current,
            },
          },
          detectRetina: true,
          interactivity: {
            detectsOn: "canvas",
            events: {
              onHover: {
                enable: true,
                mode: "repulse",
              },
            },
            modes: {
              repulse: {
                distance: 80,
                duration: 0.4,
                speed: 1,
              },
            },
          },
        });
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  useEffect(() => {
    if (!isLoading && data) {
      const timer = setTimeout(() => setIsPageReady(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [isLoading, data]);

  useEffect(() => {
    const resumeAudioContext = () => {
      if (audioCtxRef.current && audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
      }
    };

    window.addEventListener("click", resumeAudioContext);
    window.addEventListener("touchstart", resumeAudioContext);

    return () => {
      window.removeEventListener("click", resumeAudioContext);
      window.removeEventListener("touchstart", resumeAudioContext);
    };
  }, []);

  useEffect(() => {
    if (data?.length) {
      const { bgColor = ["#ffffff", "#eeeeee"], audio } = data[0];
      setGlowColor(bgColor[0]);
      setGlowColorAlt(bgColor[1]);
      audioRef.current.src = audio;

      if (!userPausedRef.current) {
        const playTimeout = setTimeout(() => {
          audioCtxRef.current.resume().then(() => {
            audioRef.current
              .play()
              .then(() => {
                setupAudioAnalyzer();
                setIsPlaying(true);
                audioRef.current.onended = handleAudioEnd;
              })
              .catch(console.warn);
          });
        }, 1000);

        return () => clearTimeout(playTimeout);
      }
    }
  }, [data]);
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (sourceNodeRef.current) {
        try {
          sourceNodeRef.current.disconnect();
        } catch (e) {
          console.warn("Cleanup error:", e);
        }
      }
    };
  }, []);

  const fadeOutAudio = (audio, callback) => {
    const interval = setInterval(() => {
      if (audio.volume > 0.01) {
        audio.volume = Math.max(0, audio.volume - 0.1);
      } else {
        clearInterval(interval);
        audio.volume = 0;
        callback();
      }
    }, 50);
  };

  const handleAudioEnd = () => {
    if (swiperRef.current) {
      fadeOutAudio(audioRef.current, () => {
        swiperRef.current.slideNext();
      });
    }
  };

  const handlePause = () => {
    setParticlesVisible(false);

    fadeOutAudio(audioRef.current, () => {
      setTimeout(() => {
        userPausedRef.current = true;
        audioRef.current.pause();
        setIsPlaying(false);

        setParticlesVisible(true);
      }, 100);
    });
  };

  const handlePlay = () => {
    setParticlesVisible(false);
    audioRef.current.volume = 1;
    setTimeout(() => {
      userPausedRef.current = false;

      audioCtxRef.current.resume().then(() => {
        audioRef.current
          .play()
          .then(() => {
            setupAudioAnalyzer();
            setIsPlaying(true);
          })
          .catch(console.warn);
      });

      setParticlesVisible(true);
    }, 400);
  };

  const handleSlideChange = (swiper) => {
    const current = data?.[swiper.activeIndex];
    if (!current) return;

    const [color1, color2] = current.bgColor || ["#ffffff", "#eeeeee"];
    setGlowColor(color1);
    setGlowColorAlt(color2);

    setParticlesVisible(false);

    setTimeout(() => {
      setParticlesVisible(true);

      if (!audioRef.current) return;

      fadeOutAudio(audioRef.current, () => {
        try {
          audioRef.current.pause();
          audioRef.current.currentTime = 0;
          audioRef.current.src = current.audio;
          audioRef.current.load();
          audioRef.current.volume = 1;

          if (!userPausedRef.current) {
            audioCtxRef.current.resume().then(() => {
              audioRef.current
                .play()
                .then(() => {
                  setupAudioAnalyzer();
                  setIsPlaying(true);
                })
                .catch(console.warn);
            });
          } else {
            setIsPlaying(false);
          }
        } catch (err) {
          console.warn("Audio error:", err);
        }
      });
    }, 400);
  };

  if (isLoading || !isPageReady) {
    return (
      <motion.div
        className="loading-screen"
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <h1>Loading...</h1>
      </motion.div>
    );
  }

  if (error) return <p>Error: {error.message}</p>;
  if (!data?.length) return <p>No data loaded.</p>;

  return (
    <>
      <motion.div
        className="bg-gradient-layer"
        animate={{
          background: `linear-gradient(135deg, ${glowColor}, ${glowColorAlt})`,
        }}
        transition={{ duration: 1, ease: "easeInOut" }}
      />
      <AnimatePresence mode="wait">
        {playTransition && (
          <motion.div
            key="play-fade"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background: "black",
              zIndex: 1,
              pointerEvents: "none",
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {particlesVisible && (
          <motion.div
            key={`particles`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            style={{ position: "absolute", inset: 0, zIndex: 0 }}
          >
            <Particles
              id="starry-bg"
              init={(engine) => loadStarsPreset(engine)}
              loaded={(container) => {
                particlesRef.current = container;
              }}
              options={{
                background: { color: "transparent" },
                fullScreen: { enable: true, zIndex: 0 },
                particles: {
                  number: { value: 60, density: { enable: true, area: 800 } },
                  color: { value: "#ffffff" },
                  shape: { type: "circle" },
                  opacity: {
                    value: 0.6,
                    random: true,
                    animation: {
                      enable: true,
                      speed: 0.2,
                      minimumValue: 0.4,
                      sync: false,
                    },
                  },
                  size: {
                    value: { min: 0.3, max: 1.1 * sizeScaleRef.current },
                  },
                  move: {
                    enable: true,
                    speed: 0.1,
                    random: true,
                    outModes: { default: "out" },
                  },
                },
                detectRetina: true,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: [0.25, 1, 0.5, 1] }}
        style={{ position: "relative", zIndex: 1 }}
      >
        <WavyText text="Cloudy's Favourite Albums:" glowColor={glowColor} />

        <Swiper
          onSwiper={(swiper) => {
            swiperRef.current = swiper;

            if (
              navigationPrevRef.current &&
              navigationNextRef.current &&
              swiper.navigation
            ) {
              swiper.params.navigation.prevEl = navigationPrevRef.current;
              swiper.params.navigation.nextEl = navigationNextRef.current;
              swiper.navigation.init();
              swiper.navigation.update();
            }
          }}
          effect="cards"
          grabCursor
          modules={[EffectCards, Navigation]}
          className="mySwiper"
          onSlideChange={handleSlideChange}
          navigation={{
            nextEl: ".arrowRight",
            prevEl: ".arrowLeft",
          }}
        >
          {data.map((card, index) => (
            <SwiperSlide key={card.id ?? `fallback-${index}`}>
              <div className="albumCard">
                <h1 className={card.id > 9 ? "moreThanNine" : "number"}>
                  {card.id}
                </h1>
                <img src={card.src} alt={card.title} />

                <div className="text">
                  <h2
                    className={
                      card.title.length > 18 ? "smallText" : "normalText"
                    }
                  >
                    {card.title}
                  </h2>
                  <p>{card.author}</p>
                </div>

                <div className="controls">
                  <div className="controlsContainer">
                    <h2
                      className={
                        card.songTitle.length > 20
                          ? "tinySongTitle"
                          : card.songTitle.length > 9
                          ? "smallSongTitle"
                          : "normalSongTitle"
                      }
                    >
                      {card.songTitle}
                    </h2>
                    <div
                      style={{
                        width: "90%",
                      }}
                    >
                      <motion.div
                        style={{
                          height: "3px",
                          background: "white",
                          borderRadius: "50px",
                          border: "0.4px solid white",
                          position: "relative",
                        }}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={{
                          duration: 2,
                          ease: "easeInOut",
                        }}
                      >
                        <div
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "20%",
                            height: "100%",
                            borderRadius: "50px",
                            opacity: 0.8,
                          }}
                        />
                      </motion.div>
                    </div>

                    <div className="playerBtns">
                      <svg
                        ref={navigationPrevRef}
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="white"
                        viewBox="0 0 16 16"
                        className="arrowLeft"
                      >
                        <path d="M1.5 8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L9 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1.5 7.248a1 1 0 0 0 0 1.505z" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="white"
                        className="playBtn"
                        viewBox="0 0 16 16"
                        style={{
                          display: isPlaying ? "none" : "block",
                        }}
                        onClick={handlePlay}
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z" />
                      </svg>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="white"
                        className="pauseBtn"
                        viewBox="0 0 16 16"
                        style={{
                          display: isPlaying ? "block" : "none",
                        }}
                        onClick={handlePause}
                      >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5" />
                      </svg>
                      <svg
                        ref={navigationNextRef}
                        xmlns="http://www.w3.org/2000/svg"
                        width="40"
                        height="40"
                        fill="white"
                        viewBox="0 0 16 16"
                        className="arrowRight"
                      >
                        <path d="M14.5 7.247l-6.267-3.636C7.693 3.298 7 3.678 7 4.308v2.94L.733 3.612C.193 3.298-.5 3.678-.5 4.308v7.384c0 .63.693 1.01 1.233.696L7 8.753v2.94c0 .63.692 1.01 1.233.696l6.267-3.636a1 1 0 0 0 0-1.505z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </motion.div>
    </>
  );
};

export default GetPosts;
