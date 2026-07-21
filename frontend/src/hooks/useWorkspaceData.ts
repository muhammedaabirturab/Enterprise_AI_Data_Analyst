import { useCallback, useEffect, useState } from "react";

import { getAIInsights } from "../services/aiService";
import { getCorrelation, getNullHeatmap, profileDataset } from "../services/datasetService";
import { getRecommendations } from "../services/mlService";
import { AIReport, MLRecommendation, ProfileResponse } from "../types";

interface WorkspaceData {
  profile: ProfileResponse | null;
  correlation: { columns: string[]; matrix: (number | null)[][] } | null;
  nullHeatmap: { columns: string[]; matrix: number[][] } | null;
  insights: AIReport | null;
  recommendations: MLRecommendation[];
  loading: boolean;
  refetchProfile: () => Promise<void>;
  refetchInsights: () => Promise<void>;
  refetchAll: () => Promise<void>;
}

export function useWorkspaceData(datasetId: number | undefined): WorkspaceData {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [correlation, setCorrelation] = useState<{ columns: string[]; matrix: (number | null)[][] } | null>(null);
  const [nullHeatmap, setNullHeatmap] = useState<{ columns: string[]; matrix: number[][] } | null>(null);
  const [insights, setInsights] = useState<AIReport | null>(null);
  const [recommendations, setRecommendations] = useState<MLRecommendation[]>([]);
  const [loading, setLoading] = useState(false);

  const refetchProfile = useCallback(async () => {
    if (!datasetId) return;
    const [p, c, n] = await Promise.all([
      profileDataset(datasetId),
      getCorrelation(datasetId),
      getNullHeatmap(datasetId),
    ]);
    setProfile(p);
    setCorrelation(c);
    setNullHeatmap(n);
  }, [datasetId]);

  const refetchInsights = useCallback(async () => {
    if (!datasetId) return;
    const [ai, recs] = await Promise.all([getAIInsights(datasetId), getRecommendations(datasetId)]);
    setInsights(ai);
    setRecommendations(recs);
  }, [datasetId]);

  const refetchAll = useCallback(async () => {
    if (!datasetId) return;
    setLoading(true);
    try {
      await Promise.all([refetchProfile(), refetchInsights()]);
    } finally {
      setLoading(false);
    }
  }, [datasetId, refetchProfile, refetchInsights]);

  useEffect(() => {
    if (datasetId) refetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [datasetId]);

  return { profile, correlation, nullHeatmap, insights, recommendations, loading, refetchProfile, refetchInsights, refetchAll };
}
