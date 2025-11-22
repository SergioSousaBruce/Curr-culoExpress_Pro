import React, { useState, useRef } from 'react';
import { Plus, Trash2, Download, Wand2, Upload, Calendar, ChevronDown, ChevronUp, Briefcase, GraduationCap, User, FileText, Check, Palette, Layout, PenTool, ArrowUpDown, ZoomIn, ZoomOut, Sparkles, RotateCcw } from 'lucide-react';
import { ResumeData, INITIAL_RESUME_DATA, EXAMPLE_RESUME_DATA, Experience, Education, ResumeConfig } from './types';
import ResumePreview from './components/ResumePreview';
import PaymentModal from './components/PaymentModal';
import { generateObjectiveSuggestions } from './services/geminiService';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

// Available Colors
const THEME_COLORS = [
  { name: 'Azul Executivo', value: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Verde Sucesso', value: '#059669', bg: 'bg-emerald-600' },
  { name: 'Roxo Criativo', value: '#7c3aed', bg: 'bg-violet-600' },
  { name: 'Preto Clássico', value: '#1e293b', bg: 'bg-slate-800' },
  { name: 'Vermelho Impacto', value: '#dc2626', bg: 'bg-red-600' },
];

const TEMPLATES = [
  { id: 'modern', name: 'Moderno', icon: <Layout size={20} /> },
  { id: 'classic', name: 'Clássico', icon: <FileText size={20} /> },
  { id: 'minimal', name: 'Minimalista', icon: <PenTool size={20} /> },
];

function App() {
  const [data, setData] = useState<ResumeData>(INITIAL_RESUME_DATA);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  
  // Tab State: 'content' | 'design'
  const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');
  
  // Content Sections Accordion
  const [activeSection, setActiveSection] = useState<string>('personal');
  
  // Zoom State
  const [zoomLevel, setZoomLevel] = useState(0.85);
  
  // Payment State
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handlers
  const loadExampleData = () => {
    if (window.confirm("Isso irá substituir seus dados atuais pelos dados de exemplo. Deseja continuar?")) {
      setData({
        ...EXAMPLE_RESUME_DATA,
        config: data.config // Keep current design choice
      });
    }
  };

  const clearData = () => {
    if (window.confirm("Tem certeza que deseja limpar todos os campos?")) {
      setData({
        ...INITIAL_RESUME_DATA,
        config: data.config
      });
    }
  };

  const handlePersonalInfoChange = (field: keyof typeof data.personalInfo, value: string) => {
    setData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const handleConfigChange = (field: keyof ResumeConfig, value: any) => {
    setData(prev => ({
      ...prev,
      config: { ...prev.config, [field]: value }
    }));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setData(prev => ({
          ...prev,
          personalInfo: { ...prev.personalInfo, photo: reader.result as string }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Experience Handlers
  const addExperience = () => {
    const newExp: Experience = {
      id: crypto.randomUUID(),
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    setData(prev => ({ ...prev, experience: [newExp, ...prev.experience] }));
    setActiveSection('experience');
  };

  const sortExperience = () => {
    const sorted = [...data.experience].sort((a, b) => {
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      const dateA = a.startDate ? new Date(a.startDate).getTime() : 0;
      const dateB = b.startDate ? new Date(b.startDate).getTime() : 0;
      return dateB - dateA; // Newest first
    });
    setData(prev => ({ ...prev, experience: sorted }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  // Education Handlers
  const addEducation = () => {
    const newEdu: Education = {
      id: crypto.randomUUID(),
      institution: '',
      course: '',
      type: 'Graduação',
      startDate: '',
      endDate: '',
      current: false
    };
    setData(prev => ({ ...prev, education: [newEdu, ...prev.education] }));
    setActiveSection('education');
  };

  const sortEducation = () => {
    const sorted = [...data.education].sort((a, b) => {
      if (a.current && !b.current) return -1;
      if (!a.current && b.current) return 1;
      const dateA = a.endDate ? new Date(a.endDate).getTime() : (a.startDate ? new Date(a.startDate).getTime() : 0);
      const dateB = b.endDate ? new Date(b.endDate).getTime() : (b.startDate ? new Date(b.startDate).getTime() : 0);
      return dateB - dateA;
    });
    setData(prev => ({ ...prev, education: sorted }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setData(prev => ({
      ...prev,
      education: prev.education.map(edu => edu.id === id ? { ...edu, [field]: value } : edu)
    }));
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  // AI Objective Generation
  const handleGenerateObjective = async () => {
    if (!data.personalInfo.jobTitle) {
      alert("Por favor, preencha o 'Cargo Desejado' primeiro.");
      return;
    }
    setIsGeneratingAI(true);
    try {
      const expSummary = data.experience.map(e => `${e.position} na ${e.company}`).join(', ');
      const suggestions = await generateObjectiveSuggestions(data.personalInfo.jobTitle, expSummary || 'Iniciante');
      
      if (suggestions.length > 0) {
        setData(prev => ({ ...prev, objective: suggestions[0] }));
      }
    } catch (error) {
      alert("Erro ao gerar sugestões. Verifique se a chave de API está configurada.");
    } finally {
      setIsGeneratingAI(false);
    }
  };

  // Skills
  const handleSkillsChange = (text: string) => {
    const skillsArray = text.split(',').map(s => s.trim()).filter(s => s);
    setData(prev => ({ ...prev, skills: skillsArray }));
  };

  // PDF Download Logic
  const handleDownloadClick = () => {
    if (!isPaid) {
      setShowPaymentModal(true);
    } else {
      generatePDF();
    }
  };

  const handlePaymentSuccess = () => {
    setIsPaid(true);
    setShowPaymentModal(false);
    setTimeout(() => {
      generatePDF();
    }, 500);
  };

  const generatePDF = async () => {
    setIsDownloading(true);
    const input = document.getElementById('resume-preview');
    if (!input) {
        setIsDownloading(false);
        return;
    }

    try {
      // Temporarily force opacity to 1 and scale to 1 for capture
      const originalStyle = input.getAttribute('style');
      
      const canvas = await html2canvas(input, {
        scale: 3, // Higher scale for better quality
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`CV_${data.personalInfo.fullName.replace(/\s+/g, '_') || 'Novo'}.pdf`);
    } catch (err) {
      console.error(err);
      alert("Erro ao gerar PDF. Tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col lg:flex-row font-sans h-screen overflow-hidden">
      
      {/* Sidebar */}
      <div className="w-full lg:w-[480px] bg-white shadow-2xl z-20 flex flex-col h-full border-r border-gray-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-slate-900 to-slate-800 text-white flex items-center justify-between shadow-md shrink-0">
          <div>
            <h1 className="text-xl font-bold flex items-center gap-2 tracking-tight">
              <div className="bg-blue-500 p-1.5 rounded-lg">
                <FileText size={16} className="text-white" />
              </div>
              CurrículoExpress Pro
            </h1>
            <p className="text-[10px] text-slate-400 ml-9">Crie seu futuro profissional</p>
          </div>
          
          <div className="flex items-center gap-2">
             {isPaid ? (
                <span className="bg-emerald-500 text-[10px] font-bold px-2 py-1 rounded-full text-white flex items-center gap-1 shadow-lg shadow-emerald-500/20"><Check size={10} /> PREMIUM</span>
             ) : (
                <button 
                  onClick={loadExampleData} 
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
                  title="Carregar Exemplo"
                >
                   <Sparkles size={16} className="text-yellow-400" />
                </button>
             )}
             <button 
                onClick={clearData} 
                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition"
                title="Limpar Tudo"
             >
                <RotateCcw size={16} />
             </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 bg-gray-50 shrink-0">
           <button 
             onClick={() => setActiveTab('content')}
             className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'content' ? 'bg-white text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
           >
             <FileText size={16} /> Editor
           </button>
           <button 
             onClick={() => setActiveTab('design')}
             className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-all ${activeTab === 'design' ? 'bg-white text-purple-600 border-b-2 border-purple-600' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'}`}
           >
             <Palette size={16} /> Aparência
           </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 pb-32 scroll-smooth bg-gray-50/50">
          
          {activeTab === 'content' ? (
            <>
              {/* Section: Personal Info */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md">
                <button 
                  onClick={() => setActiveSection(activeSection === 'personal' ? '' : 'personal')}
                  className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-700">
                    <div className={`p-2 rounded-lg ${activeSection === 'personal' ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                      <User size={18} />
                    </div>
                    Dados Pessoais
                  </div>
                  {activeSection === 'personal' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {activeSection === 'personal' && (
                  <div className="p-5 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-2">
                    <div className="flex flex-col items-center mb-6 mt-4">
                      <div 
                        className="w-24 h-24 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full flex flex-col items-center justify-center cursor-pointer hover:bg-white hover:border-blue-400 transition overflow-hidden relative group"
                        onClick={() => fileInputRef.current?.click()}
                      >
                          {data.personalInfo.photo ? (
                            <img src={data.personalInfo.photo} className="w-full h-full object-cover" alt="User" />
                          ) : (
                            <>
                              <Upload className="text-gray-400 mb-1 group-hover:text-blue-500" size={20} />
                              <span className="text-[10px] text-gray-400 text-center px-2 leading-tight group-hover:text-blue-500">Adicionar Foto</span>
                            </>
                          )}
                      </div>
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                      {data.personalInfo.photo && (
                        <button onClick={() => setData(prev => ({...prev, personalInfo: {...prev.personalInfo, photo: null}}))} className="text-[10px] text-red-500 mt-2 hover:underline">Remover foto</button>
                      )}
                    </div>

                    <div className="grid gap-4">
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Nome Completo</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                          value={data.personalInfo.fullName} onChange={(e) => handlePersonalInfoChange('fullName', e.target.value)} />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Cargo Desejado / Atual</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                          value={data.personalInfo.jobTitle} onChange={(e) => handlePersonalInfoChange('jobTitle', e.target.value)} />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Email</label>
                          <input type="email" className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                            value={data.personalInfo.email} onChange={(e) => handlePersonalInfoChange('email', e.target.value)} />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 mb-1 block">Telefone</label>
                          <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                            value={data.personalInfo.phone} onChange={(e) => handlePersonalInfoChange('phone', e.target.value)} />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-medium text-gray-500 mb-1 block">Endereço (Cidade/Estado)</label>
                        <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                          value={data.personalInfo.address} onChange={(e) => handlePersonalInfoChange('address', e.target.value)} />
                      </div>
                      <div>
                         <label className="text-xs font-medium text-gray-500 mb-1 block">LinkedIn (Opcional)</label>
                         <input className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white text-gray-900" 
                           value={data.personalInfo.linkedin} onChange={(e) => handlePersonalInfoChange('linkedin', e.target.value)} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Section: Objective */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md">
                <button 
                  onClick={() => setActiveSection(activeSection === 'objective' ? '' : 'objective')}
                  className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-700">
                    <div className={`p-2 rounded-lg ${activeSection === 'objective' ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'}`}>
                       <Wand2 size={18} />
                    </div>
                    Objetivo Profissional
                  </div>
                  {activeSection === 'objective' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {activeSection === 'objective' && (
                  <div className="p-5 pt-0 space-y-3 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-2">
                    <div className="bg-purple-50 p-3 rounded-lg flex justify-between items-center mt-3 border border-purple-100">
                      <p className="text-xs text-purple-700 font-medium">Sem ideias? Use a IA para escrever.</p>
                      <button 
                        onClick={handleGenerateObjective}
                        disabled={isGeneratingAI}
                        className="flex items-center gap-2 text-xs bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 transition font-medium disabled:opacity-50 shadow-sm"
                      >
                        <Wand2 size={12} />
                        {isGeneratingAI ? 'Gerando...' : 'Gerar Texto'}
                      </button>
                    </div>
                    <textarea 
                      placeholder="Ex: Profissional com 5 anos de experiência em vendas..." 
                      rows={5}
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-none resize-none text-sm leading-relaxed bg-white text-gray-900"
                      value={data.objective}
                      onChange={(e) => setData({...data, objective: e.target.value})}
                    />
                  </div>
                )}
              </div>

              {/* Section: Experience */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md">
                <button 
                  onClick={() => setActiveSection(activeSection === 'experience' ? '' : 'experience')}
                  className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-700">
                     <div className={`p-2 rounded-lg ${activeSection === 'experience' ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-500'}`}>
                        <Briefcase size={18} />
                     </div>
                    Experiência
                  </div>
                  {activeSection === 'experience' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {activeSection === 'experience' && (
                  <div className="p-5 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-2">
                    <div className="flex justify-end mb-2">
                       <button onClick={sortExperience} className="text-xs flex items-center gap-1 text-orange-600 font-medium hover:underline">
                          <ArrowUpDown size={12} /> Ordenar p/ Data
                       </button>
                    </div>
                    <div className="space-y-4">
                      {data.experience.map((exp, index) => (
                        <div key={exp.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative group">
                          <button onClick={() => removeExperience(exp.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition p-1 bg-white rounded shadow-sm border border-gray-100"><Trash2 size={14} /></button>
                          <div className="grid gap-3 pr-6">
                            <div className="grid grid-cols-2 gap-3">
                               <input placeholder="Empresa" className="w-full p-2 bg-white border rounded text-sm font-medium text-gray-900" value={exp.company} onChange={(e) => updateExperience(exp.id, 'company', e.target.value)} />
                               <input placeholder="Cargo" className="w-full p-2 bg-white border rounded text-sm text-gray-900" value={exp.position} onChange={(e) => updateExperience(exp.id, 'position', e.target.value)} />
                            </div>
                            
                            <div className="flex gap-2">
                              <div className="w-1/2">
                                 <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Início</label>
                                 <input type="date" className="w-full p-2 bg-white border rounded text-sm text-gray-900" value={exp.startDate} onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)} />
                              </div>
                              <div className="w-1/2">
                                 <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Fim</label>
                                 <input type="date" disabled={exp.current} className="w-full p-2 bg-white border rounded text-sm disabled:bg-gray-100 text-gray-900" value={exp.endDate} onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)} />
                              </div>
                            </div>
                            
                            <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                              <input type="checkbox" checked={exp.current} onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                              Trabalho atualmente aqui
                            </label>

                            <textarea placeholder="Descrição das atividades..." className="w-full p-2 bg-white border rounded text-sm text-gray-900" rows={2} value={exp.description} onChange={(e) => updateExperience(exp.id, 'description', e.target.value)} />
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addExperience} className="w-full py-3 border border-dashed border-blue-300 rounded-lg text-blue-600 hover:bg-blue-50 transition flex items-center justify-center gap-2 text-sm font-bold">
                      <Plus size={16} /> Adicionar Experiência
                    </button>
                  </div>
                )}
              </div>

              {/* Section: Education */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md">
                <button 
                  onClick={() => setActiveSection(activeSection === 'education' ? '' : 'education')}
                  className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-700">
                    <div className={`p-2 rounded-lg ${activeSection === 'education' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                       <GraduationCap size={18} />
                    </div>
                    Formação Acadêmica
                  </div>
                  {activeSection === 'education' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {activeSection === 'education' && (
                  <div className="p-5 pt-0 space-y-4 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-2">
                    <div className="flex justify-end mb-2">
                       <button onClick={sortEducation} className="text-xs flex items-center gap-1 text-green-600 font-medium hover:underline">
                          <ArrowUpDown size={12} /> Ordenar p/ Data
                       </button>
                    </div>
                    <div className="space-y-4">
                      {data.education.map((edu) => (
                        <div key={edu.id} className="bg-gray-50 p-4 rounded-lg border border-gray-200 relative">
                           <button onClick={() => removeEducation(edu.id)} className="absolute top-3 right-3 text-gray-400 hover:text-red-500 transition p-1 bg-white rounded shadow-sm border border-gray-100"><Trash2 size={14} /></button>
                           <div className="grid gap-3 pr-6">
                              <input placeholder="Instituição" className="w-full p-2 bg-white border rounded text-sm font-medium text-gray-900" value={edu.institution} onChange={(e) => updateEducation(edu.id, 'institution', e.target.value)} />
                              <input placeholder="Curso" className="w-full p-2 bg-white border rounded text-sm text-gray-900" value={edu.course} onChange={(e) => updateEducation(edu.id, 'course', e.target.value)} />
                              
                              <div className="flex gap-3">
                                <select className="w-full p-2 bg-white border rounded text-sm text-gray-900" value={edu.type} onChange={(e) => updateEducation(edu.id, 'type', e.target.value)}>
                                  <option>Graduação</option>
                                  <option>Técnico</option>
                                  <option>Curso Livre</option>
                                  <option>Mestrado</option>
                                  <option>Doutorado</option>
                                  <option>Outro</option>
                                </select>
                              </div>

                              <div className="flex gap-2">
                                <div className="w-1/2">
                                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Início</label>
                                  <input type="date" className="w-full p-2 bg-white border rounded text-sm text-gray-900" value={edu.startDate} onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)} />
                                </div>
                                <div className="w-1/2">
                                  <label className="text-[10px] text-gray-400 uppercase tracking-wider font-bold block mb-1">Conclusão</label>
                                  <input type="date" disabled={edu.current} className="w-full p-2 bg-white border rounded text-sm disabled:bg-gray-100 text-gray-900" value={edu.endDate} onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)} />
                                </div>
                              </div>
                              
                              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                                <input type="checkbox" checked={edu.current} onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)} className="rounded text-blue-600 focus:ring-blue-500" />
                                Em andamento
                              </label>
                           </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={addEducation} className="w-full py-3 border border-dashed border-green-300 rounded-lg text-green-600 hover:bg-green-50 transition flex items-center justify-center gap-2 text-sm font-bold">
                      <Plus size={16} /> Adicionar Formação
                    </button>
                  </div>
                )}
              </div>

              {/* Section: Skills */}
              <div className="bg-white border rounded-xl shadow-sm overflow-hidden border-gray-200 transition-all duration-200 hover:shadow-md">
                <button 
                  onClick={() => setActiveSection(activeSection === 'skills' ? '' : 'skills')}
                  className="w-full p-4 flex justify-between items-center bg-white hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3 font-semibold text-gray-700">
                    <div className={`p-2 rounded-lg ${activeSection === 'skills' ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-500'}`}>
                       <Calendar size={18} />
                    </div>
                    Habilidades
                  </div>
                  {activeSection === 'skills' ? <ChevronUp size={18} className="text-gray-400" /> : <ChevronDown size={18} className="text-gray-400" />}
                </button>
                
                {activeSection === 'skills' && (
                   <div className="p-5 pt-0 animate-in fade-in slide-in-from-top-2 border-t border-gray-100 mt-2">
                     <label className="text-xs font-medium text-gray-500 mb-2 block mt-3">Liste suas habilidades técnicas e comportamentais</label>
                     <textarea 
                       placeholder="Ex: Excel Avançado, Inglês Fluente, React, Liderança, Gestão de Projetos..." 
                       rows={4}
                       className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-pink-500/20 focus:border-pink-500 outline-none resize-none text-sm bg-white text-gray-900"
                       onChange={(e) => handleSkillsChange(e.target.value)}
                       defaultValue={data.skills.join(', ')}
                     />
                     <p className="text-xs text-gray-400 mt-2 flex items-center gap-1"><Check size={12} /> Separe cada habilidade por vírgula.</p>
                   </div>
                )}
              </div>
            </>
          ) : (
            /* DESIGN TAB CONTENT */
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
              
              {/* Templates */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Layout size={16} /> Modelos
                </h3>
                <div className="grid grid-cols-1 gap-3">
                   {TEMPLATES.map((t) => (
                     <button
                       key={t.id}
                       onClick={() => handleConfigChange('templateId', t.id)}
                       className={`p-4 rounded-xl border-2 text-left transition-all flex items-center gap-4 ${data.config.templateId === t.id ? 'border-purple-600 bg-purple-50 ring-2 ring-purple-200' : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'}`}
                     >
                       <div className={`p-3 rounded-full ${data.config.templateId === t.id ? 'bg-purple-200 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>
                         {t.icon}
                       </div>
                       <div>
                         <span className={`font-bold block ${data.config.templateId === t.id ? 'text-purple-900' : 'text-gray-700'}`}>{t.name}</span>
                         <span className="text-xs text-gray-500">
                           {t.id === 'modern' && 'Barra lateral e design limpo.'}
                           {t.id === 'classic' && 'Elegante, tradicional e sério.'}
                           {t.id === 'minimal' && 'Foco total no conteúdo.'}
                         </span>
                       </div>
                       {data.config.templateId === t.id && <Check size={20} className="ml-auto text-purple-600" />}
                     </button>
                   ))}
                </div>
              </div>

              {/* Colors */}
              <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                  <Palette size={16} /> Cor de Destaque
                </h3>
                <div className="grid grid-cols-5 gap-2">
                  {THEME_COLORS.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => handleConfigChange('color', c.value)}
                      className={`w-full aspect-square rounded-lg ${c.bg} flex items-center justify-center transition-all transform hover:scale-105 ${data.config.color === c.value ? 'ring-4 ring-offset-2 ring-gray-300 scale-105' : ''}`}
                      title={c.name}
                    >
                      {data.config.color === c.value && <Check className="text-white" size={16} />}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 text-center">Define a cor de títulos e detalhes.</p>
              </div>

            </div>
          )}

        </div>

        {/* Footer Action */}
        <div className="p-5 bg-white border-t border-gray-200 absolute bottom-0 w-full lg:w-[480px] z-10">
          <button 
            onClick={handleDownloadClick}
            disabled={isDownloading}
            className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-bold py-4 rounded-xl shadow-xl shadow-green-600/20 flex items-center justify-center gap-3 transition transform active:scale-95 disabled:opacity-70"
          >
             {isDownloading ? (
                <>
                  <span className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
                  Gerando PDF...
                </>
             ) : (
               <>
                 <Download size={20} />
                 <div className="flex flex-col items-start leading-none">
                   <span className="text-sm font-bold">{isPaid ? 'BAIXAR CURRÍCULO' : 'BAIXAR PDF FINAL'}</span>
                   {!isPaid && <span className="text-[10px] font-medium opacity-80">Apenas R$ 12,00</span>}
                 </div>
               </>
             )}
          </button>
        </div>
      </div>

      {/* Right Area - Preview */}
      <div className="hidden lg:flex flex-1 bg-slate-100 h-full overflow-hidden flex-col items-center relative">
         
         <div className="absolute inset-0 opacity-5 pointer-events-none" 
            style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}>
         </div>

         {/* Zoom Controls */}
         <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur shadow-lg rounded-full px-4 py-2 flex items-center gap-4 z-30 border border-gray-200">
            <button onClick={() => setZoomLevel(Math.max(0.3, zoomLevel - 0.1))} className="text-gray-600 hover:text-blue-600"><ZoomOut size={18} /></button>
            <span className="text-xs font-mono w-12 text-center">{(zoomLevel * 100).toFixed(0)}%</span>
            <button onClick={() => setZoomLevel(Math.min(1.5, zoomLevel + 0.1))} className="text-gray-600 hover:text-blue-600"><ZoomIn size={18} /></button>
         </div>
         
         {/* Scrollable Container for Preview */}
         <div className="flex-1 w-full overflow-auto flex justify-center p-8">
            <div style={{ 
                 transform: `scale(${zoomLevel})`, 
                 transformOrigin: 'top center',
                 transition: 'transform 0.2s ease-out'
               }} className="shadow-2xl">
              <ResumePreview data={data} id="resume-preview" />
            </div>
         </div>
      </div>

      {/* Mobile Preview Button (visible only on small screens) */}
      <div className="lg:hidden fixed bottom-24 right-4 z-30">
         <button 
           className="bg-slate-900 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
           onClick={() => {
             const preview = document.getElementById('resume-preview');
             preview?.scrollIntoView({behavior: 'smooth'});
           }}
         >
           <FileText />
         </button>
      </div>

      {/* Mobile Preview Container */}
      <div className="lg:hidden bg-slate-200 p-4 overflow-x-auto">
         <div className="min-w-[210mm] mx-auto transform scale-90 origin-top-left bg-white shadow-lg">
             <ResumePreview data={data} id="resume-preview-mobile" /> 
         </div>
      </div>

      <PaymentModal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        onPaymentSuccess={handlePaymentSuccess} 
      />

    </div>
  );
}

export default App;