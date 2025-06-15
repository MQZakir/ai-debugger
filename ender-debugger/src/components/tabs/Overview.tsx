import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FaMicrochip, FaMemory, FaBug, FaNetworkWired } from 'react-icons/fa';
import { useFileAnalysis } from '../../contexts/FileAnalysisContext';
import { keyframes } from '@emotion/react';
import { useDebugger, Variable, StackFrame } from '../../contexts/DebuggerContext';

// Keyframe animations
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Types
interface Scope {
  name: string;
  variables: Array<{
    name: string;
    value: string;
  }>;
}

interface DebuggerState {
  variables: Variable[];
  callStack: StackFrame[];
  scopes: Scope[];
  networkRequests: Array<{
    url: string;
    method: string;
    status: string;
    response: string;
  }>;
}

interface Widget {
  id: string;
  type: string;
  gridArea: string;
  isDragging: boolean;
}

// Styled Components
const OverviewContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: row;
  padding: 0 1.5rem;
  gap: 1rem;
  height: 100%;
  overflow: hidden;
`;

const LeftColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 60%;
  height: 100%;
  overflow: hidden;
`;

const RightColumn = styled.div`
  width: 40%;
  height: 100%;
  overflow: hidden;
`;

const Widget = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: hidden;
`;

const WidgetHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WidgetIcon = styled.div`
  color: var(--color-primary, ${theme.colors.primary});
`;

const WidgetTitle = styled.h3`
  color: var(--color-text, ${theme.colors.text});
  margin: 0;
  font-size: 1.1rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const MetricCard = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  position: relative;
  overflow: hidden;
`;

const MetricGraph = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.1;
  background: linear-gradient(45deg, #00f2fe, #4facfe);
  z-index: 0;
`;

const HistoryGraph = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0.15;
  z-index: 0;
`;

const GraphLine = styled(motion.path)`
  fill: none;
  stroke: #00f2fe;
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
`;

const GraphArea = styled(motion.path)`
  fill: #00f2fe;
  opacity: 0.2;
`;

const MetricContent = styled.div`
  position: relative;
  z-index: 1;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-text, ${theme.colors.text});
`;

const MetricIcon = styled.div`
  color: var(--color-primary, ${theme.colors.primary});
`;

const MetricTitle = styled.h3`
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary, ${theme.colors.primary});
`;

const UsageBar = styled.div`
  height: 4px;
  background-color: var(--color-border, ${theme.colors.border});
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const UsageFill = styled(motion.div)<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background: linear-gradient(45deg, #00f2fe, #4facfe);
  transition: width 0.3s ease;
`;

const StateCarousel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  height: 300px;
`;

const NetworkCarousel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow: auto;
  height: 200px;
`;

const StateItem = styled.div`
  padding: 0.5rem;
  background-color: var(--color-hover, ${theme.colors.hover});
  border-radius: ${theme.borderRadius.small};
  font-family: 'Fira Code', monospace;
    font-size: 0.9rem;
`;

const CodeExplanation = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  height: 100%;
  overflow-y: auto;
`;

const ExplanationTitle = styled.h3`
  color: var(--color-text, ${theme.colors.text});
  margin-bottom: 1rem;
`;

const ExplanationContent = styled.div`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  line-height: 1.6;
  white-space: pre-wrap;
`;

const StateTypeIndicator = styled.div`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: 0.8rem;
  font-family: 'Montserrat', sans-serif;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const LoadingSpinner = styled(motion.div)`
  width: 40px;
  height: 40px;
  border: 3px solid var(--color-primary, ${theme.colors.primary});
  border-radius: 50%;
  border-top-color: transparent;
  animation: ${spin} 1s linear infinite;
  margin: 0 auto;
`;

const LoadingText = styled.p`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  text-align: center;
  margin-top: 1rem;
`;

// Widget Types
const widgetTypes = {
  memory: {
    title: 'Memory Analysis',
    content: 'Memory leaks and allocation',
    details: 'Track memory usage patterns, identify potential memory leaks, and analyze garbage collection behavior. Shows heap snapshots and allocation timelines.',
    size: 'large' as const
  },
  coverage: {
    title: 'Code Coverage',
    content: 'Test coverage and execution',
    details: 'View which parts of your code are being executed and which aren\'t. Helps identify untested code paths and potential edge cases.',
    size: 'large' as const
  },
  security: {
    title: 'Security',
    content: 'Security vulnerabilities',
    details: 'Monitor for potential security issues, XSS attempts, CSRF attacks, and other security-related events. Shows security audit results and recommendations.',
    size: 'medium' as const
  },
  dependencies: {
    title: 'Dependencies',
    content: 'Package and module status',
    details: 'Track third-party package versions, check for updates, and monitor dependency conflicts. Shows module loading times and potential issues.',
    size: 'medium' as const
  },
  accessibility: {
    title: 'Accessibility',
    content: 'A11y compliance',
    details: 'Check for accessibility issues, ARIA violations, and screen reader compatibility. Provides recommendations for improving accessibility.',
    size: 'medium' as const
  },
  compatibility: {
    title: 'Compatibility',
    content: 'Browser compatibility',
    details: 'Monitor browser-specific issues, CSS compatibility, and JavaScript feature support. Shows potential cross-browser problems.',
    size: 'small' as const
  },
  storage: {
    title: 'Storage Inspector',
    content: 'Cookies, localStorage, sessionStorage',
    details: 'Inspect and modify browser storage mechanisms including cookies, localStorage, sessionStorage, and IndexedDB. Track storage changes and sizes.',
    size: 'small' as const
  },
  dom: {
    title: 'DOM Inspector',
    content: 'Document Object Model',
    details: 'View and manipulate the DOM tree, inspect elements, and monitor DOM changes. Helps debug rendering issues and element hierarchies.',
    size: 'small' as const
  },
  events: {
    title: 'Event Listeners',
    content: 'Event tracking and monitoring',
    details: 'Track all registered event listeners, monitor event firing, and debug event propagation issues. Shows event bubbling and capturing paths.',
    size: 'small' as const
  }
};

const Overview: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);
  const [activeState, setActiveState] = useState<number>(0);
  const [cpuHistory, setCpuHistory] = useState<number[]>([]);
  const [memoryHistory, setMemoryHistory] = useState<number[]>([]);
  const { analysis, isModelLoaded, isLoading } = useFileAnalysis();
  const { state: debuggerState } = useDebugger();

  // Function to extract the explanation part
  const getExplanationText = (text: string) => {
    try {
      // Try to extract the code explanation section
      
      // Check for standard format: ### CODE EXPLANATION
      const standardMatch = text.match(/### CODE EXPLANATION:\s*\n([\s\S]*?)(?=###|$)/);
      if (standardMatch && standardMatch[1]) {
        return standardMatch[1].trim();
      }
      
      // Check for numbered format: ### 1. CODE EXPLANATION
      const numberedMatch = text.match(/### 1\.\s*CODE EXPLANATION:\s*\n([\s\S]*?)(?=###|$)/) || 
                           text.match(/###\s*1\.\s*CODE EXPLANATION:\s*\n([\s\S]*?)(?=###|$)/);
      if (numberedMatch && numberedMatch[1]) {
        return numberedMatch[1].trim();
      }
      
      // Check for simple heading without markdown: CODE EXPLANATION:
      const simpleMatch = text.match(/CODE EXPLANATION[:\s]*\n([\s\S]*?)(?=\n\n[A-Z]|$)/i);
      if (simpleMatch && simpleMatch[1]) {
        return simpleMatch[1].trim();
      }
      
      // If an Errors section exists, get everything before it
      const beforeErrors = text.split(/### ERRORS|### 2\.\s*ERRORS/)[0];
      if (beforeErrors && beforeErrors !== text) {
        return beforeErrors.trim();
      }
      
      // If nothing specific was found but the text doesn't appear to be errors
      if (!text.toLowerCase().includes("error:") && 
          !(text.toLowerCase().includes("line") && text.toLowerCase().includes("error"))) {
        return text;
      }
      
      return "No code explanation found in the analysis.";
    } catch (error) {
      console.error("Error parsing explanation text:", error);
      return "Error parsing the code explanation.";
    }
  };

  // Debug logging for analysis state
  useEffect(() => {
    console.error('OVERVIEW - Analysis state changed:', {
      hasAnalysis: !!analysis,
      isModelLoaded,
      explanation: analysis?.explanation,
      errorCount: analysis?.errors?.length
    });
  }, [analysis, isModelLoaded]);

  // Create an array of state types to display
  const states = [
    {
      title: 'Variables',
      items: debuggerState.variables.length > 0 
        ? debuggerState.variables.map(v => {
            // Handle both values and value
            const displayValue = v.values ? v.values.join(' → ') : v.value;
            return `${v.name} (${v.type}): ${displayValue}`;
          })
        : []
    },
    {
      title: 'Call Stack',
      items: debuggerState.callStack.length > 0
        ? debuggerState.callStack.map(frame => {
            // Use function or name
            const funcName = frame.function || frame.name;
            return `${funcName} at line ${frame.line}`;
          })
        : []
    },
    {
      title: 'Scopes',
      items: (debuggerState.additionalDebugData?.scopes ?? []).length > 0
        ? (debuggerState.additionalDebugData?.scopes ?? []).map((scope: any) => {
            const vars = scope.variables.map((v: { name: string; value: string }) => `${v.name}: ${v.value}`).join(', ');
            return `${scope.name}: { ${vars} }`;
          })
        : []
    }
  ];
  
  // If we have data from debug_code, add scopes
  if (debuggerState.variables.length > 0) {
    // Check if we have access to additional debug data
    // This assumes the debugCode function might have stored additional data
    const scopesData = (debuggerState as any).additionalDebugData?.scopes || [];
    states[2].items = scopesData.length > 0
      ? scopesData.map((scope: any) => `${scope.name}`)
      : ["Global Scope"];
  }

  useEffect(() => {
    const updateMetrics = async () => {
      try {
        // Get CPU usage
        const cpuResponse = await fetch('http://localhost:3001/api/system/cpu');
        const cpuData = await cpuResponse.json();
        setCpuUsage(cpuData.usage);
        setCpuHistory(cpuData.history);

        // Get memory usage
        const memoryResponse = await fetch('http://localhost:3001/api/system/memory');
        const memoryData = await memoryResponse.json();
        setMemoryUsage(memoryData.usage);
        setMemoryHistory(memoryData.history);
      } catch (error) {
        console.error('Error fetching system metrics:', error);
      }
    };

    // Update metrics every second
    const interval = setInterval(updateMetrics, 1000);
    updateMetrics(); // Initial update

    return () => clearInterval(interval);
  }, []);

  const generatePath = (data: number[]) => {
    if (data.length === 0) return '';
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - value;
      return `${x},${y}`;
    });
    
    return `M ${points.join(' L ')}`;
  };

  const generateAreaPath = (data: number[]) => {
    if (data.length === 0) return '';
    
    const points = data.map((value, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - value;
      return `${x},${y}`;
    });
    
    return `M 0,100 L ${points.join(' L ')} L 100,100 Z`;
  };

  return (
    <OverviewContainer>
      <LeftColumn>
        <MetricsGrid>
          <MetricCard>
            <HistoryGraph>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#4facfe" />
                  </linearGradient>
                </defs>
                <GraphArea
                  d={generateAreaPath(cpuHistory)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <GraphLine
                  d={generatePath(cpuHistory)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </HistoryGraph>
            <MetricContent>
              <MetricHeader>
                <MetricIcon>
                  <FaMicrochip />
                </MetricIcon>
                <MetricTitle>CPU Usage</MetricTitle>
              </MetricHeader>
              <MetricValue>{cpuUsage.toFixed(1)}%</MetricValue>
            </MetricContent>
          </MetricCard>

          <MetricCard>
            <HistoryGraph>
              <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#00f2fe" />
                    <stop offset="100%" stopColor="#4facfe" />
                  </linearGradient>
                </defs>
                <GraphArea
                  d={generateAreaPath(memoryHistory)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
                <GraphLine
                  d={generatePath(memoryHistory)}
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5 }}
                />
              </svg>
            </HistoryGraph>
            <MetricContent>
              <MetricHeader>
                <MetricIcon>
                  <FaMemory />
                </MetricIcon>
                <MetricTitle>Memory Usage</MetricTitle>
              </MetricHeader>
              <MetricValue>{memoryUsage.toFixed(1)}%</MetricValue>
            </MetricContent>
          </MetricCard>
        </MetricsGrid>

        <Widget>
          <StateTypeIndicator>
            {states[activeState].title}
          </StateTypeIndicator>
          <StateCarousel>
            <AnimatePresence mode="wait">
              <motion.div
                key={activeState}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                {states[activeState].items.length > 0 ? (
                  states[activeState].items.map((item: string, index: number) => (
                    <StateItem key={index}>{item}</StateItem>
                  ))
                ) : (
                  <StateItem>No {states[activeState].title.toLowerCase()} available</StateItem>
                )}
              </motion.div>
            </AnimatePresence>
          </StateCarousel>
        </Widget>

        <Widget>
          <StateTypeIndicator>Network Requests</StateTypeIndicator>
          <NetworkCarousel>
            {debuggerState.networkRequests.length > 0 ? (
              debuggerState.networkRequests.map((request, index) => (
                <StateItem key={index}>{request.method} {request.url} - {request.status} {request.statusText}</StateItem>
              ))
            ) : (
              <StateItem>No network requests detected</StateItem>
            )}
          </NetworkCarousel>
          </Widget>
      </LeftColumn>

      <RightColumn>
        <CodeExplanation>
          <ExplanationTitle>Code Analysis</ExplanationTitle>
          <ExplanationContent>
            {isLoading ? (
              <>
                <LoadingSpinner />
                <LoadingText>Analyzing Code...</LoadingText>
              </>
            ) : !isModelLoaded ? (
              "The analysis model is not loaded. Please ensure the model file is in the correct location."
            ) : !analysis ? (
              "No file selected. Open a file in the Sources tab to see the analysis."
            ) : analysis.explanation ? (
              getExplanationText(analysis.explanation)
            ) : (
              "No explanation available."
            )}
          </ExplanationContent>
        </CodeExplanation>
      </RightColumn>
    </OverviewContainer>
  );
};

export default Overview; 