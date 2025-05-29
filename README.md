# AI Resume Optimizer Pro 🚀

A comprehensive AI-powered resume optimization platform that helps job seekers create, optimize, and manage their resumes with advanced features including PDF generation, job application auto-fill, and detailed analytics.

## ✨ Features

### 🤖 AI-Powered Resume Optimization
- Upload resumes in PDF, DOCX, or TXT format
- AI-powered optimization based on job descriptions
- Match score analysis with detailed feedback
- Skill gap identification and recommendations

### 🎨 Professional Resume Templates
- **Modern Professional**: Clean, modern design with accent colors
- **Classic Traditional**: Traditional format for conservative industries  
- **Creative Designer**: Bold design for creative professionals
- One-click PDF generation and download

### 📊 Advanced Analytics Dashboard
- Interactive charts showing skill matches and gaps
- Overall match score visualization
- Detailed recommendations for improvement
- Skills coverage analysis

### 🚀 Job Application Auto-Fill
- Extract key information from your resume
- Support for major ATS platforms (Greenhouse, Lever, Workday, etc.)
- One-click copy functionality for quick form filling
- Smart parsing of contact info, skills, and experience

### 🔑 Flexible API Key Management
- Use your own OpenAI API key for privacy and control
- Secure local storage (localStorage/sessionStorage)
- Development environment fallback
- No server-side API key storage

### 📝 AI Cover Letter Generation
- Automatically generate tailored cover letters
- Match cover letter content to job requirements
- Professional formatting and structure

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

### 1. API Key Setup
- In production, you'll be prompted to enter your OpenAI API key
- Choose to store it locally (persistent) or for the session only
- In development, the app uses the environment variable as fallback

### 2. Resume Optimization
- Upload your resume (PDF, DOCX, or TXT)
- Paste the job description you're targeting
- Click "Optimize Resume" to get AI-powered improvements
- Review the optimized resume and analysis

### 3. Templates & PDF Export
- Navigate to the "Templates" tab
- Choose from 3 professional templates
- Download your optimized resume as a PDF

### 4. Analytics Dashboard
- View the "Dashboard" tab for detailed analytics
- See skill matches, gaps, and recommendations
- Interactive charts show your resume's performance

### 5. Job Application Auto-Fill
- Go to the "Auto-Fill" tab
- Click "Extract Info" to parse your resume
- Copy the extracted information to quickly fill job applications
- Supports major ATS platforms

## 🎨 Templates

### Modern Professional
- Clean, contemporary design
- Accent colors and modern typography
- Perfect for tech and business roles

### Classic Traditional  
- Traditional black and white format
- Conservative styling
- Ideal for traditional industries

### Creative Designer
- Bold, colorful design
- Creative layout and styling
- Great for design and creative roles

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
