import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Main Component
export default function ValentinesSurprise() {
  const [stage, setStage] = useState('proposal'); // proposal, celebration, choice, gift
  const [selectedGift, setSelectedGift] = useState(null);
  const [noClickCount, setNoClickCount] = useState(0);
  const [noButtonPos, setNoButtonPos] = useState({ x: 0, y: 0 });
  const [openedEnvelopes, setOpenedEnvelopes] = useState(new Set());

  const noTexts = ["No", "Are you sure?", "Really?", "Think again!", "Wrong button!"];

  const handleNoClick = (buttonElement) => {
    const newCount = noClickCount + 1;
    setNoClickCount(newCount);
    
    // Get actual viewport dimensions (accounts for zoom level and device)
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    
    // Measure actual button size if available, otherwise use safe estimate
    let buttonWidth = 200;
    let buttonHeight = 60;
    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      buttonWidth = rect.width;
      buttonHeight = rect.height;
    }
    
    // Calculate safe bounds with padding to ensure button stays fully visible
    const padding = 20;
    const minX = padding;
    const minY = padding;
    const maxX = Math.max(minX, viewportWidth - buttonWidth - padding);
    const maxY = Math.max(minY, viewportHeight - buttonHeight - padding);
    
    // Generate random position within safe bounds
    const randomX = minX + Math.random() * (maxX - minX);
    const randomY = minY + Math.random() * (maxY - minY);
    
    // Clamp to ensure it's within bounds (double-check)
    setNoButtonPos({
      x: Math.max(minX, Math.min(maxX, randomX)),
      y: Math.max(minY, Math.min(maxY, randomY))
    });
  };

  const handleYesClick = () => {
    setStage('celebration');
    setTimeout(() => {
      setStage('choice');
    }, 4000);
  };

  const handleEnvelopeClick = (giftIndex) => {
    setSelectedGift(giftIndex);
    setStage('gift');
  };

  // const handleBackToEnvelopes = () => {
  //   // Mark the selected gift envelope as opened and change stage
  //   const currentGift = selectedGift;
  //   setSelectedGift(null);
  //   setStage('choice');
  //   // Update opened envelopes after stage change to avoid race conditions
  //   if (currentGift !== null) {
  //     setOpenedEnvelopes(prev => new Set([...prev, currentGift]));
  //   }
  // };

  const handleBackToEnvelopes = () => {
    const giftToMark = selectedGift;
  
    setStage('choice');
  
    if (giftToMark !== null) {
      setOpenedEnvelopes(prev => new Set([...prev, giftToMark]));
    }
  
    setSelectedGift(null);
  };

  return (
    <div className="min-h-screen w-full overflow-hidden bg-[#D8BFD8] font-serif">
      <AnimatePresence mode="wait">
        {stage === 'proposal' && (
          <ProposalStage
            key="proposal"
            noClickCount={noClickCount}
            noButtonPos={noButtonPos}
            noTexts={noTexts}
            handleNoClick={handleNoClick}
            handleYesClick={handleYesClick}
          />
        )}

        {stage === 'celebration' && (
          <CelebrationStage key="celebration" />
        )}

        {stage === 'choice' && (
          <ChoiceStage
            key="choice"
            handleEnvelopeClick={handleEnvelopeClick}
            openedEnvelopes={openedEnvelopes}
          />
        )}

        {stage === 'gift' && (
          <GiftStage
            key="gift"
            selectedGift={selectedGift}
            handleBackToEnvelopes={handleBackToEnvelopes}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// Stage 1: Proposal
function ProposalStage({ noClickCount, noButtonPos, noTexts, handleNoClick, handleYesClick }) {
  const yesScale = 1 + (noClickCount * 0.4);
  const noButtonRef = useRef(null);

  // Ensure button stays within bounds after position is set
  useEffect(() => {
    if (noClickCount > 0 && noButtonRef.current) {
      const rect = noButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const padding = 20;
      
      let needsUpdate = false;
      let newX = noButtonPos.x;
      let newY = noButtonPos.y;
      
      // Check and correct if button is out of bounds
      if (newX + rect.width > viewportWidth - padding) {
        newX = Math.max(padding, viewportWidth - rect.width - padding);
        needsUpdate = true;
      }
      if (newX < padding) {
        newX = padding;
        needsUpdate = true;
      }
      if (newY + rect.height > viewportHeight - padding) {
        newY = Math.max(padding, viewportHeight - rect.height - padding);
        needsUpdate = true;
      }
      if (newY < padding) {
        newY = padding;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        // Update position to keep button in bounds
        noButtonRef.current.style.left = `${newX}px`;
        noButtonRef.current.style.top = `${newY}px`;
      }
    }
  }, [noClickCount, noButtonPos]);

  const handleNoButtonClick = (e) => {
    handleNoClick(e.currentTarget);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ 
          y: -20 - (noClickCount * 15), 
          opacity: 1 
        }}
        transition={{ delay: 0.2 }}
        className="text-4xl md:text-6xl font-bold text-[#6D28D9] mb-12 text-center"
      >
        Will you be my Valentine?
      </motion.h1>

      <div className="flex gap-6 relative">
        {/* Yes Button */}
        <motion.button
          whileHover={{ scale: yesScale + 0.1 }}
          whileTap={{ scale: yesScale - 0.1 }}
          animate={{ scale: yesScale }}
          onClick={handleYesClick}
          className="px-8 py-4 bg-[#6D28D9] text-white rounded-full font-semibold text-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          Yes! 💜
        </motion.button>

        {/* No Button - Jumpy */}
        <motion.button
          ref={noButtonRef}
          animate={
            noClickCount > 0
              ? {
                  left: `${noButtonPos.x}px`,
                  top: `${noButtonPos.y}px`,
                }
              : {}
          }
          onClick={handleNoButtonClick}
          style={{
            position: noClickCount > 0 ? 'fixed' : 'relative',
            zIndex: 10,
          }}
          className="px-8 py-4 bg-red-500 text-white rounded-full font-semibold text-xl shadow-lg hover:shadow-xl transition-shadow"
        >
          {noTexts[Math.min(noClickCount, noTexts.length - 1)]}
        </motion.button>
      </div>
    </motion.div>
  );
}

// Stage 2: Celebration
function CelebrationStage() {
  return (
    <motion.div
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="fixed inset-0 bg-[#6D28D9] flex items-center justify-center z-50"
    >
      {/* Hearts Rain Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(120)].map((_, i) => {
          // Distribute hearts evenly across the screen width
          const leftPosition = (i / 120) * 100 + (Math.random() - 0.5) * 5; // Even distribution with slight randomness
          const initialX = (leftPosition / 100) * (window.innerWidth || 1920);
          
          return (
            <motion.div
              key={i}
              initial={{ y: -100, x: initialX }}
              animate={{
                y: window.innerHeight + 100,
                x: initialX + (Math.random() - 0.5) * 50, // Slight horizontal drift
              }}
              transition={{
                duration: Math.random() * 3 + 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
              className="absolute text-4xl"
              style={{ left: `${Math.max(0, Math.min(100, leftPosition))}%` }}
            >
              💜
            </motion.div>
          );
        })}
      </div>

      {/* Victory GIF Placeholder */}
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative z-10"
      >
        <img
          src={`${import.meta.env.BASE_URL}celebration.gif`}
          alt="Celebration"
          className="w-64 h-64 md:w-96 md:h-96 object-contain rounded-lg"
        />
      </motion.div>
    </motion.div>
  );
}

// Stage 3: Envelope Choice
function ChoiceStage({ handleEnvelopeClick, openedEnvelopes }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="flex flex-col items-center justify-center min-h-screen p-4"
    >
      <motion.h2
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-5xl font-bold text-[#6D28D9] mb-12 text-center"
        style={{ marginTop: '-20px' }}
      >
        Pick your gift, Darling! 💜
      </motion.h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl">
        {[0, 1, 2].map((index) => (
          <Envelope 
            key={index} 
            index={index} 
            onClick={() => handleEnvelopeClick(index)}
            isOpened={openedEnvelopes.has(index)}
          />
        ))}
      </div>
    </motion.div>
  );
}

// Envelope Component - ENHANCED VERSION
function Envelope({ index, onClick, isOpened }) {
  const labels = ['Bouquet', 'Chocolate', 'Coupons'];
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -8 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className="cursor-pointer"
      style={{ perspective: '1000px' }}
    >
      <div className="relative w-72 h-48">
        {/* Envelope Body */}
        <div className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl" style={{ transformStyle: 'preserve-3d' }}>
          {/* Main envelope rectangle with realistic paper texture */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#7C3AED] via-[#6D28D9] to-[#5B21B6] rounded-2xl">
            {/* Paper texture overlay */}
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.05) 2px, rgba(255,255,255,0.05) 4px)`
            }}></div>
          </div>

          {/* Inner border for depth */}
          <div className="absolute inset-[3px] border-2 border-white/10 rounded-2xl pointer-events-none"></div>

          {/* Diamond pattern background */}
          <svg className="absolute inset-0 w-full h-full opacity-5" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id={`pattern-${index}`} x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="white" opacity="0.3"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#pattern-${index})`}/>
          </svg>

          {/* Envelope label - only visible when opened, with fade-in */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            {isOpened ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="text-center"
              >
                <span className="text-white font-bold text-2xl tracking-wider drop-shadow-lg" style={{
                  textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                }}>
                  {labels[index]}
                </span>
              </motion.div>
            ) : null}
          </div>

          {/* Bottom shadow for 3D depth */}
          <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/20 to-transparent rounded-b-2xl"></div>
        </div>

        {/* Envelope Flap */}
        <motion.div
          className="absolute -top-16 left-0 right-0 z-20"
          animate={!isOpened ? { 
            rotateX: -180,
            y: 10,
            zIndex: 5
          } : {
            rotateX: 0,
            y: 0,
            zIndex: 20
          }}
          transition={{ duration: 0.6, ease: "easeInOut" }}
          style={{ 
            transformStyle: 'preserve-3d',
            transformOrigin: 'bottom center'
          }}
        >
          <svg viewBox="0 0 288 96" className="w-full" style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
            <defs>
              <linearGradient id={`flap-gradient-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#A78BFA" />
                <stop offset="50%" stopColor="#8B5CF6" />
                <stop offset="100%" stopColor="#7C3AED" />
              </linearGradient>
              <linearGradient id={`flap-shadow-${index}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="rgba(0,0,0,0)" />
                <stop offset="100%" stopColor="rgba(0,0,0,0.2)" />
              </linearGradient>
            </defs>
            {/* Main flap triangle */}
            <polygon 
              points="0,96 144,0 288,96" 
              fill={`url(#flap-gradient-${index})`}
            />
            {/* Flap shadow for depth */}
            <polygon 
              points="0,96 144,0 288,96" 
              fill={`url(#flap-shadow-${index})`}
              opacity="0.3"
            />
            {/* Flap border lines for realism */}
            <line x1="0" y1="96" x2="144" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <line x1="288" y1="96" x2="144" y2="0" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
          </svg>
        </motion.div>

        {/* Wax Seal with Heart */}
        <motion.div
          className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-30"
          animate={isHovered && !isOpened ? { 
            scale: [1, 1.15, 1],
            rotate: [0, 5, -5, 0]
          } : {}}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            {/* Glow effect */}
            <motion.div 
              className="absolute inset-0 rounded-full blur-lg"
              animate={{
                opacity: [0.3, 0.6, 0.3],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              style={{
                background: 'radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(139,92,246,0.4) 50%, transparent 70%)'
              }}
            ></motion.div>
            
            {/* Wax seal background */}
            <div className="relative w-16 h-16 rounded-full bg-gradient-to-br from-white to-purple-50 shadow-2xl border-4 border-purple-100 flex items-center justify-center"
              style={{
                boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4), inset 0 2px 4px rgba(255,255,255,0.5)'
              }}
            >
              {/* Inner seal circle */}
              <div className="absolute inset-1 rounded-full bg-gradient-to-br from-purple-50 to-white border border-purple-100"></div>
              
              {/* Heart emoji */}
              <span className="text-3xl relative z-10" style={{
                filter: 'drop-shadow(0 2px 4px rgba(109, 40, 217, 0.3))'
              }}>💜</span>
            </div>

            {/* Seal ribbon effect */}
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-12 h-6 bg-gradient-to-b from-purple-200 to-purple-300 opacity-60 blur-sm" style={{
              clipPath: 'polygon(20% 0%, 80% 0%, 100% 100%, 50% 70%, 0% 100%)'
            }}></div>
          </div>
        </motion.div>

        {/* Decorative corner stamps */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-3 left-3 w-8 h-8 border-2 border-purple-300/30 rounded rotate-45"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border-2 border-purple-300/30 rounded rotate-45"></div>
          <div className="absolute bottom-3 left-3 w-8 h-8 border-2 border-purple-300/30 rounded rotate-45"></div>
          <div className="absolute bottom-3 right-3 w-8 h-8 border-2 border-purple-300/30 rounded rotate-45"></div>
        </div>

        {/* Sparkle effects on hover */}
        {isHovered && !isOpened && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full"
                initial={{ opacity: 0, scale: 0 }}
                animate={{
                  opacity: [0, 1, 0],
                  scale: [0, 1, 0],
                  x: [0, (Math.random() - 0.5) * 100],
                  y: [0, (Math.random() - 0.5) * 100]
                }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2
                }}
                style={{
                  left: '50%',
                  top: '50%',
                  filter: 'blur(1px)'
                }}
              />
            ))}
          </>
        )}
      </div>
    </motion.div>
  );
}

// Stage 4: Gift Views
// function GiftStage({ selectedGift, handleBackToEnvelopes }) {
//   return (
//     <motion.div
//       initial={{ opacity: 0 }}
//       animate={{ opacity: 1 }}
//       exit={{ opacity: 0 }}
//       transition={{ duration: 0.15 }}
//       className="min-h-screen p-4 flex flex-col items-center justify-center"
//     >
//       <motion.button
//         whileHover={{ scale: 1.05 }}
//         whileTap={{ scale: 0.95 }}
//         onClick={handleBackToEnvelopes}
//         className="absolute top-4 left-4 px-6 py-3 bg-[#6D28D9] text-white rounded-full font-semibold shadow-lg z-10"
//       >
//         ← Back
//       </motion.button>

//       {selectedGift === 0 && <BouquetGift />}
//       {selectedGift === 1 && <ChocolateGift />}
//       {selectedGift === 2 && <CouponsGift />}
//     </motion.div>
//   );
// }


// Stage 4: Gift Views
// Stage 4: Gift Views
// Stage 4: Gift Views
function GiftStage({ selectedGift, handleBackToEnvelopes }) {
  // Use a ref to store the last valid selectedGift value
  const currentGiftRef = useRef(selectedGift);
  
  // Only update the ref when selectedGift is not null
  if (selectedGift !== null) {
    currentGiftRef.current = selectedGift;
  }
  
  // Always use the ref value for rendering to maintain content during exit animation
  const giftToRender = currentGiftRef.current;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="min-h-screen p-4 flex flex-col items-center justify-center"
    >
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleBackToEnvelopes}
        className="absolute top-4 left-4 px-6 py-3 bg-[#6D28D9] text-white rounded-full font-semibold shadow-lg z-10"
      >
        ← Back
      </motion.button>

      {selectedGift !== null && giftToRender === 0 && <BouquetGift />}
      {selectedGift !== null && giftToRender === 1 && <ChocolateGift />}
      {selectedGift !== null && giftToRender === 2 && <CouponsGift />}
    </motion.div>
  );
}


// Gift 1: Bouquet with Floating Hearts
function BouquetGift() {
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessages(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const messages = [
    {
      text: "Flowers that will never wither, just like how I feel about you. 💜💜💜",
      position: { left: 'calc(-20% - 50px)', top: '15%' },
      rotation: -8
    },
    {
      text: "Sending you these because I wish I could be there to hand-deliver a real bunch to your doorstep.",
      position: { right: 'calc(-18% - 50px)', bottom: '20%' },
      rotation: 5
    },
    {
      text: "For the girl who makes my world bloom. 💜",
      position: { left: 'calc(50% + 10px)', bottom: 'calc(-15% - 5px)', transform: 'translateX(-50%)' },
      rotation: 0
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <motion.h3
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-[#6D28D9] mb-8"
      >
        A Bouquet for You 💐
      </motion.h3>

      <div className="relative w-full max-w-2xl flex justify-center">
        <div className="relative">
          <img
            src={`${import.meta.env.BASE_URL}bouquet.png`}
            alt="Bouquet"
            className="w-64 h-64 md:w-96 md:h-96 object-contain relative z-10"
          />

          {/* Floating hearts */}
          <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 15 }}>
            {[...Array(15)].map((_, i) => (
              <motion.div
                key={i}
                initial={{ y: 100, opacity: 0 }}
                animate={{
                  y: -200,
                  opacity: [0, 1, 1, 0],
                  x: Math.sin(i) * 50,
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  delay: i * 0.3,
                  ease: "easeOut",
                }}
                className="absolute text-2xl"
                style={{
                  left: `${20 + (i % 5) * 15}%`,
                  bottom: 0,
                }}
              >
                💜
              </motion.div>
            ))}
          </div>

          {/* Messages positioned around the image */}
          <AnimatePresence>
            {showMessages && (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.3, duration: 0.6 }}
                    className="absolute bg-purple-500/20 backdrop-blur-md border border-purple-200 p-2 md:p-3 lg:p-4 rounded-xl z-20 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[250px]"
                    style={{
                      ...message.position,
                      transform: message.position.transform 
                        ? `${message.position.transform} rotate(${message.rotation}deg)` 
                        : `rotate(${message.rotation}deg)`,
                    }}
                  >
                    <p className="text-[#6D28D9] text-xs md:text-sm lg:text-base font-medium text-center">
                      {message.text}
                    </p>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Gift 2: Three.js Purple Glitter Heart
function ChocolateGift() {
  const [showMessages, setShowMessages] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMessages(true);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  const messages = [
    {
      text: "A little something sweet, for someone even sweeter.",
      position: { left: '-22%', top: '25%' },
      rotation: -6
    },
    {
      text: "I couldn't mail you the actual box, so I coded you a heart instead. (Zero calories, 100% love😘).",
      position: { right: '-20%', bottom: '25%' },
      rotation: 7
    },
    {
      text: "Bittersweet because we're apart, but mostly sweet because you're mine. 💕",
      position: { left: '50%', bottom: '-18%', transform: 'translateX(-50%)' },
      rotation: -3
    }
  ];

  return (
    <div className="flex flex-col items-center justify-center w-full px-4">
      <motion.h3
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-[#6D28D9] mb-8"
      >
        Sweet Like Chocolate 🍫
      </motion.h3>

      <div className="relative w-full max-w-2xl flex justify-center">
        <div className="relative w-full aspect-square">
          {/* Glitter Heart background - particles explode first */}
          <div className="w-full h-full absolute inset-0">
            <Canvas camera={{ position: [0, 0, 50], fov: 60 }}>
              <ambientLight intensity={0.5} />
              <pointLight position={[10, 10, 10]} />
              <GlitterHeart />
            </Canvas>
          </div>

          {/* Chocolate image in center - appears after explosion is visible */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, duration: 1.5 }}
            className="absolute inset-0 flex items-center justify-center z-10"
          >
            <img
              src={`${import.meta.env.BASE_URL}Chocolate.png`}
              alt="Chocolate"
              className="w-64 h-64 md:w-96 md:h-96 object-contain"
            />
          </motion.div>

          {/* Messages positioned around the image */}
          <AnimatePresence>
            {showMessages && (
              <>
                {messages.map((message, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.3, duration: 0.6 }}
                    className="absolute bg-purple-500/20 backdrop-blur-md border border-purple-200 p-2 md:p-3 lg:p-4 rounded-xl z-20 max-w-[140px] sm:max-w-[180px] md:max-w-[220px] lg:max-w-[250px]"
                    style={{
                      ...message.position,
                      transform: message.position.transform 
                        ? `${message.position.transform} rotate(${message.rotation}deg)` 
                        : `rotate(${message.rotation}deg)`,
                    }}
                  >
                    <p className="text-[#6D28D9] text-xs md:text-sm lg:text-base font-medium text-center">
                      {message.text}
                    </p>
                  </motion.div>
                ))}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

// Three.js Glitter Heart Component
// function GlitterHeart() {
//   const particlesRef = useRef();
//   const PARTICLE_COUNT = 4000;
//   const phaseRef = useRef(0);
//   const velocitiesRef = useRef([]);
//   const heartTargetsRef = useRef([]);
  
//   // Calculate responsive particle size based on screen width
//   const getParticleSize = () => {
//     const width = window.innerWidth;
//     if (width < 640) {
//       // Mobile
//       return 0.15;
//     } else if (width < 1024) {
//       // Tablet
//       return 0.2;
//     } else {
//       // Desktop
//       return 0.25;
//     }
//   };
  
//   const [particleSize, setParticleSize] = useState(getParticleSize());
  
//   useEffect(() => {
//     const handleResize = () => {
//       setParticleSize(getParticleSize());
//     };
//     window.addEventListener('resize', handleResize);
//     return () => window.removeEventListener('resize', handleResize);
//   }, []);

//   // ❤️ Heart parametric equation
//   function heartShape(t) {
//     const x = 16 * Math.pow(Math.sin(t), 3);
//     const y =
//       13 * Math.cos(t) -
//       5 * Math.cos(2 * t) -
//       2 * Math.cos(3 * t) -
//       Math.cos(4 * t);
//     return new THREE.Vector3(x * 4, y * 4, 0);
//   }

//   // Initialize particles
//   const { positions, colors } = React.useMemo(() => {
//     const positions = new Float32Array(PARTICLE_COUNT * 3);
//     const colors = new Float32Array(PARTICLE_COUNT * 3);
//     const velocities = [];
//     const heartTargets = [];

//     const purpleShades = [
//       new THREE.Color("#9370DB"), // Medium Purple
//       new THREE.Color("#8A2BE2"), // Blue Violet
//       new THREE.Color("#DDA0DD"), // Plum
//       new THREE.Color("#DA70D6"),  // Orchid
//     ];

//     for (let i = 0; i < PARTICLE_COUNT; i++) {
//       // Start at center
//       positions[i * 3] = 0;
//       positions[i * 3 + 1] = 0;
//       positions[i * 3 + 2] = 0;

//       // Random outward explosion velocity
//       const angle = Math.random() * Math.PI * 2;
//       const speed = Math.random() * 4 + 2;

//       velocities.push({
//         x: Math.cos(angle) * speed,
//         y: Math.sin(angle) * speed,
//         z: (Math.random() - 0.5) * 2,
//       });

//       // Random target point on heart
//       const t = Math.random() * Math.PI * 2;
//       heartTargets.push(heartShape(t));

//       // Random purple color
//       const color = purpleShades[Math.floor(Math.random() * purpleShades.length)];
//       colors[i * 3] = color.r;
//       colors[i * 3 + 1] = color.g;
//       colors[i * 3 + 2] = color.b;
//     }

//     velocitiesRef.current = velocities;
//     heartTargetsRef.current = heartTargets;

//     return { positions, colors };
//   }, []);

//   // Phase transitions
//   useEffect(() => {
//     const timer1 = setTimeout(() => (phaseRef.current = 1), 800);
//     const timer2 = setTimeout(() => (phaseRef.current = 2), 1800);
//     return () => {
//       clearTimeout(timer1);
//       clearTimeout(timer2);
//     };
//   }, []);

//   useFrame(() => {
//     if (!particlesRef.current) return;

//     const geometry = particlesRef.current.geometry;
//     const posArray = geometry.attributes.position.array;
//     const velocities = velocitiesRef.current;
//     const heartTargets = heartTargetsRef.current;
//     const phase = phaseRef.current;

//     for (let i = 0; i < PARTICLE_COUNT; i++) {
//       const i3 = i * 3;

//       const px = posArray[i3];
//       const py = posArray[i3 + 1];
//       const pz = posArray[i3 + 2];

//       const vel = velocities[i];

//       if (phase === 0) {
//         // Explosion
//         vel.x *= 0.99;
//         vel.y *= 0.99;
//       }

//       if (phase === 1) {
//         // Circular swirl
//         const angle = 0.02;
//         const cos = Math.cos(angle);
//         const sin = Math.sin(angle);

//         vel.x = vel.x * cos - vel.y * sin;
//         vel.y = vel.x * sin + vel.y * cos;
//       }

//       if (phase === 2) {
//         // Attract to heart
//         const target = heartTargets[i];

//         vel.x += (target.x - px) * 0.02;
//         vel.y += (target.y - py) * 0.02;
//         vel.z += (target.z - pz) * 0.02;

//         vel.x *= 0.92;
//         vel.y *= 0.92;
//         vel.z *= 0.92;
//       }

//       posArray[i3] += vel.x;
//       posArray[i3 + 1] += vel.y;
//       posArray[i3 + 2] += vel.z;
//     }

//     geometry.attributes.position.needsUpdate = true;
//   });

//   // Cleanup on unmount
//   useEffect(() => {
//     return () => {
//       if (particlesRef.current) {
//         particlesRef.current.geometry.dispose();
//         particlesRef.current.material.dispose();
//       }
//     };
//   }, []);

//   return (
//     <points ref={particlesRef}>
//       <bufferGeometry>
//         <bufferAttribute
//           attach="attributes-position"
//           count={PARTICLE_COUNT}
//           array={positions}
//           itemSize={3}
//         />
//         <bufferAttribute
//           attach="attributes-color"
//           count={PARTICLE_COUNT}
//           array={colors}
//           itemSize={3}
//         />
//       </bufferGeometry>
//       <pointsMaterial
//         size={particleSize}
//         vertexColors
//         transparent
//         opacity={0.9}
//         sizeAttenuation
//       />
//     </points>
//   );
// }

// Gift 3: Swipeable Coupons
// function CouponsGift() {
//   const [cards, setCards] = useState([
//     { id: 1, title: "1x Movie Night", emoji: "🎬" },
//     { id: 2, title: "1x Late Night Call (whatever time)", emoji: "📞" },
//     { id: 3, title: "1x Priority Fly-to-Canada Visit (Valid when my bank account agrees)", emoji: "🛩️" },
//     { id: 4, title: "1x Instant Dramatic Win card", emoji: "🙄" },
//     { id: 5, title: "1x Full day to do anything you want", emoji: "🎉" },
//     {id: 6, title: "1x Full Night to do whatever you want", emoji: "😈"}
//   ]);

//   const handleDragEnd = (event, info, cardId) => {
//     if (Math.abs(info.offset.x) > 150) {
//       setCards((prev) => prev.filter((card) => card.id !== cardId));
//     }
//   };

//   return (
//     <div className="flex flex-col items-center justify-center w-full">
//       <motion.h3
//         initial={{ y: -20, opacity: 0 }}
//         animate={{ y: 0, opacity: 1 }}
//         className="text-3xl md:text-4xl font-bold text-[#6D28D9] mb-8"
//       >
//         Kash-back Rewards 🎁
//       </motion.h3>

//       <div className="relative w-80 h-96">
//         {cards.length === 0 ? (
//           <motion.div
//             initial={{ opacity: 0, scale: 0.8 }}
//             animate={{ opacity: 1, scale: 1 }}
//             className="text-center text-[#6D28D9] text-xl"
//           >
//             All claimed! 💜
//           </motion.div>
//         ) : (
//           cards.map((card, index) => (
//             <motion.div
//               key={card.id}
//               drag="x"
//               dragConstraints={{ left: 0, right: 0 }}
//               onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
//               initial={{ scale: 0.95 - index * 0.05, y: index * -10 }}
//               animate={{ scale: 1 - index * 0.05, y: index * -10 }}
//               exit={{ x: 300, opacity: 0, rotate: 20 }}
//               whileDrag={{ scale: 1.05, rotate: 5 }}
//               className="absolute top-0 left-0 right-0 mx-auto w-full h-64 bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
//               style={{ zIndex: cards.length - index }}
//             >
//               <span className="text-6xl mb-4">{card.emoji}</span>
//               <h4 className="text-white text-2xl font-bold text-center">{card.title}</h4>
//               <p className="text-purple-200 text-sm mt-4">Swipe to discard</p>
//             </motion.div>
//           ))
//         )}
//       </div>

//       {cards.length > 0 && (
//         <p className="text-[#6D28D9] text-lg mt-8">
//           {cards.length} reward{cards.length !== 1 ? 's' : ''} remaining
//         </p>
//       )}
//     </div>
//   );
// }

function GlitterHeart() {
  const particlesRef = useRef();
  const PARTICLE_COUNT = 4000;

  const lockedRef = useRef([]);
  const velocitiesRef = useRef([]);
  const startTimeRef = useRef(null);

  // Calculate responsive particle size based on screen width
  const getParticleSize = () => {
    const width = window.innerWidth;
    if (width < 640) {
      // Mobile
      return 0.3;
    } else if (width < 1024) {
      // Tablet
      return 0.4;
    } else {
      // Desktop
      return 0.5;
    }
  };

  const [particleSize, setParticleSize] = useState(getParticleSize());

  useEffect(() => {
    const handleResize = () => {
      setParticleSize(getParticleSize());
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Heart equation - scaled to fit on screen
  function heartShape(t) {
    const x = 16 * Math.pow(Math.sin(t), 3);
    const y =
      13 * Math.cos(t) -
      5 * Math.cos(2 * t) -
      2 * Math.cos(3 * t) -
      Math.cos(4 * t);
    return new THREE.Vector2(x * 1.7, y * 1.7);
  }

  const { positions, colors, heartTargets } = React.useMemo(() => {
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    const colors = new Float32Array(PARTICLE_COUNT * 3);
    const heartTargets = [];
    const velocities = [];
    const locked = [];

    const purpleShades = [
      new THREE.Color("#9370DB"), // Medium Purple - brighter
      new THREE.Color("#8A2BE2"), // Blue Violet - brighter
      new THREE.Color("#DDA0DD"), // Plum - brighter
      new THREE.Color("#DA70D6"), // Orchid - brighter
      new THREE.Color("#BA55D3"), // Medium Orchid - additional purple
      new THREE.Color("#9B59B6"), // Amethyst - additional purple
    ];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Start at center (0, 0, 0)
      positions[i * 3] = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Give each particle random outward explosion velocity from center (slower for longer explosion)
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 1.5 + 0.5;
      velocities.push({ 
        x: Math.cos(angle) * speed, 
        y: Math.sin(angle) * speed 
      });
      locked.push(false);

      const t = Math.random() * Math.PI * 2;
      heartTargets.push(heartShape(t));

      const color =
        purpleShades[Math.floor(Math.random() * purpleShades.length)];

      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
    }

    velocitiesRef.current = velocities;
    lockedRef.current = locked;

    return { positions, colors, heartTargets };
  }, []);

  useFrame((state) => {
    if (!particlesRef.current) return;

    // Track start time
    if (startTimeRef.current === null) {
      startTimeRef.current = state.clock.getElapsedTime();
    }

    const elapsed = state.clock.getElapsedTime() - startTimeRef.current;
    const explosionPhaseDuration = 3.0; // Particles explode for 3 seconds before attraction starts

    const geometry = particlesRef.current.geometry;
    const pos = geometry.attributes.position.array;

    const velocities = velocitiesRef.current;
    const locked = lockedRef.current;

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;

      if (!locked[i]) {
        const px = pos[i3];
        const py = pos[i3 + 1];
        const target = heartTargets[i];

        // Calculate distance to target
        const dx = target.x - px;
        const dy = target.y - py;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only start attracting after explosion phase
        const shouldAttract = elapsed > explosionPhaseDuration;

        // If close enough to target, lock it (smaller threshold so particles get closer)
        if (distance < 3) {
          pos[i3] = target.x;
          pos[i3 + 1] = target.y;
          velocities[i].x = 0;
          velocities[i].y = 0;
          locked[i] = true;
        } else {
          // During explosion phase, just move with velocity and damping
          if (!shouldAttract) {
            // Apply damping during explosion
            velocities[i].x *= 0.99;
            velocities[i].y *= 0.99;
          } else {
            // Apply attraction force toward target (weaker for longer formation time)
            const attractionStrength = 0.02;
            velocities[i].x += dx * attractionStrength;
            velocities[i].y += dy * attractionStrength;

            // Apply damping (less damping = slower deceleration = longer animation)
            velocities[i].x *= 0.98;
            velocities[i].y *= 0.98;
          }

          // Move particle
          pos[i3] += velocities[i].x;
          pos[i3 + 1] += velocities[i].y;
        }
      }
    }

    geometry.attributes.position.needsUpdate = true;
  });

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={PARTICLE_COUNT}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={PARTICLE_COUNT}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={particleSize}
        vertexColors
        transparent
        opacity={1.0}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}


// Gift 3: Swipeable Coupons
// Gift 3: Swipeable Coupons
function CouponsGift() {
  const initialCards = [
    { id: 1, title: "1x Movie Night", emoji: "🎬" },
    { id: 2, title: "1x Late Night Call (whatever time)", emoji: "📞" },
    { id: 3, title: "1x Priority Fly-to-Canada Visit (Valid when my bank account agrees)", emoji: "🛩️" },
    { id: 4, title: "1x Instant Dramatic Win card", emoji: "🙄" },
    { id: 5, title: "1x Full day to do anything you want", emoji: "🎉" },
    { id: 6, title: "1x Full Night to do whatever you want, no complaints", emoji: "😈😘"}
  ];

  const [cards, setCards] = useState(initialCards);

  const handleDragEnd = (event, info, cardId) => {
    if (Math.abs(info.offset.x) > 150) {
      setCards((prev) => prev.filter((card) => card.id !== cardId));
    }
  };

  return (
    <div className="flex flex-col items-center justify-center w-full">
      <motion.h3
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-3xl md:text-4xl font-bold text-[#6D28D9] mb-8"
      >
        Kash-back Rewards 🎁
      </motion.h3>

      <div className="relative w-80 h-96">
        {cards.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center text-[#6D28D9] text-xl"
          >
            All claimed! 💜
          </motion.div>
        ) : (
          <AnimatePresence initial={false}>
            {cards.map((card, index) => (
            <motion.div
              key={card.id}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(e, info) => handleDragEnd(e, info, card.id)}
              initial={{ scale: 0.95 - index * 0.05, y: index * -10 }}
              animate={{ scale: 1 - index * 0.05, y: index * -10 }}
              exit={{ x: 300, opacity: 0, rotate: 20 }}
              whileDrag={{ scale: 1.05, rotate: 5 }}
              className="absolute top-0 left-0 right-0 mx-auto w-full h-64 bg-gradient-to-br from-[#6D28D9] to-[#8B5CF6] rounded-2xl shadow-2xl p-8 flex flex-col items-center justify-center cursor-grab active:cursor-grabbing"
              style={{ zIndex: cards.length - index }}
            >
              <span className="text-6xl mb-4">{card.emoji}</span>
              <h4 className="text-white text-2xl font-bold text-center">{card.title}</h4>
              <p className="text-purple-200 text-sm mt-4">Swipe to discard</p>
            </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {cards.length > 0 && (
        <p className="text-[#6D28D9] text-lg mt-8">
          {cards.length} reward{cards.length !== 1 ? 's' : ''} remaining
        </p>
      )}
    </div>
  );
}