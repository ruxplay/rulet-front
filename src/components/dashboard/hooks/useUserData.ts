import { useGetUserByUsernameQuery } from '@/store/api/userApi';
import { useAuth } from '@/components/layout/hooks/useAuth';

export const useUserData = () => {
  const { authState } = useAuth();
  const username = authState.user?.username;
  
  return useGetUserByUsernameQuery(username!, {
    skip: !username, // Solo ejecutar si hay username
  });
};
