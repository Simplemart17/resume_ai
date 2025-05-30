import jsPDF from 'jspdf';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
  };
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
    gpa?: string;
  }>;
  skills: string[];
}

export class NewPDFGenerator {
  private static formatDate(dateStr: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  }

  private static generateModernTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 30;

    // Header with name and contact
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 60, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.personalInfo.fullName || 'Your Name', margin, 35);
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location
    ].filter(Boolean).join(' | ');
    pdf.text(contactInfo, margin, 50);

    yPos = 80;
    pdf.setTextColor(0, 0, 0);

    // Summary
    if (data.summary) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('PROFESSIONAL SUMMARY', margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 2 * margin);
      pdf.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 5 + 10;
    }

    // Experience
    if (data.experience.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXPERIENCE', margin, yPos);
      yPos += 15;

      data.experience.forEach((exp) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(exp.position, margin, yPos);
        
        pdf.setFont('helvetica', 'normal');
        const dateRange = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}`;
        pdf.text(dateRange, pageWidth - margin - 50, yPos);
        yPos += 6;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'italic');
        pdf.text(exp.company, margin, yPos);
        yPos += 8;
        
        if (exp.description) {
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'normal');
          const descLines = pdf.splitTextToSize(exp.description, pageWidth - 2 * margin);
          pdf.text(descLines, margin, yPos);
          yPos += descLines.length * 4 + 8;
        }
      });
    }

    // Education
    if (data.education.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EDUCATION', margin, yPos);
      yPos += 15;

      data.education.forEach((edu) => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${edu.degree} in ${edu.field}`, margin, yPos);
        
        const dateRange = `${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}`;
        pdf.text(dateRange, pageWidth - margin - 50, yPos);
        yPos += 6;
        
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'normal');
        pdf.text(edu.institution, margin, yPos);
        yPos += 10;
      });
    }

    // Skills
    if (data.skills.length > 0) {
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SKILLS', margin, yPos);
      yPos += 10;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const skillsText = data.skills.join(' • ');
      const skillsLines = pdf.splitTextToSize(skillsText, pageWidth - 2 * margin);
      pdf.text(skillsLines, margin, yPos);
    }
  }

  private static generateClassicTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 30;

    // Header
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.personalInfo.fullName || 'Your Name', pageWidth / 2, yPos, { align: 'center' });
    yPos += 15;
    
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location
    ].filter(Boolean).join(' | ');
    pdf.text(contactInfo, pageWidth / 2, yPos, { align: 'center' });
    
    // Line under header
    yPos += 10;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    // Summary
    if (data.summary) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SUMMARY', margin, yPos);
      yPos += 8;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const summaryLines = pdf.splitTextToSize(data.summary, pageWidth - 2 * margin);
      pdf.text(summaryLines, margin, yPos);
      yPos += summaryLines.length * 5 + 15;
    }

    // Experience
    if (data.experience.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EXPERIENCE', margin, yPos);
      yPos += 12;

      data.experience.forEach((exp) => {
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(exp.position, margin, yPos);
        
        const dateRange = `${this.formatDate(exp.startDate)} - ${exp.current ? 'Present' : this.formatDate(exp.endDate)}`;
        pdf.text(dateRange, pageWidth - margin - 40, yPos);
        yPos += 6;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(exp.company, margin, yPos);
        yPos += 8;
        
        if (exp.description) {
          pdf.setFontSize(10);
          const descLines = pdf.splitTextToSize(exp.description, pageWidth - 2 * margin);
          pdf.text(descLines, margin, yPos);
          yPos += descLines.length * 4 + 10;
        }
      });
    }

    // Education & Skills in two columns
    const leftColWidth = (pageWidth - 3 * margin) / 2;
    const rightColStart = margin + leftColWidth + margin;
    let leftYPos = yPos;
    let rightYPos = yPos;

    // Education (left column)
    if (data.education.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('EDUCATION', margin, leftYPos);
      leftYPos += 12;

      data.education.forEach((edu) => {
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${edu.degree}`, margin, leftYPos);
        leftYPos += 5;
        
        pdf.setFont('helvetica', 'normal');
        pdf.text(edu.institution, margin, leftYPos);
        leftYPos += 5;
        
        pdf.text(`${this.formatDate(edu.startDate)} - ${this.formatDate(edu.endDate)}`, margin, leftYPos);
        leftYPos += 10;
      });
    }

    // Skills (right column)
    if (data.skills.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SKILLS', rightColStart, rightYPos);
      rightYPos += 12;
      
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      data.skills.forEach((skill) => {
        pdf.text(`• ${skill}`, rightColStart, rightYPos);
        rightYPos += 5;
      });
    }
  }

  private static generateCreativeTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 40;

    // Creative header with colored background
    pdf.setFillColor(236, 72, 153); // Pink
    pdf.rect(0, 0, pageWidth, 70, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.personalInfo.fullName || 'Your Name', margin, 35);
    
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location
    ].filter(Boolean).join(' • ');
    pdf.text(contactInfo, margin, 55);

    yPos = 90;
    pdf.setTextColor(0, 0, 0);

    // Rest of the content with creative styling
    this.generateClassicTemplate(pdf, data); // Reuse classic layout but with creative header
  }

  private static generateExecutiveTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 25;
    let yPos = 40;

    // Executive header
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.text(data.personalInfo.fullName || 'Your Name', margin, yPos);
    yPos += 15;
    
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'normal');
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location
    ].filter(Boolean).join(' | ');
    pdf.text(contactInfo, margin, yPos);
    
    // Elegant line
    yPos += 10;
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;

    // Use modern template layout with executive styling
    this.generateModernTemplate(pdf, data);
  }

  public static async generatePDF(
    resumeData: ResumeData,
    resumeText: string,
    templateId: string,
    filename: string = 'resume.pdf'
  ): Promise<void> {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');

      // If no structured data, fall back to text-based generation
      if (!resumeData.personalInfo.fullName && resumeText) {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');
        const lines = pdf.splitTextToSize(resumeText, 170);
        pdf.text(lines, 20, 20);
      } else {
        // Generate based on template
        switch (templateId) {
          case 'modern-professional':
            this.generateModernTemplate(pdf, resumeData);
            break;
          case 'classic-traditional':
            this.generateClassicTemplate(pdf, resumeData);
            break;
          case 'creative-designer':
            this.generateCreativeTemplate(pdf, resumeData);
            break;
          case 'executive-premium':
            this.generateExecutiveTemplate(pdf, resumeData);
            break;
          default:
            this.generateModernTemplate(pdf, resumeData);
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw new Error('Failed to generate PDF');
    }
  }
}
