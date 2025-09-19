import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  ClipboardDocumentListIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';
import { useSearch } from '../hooks/useSearch';

export default function AssessmentsPage() {
  const [jobs, setJobs] = useState([]);
  const [allAssessments, setAllAssessments] = useState([]);
  const [filteredAssessments, setFilteredAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [deletingAssessment, setDeletingAssessment] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10); // Show 10 assessments per page

  // Search functionality
  const { 
    searchValue, 
    debouncedValue, 
    isSearching, 
    handleSearchChange 
  } = useSearch(searchParams.get('search') || '', 300);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    jobId: searchParams.get('jobId') || 'all',
    status: searchParams.get('status') || 'all',
  });

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      const [jobsData, assessmentsData] = await Promise.all([
        DatabaseService.getJobs({ status: 'active' }),
        DatabaseService.getAssessments ? DatabaseService.getAssessments() : []
      ]);
      
      // Enhance assessments with job titles and mock statistics for display
      const enhancedAssessments = assessmentsData.map(assessment => {
        const job = jobsData.find(j => j.id === assessment.jobId);
        return {
          ...assessment,
          jobTitle: job?.title || 'Unknown Job',
          questionCount: assessment.sections?.reduce((total, section) => total + (section.questions?.length || 0), 0) || Math.floor(Math.random() * 15) + 10,
          responseCount: Math.floor(Math.random() * 50),
          passRate: Math.floor(Math.random() * 40) + 60,
          avgScore: Math.floor(Math.random() * 30) + 70,
          status: assessment.status || 'active'
        };
      });
      
      setJobs(jobsData);
      setAllAssessments(enhancedAssessments);
    } catch (error) {
      console.error('Error loading assessments data:', error);
      toast.error('Failed to load assessments');
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter assessments based on search and other filters
  useEffect(() => {
    let filtered = allAssessments;

    // Apply search filter
    if (debouncedValue.trim()) {
      filtered = filtered.filter(assessment =>
        assessment.title.toLowerCase().includes(debouncedValue.toLowerCase()) ||
        assessment.jobTitle.toLowerCase().includes(debouncedValue.toLowerCase()) ||
        assessment.description.toLowerCase().includes(debouncedValue.toLowerCase())
      );
    }

    // Apply job filter
    if (filters.jobId && filters.jobId !== 'all') {
      filtered = filtered.filter(assessment => assessment.jobId === filters.jobId);
    }

    // Apply status filter
    if (filters.status && filters.status !== 'all') {
      filtered = filtered.filter(assessment => assessment.status === filters.status);
    }

    setFilteredAssessments(filtered);
    setCurrentPage(1); // Reset to first page when filters change
  }, [debouncedValue, filters.jobId, filters.status, allAssessments]);

  // Update filters when debounced search value changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedValue
    }));
  }, [debouncedValue]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.jobId && filters.jobId !== 'all') params.set('jobId', filters.jobId);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleDeleteAssessment = async () => {
    try {
      await DatabaseService.deleteAssessment(deletingAssessment.id);
      toast.success('Assessment deleted successfully');
      setDeletingAssessment(null);
      loadData(); // Reload data from database
    } catch (error) {
      console.error('Error deleting assessment:', error);
      toast.error('Failed to delete assessment');
    }
  };

  const handleCreateAssessment = async (assessmentData) => {
    try {
      const job = jobs.find(j => j.id === assessmentData.jobId);
      const newAssessmentData = {
        ...assessmentData,
        jobTitle: job?.title || 'Unknown Job',
        sections: [], // Empty sections initially - can be populated later
        settings: {
          timeLimit: 60,
          allowMultipleAttempts: false,
          showResults: true,
        },
      };
      
      await DatabaseService.createAssessment(newAssessmentData);
      toast.success('Assessment created successfully');
      setShowCreateModal(false);
      loadData(); // Reload data from database
    } catch (error) {
      console.error('Error creating assessment:', error);
      toast.error('Failed to create assessment');
    }
  };

  // Filter options
  const jobOptions = [
    { value: 'all', label: 'All Jobs' },
    ...jobs.map(job => ({
      value: job.id,
      label: job.title,
    })),
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'active', label: 'Active' },
    { value: 'draft', label: 'Draft' },
  ];

  // Pagination logic
  const totalPages = Math.ceil(filteredAssessments.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-start mb-2">
          <div className="flex-1">
            {/* Breadcrumb */}
            <div className="flex items-center text-sm text-muted-foreground mb-2">
              <span>Assessments</span>
              <span className="mx-2">/</span>
              <span>Overview</span>
            </div>
          </div>
        </div>

        {/* Separator Line - Full Width */}
        <hr className="border-t border-border mb-6 -mx-6" />
        
        {/* Title Section */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-left">Assessments</h1>
          <p className="text-muted-foreground text-left">
            Build and manage job-specific assessments and quizzes to evaluate candidates ({filteredAssessments.length} assessments)
          </p>
        </div>

        <div className="w-full space-y-6 flex-1">
          {/* Top Actions */}
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-lg">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search assessments by title, job, or description..."
                    className="pl-10 h-10 text-sm w-full"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="flex items-center gap-2"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <FunnelIcon className="w-4 h-4" />
                  Filters
                </Button>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  size="sm" 
                  className="bg-[#1f1687] hover:bg-[#161357] text-white flex items-center gap-2"
                >
                  <PlusIcon className="h-4 w-4" />
                  Create Assessment
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Job:</span>
                  <Select
                    value={filters.jobId}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, jobId: value }))}
                  >
                    <SelectTrigger className="w-[180px] h-8">
                      <SelectValue placeholder="All Jobs" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Jobs</SelectItem>
                      {jobs.map(job => (
                        <SelectItem key={job.id} value={job.id}>
                          {job.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Status:</span>
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="draft">Draft</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(filters.jobId !== 'all' || filters.status !== 'all' || filters.search) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ search: '', jobId: 'all', status: 'all' });
                      handleSearchChange('');
                    }}
                    className="h-8 text-xs"
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Content Area - Assessments List */}
          <div className="flex-1 min-h-0">
            <AssessmentsList 
              assessments={paginatedAssessments}
              filteredAssessments={filteredAssessments}
              onDelete={setDeletingAssessment}
              onShowCreate={() => setShowCreateModal(true)}
              filters={filters}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>

        {/* Create Assessment Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Assessment"
          description="Build a comprehensive assessment to evaluate candidates effectively"
          size="xl"
        >
          <ModalBody>
            <AssessmentForm
              jobs={jobs}
              onSubmit={handleCreateAssessment}
              onCancel={() => setShowCreateModal(false)}
            />
          </ModalBody>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingAssessment}
          onClose={() => setDeletingAssessment(null)}
          title="Delete Assessment"
          size="sm"
        >
          <ModalBody>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{deletingAssessment?.title}"? This action cannot be undone and will remove all associated data.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeletingAssessment(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteAssessment}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </TooltipProvider>
  );
}

// Assessments List Component - matches CandidatesPage structure
function AssessmentsList({ 
  assessments, 
  filteredAssessments, 
  onDelete, 
  onShowCreate, 
  filters,
  currentPage,
  totalPages,
  onPageChange 
}) {
  if (filteredAssessments.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <ClipboardDocumentListIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No assessments found</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              {filters.search || (filters.jobId && filters.jobId !== 'all') || (filters.status && filters.status !== 'all')
                ? 'Try adjusting your search criteria to find more results.'
                : 'Create your first assessment to evaluate candidates effectively.'
              }
            </p>
            {!filters.search && filters.jobId === 'all' && filters.status === 'all' && (
              <div className="mt-8">
                <Button 
                  onClick={onShowCreate}
                  className="bg-[#1f1687] hover:bg-[#161357] text-white px-6 py-3"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Assessment
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="h-full">
      <div className="space-y-4">
        {assessments.map((assessment) => (
          <AssessmentCard key={assessment.id} assessment={assessment} onDelete={onDelete} />
        ))}
        
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 py-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-gray-600">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// Assessment Card Component
function AssessmentCard({ assessment, onDelete }) {
  return (
    <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1 text-left">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-[#1f1687] flex items-center justify-center shadow-sm">
                  <span className="text-lg font-semibold text-white">
                    {assessment.title.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-lg font-bold text-gray-900 text-left truncate">
                    {assessment.title}
                  </h3>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                    assessment.status === 'active' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {assessment.status === 'active' ? 'Active' : 'Draft'}
                  </span>
                </div>
                <div className="flex items-center text-gray-600 text-sm space-x-1">
                  <span className="truncate">For: {assessment.jobTitle}</span>
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-shrink-0">{assessment.questionCount} questions</span>
                  <span className="flex-shrink-0">•</span>
                  <span className="flex-shrink-0">{assessment.responseCount} responses</span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 leading-relaxed text-left text-sm">
              Assessment details and evaluation criteria
            </p>
            
            <div className="flex flex-wrap gap-2 justify-start">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {assessment.passRate}% pass rate
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                {assessment.avgScore} avg score
              </span>
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                +2 more
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/assessments/${assessment.jobId}`}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-blue-50">
                    <EyeIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>View details</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/assessments/${assessment.id}/edit`}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit assessment</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(assessment)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete assessment</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Assessment Form Component
function AssessmentForm({ jobs, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    jobId: '',
    title: '',
    description: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.jobId || !formData.title) {
      toast.error('Job and title are required');
      return;
    }

    setLoading(true);
    try {
      const job = jobs.find(j => j.id === formData.jobId);
      await onSubmit({
        ...formData,
        jobTitle: job?.title || 'Unknown Job',
      });
    } finally {
      setLoading(false);
    }
  };

  const jobOptions = jobs.map(job => ({
    value: job.id,
    label: job.title,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        <Select
          value={formData.jobId}
          onValueChange={(value) => {
            const job = jobs.find(j => j.id === value);
            setFormData({ 
              ...formData, 
              jobId: value,
              title: job ? `${job.title} Assessment` : '',
              description: job ? `Technical assessment for ${job.title} position covering essential skills and competencies.` : ''
            });
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a job position" />
          </SelectTrigger>
          <SelectContent>
            {jobOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Assessment Title
           </label>
           <Input
             value={formData.title}
             onChange={(e) => setFormData({ ...formData, title: e.target.value })}
             placeholder="Enter assessment title"
             required
           />
         </div>
         
         <div>
           <label className="block text-sm font-medium text-gray-700 mb-2">
             Description
           </label>
           <textarea
             value={formData.description}
             onChange={(e) => setFormData({ ...formData, description: e.target.value })}
             rows={4}
             className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
             placeholder="Describe what this assessment will evaluate..."
           />
         </div>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#1f1687] hover:bg-[#161357] text-white">
          {loading ? 'Creating...' : 'Create Assessment'}
        </Button>
      </div>
    </form>
  );
}