import { createFileRoute } from '@tanstack/react-router'
import { motion } from "framer-motion"
import { useState } from "react"
import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { Button } from "@/components/ui/button"
import {
  TrendingUp,
  TrendingDown,
  Users,
  Wallet,
  Calendar,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Heart,
  Baby,
  GraduationCap,
  UserCheck,
  Clock
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
  ResponsiveContainer,
  LineChart,
  Line
} from "recharts"

const monthlyAttendance = [
  { month: "Jan", adults: 180, youth: 45, children: 35 },
  { month: "Feb", adults: 195, youth: 52, children: 38 },
  { month: "Mar", adults: 188, youth: 48, children: 40 },
  { month: "Apr", adults: 210, youth: 55, children: 42 },
  { month: "May", adults: 225, youth: 60, children: 45 },
  { month: "Jun", adults: 240, youth: 65, children: 48 },
]

const membershipData = [
  { name: "Adults", value: 180, color: "#3b82f6" },
  { name: "Youth", value: 65, color: "#10b981" },
  { name: "Children", value: 45, color: "#f59e0b" },
  { name: "Visitors", value: 30, color: "#8b5cf6" },
]

const revenueData = [
  { month: "Jan", tithes: 4500, offerings: 1800, donations: 500 },
  { month: "Feb", tithes: 4800, offerings: 2000, donations: 800 },
  { month: "Mar", tithes: 4600, offerings: 1900, donations: 600 },
  { month: "Apr", tithes: 5200, offerings: 2200, donations: 1000 },
  { month: "May", tithes: 5500, offerings: 2400, donations: 1200 },
  { month: "Jun", tithes: 5800, offerings: 2600, donations: 1500 },
]

const weeklyServices = [
  { name: "Sunday Morning", attendance: 245, time: "10:00 AM" },
  { name: "Wednesday Bible Study", attendance: 85, time: "7:00 PM" },
  { name: "Friday Youth", attendance: 45, time: "6:00 PM" },
  { name: "Saturday Prayer", attendance: 32, time: "8:00 AM" },
]

const kpiData = [
  { title: "Total Members", value: "320", change: "+12", isPositive: true, icon: Users, color: "blue" },
  { title: "Avg. Attendance", value: "285", change: "+8%", isPositive: true, icon: UserCheck, color: "emerald" },
  { title: "Monthly Revenue", value: "$9,900", change: "+15%", isPositive: true, icon: Wallet, color: "purple" },
  { title: "Services/Week", value: "4", change: "0", isPositive: true, icon: Calendar, color: "amber" },
]

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; dataKey: string; color: string }>; label?: string }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0f2035] border border-white/10 rounded-xl p-3 shadow-xl">
        <p className="text-white font-medium mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.dataKey}: {typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value}
          </p>
        ))}
      </div>
    )
  }
  return null
}

function PastorStatistics() {
  const [timeRange, setTimeRange] = useState<"month" | "quarter" | "year">("quarter")

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a1628] via-[#0f2035] to-[#0a1628]">
      <Sidebar role="pastor" />

      <div className="lg:ml-64 transition-all duration-300">
        <Header
          title="Church Statistics"
          userName="Carlos Mendez"
          userRole="Pastor"
        />

        <main className="p-6">
          {/* Church Info Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-blue-600/20 to-blue-500/10 border border-blue-500/20 rounded-2xl p-6 mb-8"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Central Church</h2>
                <p className="text-blue-300/70">Av. Principal 123, Centro, Ciudad de Mexico</p>
              </div>
              <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl">
                {(["month", "quarter", "year"] as const).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                      timeRange === range
                        ? "bg-blue-600 text-white"
                        : "text-blue-300/70 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    {range.charAt(0).toUpperCase() + range.slice(1)}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* KPI Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {kpiData.map((kpi, index) => (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="relative overflow-hidden bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className={`p-2 rounded-lg ${
                    kpi.color === "blue" ? "bg-blue-500/20 text-blue-400" :
                    kpi.color === "emerald" ? "bg-emerald-500/20 text-emerald-400" :
                    kpi.color === "purple" ? "bg-purple-500/20 text-purple-400" :
                    "bg-amber-500/20 text-amber-400"
                  }`}>
                    <kpi.icon className="w-4 h-4" />
                  </div>
                  {kpi.change !== "0" && (
                    <div className="flex items-center gap-0.5 text-xs font-medium text-emerald-400">
                      <ArrowUpRight className="w-3 h-3" />
                      {kpi.change}
                    </div>
                  )}
                </div>

                <h3 className="text-xl font-bold text-white">{kpi.value}</h3>
                <p className="text-xs text-blue-300/60">{kpi.title}</p>
              </motion.div>
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance Trend */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Attendance Trend</h3>
                  <p className="text-sm text-blue-300/60">By age group</p>
                </div>
              </div>

              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyAttendance}>
                    <defs>
                      <linearGradient id="colorAdults" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorYouth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorChildren" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="month" stroke="rgba(147,197,253,0.5)" fontSize={12} />
                    <YAxis stroke="rgba(147,197,253,0.5)" fontSize={12} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="adults" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorAdults)" />
                    <Area type="monotone" dataKey="youth" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorYouth)" />
                    <Area type="monotone" dataKey="children" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorChildren)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span className="text-xs text-blue-300/70">Adults</span>
                </div>
                <div className="flex items-center gap-2">
                  <GraduationCap className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs text-blue-300/70">Youth</span>
                </div>
                <div className="flex items-center gap-2">
                  <Baby className="w-4 h-4 text-amber-400" />
                  <span className="text-xs text-blue-300/70">Children</span>
                </div>
              </div>
            </motion.div>

            {/* Membership Breakdown */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white">Membership Breakdown</h3>
                  <p className="text-sm text-blue-300/60">Current distribution</p>
                </div>
                <p className="text-xl font-bold text-white">320</p>
              </div>

              <div className="h-64 flex items-center">
                <ResponsiveContainer width="50%" height="100%">
                  <RechartsPie>
                    <Pie
                      data={membershipData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {membershipData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </RechartsPie>
                </ResponsiveContainer>

                <div className="flex-1 space-y-3">
                  {membershipData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <div className="flex-1">
                        <p className="text-sm text-white">{item.name}</p>
                      </div>
                      <p className="text-sm font-medium text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>

          {/* Revenue Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6 mb-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white">Revenue Trend</h3>
                <p className="text-sm text-blue-300/60">Tithes, Offerings & Donations</p>
              </div>
              <Button variant="blueOutline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="rgba(147,197,253,0.5)" fontSize={12} />
                  <YAxis stroke="rgba(147,197,253,0.5)" fontSize={12} />
                  <Tooltip content={<CustomTooltip />} />
                  <Line type="monotone" dataKey="tithes" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  <Line type="monotone" dataKey="offerings" stroke="#10b981" strokeWidth={2} dot={{ fill: "#10b981" }} />
                  <Line type="monotone" dataKey="donations" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: "#8b5cf6" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="flex items-center justify-center gap-6 mt-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-xs text-blue-300/70">Tithes</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <span className="text-xs text-blue-300/70">Offerings</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <span className="text-xs text-blue-300/70">Donations</span>
              </div>
            </div>
          </motion.div>

          {/* Weekly Services */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-white/[0.08] to-white/[0.03] border border-white/10 rounded-2xl p-6"
          >
            <h3 className="text-lg font-semibold text-white mb-6">Weekly Services</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {weeklyServices.map((service, index) => (
                <motion.div
                  key={service.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  className="p-4 rounded-xl bg-white/5 border border-white/10"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <Clock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs text-blue-300/60">{service.time}</span>
                  </div>
                  <h4 className="text-white font-medium mb-2">{service.name}</h4>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span className="text-lg font-bold text-white">{service.attendance}</span>
                    <span className="text-xs text-blue-300/50">avg</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export const Route = createFileRoute('/pastor/statistics')({ component: PastorStatistics })
