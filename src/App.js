import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { DatabaseService } from './services/database';
import { generateSeedData } from './data/seedData';
import { ThemeProvider } from './components/theme-provider';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import JobsPage from './pages/JobsPage';
import JobDetail from './pages/JobDetail';
import CandidatesPage from './pages/CandidatesPage';
import CandidateDetail from './pages/CandidateDetail';
import AssessmentsPage from './pages/AssessmentsPage';
import AssessmentBuilder from './pages/AssessmentBuilder';
import './App.css';

function App() {
  
  useEffect(() => {
    window.reseedDatabase = async () => {
      console.log('Manual reseed triggered...');
      await DatabaseService.clearAllData();
      const seedData = generateSeedData();
      
      for (const job of seedData.jobs) {
        await DatabaseService.createJob(job);
      }
      for (const candidate of seedData.candidates) {
        await DatabaseService.createCandidate(candidate);
      }
      for (const assessment of seedData.assessments) {
        await DatabaseService.createAssessment(assessment);
      }
      
      const stats = await DatabaseService.getStats();
      console.log(`Manual reseed complete: ${stats.jobs} jobs, ${stats.candidates} candidates`);
      window.location.reload();
    };
  }, []);

  useEffect(() => {
    // Initialize database with seed data if empty
    const initializeData = async () => {
      try {
        const stats = await DatabaseService.getStats();
        console.log('Database initialization - current stats:', stats);
        
        const shouldSeed = stats.jobs === 0 || stats.candidates === 0 || 
                          (stats.jobs !== 25 || stats.candidates !== 1000);
        
        if (shouldSeed) {
          console.log('Seeding database with initial data...');
          console.log(`Current: ${stats.jobs} jobs, ${stats.candidates} candidates - will reseed to 25 jobs, 1000 candidates`);
          
          // Clear existing data first to ensure clean state
          await DatabaseService.clearAllData();
          
          const seedData = generateSeedData();
          console.log('Generated seed data:', {
            jobs: seedData.jobs.length,
            candidates: seedData.candidates.length,
            assessments: seedData.assessments.length
          });
          
          // Add jobs 
          console.log('Adding jobs...');
          for (const job of seedData.jobs) {
            try {
              await DatabaseService.createJob(job);
            } catch (error) {
              console.error('Error creating job:', job.title, error);
            }
          }
          
          // Add candidates
          console.log('Adding candidates...');
          for (const candidate of seedData.candidates) {
            try {
              await DatabaseService.createCandidate(candidate);
            } catch (error) {
              console.error('Error creating candidate:', candidate.name, error);
            }
          }
          
          // Add assessments
          console.log('Adding assessments...');
          for (const assessment of seedData.assessments) {
            try {
              await DatabaseService.createAssessment(assessment);
            } catch (error) {
              console.error('Error creating assessment:', assessment.title, error);
            }
          }
          
          const finalStats = await DatabaseService.getStats();
          console.log('Database seeded successfully!');
          console.log('Final stats after seeding:', finalStats);
          
          // Show success message
          if (finalStats.jobs > 0 && finalStats.candidates > 0) {
            console.log(`✅ Successfully seeded ${finalStats.jobs} jobs and ${finalStats.candidates} candidates!`);
          }
        } else {
          console.log('Database already has sufficient data, skipping seeding');
          console.log(`Current data: ${stats.jobs} jobs, ${stats.candidates} candidates`);
        }
      } catch (error) {
        console.error('Error initializing database:', error);
        // Try to show debugging info
        try {
          const debugStats = await DatabaseService.getStats();
          console.log('Debug stats after error:', debugStats);
        } catch (debugError) {
          console.error('Error getting debug stats:', debugError);
        }
      }
    };
    
    initializeData();
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider
        attribute="class"
        defaultTheme="light"
        enableSystem={false}
        disableTransitionOnChange
      >
        <Router>
          <div className="App min-h-screen bg-background">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={
                <Layout>
                  <Dashboard />
                </Layout>
              } />
              <Route path="/jobs" element={
                <Layout>
                  <JobsPage />
                </Layout>
              } />
              <Route path="/jobs/:id" element={
                <Layout>
                  <JobDetail />
                </Layout>
              } />
              <Route path="/candidates" element={
                <Layout>
                  <CandidatesPage />
                </Layout>
              } />
              <Route path="/candidates/:id" element={
                <Layout>
                  <CandidateDetail />
                </Layout>
              } />
              <Route path="/assessments" element={
                <Layout>
                  <AssessmentsPage />
                </Layout>
              } />
              <Route path="/assessments/:jobId" element={
                <Layout>
                  <AssessmentBuilder />
                </Layout>
              } />
              <Route path="/assessments/:id/edit" element={
                <Layout>
                  <AssessmentBuilder />
                </Layout>
              } />
            </Routes>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'hsl(var(--card))',
                  color: 'hsl(var(--card-foreground))',
                  border: '1px solid hsl(var(--border))',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: 'hsl(var(--primary))',
                    secondary: 'hsl(var(--primary-foreground))',
                  },
                },
                error: {
                  duration: 5000,
                  iconTheme: {
                    primary: 'hsl(var(--destructive))',
                    secondary: 'hsl(var(--destructive-foreground))',
                  },
                },
              }}
            />
          </div>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
