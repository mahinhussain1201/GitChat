import axios from 'axios';

const api = axios.create({
    baseURL: 'http://127.0.0.1:8000',
});

export const repoService = {
    analyzeRepo: (repoUrl: string) => api.post('/analyze-repo', { repo_url: repoUrl }),
    getTechSummary: (repoUrl: string) => api.post('/tech-summary', { repo_url: repoUrl }),
    getNonTechSummary: (repoUrl: string) => api.post('/non-tech-summary', { repo_url: repoUrl }),
    getArchitecture: (repoUrl: string) => api.post('/architecture', { repo_url: repoUrl }),
    getSystemDesign: (repoUrl: string) => api.post('/system-design', { repo_url: repoUrl }),
    getSecurityScan: (repoUrl: string) => api.post('/security-scan', { repo_url: repoUrl }),
    chat: (repoUrl: string, message: string) => api.post('/chat', { repo_url: repoUrl, message }),
};
