import React from 'react';
import { ResumeData } from '../types';
import { format, parseISO, isValid } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MapPin, Mail, Phone, Linkedin, Globe, User } from 'lucide-react';

interface ResumePreviewProps {
  data: ResumeData;
  id?: string;
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const date = parseISO(dateStr);
  if (!isValid(date)) return dateStr;
  return format(date, 'MMM yyyy', { locale: ptBR });
};

const calculateDuration = (start: string, end: string, current: boolean) => {
  if (!start) return '';
  const startDate = parseISO(start);
  const endDate = current ? new Date() : (end ? parseISO(end) : null);
  if (!isValid(startDate) || (endDate && !isValid(endDate))) return '';
  if (!endDate) return '';
  const totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 + (endDate.getMonth() - startDate.getMonth());
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  const parts = [];
  if (years > 0) parts.push(`${years} ano${years > 1 ? 's' : ''}`);
  if (months > 0) parts.push(`${months} m${months > 1 ? 'es' : 'ês'}`);
  return parts.length > 0 ? `(${parts.join(' e ')})` : '';
};

const ResumePreview: React.FC<ResumePreviewProps> = ({ data, id }) => {
  const { config } = data;
  
  // Render based on selected template
  switch (config.templateId) {
    case 'classic':
      return <ClassicTemplate data={data} id={id} />;
    case 'minimal':
      return <MinimalTemplate data={data} id={id} />;
    case 'modern':
    default:
      return <ModernTemplate data={data} id={id} />;
  }
};

/* -------------------------------------------------------------------------- */
/*                                MODERN TEMPLATE                             */
/* -------------------------------------------------------------------------- */
const ModernTemplate: React.FC<ResumePreviewProps> = ({ data, id }) => {
  const { personalInfo, objective, experience, education, skills, config } = data;

  return (
    <div id={id} className="w-full bg-white shadow-2xl mx-auto overflow-hidden relative text-gray-800 font-sans" style={{ width: '210mm', minHeight: '297mm', padding: '0' }}>
      <div className="flex h-full min-h-[297mm]">
        {/* Sidebar - LIGHT VERSION */}
        <div className="w-[32%] bg-gray-50 text-gray-800 flex flex-col border-r border-gray-200">
          
          {/* Photo Area */}
          <div className="p-6 flex justify-center items-center bg-gray-100/50 border-b border-gray-200">
             {personalInfo.photo ? (
               <img src={personalInfo.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-md" />
             ) : (
               <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-white shadow-sm">
                 <User size={48} />
               </div>
             )}
          </div>

          {/* Sidebar Content */}
          <div className="p-6 space-y-8 flex-1">
            
            {/* Contact */}
            <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-300 pb-2">Contato</h3>
               <ul className="space-y-4 text-sm text-gray-600">
                  {personalInfo.phone && <li className="flex items-start gap-3"><Phone size={16} className="shrink-0 mt-0.5" style={{color: config.color}} /> <span>{personalInfo.phone}</span></li>}
                  {personalInfo.email && <li className="flex items-start gap-3 break-all"><Mail size={16} className="shrink-0 mt-0.5" style={{color: config.color}} /> <span>{personalInfo.email}</span></li>}
                  {personalInfo.address && <li className="flex items-start gap-3"><MapPin size={16} className="shrink-0 mt-0.5" style={{color: config.color}} /> <span>{personalInfo.address}</span></li>}
                  {personalInfo.linkedin && <li className="flex items-start gap-3 break-all"><Linkedin size={16} className="shrink-0 mt-0.5" style={{color: config.color}} /> <span>LinkedIn</span></li>}
               </ul>
            </div>

            {/* Education */}
            {education.length > 0 && (
              <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-300 pb-2">Formação</h3>
                <div className="space-y-4">
                  {education.map((edu) => (
                    <div key={edu.id}>
                      <h4 className="font-bold text-gray-800 text-sm">{edu.course}</h4>
                      <p className="text-xs text-gray-600 font-medium">{edu.institution}</p>
                      <p className="text-[10px] text-gray-500 mt-1">
                        {formatDate(edu.startDate)} - {edu.current ? 'Atualmente' : formatDate(edu.endDate)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {skills.length > 0 && (
              <div>
                 <h3 className="text-xs font-bold uppercase tracking-widest text-gray-900 mb-4 border-b border-gray-300 pb-2">Habilidades</h3>
                 <div className="flex flex-wrap gap-2">
                   {skills.map((skill, idx) => (
                     <span key={idx} className="text-xs bg-white border border-gray-200 px-2 py-1 rounded text-gray-700 font-medium shadow-sm">
                       {skill}
                     </span>
                   ))}
                 </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-white p-8 flex flex-col">
          
          {/* Header */}
          <div className="mb-8 pb-6 border-b border-gray-100">
             <h1 className="text-4xl font-bold uppercase tracking-tight text-slate-900" style={{color: config.color}}>{personalInfo.fullName || 'Seu Nome'}</h1>
             <h2 className="text-xl text-slate-500 font-medium mt-1 tracking-wide">{personalInfo.jobTitle || 'Cargo Desejado'}</h2>
          </div>

          {/* Objective */}
          {objective && (
             <div className="mb-8">
               <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center gap-2">
                 <span className="w-8 h-1 rounded-full" style={{backgroundColor: config.color}}></span>
                 Objetivo
               </h3>
               <p className="text-sm text-slate-600 leading-relaxed text-justify">
                 {objective}
               </p>
             </div>
          )}

          {/* Experience */}
          {experience.length > 0 && (
             <div className="flex-1">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-6 flex items-center gap-2">
                  <span className="w-8 h-1 rounded-full" style={{backgroundColor: config.color}}></span>
                  Experiência Profissional
                </h3>
                <div className="space-y-6 pl-2">
                   {experience.map((exp) => (
                     <div key={exp.id} className="relative pl-6 border-l-2 border-gray-100">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full" style={{backgroundColor: config.color}}></div>
                        <div className="flex justify-between items-baseline mb-1">
                          <h4 className="font-bold text-slate-800 text-base">{exp.position}</h4>
                          <span className="text-xs font-semibold whitespace-nowrap px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                            {formatDate(exp.startDate)} – {exp.current ? 'Presente' : formatDate(exp.endDate)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mb-2 text-sm">
                           <span className="font-semibold text-slate-500">{exp.company}</span>
                           <span className="text-[10px] text-slate-400">• {calculateDuration(exp.startDate, exp.endDate, exp.current)}</span>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">
                          {exp.description}
                        </p>
                     </div>
                   ))}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                CLASSIC TEMPLATE                            */
/* -------------------------------------------------------------------------- */
const ClassicTemplate: React.FC<ResumePreviewProps> = ({ data, id }) => {
  const { personalInfo, objective, experience, education, skills, config } = data;

  return (
    <div id={id} className="w-full bg-white shadow-2xl mx-auto overflow-hidden relative text-gray-900 font-serif" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 20mm' }}>
      
      {/* Header Center */}
      <div className="text-center mb-8 border-b-2 border-gray-800 pb-6">
        <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-widest mb-2">{personalInfo.fullName || 'Seu Nome'}</h1>
        <h2 className="text-lg italic text-gray-600 mb-4">{personalInfo.jobTitle || 'Cargo Desejado'}</h2>
        
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-gray-600 font-sans">
          {personalInfo.email && <span>{personalInfo.email}</span>}
          {personalInfo.phone && <span>• {personalInfo.phone}</span>}
          {personalInfo.address && <span>• {personalInfo.address}</span>}
          {personalInfo.linkedin && <span>• LinkedIn</span>}
        </div>
      </div>

      {/* Two Columns for content if needed, but Classic usually flows top down. Let's do flow. */}
      <div className="space-y-6">
        
        {/* Objective */}
        {objective && (
          <section>
             <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 font-sans" style={{color: config.color}}>Resumo Profissional</h3>
             <p className="text-sm leading-relaxed text-justify text-gray-700">
               {objective}
             </p>
          </section>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <section>
            <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-4 pb-1 font-sans" style={{color: config.color}}>Experiência</h3>
            <div className="space-y-5">
              {experience.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-end mb-1 font-sans">
                     <h4 className="font-bold text-base text-gray-800">{exp.company}</h4>
                     <span className="text-xs font-bold text-gray-500">{formatDate(exp.startDate)} - {exp.current ? 'Presente' : formatDate(exp.endDate)}</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm italic font-semibold text-gray-600" style={{color: config.color}}>{exp.position}</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education & Skills Row */}
        <div className="flex gap-8">
           {/* Education */}
           {education.length > 0 && (
             <section className="flex-1">
               <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 font-sans" style={{color: config.color}}>Educação</h3>
               <div className="space-y-3">
                 {education.map((edu) => (
                   <div key={edu.id}>
                     <h4 className="font-bold text-sm text-gray-800 font-sans">{edu.institution}</h4>
                     <div className="flex justify-between">
                        <span className="text-sm italic text-gray-600">{edu.course}</span>
                        <span className="text-xs text-gray-500 font-sans">{formatDate(edu.startDate)} - {edu.endDate ? formatDate(edu.endDate) : 'Atual'}</span>
                     </div>
                   </div>
                 ))}
               </div>
             </section>
           )}

            {/* Skills */}
            {skills.length > 0 && (
              <section className="flex-1">
                 <h3 className="text-sm font-bold uppercase border-b border-gray-300 mb-3 pb-1 font-sans" style={{color: config.color}}>Competências</h3>
                 <div className="flex flex-wrap gap-x-2 gap-y-1 font-sans text-sm text-gray-700">
                   {skills.map((skill, idx) => (
                     <span key={idx}>• {skill}</span>
                   ))}
                 </div>
              </section>
            )}
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/*                                MINIMAL TEMPLATE                            */
/* -------------------------------------------------------------------------- */
const MinimalTemplate: React.FC<ResumePreviewProps> = ({ data, id }) => {
  const { personalInfo, objective, experience, education, skills, config } = data;

  return (
    <div id={id} className="w-full bg-white shadow-2xl mx-auto overflow-hidden relative text-slate-800 font-sans" style={{ width: '210mm', minHeight: '297mm', padding: '15mm 15mm' }}>
      
      {/* Header Left Aligned */}
      <div className="flex justify-between items-start mb-10">
         <div>
            <h1 className="text-5xl font-extrabold tracking-tight text-slate-900 mb-2" style={{color: config.color}}>{personalInfo.fullName || 'Nome'}</h1>
            <h2 className="text-2xl font-light text-slate-400">{personalInfo.jobTitle || 'Cargo'}</h2>
         </div>
         <div className="text-right text-xs font-medium text-slate-500 space-y-1">
            {personalInfo.email && <div className="flex items-center justify-end gap-2"><span>{personalInfo.email}</span> <Mail size={12} /></div>}
            {personalInfo.phone && <div className="flex items-center justify-end gap-2"><span>{personalInfo.phone}</span> <Phone size={12} /></div>}
            {personalInfo.address && <div className="flex items-center justify-end gap-2"><span>{personalInfo.address}</span> <MapPin size={12} /></div>}
            {personalInfo.linkedin && <div className="flex items-center justify-end gap-2"><span>LinkedIn</span> <Globe size={12} /></div>}
         </div>
      </div>

      <div className="grid grid-cols-12 gap-8">
        
        {/* Main Column */}
        <div className="col-span-8 space-y-8">
           
           {objective && (
             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Perfil</h3>
               <p className="text-sm text-slate-700 leading-relaxed border-l-2 border-slate-200 pl-4">
                 {objective}
               </p>
             </div>
           )}

           {experience.length > 0 && (
             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Histórico Profissional</h3>
               <div className="space-y-8">
                 {experience.map((exp) => (
                   <div key={exp.id} className="group">
                      <div className="flex items-baseline gap-3 mb-1">
                        <h4 className="text-lg font-bold text-slate-900" style={{color: config.color}}>{exp.position}</h4>
                        <span className="text-xs font-medium text-slate-400">na {exp.company}</span>
                      </div>
                      <div className="mb-2">
                         <span className="text-xs font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                           {formatDate(exp.startDate)} — {exp.current ? 'Atual' : formatDate(exp.endDate)}
                         </span>
                      </div>
                      <p className="text-sm text-slate-600 leading-relaxed mt-2">
                        {exp.description}
                      </p>
                   </div>
                 ))}
               </div>
             </div>
           )}
        </div>

        {/* Side Column */}
        <div className="col-span-4 space-y-8 pt-2">
           
           {personalInfo.photo && (
              <div className="mb-6">
                 <img src={personalInfo.photo} alt="Profile" className="w-full h-auto object-cover rounded-lg grayscale opacity-90 hover:grayscale-0 transition duration-500" />
              </div>
           )}

           {education.length > 0 && (
             <div>
               <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Educação</h3>
               <div className="space-y-4">
                 {education.map((edu) => (
                   <div key={edu.id}>
                     <h4 className="font-bold text-sm text-slate-900">{edu.course}</h4>
                     <p className="text-xs text-slate-500">{edu.institution}</p>
                     <p className="text-[10px] text-slate-400 mt-0.5">{formatDate(edu.startDate).split(' ')[1]} - {edu.current ? 'Atual' : formatDate(edu.endDate).split(' ')[1]}</p>
                   </div>
                 ))}
               </div>
             </div>
           )}

           {skills.length > 0 && (
             <div>
                <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Expertise</h3>
                <div className="flex flex-col gap-2">
                  {skills.map((skill, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                      <span className="text-sm text-slate-600 font-medium">{skill}</span>
                    </div>
                  ))}
                </div>
             </div>
           )}

        </div>
      </div>
    </div>
  );
};

export default ResumePreview;