import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';
import { FaArrowRight, FaSpinner } from 'react-icons/fa';
import { useDebugger } from '../../contexts/DebuggerContext';

const NetworkContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

const NetworkHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
`;

const NetworkFilters = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'var(--color-primary, ' + theme.colors.primary + ')' : 'none'};
  border: none;
  color: ${props => props.$active ? 'var(--color-background, ' + theme.colors.background + ')' : 'var(--color-text, ' + theme.colors.text + ')'};
  padding: 0.5rem 1rem;
  border-radius: ${theme.borderRadius.full};
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  
  &:hover {
    color: ${props => props.$active ? 'var(--color-background, ' + theme.colors.background + ')' : 'var(--color-primary, ' + theme.colors.primary + ')'};
  }
`;

const NetworkTimeline = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  margin-top: 1rem;
  min-height: 200px;
`;

const TimelineItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.5rem;
  border-bottom: 1px solid var(--color-border, ${theme.colors.border});
  
  &:last-child {
    border-bottom: none;
  }
`;

const TimelineMethod = styled.span<{ $method: string }>`
  font-family: 'Fira Code', monospace;
  font-weight: bold;
  color: ${props => {
    switch (props.$method) {
      case 'GET': return '#61affe';
      case 'POST': return '#49cc90';
      case 'PUT': return '#fca130';
      case 'DELETE': return '#f93e3e';
      default: return 'var(--color-text, ' + theme.colors.text + ')';
    }
  }};
`;

const TimelineUrl = styled.span`
  flex: 1;
  font-family: 'Fira Code', monospace;
  color: var(--color-text, ${theme.colors.text});
`;

const TimelineStatus = styled.span<{ $status: number }>`
  font-family: 'Fira Code', monospace;
  color: ${props => {
    if (props.$status >= 200 && props.$status < 300) return '#49cc90';
    if (props.$status >= 300 && props.$status < 400) return '#fca130';
    if (props.$status >= 400) return '#f93e3e';
    return 'var(--color-text, ' + theme.colors.text + ')';
  }};
`;

const TimelineTime = styled.span`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-family: 'Fira Code', monospace;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  text-align: center;
  min-height: 200px;
`;

const Network: React.FC = () => {
  const { isDarkMode } = useTheme();
  const { state: debuggerState } = useDebugger();
  const [activeFilter, setActiveFilter] = useState<string>('all');
  
  // Get network requests from debugger state
  const requests = debuggerState.networkRequests.map(req => ({
    method: req.method,
    url: req.url,
    status: req.status,
    time: `${req.time}ms`,
    type: req.type || 'xhr'
  }));

  // Apply filter
  const filteredRequests = activeFilter === 'all' 
    ? requests 
    : requests.filter(req => req.type.toLowerCase() === activeFilter.toLowerCase());

  return (
    <NetworkContainer>
      <NetworkHeader>
        <NetworkFilters>
          <FilterButton 
            $active={activeFilter === 'all'} 
            onClick={() => setActiveFilter('all')}
          >
            All
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'xhr'} 
            onClick={() => setActiveFilter('xhr')}
          >
            XHR
          </FilterButton>
          <FilterButton 
            $active={activeFilter === 'fetch'} 
            onClick={() => setActiveFilter('fetch')}
          >
            Fetch
          </FilterButton>
        </NetworkFilters>
      </NetworkHeader>
      
      <NetworkTimeline>
        {requests.length > 0 ? (
          filteredRequests.map((request, index) => (
            <TimelineItem key={index}>
              <TimelineMethod $method={request.method}>
                {request.method}
              </TimelineMethod>
              <TimelineUrl>{request.url}</TimelineUrl>
              <TimelineStatus $status={request.status}>
                {request.status}
              </TimelineStatus>
              <TimelineTime>{request.time}</TimelineTime>
            </TimelineItem>
          ))
        ) : (
          <EmptyState>
            <p>No network requests detected.</p>
            <p>Select a file in the Sources tab and click "Start Debugging" to monitor network requests.</p>
          </EmptyState>
        )}
      </NetworkTimeline>
    </NetworkContainer>
  );
};

export default Network; 