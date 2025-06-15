import { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../theme';
import AnimatedLogo from './AnimatedLogo';

const SplashContainer = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${theme.colors.background};
  z-index: 1000;
`;

const ContentContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  position: relative;
  padding-left: 50px;
`;

const TextContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.h1`
  font-size: 4rem;
  font-weight: 700;
  color: ${theme.colors.text};
  margin: 0;
  line-height: 1;
`;

const Subtitle = styled(motion.div)`
  font-size: 1.1rem;
  font-weight: 400;
  font-style: italic;
  color: ${theme.colors.text};
  opacity: 0.8;
  margin-top: 0.5rem;
`;

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    const [show, setShow] = useState(true);
    const [showText, setShowText] = useState(false);

    useEffect(() => {
        // Show text after logo movement completes
        const textTimer = setTimeout(() => {
            setShowText(true);
        }, 1500);

        // Complete transition
        const completeTimer = setTimeout(() => {
            setShow(false);
            setTimeout(onComplete, 800);
        }, 5000);

        return () => {
            clearTimeout(textTimer);
            clearTimeout(completeTimer);
        };
    }, [onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <SplashContainer
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ 
                        duration: 0.8,
                        ease: "easeOut"
                    }}
                >
                    <ContentContainer layout>
                        <motion.div
                            layout
                            initial={{ 
                                scale: 1.2
                            }}
                            animate={{ 
                                scale: 0.8
                            }}
                            transition={{ 
                                duration: 1.8,
                                ease: [0.4, 0, 0.2, 1],
                                layout: {
                                    duration: 1.8,
                                    ease: [0.4, 0, 0.2, 1]
                                }
                            }}
                        >
                            <AnimatedLogo size={120} />
                        </motion.div>
                        <AnimatePresence>
                            {showText && (
                                <TextContainer
                                    layout
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ 
                                        duration: 1,
                                        ease: [0.4, 0, 0.2, 1],
                                        layout: {
                                            duration: 1.2,
                                            ease: [0.4, 0, 0.2, 1]
                                        }
                                    }}
                                >
                                    <Title>ENDER</Title>
                                    <Subtitle
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ 
                                            duration: 0.8,
                                            delay: 0.3,
                                            ease: [0.4, 0, 0.2, 1]
                                        }}
                                    >
                                        Dive into the matrix of debugging
                                    </Subtitle>
                                </TextContainer>
                            )}
                        </AnimatePresence>
                    </ContentContainer>
                </SplashContainer>
            )}
        </AnimatePresence>
    );
};

export default SplashScreen;