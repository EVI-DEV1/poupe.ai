import { useCallback, useEffect, useState } from 'react';

import { buildAIPrompt } from '@/data/aiPrompt';
import { useSimulationStorage } from '@/hooks/useSimulationStorage';
import { getInsight, type InsightData } from '@/services/aiService';

export const useInsight = (id: string) => {
  const [insight, setInsight] = useState<InsightData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { getFormData } = useSimulationStorage();

  // Necessário o uso do useCallback pois temos que colocar essa função
  // Como array de dependências do useEffect
  const fetchInsight = useCallback(
    async (simulationId: string) => {
      const simulation = getFormData(simulationId);

      if (!simulation) {
        setError('Simulação não encontrada.');
        return;
      }

      setIsLoading(true);
      setError(null);
      try {
        const prompt = buildAIPrompt(simulation);
        const data = await getInsight(prompt);
        setInsight(data);
      } catch {
        setError('Erro ao gerar o diagnóstico. Tente novamente.');
      } finally {
        setIsLoading(false);
      }
    },
    [getFormData]
  );
  useEffect(() => {
    //Evita loop infinito de requisições para o API do Gemini
    if (insight || isLoading || error) {
      return;
    }

    fetchInsight(id);
  }, [id, insight, isLoading, error, fetchInsight]);
  return { insight, isLoading, error, fetchInsight };
};
