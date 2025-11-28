import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import StatCard from '../../../../components/admin/shared/StatCard'
import { supabase } from '../../../../utils/supabaseClient'

const StackStoreAdminDashboard: React.FC = () => {
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalSellers: 0,
    pendingOrders: 0,
    completedOrders: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true)

        // Fetch all stats in parallel with error handling
        const fetchCount = async (table: string, filter?: { column: string; value: any }) => {
          try {
            let query = supabase.from(table).select('*', { count: 'exact', head: true })
            if (filter) {
              query = query.eq(filter.column, filter.value)
            }
            const { count, error } = await query
            if (error) {
              // Table might not exist, return 0
              if (error.code === 'PGRST116' || error.message.includes('does not exist')) {
                return 0
              }
              throw error
            }
            return count || 0
          } catch (err: any) {
            // If table doesn't exist, return 0
            if (err.code === 'PGRST116' || err.message?.includes('does not exist')) {
              return 0
            }
            console.warn(`Error fetching ${table}:`, err)
            return 0
          }
        }

        const [
          totalProducts,
          totalCategories,
          totalOrders,
          totalSellers,
          pendingOrders,
          completedOrders,
          activeProducts,
          inactiveProducts,
        ] = await Promise.all([
          fetchCount('products'),
          fetchCount('categories'),
          fetchCount('orders'),
          fetchCount('sellers'),
          fetchCount('orders', { column: 'status', value: 'pending' }),
          fetchCount('orders', { column: 'status', value: 'completed' }),
          fetchCount('products', { column: 'active', value: true }),
          fetchCount('products', { column: 'active', value: false }),
        ])

        setStats({
          totalProducts,
          totalCategories,
          totalOrders,
          totalSellers,
          pendingOrders,
          completedOrders,
          activeProducts,
          inactiveProducts,
        })
      } catch (error) {
        console.error('Error loading StackStore stats:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStats()
  }, [])

  if (loading) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 via-emerald-600 to-cyan-500 rounded-xl p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-3">
            <div className="text-5xl">🧩</div>
            <div>
              <h1 className="text-4xl font-bold mb-2">StackStore Admin Dashboard</h1>
              <p className="text-white/90 text-lg">Manage marketplace products, orders, and sellers</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          icon="📦"
          onClick={() => navigate('/adminstackt4s/products')}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon="🏷️"
          onClick={() => navigate('/adminstackt4s/categories')}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="🛒"
          onClick={() => navigate('/adminstackt4s/orders')}
          badges={[
            { label: 'Pending', value: stats.pendingOrders, color: 'yellow' },
            { label: 'Completed', value: stats.completedOrders, color: 'green' }
          ]}
        />
        <StatCard
          title="Sellers"
          value={stats.totalSellers}
          icon="👤"
          onClick={() => navigate('/adminstackt4s/sellers')}
        />
        <StatCard
          title="Active Products"
          value={stats.activeProducts}
          icon="✅"
        />
        <StatCard
          title="Inactive Products"
          value={stats.inactiveProducts}
          icon="⏸️"
        />
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => navigate('/adminstackt4s/products')}
            className="p-5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="font-bold text-lg mb-1">Add Product</div>
            <div className="text-sm opacity-90">Create new product listing</div>
          </button>
          <button
            onClick={() => navigate('/adminstackt4s/categories')}
            className="p-5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-white hover:from-emerald-600 hover:to-cyan-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <div className="font-bold text-lg mb-1">Manage Categories</div>
            <div className="text-sm opacity-90">Organize product categories</div>
          </button>
          <button
            onClick={() => navigate('/adminstackt4s/orders')}
            className="p-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:from-cyan-600 hover:to-blue-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">🛒</div>
            <div className="font-bold text-lg mb-1">View Orders</div>
            <div className="text-sm opacity-90">Monitor all orders</div>
          </button>
          <button
            onClick={() => navigate('/adminstackt4s/sellers')}
            className="p-5 rounded-xl bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">👤</div>
            <div className="font-bold text-lg mb-1">Manage Sellers</div>
            <div className="text-sm opacity-90">Approve and manage sellers</div>
          </button>
          <button
            onClick={() => navigate('/adminstackt4s/settings')}
            className="p-5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">Settings</div>
            <div className="text-sm opacity-90">Configure StackStore</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-emerald-50 dark:from-purple-900/20 dark:to-emerald-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-bold mb-2 text-gray-800 dark:text-white">📝 StackStore Management</h3>
        <p className="text-gray-700 dark:text-gray-300">
          Manage all aspects of the StackStore marketplace including products, categories, orders, and seller accounts.
          All changes are logged for audit purposes.
        </p>
      </div>
    </div>
  )
}

export default StackStoreAdminDashboard

