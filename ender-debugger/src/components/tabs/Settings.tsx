import React from 'react';
import styled from '@emotion/styled';
import { theme } from '../../theme';
import { Dropdown, DropdownProps } from '../common/Dropdown';
import { useFontSize } from '../../contexts/FontSizeContext';
import { useTheme } from '../../contexts/ThemeContext';

const SettingsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 0 1.5rem;
  gap: 1rem;
  overflow: auto;
  margin-bottom: 1.5rem;
`;

const SettingsSection = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const SettingsHeader = styled.h2`
  color: var(--color-text, ${theme.colors.text});
  font-size: ${theme.fontSize.lg};
  margin: 0;
`;

const SettingsGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const SettingItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  border-radius: ${theme.borderRadius.small};
  transition: ${theme.transitions.default};
  
  &:hover {
    background-color: var(--color-hover, ${theme.colors.hover});
  }
`;

const SettingLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
`;

const SettingTitle = styled.h3`
  color: var(--color-text, ${theme.colors.text});
  font-size: ${theme.fontSize.base};
  margin: 0;
`;

const SettingDescription = styled.p`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: ${theme.fontSize.sm};
  margin: 0;
`;

const ToggleSwitch = styled.label`
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
  
  input {
    opacity: 0;
    width: 0;
    height: 0;
    
    &:checked + span {
      background-color: var(--color-primary, ${theme.colors.primary});
    }
    
    &:checked + span:before {
      transform: translateX(26px);
    }
  }
  
  span {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: var(--color-border, ${theme.colors.border});
    transition: ${theme.transitions.default};
    border-radius: 24px;
    
    &:before {
      position: absolute;
      content: "";
      height: 16px;
      width: 16px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: ${theme.transitions.default};
      border-radius: 50%;
    }
  }
`;

const Settings: React.FC = () => {
  const { fontSize, setFontSize } = useFontSize();
  const { theme: currentTheme, setTheme } = useTheme();
  
  return (
    <SettingsContainer>
      <SettingsSection>
        <SettingsHeader>Preferences</SettingsHeader>
        <SettingsGroup>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Theme</SettingTitle>
              <SettingDescription>Choose between light and dark themes</SettingDescription>
            </SettingLabel>
            <Dropdown 
              options={[
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System' }
              ]}
              value={currentTheme}
              onChange={(value: string) => setTheme(value as 'light' | 'dark' | 'system')}
            />
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Font Size</SettingTitle>
              <SettingDescription>Adjust the text size throughout the app</SettingDescription>
            </SettingLabel>
            <Dropdown 
              options={[
                { value: 'small', label: 'Small' },
                { value: 'medium', label: 'Medium' },
                { value: 'large', label: 'Large' }
              ]}
              value={fontSize}
              onChange={(value: string) => setFontSize(value as 'small' | 'medium' | 'large')}
            />
          </SettingItem>
        </SettingsGroup>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>Debugging</SettingsHeader>
        <SettingsGroup>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Network Logging</SettingTitle>
              <SettingDescription>Record all network requests automatically</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span />
            </ToggleSwitch>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Performance Monitoring</SettingTitle>
              <SettingDescription>Track CPU and memory usage in real-time</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span />
            </ToggleSwitch>
          </SettingItem>
        </SettingsGroup>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>Notifications</SettingsHeader>
        <SettingsGroup>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Error Alerts</SettingTitle>
              <SettingDescription>Get notified about new errors</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span />
            </ToggleSwitch>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Performance Warnings</SettingTitle>
              <SettingDescription>Alert when performance metrics exceed thresholds</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span />
            </ToggleSwitch>
          </SettingItem>
        </SettingsGroup>
      </SettingsSection>

      <SettingsSection>
        <SettingsHeader>Advanced</SettingsHeader>
        <SettingsGroup>
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Source Maps</SettingTitle>
              <SettingDescription>Enable source map support for minified code</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" defaultChecked />
              <span />
            </ToggleSwitch>
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Debug Protocol</SettingTitle>
              <SettingDescription>Choose the debugging protocol version</SettingDescription>
            </SettingLabel>
            <Dropdown 
              options={[
                { value: 'v1', label: 'Version 1' },
                { value: 'v2', label: 'Version 2' }
              ]}
              defaultValue="v2"
              onChange={(value: string) => console.log('Protocol version changed to:', value)}
            />
          </SettingItem>
          
          <SettingItem>
            <SettingLabel>
              <SettingTitle>Memory Profiling</SettingTitle>
              <SettingDescription>Enable detailed memory usage tracking</SettingDescription>
            </SettingLabel>
            <ToggleSwitch>
              <input type="checkbox" />
              <span />
            </ToggleSwitch>
          </SettingItem>
        </SettingsGroup>
      </SettingsSection>
    </SettingsContainer>
  );
};

export default Settings; 