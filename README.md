# 🚀 TalentFlow - Outstanding Hiring Platform
A comprehensive React-based hiring platform that enables HR teams to manage jobs, candidates, and assessments with a modern, intuitive interface.

### Technology Stack
- **Frontend**: React 19, Tailwind CSS, React Router
- **State Management**: React Context + Custom Hooks
- **Database**: IndexedDB via Dexie
- **API Simulation**: MSW with realistic latency/errors
- **Forms**: React Hook Form with validation
- **Icons**: Heroicons
- **Notifications**: React Hot Toast

## 🏗️ Architecture

### Project Structure
```
src/
├── components/
│   ├── ui/           # Reusable UI components
│   ├── forms/        # Form components
│   └── Layout.js     # Main layout with navigation
├── pages/            # Route components
├── services/         # Database and API services
├── hooks/            # Custom React hooks
├── context/          # React Context providers
├── types/            # Data types and constants
├── data/             # Seed data generators
├── mocks/            # MSW API handlers
└── utils/            # Utility functions
```
## Screenshots
<img width="1898" height="907" alt="image" src="https://github.com/user-attachments/assets/b535ba0e-baaf-4122-a805-883a17abcb33" />
<img width="1902" height="908" alt="Screenshot 2025-09-19 193717" src="https://github.com/user-attachments/assets/63647dec-ec08-48d8-9696-b5f958d8dfe9" />
<img width="1899" height="905" alt="Screenshot 2025-09-19 193745" src="https://github.com/user-attachments/assets/7cc90eca-8877-4c6f-bd70-ebf281776773" />
<img width="1906" height="907" alt="image" src="https://github.com/user-attachments/assets/772c529c-3393-46a7-b3b7-5702c718f794" />


## 🚀 Getting Started

### Installation
```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Start development server
npm start
```

The application will be available at `http://localhost:3000`

### Database Initialization
The app automatically seeds the database with:
- 25 job postings across different departments
- 1000+ candidates with realistic names and data
- 3+ assessment templates with multiple question types
- Timeline events and candidate relationships

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Vercel/Netlify
1. Connect your repository
2. Set build command: `npm run build`
3. Set output directory: `build`
4. Deploy!


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Implement changes with tests
4. Submit a pull request

