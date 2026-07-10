import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import type { User } from "@shared/models/auth";

export function useAuth() {
  const baseUrl = (import.meta.env.BASE_URL ?? "/").toString();
  const prefersOffline = baseUrl !== "/";
  const [isOffline, setIsOffline] = useState(prefersOffline);
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useQuery<User | null>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      if (prefersOffline) {
        setIsOffline(true);
        return null;
      }
      const response = await fetch("/api/auth/user", {
        credentials: "include",
      });

      if (response.status === 404) {
        setIsOffline(true);
        return null;
      }

      if (response.status === 401) {
        setIsOffline(false);
        return null;
      }

      if (!response.ok) {
        setIsOffline(false);
        throw new Error(`${response.status}: ${response.statusText}`);
      }

      setIsOffline(false);
      return response.json();
    },
    retry: false,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      if (isOffline) return;
      window.location.href = "/api/logout";
    },
    onSuccess: () => {
      queryClient.setQueryData(["/api/auth/user"], null);
    },
  });

  return {
    user,
    isLoading,
    isOffline,
    isAuthenticated: !!user,
    logout: logoutMutation.mutate,
    isLoggingOut: logoutMutation.isPending,
  };
}
