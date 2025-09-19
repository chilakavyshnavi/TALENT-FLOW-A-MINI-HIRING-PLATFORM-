import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS, STAGE_COLORS } from '../types';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';
import { useSearch } from '../hooks/useSearch';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCandidate, setEditingCandidate] = useState(null);
  const [deletingCandidate, setDeletingCandidate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState('list');

  const { 
    searchValue, 
    debouncedValue, 
    handleSearchChange 
  } = useSearch(searchParams.get('search') || '', 150); 

  const [filters, setFilters] = useState(() => ({
    search: searchParams.get('search') || '',
    stage: searchParams.get('stage') || 'all',
    jobId: searchParams.get('jobId') || 'all',
  }));

  const loadCandidates = useCallback(async () => {
    try {
      setLoading(true);
      const [candidatesData, jobsData] = await Promise.all([
        DatabaseService.getCandidates({}),
        DatabaseService.getJobs()
      ]);
      setCandidates(candidatesData);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading candidates:', error);
      toast.error('Failed to load candidates');
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredCandidates = useMemo(() => {
    let filtered = [...candidates];

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(candidate => 
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm)
      );
    }

    if (filters.stage && filters.stage !== 'all') {
      filtered = filtered.filter(candidate => candidate.stage === filters.stage);
    }

    if (filters.jobId && filters.jobId !== 'all') {
      filtered = filtered.filter(candidate => candidate.jobId === filters.jobId);
    }

    return filtered;
  }, [candidates, filters]);

  useEffect(() => {
    if (debouncedValue !== filters.search) {
      setFilters(prev => ({
        ...prev,
        search: debouncedValue
      }));
    }
  }, [debouncedValue, filters.search]);

  useEffect(() => {
    loadCandidates();
  }, [loadCandidates]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.stage && filters.stage !== 'all') params.set('stage', filters.stage);
      if (filters.jobId && filters.jobId !== 'all') params.set('jobId', filters.jobId);
      setSearchParams(params, { replace: true });
    }, 50); 

    return () => clearTimeout(timeoutId);
  }, [filters, setSearchParams]);

  const handleCreateCandidate = async (candidateData) => {
    try {
      await DatabaseService.createCandidate(candidateData);
      toast.success('Candidate created successfully');
      setShowCreateModal(false);
      loadCandidates();
    } catch (error) {
      console.error('Error creating candidate:', error);
      toast.error('Failed to create candidate');
    }
  };

  const handleUpdateCandidate = async (candidateData) => {
    try {
      await DatabaseService.updateCandidate(editingCandidate.id, candidateData);
      toast.success('Candidate updated successfully');
      setEditingCandidate(null);
      loadCandidates();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await DatabaseService.deleteCandidate(deletingCandidate.id);
      toast.success('Candidate deleted successfully');
      setDeletingCandidate(null);
      loadCandidates();
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleStageChange = async (candidateId, newStage) => {
    try {
      await DatabaseService.updateCandidate(candidateId, { stage: newStage });
      toast.success('Candidate stage updated');
      loadCandidates();
    } catch (error) {
      console.error('Error updating candidate stage:', error);
      toast.error('Failed to update candidate stage');
    }
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
              <span>Candidates</span>
              <span className="mx-2">/</span>
              <span>Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className={viewMode === 'list' ? 'bg-[#1f1687] hover:bg-[#161357] text-white' : ''}
            >
              List
            </Button>
            <Button
              variant={viewMode === 'board' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('board')}
              className={viewMode === 'board' ? 'bg-[#1f1687] hover:bg-[#161357] text-white' : ''}
            >
              Board
            </Button>
          </div>
        </div>

        {/*Separator Line(Full Width)*/}
        <hr className="border-t border-border mb-6 -mx-6" />
        
        {/* Title Section*/}
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-left">Candidates</h1>
          <p className="text-muted-foreground text-left">
            Manage candidates and track their progress through the hiring pipeline ({filteredCandidates.length} candidates)
          </p>
        </div>

        <div className="w-full space-y-6 flex-1">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="relative flex-1 max-w-lg">
                  <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={searchValue}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    placeholder="Search candidates..."
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
                  Add Candidate
                </Button>
              </div>
            </div>

            {/* Filter*/}
            {showFilters && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-700">Stage:</span>
                  <Select
                    value={filters.stage}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, stage: value }))}
                  >
                    <SelectTrigger className="w-[140px] h-8">
                      <SelectValue placeholder="All Stages" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Stages</SelectItem>
                      {Object.values(CANDIDATE_STAGES).map(stage => (
                        <SelectItem key={stage} value={stage}>
                          {STAGE_LABELS[stage]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
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

                {(filters.stage !== 'all' || filters.jobId !== 'all' || filters.search) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ search: '', stage: 'all', jobId: 'all' });
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

          {/* Content*/}
          <div className="flex-1 min-h-0">
            {viewMode === 'list' ? (
              <CandidatesList 
                candidates={filteredCandidates}
                jobs={jobs}
                onEdit={setEditingCandidate}
                onDelete={setDeletingCandidate}
                onStageChange={handleStageChange}
                onShowCreate={() => setShowCreateModal(true)}
                filters={filters}
              />
            ) : (
              <CandidatesKanban
                candidates={filteredCandidates}
                jobs={jobs}
                onEdit={setEditingCandidate}
                onDelete={setDeletingCandidate}
                onStageChange={handleStageChange}
              />
            )}
          </div>
        </div>

        {/* Create Candidate Modal */}       
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Add New Candidate"
          description="Add a new candidate with details and hiring stage information"
          size="xl"
        >
          <ModalBody>
            <CandidateForm
              jobs={jobs}
              onSubmit={handleCreateCandidate}
              onCancel={() => setShowCreateModal(false)}
            />
          </ModalBody>
        </Modal>

        {/*Edit-Candidate Modal*/}
        <Modal
          isOpen={!!editingCandidate}
          onClose={() => setEditingCandidate(null)}
          title="Edit Candidate"
          description="Update candidate details and hiring stage information"
          size="xl"
        >
          <ModalBody>
            <CandidateForm
              jobs={jobs}
              initialData={editingCandidate}
              onSubmit={handleUpdateCandidate}
              onCancel={() => setEditingCandidate(null)}
            />
          </ModalBody>
        </Modal>

        {/*Delete-Confirmation Modal*/}
        <Modal
          isOpen={!!deletingCandidate}
          onClose={() => setDeletingCandidate(null)}
          title="Delete Candidate"
          size="sm"
        >
          <ModalBody>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{deletingCandidate?.name}"? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeletingCandidate(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteCandidate}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </TooltipProvider>
  );
}
//list
const CandidatesList = memo(({ candidates, jobs, onEdit, onDelete, onStageChange, onShowCreate, filters }) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const BATCH_SIZE = 20;

  const loadMore = useCallback(() => {
    setVisibleCount(prev => prev + BATCH_SIZE);
  }, []);

  useEffect(() => {
    setVisibleCount(BATCH_SIZE);
  }, [filters]);

  const CandidateCard = memo(({ candidate }) => {
    const candidateJob = useMemo(() => 
      jobs.find(job => job.id === candidate.jobId), 
      [candidate.jobId]
    );

    return (
      <Card className="border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1 text-left">
      <div className="flex items-center gap-4 mb-3">
                <div className="flex-shrink-0">
                <div className="h-12 w-12 rounded-full bg-[#1f1687] flex items-center justify-center shadow-sm">
                    <span className="text-lg font-semibold text-white">
                      {candidate.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </span>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-lg font-bold text-gray-900 text-left truncate">
                      {candidate.name}
                    </h3>
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ${STAGE_COLORS[candidate.stage]}`}>
                      {STAGE_LABELS[candidate.stage]}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm space-x-1">
                    <span className="truncate">{candidate.email}</span>
                    {candidateJob && (
                      <>
                        <span className="flex-shrink-0">•</span>
                        <span className="truncate">{candidateJob.title}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-start">
                {candidateJob?.tags?.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
                {candidateJob?.tags?.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{candidateJob.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              <Select
                value={candidate.stage}
                onValueChange={(value) => onStageChange(candidate.id, value)}
              >
                <SelectTrigger className="w-[140px] h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(CANDIDATE_STAGES).map(stage => (
                    <SelectItem key={stage} value={stage}>
                      {STAGE_LABELS[stage]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to={`/candidates/${candidate.id}`}>
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
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onEdit(candidate)}
                    className="h-8 w-8 p-0 hover:bg-gray-50"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Edit candidate</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDelete(candidate)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Delete candidate</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  });

  if (candidates.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No candidates found</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              {filters.search || (filters.stage && filters.stage !== 'all') || (filters.jobId && filters.jobId !== 'all')
                ? 'Try adjusting your search criteria to find more results.'
                : 'Get started by adding your first candidate to track their progress through the hiring pipeline.'
              }
            </p>
            {!filters.search && filters.stage === 'all' && filters.jobId === 'all' && (
              <div className="mt-8">
                <Button 
                  onClick={onShowCreate}
                  className="bg-[#1f1687] hover:bg-[#161357] text-white px-6 py-3"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Your First Candidate
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  const visibleCandidates = candidates.slice(0, visibleCount);
  const hasMore = candidates.length > visibleCount;

  return (
    <div className="h-full">
      <div className="space-y-4">
        {visibleCandidates.map((candidate) => (
          <CandidateCard key={candidate.id} candidate={candidate} />
        ))}
        
        {hasMore && (
          <div className="text-center py-6">
            <Button
              variant="outline"
              onClick={loadMore}
              className="px-8 py-3"
            >
              Load More ({candidates.length - visibleCount} remaining)
            </Button>
          </div>
        )}
        
        {!hasMore && candidates.length > BATCH_SIZE && (
          <div className="text-center py-4 text-muted-foreground">
            Showing all {candidates.length} candidates
          </div>
        )}
      </div>
    </div>
  );
});

// Kanban Board 
const CandidatesKanban = memo(({ candidates, jobs, onEdit, onDelete, onStageChange }) => {
  const [visibleCounts, setVisibleCounts] = useState({});
  const BATCH_SIZE = 10;
  const stages = Object.values(CANDIDATE_STAGES);
  
  const grouped = useMemo(() => {
    const map = {};
    stages.forEach(s => { map[s] = []; });
    candidates.forEach(c => {
      if (!map[c.stage]) map[c.stage] = [];
      map[c.stage].push(c);
    });
    return map;
  }, [candidates]);

  const handleDrop = useCallback((e, targetStage) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (!id) return;
    onStageChange(id, targetStage);
  }, [onStageChange]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const loadMore = useCallback((stageKey) => {
    setVisibleCounts(prev => ({
      ...prev,
      [stageKey]: (prev[stageKey] || BATCH_SIZE) + BATCH_SIZE
    }));
  }, []);

  const CandidateItem = memo(({ candidate }) => {
    const candidateJob = useMemo(() => jobs.find(j => j.id === candidate.jobId), [candidate.jobId]);
    return (
      <div
        draggable
        onDragStart={(e) => e.dataTransfer.setData('text/plain', candidate.id)}
        className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm cursor-move hover:shadow transition min-h-[80px]"
      >
        <div className="flex items-start justify-between h-full">
          <div className="text-left flex-1 min-w-0">
            <div className="font-semibold text-sm text-gray-900 truncate" title={candidate.name}>
              {candidate.name}
            </div>
            {candidateJob && (
              <div className="mt-1 text-xs text-gray-600 truncate" title={candidateJob.title}>
                {candidateJob.title}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={() => onEdit(candidate)}>
              <PencilIcon className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-red-600 hover:bg-red-50" onClick={() => onDelete(candidate)}>
              <TrashIcon className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  });

  const StageColumn = memo(({ stageKey, candidates: stageCandidates }) => {
    const visibleCount = visibleCounts[stageKey] || BATCH_SIZE;
    const visibleCandidates = stageCandidates.slice(0, visibleCount);
    const hasMore = stageCandidates.length > visibleCount;

    return (
      <div className="flex flex-col min-h-[400px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm font-semibold">{STAGE_LABELS[stageKey]}</div>
          <span className={`text-xs px-2 py-1 rounded-full ${STAGE_COLORS[stageKey]}`}>
            {stageCandidates.length}
          </span>
        </div>
        <div
          onDrop={(e) => handleDrop(e, stageKey)}
          onDragOver={handleDragOver}
          className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-lg p-2 space-y-2 overflow-auto"
        >
          {visibleCandidates.map((c) => (
            <CandidateItem key={c.id} candidate={c} />
          ))}
          {hasMore && (
            <div className="text-center py-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => loadMore(stageKey)}
                className="text-xs px-3 py-1 h-7"
              >
                Load More ({stageCandidates.length - visibleCount} remaining)
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  });

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {stages.map((stageKey) => (
        <StageColumn 
          key={stageKey} 
          stageKey={stageKey} 
          candidates={grouped[stageKey] || []} 
        />
      ))}
    </div>
  );
});

// Enhanced CandidateForm
function CandidateForm({ initialData, onSubmit, onCancel, jobs = [] }) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    email: initialData?.email || '',
    phone: initialData?.phone || '',
    stage: initialData?.stage || CANDIDATE_STAGES.APPLIED,
    jobId: initialData?.jobId || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const stageOptions = Object.values(CANDIDATE_STAGES).map(stage => ({
    value: stage,
    label: STAGE_LABELS[stage],
  }));

  const jobOptions = jobs.map(job => ({
    value: job.id,
    label: job.title,
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            placeholder="Enter candidate's full name"
            className="w-full"
          />
        </div>
        
        <Input
          label="Email Address"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
          placeholder="candidate@example.com"
          className="w-full"
        />
        
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="+1 (555) 123-4567"
          className="w-full"
        />
        
        <Select
          value={formData.stage}
          onValueChange={(value) => setFormData({ ...formData, stage: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Stage" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        <Select
          value={formData.jobId || "none"}
          onValueChange={(value) => setFormData({ ...formData, jobId: value === "none" ? "" : value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Job (Optional)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No Job Selected</SelectItem>
            {jobOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="bg-[#1f1687] hover:bg-[#161357] text-white">
          {loading ? 'Saving...' : (initialData ? 'Update Candidate' : 'Add Candidate')}
        </Button>
      </div>
    </form>
  );
}