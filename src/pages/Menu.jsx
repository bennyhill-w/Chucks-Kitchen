import { useEffect, useState, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import {
  Plus,
  SlidersHorizontal,
  X,
  Search,
  Flame,
  Star,
  ChevronRight,
  TrendingUp,
  Soup,
  Beef,
  Coffee,
  Cake,
  UtensilsCrossed,
} from "lucide-react";
import { supabase } from '../lib/supabase'
import { useAuth } from '../context/AuthContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import toast, { Toaster } from 'react-hot-toast'

const CATEGORIES = [
  { name: "Popular", icon: <TrendingUp className="w-4 h-4" /> },
  {
    name: "Jollof Rice & Entrees",
    icon: <UtensilsCrossed className="w-4 h-4" />,
  },
  { name: "Swallow & Soups", icon: <Soup className="w-4 h-4" /> },
  { name: "Grills & sides", icon: <Beef className="w-4 h-4" /> },
  { name: "Beverages", icon: <Coffee className="w-4 h-4" /> },
  { name: "Desserts", icon: <Cake className="w-4 h-4" /> },
];

const heroImage = import.meta.env.VITE_FOOD_IMAGE_URL

export default function Menu() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [meals, setMeals] = useState([])
  const [cartCount, setCartCount] = useState(0)
  const [addingId, setAddingId] = useState(null)
  const [activeCategory, setActiveCategory] = useState(
    searchParams.get('category') || 'Popular'
  )
  const [showMobileCategories, setShowMobileCategories] = useState(false)
  const [search, setSearch] = useState('')
  const [visibleSections, setVisibleSections] = useState({})
  const sectionRefs = useRef({})

  useEffect(() => {
    fetchMeals()
    if (user) fetchCartCount()
  }, [user])

  // Scroll reveal
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisibleSections(prev => ({ ...prev, [entry.target.id]: true }))
          }
        })
      },
      { threshold: 0.1 }
    )
    Object.values(sectionRefs.current).forEach(ref => {
      if (ref) observer.observe(ref)
    })
    return () => observer.disconnect()
  }, [meals])

  const setRef = (id) => (el) => { sectionRefs.current[id] = el }

  const fetchMeals = async () => {
    const { data } = await supabase.from('meals').select('*').eq('available', true)
    if (data) setMeals(data)
  }

  const fetchCartCount = async () => {
    const { count } = await supabase
      .from('cart_items')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
    setCartCount(count || 0)
  }

  const addToCart = async (e, meal) => {
    e.stopPropagation()
    if (!user) return toast.error('Please sign in to add items to cart')
    setAddingId(meal.id)
    const { data: existing } = await supabase
      .from('cart_items').select('*')
      .eq('user_id', user.id).eq('meal_id', meal.id).single()
    if (existing) {
      await supabase.from('cart_items').update({ quantity: existing.quantity + 1 }).eq('id', existing.id)
    } else {
      await supabase.from('cart_items').insert({ user_id: user.id, meal_id: meal.id, quantity: 1 })
    }
    setAddingId(null)
    toast.success(`${meal.name} added to cart!`)
    fetchCartCount()
  }

  const scrollToCategory = (cat) => {
    setActiveCategory(cat)
    setShowMobileCategories(false)
    const el = document.getElementById(`cat-${cat}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const grouped = CATEGORIES.reduce((acc, cat) => {
    const items = meals.filter(m =>
      m.category === cat.name &&
      m.name.toLowerCase().includes(search.toLowerCase())
    )
    if (items.length > 0) acc[cat.name] = items
    return acc
  }, {})

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Toaster />
      <Navbar cartCount={cartCount} />

      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .reveal-up { animation: fadeUp 0.6s ease forwards; }
        .reveal-scale { animation: scaleIn 0.4s ease forwards; }
        .stagger-1 { animation-delay: 0.05s; opacity: 0; }
        .stagger-2 { animation-delay: 0.1s; opacity: 0; }
        .stagger-3 { animation-delay: 0.15s; opacity: 0; }
        .stagger-4 { animation-delay: 0.2s; opacity: 0; }
        .stagger-5 { animation-delay: 0.25s; opacity: 0; }
        .stagger-6 { animation-delay: 0.3s; opacity: 0; }
        .card-hover { transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
        .card-hover:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(0,0,0,0.1); }
      `}</style>

      {/* Hero Banner */}
      <div className="relative w-full h-90 lg:h-200 overflow-hidden">
        <img src={heroImage} alt="Menu hero" className="w-full h-full object-cover scale-105" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-center px-6 lg:px-12">
          <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 text-xs font-bold px-3 py-1.5 rounded-full w-fit mb-3">
            <Flame className="w-3.5 h-3.5" /> Fresh Today
          </span>
          <h2 className="text-2xl lg:text-4xl font-black text-white mb-1">Chuks Kitchen</h2>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              ))}
              <span className="text-white font-bold text-sm ml-1">4.8</span>
              <span className="text-white/60 text-sm">(1.2k reviews)</span>
            </div>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-sm font-medium">Nigerian Home Cooking</span>
            <span className="text-white/40">•</span>
            <span className="text-white/80 text-sm font-medium">30-45 min delivery</span>
          </div>
        </div>

        {/* Search bar overlapping */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4 lg:px-6">
          <div className="flex items-center gap-3 bg-white rounded-2xl shadow-2xl px-5 py-3.5 border border-gray-100">
            <Search className="text-amber-500 w-5 h-5 shrink-0" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full focus:outline-none text-gray-700 text-sm placeholder-gray-400"
            />
            {search && (
              <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile category filter */}
      <div className="lg:hidden sticky top-16 z-30 bg-white border-b border-gray-100 px-4 py-3 mt-6">
        <button
          onClick={() => setShowMobileCategories(!showMobileCategories)}
          className="flex items-center gap-2 bg-amber-50 border-2 border-amber-200 text-amber-700 font-bold px-4 py-2.5 rounded-xl text-sm w-full justify-between"
        >
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span>{activeCategory}</span>
          </div>
          <ChevronRight className={`w-4 h-4 transition-transform ${showMobileCategories ? 'rotate-90' : ''}`} />
        </button>
        {showMobileCategories && (
          <div className="mt-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.name}
                onClick={() => scrollToCategory(cat.name)}
                className={`w-full text-left px-4 py-3 text-sm font-semibold border-b border-gray-50 last:border-0 transition flex items-center gap-2 ${
                  activeCategory === cat.name ? 'bg-amber-50 text-amber-700' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <span>{cat.icon}</span>
                {cat.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto w-full px-4 lg:px-6 py-8 lg:py-12 flex gap-8 mt-6">

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-60 shrink-0">
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 sticky top-24">
            <h3 className="font-black text-gray-900 text-base mb-1">Menu Categories</h3>
            <p className="text-gray-400 text-xs mb-4">{meals.length} items available</p>
            <ul className="space-y-1">
              {CATEGORIES.map((cat) => (
                <li key={cat.name}>
                  <button
                    onClick={() => scrollToCategory(cat.name)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 flex items-center gap-2 group ${
                      activeCategory === cat.name
                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-100'
                        : 'text-gray-600 hover:bg-amber-50 hover:text-amber-700'
                    }`}
                  >
                    <span className="text-base">{cat.icon}</span>
                    <span className="flex-1">{cat.name}</span>
                    {activeCategory === cat.name && (
                      <ChevronRight className="w-4 h-4 opacity-70" />
                    )}
                  </button>
                </li>
              ))}
            </ul>

            {/* Promo card in sidebar */}
            <div className="mt-6 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white">
              <Flame className="w-6 h-6 mb-2 text-white/80" />
              <p className="font-black text-sm mb-1">Free Delivery</p>
              <p className="text-white/70 text-xs">On orders above ₦5,000</p>
            </div>
          </div>
        </aside>

        {/* Meal sections */}
        <div className="flex-1 space-y-12">
          {Object.entries(grouped).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-gray-50 rounded-3xl">
              <Search className="w-12 h-12 text-gray-300 mb-4" />
              <h3 className="text-xl font-black text-gray-700 mb-2">No meals found</h3>
              <p className="text-gray-400 text-sm">Try a different search term</p>
              <button onClick={() => setSearch('')} className="mt-4 bg-amber-500 text-white font-bold px-6 py-2.5 rounded-xl text-sm hover:bg-amber-600 transition">
                Clear Search
              </button>
            </div>
          ) : (
            Object.entries(grouped).map(([category, items]) => (
              <section
                key={category}
                id={`cat-${category}`}
                ref={setRef(`cat-${category}`)}
              >
                {/* Section header */}
                <div className={`flex items-center justify-between mb-5 ${visibleSections[`cat-${category}`] ? 'reveal-up' : 'opacity-0'}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-amber-500 rounded-full" />
                    <div>
                      <h3 className="text-xl lg:text-2xl font-black text-gray-900">{category}</h3>
                      <p className="text-gray-400 text-xs">{items.length} item{items.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1.5 rounded-full border border-amber-100">
                    {items.length} available
                  </span>
                </div>

                {/* Meal grid */}
                <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 lg:gap-5">
                  {items.map((meal, i) => (
                    <div
                      key={meal.id}
                      onClick={() => navigate(`/meal/${meal.id}`)}
                      className={`group bg-white rounded-2xl lg:rounded-3xl overflow-hidden border border-gray-100 card-hover cursor-pointer ${
                        visibleSections[`cat-${category}`] ? `reveal-scale stagger-${Math.min(i + 1, 6)}` : 'opacity-0'
                      }`}
                    >
                      {/* Image */}
                      <div className="relative h-28 lg:h-44 overflow-hidden">
                        <img
                          src={meal.image_url}
                          alt={meal.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        {/* Quick add button appears on hover */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                          <button
                            onClick={(e) => addToCart(e, meal)}
                            disabled={addingId === meal.id}
                            className="bg-white text-amber-600 font-black text-xs px-4 py-2 rounded-xl shadow-xl hover:bg-amber-500 hover:text-white transition-all duration-200 disabled:opacity-50 transform translate-y-2 group-hover:translate-y-0"
                          >
                            {addingId === meal.id ? 'Adding...' : '+ Quick Add'}
                          </button>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="p-3 lg:p-4">
                        <h4 className="font-black text-gray-900 text-xs lg:text-base mb-0.5 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {meal.name}
                        </h4>
                        <p className="text-gray-400 text-xs mb-3 line-clamp-2 hidden lg:block leading-relaxed">
                          {meal.description}
                        </p>
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-amber-600 font-black text-sm lg:text-lg">
                            ₦{meal.price.toLocaleString()}
                          </span>
                          <button
                            onClick={(e) => addToCart(e, meal)}
                            disabled={addingId === meal.id}
                            className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white rounded-xl w-7 h-7 lg:w-9 lg:h-9 flex items-center justify-center transition-all duration-200 disabled:opacity-50 shadow-md shadow-amber-100 shrink-0"
                          >
                            {addingId === meal.id
                              ? <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                              : <Plus className="w-3.5 h-3.5 lg:w-5 lg:h-5" />
                            }
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))
          )}
        </div>
      </div>

      <Footer />
    </div>
  )
}