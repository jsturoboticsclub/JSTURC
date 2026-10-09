import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
  id: string;
  email: string;
  name: string;
  uniqueId: string;
  profile: {
    bio: string;
    location: string;
    website: string;
    interests: string[];
  };
  major: string;
  year: string;
  memberId: string;
  profileImage: string | null;
}

export interface AuthUser {
  email: string;
  name: string;
  uniqueId: string;
}

const defaultUser: User = {
  id: '',
  email: '',
  name: '',
  uniqueId: '',
  profile: {
    bio: '',
    location: '',
    website: '',
    interests: [],
  },
  major: '',
  year: '',
  memberId: '',
  profileImage: null,
};

interface UserContextType {
  user: User;
  authUser: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User) => void;
  setAuthUser: (authUser: AuthUser | null) => void;
  updateProfileImage: (image: string | null) => void;
  login: (token: string, authUser: AuthUser) => void;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User>(() => {
    // Initialize from localStorage
    const savedImage = localStorage.getItem('userProfileImage');
    return { ...defaultUser, profileImage: savedImage || null };
  });
  
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = () => {
    console.log('🚪 Logging out user');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    localStorage.removeItem('user');
    localStorage.removeItem('userProfileImage');
    setAuthUser(null);
    setIsAuthenticated(false);
    setUser({ ...defaultUser });
  };



  // Validate token by making a request to backend
  const validateToken = async (token: string) => {
    try {
      const response = await fetch('/api/auth/validate', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        return data.valid;
      }
      return false;
    } catch (error) {
      console.error('Token validation failed:', error);
      return false;
    }
  };

  // Check for existing authentication on app load
  useEffect(() => {
    console.log('🔍 Checking existing authentication...');
    
    const checkAuth = async () => {
      let token = localStorage.getItem('token') || localStorage.getItem('authToken');
      const savedAuthUser = localStorage.getItem('authUser') || localStorage.getItem('user');
      
      console.log('Token exists:', !!token);
      console.log('Saved user exists:', !!savedAuthUser);
      
      // If no token or if legacy demo token is present, ensure user is unauthenticated
      if (!token || token === 'portfolio-demo-token' || !savedAuthUser) {
        if (token === 'portfolio-demo-token') {
          localStorage.removeItem('token');
          localStorage.removeItem('authUser');
          localStorage.removeItem('user');
        }
        setIsAuthenticated(false);
        setAuthUser(null);
        setUser({ ...defaultUser });
        setIsLoading(false);
        return;
      }

      try {
        const parsedAuthUser = JSON.parse(savedAuthUser);
        
        // Validate required fields
        if (!parsedAuthUser.email || !parsedAuthUser.name) {
          console.log('❌ Invalid user data structure');
          logout();
          setIsLoading(false);
          return;
        }

        const normalizedAuthUser: AuthUser = {
          email: parsedAuthUser.email,
          name: parsedAuthUser.name,
          uniqueId: parsedAuthUser.uniqueId || parsedAuthUser.id || parsedAuthUser.student_id || 'member'
        };

        console.log('✅ Found valid auth data:', normalizedAuthUser);
        setAuthUser(normalizedAuthUser);
        setIsAuthenticated(true);
        
        // Update user context with auth data first
        setUser(prev => ({
          ...prev,
          name: normalizedAuthUser.name,
          email: normalizedAuthUser.email,
          memberId: normalizedAuthUser.uniqueId,
        }));
        
        // Fetch complete user profile including avatar from backend
        await fetchUserProfile(token);
        
      } catch (error) {
        console.error('❌ Error parsing saved auth user:', error);
        logout();
      }
      
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Fetch user profile data including avatar from backend
  const fetchUserProfile = async (token?: string) => {
    try {
      const authToken = token || localStorage.getItem('token');
      if (!authToken) {
        console.log('🔧 No token available, skipping profile fetch (debug mode)');
        return;
      }

      console.log('🔍 Fetching user profile with token:', authToken.substring(0, 20) + '...');

      const response = await fetch('/api/users/me', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 User profile response:', data);
        if (data.success && data.user) {
          console.log('👤 Fetched user profile:', data.user);
          
          // Extract avatar data properly - check multiple possible locations
          let avatarData = null;
          console.log('🔍 Checking avatar data locations:');
          console.log('  - user.avatar:', data.user.avatar);
          console.log('  - user.profile.avatar:', data.user.profile?.avatar);
          
          if (data.user.avatar?.data) {
            avatarData = data.user.avatar.data;
            console.log('🖼️ Found avatar data in user.avatar.data');
          } else if (data.user.profile?.avatar?.data) {
            avatarData = data.user.profile.avatar.data;
            console.log('🖼️ Found avatar data in user.profile.avatar.data');
          }
          
          if (avatarData) {
            console.log('🖼️ Avatar data preview:', avatarData.substring(0, 50) + '...');
          } else {
            console.log('🖼️ No avatar data found');
          }
          
          // Update user state with complete profile data
          setUser(prev => {
            const updatedUser = {
              ...prev,
              id: data.user.id,
              name: data.user.name,
              email: data.user.email,
              memberId: data.user.uniqueId,
              profile: data.user.profile || {
                bio: '',
                location: '',
                website: '',
                interests: []
              },
              profileImage: avatarData
            };
            
            console.log('🔍 Setting user state with profileImage:', !!avatarData);
            return updatedUser;
          });

          // Store avatar in localStorage
          if (avatarData) {
            localStorage.setItem('userProfileImage', avatarData);
          } else {
            localStorage.removeItem('userProfileImage');
          }
        }
      } else {
        console.error('Failed to fetch user profile:', response.statusText, '- keeping existing user data');
      }
    } catch (error) {
      console.error('Error fetching user profile:', error, '- keeping existing user data');
    }
  };

  const login = (token: string, newAuthUser: AuthUser) => {
    console.log('🔐 Logging in user:', newAuthUser);
    
    // Validate input
    if (!token || !newAuthUser || !newAuthUser.email || !newAuthUser.name || !newAuthUser.uniqueId) {
      console.error('❌ Invalid login data provided');
      return;
    }
    
    localStorage.setItem('token', token);
    localStorage.setItem('authUser', JSON.stringify(newAuthUser));
    setAuthUser(newAuthUser);
    setIsAuthenticated(true);
    
    // Update user context with auth data and fetch complete profile
    setUser(prev => ({
      ...prev,
      name: newAuthUser.name,
      email: newAuthUser.email,
      memberId: newAuthUser.uniqueId,
      major: '', // Will be filled from user profile
      year: '', // Will be filled from user profile
    }));

    // Fetch complete user profile including avatar
    fetchUserProfile(token);
  };

  const updateProfileImage = async (image: string | null) => {
    try {
      // Update user state immediately with Base64 data
      setUser((prev) => ({ ...prev, profileImage: image }));
      
      if (image) {
        localStorage.setItem('userProfileImage', image);
      } else {
        localStorage.removeItem('userProfileImage');
      }
    } catch (error) {
      console.error('Error updating profile image:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      user, 
      authUser,
      isAuthenticated,
      isLoading,
      setUser, 
      setAuthUser,
      updateProfileImage,
      login,
      logout
    }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used within a UserProvider');
  return context;
};

// Update avatar handling in UserContext
const getAvatarUrl = (user: any) => {
  if (user?.profile?.avatar?.data) {
    // Return Base64 data directly for img src
    return user.profile.avatar.data;
  }
  if (user?.avatar?.data) {
    // Handle direct avatar field
    return user.avatar.data;
  }
  return null;
}; 