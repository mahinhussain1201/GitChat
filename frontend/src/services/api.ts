import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
});

export const repoService = {
    analyzeRepo: (repoUrl: string) => api.post('/analyze-repo', { repo_url: repoUrl }),
    getTechSummary: (repoUrl: string) => api.post('/tech-summary', { repo_url: repoUrl }),
    getNonTechSummary: (repoUrl: string) => api.post('/non-tech-summary', { repo_url: repoUrl }),
    getArchitecture: (repoUrl: string) => api.post('/architecture', { repo_url: repoUrl }),
    getSystemDesign: (repoUrl: string) => api.post('/system-design', { repo_url: repoUrl }),
    getSecurityScan: (repoUrl: string) => api.post('/security-scan', { repo_url: repoUrl }),
    getCodeAnalysis: (repoUrl: string) => api.post('/code-analysis', { repo_url: repoUrl }),
    getComplexityAnalysis: (repoUrl: string) => api.post('/complexity-analysis', { repo_url: repoUrl }),
    chat: (repoUrl: string, message: string) => api.post('/chat', { repo_url: repoUrl, message }),
};
