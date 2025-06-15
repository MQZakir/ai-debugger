import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { theme } from '../theme';
import { useTheme } from '../contexts/ThemeContext';

const LogoContainer = styled(motion.div)`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Line = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 1px;
  background: var(--color-accent, ${theme.colors.accent});
  opacity: 0.9;
  transform-origin: center;
`;

const AccentLine = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 0.5px;
  background: var(--color-accent, ${theme.colors.accent});
  opacity: 0.6;
  transform-origin: center;
`;

const AnimatedLogo = ({ size = 160 }: { size?: number }) => {
    const { isDarkMode } = useTheme();
    
    const containerVariants = {
        pulse: {
            scale: [1, 1.25, 1],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const lineVariants = {
        pulse: {
            opacity: [0.9, 0.7, 0.9],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const accentLineVariants = {
        pulse: {
            opacity: [0.6, 0.4, 0.6],
            transition: {
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
            }
        }
    };

    const createMainLines = () => {
        const lineConfigs = [
            // Primary structural lines - creating a dynamic, technical pattern
            { rotation: 0, scale: 0.9 },
            { rotation: 35, scale: 0.7 },
            { rotation: 85, scale: 0.8 },
            { rotation: 125, scale: 0.6 },
            { rotation: 165, scale: 0.75 },
            { rotation: 205, scale: 0.5 },
            { rotation: 245, scale: 0.85 },
            { rotation: 285, scale: 0.65 },
            // Additional technical elements
            { rotation: 15, scale: 0.45 },
            { rotation: 55, scale: 0.55 },
            { rotation: 95, scale: 0.4 },
            { rotation: 145, scale: 0.6 }
        ];

        return lineConfigs.map((config, i) => (
            <Line
                key={`line-${i}`}
                variants={lineVariants}
                animate="pulse"
                style={{
                    transform: `rotate(${config.rotation}deg) scaleX(${config.scale})`,
                }}
            />
        ));
    };

    const createAccentLines = () => {
        const accentConfigs = [
            // Technical detail lines - creating a circuit-like pattern
            { rotation: 25, scale: 0.3 },
            { rotation: 75, scale: 0.25 },
            { rotation: 115, scale: 0.35 },
            { rotation: 155, scale: 0.2 },
            { rotation: 195, scale: 0.3 },
            { rotation: 235, scale: 0.15 }
        ];

        return accentConfigs.map((config, i) => (
            <AccentLine
                key={`accent-${i}`}
                variants={accentLineVariants}
                animate="pulse"
                style={{
                    transform: `rotate(${config.rotation}deg) scaleX(${config.scale})`,
                }}
            />
        ));
    };

    return (
        <LogoContainer 
            style={{ width: size, height: size }}
            variants={containerVariants}
            animate="pulse"
        >
            {createMainLines()}
            {createAccentLines()}
        </LogoContainer>
    );
};

export default AnimatedLogo; 