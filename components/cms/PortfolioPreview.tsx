import React from 'react';
import { ArrowUpRight, Globe, MapPin, Quote } from 'lucide-react';
import { PortfolioItemWithTestimonialsAndStats } from '@/actions/portfolio';
import Image from 'next/image';

interface PortfolioPreviewProps {
  workData: PortfolioItemWithTestimonialsAndStats[];
}

const PortfolioPreview = ({ workData }: PortfolioPreviewProps) => {
  // Logic to find active or default to first. 
  // Ideally, the parent passes "selectedId", but for now we preview the first item
  // OR we can make the preview follow the same selectedId logic if we lift state up.
  // For this demo, let's preview the first one or pass a prop.
  // *User note: In a real app, pass `selectedId` to this component too.*
  const project = workData[0]; // Defaulting to first for preview simplicity if ID isn't passed

  if (!project) return <div className="p-10 text-center text-slate-400">No project data found.</div>;

  return (
    <div className="bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 h-full flex flex-col font-sans">
      
      {/* Fake Browser Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-3 flex items-center gap-4 shrink-0">
        <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
            <div className="w-3 h-3 rounded-full bg-green-400"></div>
        </div>
        <div className="flex-1 bg-white border border-slate-200 rounded-md py-1 px-3 text-xs text-slate-400 text-center flex items-center justify-center gap-2">
            <Globe size={10} /> {project.website || 'website.com'}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="overflow-y-auto flex-1 relative bg-white">
        
        {/* HERO */}
        <div className="relative h-64 w-full bg-slate-900 group">
             {project.heroImage ? (
                 <Image src={project.heroImage} alt="hero" width={1000} height={400} className="w-full h-full object-cover opacity-80" />
             ) : (
                 <div className="w-full h-full bg-linear-to-br from-indigo-900 to-slate-900" />
             )}
             <div className="absolute bottom-0 left-0 w-full p-6 bg-linear-to-t from-black/80 to-transparent">
                 <div className="flex items-center gap-3 mb-2">
                    {project.companyLogo && <Image src={project.companyLogo} alt="Company Logo" width={32} height={32} className="w-8 h-8 rounded bg-white p-1" />}
                    <h1 className="text-white font-bold text-2xl">{project.companyName}</h1>
                 </div>
                 <p className="text-slate-200 text-sm font-light max-w-md">{project.heroLine}</p>
             </div>
        </div>

        <div className="p-8 space-y-10">
            
            {/* META GRID */}
            <div className="grid grid-cols-2 gap-y-6 gap-x-4 border-b border-slate-100 pb-8">
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Industry</div>
                    <div className="text-sm font-semibold text-slate-800">{project.industry}</div>
                </div>
                <div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Location</div>
                    <div className="text-sm font-semibold text-slate-800 flex items-center gap-1">
                        <MapPin size={12} className="text-indigo-500"/> {project.location}
                    </div>
                </div>
                <div className="col-span-2">
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Services</div>
                    <div className="flex flex-wrap gap-2">
                        {project.services.map((s, i) => (
                            <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-sm border border-slate-200">
                                {s}
                            </span>
                        ))}
                    </div>
                </div>
            </div>

            {/* PROBLEM / SOLUTION */}
            <div className="grid grid-cols-1 gap-8">
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">The Challenge</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{project.problemStatement}</p>
                </div>
                <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-3">Our Solution</h3>
                    <p className="text-slate-600 text-sm leading-relaxed">{project.solution}</p>
                </div>
            </div>

            {/* RESULTS STATS */}
            {project.stats && (
                <div className="bg-slate-900 rounded-xl p-6 text-white grid grid-cols-3 divide-x divide-slate-700">
                    <div className="px-2 text-center">
                        <div className="text-2xl font-bold text-indigo-400">{project.stats?.conversionRateIncrease}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">Conv. Rate</div>
                    </div>
                    <div className="px-2 text-center">
                        <div className="text-2xl font-bold text-indigo-400">{project.stats?.trafficGrowth}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">Traffic</div>
                    </div>
                    <div className="px-2 text-center">
                        <div className="text-2xl font-bold text-indigo-400">{project.stats?.userGrowth}</div>
                        <div className="text-[10px] uppercase tracking-wide text-slate-400 mt-1">Users</div>
                    </div>
                </div>
            )}

            {/* TESTIMONIAL */}
            {project.testimonial && (
                <div className="relative pl-8 italic text-slate-600 border-l-4 border-indigo-200">
                    <Quote className="absolute -top-2 left-6 text-indigo-100 fill-indigo-50" size={40} />
                    <p className="mb-4 relative z-10">&quot;{project.testimonial.quote}&quot;</p>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs text-slate-500">
                            {project.testimonial.author.charAt(0)}
                        </div>
                        <div>
                            <div className="text-xs font-bold text-slate-900">{project.testimonial.author}</div>
                            <div className="text-[10px] text-slate-400 uppercase">{project.testimonial.designation}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* MEDIA GALLERY */}
            {project.media && project.media.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                    {project.media.map((img, idx) => (
                        <div key={idx} className={`rounded-lg overflow-hidden border border-slate-100 ${idx === 0 ? 'col-span-2 aspect-video' : 'aspect-square'}`}>
                            {/* Placeholder check for demo */}
                            <Image src={img} alt="work" width={1000} height={1000} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                        </div>
                    ))}
                </div>
            )}

            <div className="pt-8">
                 <a href={project.website} target="_blank" className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
                    Visit Live Project <ArrowUpRight size={18} />
                 </a>
            </div>

        </div>
      </div>
    </div>
  );
};

export default PortfolioPreview;