import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  ArchiveBoxIcon,
  TrashIcon,
  UsersIcon,
  ClipboardDocumentListIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  ClockIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { JOB_STATUS } from '../types';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';
import JobForm from '../components/forms/JobForm';

function InfoItem({ icon: Icon, label, value, className = '' }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-3 rounded-lg p-3 bg-muted/40 ${className}`}>
      <div className="p-2 bg-muted rounded-md">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground">{value}</p>
      </div>
    </div>
  );
}

function EmptyState({ title, subtitle, icon: Icon, children }) {
  return (
    <div className="text-center rounded-lg border bg-card p-10">
      <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      {children}
    </div>
  );
}

export default function JobDetail() {
  const { id } = useParams();

  const [job, setJob] = React.useState(null);
  const [candidates, setCandidates] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);

  const loadJobData = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [jobData, candidatesData] = await Promise.all([
        DatabaseService.getJobById(id),
        DatabaseService.getCandidates({ jobId: id }),
      ]);
      if (!jobData) {
        toast.error(`Job with ID ${id} not found`);
        setJob(null);
        return;
      }
      setJob(jobData);
      setCandidates(Array.isArray(candidatesData) ? candidatesData : []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load job details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    loadJobData();
  }, [loadJobData]);

  const handleUpdateJob = async (jobData) => {
    try {
      const updated = await DatabaseService.updateJob(id, jobData);
      setJob(updated);
      toast.success('Job updated successfully');
      setShowEditModal(false);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job');
    }
  };

  const handleArchiveJob = async () => {
    try {
      const newStatus =
        job.status === JOB_STATUS.ACTIVE ? JOB_STATUS.ARCHIVED : JOB_STATUS.ACTIVE;
      const updated = await DatabaseService.updateJob(id, { status: newStatus });
      setJob(updated);
      toast.success(
        newStatus === JOB_STATUS.ARCHIVED ? 'Job archived' : 'Job unarchived'
      );
    } catch (err) {
      console.error(err);
      toast.error('Failed to update job status');
    }
  };

  const handleDeleteJob = async () => {
    try {
      await DatabaseService.deleteJob(id);
      toast.success('Job deleted successfully');
      window.location.href = '/jobs';
    } catch (err) {
      console.error(err);
      toast.error('Failed to delete job');
    }
  };

  const stageCounts = React.useMemo(() => {
    return candidates.reduce((acc, c) => {
      const key = c.stage || 'unknown';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});
  }, [candidates]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-32 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="animate-pulse">
            <div className="h-24 rounded-xl bg-muted mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-64 rounded-xl bg-muted" />
                <div className="h-80 rounded-xl bg-muted" />
              </div>
              <div className="space-y-6">
                <div className="h-40 rounded-xl bg-muted" />
                <div className="h-48 rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <EmptyState
          title="Job not found"
          subtitle={`The job does not exist or has been removed. ID: ${id}`}
          icon={BriefcaseIcon}
        >
          <div className="flex items-center justify-center gap-3">
            <Link to="/jobs">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Jobs
              </Button>
            </Link>
            <Button onClick={loadJobData}>Retry</Button>
          </div>
        </EmptyState>
      </div>
    );
  }

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  return (
    <div className="min-h-screen bg-background">
      {/* Decorative header */}
      <div className="h-28 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-10">
        {/* Top bar */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <Link to="/jobs" className="shrink-0">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back to Jobs</span>
                </Button>
              </Link>
              <div className="text-left">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    {job.title}
                  </h1>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${
                      job.status === JOB_STATUS.ACTIVE
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {job.status === JOB_STATUS.ACTIVE ? 'Active' : 'Archived'}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Posted {postedDate}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditModal(true)}
                className="h-9"
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleArchiveJob}
                className="h-9"
              >
                <ArchiveBoxIcon className="h-4 w-4 mr-2" />
                {job.status === JOB_STATUS.ACTIVE ? 'Archive' : 'Unarchive'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteModal(true)}
                className="h-9 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Meta row */}
          <div className="border-t p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <InfoItem icon={MapPinIcon} label="Location" value={job.location} />
              <InfoItem
                icon={BuildingOfficeIcon}
                label="Department"
                value={job.department}
              />
              <InfoItem
                icon={ClockIcon}
                label="Job Type"
                value={job.type ? job.type.replace('-', ' ') : '—'}
              />
              {job.salary && (
                <InfoItem
                  icon={CurrencyDollarIcon}
                  label="Salary Range"
                  value={job.salary}
                />
              )}
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Overview */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {job.description && (
                  <section>
                    <h4 className="font-medium mb-2">Description</h4>
                    <div className="rounded-lg bg-muted/40 p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {job.description}
                      </p>
                    </div>
                  </section>
                )}

                {Array.isArray(job.requirements) && job.requirements.length > 0 && (
                  <section>
                    <h4 className="font-medium mb-2">Requirements</h4>
                    <ul className="rounded-lg bg-muted/40 p-4 space-y-2">
                      {job.requirements.map((req, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary flex-shrink-0" />
                          <span className="text-sm">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}

                {Array.isArray(job.benefits) && job.benefits.length > 0 && (
                  <section>
                    <h4 className="font-medium mb-2">Benefits</h4>
                    <ul className="rounded-lg bg-muted/40 p-4 space-y-2">
                      {job.benefits.map((b, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          <span className="mt-1 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                          <span className="text-sm">{b}</span>
                        </li>
                      ))}
                    </ul>
                  </section>
                )}
              </CardContent>
            </Card>

            {/* Candidates */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl">
                    Candidates ({candidates.length})
                  </CardTitle>
                  <Link to={`/candidates?jobId=${id}`}>
                    <Button variant="outline" size="sm">View All</Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {candidates.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-3 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <UsersIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No candidates yet</p>
                    <p className="text-sm text-muted-foreground">
                      Candidates who apply for this job will appear here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {candidates.slice(0, 6).map((c) => {
                      const initials = c.name
                        ? c.name
                            .split(' ')
                            .filter(Boolean)
                            .map((n) => n)
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()
                        : '';
                      return (
                        <div
                          key={c.id}
                          className="flex items-center justify-between rounded-lg border bg-muted/40 p-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                              {initials || '—'}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium truncate">{c.name}</p>
                              <p className="text-sm text-muted-foreground truncate">
                                {c.email}
                              </p>
                            </div>
                          </div>
                          <Link to={`/candidates/${c.id}`}>
                            <Button variant="outline" size="sm">View</Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Job Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                  <span className="text-sm text-muted-foreground">Posted</span>
                  <span className="text-sm font-medium">{postedDate}</span>
                </div>
                <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
                  <span className="text-sm text-muted-foreground">Job ID</span>
                  <span className="text-sm font-mono">{id}</span>
                </div>
              </CardContent>
            </Card>

            {/* Tags */}
            {Array.isArray(job.tags) && job.tags.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Tags</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {job.tags.map((t, i) => (
                      <span
                        key={`${t}-${i}`}
                        className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Pipeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Candidate Pipeline</CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(stageCounts).length === 0 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">No candidates in pipeline</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stageCounts).map(([stage, count]) => (
                      <div
                        key={stage}
                        className="flex items-center justify-between rounded-md bg-muted/40 p-3"
                      >
                        <span className="text-sm font-medium capitalize">
                          {String(stage).replace('_', ' ')}
                        </span>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick actions */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to={`/assessments/${id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                    Build Assessment
                  </Button>
                </Link>
                <Link to={`/candidates?jobId=${id}`} className="block">
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <UsersIcon className="h-4 w-4 mr-2" />
                    View Candidates
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Job"
        size="xl"
      >
        <ModalBody>
          <JobForm
            initialData={job}
            onSubmit={handleUpdateJob}
            onCancel={() => setShowEditModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Job"
        size="sm"
      >
        <ModalBody>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{job.title}"? This action cannot be undone and
            will also delete all associated candidates and assessments.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteJob}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
