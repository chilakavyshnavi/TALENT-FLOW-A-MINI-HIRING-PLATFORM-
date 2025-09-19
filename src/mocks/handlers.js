import { http, HttpResponse } from 'msw';
import { DatabaseService } from '../services/database';
import { createApiResponse, createPaginationMeta } from '../types';

// Helper function to simulate network latency and errors
const simulateNetwork = async (successRate = 0.9, minDelay = 200, maxDelay = 1200) => {
  // simulate network delay
  const delay = Math.random() * (maxDelay - minDelay) + minDelay;
  await new Promise(resolve => setTimeout(resolve, delay));
  
  // simulate random errors
  if (Math.random() > successRate) {
    throw new Error('Simulated network error');
  }
};

// Helper function to handle errors.
const handleError = (error) => {
  console.error('API Error:', error);
  
  if (error.message === 'Simulated network error') {
    return HttpResponse.json(
      createApiResponse(null, false, 'Internal server error'),
      { status: 500 }
    );
  }
  
  if (error.message.includes('not found')) {
    return HttpResponse.json(
      createApiResponse(null, false, 'Resource not found'),
      { status: 404 }
    );
  }
  
  if (error.message.includes('validation')) {
    return HttpResponse.json(
      createApiResponse(null, false, error.message),
      { status: 400 }
    );
  }
  
  return HttpResponse.json(
    createApiResponse(null, false, 'An unexpected error occurred'),
    { status: 500 }
  );
};

// Jobs API handlers
export const jobsHandlers = [
  // GET /jobs - List jobs with pagination and filtering
  http.get('/api/jobs', async ({ request }) => {
    try {
      await simulateNetwork();
      
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const status = url.searchParams.get('status') || '';
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      const sort = url.searchParams.get('sort') || 'order';
      const order = url.searchParams.get('order') || 'asc';
      
      const filters = { search, status };
      const jobs = await DatabaseService.getJobs(filters);
      
      
      jobs.sort((a, b) => {
        const aVal = a[sort];
        const bVal = b[sort];
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return order === 'desc' ? -comparison : comparison;
      });
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedJobs = jobs.slice(startIndex, endIndex);
      
      const pagination = createPaginationMeta(page, pageSize, jobs.length);
      
      return HttpResponse.json(createApiResponse({
        jobs: paginatedJobs,
        pagination,
      }));
    } catch (error) {
      return handleError(error);
    }
  }),

  // GET /jobs/:id - Get single job
  http.get('/api/jobs/:id', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const job = await DatabaseService.getJobById(id);
      
      if (!job) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Job not found'),
          { status: 404 }
        );
      }
      
      return HttpResponse.json(createApiResponse(job));
    } catch (error) {
      return handleError(error);
    }
  }),

  // POST /jobs - Create new job
  http.post('/api/jobs', async ({ request }) => {
    try {
      await simulateNetwork(0.95); // Higher success rate for creation
      
      const jobData = await request.json();
      
      // Validation
      if (!jobData.title) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Title is required'),
          { status: 400 }
        );
      }
      
      // Generate slug from title
      const slug = jobData.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      
      const job = await DatabaseService.createJob({
        ...jobData,
        slug,
      });
      
      return HttpResponse.json(
        createApiResponse(job, true, 'Job created successfully'),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // PATCH /jobs/:id - Update job
  http.patch('/api/jobs/:id', async ({ params, request }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const updates = await request.json();
      
      const job = await DatabaseService.updateJob(id, updates);
      
      if (!job) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Job not found'),
          { status: 404 }
        );
      }
      
      return HttpResponse.json(
        createApiResponse(job, true, 'Job updated successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // DELETE /jobs/:id 
  http.delete('/api/jobs/:id', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      await DatabaseService.deleteJob(id);
      
      return HttpResponse.json(
        createApiResponse(null, true, 'Job deleted successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // PATCH /jobs/:id/reorder 
  http.patch('/api/jobs/:id/reorder', async ({ params, request }) => {
    try {
      await simulateNetwork(0.85); // Lower success rate to test rollback
      
      const { fromOrder, toOrder } = await request.json();
      
      const jobs = await DatabaseService.reorderJobs(fromOrder, toOrder);
      
      return HttpResponse.json(
        createApiResponse(jobs, true, 'Jobs reordered successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),
];

// Candidates API handlers
export const candidatesHandlers = [
  // GET /candidates 
  http.get('/api/candidates', async ({ request }) => {
    try {
      await simulateNetwork();
      
      const url = new URL(request.url);
      const search = url.searchParams.get('search') || '';
      const stage = url.searchParams.get('stage') || '';
      const jobId = url.searchParams.get('jobId') || '';
      const page = parseInt(url.searchParams.get('page')) || 1;
      const pageSize = parseInt(url.searchParams.get('pageSize')) || 20;
      
      const filters = { search, stage, jobId };
      const candidates = await DatabaseService.getCandidates(filters);
      
      // Apply pagination
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedCandidates = candidates.slice(startIndex, endIndex);
      
      const pagination = createPaginationMeta(page, pageSize, candidates.length);
      
      return HttpResponse.json(createApiResponse({
        candidates: paginatedCandidates,
        pagination,
      }));
    } catch (error) {
      return handleError(error);
    }
  }),

  // GET /candidates/:id 
  http.get('/api/candidates/:id', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const candidate = await DatabaseService.getCandidateById(id);
      
      if (!candidate) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Candidate not found'),
          { status: 404 }
        );
      }
      
      return HttpResponse.json(createApiResponse(candidate));
    } catch (error) {
      return handleError(error);
    }
  }),

  // POST /candidates 
  http.post('/api/candidates', async ({ request }) => {
    try {
      await simulateNetwork(0.95);
      
      const candidateData = await request.json();
      
      // Validation
      if (!candidateData.name || !candidateData.email) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Name and email are required'),
          { status: 400 }
        );
      }
      
      const candidate = await DatabaseService.createCandidate(candidateData);
      
      return HttpResponse.json(
        createApiResponse(candidate, true, 'Candidate created successfully'),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // PATCH /candidates/:id - Update candidate
  http.patch('/api/candidates/:id', async ({ params, request }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const updates = await request.json();
      
      const candidate = await DatabaseService.updateCandidate(id, updates);
      
      if (!candidate) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Candidate not found'),
          { status: 404 }
        );
      }
      
      return HttpResponse.json(
        createApiResponse(candidate, true, 'Candidate updated successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // DELETE /candidates/:id - Delete candidate
  http.delete('/api/candidates/:id', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      await DatabaseService.deleteCandidate(id);
      
      return HttpResponse.json(
        createApiResponse(null, true, 'Candidate deleted successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // GET /candidates/:id/timeline - Get candidate timeline
  http.get('/api/candidates/:id/timeline', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const timeline = await DatabaseService.getCandidateTimeline(id);
      
      return HttpResponse.json(createApiResponse(timeline));
    } catch (error) {
      return handleError(error);
    }
  }),

  // POST /candidates/:id/notes - Add notes
  http.post('/api/candidates/:id/notes', async ({ params, request }) => {
    try {
      await simulateNetwork();
      
      const { id } = params;
      const noteData = await request.json();
      
      if (!noteData.content) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Note content is required'),
          { status: 400 }
        );
      }
      
      const note = await DatabaseService.createNote({
        ...noteData,
        candidateId: id,
      });
      
      return HttpResponse.json(
        createApiResponse(note, true, 'Note added successfully'),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  }),
];

// Assessments API handlers
export const assessmentsHandlers = [
  // GET /assessments/:jobId
  http.get('/api/assessments/:jobId', async ({ params }) => {
    try {
      await simulateNetwork();
      
      const { jobId } = params;
      const assessment = await DatabaseService.getAssessmentByJobId(jobId);
      
      return HttpResponse.json(createApiResponse(assessment));
    } catch (error) {
      return handleError(error);
    }
  }),

  // PUT /assessments/:jobId - Create or update
  http.put('/api/assessments/:jobId', async ({ params, request }) => {
    try {
      await simulateNetwork();
      
      const { jobId } = params;
      const assessmentData = await request.json();
      
      const existingAssessment = await DatabaseService.getAssessmentByJobId(jobId);
      
      let assessment;
      if (existingAssessment) {
        assessment = await DatabaseService.updateAssessment(existingAssessment.id, assessmentData);
      } else {
        assessment = await DatabaseService.createAssessment({
          ...assessmentData,
          jobId,
        });
      }
      
      return HttpResponse.json(
        createApiResponse(assessment, true, 'Assessment saved successfully')
      );
    } catch (error) {
      return handleError(error);
    }
  }),

  // POST /assessments/:jobId/submit 
  http.post('/api/assessments/:jobId/submit', async ({ params, request }) => {
    try {
      await simulateNetwork();
      
      const { jobId } = params;
      const responseData = await request.json();
      
      if (!responseData.candidateId || !responseData.responses) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Candidate ID and responses are required'),
          { status: 400 }
        );
      }
      
      const assessment = await DatabaseService.getAssessmentByJobId(jobId);
      if (!assessment) {
        return HttpResponse.json(
          createApiResponse(null, false, 'Assessment not found'),
          { status: 404 }
        );
      }
      
      const response = await DatabaseService.createAssessmentResponse({
        ...responseData,
        assessmentId: assessment.id,
      });
      
      return HttpResponse.json(
        createApiResponse(response, true, 'Assessment submitted successfully'),
        { status: 201 }
      );
    } catch (error) {
      return handleError(error);
    }
  }),
];

// Combine all handlers
export const handlers = [
  ...jobsHandlers,
  ...candidatesHandlers,
  ...assessmentsHandlers,
];