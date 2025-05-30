# ResumeAI Pro 🚀

A modern, AI-powered resume builder that helps you create professional resumes with beautiful templates, AI optimization, and instant PDF downloads. Complete redesign with modern UI and enhanced functionality.

## ✨ New Features

### 🎨 Modern Landing Page
- Beautiful, responsive design with gradient backgrounds
- Feature showcase with animations
- Professional template gallery
- Pricing tiers and call-to-action sections

### 🏗️ Interactive Resume Builder
- Step-by-step resume creation interface
- Real-time form validation and preview
- Drag-and-drop file upload
- Structured data input for all resume sections

### 📄 Professional Templates (NEW)
- **Modern Professional**: Clean, contemporary design with blue accents
- **Classic Traditional**: Traditional black and white format
- **Creative Designer**: Bold, colorful design with pink accents
- **Executive Premium**: Sophisticated layout for senior positions
- Custom template upload support

### 🤖 AI-Powered Features
- Resume parsing and data extraction
- Smart content suggestions (coming soon)
- Job description matching (coming soon)
- Skill gap analysis

### 📱 Enhanced User Experience
- Mobile-first responsive design
- Smooth animations and transitions
- Intuitive navigation with tabs
- Real-time preview and editing

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS 4, Framer Motion
- **Charts**: Chart.js, React Chart.js 2
- **PDF Generation**: jsPDF, html2canvas
- **AI**: OpenAI GPT API
- **Icons**: React Icons
- **Notifications**: React Hot Toast

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd resume_ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your OpenAI API key to `.env.local`:
```
OPENAI_API_KEY=your_openai_api_key_here
```

4. Run the development server:
```bash
npm run dev
# or
yarn dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📖 Usage Guide

### 1. Landing Page Experience
- Visit the modern landing page with feature overview
- Browse template gallery and pricing information
- Click "Get Started" to access the resume builder at `/builder`

### 2. Resume Builder Interface
- **Upload Tab**: Upload existing resume (PDF, DOCX, TXT) for automatic parsing
- **Build Tab**: Create resume from scratch with structured forms
- **Templates Tab**: Choose from 4 professional templates and generate PDFs
- **AI Optimize Tab**: AI-powered optimization (coming soon)
- **Auto-Fill Tab**: Extract data for job applications
- **Analytics Tab**: View resume performance metrics

### 3. Building Your Resume
- Fill in personal information (name, email, phone, location)
- Write a compelling professional summary
- Add work experience with detailed descriptions
- Include education background and achievements
- Add relevant skills with easy tag management

### 4. Template Selection & PDF Generation
- Choose from 4 professionally designed templates:
  - **Modern Professional**: Blue accents, contemporary design
  - **Classic Traditional**: Black & white, conservative format
  - **Creative Designer**: Pink accents, bold design
  - **Executive Premium**: Sophisticated layout for senior roles
- Upload custom templates (PDF/image format)
- Generate high-quality PDFs with one click

### 5. Advanced Features
- Resume parsing with automatic data extraction
- Job application auto-fill functionality
- Analytics dashboard for optimization insights
- Mobile-responsive design for editing anywhere

## 🎨 Templates

### Modern Professional
- Clean, contemporary design with blue accent colors
- Modern typography and professional layout
- Perfect for tech, business, and corporate roles
- ATS-friendly format with clear section headers

### Classic Traditional
- Traditional black and white format
- Conservative styling with elegant typography
- Ideal for traditional industries (law, finance, government)
- Two-column layout for education and skills

### Creative Designer
- Bold, colorful design with pink accent colors
- Creative layout with visual appeal
- Great for design, marketing, and creative professionals
- Eye-catching header with modern styling

### Executive Premium
- Sophisticated layout for senior-level positions
- Professional styling with elegant typography
- Perfect for C-level executives and leadership roles
- Clean, authoritative design that commands attention

## 🔧 Configuration

### API Key Management
The app supports flexible API key management:

- **Development**: Uses `OPENAI_API_KEY` from environment variables
- **Production**: Prompts user to enter their own API key
- **Storage**: Keys are stored locally in browser (localStorage or sessionStorage)
- **Security**: Keys never sent to your servers

### Supported File Formats
- **PDF**: Full text extraction
- **DOCX**: Microsoft Word documents
- **TXT**: Plain text files

### Supported ATS Platforms
- Greenhouse
- Lever
- Workday
- BambooHR
- SmartRecruiters
- Indeed
- LinkedIn

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Set environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- Heroku
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- OpenAI for the powerful GPT API
- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- All the open-source libraries that make this project possible

---

**Made with ❤️ for job seekers everywhere**
