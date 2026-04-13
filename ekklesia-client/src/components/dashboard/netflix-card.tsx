"use client"

import { motion } from "framer-motion"
import { Edit2, Trash2, Eye, MoreVertical, MapPin, Users, Calendar } from "lucide-react"
import { useState, ReactNode } from "react"

interface NetflixCardProps {
  title: string
  subtitle?: string
  image?: string
  stats?: { label: string; value: string | number; icon?: ReactNode }[]
  badges?: { label: string; color: "blue" | "green" | "amber" | "red" | "purple" }[]
  onView?: () => void
  onEdit?: () => void
  onDelete?: () => void
  delay?: number
  gradient?: string
}

export function NetflixCard({
  title,
  subtitle,
  image,
  stats,
  badges,
  onView,
  onEdit,
  onDelete,
  delay = 0,
  gradient = "from-blue-600/30 to-blue-900/50"
}: NetflixCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showMenu, setShowMenu] = useState(false)

  const badgeColors = {
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setShowMenu(false); }}
      className="group relative"
    >
      <motion.div
        animate={{ 
          scale: isHovered ? 1.03 : 1,
          y: isHovered ? -5 : 0
        }}
        transition={{ duration: 0.3 }}
        className="relative h-64 rounded-xl overflow-hidden cursor-pointer"
      >
        {/* Background Image/Gradient */}
        {image ? (
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${image})` }}
          />
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`} />
        )}
        
        {/* Church Icon Pattern */}
        {!image && (
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 100 100" className="w-full h-full">
              <path
                d="M50 10 L50 40 M30 30 L70 30 M50 40 L50 90 M25 90 L75 90 M25 60 L25 90 M75 60 L75 90 M35 60 Q50 50 65 60"
                fill="none"
                stroke="white"
                strokeWidth="2"
              />
            </svg>
          </div>
        )}

        {/* Overlay Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1628] via-[#0a1628]/50 to-transparent" />

        {/* Content */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end">
          {/* Badges */}
          {badges && badges.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {badges.map((badge, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay + 0.1 + index * 0.05 }}
                  className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[badge.color]}`}
                >
                  {badge.label}
                </motion.span>
              ))}
            </div>
          )}

          {/* Title & Subtitle */}
          <h3 className="text-lg font-bold text-white mb-1 line-clamp-1">{title}</h3>
          {subtitle && (
            <p className="text-sm text-blue-300/70 line-clamp-1">{subtitle}</p>
          )}

          {/* Stats Row */}
          {stats && stats.length > 0 && (
            <div className="flex items-center gap-4 mt-3">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1.5 text-blue-300/60">
                  {stat.icon}
                  <span className="text-xs">{stat.value} {stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Hover Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute top-3 right-3 flex items-center gap-2"
        >
          {/* Menu Button */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
              className="p-2 rounded-lg bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-colors"
            >
              <MoreVertical className="w-4 h-4" />
            </motion.button>

            {/* Dropdown Menu */}
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="absolute right-0 top-full mt-2 w-36 bg-[#0f2035] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-20"
              >
                {onView && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onView(); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    Ver detalles
                  </button>
                )}
                {onEdit && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onEdit(); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-white hover:bg-white/5 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                    Editar
                  </button>
                )}
                {onDelete && (
                  <button
                    onClick={(e) => { e.stopPropagation(); onDelete(); setShowMenu(false); }}
                    className="w-full px-4 py-2.5 flex items-center gap-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar
                  </button>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Hover Border Effect */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          className="absolute inset-0 border-2 border-blue-500/50 rounded-xl pointer-events-none"
        />
      </motion.div>

      {/* Shadow on hover */}
      <motion.div
        animate={{ 
          opacity: isHovered ? 0.5 : 0,
          scale: isHovered ? 1 : 0.9
        }}
        className="absolute inset-0 -z-10 bg-blue-500/30 blur-2xl rounded-full"
      />
    </motion.div>
  )
}

// Horizontal variant for list views
export function NetflixCardHorizontal({
  title,
  subtitle,
  image,
  stats,
  badges,
  onView,
  onEdit,
  onDelete,
  delay = 0,
  gradient = "from-blue-600/30 to-blue-900/50"
}: NetflixCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const badgeColors = {
    blue: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    green: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    amber: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    red: "bg-red-500/20 text-red-300 border-red-500/30",
    purple: "bg-purple-500/20 text-purple-300 border-purple-500/30"
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.4 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group"
    >
      <motion.div
        animate={{ x: isHovered ? 5 : 0 }}
        transition={{ duration: 0.2 }}
        className="relative flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-white/[0.05] to-transparent border border-white/5 hover:border-white/10 transition-colors cursor-pointer"
      >
        {/* Thumbnail */}
        <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
          {image ? (
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${image})` }}
            />
          ) : (
            <div className={`absolute inset-0 bg-gradient-to-br ${gradient}`}>
              <svg viewBox="0 0 100 100" className="w-full h-full opacity-30">
                <path
                  d="M50 20 L50 50 M30 40 L70 40 M50 50 L50 80"
                  fill="none"
                  stroke="white"
                  strokeWidth="4"
                />
              </svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold text-white line-clamp-1">{title}</h3>
              {subtitle && (
                <p className="text-sm text-blue-300/60 line-clamp-1 mt-0.5">{subtitle}</p>
              )}
            </div>
            {badges && badges.length > 0 && (
              <div className="flex gap-1.5 flex-shrink-0">
                {badges.map((badge, index) => (
                  <span
                    key={index}
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badgeColors[badge.color]}`}
                  >
                    {badge.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {stats && (
            <div className="flex items-center gap-4 mt-2">
              {stats.map((stat, index) => (
                <div key={index} className="flex items-center gap-1.5 text-blue-300/50">
                  {stat.icon}
                  <span className="text-xs">{stat.value} {stat.label}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onView && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onView}
              className="p-2 rounded-lg bg-white/5 text-blue-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Eye className="w-4 h-4" />
            </motion.button>
          )}
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onEdit}
              className="p-2 rounded-lg bg-white/5 text-blue-300 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Edit2 className="w-4 h-4" />
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={onDelete}
              className="p-2 rounded-lg bg-white/5 text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
