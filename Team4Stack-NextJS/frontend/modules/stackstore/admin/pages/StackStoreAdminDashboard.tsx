'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import StatCard from '@/components/admin/shared/StatCard'
import { stackstoreApi } from '@/lib/api'

const StackStoreAdminDashboard: React.FC = () => {
  const router = useRouter()
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

        // Fetch all stats via API
        const [productsResult, categoriesResult, ordersResult] = await Promise.all([
          stackstoreApi.getProducts().catch(() => ({ data: [] as any[] })),
          stackstoreApi.getCategories().catch(() => ({ data: [] as any[] })),
          stackstoreApi.getOrders().catch(() => ({ data: [] as any[] }))
        ])

        const allProducts = Array.isArray(productsResult.data) ? productsResult.data : []
        const allCategories = Array.isArray(categoriesResult.data) ? categoriesResult.data : []
        const allOrders = Array.isArray(ordersResult.data) ? ordersResult.data : []

        const totalProducts = allProducts.length
        const totalCategories = allCategories.length
        const totalOrders = allOrders.length
        const totalSellers = 0 // Sellers table might not have API endpoint yet
        const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length
        const completedOrders = allOrders.filter((o: any) => o.status === 'completed').length
        const activeProducts = allProducts.filter((p: any) => p.active === true).length
        const inactiveProducts = allProducts.filter((p: any) => p.active === false).length

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
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-xl rounded-xl p-6 text-white shadow-xl relative overflow-hidden border border-white/20">
        <div className="absolute inset-0 bg-black/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🧩</div>
            <div>
              <h1 className="text-3xl font-bold mb-1">StackStore Admin Dashboard</h1>
              <p className="text-white/90 text-sm">Manage marketplace products, orders, and sellers</p>
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
          onClick={() => router.push('/adminstackt4s/products')}
        />
        <StatCard
          title="Categories"
          value={stats.totalCategories}
          icon="🏷️"
          onClick={() => router.push('/adminstackt4s/categories')}
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          icon="🛒"
          onClick={() => router.push('/adminstackt4s/orders')}
          badges={[
            { label: 'Pending', value: stats.pendingOrders, color: 'yellow' },
            { label: 'Completed', value: stats.completedOrders, color: 'green' }
          ]}
        />
        <StatCard
          title="Sellers"
          value={stats.totalSellers}
          icon="👤"
          onClick={() => router.push('/adminstackt4s/sellers')}
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl rounded-xl p-6 shadow-lg border border-gray-200/50 dark:border-gray-700/50">
        <h2 className="text-xl font-bold mb-5 text-gray-800 dark:text-white flex items-center gap-2">
          <span>⚡</span> Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/adminstackt4s/products')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">📦</div>
            <div className="font-bold text-lg mb-1">Add Product</div>
            <div className="text-sm opacity-90">Create new product listing</div>
          </button>
          <button
            onClick={() => router.push('/adminstackt4s/categories')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🏷️</div>
            <div className="font-bold text-lg mb-1">Manage Categories</div>
            <div className="text-sm opacity-90">Organize product categories</div>
          </button>
          <button
            onClick={() => router.push('/adminstackt4s/orders')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">🛒</div>
            <div className="font-bold text-lg mb-1">View Orders</div>
            <div className="text-sm opacity-90">Monitor all orders</div>
          </button>
          <button
            onClick={() => router.push('/adminstackt4s/sellers')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">👤</div>
            <div className="font-bold text-lg mb-1">Manage Sellers</div>
            <div className="text-sm opacity-90">Approve and manage sellers</div>
          </button>
          <button
            onClick={() => router.push('/adminstackt4s/settings')}
            className="p-5 rounded-xl bg-gradient-to-r from-orange-500/90 to-red-500/90 backdrop-blur-sm text-white hover:from-orange-600 hover:to-red-600 transition-all shadow-md hover:shadow-xl transform hover:scale-105 text-left border border-white/20"
          >
            <div className="text-3xl mb-2">⚙️</div>
            <div className="font-bold text-lg mb-1">Settings</div>
            <div className="text-sm opacity-90">Configure StackStore</div>
          </button>
        </div>
      </div>

      {/* Info Section */}
      <div className="bg-gradient-to-r from-orange-50/50 to-red-50/50 dark:from-orange-900/20 dark:to-red-900/20 backdrop-blur-sm rounded-xl p-5 border border-orange-200/50 dark:border-orange-800/50">
        <h3 className="text-base font-bold mb-2 text-gray-800 dark:text-white">📝 StackStore Management</h3>
        <p className="text-sm text-gray-700 dark:text-gray-300">
          Manage all aspects of the StackStore marketplace including products, categories, orders, and seller accounts.
          All changes are logged for audit purposes.
        </p>
      </div>
    </div>
  )
}

export default StackStoreAdminDashboard

