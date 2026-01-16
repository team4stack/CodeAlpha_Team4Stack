'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { coursesApi, usersApi } from '@/lib/api'

type ApplicationRow = {
  id: number
  name: string
  father_name: string
  phone: string
  email: string
  address: string | null
  course_name: string
  course_name_2: string | null
  message: string | null
  gender: string
  age: number
  image_attached: boolean
  viewed: boolean
  approved: boolean | null
  approved_1: boolean | null
  approved_2: boolean | null
  rejection_message: string | null
  rejection_message_1: string | null
  rejection_message_2: string | null
  created_at: string
  is_blocked?: boolean
}

const ApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectingCourseNumber, setRejectingCourseNumber] = useState<1 | 2 | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [blockingEmail, setBlockingEmail] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)

  const load = async () => {
    try {
      setError(null)
      
      // Get all admission forms
      const result = await coursesApi.getAdmissionForms()
      
      if (result.error) {
        setError(result.error)
        setRows([])
        setLoading(false)
        return
      }
      
      // Filter based on status
      let filteredData = result.data || []
      if (filter === 'pending') {
        filteredData = filteredData.filter((app: any) => {
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          if (hasNewApprovals) {
            return !(app.approved_1 === true || app.approved_2 === true) && 
                   !(app.approved_1 === false && app.approved_2 === false)
          }
          return app.approved === null || app.approved === false
        })
      } else if (filter === 'approved') {
        filteredData = filteredData.filter((app: any) => {
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          if (hasNewApprovals) {
            return app.approved_1 === true || app.approved_2 === true
          }
          return app.approved === true
        })
      } else if (filter === 'rejected') {
        filteredData = filteredData.filter((app: any) => {
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          if (hasNewApprovals) {
            return (app.approved_1 === false || app.approved_2 === false) && 
                   !(app.approved_1 === true || app.approved_2 === true)
          }
          return app.approved === false
        })
      }
      
      // Sort by created_at descending
      filteredData.sort((a: any, b: any) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      
      // Check blocked status for each application and calculate overall approved status
      const applicationsWithBlockStatus = await Promise.all(
        (filteredData as ApplicationRow[]).map(async (app) => {
          const userResult = await usersApi.getUserByEmail(app.email.toLowerCase().trim())
          
          // Calculate overall approved status based on individual course approvals
          // Backward compatibility: if old approved field exists and new fields don't, use old field
          const hasNewApprovals = app.approved_1 !== undefined || app.approved_2 !== undefined
          
          let hasApproved: boolean = false
          let allRejected: boolean = false
          
          if (hasNewApprovals) {
            // New system: check individual course approvals
            hasApproved = Boolean(app.approved_1 === true || app.approved_2 === true)
            allRejected = Boolean(
              (app.course_name && app.approved_1 === false) &&
              (!app.course_name_2 || app.approved_2 === false)
            )
          } else {
            // Old system: use the approved field directly
            hasApproved = app.approved === true
            allRejected = app.approved === false
          }
          
          return {
            ...app,
            is_blocked: userResult?.data?.is_blocked || false,
            approved: hasApproved ? true : (allRejected ? false : null) // null means pending
          }
        })
      )
      
      setRows(applicationsWithBlockStatus)
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error loading applications:', err)
      }
      const errorMsg = err.message || 'Failed to load applications'
      setError(errorMsg)
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // Note: Real-time subscriptions removed - using API polling instead
    // You can add polling if needed: setInterval(load, 5000)
  }, [filter])

  const approveApplication = async (id: number, email: string, courseNumber: 1 | 2) => {
    try {
      const updateField = `approved_${courseNumber}` as 'approved_1' | 'approved_2'
      const rejectionField = `rejection_message_${courseNumber}` as 'rejection_message_1' | 'rejection_message_2'
      
      // Update admission form - approve specific course
      const result = await coursesApi.updateAdmissionForm(id, {
        [updateField]: true,
        [rejectionField]: null,
        viewed: true
      })
      
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }

      // Check if user exists, if not create one
      const userResult = await usersApi.getUserByEmail(email.toLowerCase().trim())

      if (!userResult?.data) {
        // Create user account for student portal access
        const createResult = await usersApi.upsertUser({
          email: email.toLowerCase().trim(),
          username: email.split('@')[0].toLowerCase(),
          is_blocked: false
        })

        if (createResult.error) {
          console.error('Error creating user:', createResult.error)
          // Don't fail the approval if user creation fails - just log it
          toast.error(`Application approved, but failed to create user account: ${createResult.error}`)
        }
      } else {
        // Ensure user is not blocked
        const updateResult = await usersApi.updateUser(userResult.data.id, { is_blocked: false })
        if (updateResult.error) {
          console.error('Error updating user:', updateResult.error)
        }
      }
      
      // Update local state
      setRows(rows.map(r => {
        if (r.id === id) {
          const updated = { ...r, [updateField]: true, [rejectionField]: null, viewed: true } as ApplicationRow
          // Set overall approved to true if at least one course is approved
          updated.approved = updated.approved_1 === true || updated.approved_2 === true
          return updated
        }
        return r
      }))
      
      // Update selected application if it's the same
      if (selectedApplication && selectedApplication.id === id) {
        const updated = { ...selectedApplication, [updateField]: true, [rejectionField]: null, viewed: true } as ApplicationRow
        updated.approved = updated.approved_1 === true || updated.approved_2 === true
        setSelectedApplication(updated)
      }
      
      toast.success(`Course ${courseNumber} approved successfully!`)
      await load() // Reload to get latest data
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error approving application:', err)
      }
      const errorMsg = err.message || 'Failed to approve application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openRejectModal = (id: number, courseNumber: 1 | 2) => {
    setRejectingId(id)
    setRejectingCourseNumber(courseNumber)
    setRejectionMessage('')
    setShowRejectModal(true)
  }

  const rejectApplication = async () => {
    if (!rejectingId || !rejectingCourseNumber) return
    if (!rejectionMessage.trim()) {
      const errorMsg = 'Please provide a rejection message'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    try {
      const updateField = `approved_${rejectingCourseNumber}` as 'approved_1' | 'approved_2'
      const rejectionField = `rejection_message_${rejectingCourseNumber}` as 'rejection_message_1' | 'rejection_message_2'
      
      const result = await coursesApi.updateAdmissionForm(rejectingId, {
        [updateField]: false,
        [rejectionField]: rejectionMessage.trim(),
        viewed: true
      })
      
      if (result.error) {
        setError(result.error)
        toast.error(result.error)
        return
      }
      
      // Update local state
      setRows(rows.map(r => {
        if (r.id === rejectingId) {
          const updated = { ...r, [updateField]: false, [rejectionField]: rejectionMessage.trim(), viewed: true } as ApplicationRow
          // Set overall approved based on remaining approved courses
          updated.approved = updated.approved_1 === true || updated.approved_2 === true
          return updated
        }
        return r
      }))
      
      // Update selected application if it's the same
      if (selectedApplication && selectedApplication.id === rejectingId) {
        const updated = { ...selectedApplication, [updateField]: false, [rejectionField]: rejectionMessage.trim(), viewed: true } as ApplicationRow
        updated.approved = updated.approved_1 === true || updated.approved_2 === true
        setSelectedApplication(updated)
      }
      
      setShowRejectModal(false)
      setRejectingId(null)
      setRejectingCourseNumber(null)
      setRejectionMessage('')
      toast.success(`Course ${rejectingCourseNumber} rejected successfully!`)
      await load() // Reload to get latest data
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error rejecting application:', err)
      }
      const errorMsg = err.message || 'Failed to reject application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const markAsViewed = async (id: number) => {
    try {
      const result = await coursesApi.updateAdmissionForm(id, { viewed: true })
      
      if (result.error) {
        throw new Error(result.error)
      }
      
      setRows(rows.map(r => r.id === id ? { ...r, viewed: true } : r))
      toast.success('Application marked as viewed!')
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error updating viewed status:', err)
      }
      const errorMsg = err.message || 'Failed to update viewed status'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openBlockModal = (email: string) => {
    setBlockingEmail(email)
    setShowBlockModal(true)
  }

  const blockUser = async () => {
    if (!blockingEmail) return
    
    try {
      // Check if user exists, if not create one with blocked status via API
      const existingUserResult = await usersApi.getUserByEmail(blockingEmail.toLowerCase().trim())

      if (!existingUserResult.data) {
        // Create user with blocked status via API
        const createResult = await usersApi.upsertUser({
          email: blockingEmail.toLowerCase().trim(),
          username: blockingEmail.split('@')[0].toLowerCase(),
          is_blocked: true,
          created_at: new Date().toISOString()
        })

        if (createResult.error) {
          // Ignore duplicate key error (user already exists)
          if (!createResult.error.includes('duplicate') && !createResult.error.includes('23505')) {
            throw new Error(createResult.error)
          }
        }
      } else {
        // Update existing user to blocked via API
        const updateResult = await usersApi.updateUser(existingUserResult.data.id, { is_blocked: true })
        
        if (updateResult.error) {
          throw new Error(updateResult.error)
        }
      }

      // Update admission form status with block message via API
      const application = rows.find(r => r.email.toLowerCase().trim() === blockingEmail.toLowerCase().trim())
      if (application) {
        const updateResult = await coursesApi.updateAdmissionForm(application.id, { 
          approved: false, 
          viewed: true,
          rejection_message: 'Your account has been blocked by the administrator. Please contact support for more information.'
        })
        
        if (updateResult.error) {
          throw new Error(updateResult.error)
        }
      }
      
      setError(null)
      setShowBlockModal(false)
      setBlockingEmail(null)
      setSelectedApplication(null)
      
      // Reload data to get fresh blocked status
      await load()
      
      toast.success('User has been blocked successfully!')
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error blocking user:', err)
      }
      const errorMsg = err.message || 'Failed to block user'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openDeleteModal = (id: number) => {
    setDeletingId(id)
    setShowDeleteModal(true)
  }

  const deleteApplication = async () => {
    if (!deletingId) return

    try {
      const result = await coursesApi.deleteAdmissionForm(deletingId)
      
      if (result.error) {
        console.error('Delete error:', result.error)
        throw new Error(result.error)
      }
      
      setRows(rows.filter(r => r.id !== deletingId))
      setShowDeleteModal(false)
      setDeletingId(null)
      setSelectedApplication(null)
      toast.success('Application deleted successfully!')
    } catch (err: any) {
      console.error('Error deleting application:', {
        error: err,
        message: err?.message,
        details: err?.details,
        hint: err?.hint,
        code: err?.code,
        fullError: JSON.stringify(err, null, 2)
      })
      
      // Better error message handling
      let errorMsg = 'Failed to delete application'
      if (err?.message) {
        errorMsg = err.message
      } else if (err?.details) {
        errorMsg = err.details
      } else if (err?.hint) {
        errorMsg = err.hint
      } else if (typeof err === 'string') {
        errorMsg = err
      }
      
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  const pendingCount = rows.filter(r => r.approved === null || r.approved === false).length
  const approvedCount = rows.filter(r => r.approved === true).length

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
          Course Applications
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            All ({rows.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-yellow-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter('approved')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
            }`}
          >
            Approved ({approvedCount})
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No applications found.</p>
          <p className="text-sm">Applications will appear here when users submit them.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Table Header */}
          <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
            <div className="col-span-2">Name</div>
            <div className="col-span-2">Course</div>
            <div className="col-span-2">Contact</div>
            <div className="col-span-2">Status</div>
            <div className="col-span-2">Date</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {rows.map((application) => {
              return (
                <div key={application.id}>
                  {/* Compact Row View */}
                  <div
                    className={`grid grid-cols-12 gap-4 px-4 py-3 items-center hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors ${
                      application.is_blocked
                        ? 'bg-orange-50/30 dark:bg-orange-900/10'
                        : application.approved === true
                        ? 'bg-green-50/30 dark:bg-green-900/10'
                        : application.approved === false
                        ? 'bg-red-50/30 dark:bg-red-900/10'
                        : !application.viewed
                        ? 'bg-blue-50/30 dark:bg-blue-900/10'
                        : ''
                    }`}
                  >
                    <div className="col-span-2">
                      <div className="font-semibold text-gray-900 dark:text-white truncate">
                        {application.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.father_name}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        <div className="truncate">{application.course_name}</div>
                        {application.course_name_2 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            + {application.course_name_2}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
                        {application.phone}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {application.email}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        {application.is_blocked ? (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-orange-600 text-white">
                            🚫 Blocked
                          </span>
                        ) : (() => {
                          // Check individual course approvals
                          const hasApproved = application.approved_1 === true || application.approved_2 === true;
                          const hasRejected = application.approved_1 === false || application.approved_2 === false;
                          const hasPending = 
                            (application.course_name && application.approved_1 === null) ||
                            (application.course_name_2 && application.approved_2 === null);
                          
                          if (hasApproved && hasPending) {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">Partially Approved</span>;
                          } else if (hasApproved) {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">Approved</span>;
                          } else if (hasRejected && hasPending) {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white animate-pulse">Pending</span>;
                          } else if (hasRejected) {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">Rejected</span>;
                          } else if (!application.viewed) {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white animate-pulse">Pending</span>;
                          } else {
                            return <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500 text-white">Pending</span>;
                          }
                        })()}
                        {application.image_attached && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-blue-500 text-white">
                            📎
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="col-span-2">
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {new Date(application.created_at).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-500">
                        {new Date(application.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => setSelectedApplication(application)}
                        className="px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                      >
                        ▶ View
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {selectedApplication && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Application Details</h2>
              <button
                onClick={() => setSelectedApplication(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Name</span>
                  <p className="text-base text-gray-900 dark:text-white font-medium">{selectedApplication.name}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Father Name</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.father_name}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Phone</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.phone}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Email</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.email}</p>
                </div>
                {/* Courses Section - Show all courses with individual approval status */}
                <div className="md:col-span-2">
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2 block">Courses</span>
                  <div className="space-y-3">
                    {/* Course 1 - Required */}
                    {selectedApplication.course_name && (
                      <div className={`p-3 rounded-lg border-2 ${
                        selectedApplication.approved_1 === true 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                          : selectedApplication.approved_1 === false
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Course 1 (Required)</span>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedApplication.course_name}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedApplication.approved_1 === true ? (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">✓ Approved</span>
                            ) : selectedApplication.approved_1 === false ? (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">✗ Rejected</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white">⏳ Pending</span>
                            )}
                          </div>
                        </div>
                        {selectedApplication.rejection_message_1 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {selectedApplication.rejection_message_1}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {selectedApplication.approved_1 !== true && (
                            <button
                              onClick={() => approveApplication(selectedApplication.id, selectedApplication.email, 1)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✓ Approve Course 1
                            </button>
                          )}
                          {selectedApplication.approved_1 !== false && (
                            <button
                              onClick={() => {
                                setSelectedApplication(null)
                                openRejectModal(selectedApplication.id, 1)
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✗ Reject Course 1
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Course 2 - Optional */}
                    {selectedApplication.course_name_2 && (
                      <div className={`p-3 rounded-lg border-2 ${
                        selectedApplication.approved_2 === true 
                          ? 'bg-green-50 dark:bg-green-900/20 border-green-500' 
                          : selectedApplication.approved_2 === false
                          ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                          : 'bg-gray-50 dark:bg-gray-700/50 border-gray-300 dark:border-gray-600'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">Course 2 (Optional)</span>
                            <p className="text-base font-semibold text-gray-900 dark:text-white mt-1">{selectedApplication.course_name_2}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {selectedApplication.approved_2 === true ? (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">✓ Approved</span>
                            ) : selectedApplication.approved_2 === false ? (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">✗ Rejected</span>
                            ) : (
                              <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white">⏳ Pending</span>
                            )}
                          </div>
                        </div>
                        {selectedApplication.rejection_message_2 && (
                          <p className="text-xs text-red-600 dark:text-red-400 mt-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            {selectedApplication.rejection_message_2}
                          </p>
                        )}
                        <div className="flex gap-2 mt-2">
                          {selectedApplication.approved_2 !== true && (
                            <button
                              onClick={() => approveApplication(selectedApplication.id, selectedApplication.email, 2)}
                              className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✓ Approve Course 2
                            </button>
                          )}
                          {selectedApplication.approved_2 !== false && (
                            <button
                              onClick={() => {
                                setSelectedApplication(null)
                                openRejectModal(selectedApplication.id, 2)
                              }}
                              className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-xs"
                            >
                              ✗ Reject Course 2
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gender</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.gender}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Age</span>
                  <p className="text-base text-gray-900 dark:text-white">{selectedApplication.age}</p>
                </div>
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Submitted</span>
                  <p className="text-base text-gray-900 dark:text-white">
                    {new Date(selectedApplication.created_at).toLocaleString()}
                  </p>
                </div>
                {selectedApplication.address && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Address</span>
                    <p className="text-base text-gray-900 dark:text-white">{selectedApplication.address}</p>
                  </div>
                )}
                {selectedApplication.message && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Message</span>
                    <p className="text-base text-gray-900 dark:text-white">{selectedApplication.message}</p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {!selectedApplication.viewed && (
                  <button
                    onClick={() => {
                      markAsViewed(selectedApplication.id)
                      setSelectedApplication({ ...selectedApplication, viewed: true })
                    }}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    Mark Viewed
                  </button>
                )}
                <button
                  onClick={() => {
                    setSelectedApplication(null)
                    openDeleteModal(selectedApplication.id)
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal with Message Input */}
      {showRejectModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">⚠️</span>
                Reject Course {rejectingCourseNumber}
              </h3>
            </div>
            <div className="p-6">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Please provide a reason for rejecting this course. This message will be shown to the applicant.
              </p>
              <textarea
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full h-32 px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all"
              />
              <div className="flex gap-3 mt-6">
                <button
                  onClick={rejectApplication}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Reject Application
                </button>
                <button
                  onClick={() => {
                    setShowRejectModal(false)
                    setRejectingId(null)
                    setRejectingCourseNumber(null)
                    setRejectionMessage('')
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block User Confirmation Modal */}
      {showBlockModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🚫</span>
                Block User
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Are you sure?</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action will block the user from accessing the student portal</p>
                  </div>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4 mt-4">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>Email:</strong> {blockingEmail}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    The user will not be able to:
                  </p>
                  <ul className="text-sm text-gray-600 dark:text-gray-400 mt-1 ml-4 list-disc">
                    <li>Access the student portal</li>
                    <li>View enrolled courses</li>
                    <li>Track their progress</li>
                  </ul>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={blockUser}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Yes, Block User
                </button>
                <button
                  onClick={() => {
                    setShowBlockModal(false)
                    setBlockingEmail(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Application Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-md w-full border border-gray-200 dark:border-gray-700 overflow-hidden animate-scale-in">
            <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <span className="text-2xl">🗑️</span>
                Delete Application
              </h3>
            </div>
            <div className="p-6">
              <div className="mb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                    <span className="text-2xl">⚠️</span>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">Are you absolutely sure?</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This action cannot be undone</p>
                  </div>
                </div>
                {deletingId && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mt-4">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong>Application from:</strong> {rows.find(r => r.id === deletingId)?.name || 'Unknown'}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Email:</strong> {rows.find(r => r.id === deletingId)?.email || 'Unknown'}
                    </p>
                    <p className="text-sm text-red-600 dark:text-red-400 mt-3 font-semibold">
                      ⚠️ All application data will be permanently deleted
                    </p>
                  </div>
                )}
              </div>
              <div className="flex gap-3 mt-6">
                <button
                  onClick={deleteApplication}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowDeleteModal(false)
                    setDeletingId(null)
                  }}
                  className="flex-1 px-4 py-2.5 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
