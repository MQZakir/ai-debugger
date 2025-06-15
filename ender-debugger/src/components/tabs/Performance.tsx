import React, { useState, useEffect } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FaMicrochip, FaMemory } from 'react-icons/fa';

const PerformanceContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const MetricCard = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const MetricIcon = styled.div`
  color: var(--color-primary, ${theme.colors.primary});
`;

const MetricTitle = styled.h3`
  font-size: 1rem;
  color: var(--color-text, ${theme.colors.text});
  margin: 0;
`;

const MetricValue = styled.div`
  font-size: 2rem;
  font-weight: bold;
  color: var(--color-primary, ${theme.colors.primary});
`;

const MetricUnit = styled.span`
  font-size: 1rem;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  margin-left: 0.25rem;
`;

const UsageBar = styled.div`
  height: 8px;
  background-color: var(--color-border, ${theme.colors.border});
  border-radius: ${theme.borderRadius.full};
  overflow: hidden;
`;

const UsageFill = styled.div<{ $percentage: number }>`
  height: 100%;
  width: ${props => props.$percentage}%;
  background-color: var(--color-primary, ${theme.colors.primary});
  transition: width 0.3s ease;
`;

const Performance: React.FC = () => {
  const { isDarkMode } = useTheme();
  const [cpuUsage, setCpuUsage] = useState<number>(0);
  const [memoryUsage, setMemoryUsage] = useState<number>(0);

  // Simulate changing CPU and memory usage
  useEffect(() => {
    const interval = setInterval(() => {
      setCpuUsage(Math.min(100, Math.max(0, cpuUsage + (Math.random() * 10 - 5))));
      setMemoryUsage(Math.min(100, Math.max(0, memoryUsage + (Math.random() * 5 - 2.5))));
    }, 1000);

    return () => clearInterval(interval);
  }, [cpuUsage, memoryUsage]);
  
  return (
    <PerformanceContainer>
      <MetricsGrid>
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FaMicrochip size={24} />
            </MetricIcon>
          <MetricTitle>CPU Usage</MetricTitle>
          </MetricHeader>
          <MetricValue>
            {cpuUsage.toFixed(1)}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
          <UsageBar>
            <UsageFill $percentage={cpuUsage} />
          </UsageBar>
        </MetricCard>
        
        <MetricCard>
          <MetricHeader>
            <MetricIcon>
              <FaMemory size={24} />
            </MetricIcon>
            <MetricTitle>Memory Usage</MetricTitle>
          </MetricHeader>
          <MetricValue>
            {memoryUsage.toFixed(1)}
            <MetricUnit>%</MetricUnit>
          </MetricValue>
          <UsageBar>
            <UsageFill $percentage={memoryUsage} />
          </UsageBar>
        </MetricCard>
      </MetricsGrid>
    </PerformanceContainer>
  );
};

export default Performance; 