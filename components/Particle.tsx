
import React from 'react';
import { Particle } from '../types';

interface ParticleProps {
    particle: Particle;
}

const ParticleComponent: React.FC<ParticleProps> = ({ particle }) => {
    return (
        <div
            className="absolute rounded-full sparkle"
            style={{
                left: particle.x,
                top: particle.y,
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
            }}
        />
    );
};

export default ParticleComponent;
