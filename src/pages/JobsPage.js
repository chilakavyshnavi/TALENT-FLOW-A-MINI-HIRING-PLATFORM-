import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  PlusIcon, 
  FunnelIcon,
  ArchiveBoxIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { DatabaseService } from '../services/database';
import { JOB_STATUS } from '../types';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip.jsx';
import SearchInput from '../components/ui/SearchInput.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';
import JobForm from '../components/forms/JobForm';
import { useSearch } from '../hooks/useSearch';

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [deletingJob, setDeletingJob] = useState(null);
  const [reordering, setReordering] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Drag and Drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Search 
  const { 
    searchValue, 
    debouncedValue, 
    isSearching, 
    handleSearchChange 
  } = useSearch(searchParams.get('search') || '', 300);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    status: searchParams.get('status') || 'all',
  });

  const loadJobs = React.useCallback(async () => {
    try {
      setLoading(true);
      const jobsData = await DatabaseService.getJobs(filters);
      setJobs(jobsData);
    } catch (error) {
      console.error('Error loading jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  // Update filters when debounced search value changes
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: debouncedValue
    }));
  }, [debouncedValue]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    // Update URL params when filters change
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.status && filters.status !== 'all') params.set('status', filters.status);
    setSearchParams(params);
  }, [filters, setSearchParams]);

  const handleCreateJob = async (jobData) => {
    try {
      await DatabaseService.createJob(jobData);
      toast.success('Job created successfully');
      setShowCreateModal(false);
      loadJobs();
    } catch (error) {
      console.error('Error creating job:', error);
      toast.error('Failed to create job');
    }
  };

  const handleUpdateJob = async (jobData) => {
    try {
      await DatabaseService.updateJob(editingJob.id, jobData);
      toast.success('Job updated successfully');
      setEditingJob(null);
      loadJobs();
    } catch (error) {
      console.error('Error updating job:', error);
      toast.error('Failed to update job');
    }
  };

  const handleArchiveJob = async (job) => {
    try {
      const newStatus = job.status === JOB_STATUS.ACTIVE ? JOB_STATUS.ARCHIVED : JOB_STATUS.ACTIVE;
      await DatabaseService.updateJob(job.id, { status: newStatus });
      toast.success(`Job ${newStatus === JOB_STATUS.ARCHIVED ? 'archived' : 'unarchived'} successfully`);
      loadJobs();
    } catch (error) {
      console.error('Error updating job status:', error);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await DatabaseService.deleteJob(deletingJob.id);
      toast.success('Job deleted successfully');
      setDeletingJob(null);
      loadJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
      toast.error('Failed to delete job');
    }
  };

  const handleDragEnd = async (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const activeIndex = jobs.findIndex(job => job.id === active.id);
      const overIndex = jobs.findIndex(job => job.id === over.id);
      
      // Optimistic update
      const newJobs = arrayMove(jobs, activeIndex, overIndex);
      setJobs(newJobs);
      setReordering(true);
      
      try {
        // Simulate API call with potential failure
        const randomFail = Math.random() < 0.15; // 15% chance of failure to test rollback
        if (randomFail) {
          throw new Error('Simulated reorder failure');
        }
        
        // call the reorder API 
        await DatabaseService.reorderJobs(jobs[activeIndex].order, jobs[overIndex].order);
        toast.success('Jobs reordered successfully');
      } catch (error) {
        console.error('Error reordering jobs:', error);
        toast.error('Failed to reorder jobs. Changes reverted.');
        
        // Rollback on failure
        setJobs(jobs);
      } finally {
        setReordering(false);
      }
    }
  };

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: JOB_STATUS.ACTIVE, label: 'Active' },
    { value: JOB_STATUS.ARCHIVED, label: 'Archived' },
  ];

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
              <span>Jobs</span>
              <span className="mx-2">/</span>
              <span>Overview</span>
            </div>
          </div>
        </div>

        {/* Separator LineFull Width */}
        <hr className="border-t border-border mb-6 -mx-6" />
        
        {/* Title Section */}
        <div className="mb-6 text-left">
          <h1 className="text-3xl font-bold tracking-tight text-foreground text-left">Jobs</h1>
          <p className="text-muted-foreground text-left">
            Manage job postings, track applications, and hire the best talent ({jobs.length} jobs)
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
                    placeholder="Search jobs by title, description, or tags..."
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
                  Create Job
                </Button>
              </div>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
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
                      <SelectItem value={JOB_STATUS.ACTIVE}>Active</SelectItem>
                      <SelectItem value={JOB_STATUS.ARCHIVED}>Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {(filters.status !== 'all' || filters.search) && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setFilters({ search: '', status: 'all' });
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

          {/* Content Area - Jobs List */}
          <div className="flex-1 min-h-0">
            <JobsList 
              jobs={jobs}
              onEdit={setEditingJob}
              onArchive={handleArchiveJob}
              onDelete={setDeletingJob}
              onShowCreate={() => setShowCreateModal(true)}
              filters={filters}
              reordering={reordering}
              onDragEnd={handleDragEnd}
              sensors={sensors}
            />
          </div>
        </div>

        {/* Create Job Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Job"
          description="Add a new job posting with details, requirements, and benefits"
          size="xl"
        >
          <ModalBody>
            <JobForm
              onSubmit={handleCreateJob}
              onCancel={() => setShowCreateModal(false)}
            />
          </ModalBody>
        </Modal>

        {/* Edit Job Modal */}
        <Modal
          isOpen={!!editingJob}
          onClose={() => setEditingJob(null)}
          title="Edit Job"
          description="Update job details, requirements, and benefits"
          size="xl"
        >
          <ModalBody>
            <JobForm
              initialData={editingJob}
              onSubmit={handleUpdateJob}
              onCancel={() => setEditingJob(null)}
            />
          </ModalBody>
        </Modal>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={!!deletingJob}
          onClose={() => setDeletingJob(null)}
          title="Delete Job"
          size="sm"
        >
          <ModalBody>
            <p className="text-sm text-gray-500">
              Are you sure you want to delete "{deletingJob?.title}"? This action cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setDeletingJob(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDeleteJob}>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      </div>
    </TooltipProvider>
  );
}

function JobsList({ jobs, onEdit, onArchive, onDelete, onShowCreate, filters, reordering, onDragEnd, sensors }) {
  if (jobs.length === 0) {
    return (
      <Card className="border border-gray-200 shadow-sm">
        <CardContent className="p-12">
          <div className="text-center">
            <ArchiveBoxIcon className="mx-auto h-16 w-16 text-gray-400" />
            <h3 className="mt-6 text-xl font-semibold text-gray-900">No jobs found</h3>
            <p className="mt-2 text-gray-600 max-w-sm mx-auto">
              {filters.search || (filters.status && filters.status !== 'all') 
                ? 'Try adjusting your search criteria to find more results.'
                : 'Get started by creating your first job posting to attract top talent.'
              }
            </p>
            {!filters.search && filters.status === 'all' && (
              <div className="mt-8">
                <Button 
                  onClick={onShowCreate}
                  className="bg-[#1f1687] hover:bg-[#161357] text-white px-6 py-3"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Create Your First Job
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
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <SortableContext
          items={jobs.map(job => job.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-4">
            {jobs.map((job) => (
              <SortableJobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onArchive={onArchive}
                onDelete={onDelete}
                isReordering={reordering}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function SortableJobCard({ job, onEdit, onArchive, onDelete, isReordering }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: job.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card 
      ref={setNodeRef}
      style={style}
      className={`border border-gray-200 hover:shadow-md hover:border-gray-300 transition-all duration-200 ${
        isDragging ? 'shadow-lg' : ''
      } ${isReordering ? 'pointer-events-none' : ''}`}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex gap-4 flex-1">
            {/* Drag Handle */}
            <div 
              {...attributes}
              {...listeners}
              className="flex items-center cursor-grab active:cursor-grabbing pt-1"
            >
              <Bars3Icon className="h-4 w-4 text-gray-400 hover:text-gray-600" />
            </div>
            
            <div className="flex-1 text-left">
              <div className="flex items-center gap-4 mb-3">
                <h3 className="text-lg font-bold text-gray-900 text-left">
                  {job.title}
                </h3>
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                  job.status === JOB_STATUS.ACTIVE 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-gray-100 text-gray-700'
                }`}>
                  {job.status === JOB_STATUS.ACTIVE ? 'Active' : 'Archived'}
                </span>
              </div>
              
              <div className="flex items-center text-gray-600 text-sm space-x-1 mb-3">
                <span>{job.location}</span>
                <span>•</span>
                <span className="capitalize">{job.type.replace('-', ' ')}</span>
                <span>•</span>
                <span>{job.department}</span>
                {job.salary && (
                  <>
                    <span>•</span>
                    <span>{job.salary}</span>
                  </>
                )}
              </div>
              
              {job.description && (
                <p className="text-gray-700 mb-4 leading-relaxed text-left text-sm">
                  {job.description.length > 120 
                    ? `${job.description.substring(0, 120)}...`
                    : job.description
                  }
                </p>
              )}
              
              <div className="flex flex-wrap gap-2 justify-start">
                {job.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700"
                  >
                    {tag}
                  </span>
                ))}
                {job.tags.length > 3 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                    +{job.tags.length - 3} more
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4 flex-shrink-0">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link to={`/jobs/${job.id}`}>
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
                  onClick={() => onEdit(job)}
                  className="h-8 w-8 p-0 hover:bg-gray-50"
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Edit job</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onArchive(job)}
                  className="h-8 w-8 p-0 hover:bg-gray-50"
                >
                  <ArchiveBoxIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{job.status === JOB_STATUS.ACTIVE ? 'Archive job' : 'Unarchive job'}</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(job)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Delete job</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}