'use client'

import React, { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { supabase } from '@/lib/supabase/client'

type ApplicationRow = {
  id: number
  name: string
  father_name: string
  phone: string
  email: string
  address: string | null
  course_name: string
  message: string | null
  gender: string
  age: number
  image_attached: boolean
  viewed: boolean
  approved: boolean | null
  rejection_message: string | null
  created_at: string
}

const ApplicationsPage: React.FC = () => {
  const [rows, setRows] = useState<ApplicationRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all')
  const [selectedApplication, setSelectedApplication] = useState<ApplicationRow | null>(null)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectingId, setRejectingId] = useState<number | null>(null)
  const [rejectionMessage, setRejectionMessage] = useState('')

  const load = async () => {
    try {
      setError(null)
      let query = supabase
        .from('admission_form')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (filter === 'pending') {
        query = query.or('approved.is.null,approved.eq.false')
      } else if (filter === 'approved') {
        query = query.eq('approved', true)
      } else if (filter === 'rejected') {
        query = query.eq('approved', false).not('approved', 'is', null)
      }
      
      const { data, error: err } = await query
      
      if (err) throw err
      setRows((data as ApplicationRow[]) || [])
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

    // Real-time subscription
    const channel = supabase
      .channel('applications_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admission_form' }, () => {
        load()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [filter])

  const approveApplication = async (id: number, email: string) => {
    try {
      // Update admission form
      const { error: err } = await supabase
        .from('admission_form')
        .update({ approved: true, viewed: true, rejection_message: null })
        .eq('id', id)
      
      if (err) throw err

      // Check if user exists, if not create one
      const { data: existingUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email.toLowerCase().trim())
        .maybeSingle()

      if (!existingUser) {
        // Create user account for student portal access
        const { error: userErr } = await supabase
          .from('users')
          .insert([
            {
              email: email.toLowerCase().trim(),
              username: email.split('@')[0].toLowerCase(),
              is_blocked: false,
              created_at: new Date().toISOString()
            }
          ])

        if (userErr && userErr.code !== '23505') { // Ignore duplicate key error
          console.error('Error creating user:', userErr)
        }
      } else {
        // Ensure user is not blocked
        await supabase
          .from('users')
          .update({ is_blocked: false })
          .eq('email', email.toLowerCase().trim())
      }
      
      setRows(rows.map(r => r.id === id ? { ...r, approved: true, viewed: true, rejection_message: null } : r))
      setSelectedApplication(null)
      toast.success('Application approved successfully!')
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error approving application:', err)
      }
      const errorMsg = err.message || 'Failed to approve application'
      setError(errorMsg)
      toast.error(errorMsg)
    }
  }

  const openRejectModal = (id: number) => {
    setRejectingId(id)
    setRejectionMessage('')
    setShowRejectModal(true)
  }

  const rejectApplication = async () => {
    if (!rejectingId) return
    if (!rejectionMessage.trim()) {
      const errorMsg = 'Please provide a rejection message'
      setError(errorMsg)
      toast.error(errorMsg)
      return
    }
    
    try {
      const { error: err } = await supabase
        .from('admission_form')
        .update({ 
          approved: false, 
          viewed: true,
          rejection_message: rejectionMessage.trim()
        })
        .eq('id', rejectingId)
      
      if (err) throw err
      
      setRows(rows.map(r => r.id === rejectingId ? { ...r, approved: false, viewed: true, rejection_message: rejectionMessage.trim() } : r))
      setShowRejectModal(false)
      setRejectingId(null)
      setRejectionMessage('')
      setSelectedApplication(null)
      toast.success('Application rejected successfully!')
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
      const { error: err } = await supabase
        .from('admission_form')
        .update({ viewed: true })
        .eq('id', id)
      
      if (err) throw err
      
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

  const blockUser = async (email: string) => {
    if (!window.confirm('Are you sure you want to block this user? They will not be able to access the student portal.')) return
    
    try {
      const { error: err } = await supabase
        .from('users')
        .update({ is_blocked: true })
        .eq('email', email.toLowerCase().trim())
      
      if (err) throw err
      
      setError(null)
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

  const deleteApplication = async (id: number) => {
    const application = rows.find(r => r.id === id)
    const confirmMessage = application 
      ? `Are you sure you want to delete the application from ${application.name}? This action cannot be undone.`
      : 'Are you sure you want to delete this application? This action cannot be undone.'
    
    if (!window.confirm(confirmMessage)) return
    
    try {
      const { error: err } = await supabase
        .from('admission_form')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      setRows(rows.filter(r => r.id !== id))
      toast.success('Application deleted successfully!')
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting application:', err)
      }
      const errorMsg = err.message || 'Failed to delete application'
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
                      application.approved === true
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
                      <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {application.course_name}
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
                        {application.approved === true && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-green-500 text-white">
                            Approved
                          </span>
                        )}
                        {application.approved === false && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-red-500 text-white">
                            Rejected
                          </span>
                        )}
                        {application.approved === null && !application.viewed && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-yellow-500 text-white animate-pulse">
                            Pending
                          </span>
                        )}
                        {application.approved === null && application.viewed && (
                          <span className="px-2 py-1 rounded text-xs font-bold bg-gray-500 text-white">
                            Pending
                          </span>
                        )}
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
                <div>
                  <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Course</span>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{selectedApplication.course_name}</p>
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
                {selectedApplication.rejection_message && (
                  <div className="md:col-span-2">
                    <span className="text-sm font-semibold text-red-600 dark:text-red-400">Rejection Message</span>
                    <p className="text-base text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/20 p-3 rounded-lg mt-1">
                      {selectedApplication.rejection_message}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                {selectedApplication.approved !== true && (
                  <button
                    onClick={() => {
                      approveApplication(selectedApplication.id, selectedApplication.email)
                    }}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    ✓ Approve
                  </button>
                )}
                {selectedApplication.approved !== false && (
                  <button
                    onClick={() => {
                      setSelectedApplication(null)
                      openRejectModal(selectedApplication.id)
                    }}
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors text-sm"
                  >
                    ✗ Reject
                  </button>
                )}
                <button
                  onClick={() => {
                    blockUser(selectedApplication.email)
                  }}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors text-sm"
                >
                  🚫 Block
                </button>
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
                    deleteApplication(selectedApplication.id)
                    setSelectedApplication(null)
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
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Reject Application</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Please provide a reason for rejection. This message will be shown to the applicant.
            </p>
            <textarea
              value={rejectionMessage}
              onChange={(e) => setRejectionMessage(e.target.value)}
              placeholder="Enter rejection reason..."
              className="w-full h-32 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-red-500"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={rejectApplication}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  setShowRejectModal(false)
                  setRejectingId(null)
                  setRejectionMessage('')
                }}
                className="flex-1 px-4 py-2 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 text-gray-700 dark:text-gray-300 rounded-lg font-semibold transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ApplicationsPage
