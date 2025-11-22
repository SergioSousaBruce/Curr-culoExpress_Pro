export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

export interface Education {
  id: string;
  institution: string;
  course: string;
  type: 'Graduação' | 'Técnico' | 'Curso Livre' | 'Mestrado' | 'Doutorado' | 'Outro';
  startDate: string;
  endDate: string;
  current: boolean;
}

export interface ResumeConfig {
  templateId: 'modern' | 'classic' | 'minimal';
  color: string;
}

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    linkedin?: string;
    address?: string;
    photo?: string | null; // Base64 string
    jobTitle: string;
  };
  objective: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
  config: ResumeConfig;
}

export const INITIAL_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: '',
    email: '',
    phone: '',
    jobTitle: '',
    address: '',
    photo: null,
  },
  objective: '',
  experience: [],
  education: [],
  skills: [],
  config: {
    templateId: 'modern',
    color: '#2563eb', // Default Blue
  }
};

export const EXAMPLE_RESUME_DATA: ResumeData = {
  personalInfo: {
    fullName: 'Ana Silva',
    email: 'ana.silva@email.com.br',
    phone: '(11) 99876-5432',
    jobTitle: 'Gerente de Marketing Digital',
    address: 'São Paulo, SP',
    linkedin: 'linkedin.com/in/ana-silva-mkt',
    photo: null, // User usually uploads their own, keeping null to avoid broken external links
  },
  objective: 'Profissional com mais de 8 anos de experiência em estratégias de marketing digital, liderança de equipes e gestão de marca. Focada em resultados, aumento de ROI e implementação de metodologias ágeis em departamentos de comunicação.',
  experience: [
    {
      id: 'exp-1',
      company: 'Tech Solutions Ltda',
      position: 'Coordenadora de Marketing',
      startDate: '2021-03-01',
      endDate: '',
      current: true,
      description: 'Responsável pela gestão de equipe de 10 pessoas, planejamento de campanhas de inbound marketing e análise de métricas de performance (KPIs). Aumentei o lead scoring em 40% no primeiro ano.'
    },
    {
      id: 'exp-2',
      company: 'Agência Criativa',
      position: 'Analista de Mídia Senior',
      startDate: '2018-01-15',
      endDate: '2021-02-20',
      current: false,
      description: 'Gestão de tráfego pago (Google Ads, Meta Ads) com verba mensal de R$ 50k. Criação de relatórios gerenciais e otimização de conversão (CRO).'
    }
  ],
  education: [
    {
      id: 'edu-1',
      institution: 'USP - Universidade de São Paulo',
      course: 'Publicidade e Propaganda',
      type: 'Graduação',
      startDate: '2014-02-01',
      endDate: '2017-12-15',
      current: false
    },
    {
      id: 'edu-2',
      institution: 'FGV',
      course: 'MBA em Gestão Empresarial',
      type: 'Mestrado',
      startDate: '2019-03-01',
      endDate: '2020-12-20',
      current: false
    }
  ],
  skills: [
    'Liderança de Equipes', 'Google Analytics 4', 'SEO & SEM', 'Gestão de Projetos (Scrum)', 'Inglês Fluente', 'CRM (Salesforce)', 'Copywriting'
  ],
  config: {
    templateId: 'modern',
    color: '#2563eb'
  }
};