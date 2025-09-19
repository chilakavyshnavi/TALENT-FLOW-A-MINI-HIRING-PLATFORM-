import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  ClockIcon,
  EnvelopeIcon,
  PhoneIcon,
  PlusIcon,
  ChatBubbleLeftIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { CANDIDATE_STAGES, STAGE_LABELS, STAGE_COLORS } from '../types';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';

/*  UI helpers*/

function EmptyState({ icon: Icon, title, subtitle, actions }) {
  return (
    <div className="text-center rounded-xl border bg-card p-10">
      <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      {actions}
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 rounded-lg p-3 bg-muted/40">
      <div className="p-2 bg-muted rounded-md">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 text-left">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm text-muted-foreground break-all">{value}</p>
      </div>
    </div>
  );
}

function StageBadge({ stage }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium ${STAGE_COLORS[stage]}`}>
      {STAGE_LABELS[stage] || stage}
    </span>
  );
}

/* Candidate Detail Page*/

export default function CandidateDetail() {
  const { id } = useParams();

  const [candidate, setCandidate] = React.useState(null);
  const [timeline, setTimeline] = React.useState([]);
  const [notes, setNotes] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  const [showEditModal, setShowEditModal] = React.useState(false);
  const [showDeleteModal, setShowDeleteModal] = React.useState(false);
  const [showNoteModal, setShowNoteModal] = React.useState(false);

  const loadCandidateData = React.useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [candidateData, timelineData, notesData] = await Promise.all([
        DatabaseService.getCandidateById(id),
        DatabaseService.getCandidateTimeline(id),
        DatabaseService.getCandidateNotes(id),
      ]);
      if (!candidateData) {
        toast.error(`Candidate with ID ${id} not found`);
        setCandidate(null);
        return;
      }
      setCandidate(candidateData);
      setTimeline(Array.isArray(timelineData) ? timelineData : []);
      setNotes(Array.isArray(notesData) ? notesData : []);
    } catch (error) {
      console.error('Error loading candidate data:', error);
      toast.error('Failed to load candidate details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    const t = setTimeout(loadCandidateData, 80);
    return () => clearTimeout(t);
  }, [loadCandidateData]);

  const handleUpdateCandidate = async (candidateData) => {
    try {
      const updated = await DatabaseService.updateCandidate(id, candidateData);
      setCandidate(updated);
      toast.success('Candidate updated successfully');
      setShowEditModal(false);
      loadCandidateData();
    } catch (error) {
      console.error('Error updating candidate:', error);
      toast.error('Failed to update candidate');
    }
  };

  const handleDeleteCandidate = async () => {
    try {
      await DatabaseService.deleteCandidate(id);
      toast.success('Candidate deleted successfully');
      window.location.href = '/candidates';
    } catch (error) {
      console.error('Error deleting candidate:', error);
      toast.error('Failed to delete candidate');
    }
  };

  const handleAddNote = async (noteData) => {
    try {
      await DatabaseService.createNote({
        ...noteData,
        candidateId: id,
      });
      toast.success('Note added successfully');
      setShowNoteModal(false);
      loadCandidateData();
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const stageOptions = React.useMemo(
    () =>
      Object.values(CANDIDATE_STAGES).map((stage) => ({
        value: stage,
        label: STAGE_LABELS[stage],
      })),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="h-28 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
          <div className="animate-pulse">
            <div className="h-24 rounded-xl bg-muted mb-6" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <div className="h-48 rounded-xl bg-muted" />
                <div className="h-80 rounded-xl bg-muted" />
              </div>
              <div className="space-y-6">
                <div className="h-60 rounded-xl bg-muted" />
                <div className="h-40 rounded-xl bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!candidate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <EmptyState
          icon={UserIcon}
          title="Candidate not found"
          subtitle={`The candidate does not exist or has been removed. ID: ${id}`}
          actions={
            <div className="flex items-center justify-center gap-3">
              <Link to="/candidates">
                <Button variant="outline">
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Candidates
                </Button>
              </Link>
              <Button onClick={loadCandidateData}>Retry</Button>
            </div>
          }
        />
      </div>
    );
  }

  const addedDate = candidate.createdAt
    ? new Date(candidate.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '—';

  const initials =
    candidate.name
      ?.split(' ')
      .filter(Boolean)
      .map((n) => n)
      .join('')
      .slice(0, 2)
      .toUpperCase() || '—';

  return (
    <div className="min-h-screen bg-background">
      {/*headeing */}
      <div className="h-28 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-10">
        {/* Top card*/}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <Link to="/candidates" className="shrink-0">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back to Candidates</span>
                </Button>
              </Link>

              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                  {initials}
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                      {candidate.name}
                    </h1>
                    <StageBadge stage={candidate.stage} />
                  </div>
                  <p className="text-sm text-muted-foreground">Added {addedDate}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowNoteModal(true)}
                className="h-9"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Note
              </Button>
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
                onClick={() => setShowDeleteModal(true)}
                className="h-9 text-destructive hover:text-destructive-foreground hover:bg-destructive"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </div>
          </div>

          {/* Meta strip*/}
          <div className="border-t p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <InfoRow icon={EnvelopeIcon} label="Email" value={candidate.email} />
              <InfoRow icon={PhoneIcon} label="Phone" value={candidate.phone} />
              <InfoRow icon={ClockIcon} label="Current Stage" value={STAGE_LABELS[candidate.stage]} />
            </div>
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left-column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Contact & Cover Letter */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Contact & Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InfoRow icon={EnvelopeIcon} label="Email Address" value={candidate.email} />
                  <InfoRow icon={PhoneIcon} label="Phone Number" value={candidate.phone} />
                </div>

                {candidate.coverLetter && (
                  <section className="pt-2 border-t">
                    <h4 className="font-medium mb-3">Cover Letter</h4>
                    <div className="bg-muted/40 rounded-lg p-4">
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {candidate.coverLetter}
                      </p>
                    </div>
                  </section>
                )}
              </CardContent>
            </Card>

            {/**Activity Timeline **/}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {timeline.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-3 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <ClockIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No timeline events</p>
                    <p className="text-sm text-muted-foreground">
                      Timeline events will appear as the candidate progresses.
                    </p>
                  </div>
                ) : (
                  <ol className="relative border-l border-border pl-4 space-y-6">
                    {timeline.map((event) => (
                      <li key={event.id} className="ml-2">
                        <div className="absolute -left-[6px] mt-1 h-3 w-3 rounded-full bg-primary" />
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h4 className="font-medium mb-1">{event.title}</h4>
                            <p className="text-sm text-muted-foreground mb-2">{event.description}</p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {new Date(event.createdAt).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </CardContent>
            </Card>

            {/* * Notes* */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-xl">Notes</CardTitle>
                  <Button variant="outline" size="sm" onClick={() => setShowNoteModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add Note
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <div className="text-center py-10">
                    <div className="mx-auto mb-3 w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                      <ChatBubbleLeftIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="font-medium mb-1">No notes yet</p>
                    <p className="text-sm text-muted-foreground">
                      Add notes to track important information about this candidate.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {notes.map((n) => (
                      <div key={n.id} className="rounded-lg border bg-muted/40 p-4">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap mb-2">{n.content}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(n.createdAt).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* right-side bar */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            {/* Stage Management */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Stage Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <StageBadge stage={candidate.stage} />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Move to Stage</label>
                  <Select
                    value={candidate.stage}
                    onValueChange={async (newStage) => {
                      try {
                        await DatabaseService.updateCandidate(id, { stage: newStage });
                        toast.success('Stage updated successfully');
                        loadCandidateData();
                      } catch (error) {
                        toast.error('Failed to update stage');
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                    <SelectContent>
                      {stageOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Quick actions*/}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowNoteModal(true)}
                >
                  <ChatBubbleLeftIcon className="h-4 w-4 mr-2" />
                  Add Note
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowEditModal(true)}
                >
                  <PencilIcon className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Edit-Candidate Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Candidate"
        size="md"
      >
        <ModalBody>
          <CandidateEditForm
            candidate={candidate}
            onSubmit={handleUpdateCandidate}
            onCancel={() => setShowEditModal(false)}
          />
        </ModalBody>
      </Modal>

      {/* Add Note Modal */}
      <Modal
        isOpen={showNoteModal}
        onClose={() => setShowNoteModal(false)}
        title="Add Note"
        size="md"
      >
        <ModalBody>
          <NoteForm onSubmit={handleAddNote} onCancel={() => setShowNoteModal(false)} />
        </ModalBody>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Candidate"
        size="sm"
      >
        <ModalBody>
          <p className="text-muted-foreground">
            Are you sure you want to delete "{candidate.name}"? This action cannot be undone and
            will also delete all associated notes and timeline events.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDeleteCandidate}>
            Delete
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}

/*  Edit Candidate Form  */

function CandidateEditForm({ candidate, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    name: candidate.name || '',
    email: candidate.email || '',
    phone: candidate.phone || '',
    stage: candidate.stage || CANDIDATE_STAGES.APPLIED,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email) {
      toast.error('Name and email are required');
      return;
    }
    onSubmit(formData);
  };

  const stageOptions = React.useMemo(
    () =>
      Object.values(CANDIDATE_STAGES).map((stage) => ({
        value: stage,
        label: STAGE_LABELS[stage],
      })),
    []
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Full Name</label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData((s) => ({ ...s, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData((s) => ({ ...s, email: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Phone</label>
        <Input
          value={formData.phone}
          onChange={(e) => setFormData((s) => ({ ...s, phone: e.target.value }))}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Stage</label>
        <Select
          value={formData.stage}
          onValueChange={(value) => setFormData((s) => ({ ...s, stage: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select stage" />
          </SelectTrigger>
          <SelectContent>
            {stageOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Candidate</Button>
      </div>
    </form>
  );
}

/* @mentions*/

function NoteForm({ onSubmit, onCancel }) {
  const [content, setContent] = React.useState('');
  const [showMentions, setShowMentions] = React.useState(false);
  const [mentionQuery, setMentionQuery] = React.useState('');
  const [mentionPosition, setMentionPosition] = React.useState(0);
  const textareaRef = React.useRef(null);

  const teamMembers = [
    { id: '1', name: 'John Smith', role: 'Hiring Manager', email: 'john@company.com' },
    { id: '2', name: 'Sarah Johnson', role: 'HR Director', email: 'sarah@company.com' },
    { id: '3', name: 'Mike Chen', role: 'Tech Lead', email: 'mike@company.com' },
    { id: '4', name: 'Lisa Brown', role: 'Recruiter', email: 'lisa@company.com' },
    { id: '5', name: 'David Wilson', role: 'CEO', email: 'david@company.com' },
  ];

  const filteredMembers = teamMembers.filter(
    (m) =>
      m.name.toLowerCase().includes(mentionQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(mentionQuery.toLowerCase())
  );  
  
  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);

    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = newContent.slice(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf('@');

    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.slice(lastAtIndex + 1);
      if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
        setMentionQuery(textAfterAt);
        setMentionPosition(lastAtIndex);
        setShowMentions(true);
      } else {
        setShowMentions(false);
      }
    } else {
      setShowMentions(false);
    }
  };

  const insertMention = (member) => {
    const before = content.slice(0, mentionPosition);
    const after = content.slice(mentionPosition + mentionQuery.length + 1);
    const next = `${before}@${member.name} ${after}`;

    setContent(next);
    setShowMentions(false);
    setMentionQuery('');

    requestAnimationFrame(() => {
      if (textareaRef.current) {
        const newCursorPos = mentionPosition + member.name.length + 2;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCursorPos, newCursorPos);
      }
    });
  };

  const handleKeyDown = (e) => {
    if (showMentions && e.key === 'Escape') {
      setShowMentions(false);
      e.preventDefault();
    }
  };

  const extractMentions = (text) => {
    const mentionRegex = /@([A-Za-z\s]+)(?=\s|$)/g;
    const mentions = [];
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      const name = match[21].trim();
      const member = teamMembers.find((m) => m.name === name);
      if (member) mentions.push(member);
    }
    return mentions;
  };

  const renderContentWithMentions = (text) => {
    if (!text) return '';
    const mentionRegex = /@([A-Za-z\s]+)(?=\s|$)/g;
    const parts = text.split(mentionRegex);
    return parts.map((part, idx) => {
      if (idx % 2 === 1) {
        const member = teamMembers.find((m) => m.name === part.trim());
        if (member) {
          return (
            <span
              key={idx}
              className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 px-1 rounded font-medium"
            >
              @{part}
            </span>
          );
        }
      }
      return <React.Fragment key={idx}>{part}</React.Fragment>;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error('Note content is required');
      return;
    }
    const mentions = extractMentions(content);
    onSubmit({ content: content.trim(), mentions });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Note Content</label>
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleContentChange}
            onKeyDown={handleKeyDown}
            rows={4}
            className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            placeholder="Add your note here... Type @ to mention team members"
            required
          />

          {showMentions && filteredMembers.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-popover border rounded-md shadow-lg z-10 max-h-48 overflow-y-auto">
              {filteredMembers.map((member) => (
                <button
                  key={member.id}
                  type="button"
                  onClick={() => insertMention(member)}
                  className="w-full px-3 py-2 text-left hover:bg-accent flex items-center gap-3 text-sm"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 flex items-center justify-center">
                    <span className="text-xs font-semibold text-blue-700 dark:text-blue-400">
                      {member.name
                        .split(' ')
                        .filter(Boolean)
                        .map((n) => n)
                        .join('')}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium">{member.name}</div>
                    <div className="text-xs text-muted-foreground">{member.role}</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {content && (
          <div className="mt-3 p-3 bg-muted/40 rounded-md border">
            <p className="text-sm text-muted-foreground mb-2">Preview:</p>
            <div className="text-sm whitespace-pre-wrap">{renderContentWithMentions(content)}</div>
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Tip: Type @ followed by a name to mention team members. They’ll be notified about this note.
        </p>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Add Note</Button>
      </div>
    </form>
  );
}
