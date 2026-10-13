import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/apiClient";
import type { Role, User } from "../types/crm";

type AdminUsersResponse = {
  users: User[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export function useAdminUsers(page = 1, search = "") {
  return useQuery<AdminUsersResponse>({
    queryKey: ["admin-users", page, search],
    queryFn: async () =>
      (
        await api.get(
          `/admin/users?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
        )
      ).data,
  });
}

export function useChangeUserRole() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
      api.patch(`/admin/users/${id}/role`, { role }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["admin-users"] }),
  });
}
