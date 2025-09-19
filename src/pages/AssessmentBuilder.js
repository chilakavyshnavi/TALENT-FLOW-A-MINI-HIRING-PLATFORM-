import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeftIcon,
  EyeIcon,
  TrashIcon,
  PencilIcon,
  PlusIcon,
  DocumentTextIcon,
  ClipboardDocumentListIcon,
  BookmarkSquareIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { DatabaseService } from '../services/database';
import { QUESTION_TYPES, createAssessment, createSection, createQuestion } from '../types';
import { Button } from '../components/ui/button.jsx';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Input } from '../components/ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select.jsx';
import Modal, { ModalBody, ModalFooter } from '../components/ui/Modal.jsx';

/* helpers for UI */

function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="text-center rounded-xl border bg-card p-10">
      <div className="mx-auto mb-4 w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
        <Icon className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="font-medium mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{subtitle}</p>
      {action}
    </div>
  );
}

function MetaRow({ label, value }) {
  return (
    <div className="flex items-center justify-between rounded-md bg-muted/40 p-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

function TypeBadge({ type }) {
  const map = {
    [QUESTION_TYPES.SINGLE_CHOICE]: { label: 'Single Choice', cls: 'bg-blue-50 text-blue-700 dark:bg-blue-900/25 dark:text-blue-300' },
    [QUESTION_TYPES.MULTI_CHOICE]: { label: 'Multiple Choice', cls: 'bg-green-50 text-green-700 dark:bg-green-900/25 dark:text-green-300' },
    [QUESTION_TYPES.SHORT_TEXT]: { label: 'Short Text', cls: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/25 dark:text-yellow-300' },
    [QUESTION_TYPES.LONG_TEXT]: { label: 'Long Text', cls: 'bg-purple-50 text-purple-700 dark:bg-purple-900/25 dark:text-purple-300' },
    [QUESTION_TYPES.NUMERIC]: { label: 'Numeric', cls: 'bg-orange-50 text-orange-700 dark:bg-orange-900/25 dark:text-orange-300' },
    [QUESTION_TYPES.FILE_UPLOAD]: { label: 'File Upload', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' },
  };
  const meta = map[type] || { label: 'Unknown', cls: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${meta.cls}`}>
      {meta.label}
    </span>
  );
}

/*Main */

export default function AssessmentBuilder() {
  const { jobId, id } = useParams();

  const [job, setJob] = React.useState(null);
  const [assessment, setAssessment] = React.useState(null);
  const [loading, setLoading] = React.useState(true);
  const [dirty, setDirty] = React.useState(false);

  const [showPreview, setShowPreview] = React.useState(false);
  const [showSectionModal, setShowSectionModal] = React.useState(false);
  const [showQuestionModal, setShowQuestionModal] = React.useState(false);

  const [editingSection, setEditingSection] = React.useState(null);
  const [editingQuestion, setEditingQuestion] = React.useState(null);
  const [editingQuestionSection, setEditingQuestionSection] = React.useState(null);

  const loadData = React.useCallback(async () => {
    try {
      setLoading(true);
      if (id) {
        const assessmentData = await DatabaseService.getAssessmentById(id);
        if (!assessmentData) throw new Error('Assessment not found');
        const jobData = await DatabaseService.getJobById(assessmentData.jobId);
        setJob(jobData);
        setAssessment(assessmentData);
      } else if (jobId) {
        const [jobData, assessmentData] = await Promise.all([
          DatabaseService.getJobById(jobId),
          DatabaseService.getAssessmentByJobId(jobId),
        ]);
        setJob(jobData);
        if (assessmentData) {
          setAssessment(assessmentData);
        } else {
          const newAssessment = createAssessment({
            jobId,
            title: `${jobData?.title} Assessment`,
            description: `Assessment for the ${jobData?.title} position`,
            sections: [],
          });
          setAssessment(newAssessment);
        }
      }
      setDirty(false);
    } catch (error) {
      console.error('Error loading assessment data:', error);
      toast.error('Failed to load assessment');
    } finally {
      setLoading(false);
    }
  }, [jobId, id]);

  React.useEffect(() => {
    if (jobId || id) {
      const t = setTimeout(loadData, 80);
      return () => clearTimeout(t);
    }
  }, [jobId, id, loadData]);

  const markDirty = () => setDirty(true);

  const handleSaveAssessment = async () => {
    try {
      if (assessment.id) {
        await DatabaseService.updateAssessment(assessment.id, assessment);
      } else {
        const saved = await DatabaseService.createAssessment(assessment);
        setAssessment(saved);
      }
      setDirty(false);
      toast.success('Assessment saved successfully');
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save assessment');
    }
  };

  /* Sections */

  const handleAddSection = (sectionData) => {
    const newSection = createSection({
      ...sectionData,
      order: assessment.sections.length,
    });
    setAssessment({
      ...assessment,
      sections: [...assessment.sections, { ...newSection, questions: newSection.questions || [] }],
    });
    setShowSectionModal(false);
    markDirty();
    toast.success('Section added successfully');
  };

  const handleUpdateSection = (sectionData) => {
    const updated = assessment.sections.map((s) => (s.id === editingSection.id ? { ...s, ...sectionData } : s));
    setAssessment({ ...assessment, sections: updated });
    setEditingSection(null);
    setShowSectionModal(false);
    markDirty();
    toast.success('Section updated successfully');
  };

  const handleDeleteSection = (sectionId) => {
    const remaining = assessment.sections.filter((s) => s.id !== sectionId);
    const reindexed = remaining.map((s, i) => ({ ...s, order: i }));
    setAssessment({ ...assessment, sections: reindexed });
    markDirty();
    toast.success('Section deleted successfully');
  };

  /* Questions */

  const handleAddQuestion = (questionData, sectionId) => {
    const updated = assessment.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const q = createQuestion({ ...questionData, order: s.questions.length });
      return { ...s, questions: [...s.questions, q] };
    });
    setAssessment({ ...assessment, sections: updated });
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setEditingQuestionSection(null);
    markDirty();
    toast.success('Question added successfully');
  };

  const handleUpdateQuestion = (questionData, sectionId) => {
    const updated = assessment.sections.map((s) => {
      if (s.id !== sectionId) return s;
      return {
        ...s,
        questions: s.questions.map((q) => (q.id === editingQuestion.id ? { ...q, ...questionData } : q)),
      };
    });
    setAssessment({ ...assessment, sections: updated });
    setShowQuestionModal(false);
    setEditingQuestion(null);
    setEditingQuestionSection(null);
    markDirty();
    toast.success('Question updated successfully');
  };

  const handleDeleteQuestion = (sectionId, questionId) => {
    const updated = assessment.sections.map((s) => {
      if (s.id !== sectionId) return s;
      const remain = s.questions.filter((q) => q.id !== questionId).map((q, i) => ({ ...q, order: i }));
      return { ...s, questions: remain };
    });
    setAssessment({ ...assessment, sections: updated });
    markDirty();
    toast.success('Question deleted successfully');
  };

  /* Loading and Guards */

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

  if (!job || !assessment) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <EmptyState
          icon={BookmarkSquareIcon}
          title="Assessment not found"
          subtitle="The requested assessment or job does not exist or has been removed."
          action={
            <Link to="/assessments">
              <Button variant="outline">
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Back to Assessments
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  /* Derived */

  const totalSections = assessment.sections.length;
  const totalQuestions = assessment.sections.reduce((sum, s) => sum + s.questions.length, 0);
  const headerSubtitle = `${assessment.id ? 'Edit' : 'Create'} assessment for ${job.title}`;

  return (
    <div className="min-h-screen bg-background">
      {/*header */}
      <div className="h-28 w-full bg-gradient-to-r from-primary/10 via-primary/5 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-14 pb-10">
        {/* Top card */}
        <div className="rounded-xl border bg-card shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
            <div className="flex items-start gap-4">
              <Link to="/assessments" className="shrink-0">
                <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                  <ArrowLeftIcon className="h-4 w-4" />
                  <span className="sr-only">Back to Assessments</span>
                </Button>
              </Link>
              <div className="text-left">
                <div className="flex items-center gap-3 mb-1">
                  <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight">
                    Assessment Builder
                  </h1>
                  {dirty && (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                      Unsaved changes
                    </span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {headerSubtitle}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setShowPreview(true)} className="h-9">
                <EyeIcon className="h-4 w-4 mr-2" />
                Preview
              </Button>
              <Button onClick={handleSaveAssessment} className="h-9 bg-[#1f1687]">
                Save
              </Button>
            </div>
          </div>

          {/* Meta strip */}
          <div className="border-t p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <MetaRow label="Job" value={job.title || '—'} />
              <MetaRow label="Sections" value={totalSections} />
              <MetaRow label="Questions" value={totalQuestions} />
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input
                      value={assessment.title}
                      onChange={(e) => {
                        setAssessment((s) => ({ ...s, title: e.target.value }));
                        markDirty();
                      }}
                      placeholder="Enter assessment title"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                      value={assessment.description}
                      onChange={(e) => {
                        setAssessment((s) => ({ ...s, description: e.target.value }));
                        markDirty();
                      }}
                      rows={1}
                      className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                      placeholder="Describe the assessment..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sections */}
            {assessment.sections.length === 0 ? (
              <EmptyState
                icon={DocumentTextIcon}
                title="No sections yet"
                subtitle="Create sections to organize your assessment content."
                action={
                  <Button onClick={() => setShowSectionModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add section
                  </Button>
                }
              />
            ) : (
              <div className="space-y-6">
                {assessment.sections.map((section, sIdx) => {
                  const qCount = section.questions.length;
                  return (
                    <Card key={section.id}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-muted text-xs font-semibold">
                                S{sIdx + 1}
                              </span>
                              <CardTitle className="text-xl truncate">
                                {section.title || `Section ${sIdx + 1}`}
                              </CardTitle>
                            </div>
                            {section.description && (
                              <p className="text-sm text-muted-foreground mt-1">
                                {section.description}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingSection(section);
                                setShowSectionModal(true);
                              }}
                            >
                              <PencilIcon className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingQuestionSection(section);
                                setShowQuestionModal(true);
                              }}
                            >
                              <PlusIcon className="h-4 w-4 mr-2" />
                              Add question
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSection(section.id)}
                              className="text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {qCount === 0 ? (
                          <div className="rounded-md border border-dashed p-6 text-center">
                            <p className="text-sm text-muted-foreground">
                              No questions in this section yet.
                            </p>
                            <div className="mt-3">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingQuestionSection(section);
                                  setShowQuestionModal(true);
                                }}
                              >
                                <PlusIcon className="h-4 w-4 mr-2" />
                                Add first question
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {section.questions.map((q, qIdx) => (
                              <div
                                key={q.id}
                                className="flex items-start justify-between gap-3 rounded-lg border bg-muted/40 p-4"
                              >
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-muted text-[11px] font-semibold">
                                      Q{qIdx + 1}
                                    </span>
                                    <TypeBadge type={q.type} />
                                    {q.required && (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 dark:bg-red-900/25 dark:text-red-300">
                                        Required
                                      </span>
                                    )}
                                  </div>
                                  <p className="mt-2 font-medium truncate">{q.title}</p>
                                  {q.description && (
                                    <p className="text-sm text-muted-foreground truncate">
                                      {q.description}
                                    </p>
                                  )}
                                  {Array.isArray(q.options) && q.options.length > 0 && (
                                    <p className="mt-2 text-xs text-muted-foreground">
                                      {q.options.length} option{q.options.length > 1 ? 's' : ''}
                                    </p>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => {
                                      setEditingQuestion(q);
                                      setEditingQuestionSection(section);
                                      setShowQuestionModal(true);
                                    }}
                                    className="h-8 w-8 p-0"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteQuestion(section.id, q.id)}
                                    className="h-8 w-8 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                                  >
                                    <TrashIcon className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {/* Add section callout */}
            <Card className="border-dashed">
              <CardContent className="p-8 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <PlusIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h4 className="font-semibold">Add new section</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Organize the assessment into clear, focused sections.
                </p>
                <div className="mt-4">
                  <Button onClick={() => setShowSectionModal(true)}>
                    <PlusIcon className="h-4 w-4 mr-2" />
                    Add section
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right sidebar */}
          <div className="space-y-6 lg:sticky lg:top-6 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Structure</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <MetaRow label="Job" value={job.title || '—'} />
                <MetaRow label="Sections" value={totalSections} />
                <MetaRow label="Questions" value={totalQuestions} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowSectionModal(true)}
                >
                  <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                  Add Section
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => setShowPreview(true)}
                >
                  <EyeIcon className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={handleSaveAssessment}
                >
                  Save Assessment
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Section Modal */}
      <Modal
        isOpen={showSectionModal}
        onClose={() => {
          setShowSectionModal(false);
          setEditingSection(null);
        }}
        title={editingSection ? 'Edit Section' : 'Add Section'}
        size="md"
      >
        <ModalBody>
          <SectionForm
            section={editingSection}
            onSubmit={editingSection ? handleUpdateSection : handleAddSection}
            onCancel={() => {
              setShowSectionModal(false);
              setEditingSection(null);
            }}
          />
        </ModalBody>
      </Modal>

      {/* Question Modal */}
      <Modal
        isOpen={showQuestionModal}
        onClose={() => {
          setShowQuestionModal(false);
          setEditingQuestion(null);
          setEditingQuestionSection(null);
        }}
        title={editingQuestion ? 'Edit Question' : 'Add Question'}
        size="lg"
      >
        <ModalBody>
          <QuestionForm
            question={editingQuestion}
            onSubmit={(data) => {
              if (!editingQuestionSection?.id) {
                toast.error('No section selected');
                return;
              }
              if (editingQuestion) {
                handleUpdateQuestion(data, editingQuestionSection.id);
              } else {
                handleAddQuestion(data, editingQuestionSection.id);
              }
            }}
            onCancel={() => {
              setShowQuestionModal(false);
              setEditingQuestion(null);
              setEditingQuestionSection(null);
            }}
          />
        </ModalBody>
      </Modal>

      {/* Preview Modal */}
      <Modal
        isOpen={showPreview}
        onClose={() => setShowPreview(false)}
        title="Assessment Preview"
        size="xl"
      >
        <ModalBody>
          <AssessmentPreview assessment={assessment} />
        </ModalBody>
      </Modal>
    </div>
  );
}

/* ---------- Section Form ---------- */

function SectionForm({ section, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    title: section?.title || '',
    description: section?.description || '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Section title is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Section title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
          placeholder="Enter section title"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
          rows={3}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Describe what this section covers..."
        />
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Save</Button>
      </div>
    </form>
  );
}

/* ---------- Question Form (clean, candidate-like) ---------- */

function QuestionForm({ question, onSubmit, onCancel }) {
  const [formData, setFormData] = React.useState({
    type: question?.type || QUESTION_TYPES.SHORT_TEXT,
    title: question?.title || '',
    description: question?.description || '',
    required: question?.required || false,
    options: question?.options || [],
  });

  const isChoiceType =
    formData.type === QUESTION_TYPES.SINGLE_CHOICE ||
    formData.type === QUESTION_TYPES.MULTI_CHOICE;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Question title is required');
      return;
    }
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <label className="text-sm font-medium">Question type</label>
        <Select
          value={formData.type}
          onValueChange={(value) => setFormData((s) => ({ ...s, type: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={QUESTION_TYPES.SINGLE_CHOICE}>Single Choice</SelectItem>
            <SelectItem value={QUESTION_TYPES.MULTI_CHOICE}>Multiple Choice</SelectItem>
            <SelectItem value={QUESTION_TYPES.SHORT_TEXT}>Short Text</SelectItem>
            <SelectItem value={QUESTION_TYPES.LONG_TEXT}>Long Text</SelectItem>
            <SelectItem value={QUESTION_TYPES.NUMERIC}>Numeric</SelectItem>
            <SelectItem value={QUESTION_TYPES.FILE_UPLOAD}>File Upload</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Question title</label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData((s) => ({ ...s, title: e.target.value }))}
          placeholder="Enter question title"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Description (optional)</label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData((s) => ({ ...s, description: e.target.value }))}
          rows={2}
          className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          placeholder="Add context or instructions..."
        />
      </div>

      {isChoiceType && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Options</label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData((s) => ({ ...s, options: [...s.options, ''] }))}
            >
              <PlusIcon className="h-4 w-4 mr-1.5" />
              Add option
            </Button>
          </div>
          <div className="space-y-2">
            {formData.options.map((opt, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Input
                  value={opt}
                  onChange={(e) => {
                    const next = [...formData.options];
                    next[idx] = e.target.value;
                    setFormData((s) => ({ ...s, options: next }));
                  }}
                  placeholder={`Option ${idx + 1}`}
                />
                <Button
                  type="button"
                  variant="ghost"
                  className="h-9 w-9 p-0 text-destructive hover:text-destructive-foreground hover:bg-destructive/10"
                  onClick={() =>
                    setFormData((s) => ({ ...s, options: s.options.filter((_, i) => i !== idx) }))
                  }
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          id="required"
          type="checkbox"
          checked={formData.required}
          onChange={(e) => setFormData((s) => ({ ...s, required: e.target.checked }))}
          className="h-4 w-4 border-input rounded"
        />
        <label htmlFor="required" className="text-sm">
          This question is required
        </label>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{question ? 'Update Question' : 'Add Question'}</Button>
      </div>
    </form>
  );
}

/* ---------- Preview ---------- */

function AssessmentPreview({ assessment }) {
  return (
    <div className="space-y-8">
      <div className="pb-5 border-b">
        <h2 className="text-2xl sm:text-3xl font-semibold">{assessment.title}</h2>
        {assessment.description && (
          <p className="text-sm text-muted-foreground mt-1">{assessment.description}</p>
        )}
      </div>

      {assessment.sections.map((section, sIdx) => (
        <div key={section.id} className="rounded-lg border p-6">
          <h3 className="text-xl font-semibold">
            {section.title || `Section ${sIdx + 1}`}
          </h3>
          {section.description && (
            <p className="text-sm text-muted-foreground mt-1">{section.description}</p>
          )}

          <div className="mt-6 space-y-6">
            {section.questions.map((q, qIdx) => (
              <div key={q.id}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground">Q{qIdx + 1}</span>
                  {q.required && <span className="text-red-500 text-base leading-none">*</span>}
                </div>
                <p className="font-medium">{q.title}</p>
                {q.description && (
                  <p className="text-sm text-muted-foreground">{q.description}</p>
                )}

                {/* Static preview of input types */}
                {q.type === QUESTION_TYPES.SHORT_TEXT && (
                  <Input disabled placeholder="Short text answer..." className="mt-3" />
                )}
                {q.type === QUESTION_TYPES.LONG_TEXT && (
                  <textarea disabled rows={3} className="mt-3 w-full rounded-md border p-2 text-sm" placeholder="Long text answer..." />
                )}
                {q.type === QUESTION_TYPES.NUMERIC && (
                  <input disabled type="number" className="mt-3 w-full rounded-md border p-2 text-sm" placeholder="Enter a number..." />
                )}
                {(q.type === QUESTION_TYPES.SINGLE_CHOICE || q.type === QUESTION_TYPES.MULTI_CHOICE) && (
                  <div className="mt-3 space-y-2">
                    {q.options?.map((opt, i) => (
                      <label key={i} className="flex items-center gap-2 text-sm">
                        <input disabled type={q.type === QUESTION_TYPES.SINGLE_CHOICE ? 'radio' : 'checkbox'} />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                )}
                {q.type === QUESTION_TYPES.FILE_UPLOAD && (
                  <input disabled type="file" className="mt-3 block w-full text-sm" />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
