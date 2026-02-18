import { useState } from "react";
import { Project } from "../types";
import { fetchKnowledgeBases } from "../lib/api";

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchKnowledgeBases();
      setProjects(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      setError(errorMessage);
      console.error("Error fetching projects:", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
  };
}
