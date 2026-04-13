import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  Users,
  Church,
  Wallet,
  Calendar,
  Download,
  ArrowUpRight,
  Target,
  Award,
  Heart
} from "lucide-react"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts"

const attendanceData = [
  { week: "Week 1", central: 280, north: 165, hope: 130 },
  { week: "Week 2", central: 295, north: 172, hope: 142 },
  { week: "Week 3", central: 275, north: 158, hope: 125 },
  { week: "Week 4", central: 310, north: 180, hope: 148 },
]

const revenueByChurch = [
  { name: "Central Church", value: 12500, color: "#3b82f6" },
  { name: "North Church", value: 8200, color: "#10b981" },
  { name: "Hope Church", value: 6500, color: "#8b5cf6" },
]

const servicesData = [
  { day: "Sun", services: 6, attendance: 575 },
  { day: "Mon", services: 1, attendance: 25 },
  { day: "Tue", services: 2, attendance: 65 },
  { day: "Wed", services: 4, attendance: 180 },
  { day: "Thu", services: 1, attendance: 35 },
  { day: "Fri", services: 3, attendance: 120 },
  { day: "Sat", services: 2, attendance: 85 },
]

const kpiData = [
  { title: "Total Members", value: "600", change: "+45", isPositive: true, icon: Users, color: "blue" },
  { title: "My Churches", value: "3", change: "+1", isPositive: true, icon: Church, color: "emerald" },
  { title: "Monthly Revenue", value: "$27,200", change: "+12%", isPositive: true, icon: Wallet, color: "purple" },
  { title: "Weekly Services", value: "19", change: "+2", isPositive: true, icon: Calendar, color: "amber" },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f2035] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
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

function LeadPastorStatistics() {
  const [timeRange, setTimeRange] = useState<"week" | "month">("month")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="lead_pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Statistics"
          userName="Pastor Roberto"
          userRole="Lead Pastor"
        />

        <main className="p-6">
          {/* Filter Bar */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-between gap-4 mb-8"
          >
            <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
              {(["week", "month"] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    timeRange === range
                      ? "bg-blue-600 text-white"
                      : "text-blue-300/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {range === "week" ? "This Week" : "This Month"}
                </button>
              ))}
            </div>
            <Button variant="blueOutline" className="gap-2">
              <Download className="w-4 h-4" />
              Export Report
            </Button>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
              >
                <div className={`absolute top-0 right-0 w-24 h-24 rounded-full blur-3xl opacity-20 ${
                  kpi.color === "blue" ? "bg-blue-500" :
                  kpi.color === "emerald" ? "bg-emerald-500" :
                  kpi.color === "purple" ? "bg-purple-500" :
                  "bg-amber-500"
                }`} />

                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${
                      kpi.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                      kpi.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                      kpi.color === "purple" ? "bg-purple-500/20 text-purple-400" :
                      "bg-amber-500/20 text-amber-400"
                    }`}>
                      <kpi.icon className="w-5 h-5" />
                    </div>
                    <div className="flex items-center gap-1 text-sm font-medium text-emerald-400">
                      <ArrowUpRight className="w-4 h-4" />
                      {kpi.change}
                    </div>
                  </div>

                  <h3 className="text-2xl font-bold text-white mb-1">{kpi.value}</h3>
                  <p className="text-sm text-blue-300/70">{kpi.title}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance by Church */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Attendance by Church</h3>
                  <p className="text-sm text-blue-300/60">Weekly comparison</p>
                </div>
              </div>

              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={attendanceData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="week" stroke="rgba(147,197,253,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(147,197,253,0.5)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="central" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Central Church" />
                    <Bar dataKey="north" fill="#10b981" radius={[4, 4, 0, 0]} name="North Church" />
                    <Bar dataKey="hope" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Hope Church" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                  <span className="text-xs text-blue-300/70">Central</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-emerald-500" />
                  <span className="text-xs text-blue-300/70">North</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500" />
                  <span className="text-xs text-blue-300/70">Hope</span>
                </div>
              </div>
            </motion.div>

            {/* Revenue Distribution */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Revenue by Church</h3>
                  <p className="text-sm text-blue-300/60">This month</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-white">$27,200</p>
                  <p className="text-xs text-emerald-400">+12% vs last month</p>
                </div>
              </div>

              <div className="h-72 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={revenueByChurch}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={90}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {revenueByChurch.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="flex-1 space-y-4">
                  {revenueByChurch.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.name}</p>
                        <p className="text-xs text-blue-300/60">${item.value.toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Services Overview */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Services This Week</h3>
                <p className="text-sm text-blue-300/60">Across all my churches</p>
              </div>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={servicesData}>
                  <defs>
                    <linearGradient id="colorAttendance" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="day" stroke="rgba(147,197,253,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(147,197,253,0.5)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="attendance"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorAttendance)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>

          {/* Quick Insights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {[
              { icon: Target, title: "Monthly Goal", value: "85%", subtitle: "Attendance target", color: "blue" },
              { icon: Award, title: "Top Church", value: "Central", subtitle: "Highest attendance", color: "emerald" },
              { icon: Heart, title: "New Members", value: "23", subtitle: "This month", color: "pink" },
            ].map((insight) => (
              <motion.div
                key={insight.title}
                whileHover={{ scale: 1.02 }}
                className={`p-5 rounded-2xl border ${
                  insight.color === "blue" ? "bg-blue-500/10 border-blue-500/20" :
                  insight.color === "emerald" ? "bg-emerald-500/10 border-emerald-500/20" :
                  "bg-pink-500/10 border-pink-500/20"
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`p-2 rounded-lg ${
                    insight.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                    insight.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                    "bg-pink-500/20 text-pink-400"
                  }`}>
                    <insight.icon className="w-5 h-5" />
                  </div>
                  <span className="text-sm text-blue-300/70">{insight.title}</span>
                </div>
                <p className="text-2xl font-bold text-white mb-1">{insight.value}</p>
                <p className="text-xs text-blue-300/50">{insight.subtitle}</p>
              </motion.div>
            ))}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/lead-pastor/statistics')({ component: LeadPastorStatistics })
