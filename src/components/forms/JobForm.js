import React from 'react';
import { useForm } from 'react-hook-form';
import { JOB_STATUS } from '../../types';
import { Input } from '../ui/input.jsx';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select.jsx';
import { Button } from '../ui/button.jsx';

export default function JobForm({ initialData, onSubmit, onCancel }) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch,
  } = useForm({
    defaultValues: initialData || {
      title: '',
      description: '',
      requirements: [],
      benefits: [],
      tags: [],
      location: '',
      salary: '',
      type: 'full-time',
      department: '',
      status: JOB_STATUS.ACTIVE,
    },
  });

  const watchedTags = watch('tags') || [];

  const jobTypes = [
    { value: 'full-time', label: 'Full-time' },
    { value: 'part-time', label: 'Part-time' },
    { value: 'contract', label: 'Contract' },
    { value: 'internship', label: 'Internship' },
  ];

  const departments = [
    { value: 'Engineering', label: 'Engineering' },
    { value: 'Product', label: 'Product' },
    { value: 'Design', label: 'Design' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'Sales', label: 'Sales' },
    { value: 'Customer Success', label: 'Customer Success' },
    { value: 'Data', label: 'Data' },
    { value: 'Operations', label: 'Operations' },
  ];

  const handleFormSubmit = async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const addTag = (tag) => {
    if (tag && !watchedTags.includes(tag)) {
      setValue('tags', [...watchedTags, tag]);
    }
  };

  const removeTag = (tagToRemove) => {
    setValue('tags', watchedTags.filter(tag => tag !== tagToRemove));
  };

  const addRequirement = () => {
    setValue('requirements', [...(watchedRequirements || []), '']);
  };

  const removeRequirement = (index) => {
    const requirements = watchedRequirements || [];
    setValue('requirements', requirements.filter((_, i) => i !== index));
  };

  const addBenefit = () => {
    setValue('benefits', [...(watchedBenefits || []), '']);
  };

  const removeBenefit = (index) => {
    const benefits = watchedBenefits || [];
    setValue('benefits', benefits.filter((_, i) => i !== index));
  };

  const watchedRequirements = watch('requirements') || [];
  const watchedBenefits = watch('benefits') || [];

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="Job Title"
                {...register('title', { required: 'Title is required' })}
                error={errors.title?.message}
                required
                className="text-base"
              />
            </div>
            
            <Select
              label="Department"
              options={departments}
              {...register('department', { required: 'Department is required' })}
              error={errors.department?.message}
              required
            />
            
            <Select
              label="Job Type"
              options={jobTypes}
              {...register('type', { required: 'Job type is required' })}
              error={errors.type?.message}
              required
            />
            
            <Input
              label="Location"
              {...register('location', { required: 'Location is required' })}
              error={errors.location?.message}
              required
            />
            
            <Input
              label="Salary Range"
              placeholder="e.g., $80,000 - $100,000"
              {...register('salary')}
              error={errors.salary?.message}
            />
            
            <Select
              label="Status"
              options={[
                { value: JOB_STATUS.ACTIVE, label: 'Active' },
                { value: JOB_STATUS.ARCHIVED, label: 'Archived' },
              ]}
              {...register('status')}
              error={errors.status?.message}
            />
          </div>
        </div>

        {/* Description */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Description</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
              <span className="text-red-500 ml-1">*</span>
            </label>
            <textarea
              {...register('description', { required: 'Description is required' })}
              rows={5}
              className="block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Describe the role, responsibilities, and what makes it exciting..."
            />
            {errors.description && (
              <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
            )}
          </div>
        </div>

        {/* Requirements */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Requirements</h3>
          <div className="space-y-3">
            {watchedRequirements.map((requirement, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  {...register(`requirements.${index}`)}
                  className="flex-1 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter a requirement..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeRequirement(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addRequirement}
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
            >
              Add Requirement
            </Button>
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Benefits</h3>
          <div className="space-y-3">
            {watchedBenefits.map((benefit, index) => (
              <div key={index} className="flex items-center space-x-3">
                <input
                  type="text"
                  {...register(`benefits.${index}`)}
                  className="flex-1 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="Enter a benefit..."
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeBenefit(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/30"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addBenefit}
              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/30"
            >
              Add Benefit
            </Button>
          </div>
        </div>

        {/* Tags */}
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tags</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Enter a tag..."
                className="flex-1 block rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addTag(e.target.value.trim());
                    e.target.value = '';
                  }
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  const input = document.querySelector('input[placeholder="Enter a tag..."]');
                  if (input) {
                    addTag(input.value.trim());
                    input.value = '';
                  }
                }}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                Add Tag
              </Button>
            </div>
            
            {watchedTags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {watchedTags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="ml-2 inline-flex items-center justify-center w-5 h-5 rounded-full text-blue-400 hover:bg-blue-200 hover:text-blue-600 dark:hover:bg-blue-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="outline" onClick={onCancel} className="px-6">
            Cancel
          </Button>
          <Button 
            type="submit" 
            loading={isSubmitting}
            className="bg-[#1f1687] hover:bg-[#161357] text-white px-6"
          >
            {initialData ? 'Update Job' : 'Create Job'}
          </Button>
        </div>
      </form>
    </div>
  );
}
