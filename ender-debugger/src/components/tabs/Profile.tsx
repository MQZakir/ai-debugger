import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { theme } from '../../theme';
import { FaCamera, FaEdit, FaKey, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { useTheme } from '../../contexts/ThemeContext';
import { supabase } from '../../lib/supabase';

const ProfileContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
  padding: 2rem;
  height: 100%;
  overflow-y: auto;
`;

const ProfileHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--color-border, ${theme.colors.border});
`;

const ProfileAvatar = styled.div`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background-color: var(--color-primary, ${theme.colors.primary});
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10rem;
  color: var(--color-background, ${theme.colors.background});
  position: relative;
  overflow: hidden;
`;

const ProfileInfo = styled.div`
  flex: 1;
`;

const ProfileName = styled.h2`
  font-size: 1.5rem;
  margin: 0;
  color: var(--color-text, ${theme.colors.text});
`;

const ProfileEmail = styled.p`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  margin: 0.5rem 0;
`;

const ProfileRole = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background-color: var(--color-accent, ${theme.colors.accent});
  color: var(--color-background, ${theme.colors.background});
  border-radius: ${theme.borderRadius.small};
  font-size: 0.9rem;
  font-weight: 500;
`;

const ProfileSection = styled.div`
  background-color: var(--color-cardBackground, ${theme.colors.cardBackground});
  border: 1px solid var(--color-border, ${theme.colors.border});
  border-radius: ${theme.borderRadius.medium};
  padding: 1.5rem;
`;

const SectionHeader = styled.h3`
  font-size: 1.2rem;
  margin: 0 0 1.5rem 0;
  color: var(--color-text, ${theme.colors.text});
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: var(--color-text, ${theme.colors.text});
`;

const ActionButton = styled.button`
  background-color: ${props => `${theme.colors.primary}20`};
  color: var(--color-primary, ${theme.colors.primary});
  border: none;
  border-radius: ${theme.borderRadius.small};
  padding: 0.75rem 1.5rem;
  font-size: 0.9rem;
  cursor: pointer;
  transition: ${theme.transitions.default};
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &:hover {
    background-color: ${props => `${theme.colors.primary}30`};
  }
`;

const DangerButton = styled(ActionButton)`
  background-color: ${props => `${theme.colors.error}20`};
  color: var(--color-error, ${theme.colors.error});
  
  &:hover {
    background-color: ${props => `${theme.colors.error}30`};
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 1.5rem;
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 50px;
  height: 50px;
  border: 3px solid var(--color-border, ${theme.colors.border});
  border-top: 3px solid var(--color-primary, ${theme.colors.primary});
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  color: var(--color-textSecondary, ${theme.colors.textSecondary});
  font-size: 1.1rem;
  margin: 0;
`;

interface UserProfile {
    id: string;
    name: string;
    email: string | null;
    experience_level: string;
    created_at: string | null;
    last_sign_in_at: string | null;
}

const Profile: React.FC = () => {
    const navigate = useNavigate();
    const { isDarkMode } = useTheme();
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                // Get the current user's session
                const { data: { user }, error: authError } = await supabase.auth.getUser();
                
                if (authError) throw authError;
                if (!user) throw new Error('No user found');

                // Get the user's profile from the users table
                const { data: profileData, error: profileError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();

                if (profileError) throw profileError;

                setUserProfile({
                    id: user.id,
                    name: profileData.name,
                    email: user.email || 'No email provided',
                    experience_level: profileData.experience_level,
                    created_at: user.created_at || new Date().toISOString(),
                    last_sign_in_at: user.last_sign_in_at || new Date().toISOString()
                });
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load profile data');
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    const handleAvatarClick = () => {
        // Logic to upload/change avatar
        console.log('Change avatar clicked');
    };

    const handleEditProfile = () => {
        navigate('/edit-profile');
    };

    const handleChangePassword = () => {
        navigate('/change-password');
    };

    const handleNotificationSettings = () => {
        console.log('Notification settings clicked');
    };

    const handleSignOut = async () => {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            // Redirect to login page after sign out
            navigate('/login');
        } catch (err) {
            console.error('Error signing out:', err);
        }
    };

    if (isLoading) {
        return (
            <LoadingContainer>
                <LoadingSpinner />
                <LoadingText>Loading your profile...</LoadingText>
            </LoadingContainer>
        );
    }

    if (error) {
        return (
            <ProfileContainer>
                <p style={{ color: theme.colors.error }}>{error}</p>
            </ProfileContainer>
        );
    }

    if (!userProfile) {
        return (
            <ProfileContainer>
                <p>No profile data available</p>
            </ProfileContainer>
        );
    }

    // Format dates
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    // Get initials for avatar
    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase();
    };

    // Helper function to get role title based on experience level
    const getRoleTitle = (experience: string) => {
        switch (experience.toLowerCase()) {
            case 'beginner':
                return 'Beginner Programmer';
            case 'intermediate':
                return 'Intermediate Programmer';
            case 'expert':
                return 'Expert Programmer';
            default:
                return 'Programmer';
        }
    };

    return (
        <ProfileContainer>
            <ProfileHeader>
                <ProfileAvatar>
                    <span style={{ fontSize: '3rem' }}>{getInitials(userProfile.name)}</span>
                </ProfileAvatar>
                <ProfileInfo>
                    <ProfileName>{userProfile.name}</ProfileName>
                    <ProfileEmail>{userProfile.email}</ProfileEmail>
                    <ProfileRole>{getRoleTitle(userProfile.experience_level)}</ProfileRole>
                </ProfileInfo>
            </ProfileHeader>

            <ProfileSection>
                <SectionHeader>Account Information</SectionHeader>
                <InfoGrid>
                    <InfoItem>
                        <InfoLabel>Member Since</InfoLabel>
                        <InfoValue>{formatDate(userProfile.created_at || '')}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                        <InfoLabel>Last Login</InfoLabel>
                        <InfoValue>{formatDate(userProfile.last_sign_in_at || '')}</InfoValue>
                    </InfoItem>
                    <InfoItem>
                        <InfoLabel>Account Status</InfoLabel>
                        <InfoValue>Active</InfoValue>
                    </InfoItem>
                </InfoGrid>
            </ProfileSection>

            <ProfileSection>
                <SectionHeader>Account Actions</SectionHeader>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <ActionButton onClick={handleEditProfile}>
                        <FaEdit /> Edit Profile
                    </ActionButton>
                    <ActionButton onClick={handleChangePassword}>
                        <FaKey /> Change Password
                    </ActionButton>
                    <DangerButton onClick={handleSignOut}>
                        <FaSignOutAlt /> Sign Out
                    </DangerButton>
                </div>
            </ProfileSection>
        </ProfileContainer>
    );
};

export default Profile; 