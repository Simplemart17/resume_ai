import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ResumeTemplate {
  id: string;
  name: string;
  description: string;
  preview: string;
}

export const resumeTemplates: ResumeTemplate[] = [
  {
    id: 'modern',
    name: 'Modern Professional',
    description: 'Clean, modern design with accent colors',
    preview: '/templates/modern-preview.png'
  },
  {
    id: 'classic',
    name: 'Classic Traditional',
    description: 'Traditional format preferred by conservative industries',
    preview: '/templates/classic-preview.png'
  },
  {
    id: 'creative',
    name: 'Creative Designer',
    description: 'Bold design for creative professionals',
    preview: '/templates/creative-preview.png'
  }
];

export class PDFGenerator {
  private static formatResumeForTemplate(resumeText: string, templateId: string): string {
    // Parse the resume text and format it according to the template
    const sections = this.parseResumeText(resumeText);
    
    switch (templateId) {
      case 'modern':
        return this.formatModernTemplate(sections);
      case 'classic':
        return this.formatClassicTemplate(sections);
      case 'creative':
        return this.formatCreativeTemplate(sections);
      default:
        return this.formatModernTemplate(sections);
    }
  }

  private static parseResumeText(text: string) {
    // Basic parsing logic to extract sections
    const sections: Record<string, string> = {};
    const lines = text.split('\n');
    let currentSection = 'summary';
    let currentContent: string[] = [];

    for (const line of lines) {
      const trimmedLine = line.trim();
      
      // Detect section headers
      if (this.isSectionHeader(trimmedLine)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent.join('\n');
        }
        currentSection = this.getSectionKey(trimmedLine);
        currentContent = [];
      } else if (trimmedLine) {
        currentContent.push(trimmedLine);
      }
    }
    
    // Add the last section
    if (currentContent.length > 0) {
      sections[currentSection] = currentContent.join('\n');
    }

    return sections;
  }

  private static isSectionHeader(line: string): boolean {
    const headers = [
      'professional summary', 'summary', 'objective',
      'work experience', 'experience', 'employment',
      'education', 'skills', 'certifications',
      'projects', 'achievements', 'awards'
    ];
    
    return headers.some(header => 
      line.toLowerCase().includes(header) && line.length < 50
    );
  }

  private static getSectionKey(line: string): string {
    const lowerLine = line.toLowerCase();
    if (lowerLine.includes('summary') || lowerLine.includes('objective')) return 'summary';
    if (lowerLine.includes('experience') || lowerLine.includes('employment')) return 'experience';
    if (lowerLine.includes('education')) return 'education';
    if (lowerLine.includes('skills')) return 'skills';
    if (lowerLine.includes('projects')) return 'projects';
    if (lowerLine.includes('certifications')) return 'certifications';
    return 'other';
  }

  private static formatModernTemplate(sections: Record<string, string>): string {
    return `
      <div class="resume-modern" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
        <div class="header" style="border-bottom: 3px solid #4f46e5; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #1f2937; font-size: 28px; margin: 0 0 10px 0; font-weight: 700;">Professional Resume</h1>
          <div style="color: #6b7280; font-size: 14px;">Generated with AI Resume Optimizer</div>
        </div>
        
        ${sections.summary ? `
          <div class="section" style="margin-bottom: 25px;">
            <h2 style="color: #4f46e5; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Professional Summary</h2>
            <p style="color: #374151; line-height: 1.6; margin: 0;">${sections.summary}</p>
          </div>
        ` : ''}
        
        ${sections.experience ? `
          <div class="section" style="margin-bottom: 25px;">
            <h2 style="color: #4f46e5; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Work Experience</h2>
            <div style="color: #374151; line-height: 1.6;">${sections.experience.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
        
        ${sections.skills ? `
          <div class="section" style="margin-bottom: 25px;">
            <h2 style="color: #4f46e5; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Skills</h2>
            <div style="color: #374151; line-height: 1.6;">${sections.skills.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
        
        ${sections.education ? `
          <div class="section" style="margin-bottom: 25px;">
            <h2 style="color: #4f46e5; font-size: 18px; margin: 0 0 15px 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;">Education</h2>
            <div style="color: #374151; line-height: 1.6;">${sections.education.replace(/\n/g, '<br>')}</div>
          </div>
        ` : ''}
      </div>
    `;
  }

  private static formatClassicTemplate(sections: Record<string, string>): string {
    return `
      <div class="resume-classic" style="font-family: 'Times New Roman', serif; max-width: 800px; margin: 0 auto; padding: 40px; background: white;">
        <div class="header" style="text-align: center; border-bottom: 1px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
          <h1 style="color: #000; font-size: 24px; margin: 0 0 10px 0; font-weight: bold;">RESUME</h1>
        </div>
        
        ${Object.entries(sections).map(([key, content]) => `
          <div class="section" style="margin-bottom: 20px;">
            <h2 style="color: #000; font-size: 16px; margin: 0 0 10px 0; font-weight: bold; text-transform: uppercase;">${key.replace(/([A-Z])/g, ' $1').trim()}</h2>
            <div style="color: #000; line-height: 1.5; margin-left: 20px;">${content.replace(/\n/g, '<br>')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  private static formatCreativeTemplate(sections: Record<string, string>): string {
    return `
      <div class="resume-creative" style="font-family: 'Arial', sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
        <div class="header" style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: white; font-size: 32px; margin: 0 0 10px 0; font-weight: 300; text-shadow: 2px 2px 4px rgba(0,0,0,0.3);">Creative Resume</h1>
        </div>
        
        <div style="background: rgba(255,255,255,0.95); color: #333; padding: 30px; border-radius: 15px;">
          ${Object.entries(sections).map(([key, content]) => `
            <div class="section" style="margin-bottom: 25px;">
              <h2 style="color: #667eea; font-size: 20px; margin: 0 0 15px 0; font-weight: 600;">${key.charAt(0).toUpperCase() + key.slice(1)}</h2>
              <div style="color: #555; line-height: 1.7;">${content.replace(/\n/g, '<br>')}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  public static async generatePDF(resumeText: string, templateId: string, filename: string = 'resume.pdf'): Promise<void> {
    try {
      // Create a temporary container for the formatted resume
      const container = document.createElement('div');
      container.innerHTML = this.formatResumeForTemplate(resumeText, templateId);
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      document.body.appendChild(container);

      // Generate canvas from HTML
      const canvas = await html2canvas(container, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      // Remove temporary container
      document.body.removeChild(container);

      // Create PDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}
