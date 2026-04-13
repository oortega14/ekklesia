import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import { useAuthStore, ROLE_LABELS } from "@/lib/auth/store"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Church,
  Wallet,
  Calendar,
  Download,
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  BarChart3,
  PieChart,
  Activity,
  Target,
  Zap,
  Award
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts"

const attendanceData = [
  { month: "Jan", churches: 2100, growth: 2000 },
  { month: "Feb", churches: 2300, growth: 2200 },
  { month: "Mar", churches: 2500, growth: 2350 },
  { month: "Apr", churches: 2200, growth: 2400 },
  { month: "May", churches: 2800, growth: 2600 },
  { month: "Jun", churches: 3100, growth: 2850 },
  { month: "Jul", churches: 2900, growth: 3000 },
  { month: "Aug", churches: 3200, growth: 3100 },
  { month: "Sep", churches: 3500, growth: 3300 },
  { month: "Oct", churches: 3300, growth: 3450 },
  { month: "Nov", churches: 3700, growth: 3600 },
  { month: "Dec", churches: 4000, growth: 3800 },
]

const revenueData = [
  { name: "Tithes", value: 45000, color: "#3b82f6" },
  { name: "Offerings", value: 32000, color: "#10b981" },
  { name: "Donations", value: 18000, color: "#8b5cf6" },
  { name: "Events", value: 12000, color: "#f59e0b" },
]

const churchPerformance = [
  { name: "Central Church", members: 320, attendance: 285, revenue: 12500, growth: 12 },
  { name: "North Church", members: 185, attendance: 165, revenue: 8200, growth: 8 },
  { name: "South Church", members: 210, attendance: 195, revenue: 9800, growth: 15 },
  { name: "Hope Church", members: 145, attendance: 130, revenue: 6500, growth: 5 },
  { name: "New Life", members: 95, attendance: 88, revenue: 4200, growth: 22 },
]

const weeklyServices = [
  { day: "Sun", services: 24, attendance: 2800 },
  { day: "Mon", services: 4, attendance: 120 },
  { day: "Tue", services: 8, attendance: 280 },
  { day: "Wed", services: 18, attendance: 650 },
  { day: "Thu", services: 6, attendance: 180 },
  { day: "Fri", services: 12, attendance: 420 },
  { day: "Sat", services: 8, attendance: 350 },
]

const kpiData = [
  {
    title: "Total Members",
    value: "12,458",
    change: "+12.5%",
    isPositive: true,
    icon: Users,
    color: "blue",
    description: "Across all churches"
  },
  {
    title: "Active Churches",
    value: "24",
    change: "+3",
    isPositive: true,
    icon: Church,
    color: "emerald",
    description: "2 pending approval"
  },
  {
    title: "Monthly Revenue",
    value: "$107,000",
    change: "+18.2%",
    isPositive: true,
    icon: Wallet,
    color: "purple",
    description: "vs last month"
  },
  {
    title: "Weekly Services",
    value: "80",
    change: "+5",
    isPositive: true,
    icon: Calendar,
    color: "amber",
    description: "This week"
  },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-3 shadow-xl">
        <p className="text-slate-900 font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function SuperAdminStatistics() {
  const { user } = useAuthStore()
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("year")

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role="superadmin" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Statistics & Analytics"
          userName={user?.full_name ?? ''}
          userRole={ROLE_LABELS[user?.role ?? ''] ?? ''}
        />

        <main className="p-6 bg-white">
          {/* Time Range Filter */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-xl border border-slate-300">
              {(["week", "month", "year"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? "bg-blue-600 text-white"
                      : "text-slate-500 hover:text-slate-800 hover:bg-white"
                  }`}
                >
                  {range.charAt(0).toUpperCase() + range.slice(1)}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="blueOutline" className="gap-2">
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button variant="blueOutline" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative overflow-hidden bg-white border border-slate-200 shadow-sm rounded-2xl p-6 group"
              >
                <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 transition-opacity group-hover:opacity-30 ${
                  kpi.color === "blue" ? "bg-blue-500" :
                  kpi.color === "emerald" ? "bg-emerald-500" :
                  kpi.color === "purple" ? "bg-purple-500" :
                  "bg-amber-500"
                }`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      kpi.color === "blue" ? "bg-blue-100 text-blue-700" :
                      kpi.color === "emerald" ? "bg-emerald-100 text-emerald-700" :
                      kpi.color === "purple" ? "bg-purple-100 text-purple-700" :
                      "bg-amber-100 text-amber-700"
                    }`}>
                      <kpi.icon className="w-6 h-6" />
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      kpi.isPositive ? "text-emerald-400" : "text-red-400"
                    }`}>
                      {kpi.isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                      {kpi.change}
                    </div>
                  </div>

                  <h3 className="text-3xl font-bold text-slate-900 mb-1">{kpi.value}</h3>
                  <p className="text-sm text-slate-600">{kpi.title}</p>
                  <p className="text-xs text-slate-500 mt-1">{kpi.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Main Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Attendance Trend</h3>
                  <p className="text-sm text-slate-500">Monthly attendance comparison</p>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span className="text-slate-500">Churches</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                    <span className="text-slate-500">Growth</span>
                  </div>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={attendanceData}>
                    <defs>
                      <linearGradient id="colorChurches" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorGrowth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                    <YAxis stroke="#94a3b8" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="churches"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorChurches)"
                    />
                    <Area
                      type="monotone"
                      dataKey="growth"
                      stroke="#10b981"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorGrowth)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </motion.div>

            {/* Revenue Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Revenue Distribution</h3>
                  <p className="text-sm text-slate-500">By contribution type</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-900">$107,000</p>
                  <p className="text-xs text-emerald-400">+18.2% vs last month</p>
                </div>
              </div>

              <div className="h-72 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={revenueData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="flex-1 space-y-3">
                  {revenueData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">${item.value.toLocaleString()}</p>
                      </div>
                      <p className="text-sm font-medium text-slate-900">
                        {Math.round((item.value / revenueData.reduce((a, b) => a + b.value, 0)) * 100)}%
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Weekly Services Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Weekly Services Overview</h3>
                <p className="text-sm text-slate-500">Services and attendance by day</p>
              </div>
            </div>

            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyServices}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="left" stroke="#94a3b8" fontSize={12} />
                  <YAxis yAxisId="right" orientation="right" stroke="#94a3b8" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar yAxisId="left" dataKey="services" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="attendance" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Church Performance Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white border border-slate-200 shadow-sm rounded-2xl overflow-hidden"
          >
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Church Performance</h3>
                  <p className="text-sm text-slate-500">Detailed breakdown by church</p>
                </div>
                <div className="flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-slate-500">Live data</span>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Church</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Members</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Attendance</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Revenue</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Growth</th>
                    <th className="text-left p-4 text-sm font-medium text-slate-500">Performance</th>
                  </tr>
                </thead>
                <tbody>
                  {churchPerformance.map((church, index) => {
                    const attendanceRate = Math.round((church.attendance / church.members) * 100)
                    return (
                      <motion.tr
                        key={church.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.8 + index * 0.05 }}
                        className="border-b border-slate-100 hover:bg-slate-50 transition-colors"
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
                              <Church className="w-5 h-5" />
                            </div>
                            <span className="text-slate-900 font-medium">{church.name}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-900">{church.members}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="text-slate-900">{church.attendance}</span>
                            <span className="text-xs text-slate-500">({attendanceRate}%)</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-900">${church.revenue.toLocaleString()}</td>
                        <td className="p-4">
                          <span className="flex items-center gap-1 text-emerald-400">
                            <TrendingUp className="w-4 h-4" />
                            {church.growth}%
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${attendanceRate}%` }}
                                transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                                className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full"
                              />
                            </div>
                            <span className="text-xs text-slate-500 w-8">{attendanceRate}%</span>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
          >
            {[
              {
                icon: Target,
                title: "Goal Progress",
                value: "78%",
                subtitle: "Annual membership goal",
                color: "blue"
              },
              {
                icon: Zap,
                title: "Most Active Day",
                value: "Sunday",
                subtitle: "24 services, 2,800 attendees",
                color: "amber"
              },
              {
                icon: Award,
                title: "Top Church",
                value: "Central Church",
                subtitle: "Highest growth this month",
                color: "emerald"
              },
            ].map((insight, index) => (
              <motion.div
                key={insight.title}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-2xl border ${
                  insight.color === "blue" ? "bg-blue-50 border-blue-200" :
                  insight.color === "amber" ? "bg-amber-50 border-amber-200" :
                  "bg-emerald-50 border-emerald-200"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    insight.color === "blue" ? "bg-blue-100 text-blue-700" :
                    insight.color === "amber" ? "bg-amber-100 text-amber-700" :
                    "bg-emerald-100 text-emerald-700"
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-slate-600">{insight.title}</span>
                </div>
                <p className="text-2xl font-bold text-slate-900 mb-1">{insight.value}</p>
                <p className="text-xs text-slate-500">{insight.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/superadmin/statistics')({
  component: SuperAdminStatistics
})
