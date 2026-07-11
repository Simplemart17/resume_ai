import jsPDF from "jspdf";
import type { ResumeData } from "@/types/resume";
import { shortMonthName } from "@/utils/date";

export class NewPDFGenerator {
  /** Vertical margin kept clear at the bottom of every page. */
  private static readonly BOTTOM_MARGIN = 20;
  /** Y position where content resumes on continuation pages. */
  private static readonly CONTINUATION_TOP = 20;

  private static formatDate(dateStr: string): string {
    if (!dateStr) return "";
    // Parse "YYYY-MM" (or "YYYY-MM-DD") manually to avoid the UTC-midnight
    // timezone shift of new Date("2023-05") and "Invalid Date" output.
    const match = /^(\d{4})-(\d{1,2})(?:-\d{1,2})?$/.exec(dateStr.trim());
    if (!match) return dateStr; // e.g. "Present", "May 2020" pass through
    const month = shortMonthName(parseInt(match[2], 10) - 1);
    if (!month) return dateStr;
    return `${month} ${match[1]}`;
  }

  /**
   * Joins two formatted dates with " - ", omitting the dash when either side
   * is empty (education entries only carry a graduation date, for example).
   */
  private static formatDateRange(startDate: string, endDate: string): string {
    return [this.formatDate(startDate), this.formatDate(endDate)]
      .filter(Boolean)
      .join(" - ");
  }

  /**
   * Returns a y position guaranteed to have `neededHeight` mm of room above
   * the bottom margin, adding a new page (and resetting to the top margin)
   * when the current page would overflow.
   */
  private static ensureSpace(
    pdf: jsPDF,
    yPos: number,
    neededHeight: number
  ): number {
    const pageHeight = pdf.internal.pageSize.getHeight();
    if (yPos + neededHeight > pageHeight - this.BOTTOM_MARGIN) {
      pdf.addPage();
      return this.CONTINUATION_TOP;
    }
    return yPos;
  }

  /**
   * Renders pre-wrapped lines one by one so long blocks paginate instead of
   * running off the bottom of the page. Returns the y position after the
   * last line.
   */
  private static renderLines(
    pdf: jsPDF,
    lines: string[],
    x: number,
    yPos: number,
    lineHeight: number
  ): number {
    lines.forEach((line) => {
      yPos = this.ensureSpace(pdf, yPos, lineHeight);
      pdf.text(line, x, yPos);
      yPos += lineHeight;
    });
    return yPos;
  }

  /**
   * Shared body used by the modern-professional and executive-premium
   * templates. Renders summary, experience, education and skills starting at
   * `startY`, paginating as needed.
   */
  private static generateModernBody(
    pdf: jsPDF,
    data: ResumeData,
    startY: number,
    margin: number
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    let yPos = startY;

    pdf.setTextColor(0, 0, 0);

    // Summary
    if (data.summary) {
      yPos = this.ensureSpace(pdf, yPos, 20);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("PROFESSIONAL SUMMARY", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const summaryLines: string[] = pdf.splitTextToSize(
        data.summary,
        pageWidth - 2 * margin
      );
      yPos = this.renderLines(pdf, summaryLines, margin, yPos, 5);
      yPos += 10;
    }

    // Experience
    if (data.experience.length > 0) {
      yPos = this.ensureSpace(pdf, yPos, 35);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("EXPERIENCE", margin, yPos);
      yPos += 15;

      data.experience.forEach((exp) => {
        yPos = this.ensureSpace(pdf, yPos, 20);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(exp.position, margin, yPos);

        pdf.setFont("helvetica", "normal");
        const dateRange = `${this.formatDate(exp.startDate)} - ${
          exp.current ? "Present" : this.formatDate(exp.endDate)
        }`;
        pdf.text(dateRange, pageWidth - margin, yPos, { align: "right" });
        yPos += 6;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "italic");
        pdf.text(exp.company, margin, yPos);
        yPos += 8;

        if (exp.description) {
          pdf.setFontSize(10);
          pdf.setFont("helvetica", "normal");
          const descLines: string[] = pdf.splitTextToSize(
            exp.description,
            pageWidth - 2 * margin
          );
          yPos = this.renderLines(pdf, descLines, margin, yPos, 4);
          yPos += 8;
        }
      });
    }

    // Education
    if (data.education.length > 0) {
      yPos = this.ensureSpace(pdf, yPos, 35);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("EDUCATION", margin, yPos);
      yPos += 15;

      data.education.forEach((edu) => {
        yPos = this.ensureSpace(pdf, yPos, 16);
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${edu.degree} in ${edu.field}`, margin, yPos);

        const dateRange = this.formatDateRange(edu.startDate, edu.endDate);
        pdf.text(dateRange, pageWidth - margin, yPos, { align: "right" });
        yPos += 6;

        pdf.setFontSize(11);
        pdf.setFont("helvetica", "normal");
        pdf.text(edu.institution, margin, yPos);
        yPos += 10;
      });
    }

    // Skills
    if (data.skills.length > 0) {
      yPos = this.ensureSpace(pdf, yPos, 20);
      pdf.setFontSize(14);
      pdf.setFont("helvetica", "bold");
      pdf.text("SKILLS", margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const skillsText = data.skills.join(" • ");
      const skillsLines: string[] = pdf.splitTextToSize(
        skillsText,
        pageWidth - 2 * margin
      );
      this.renderLines(pdf, skillsLines, margin, yPos, 5);
    }
  }

  /**
   * Shared body used by the classic-traditional and creative-designer
   * templates. Renders summary, experience, then education/skills in two
   * columns starting at `startY`, paginating as needed.
   */
  private static generateClassicBody(
    pdf: jsPDF,
    data: ResumeData,
    startY: number,
    margin: number
  ): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPos = startY;

    pdf.setTextColor(0, 0, 0);

    // Summary
    if (data.summary) {
      yPos = this.ensureSpace(pdf, yPos, 18);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("SUMMARY", margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const summaryLines: string[] = pdf.splitTextToSize(
        data.summary,
        pageWidth - 2 * margin
      );
      yPos = this.renderLines(pdf, summaryLines, margin, yPos, 5);
      yPos += 15;
    }

    // Experience
    if (data.experience.length > 0) {
      yPos = this.ensureSpace(pdf, yPos, 30);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("EXPERIENCE", margin, yPos);
      yPos += 12;

      data.experience.forEach((exp) => {
        yPos = this.ensureSpace(pdf, yPos, 18);
        pdf.setFontSize(11);
        pdf.setFont("helvetica", "bold");
        pdf.text(exp.position, margin, yPos);

        const dateRange = `${this.formatDate(exp.startDate)} - ${
          exp.current ? "Present" : this.formatDate(exp.endDate)
        }`;
        pdf.text(dateRange, pageWidth - margin, yPos, { align: "right" });
        yPos += 6;

        pdf.setFont("helvetica", "normal");
        pdf.text(exp.company, margin, yPos);
        yPos += 8;

        if (exp.description) {
          pdf.setFontSize(10);
          const descLines: string[] = pdf.splitTextToSize(
            exp.description,
            pageWidth - 2 * margin
          );
          yPos = this.renderLines(pdf, descLines, margin, yPos, 4);
          yPos += 10;
        }
      });
    }

    // Education & Skills in two columns
    if (data.education.length === 0 && data.skills.length === 0) return;

    const leftColWidth = (pageWidth - 3 * margin) / 2;
    const rightColStart = margin + leftColWidth + margin;

    // Wrap each skill to the column width up front so the keep-together
    // estimate and the rendering agree on line counts. Wrapping must happen
    // at the same font size the lines are rendered with (10pt normal).
    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const skillLines: string[][] = data.skills.map(
      (skill) => pdf.splitTextToSize(`• ${skill}`, leftColWidth) as string[]
    );
    const totalSkillLines = skillLines.reduce(
      (sum, lines) => sum + lines.length,
      0
    );

    // Try to keep the two-column section together: if the taller column
    // does not fit on the current page (but would fit on a fresh one),
    // start the section on a new page.
    const eduHeight =
      data.education.length > 0 ? 12 + data.education.length * 20 : 0;
    const skillsHeight = data.skills.length > 0 ? 12 + totalSkillLines * 5 : 0;
    const maxUsable =
      pageHeight - this.BOTTOM_MARGIN - this.CONTINUATION_TOP;
    yPos = this.ensureSpace(
      pdf,
      yPos,
      Math.min(Math.max(eduHeight, skillsHeight), maxUsable)
    );

    const startPage = pdf.getCurrentPageInfo().pageNumber;

    // Advances within a column, moving to the next page (creating it if it
    // does not exist yet) when the column would overflow.
    const columnBreak = (
      y: number,
      page: number,
      needed: number
    ): { y: number; page: number } => {
      if (y + needed > pageHeight - this.BOTTOM_MARGIN) {
        const nextPage = page + 1;
        if (nextPage > pdf.getNumberOfPages()) {
          pdf.addPage();
        }
        pdf.setPage(nextPage);
        return { y: this.CONTINUATION_TOP, page: nextPage };
      }
      return { y, page };
    };

    // Education (left column)
    let leftYPos = yPos;
    let leftPage = startPage;
    if (data.education.length > 0) {
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("EDUCATION", margin, leftYPos);
      leftYPos += 12;

      data.education.forEach((edu) => {
        const pos = columnBreak(leftYPos, leftPage, 20);
        leftYPos = pos.y;
        leftPage = pos.page;

        pdf.setFontSize(10);
        pdf.setFont("helvetica", "bold");
        pdf.text(`${edu.degree}`, margin, leftYPos);
        leftYPos += 5;

        pdf.setFont("helvetica", "normal");
        pdf.text(edu.institution, margin, leftYPos);
        leftYPos += 5;

        pdf.text(this.formatDateRange(edu.startDate, edu.endDate), margin, leftYPos);
        leftYPos += 10;
      });
    }

    // Skills (right column) — starts back on the page where the columns began
    let rightYPos = yPos;
    let rightPage = startPage;
    if (data.skills.length > 0) {
      pdf.setPage(startPage);
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "bold");
      pdf.text("SKILLS", rightColStart, rightYPos);
      rightYPos += 12;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      skillLines.forEach((lines) => {
        lines.forEach((line) => {
          const pos = columnBreak(rightYPos, rightPage, 5);
          rightYPos = pos.y;
          rightPage = pos.page;

          pdf.text(line, rightColStart, rightYPos);
          rightYPos += 5;
        });
      });
    }

    // Leave the document positioned on the last page used
    pdf.setPage(Math.max(leftPage, rightPage));
  }

  private static generateModernTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    // Header with name and contact (blue)
    pdf.setFillColor(59, 130, 246); // Blue
    pdf.rect(0, 0, pageWidth, 60, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.personalInfo.fullName || "Your Name", margin, 35);

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
    ]
      .filter(Boolean)
      .join(" | ");
    pdf.text(contactInfo, margin, 50);

    this.generateModernBody(pdf, data, 80, margin);
  }

  private static generateClassicTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 30;

    // Plain centered header
    pdf.setFontSize(20);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.personalInfo.fullName || "Your Name", pageWidth / 2, yPos, {
      align: "center",
    });
    yPos += 15;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
    ]
      .filter(Boolean)
      .join(" | ");
    pdf.text(contactInfo, pageWidth / 2, yPos, { align: "center" });

    // Line under header
    yPos += 10;
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    this.generateClassicBody(pdf, data, yPos, margin);
  }

  private static generateCreativeTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;

    // Creative header with colored background (pink)
    pdf.setFillColor(236, 72, 153); // Pink
    pdf.rect(0, 0, pageWidth, 70, "F");

    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(28);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.personalInfo.fullName || "Your Name", margin, 35);

    pdf.setFontSize(12);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
    ]
      .filter(Boolean)
      .join(" • ");
    pdf.text(contactInfo, margin, 55);

    // Classic-style body, starting below the creative header
    this.generateClassicBody(pdf, data, 85, margin);
  }

  private static generateExecutiveTemplate(pdf: jsPDF, data: ResumeData): void {
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 25;
    let yPos = 40;

    // Executive header
    pdf.setFontSize(24);
    pdf.setFont("helvetica", "bold");
    pdf.text(data.personalInfo.fullName || "Your Name", margin, yPos);
    yPos += 15;

    pdf.setFontSize(11);
    pdf.setFont("helvetica", "normal");
    const contactInfo = [
      data.personalInfo.email,
      data.personalInfo.phone,
      data.personalInfo.location,
    ]
      .filter(Boolean)
      .join(" | ");
    pdf.text(contactInfo, margin, yPos);

    // Elegant line
    yPos += 10;
    pdf.setDrawColor(100, 100, 100);
    pdf.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 20;

    // Modern-style body, starting below the executive header
    this.generateModernBody(pdf, data, yPos, margin);
  }

  public static async generatePDF(
    resumeData: ResumeData,
    resumeText: string,
    templateId: string,
    filename: string = "resume.pdf"
  ): Promise<void> {
    try {
      const pdf = new jsPDF("p", "mm", "a4");

      // If no structured data, fall back to text-based generation
      if (!resumeData.personalInfo.fullName && resumeText) {
        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const lines: string[] = pdf.splitTextToSize(resumeText, 170);
        const lineHeight = pdf.getLineHeight() / pdf.internal.scaleFactor;
        this.renderLines(pdf, lines, 20, 20, lineHeight);
      } else {
        // Generate based on template
        switch (templateId) {
          case "modern-professional":
            this.generateModernTemplate(pdf, resumeData);
            break;
          case "classic-traditional":
            this.generateClassicTemplate(pdf, resumeData);
            break;
          case "creative-designer":
            this.generateCreativeTemplate(pdf, resumeData);
            break;
          case "executive-premium":
            this.generateExecutiveTemplate(pdf, resumeData);
            break;
          default:
            this.generateModernTemplate(pdf, resumeData);
        }
      }

      pdf.save(filename);
    } catch (error) {
      console.error("Error generating PDF:", error);
      throw new Error("Failed to generate PDF");
    }
  }
}
