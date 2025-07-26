"use client";

import { useEffect, useState } from "react";

interface Star {
  id: number;
  x: number;
  y: number;
  size: 'small' | 'medium' | 'large';
  delay: number;
}

interface ShootingStar {
  id: number;
  startX: number;
  startY: number;
  delay: number;
}

interface Planet {
  id: number;
  x: number;
  y: number;
  type: 'small' | 'medium' | 'large' | 'ringed';
  delay: number;
}

interface Constellation {
  id: number;
  x: number;
  y: number;
  stars: { x: number; y: number }[];
  lines: { x1: number; y1: number; x2: number; y2: number; length: number }[];
}

interface Orbital {
  id: number;
  centerX: number;
  centerY: number;
  radius: number;
  delay: number;
}

export function Stars() {
  const [stars, setStars] = useState<Star[]>([]);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [planets, setPlanets] = useState<Planet[]>([]);
  const [constellations, setConstellations] = useState<Constellation[]>([]);
  const [orbitals, setOrbitals] = useState<Orbital[]>([]);

  useEffect(() => {
    // Generate regular stars
    const newStars: Star[] = [];
    for (let i = 0; i < 150; i++) {
      newStars.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() > 0.7 ? 'large' : Math.random() > 0.4 ? 'medium' : 'small',
        delay: Math.random() * 3,
      });
    }
    setStars(newStars);

    // Generate planets
    const newPlanets: Planet[] = [];
    for (let i = 0; i < 8; i++) {
      newPlanets.push({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        type: ['small', 'medium', 'large', 'ringed'][Math.floor(Math.random() * 4)] as Planet['type'],
        delay: Math.random() * 5,
      });
    }
    setPlanets(newPlanets);

    // Generate constellations
    const generateConstellation = (id: number, centerX: number, centerY: number): Constellation => {
      const starCount = 4 + Math.floor(Math.random() * 4);
      const stars = [];
      const lines = [];

      for (let i = 0; i < starCount; i++) {
        const angle = (i / starCount) * Math.PI * 2 + Math.random() * 0.5;
        const distance = 3 + Math.random() * 7;
        stars.push({
          x: centerX + Math.cos(angle) * distance,
          y: centerY + Math.sin(angle) * distance,
        });
      }

      // Connect some stars with lines
      for (let i = 0; i < stars.length - 1; i++) {
        if (Math.random() > 0.4) {
          const star1 = stars[i];
          const star2 = stars[i + 1];
          const length = Math.sqrt(Math.pow(star2.x - star1.x, 2) + Math.pow(star2.y - star1.y, 2));
          lines.push({
            x1: star1.x,
            y1: star1.y,
            x2: star2.x,
            y2: star2.y,
            length,
          });
        }
      }

      return { id, x: centerX, y: centerY, stars, lines };
    };

    const newConstellations: Constellation[] = [];
    for (let i = 0; i < 5; i++) {
      newConstellations.push(generateConstellation(i, Math.random() * 80 + 10, Math.random() * 80 + 10));
    }
    setConstellations(newConstellations);

    // Generate orbital paths
    const newOrbitals: Orbital[] = [];
    for (let i = 0; i < 3; i++) {
      newOrbitals.push({
        id: i,
        centerX: Math.random() * 80 + 10,
        centerY: Math.random() * 80 + 10,
        radius: 30 + Math.random() * 50,
        delay: Math.random() * 10,
      });
    }
    setOrbitals(newOrbitals);

    // Generate shooting stars periodically
    const interval = setInterval(() => {
      const newShootingStar: ShootingStar = {
        id: Date.now(),
        startX: Math.random() * 20,
        startY: Math.random() * 20,
        delay: 0,
      };
      
      setShootingStars(prev => [...prev, newShootingStar]);
      
      setTimeout(() => {
        setShootingStars(prev => prev.filter(star => star.id !== newShootingStar.id));
      }, 8000);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="stars">
      {/* Orbital paths */}
      {orbitals.map((orbital) => (
        <div key={`orbital-${orbital.id}`}>
          <div
            className="orbital-path"
            style={{
              left: `${orbital.centerX}%`,
              top: `${orbital.centerY}%`,
              width: `${orbital.radius}px`,
              height: `${orbital.radius}px`,
              transform: 'translate(-50%, -50%)',
              animationDelay: `${orbital.delay}s`,
            }}
          />
          <div
            className="orbital-object"
            style={{
              left: `${orbital.centerX}%`,
              top: `${orbital.centerY}%`,
              '--orbit-radius': `${orbital.radius / 2}px`,
              animationDelay: `${orbital.delay}s`,
            } as React.CSSProperties}
          />
        </div>
      ))}

      {/* Constellations */}
      {constellations.map((constellation) => (
        <div
          key={`constellation-${constellation.id}`}
          className="constellation"
          style={{
            left: `${constellation.x}%`,
            top: `${constellation.y}%`,
          }}
        >
          {/* Constellation lines */}
          {constellation.lines.map((line, lineIndex) => (
            <div
              key={`line-${constellation.id}-${lineIndex}`}
              className="constellation-line"
              style={{
                left: `${line.x1}px`,
                top: `${line.y1}px`,
                width: `${line.length}px`,
                transform: `rotate(${Math.atan2(line.y2 - line.y1, line.x2 - line.x1)}rad)`,
                animationDelay: `${lineIndex * 0.2}s`,
              }}
            />
          ))}
          {/* Constellation stars */}
          {constellation.stars.map((star, starIndex) => (
            <div
              key={`const-star-${constellation.id}-${starIndex}`}
              className="constellation-star"
              style={{
                left: `${star.x}px`,
                top: `${star.y}px`,
                animationDelay: `${starIndex * 0.3}s`,
              }}
            />
          ))}
        </div>
      ))}

      {/* Planets */}
      {planets.map((planet) => (
        <div
          key={`planet-${planet.id}`}
          className={`planet planet-${planet.type}`}
          style={{
            left: `${planet.x}%`,
            top: `${planet.y}%`,
            animationDelay: `${planet.delay}s`,
          }}
        />
      ))}

      {/* Regular twinkling stars */}
      {stars.map((star) => (
        <div
          key={star.id}
          className={`star star-${star.size}`}
          style={{
            left: `${star.x}%`,
            top: `${star.y}%`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      
      {/* Shooting stars */}
      {shootingStars.map((shootingStar) => (
        <div
          key={shootingStar.id}
          className="shooting-star"
          style={{
            left: `${shootingStar.startX}%`,
            top: `${shootingStar.startY}%`,
            animationDelay: `${shootingStar.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
