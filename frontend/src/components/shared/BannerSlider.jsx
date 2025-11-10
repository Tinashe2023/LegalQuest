// frontend/src/components/shared/BannerSlider.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play } from 'lucide-react';

// Import banner images
import banner1 from '../../assets/banners/Hindustan.jpg';
import banner2 from '../../assets/banners/OperationSindoor.jpg';
import banner3 from '../../assets/banners/PrimeModi.jpg';
import banner4 from '../../assets/banners/Student.jpg';

const BannerSlider = ({ 
  slides = [], 
  autoplayInterval = 5000,
  showControls = true 
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Default slides using actual banner images
  const defaultSlides = [
    {
      imageUrl: banner1,
      alt: 'Hindustan - Legal Education',
      caption: 'Learn Your Constitutional Rights Through Interactive Games',
      link: null
    },
    {
      imageUrl: banner2,
      alt: 'Operation Sindoor - Legal Awareness',
      caption: 'Master Fundamental Rights with Fun Learning Activities',
      link: null
    },
    {
      imageUrl: banner3,
      alt: 'Prime Minister Modi - Legal Education Initiative',
      caption: 'Play Games, Earn Badges, Build Your Legal Knowledge',
      link: null
    },
    {
      imageUrl: banner4,
      alt: 'Student Learning - Constitutional Rights',
      caption: 'Empower Yourself with Knowledge of Your Fundamental Rights',
      link: null
    }
  ];

  const displaySlides = slides.length > 0 ? slides : defaultSlides;

  // Autoplay functionality
  useEffect(() => {
    if (isPaused || displaySlides.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
    }, autoplayInterval);

    return () => clearInterval(interval);
  }, [isPaused, autoplayInterval, displaySlides.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + displaySlides.length) % displaySlides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % displaySlides.length);
  };

  const currentSlide = displaySlides[currentIndex];

  return (
    <div 
      className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden rounded-lg shadow-lg"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 300 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -300 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          {currentSlide.link ? (
            <a 
              href={currentSlide.link} 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full h-full"
            >
              <img
                src={currentSlide.imageUrl}
                alt={currentSlide.alt}
                className="w-full h-full object-cover"
              />
            </a>
          ) : (
            <img
              src={currentSlide.imageUrl}
              alt={currentSlide.alt}
              className="w-full h-full object-cover"
            />
          )}
          
          {/* Caption overlay */}
          {currentSlide.caption && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6">
              <p className="text-white text-lg md:text-xl font-semibold">
                {currentSlide.caption}
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {showControls && displaySlides.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6 text-indigo-600" />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6 text-indigo-600" />
          </button>
        </>
      )}

      {/* Autoplay toggle */}
      {displaySlides.length > 1 && (
        <button
          onClick={() => setIsPaused(!isPaused)}
          className="absolute top-4 right-4 bg-white/80 hover:bg-white rounded-full p-2 shadow-lg transition-all z-10"
          aria-label={isPaused ? 'Resume autoplay' : 'Pause autoplay'}
        >
          {isPaused ? (
            <Play className="w-5 h-5 text-indigo-600" />
          ) : (
            <Pause className="w-5 h-5 text-indigo-600" />
          )}
        </button>
      )}

      {/* Dot indicators */}
      {displaySlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {displaySlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex
                  ? 'bg-white w-8'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BannerSlider;

