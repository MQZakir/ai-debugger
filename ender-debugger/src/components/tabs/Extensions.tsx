import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { FaTools } from 'react-icons/fa';

const ExtensionsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

const PageHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const HeaderIcon = styled.div`
  width: 48px;
  height: 48px;
  background-color: var(--color-primary, ${theme.colors.primary});
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-background, ${theme.colors.background});
`;

const HeaderTitle = styled.h2`
  margin: 0;
  color: var(--color-text, ${theme.colors.text});
  font-size: 1.5rem;
`;

const ComingSoonBanner = styled.div`
  background-color: var(--color-warningLight, #fff3cd);
  border: 1px solid var(--color-warning, #ffeeba);
  border-radius: ${theme.borderRadius.medium};
  padding: 1rem;
  margin-top: 2rem;
  text-align: center;
`;

const ComingSoonText = styled.p`
  color: var(--color-warningDark, #856404);
  font-weight: 500;
  margin: 0;
`;

/**
 * Installation Guide tab that replaces the Extensions tab
 */
const Extensions: React.FC = () => {
  return (
    <ExtensionsContainer>
      <PageHeader>
        <HeaderIcon>
          <FaTools size={24} />
        </HeaderIcon>
        <HeaderTitle>Installation Guide</HeaderTitle>
      </PageHeader>
      
      <ComingSoonBanner>
        <ComingSoonText>
          Support for more programming languages coming soon!
        </ComingSoonText>
      </ComingSoonBanner>
    </ExtensionsContainer>
  );
};

export default Extensions; 