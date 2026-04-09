const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = {
  async request(endpoint: string, options: RequestInit = {}) {
    const url = \\;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    const headers: any = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    
    if (token) {
      headers['Authorization'] = Bearer \;
    }
    
    const response = await fetch(url, {
      ...options,
      headers,
    });
    
    if (!response.ok) {
      throw new Error(API Error: \);
    }
    
    return response.json();
  },

  auth: {
    register: (name: string, email: string, password: string) =>
      apiClient.request('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
      }),
    
    login: (email: string, password: string) =>
      apiClient.request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),
  },

  teams: {
    create: (name: string, description: string) =>
      apiClient.request('/teams/', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),
    
    addMember: (teamId: number, userId: number) =>
      apiClient.request(/teams/\/members/\, {
        method: 'POST',
      }),
  },

  projects: {
    create: (name: string, description: string, teamId?: number) =>
      apiClient.request('/projects/', {
        method: 'POST',
        body: JSON.stringify({ name, description, team_id: teamId }),
      }),
    
    assignTeam: (projectId: number, teamId: number) =>
      apiClient.request(/projects/\/assign-team/\, {
        method: 'POST',
      }),
  },

  sprints: {
    create: (name: string, goal: string, startDate: string, endDate: string, projectId: number) =>
      apiClient.request('/sprints/', {
        method: 'POST',
        body: JSON.stringify({ name, goal, start_date: startDate, end_date: endDate, project_id: projectId }),
      }),
  },

  tasks: {
    create: (title: string, description: string, priority: string, estimateHours: number, sprintId: number) =>
      apiClient.request('/tasks/', {
        method: 'POST',
        body: JSON.stringify({ title, description, priority, estimate_hours: estimateHours, sprint_id: sprintId }),
      }),
  },
};
