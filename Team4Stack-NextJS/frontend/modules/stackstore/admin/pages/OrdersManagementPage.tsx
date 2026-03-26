'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { stackstoreApi, usersApi } from '@/lib/api'
import { useTheme } from '@/contexts/ThemeContext'

type Order = {
  id: string
  user_id: string
  product_id?: string
  status: string
  total_amount?: number
  payment_status?: string
  shipping_address?: string
  created_at: string
  updated_at?: string
}

type User = {
  id: string
  email: string | null
  name: string | null
}

type Product = {
  id: string
  name: string
}

const OrdersManagementPage: React.FC = () => {
  const { isDarkMode } = useTheme()
  const [orders, setOrders] = useState<Order[]>([])
  const [users, setUsers] = useState<Record<string, User>>({})
  const [products, setProducts] = useState<Record<string, Product>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterPayment, setFilterPayment] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalOrders, setTotalOrders] = useState(0)
  const ordersPerPage = 20

  const orderStatuses = ['pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded']
  const paymentStatuses = ['pending', 'paid', 'failed', 'refunded']

  const loadData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Load orders
      try {
        const result = await stackstoreApi.getOrders({
          status: filterStatus !== 'all' ? filterStatus : undefined,
          payment_status: filterPayment !== 'all' ? filterPayment : undefined
        })

        if (result.error) {
          setError(result.error)
          setOrders([])
          setLoading(false)
          return
        }

        // Filter by search query on client side
        let filteredOrders = Array.isArray(result.data) ? result.data : []
        if (searchQuery.trim()) {
          filteredOrders = filteredOrders.filter((o: Order) => 
            o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.shipping_address?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        }

        // Sort and paginate
        filteredOrders.sort((a: Order, b: Order) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setTotalOrders(filteredOrders.length)
        const paginatedOrders = filteredOrders.slice(
          (currentPage - 1) * ordersPerPage,
          currentPage * ordersPerPage
        )
        setOrders(paginatedOrders)

        // Load users
        const userIds = [...new Set(paginatedOrders.map((o: Order) => o.user_id).filter(Boolean) || [])]
        if (userIds.length > 0) {
          const usersMap: Record<string, User> = {}
          await Promise.all(
            userIds.map(async (userId) => {
              const userResult = await usersApi.getUserById(userId)
              if (userResult?.data) {
                const userData = userResult.data as User
                usersMap[userId] = {
                  id: userData.id,
                  email: userData.email || null,
                  name: userData.name || null
                }
              }
            })
          )
          setUsers(usersMap)
        }

        // Load products
        const productIds = [...new Set(paginatedOrders.map((o: Order) => o.product_id).filter((id): id is string => Boolean(id)) || [])]
        if (productIds.length > 0) {
          const productsMap: Record<string, Product> = {}
          await Promise.all(
            productIds.map(async (productId) => {
              const productResult = await stackstoreApi.getProductById(productId)
              if (productResult?.data) {
                const productData = productResult.data as Product
                productsMap[productId] = {
                  id: productData.id,
                  name: productData.name
                }
              }
            })
          )
          setProducts(productsMap)
        }
      } catch (err: any) {
        if (err.code === 'PGRST116' || err.message?.includes('does not exist')) {
          setOrders([])
          return
        }
        throw err
      }
    } catch (err: any) {
      setError('Failed to load orders: ' + err.message)
    } finally {
      setLoading(false)
    }
  }, [searchQuery, filterStatus, filterPayment, currentPage])

  useEffect(() => {
    loadData()
    // Note: Real-time subscriptions removed - using API calls instead
  }, [loadData])

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      setError(null)
      setSuccess(null)

      const result = await stackstoreApi.updateOrder(orderId, {
        status: newStatus
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess('Order status updated successfully!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update order status: ' + err.message)
    }
  }

  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: string) => {
    try {
      setError(null)
      setSuccess(null)

      const result = await stackstoreApi.updateOrder(orderId, {
        payment_status: newPaymentStatus
      })

      if (result.error) {
        setError(result.error)
        return
      }

      setSuccess('Payment status updated successfully!')
      loadData()
      setTimeout(() => setSuccess(null), 3000)
    } catch (err: any) {
      setError('Failed to update payment status: ' + err.message)
    }
  }

  const getUserInfo = (userId: string) => {
    const user = users[userId]
    return user ? {
      name: user.name || 'Unknown',
      email: user.email || 'No email'
    } : { name: 'Unknown User', email: 'No email' }
  }

  const getProductName = (productId: string | null | undefined) => {
    if (!productId) return 'N/A'
    return products[productId]?.name || 'Unknown Product'
  }

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase()
    if (statusLower === 'completed' || statusLower === 'delivered') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    } else if (statusLower === 'pending' || statusLower === 'processing') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    } else if (statusLower === 'cancelled' || statusLower === 'refunded') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    } else if (statusLower === 'shipped') {
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const getPaymentStatusColor = (status: string | null | undefined) => {
    if (!status) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
    const statusLower = status.toLowerCase()
    if (statusLower === 'paid') {
      return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
    } else if (statusLower === 'pending') {
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
    } else if (statusLower === 'failed' || statusLower === 'refunded') {
      return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    }
    return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
  }

  const totalPages = Math.ceil(totalOrders / ordersPerPage)

  if (loading && orders.length === 0) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-5 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <h1 className="text-2xl font-bold mb-1">🛒 Orders Management</h1>
          <p className="text-white/90 text-sm">View and manage all marketplace orders</p>
        </div>
      </div>

      {/* Messages */}
      {error && (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl p-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 rounded-xl p-4">
          {success}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search by order ID or shipping address..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Status</option>
            {orderStatuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>

          {/* Payment Status Filter */}
          <select
            value={filterPayment}
            onChange={(e) => {
              setFilterPayment(e.target.value)
              setCurrentPage(1)
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <option value="all">All Payment Status</option>
            {paymentStatuses.map((status) => (
              <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Customer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Product
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Payment
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    {loading ? 'Loading...' : 'No orders found. Create the orders table in Supabase to start managing orders.'}
                  </td>
                </tr>
              ) : (
                orders.map((order) => {
                  const userInfo = getUserInfo(order.user_id)
                  return (
                    <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {order.id.slice(0, 8)}...
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{userInfo.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{userInfo.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {getProductName(order.product_id)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {order.total_amount ? `$${order.total_amount.toFixed(2)}` : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-semibold border-0 ${getStatusColor(order.status)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          {orderStatuses.map((status) => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={order.payment_status || 'pending'}
                          onChange={(e) => handlePaymentStatusUpdate(order.id, e.target.value)}
                          className={`px-2 py-1 rounded text-xs font-semibold border-0 ${getPaymentStatusColor(order.payment_status)} focus:outline-none focus:ring-2 focus:ring-purple-500`}
                        >
                          {paymentStatuses.map((status) => (
                            <option key={status} value={status}>{status.charAt(0).toUpperCase() + status.slice(1)}</option>
                          ))}
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => {
                              // View order details (can be expanded)
                              alert(`Order Details:\nID: ${order.id}\nCustomer: ${userInfo.name}\nStatus: ${order.status}`)
                            }}
                            className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-xs"
                          >
                            View
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(currentPage - 1) * ordersPerPage + 1} to {Math.min(currentPage * ordersPerPage, totalOrders)} of {totalOrders} orders
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default OrdersManagementPage

