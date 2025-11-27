import React, { useEffect, useState } from 'react'
import { supabase } from '../../../../utils/supabaseClient'

type FormRow = {
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
  created_at: string
}

const FormsPage: React.FC = () => {
  const [rows, setRows] = useState<FormRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setError(null)
      const { data, error: err } = await supabase
        .from('admission_form')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (err) throw err
      setRows((data as FormRow[]) || [])
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Error loading forms:', err)
      }
      setError(err.message || 'Failed to load forms')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()

    // Real-time subscription
    const channel = supabase
      .channel('forms_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admission_form' }, () => {
        load()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const markAsViewed = async (id: number) => {
    try {
      const { error: err } = await supabase
        .from('admission_form')
        .update({ viewed: true })
        .eq('id', id)
      
      if (err) throw err
      
      setRows(rows.map(r => r.id === id ? { ...r, viewed: true } : r))
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Error updating viewed status:', err)
      }
      setError(err.message || 'Failed to update viewed status')
    }
  }

  const deleteForm = async (id: number) => {
    if (!window.confirm('Delete this form submission?')) return
    
    try {
      const { error: err } = await supabase
        .from('admission_form')
        .delete()
        .eq('id', id)
      
      if (err) throw err
      setRows(rows.filter(r => r.id !== id))
    } catch (err: any) {
      if (import.meta.env.DEV) {
        console.error('Error deleting form:', err)
      }
      setError(err.message || 'Failed to delete form')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
        Admission Form
      </h1>

      {error && (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
          {error}
        </div>
      )}

      {rows.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-2">No admission forms submitted yet.</p>
          <p className="text-sm">Admission forms will appear here when users submit them via the admission form.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {rows.map((form) => (
            <div
              key={form.id}
              className={`border rounded-lg p-6 ${
                form.viewed
                  ? 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                  : 'border-blue-300 dark:border-blue-600 bg-blue-50 dark:bg-blue-900/20'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span
                      className={`font-bold text-lg ${
                        form.viewed
                          ? 'text-gray-900 dark:text-white'
                          : 'text-blue-900 dark:text-blue-100'
                      }`}
                    >
                      {form.name}
                    </span>
                    {!form.viewed && (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500 text-white animate-pulse">
                        New
                      </span>
                    )}
                    {form.viewed && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
                        Viewed
                      </span>
                    )}
                    {form.image_attached && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                        📷 Image Attached
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Email:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{form.email}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Phone:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{form.phone}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Father Name:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{form.father_name}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Age:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{form.age}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Gender:</span>
                      <span className="ml-2 text-gray-900 dark:text-white">{form.gender}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Course:</span>
                      <span className="ml-2 text-gray-900 dark:text-white font-medium">{form.course_name}</span>
                    </div>
                    {form.address && (
                      <div className="text-sm md:col-span-2">
                        <span className="font-semibold text-gray-700 dark:text-gray-300">Address:</span>
                        <span className="ml-2 text-gray-900 dark:text-white">{form.address}</span>
                      </div>
                    )}
                  </div>

                  {form.message && (
                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-3">
                      <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Message:
                      </div>
                      <div className="text-gray-900 dark:text-white whitespace-pre-wrap break-words">
                        {form.message}
                      </div>
                    </div>
                  )}

                  {form.image_attached && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Note:</strong> Payment screenshot was attached with this form. The image is stored locally on the user's device and was included in the PDF they downloaded.
                      </p>
                    </div>
                  )}

                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                    Submitted: {new Date(form.created_at).toLocaleString()}
                  </div>
                </div>

                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!form.viewed && (
                    <button
                      onClick={() => markAsViewed(form.id)}
                      className="px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                    >
                      View
                    </button>
                  )}
                  {form.viewed && (
                    <div className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium text-center">
                      Viewed
                    </div>
                  )}
                  <button
                    onClick={() => deleteForm(form.id)}
                    className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium transition-colors shadow-md hover:shadow-lg"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FormsPage

