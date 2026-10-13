import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/apiClient";
import type { Company, CompanyStatus, Pagination } from "../types/crm";

type CompaniesResponse = { companies: Company[]; pagination: Pagination };
export type CompanyPayload = Omit<Partial<Company>, "id" | "createdAt" | "updatedAt"> & { name: string };

export function useCompanies(page: number, search: string, status: CompanyStatus | "all") {
  return useQuery<CompaniesResponse>({
    queryKey: ["companies", page, search, status],
    queryFn: async () => {
      const { data } = await api.get("/companies", {
        params: { page, limit: 10, ...(search.trim() ? { search: search.trim() } : {}), ...(status !== "all" ? { status } : {}) },
      });
      return data;
    },
    placeholderData: (previous) => previous,
  });
}

function invalidate(client: ReturnType<typeof useQueryClient>) {
  return () => client.invalidateQueries({ queryKey: ["companies"] });
}

export function useCreateCompany() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (payload: CompanyPayload) => api.post("/companies", payload), onSuccess: invalidate(client) });
}

export function useUpdateCompany() {
  const client = useQueryClient();
  return useMutation({ mutationFn: ({ id, payload }: { id: string; payload: CompanyPayload }) => api.patch(`/companies/${id}`, payload), onSuccess: invalidate(client) });
}

export function useDeleteCompany() {
  const client = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api.delete(`/companies/${id}`), onSuccess: invalidate(client) });
}
