import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { theme } from '../theme';

const LogoContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const OuterRing = styled(motion.div)`
  position: absolute;
  width: 100%;
  height: 100%;
  border: 3px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.full};
  opacity: 0.3;
`;

const InnerRing = styled(motion.div)`
  position: absolute;
  width: 70%;
  height: 70%;
  border: 3px solid ${theme.colors.accent};
  border-radius: ${theme.borderRadius.full};
  opacity: 0.5;
`;

const Core = styled(motion.div)`
  position: absolute;
  width: 40%;
  height: 40%;
  background: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.full};
  opacity: 0.8;
  box-shadow: ${theme.shadows.neon};
`;

const Particle = styled(motion.div)`
  position: absolute;
  width: 8px;
  height: 8px;
  background: ${theme.colors.accent};
  border-radius: ${theme.borderRadius.full};
  box-shadow: ${theme.shadows.glow};
`;

const Logo = ({ animate = false }: { animate?: boolean }) => {
    const outerRingVariants = {
        initial: { rotate: 0 },
        animate: animate ? { rotate: 360 } : { rotate: 0 },
        transition: { duration: 30, repeat: Infinity, ease: "linear" }
    };

    const innerRingVariants = {
        initial: { rotate: 0 },
        animate: animate ? { rotate: -360 } : { rotate: 0 },
        transition: { duration: 25, repeat: Infinity, ease: "linear" }
    };

    const coreVariants = {
        initial: { scale: 1 },
        animate: animate ? { scale: [1, 1.1, 1] } : { scale: 1 },
        transition: { duration: 2, repeat: Infinity, ease: "easeInOut" }
    };

    const particleVariants = {
        initial: { scale: 1, opacity: 0.5 },
        animate: animate ? {
            scale: [1, 1.2, 1],
            opacity: [0.5, 0.8, 0.5]
        } : { scale: 1, opacity: 0.5 },
        transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
    };

    return (
        <LogoContainer>
            <OuterRing
                variants={outerRingVariants}
                initial="initial"
                animate="animate"
            />
            <InnerRing
                variants={innerRingVariants}
                initial="initial"
                animate="animate"
            />
            <Core
                variants={coreVariants}
                initial="initial"
                animate="animate"
            />
            {[...Array(6)].map((_, i) => (
                <Particle
                    key={i}
                    style={{
                        top: `${Math.sin(i * Math.PI / 3) * 60 + 60}%`,
                        left: `${Math.cos(i * Math.PI / 3) * 60 + 60}%`,
                    }}
                    variants={particleVariants}
                    initial="initial"
                    animate="animate"
                />
            ))}
        </LogoContainer>
    );
};

export default Logo; 