import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "../services/apiClient";
import type { Lead, LeadStatus, Pagination } from "../types/crm";

type LeadsResponse = { leads: Lead[]; pagination: Pagination };
type LeadPayload = Omit<Partial<Lead>, "id" | "status"> & { name: string };

export function useLeads(page = 1, search = "") {
  return useQuery<LeadsResponse>({
    queryKey: ["leads", page, search],
    queryFn: async () =>
      (
        await api.get(
          `/leads?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
        )
      ).data,
  });
}

export function useLeadBoard() {
  return useQuery<Record<LeadStatus, Lead[]>>({
    queryKey: ["leads", "board"],
    queryFn: async () => (await api.get("/leads/board")).data.board,
  });
}

export function useCreateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: LeadPayload) => api.post("/leads", payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<Lead> }) =>
      api.patch(`/leads/${id}`, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useUpdateLeadStatus() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: LeadStatus }) =>
      api.patch(`/leads/${id}/status`, { status }),
    onSuccess: () => client.invalidateQueries({ queryKey: ["leads"] }),
  });
}

export function useDeleteLead() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/leads/${id}`),
    onSuccess: () => client.invalidateQueries({ queryKey: ["leads"] }),
  });
}
