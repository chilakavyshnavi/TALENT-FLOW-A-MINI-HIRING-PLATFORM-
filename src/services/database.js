import Dexie from 'dexie';
import {
  createJob,
  createCandidate,
  createAssessment,
  createTimelineEvent,
  createNote,
  createAssessmentResponse,
} from '../types';

class TalentFlowDB extends Dexie {
  constructor() {
    super('TalentFlowDB');
    
    this.version(1).stores({
      jobs: '++id, title, slug, status, order, createdAt, updatedAt',
      candidates: '++id, name, email, stage, jobId, createdAt, updatedAt',
      assessments: '++id, jobId, title, createdAt, updatedAt',
      timelineEvents: '++id, candidateId, type, createdAt',
      notes: '++id, candidateId, createdAt, updatedAt',
      assessmentResponses: '++id, candidateId, assessmentId, createdAt',
      settings: '++id, key',
    });
    
    // Hooks for automatic timestamps
    this.jobs.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.jobs.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.candidates.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.candidates.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.assessments.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.assessments.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
    
    this.notes.hook('creating', (primKey, obj, trans) => {
      obj.createdAt = new Date().toISOString();
      obj.updatedAt = new Date().toISOString();
    });
    
    this.notes.hook('updating', (modifications, primKey, obj, trans) => {
      modifications.updatedAt = new Date().toISOString();
    });
  }
}

// Create database instance
export const db = new TalentFlowDB();

// Database service methods
export class DatabaseService {
  // Jobs
  static async getJobs(filters = {}) {
    try {
      let query = db.jobs.orderBy('order');
      
      if (filters.status && filters.status !== 'all') {
        query = query.filter(job => job.status === filters.status);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.filter(job => 
          job.title.toLowerCase().includes(searchTerm) ||
          job.description?.toLowerCase().includes(searchTerm) ||
          job.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }
      
      return await query.toArray();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  }
  
  static async getJobById(id) {
    try {
      return await db.jobs.get(id);
    } catch (error) {
      console.error('Error fetching job:', error);
      throw error;
    }
  }
  
  static async createJob(jobData) {
    try {
      const job = createJob(jobData);
      console.log('Creating job with data:', job);
      
      // If an ID is given, use put() to preserve it or else use add() to let Dexie generate one
      let id;
      if (job.id) {
        id = await db.jobs.put(job);
        console.log('Job created with preserved ID:', id);
      } else {
        id = await db.jobs.add(job);
        console.log('Job created with generated ID:', id);
      }
      
      return { ...job, id };
    } catch (error) {
      console.error('Error creating job:', error);
      throw error;
    }
  }
  
  static async updateJob(id, updates) {
    try {
      await db.jobs.update(id, updates);
      return await db.jobs.get(id);
    } catch (error) {
      console.error('Error updating job:', error);
      throw error;
    }
  }
  
  static async deleteJob(id) {
    try {
      await db.jobs.delete(id);
      // Also delete related candidates and assessments
      await db.candidates.where('jobId').equals(id).delete();
      await db.assessments.where('jobId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting job:', error);
      throw error;
    }
  }
  
  static async reorderJobs(fromOrder, toOrder) {
    try {
      return await db.transaction('rw', db.jobs, async () => {
        const jobs = await db.jobs.orderBy('order').toArray();
        
        // Simple reordering logic
        const fromJob = jobs.find(job => job.order === fromOrder);
        const toJob = jobs.find(job => job.order === toOrder);
        
        if (fromJob && toJob) {
          await db.jobs.update(fromJob.id, { order: toOrder });
          await db.jobs.update(toJob.id, { order: fromOrder });
        }
        
        return await db.jobs.orderBy('order').toArray();
      });
    } catch (error) {
      console.error('Error reordering jobs:', error);
      throw error;
    }
  }
  
  // Candidates
  static async getCandidates(filters = {}) {
    try {
      let query = db.candidates.orderBy('createdAt');
      
      if (filters.stage && filters.stage !== 'all') {
        query = query.filter(candidate => candidate.stage === filters.stage);
      }
      
      if (filters.jobId && filters.jobId !== 'all') {
        query = query.filter(candidate => candidate.jobId === filters.jobId);
      }
      
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        query = query.filter(candidate => 
          candidate.name.toLowerCase().includes(searchTerm) ||
          candidate.email.toLowerCase().includes(searchTerm)
        );
      }
      
      return await query.reverse().toArray();
    } catch (error) {
      console.error('Error fetching candidates:', error);
      throw error;
    }
  }
  
  static async getCandidateById(id) {
    try {
      console.log('DatabaseService.getCandidateById called with ID:', id);
      const candidate = await db.candidates.get(id);
      console.log('DatabaseService.getCandidateById result:', candidate);
      return candidate;
    } catch (error) {
      console.error('Error fetching candidate:', error);
      throw error;
    }
  }
  
  static async createCandidate(candidateData) {
    try {
      const candidate = createCandidate(candidateData);
      console.log('Creating candidate with data:', candidate);
      
      // If an ID is provided, use put() to preserve it; or else use add() to let Dexie generate one
      let id;
      if (candidate.id) {
        // Use put() to preserve the specific ID
        id = await db.candidates.put(candidate);
        console.log('Candidate created with preserved ID:', id);
      } else {
        // Use add() to let Dexie generate the ID
        id = await db.candidates.add(candidate);
        console.log('Candidate created with generated ID:', id);
      }
      
      // Create initial timeline event
      await this.createTimelineEvent({
        candidateId: id,
        type: 'stage_change',
        title: 'Application Submitted',
        description: 'Candidate applied for the position',
        metadata: { stage: candidate.stage },
      });
      
      return { ...candidate, id };
    } catch (error) {
      console.error('Error creating candidate:', error);
      throw error;
    }
  }
  
  static async updateCandidate(id, updates) {
    try {
      const oldCandidate = await db.candidates.get(id);
      await db.candidates.update(id, updates);
      
      // Create timeline event if stage changed
      if (updates.stage && updates.stage !== oldCandidate?.stage) {
        await this.createTimelineEvent({
          candidateId: id,
          type: 'stage_change',
          title: `Stage Changed to ${updates.stage}`,
          description: `Candidate moved from ${oldCandidate?.stage} to ${updates.stage}`,
          metadata: { 
            fromStage: oldCandidate?.stage, 
            toStage: updates.stage 
          },
        });
      }
      
      return await db.candidates.get(id);
    } catch (error) {
      console.error('Error updating candidate:', error);
      throw error;
    }
  }
  
  static async deleteCandidate(id) {
    try {
      await db.candidates.delete(id);
      // Also delete related timeline events and notes
      await db.timelineEvents.where('candidateId').equals(id).delete();
      await db.notes.where('candidateId').equals(id).delete();
      await db.assessmentResponses.where('candidateId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      throw error;
    }
  }
  
  // Timeline Events
  static async getCandidateTimeline(candidateId) {
    try {
      const events = await db.timelineEvents
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Sort by createdAt in descending order (newest first)
      return events.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching timeline:', error);
      throw error;
    }
  }
  
  static async createTimelineEvent(eventData) {
    try {
      const event = createTimelineEvent(eventData);
      const id = await db.timelineEvents.add(event);
      return { ...event, id };
    } catch (error) {
      console.error('Error creating timeline event:', error);
      throw error;
    }
  }
  
  // Notes
  static async getCandidateNotes(candidateId) {
    try {
      const notes = await db.notes
        .where('candidateId')
        .equals(candidateId)
        .toArray();
      
      // Sort by createdAt in descending order (newest first)
      return notes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    } catch (error) {
      console.error('Error fetching notes:', error);
      throw error;
    }
  }
  
  static async createNote(noteData) {
    try {
      const note = createNote(noteData);
      const id = await db.notes.add(note);
      
      // Create timeline event for note
      await this.createTimelineEvent({
        candidateId: noteData.candidateId,
        type: 'note_added',
        title: 'Note Added',
        description: 'A new note was added to the candidate',
        metadata: { noteId: id },
      });
      
      return { ...note, id };
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  }
  
  static async updateNote(id, updates) {
    try {
      await db.notes.update(id, updates);
      return await db.notes.get(id);
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  }
  
  static async deleteNote(id) {
    try {
      await db.notes.delete(id);
    } catch (error) {
      console.error('Error deleting note:', error);
      throw error;
    }
  }
  
  // Assessments
  static async getAssessments(filters = {}) {
    try {
      let query = db.assessments.orderBy('createdAt');
      
      if (filters.jobId && filters.jobId !== 'all') {
        query = query.filter(assessment => assessment.jobId === filters.jobId);
      }
      
      if (filters.status && filters.status !== 'all') {
        query = query.filter(assessment => assessment.status === filters.status);
      }
      
      return await query.reverse().toArray();
    } catch (error) {
      console.error('Error fetching assessments:', error);
      throw error;
    }
  }
  
  static async getAssessmentByJobId(jobId) {
    try {
      return await db.assessments.where('jobId').equals(jobId).first();
    } catch (error) {
      console.error('Error fetching assessment:', error);
      throw error;
    }
  }
  
  static async getAssessmentById(id) {
    try {
      return await db.assessments.get(id);
    } catch (error) {
      console.error('Error fetching assessment by ID:', error);
      throw error;
    }
  }
  
  static async createAssessment(assessmentData) {
    try {
      const assessment = createAssessment(assessmentData);
      console.log('Creating assessment with data:', assessment);
      
      // If an ID is provided, use put() to preserve it; otherwise use add() to let Dexie generate one
      let id;
      if (assessment.id) {
        id = await db.assessments.put(assessment);
        console.log('Assessment created with preserved ID:', id);
      } else {
        id = await db.assessments.add(assessment);
        console.log('Assessment created with generated ID:', id);
      }
      
      return { ...assessment, id };
    } catch (error) {
      console.error('Error creating assessment:', error);
      throw error;
    }
  }
  
  static async updateAssessment(id, updates) {
    try {
      await db.assessments.update(id, updates);
      return await db.assessments.get(id);
    } catch (error) {
      console.error('Error updating assessment:', error);
      throw error;
    }
  }
  
  static async deleteAssessment(id) {
    try {
      await db.assessments.delete(id);
      // Also delete related assessment responses
      await db.assessmentResponses.where('assessmentId').equals(id).delete();
    } catch (error) {
      console.error('Error deleting assessment:', error);
      throw error;
    }
  }
  
  // Assessment Responses
  static async getAssessmentResponse(candidateId, assessmentId) {
    try {
      return await db.assessmentResponses
        .where('[candidateId+assessmentId]')
        .equals([candidateId, assessmentId])
        .first();
    } catch (error) {
      console.error('Error fetching assessment response:', error);
      throw error;
    }
  }
  
  static async createAssessmentResponse(responseData) {
    try {
      const response = createAssessmentResponse(responseData);
      const id = await db.assessmentResponses.add(response);
      
      // Create timeline event
      await this.createTimelineEvent({
        candidateId: responseData.candidateId,
        type: 'assessment_completed',
        title: 'Assessment Completed',
        description: 'Candidate completed the assessment',
        metadata: { assessmentId: responseData.assessmentId, responseId: id },
      });
      
      return { ...response, id };
    } catch (error) {
      console.error('Error creating assessment response:', error);
      throw error;
    }
  }
  
  // Utility methods
  static async clearAllData() {
    try {
      await db.transaction('rw', db.jobs, db.candidates, db.assessments, 
        db.timelineEvents, db.notes, db.assessmentResponses, async () => {
        await db.jobs.clear();
        await db.candidates.clear();
        await db.assessments.clear();
        await db.timelineEvents.clear();
        await db.notes.clear();
        await db.assessmentResponses.clear();
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      throw error;
    }
  }
  
  static async getStats() {
    try {
      const [jobCount, candidateCount, assessmentCount] = await Promise.all([
        db.jobs.count(),
        db.candidates.count(),
        db.assessments.count(),
      ]);
      
      return {
        jobs: jobCount,
        candidates: candidateCount,
        assessments: assessmentCount,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      throw error;
    }
  }
  
  // Debug method to help troubleshoot issues
  static async debugCandidateById(id) {
    try {
      console.log('Debug: Looking for candidate with ID:', id);
      
      // Check if candidate exists
      const candidate = await db.candidates.get(id);
      console.log('Debug: Candidate found:', candidate);
      
      if (!candidate) {
        // Check all candidates to see what IDs exist
        const allCandidates = await db.candidates.toArray();
        console.log('Debug: All candidate IDs:', allCandidates.map(c => c.id));
        console.log('Debug: Total candidates:', allCandidates.length);
      }
      
      return candidate;
    } catch (error) {
      console.error('Debug: Error checking candidate:', error);
      throw error;
    }
  }
  
  static async debugJobById(id) {
    try {
      console.log('Debug: Looking for job with ID:', id);
      
      // Check if job exists
      const job = await db.jobs.get(id);
      console.log('Debug: Job found:', job);
      
      if (!job) {
        // Check all jobs to see what IDs exist
        const allJobs = await db.jobs.toArray();
        console.log('Debug: All job IDs:', allJobs.map(j => j.id));
        console.log('Debug: Total jobs:', allJobs.length);
      }
      
      return job;
    } catch (error) {
      console.error('Debug: Error checking job:', error);
      throw error;
    }
  }
}

export default DatabaseService;
