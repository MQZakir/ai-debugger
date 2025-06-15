import React, { useState } from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { useTheme } from '../../contexts/ThemeContext';

const StorageContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

const StorageTabs = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const StorageTab = styled.button<{ $active?: boolean }>`
  background: ${props => props.$active ? 'var(--color-primary, ' + theme.colors.primary + ')' : 'var(--color-cardBackground, ' + theme.colors.cardBackground + ')'};
  color: ${props => props.$active ? 'var(--color-background, ' + theme.colors.background + ')' : 'var(--color-text, ' + theme.colors.text + ')'};
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: ${theme.borderRadius.medium};
  cursor: pointer;
  font-family: 'Montserrat', sans-serif;
  transition: ${theme.transitions.default};
  
  &:hover {
    background: ${props => props.$active ? 'var(--color-primary, ' + theme.colors.primary + ')' : 'var(--color-hover, ' + theme.colors.hover + ')'};
  }
`;

const StorageTable = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
  flex: 1;
`;

const TableHeader = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border, ${theme.colors.border});
  font-weight: bold;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
`;

const TableRow = styled.div`
  display: grid;
  grid-template-columns: 3fr 1fr 1fr 1fr 1fr;
  padding: 1rem;
  border-bottom: 1px solid var(--color-border, ${theme.colors.border});
  transition: ${theme.transitions.default};
  cursor: pointer;
  
  &:hover {
    background-color: var(--color-hover, ${theme.colors.hover});
  }
`;

type StorageType = 'cookies' | 'localStorage' | 'sessionStorage' | 'indexedDB';

const Storage: React.FC = () => {
  const [activeStorage, setActiveStorage] = useState<StorageType>('cookies');
  const { isDarkMode } = useTheme();

  return (
    <StorageContainer>
      <StorageTabs>
        <StorageTab 
          $active={activeStorage === 'cookies'} 
          onClick={() => setActiveStorage('cookies')}
        >
          Cookies
        </StorageTab>
        <StorageTab 
          $active={activeStorage === 'localStorage'} 
          onClick={() => setActiveStorage('localStorage')}
        >
          Local Storage
        </StorageTab>
        <StorageTab 
          $active={activeStorage === 'sessionStorage'} 
          onClick={() => setActiveStorage('sessionStorage')}
        >
          Session Storage
        </StorageTab>
        <StorageTab 
          $active={activeStorage === 'indexedDB'} 
          onClick={() => setActiveStorage('indexedDB')}
        >
          IndexedDB
        </StorageTab>
      </StorageTabs>
      
      <StorageTable>
        <TableHeader>
          <div>Name</div>
          <div>Value</div>
          <div>Domain</div>
          <div>Expires</div>
          <div>Size</div>
        </TableHeader>
        
        <TableRow>
          <div>authToken</div>
          <div>eyJhbGciOiJ...</div>
          <div>example.com</div>
          <div>Session</div>
          <div>2.1 KB</div>
        </TableRow>
        
        <TableRow>
          <div>userId</div>
          <div>u12345</div>
          <div>example.com</div>
          <div>1 month</div>
          <div>12 B</div>
        </TableRow>
        
        <TableRow>
          <div>theme</div>
          <div>dark</div>
          <div>example.com</div>
          <div>1 year</div>
          <div>4 B</div>
        </TableRow>
        
        <TableRow>
          <div>lastVisit</div>
          <div>2023-05-10T13:45:22Z</div>
          <div>example.com</div>
          <div>Session</div>
          <div>24 B</div>
        </TableRow>
      </StorageTable>
    </StorageContainer>
  );
};

export default Storage; 