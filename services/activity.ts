import { api } from "./http-client";
import type { Activity, ActivityListResponse, ActivityQueryParams } from "@/types/api";

export const getActivities = (params?: ActivityQueryParams): Promise<ActivityListResponse> =>
  api.get("/activity", { params });

export const getActivity = (id: string): Promise<Activity> => api.get(`/activity/${id}`);
