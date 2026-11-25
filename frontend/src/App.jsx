import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  BadgeCheck,
  Bath,
  BedDouble,
  Building2,
  CalendarDays,
  Clock3,
  Compass,
  Heart,
  MapPin,
  MessageCircle,
  MoonStar,
  Search,
  Sparkles,
  UserRound,
  Wallet,
} from 'lucide-react'
import { BrowserRouter, Link, Navigate, Route, Routes, useNavigate, useParams, useSearchParams } from 'react-router-dom'

import ChatBox from './components/ChatBox'
import FlatmateCard from './components/FlatmateCard'
import Footer from './components/Footer'
import MatchScore from './components/MatchScore'
import Modal from './components/Modal'
import Navbar from './components/Navbar'
import PropertyCard from './components/PropertyCard'
import { api, clearToken, getToken, setToken } from './services/api'

const defaultPreferences = {
  budgetMax: 12000,
  roomType: 'Any',
  area: 'Any',
  furnished: 'Any',
}

const formatCurrency = (value) => new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(value)

const demoProperties = [
  {
    id: 'demo-101',
    name: 'VBHC',
    location: 'Chandapura, Bengaluru',
    area: 'Chandapura',
    university: 'Alliance University',
    distance: 1.2,
    rent: 7200,
    roomType: '2 Bedrooms',
    furnished: 'Furnished',
    amenities: ['Wi-Fi', 'Laundry', 'Study Desk'],
    images: ['/vbhc/vbhc-cover.jpg', '/vbhc/vbhc-room-2.jpg', '/vbhc/vbhc-room.jpg', '/vbhc/vbhc-room-3.jpg'],
    verified: true,
  },
  {
    id: 'demo-102',
    name: 'JR Housing',
    location: 'Anekal, Bengaluru',
    area: 'Anekal',
    university: 'Christ University',
    distance: 0.9,
    rent: 5800,
    roomType: 'Single Room',
    furnished: 'Semi-Furnished',
    amenities: ['Wi-Fi', 'Water', 'Study Chair'],
    images: ['/jr-housing/jr-housing-cover.jpg', '/jr-housing/jr-housing-kitchen.jpg', '/jr-housing/jr-housing-room.jpg'],
    verified: true,
  },
  {
    id: 'demo-103',
    name: 'Commune',
    location: 'Chandapura, Bengaluru',
    area: 'Chandapura',
    university: 'JAIN University',
    distance: 2.3,
    rent: 10800,
    roomType: '3 Bedrooms',
    furnished: 'Fully Furnished',
    amenities: ['Wi-Fi', 'AC', 'Kitchen'],
    images: ['/commune/commune-cover.jpg', '/commune/commune-wardrobe.jpg', '/commune/commune-storage.jpg'],
    verified: true,
  },
  {
    id: 'demo-104',
    name: 'SV Building',
    location: 'Anekal, Bengaluru',
    area: 'Anekal',
    university: 'NSIT',
    distance: 3.1,
    rent: 8400,
    roomType: 'Studio',
    furnished: 'Furnished',
    amenities: ['Wi-Fi', 'Desk', 'Balcony'],
    images: ['https://images.unsplash.com/photo-1502672023488-70e25813eb80?auto=format&fit=crop&w=1200&q=80'],
    verified: true,
  },
  {
    id: 'demo-105',
    name: 'VBHC',
    location: 'Chandapura, Bengaluru',
    area: 'Chandapura',
    university: 'BMS College',
    distance: 2.7,
    rent: 6500,
    roomType: 'Single Room',
    furnished: 'Unfurnished',
    amenities: ['Water', 'Power Backup', 'Internet'],
    images: ['/vbhc-second/vbhc-second-room.jpg', '/vbhc-second/vbhc-second-hall.jpg'],
    verified: false,
  },
  {
    id: 'demo-106',
    name: 'VR Building',
    location: 'Chandapura, Bengaluru',
    area: 'Chandapura',
    university: 'Alliance University',
    distance: 1.8,
    rent: 9700,
    roomType: '2 Bedrooms',
    furnished: 'Semi-Furnished',
    amenities: ['Wi-Fi', 'Water', 'Parking'],
    images: ['https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80'],
    verified: true,
  },
]

const demoFlatmates = [
  { id: 'demo-f-101', name: 'Varshith', phone: '8951117206', profileImage: '/flatmates/varshith.jpeg', university: 'Alliance University', course: 'BCA Student', age: 21, budget: { min: 8000, max: 12000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '11 PM – 7 AM', studyStyle: 'Quiet environment', lifestyle: 'Balanced', food: 'Vegetarian', compatibility: 94, matchBreakdown: { budget: 94, location: 92, lifestyle: 95, sleep: 90, study: 94 }, about: 'Looking for a calm, respectful home close to campus.' },
  { id: 'demo-f-102', name: 'Vikas', phone: '8431143191', profileImage: '/flatmates/vikas.jpeg', university: 'Alliance University', course: 'BCA Student', age: 22, budget: { min: 9000, max: 14000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '12 AM – 8 AM', studyStyle: 'Group study sometimes', lifestyle: 'Social', food: 'Non-vegetarian', compatibility: 90, matchBreakdown: { budget: 91, location: 89, lifestyle: 93, sleep: 88, study: 90 }, about: 'Enjoys a friendly shared space and occasional group study.' },
  { id: 'demo-f-103', name: 'Stalin', phone: '9392875578', profileImage: '/flatmates/stalin.jpeg', university: 'Alliance University', course: 'BCA Student', age: 22, budget: { min: 10000, max: 15000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '10:30 PM – 6:30 AM', studyStyle: 'Deep focus blocks', lifestyle: 'Moderate', food: 'Vegetarian', compatibility: 88, matchBreakdown: { budget: 87, location: 90, lifestyle: 88, sleep: 92, study: 89 }, about: 'Keeps a structured routine and likes a tidy study-friendly home.' },
  { id: 'demo-f-104', name: 'Syahrul', phone: '7075550061', university: 'Alliance University', course: 'BCA Student', age: 21, budget: { min: 7000, max: 11000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '11:30 PM – 7:30 AM', studyStyle: 'Creative late nights', lifestyle: 'Easygoing', food: 'Non-vegetarian', compatibility: 86, matchBreakdown: { budget: 90, location: 86, lifestyle: 88, sleep: 82, study: 87 }, about: 'Easygoing and considerate, with a creative approach to student life.' },
  { id: 'demo-f-105', name: 'Sai Darshan', phone: '9865555064', profileImage: '/flatmates/sai-darshan.jpeg', university: 'Alliance University', course: 'BCA Student', age: 20, budget: { min: 8000, max: 13000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '10 PM – 6 AM', studyStyle: 'Focused and quiet', lifestyle: 'Calm', food: 'Vegetarian', compatibility: 91, matchBreakdown: { budget: 92, location: 91, lifestyle: 90, sleep: 94, study: 92 }, about: 'Prefers a peaceful home, clear communication and shared responsibility.' },
  { id: 'demo-f-106', name: 'Shashank', phone: '6381816410', profileImage: '/flatmates/shashank.jpeg', university: 'Alliance University', course: 'BCA Student', age: 23, budget: { min: 10000, max: 16000 }, preferredAreas: ['Chandapura', 'Anekal'], sleep: '11 PM – 7 AM', studyStyle: 'Flexible routine', lifestyle: 'Social', food: 'Non-vegetarian', compatibility: 89, matchBreakdown: { budget: 88, location: 90, lifestyle: 92, sleep: 87, study: 89 }, about: 'Friendly, flexible and looking for a comfortable long-term flat share.' },
]

function mapPreferences(preferences) {
  return {
    budgetMax: preferences.budget_max,
    roomType: preferences.room_type,
    area: preferences.area,
    furnished: preferences.furnished,
  }
}

function mapUser(user) {
  return { ...user, fullName: user.full_name, studentId: user.student_id }
}

function mapVisit(visit, propertyData) {
  const property = (propertyData || []).find((entry) => entry.id === visit.property_id)
  return {
    id: visit.id,
    property: property?.name || visit.property_id,
    location: property?.location || '',
    date: visit.visit_date,
    time: String(visit.visit_time).slice(0, 5),
    contact: property?.landlord_name || 'Property owner',
    status: visit.status,
  }
}

function mapConversation(conversation, currentUserId, flatmateData) {
  const otherId = conversation.participant_ids.find((id) => id !== currentUserId)
  const profile = (flatmateData || []).find((item) => item.user_id === otherId)
  const lastMessage = conversation.messages.at(-1)
  return {
    id: conversation.id,
    name: profile?.name || 'New contact',
    university: profile?.university || 'University',
    online: false,
    profileImage: profile?.profile_image || '',
    time: lastMessage?.created_at || '',
    preview: lastMessage?.body || 'Start a conversation.',
    messages: conversation.messages.map((message) => ({
      sender: message.sender_id === currentUserId ? 'me' : 'them',
      text: message.body,
      timestamp: new Date(message.created_at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }),
    })),
  }
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  )
}

function AppShell() {
  const navigate = useNavigate()
  const [showIntro, setShowIntro] = useState(true)
  const [properties, setProperties] = useState(demoProperties)
  const [flatmates, setFlatmates] = useState(demoFlatmates)
  const [savedProperties, setSavedProperties] = useState([])
  const [user, setUser] = useState(null)
  const [preferences, setPreferences] = useState(defaultPreferences)
  const [messages, setMessages] = useState([])
  const [visits, setVisits] = useState([])
  const [loadError, setLoadError] = useState('')

  useEffect(() => {
    const introTimer = window.setTimeout(() => setShowIntro(false), 1000)
    const loadPublicData = async () => {
      try {
        const [propertyData, flatmateData] = await Promise.all([api.properties(), api.flatmates()])
        setProperties(demoProperties)
        setFlatmates(demoFlatmates)
        if (getToken()) {
          const [currentUser, saved, savedPreferences, visitData, conversations] = await Promise.all([
            api.me(), api.savedProperties(), api.preferences(), api.visits(), api.conversations(),
          ])
          setUser(mapUser(currentUser))
          setSavedProperties(saved.map((property) => property.id))
          setPreferences(mapPreferences(savedPreferences))
          setVisits(visitData.map((visit) => mapVisit(visit, propertyData)))
          setMessages(conversations.map((conversation) => mapConversation(conversation, currentUser.id, flatmateData)))
        }
      } catch (error) {
        if (error.status === 401) clearToken()
        setProperties(demoProperties)
        setFlatmates(demoFlatmates)
      }
    }
    loadPublicData()
    return () => window.clearTimeout(introTimer)
  }, [])

  const toggleSaveProperty = async (propertyId) => {
    if (!getToken()) return setLoadError('Please log in to save properties.')
    try {
      const isSaved = savedProperties.includes(propertyId)
      if (isSaved) await api.unsaveProperty(propertyId)
      else await api.saveProperty(propertyId)
      setSavedProperties((current) => isSaved ? current.filter((id) => id !== propertyId) : [...current, propertyId])
    } catch (error) { setLoadError(error.message) }
  }

  const sendMessage = async (conversationId, text) => {
    if (!text.trim()) return
    if (conversationId.startsWith('demo-conversation-')) {
      setMessages((current) => current.map((conversation) => conversation.id === conversationId
        ? {
            ...conversation,
            preview: text.trim(),
            messages: [...conversation.messages, { sender: 'me', text: text.trim(), timestamp: 'Now' }],
          }
        : conversation))
      return
    }
    try {
      await api.sendMessage(conversationId, text.trim())
      const conversations = await api.conversations()
      setMessages(conversations.map((conversation) => mapConversation(conversation, user?.id, flatmates)))
    } catch (error) { setLoadError(error.message) }
  }

  const addVisit = async (property, date, time) => {
    try {
      const visit = await api.createVisit(property.id, { visit_date: date, visit_time: `${time}:00` })
      setVisits((current) => [mapVisit(visit, properties), ...current])
    } catch (error) { setLoadError(error.message) }
  }

  const connectFlatmate = async (flatmateId) => {
    const flatmate = flatmates.find((entry) => entry.id === flatmateId)
    if (!flatmate) return setLoadError('That flatmate could not be found.')
    if (!getToken()) {
      const conversationId = `demo-conversation-${flatmate.id}`
      setMessages((current) => current.some((conversation) => conversation.id === conversationId)
        ? current
        : [{
            id: conversationId,
            name: flatmate.name,
            university: flatmate.university,
            online: true,
            profileImage: '',
            preview: `You connected with ${flatmate.name}.`,
            messages: [{ sender: 'them', text: `Hi! Thanks for connecting. I’m ${flatmate.name}.`, timestamp: 'Now' }],
          }, ...current])
      navigate('/messages')
      return
    }
    try {
      const conversation = await api.connectFlatmate(flatmateId)
      const currentUserId = user?.id || (await api.me()).id
      const otherUserId = conversation.participant_ids.find((id) => id !== currentUserId)
      if (!otherUserId) throw new Error('Could not open the flatmate conversation.')

      const mappedConversation = mapConversation(conversation, currentUserId, [{
        user_id: otherUserId,
        name: flatmate.name,
        university: flatmate.university,
        profile_image: flatmate.profileImage || '',
      }])
      setMessages((current) => [mappedConversation, ...current.filter((item) => item.id !== mappedConversation.id)])
      navigate('/messages')
    } catch (error) {
      setLoadError(error.message)
    }
  }

  const logout = () => {
    clearToken()
    setUser(null)
    setSavedProperties([])
    setVisits([])
    setMessages([])
  }

  const activeSavedProperties = properties.filter((property) => savedProperties.includes(property.id))

  return (
    <div className={`app-shell ${showIntro ? 'app-shell-intro' : 'app-shell-ready'}`}>
        <Navbar user={user} onLogout={logout} />
        {loadError && <div className="container api-error" role="alert">{loadError}</div>}
        <main id="main-content" className="page-shell">
          <Routes>
          <Route path="/" element={<HomePage introComplete={!showIntro} />} />
          <Route path="/find-flat" element={<FindFlatPage properties={properties} savedProperties={savedProperties} toggleSaveProperty={toggleSaveProperty} preferences={preferences} setPreferences={setPreferences} onError={setLoadError} />} />
          <Route path="/property/:id" element={<PropertyDetailsPage properties={properties} savedProperties={savedProperties} toggleSaveProperty={toggleSaveProperty} addVisit={addVisit} />} />
          <Route path="/find-flatmate" element={<FindFlatmatePage flatmates={flatmates} onConnect={connectFlatmate} />} />
          <Route path="/flatmate/:id" element={<FlatmateProfilePage flatmates={flatmates} onConnect={connectFlatmate} />} />
          <Route path="/login" element={<LoginPage setUser={setUser} />} />
          <Route path="/signup" element={<SignupPage setUser={setUser} />} />
          <Route path="/dashboard" element={<DashboardPage user={user} visits={visits} savedProperties={activeSavedProperties} />} />
          <Route path="/saved" element={<SavedPropertiesPage savedProperties={activeSavedProperties} toggleSaveProperty={toggleSaveProperty} />} />
          <Route path="/messages" element={<MessagesPage messages={messages} sendMessage={sendMessage} />} />
          <Route path="/visits" element={<VisitsPage visits={visits} />} />
          <Route path="/how-it-works" element={<AboutAndHowItWorksPage />} />
          <Route path="/about" element={<AboutAndHowItWorksPage />} />
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </main>
        <Footer />
        <AnimatePresence>
          {showIntro && (
            <motion.div
              className="brand-intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: [1, 1, 0] }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
              aria-hidden="true"
            >
              <div className="brand-intro-content">
                <motion.span className="brand-mark brand-intro-mark">FF</motion.span>
                <span className="brand-intro-name">FlatFinder</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  )
}

function HomePage({ introComplete }) {
  const navigate = useNavigate()

  return (
    <section className="home-minimal">
      <motion.div
        className="home-minimal-content"
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
      >
        <motion.span
          className="eyebrow"
          initial={{ opacity: 0, letterSpacing: '0.02em' }}
          animate={{ opacity: 1, letterSpacing: '0.12em' }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          Student housing, simplified
        </motion.span>
        <h1>
          <motion.span
            className="headline-primary"
            initial={false}
            animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ delay: 0.15, type: 'spring', stiffness: 150, damping: 17, mass: 0.8 }}
          >
            Find your place.
          </motion.span>
          <motion.span
            className="headline-secondary"
            initial={false}
            animate={introComplete ? { opacity: 1, y: 0 } : { opacity: 0, y: 28 }}
            transition={{ delay: 0.28, type: 'spring', stiffness: 150, damping: 17, mass: 0.8 }}
          >
            Meet your people.
          </motion.span>
        </h1>
        <div className="home-minimal-actions">
          <Link to="/find-flat" className="button button-dark">Find a flat <ArrowRight size={16} /></Link>
          <Link to="/find-flatmate" className="button button-light">Find a flatmate</Link>
        </div>
        <div className="studio-credit">Created by <strong>V2 Studios</strong></div>
        <button type="button" className="home-scroll-hint" onClick={() => navigate('/about')}>
          <span className="home-scroll-dot" />
          Explore how it works
        </button>
      </motion.div>
    </section>
  )
}

function FindFlatPage({ properties, savedProperties, toggleSaveProperty, preferences, setPreferences, onError }) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  const budgetLimit = Number(searchParams.get('budget')) || preferences.budgetMax
  const filteredProperties = useMemo(() => properties.filter((property) => {
    const matchesBudget = property.rent <= budgetLimit
    const matchesArea = preferences.area === 'Any' || property.area === preferences.area
    const matchesRoomType = preferences.roomType === 'Any' || property.roomType === preferences.roomType
    const matchesFurnished = preferences.furnished === 'Any' || property.furnished === preferences.furnished
    const normalizedSearch = searchTerm.trim().toLowerCase()
    const matchesSearch = !normalizedSearch
      || property.name.toLowerCase().includes(normalizedSearch)
      || property.location.toLowerCase().includes(normalizedSearch)
      || property.area.toLowerCase().includes(normalizedSearch)

    return matchesBudget && matchesArea && matchesRoomType && matchesFurnished && matchesSearch
  }), [budgetLimit, preferences, properties, searchTerm])

  const updatePreference = (key, value) => {
    if (key === 'budgetMax' && searchParams.has('budget')) {
      const nextParams = new URLSearchParams(searchParams)
      nextParams.delete('budget')
      setSearchParams(nextParams)
    }
    setPreferences((current) => {
      const next = { ...current, [key]: value }
      if (getToken()) api.updatePreferences({ budget_max: next.budgetMax, room_type: next.roomType, area: next.area, furnished: next.furnished }).catch((error) => onError(error.message))
      return next
    })
  }

  const handleSearch = (event) => {
    event.preventDefault()
    const nextParams = new URLSearchParams(searchParams)
    if (searchTerm.trim()) nextParams.set('search', searchTerm.trim())
    else nextParams.delete('search')
    setSearchParams(nextParams)
  }

  const clearSearch = () => {
    setSearchTerm('')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('search')
    setSearchParams(nextParams)
  }

  return (
    <div className="container page-inner">
      <section className="page-hero">
        <div><span className="eyebrow">Find a Flat</span><h1>Student homes near your campus.</h1></div>
      </section>

      <div className="listing-layout">
        <aside className="filter-panel">
          <div className="panel-block">
            <h3>Budget</h3>
            <input type="range" min="5000" max="12000" step="500" value={preferences.budgetMax} onChange={(event) => updatePreference('budgetMax', Number(event.target.value))} />
            <div className="range-label"><span>₹5k</span><strong>₹{formatCurrency(budgetLimit)}</strong></div>
          </div>

          <div className="panel-block">
            <label>
              Area
              <select value={preferences.area} onChange={(event) => updatePreference('area', event.target.value)}>
                <option value="Any">Any area</option>
                <option value="Chandapura">Chandapura</option>
                <option value="Anekal">Anekal</option>
              </select>
            </label>
          </div>

          <div className="panel-block">
            <label>
              Room type
              <select value={preferences.roomType} onChange={(event) => updatePreference('roomType', event.target.value)}>
                <option value="Any">Any</option>
                <option value="Single Room">Single Room</option>
                <option value="2 Bedrooms">2 Bedrooms</option>
              </select>
            </label>
          </div>

          <div className="panel-block">
            <label>
              Furnishing
              <select value={preferences.furnished} onChange={(event) => updatePreference('furnished', event.target.value)}>
                <option value="Any">Any</option>
                <option value="Fully Furnished">Fully Furnished</option>
                <option value="Unfurnished">Unfurnished</option>
              </select>
            </label>
          </div>
        </aside>

        <div className="content-column">
          <form className="listing-search" onSubmit={handleSearch}>
            <Search size={18} aria-hidden="true" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by area or property name"
              aria-label="Search listings"
            />
            {searchTerm && <button type="button" className="search-clear" onClick={clearSearch}>Clear</button>}
            <button type="submit" className="button button-dark button-small">Search</button>
          </form>
          <div className="results-header">
            <h2>{filteredProperties.length} homes available</h2>
            <span>{searchTerm ? `Showing matches for “${searchTerm}”.` : 'Updated for your budget and routines.'}</span>
          </div>

          {filteredProperties.length ? (
            <div className="property-grid">
              {filteredProperties.map((property) => (
                <PropertyCard key={property.id} property={property} saved={savedProperties.includes(property.id)} onToggleSave={toggleSaveProperty} />
              ))}
            </div>
          ) : (
            <div className="empty-state search-empty">
              <Search size={24} />
              <h3>No homes match those filters.</h3>
              <p>Try a different area, a wider budget, or clear the search to see every available listing.</p>
              <button type="button" className="button button-dark" onClick={() => {
                clearSearch()
                setPreferences((current) => ({ ...current, budgetMax: 12000, area: 'Any', roomType: 'Any', furnished: 'Any' }))
              }}>Reset search</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PropertyDetailsPage({ properties, savedProperties, toggleSaveProperty, addVisit }) {
  const { id } = useParams()
  const property = properties.find((entry) => entry.id === id)
  const [isVisitOpen, setIsVisitOpen] = useState(false)
  const [visitDate, setVisitDate] = useState('2026-10-02')
  const [visitTime, setVisitTime] = useState('11:00')

  if (!property) return <NotFoundPage />

  const isSaved = savedProperties.includes(property.id)
  const deposit = property.deposit || property.rent * 3
  const description = property.description || `${property.name} offers a comfortable student room in ${property.location}, with practical amenities and easy access to campus.`
  const roommates = property.roommates || 1
  const moveInDate = property.moveInDate || 'Available soon'
  const landlord = property.landlord || 'Property owner'

  return (
    <div className="container page-inner detail-page">
      <section className="property-header-row">
        <div><span className="eyebrow">Property details</span><h1>{property.name}</h1></div>
        <button type="button" className={`button ${isSaved ? 'button-light' : 'button-dark'}`} onClick={() => toggleSaveProperty(property.id)}>
          <Heart size={16} fill={isSaved ? 'currentColor' : 'none'} />
          {isSaved ? 'Saved' : 'Save listing'}
        </button>
      </section>

      <div className="gallery-grid">
        {property.images.map((image, index) => (
          <img key={`${property.id}-${index}`} src={image} alt={`${property.name} view ${index + 1}`} className={index === 0 ? 'gallery-main' : 'gallery-thumb'} />
        ))}
      </div>

      <div className="detail-layout">
        <div className="detail-main">
          <div className="info-card">
            <div className="info-row">
              <div><small>Rent</small><strong>₹{formatCurrency(property.rent)}/month</strong></div>
              <div><small>Deposit</small><strong>₹{formatCurrency(deposit)}</strong></div>
            </div>

            <div className="meta-pills">
              <span><MapPin size={14} /> {property.location}</span>
              <span><Compass size={14} /> {property.distance} km from campus</span>
            </div>

            <p>{description}</p>
            <div className="amenity-list detail-list">{property.amenities.map((item) => <span key={item}>{item}</span>)}</div>
          </div>

          <div className="info-card">
            <h3>Room details</h3>
            <ul className="detail-list-items">
              <li><BedDouble size={16} /> {property.roomType}</li>
              <li><Bath size={16} /> {property.furnished}</li>
              <li><UserRound size={16} /> Up to {roommates} roommates</li>
              <li><CalendarDays size={16} /> Move-in: {moveInDate}</li>
            </ul>
          </div>
        </div>

        <aside className="detail-side">
          <div className="info-card sticky-card">
            <div className="landlord-profile">
              <div className="avatar-badge">{landlord.charAt(0)}</div>
              <div><strong>{landlord}</strong><small>Property owner</small></div>
            </div>
            <div className="contact-block">
              <span><Building2 size={14} /> {property.university}</span>
              <span><Wallet size={14} /> ₹{formatCurrency(property.rent)} / month</span>
            </div>
            <button type="button" className="button button-dark" onClick={() => setIsVisitOpen(true)}>Schedule a visit</button>
            <a href={`tel:${property.contact || ''}`} className="button button-light">Call landlord</a>
          </div>
        </aside>
      </div>

      <Modal open={isVisitOpen} title="Schedule a visit" onClose={() => setIsVisitOpen(false)}>
        <div className="modal-body">
          <label>
            Date
            <input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} />
          </label>
          <label>
            Time
            <input type="time" value={visitTime} onChange={(event) => setVisitTime(event.target.value)} />
          </label>
          <button type="button" className="button button-dark" onClick={() => { addVisit(property, visitDate, visitTime); setIsVisitOpen(false) }}>Confirm visit</button>
        </div>
      </Modal>
    </div>
  )
}

function FindFlatmatePage({ flatmates, onConnect }) {
  const [budget, setBudget] = useState(15000)
  const [area, setArea] = useState('Any')
  const [lifestyle, setLifestyle] = useState('Any')
  const filteredFlatmates = flatmates.filter((flatmate) => (
    flatmate.budget.min <= budget
    && (area === 'Any' || flatmate.preferredAreas.includes(area))
    && (lifestyle === 'Any' || flatmate.lifestyle === lifestyle)
  ))

  return (
    <div className="container page-inner">
      <section className="page-hero"><div><span className="eyebrow">Find a Flatmate</span><h1>Meet people who match your routines.</h1></div></section>
      <div className="flatmate-filter-panel">
        <label>
          Max budget
          <input type="range" min="7000" max="16000" step="500" value={budget} onChange={(event) => setBudget(Number(event.target.value))} />
          <strong>₹{formatCurrency(budget)} / month</strong>
        </label>
        <label>
          Preferred area
          <select value={area} onChange={(event) => setArea(event.target.value)}>
            <option value="Any">Any area</option>
            <option value="Chandapura">Chandapura</option>
            <option value="Anekal">Anekal</option>
          </select>
        </label>
        <label>
          Lifestyle
          <select value={lifestyle} onChange={(event) => setLifestyle(event.target.value)}>
            <option value="Any">Any lifestyle</option>
            <option value="Balanced">Balanced</option>
            <option value="Social">Social</option>
            <option value="Moderate">Moderate</option>
            <option value="Easygoing">Easygoing</option>
            <option value="Calm">Calm</option>
          </select>
        </label>
      </div>
      <div className="results-header flatmate-results-header">
        <h2>{filteredFlatmates.length} people available</h2>
        <span>Adjust the filters to find a better routine match.</span>
      </div>
      {filteredFlatmates.length ? (
        <div className="flatmate-grid">{filteredFlatmates.map((flatmate) => <FlatmateCard key={flatmate.id} flatmate={flatmate} onConnect={onConnect} />)}</div>
      ) : (
        <div className="empty-state search-empty">
          <h3>No flatmates match these filters.</h3>
          <p>Try increasing the budget or choosing a wider area.</p>
          <button type="button" className="button button-dark" onClick={() => { setBudget(15000); setArea('Any'); setLifestyle('Any') }}>Reset filters</button>
        </div>
      )}
    </div>
  )
}

function FlatmateProfilePage({ flatmates, onConnect }) {
  const { id } = useParams()
  const flatmate = flatmates.find((entry) => entry.id === id)

  if (!flatmate) return <NotFoundPage />

  return (
    <div className="container page-inner detail-page">
      <section className="profile-layout">
        <div className="profile-visual">
          {flatmate.profileImage ? <img src={flatmate.profileImage} alt={flatmate.name} /> : <div className="profile-initials">{flatmate.name.slice(0, 1)}</div>}
        </div>

        <div className="profile-details">
          <span className="eyebrow">Flatmate profile</span>
          <h1>{flatmate.name}</h1>
          <p className="profile-summary">{flatmate.about}</p>

          <div className="profile-meta-row">
            <span>{flatmate.course}</span>
            <span>{flatmate.university}</span>
            <span>{flatmate.age} years old</span>
          </div>

          <MatchScore score={flatmate.compatibility} />

          <div className="profile-facts-grid">
            <div className="fact-item"><Clock3 size={16} /><span>{flatmate.sleep}</span></div>
            <div className="fact-item"><MoonStar size={16} /><span>{flatmate.studyStyle}</span></div>
            <div className="fact-item"><Sparkles size={16} /><span>{flatmate.lifestyle}</span></div>
            <div className="fact-item"><Heart size={16} /><span>{flatmate.food}</span></div>
          </div>

          <div className="breakdown-grid">
            {Object.entries(flatmate.matchBreakdown).map(([key, value]) => (
              <div key={key} className="breakdown-item">
                <div className="breakdown-label"><span>{key}</span><strong>{value}%</strong></div>
                <div className="progress-track"><span style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
          <div className="profile-actions">
            <button type="button" className="button button-dark" onClick={() => onConnect(flatmate.id)}>Connect</button>
            {flatmate.phone && (
              <a
                href={`https://wa.me/91${flatmate.phone}`}
                target="_blank"
                rel="noreferrer"
                className="button button-whatsapp"
              >
                <MessageCircle size={16} /> Open WhatsApp
              </a>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function LoginPage({ setUser }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const identifier = formData.get('email')
    const password = formData.get('password')

    if (!identifier || !password) return
    try {
      const result = await api.login({ email: identifier, password })
      setToken(result.access_token)
      const currentUser = await api.me()
      setUser(mapUser(currentUser))
      navigate('/dashboard')
    } catch (submitError) { setError(submitError.message) }
  }

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Welcome back</span>
        <h1>Login to your account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Email or username<input name="email" type="text" autoComplete="username" placeholder="you@student.com" required /></label>
          <label>Password<input name="password" type="password" placeholder="••••••••" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-dark">Login</button>
        </form>
        <p className="auth-note">New here? <Link to="/signup">Create an account</Link></p>
      </div>
    </div>
  )
}

function SignupPage({ setUser }) {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const fullName = formData.get('fullName')
    const email = formData.get('email')
    const university = formData.get('university')
    const password = formData.get('password')

    if (!fullName || !email || !university || !password) return
    try {
      const result = await api.register({ full_name: fullName, email, password, university, role: 'tenant' })
      setToken(result.access_token)
      const currentUser = await api.me()
      setUser(mapUser(currentUser))
      navigate('/dashboard')
    } catch (submitError) { setError(submitError.message) }
  }

  return (
    <div className="container auth-wrap">
      <div className="auth-card">
        <span className="eyebrow">Join the network</span>
        <h1>Create your student account</h1>
        <form className="auth-form" onSubmit={handleSubmit}>
          <label>Full name<input name="fullName" type="text" placeholder="Your name" required /></label>
          <label>University<input name="university" type="text" placeholder="Your campus" required /></label>
          <label>Email<input name="email" type="email" placeholder="student@campus.edu" required /></label>
          <label>Password<input name="password" type="password" placeholder="Create a password" required /></label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button type="submit" className="button button-dark">Sign up</button>
        </form>
      </div>
    </div>
  )
}

function DashboardPage({ user, visits, savedProperties }) {
  return (
    <div className="container page-inner">
      <section className="page-hero dashboard-header">
        <div><span className="eyebrow">Dashboard</span><h1>Welcome back, {user.fullName}.</h1></div>
        <Link to="/find-flat" className="button button-dark">Continue browsing</Link>
      </section>

      <div className="stats-grid dashboard-stats">
        <div className="stat-card compact-stat"><strong>{savedProperties.length}</strong><span>Saved homes</span></div>
        <div className="stat-card compact-stat"><strong>{visits.length}</strong><span>Upcoming visits</span></div>
        <div className="stat-card compact-stat"><strong>92%</strong><span>Compatibility score</span></div>
      </div>

      <div className="dashboard-grid">
        <div className="info-card">
          <h3>Profile snapshot</h3>
          <ul className="detail-list-items">
            <li><BadgeCheck size={16} /> Verified student</li>
            <li><Building2 size={16} /> {user.university}</li>
            <li><Wallet size={16} /> Budget target: ₹15,000</li>
          </ul>
        </div>

        <div className="info-card">
          <h3>Saved homes</h3>
          {savedProperties.length ? (
            <div className="mini-list">
              {savedProperties.slice(0, 3).map((property) => (
                <Link key={property.id} to={`/property/${property.id}`} className="mini-list-item"><span>{property.name}</span><ArrowRight size={14} /></Link>
              ))}
            </div>
          ) : <p>No saved homes yet.</p>}
        </div>
      </div>
    </div>
  )
}

function SavedPropertiesPage({ savedProperties, toggleSaveProperty }) {
  return (
    <div className="container page-inner">
      <section className="page-hero"><div><span className="eyebrow">Saved homes</span><h1>Your shortlist.</h1></div></section>
      {savedProperties.length ? (
        <div className="property-grid">
          {savedProperties.map((property) => <PropertyCard key={property.id} property={property} saved={true} onToggleSave={toggleSaveProperty} />)}
        </div>
      ) : (
        <div className="empty-state"><p>No homes saved yet. Start by browsing listings and saving the ones you like.</p><Link to="/find-flat" className="button button-dark">Browse listings</Link></div>
      )}
    </div>
  )
}

function MessagesPage({ messages, sendMessage }) {
  const [selectedId, setSelectedId] = useState(messages[0]?.id ?? '')
  const activeConversation = messages.find((conversation) => conversation.id === selectedId) || messages[0]

  return (
    <div className="container page-inner messages-layout">
      <aside className="conversation-list">
        {messages.map((conversation) => (
          <button key={conversation.id} type="button" className={`conversation-item ${conversation.id === activeConversation?.id ? 'active' : ''}`} onClick={() => setSelectedId(conversation.id)}>
            {conversation.profileImage ? <img src={conversation.profileImage} alt={conversation.name} /> : <span className="conversation-initials">{conversation.name.slice(0, 1)}</span>}
            <div><strong>{conversation.name}</strong><small>{conversation.preview}</small></div>
          </button>
        ))}
      </aside>

      <div className="conversation-panel">
        {activeConversation ? <ChatBox conversation={activeConversation} onSend={(text) => sendMessage(activeConversation.id, text)} /> : <div className="empty-state"><p>No conversations yet.</p></div>}
      </div>
    </div>
  )
}

function VisitsPage({ visits }) {
  return (
    <div className="container page-inner">
      <section className="page-hero"><div><span className="eyebrow">Visits</span><h1>Upcoming property viewings.</h1></div></section>
      <div className="visits-list">{visits.map((visit) => (
        <div key={visit.id} className="visit-card">
          <div><h3>{visit.property}</h3><p>{visit.location}</p></div>
          <div className="visit-meta"><span><CalendarDays size={14} /> {visit.date}</span><span><Clock3 size={14} /> {visit.time}</span></div>
          <div className="visit-status-row"><span className={`status-pill ${visit.status.toLowerCase()}`}>{visit.status}</span><small>{visit.contact}</small></div>
        </div>
      ))}</div>
    </div>
  )
}

function AboutAndHowItWorksPage() {
  return (
    <div className="container page-inner about-process-page">
      <motion.section
        className="about-process-hero"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
      >
        <div>
          <span className="eyebrow">About the experience</span>
          <h1>Clarity for your next chapter.</h1>
        </div>
        <p>Find verified student accommodation, compatible roommates and schedule-friendly property discovery in one focused place.</p>
      </motion.section>

      <section className="about-process-section">
        <div className="section-head">
          <div>
            <span className="eyebrow subtle">How it works</span>
            <h2>From search to move-in, without the noise.</h2>
          </div>
        </div>
        <div className="feature-grid process-grid">
          <motion.div className="feature-card process-card" whileHover={{ y: -6 }}><span className="step-number">01</span><h3>Set your preferences</h3><p>Choose your budget, area and room type to narrow the search instantly.</p></motion.div>
          <motion.div className="feature-card process-card" whileHover={{ y: -6 }}><span className="step-number">02</span><h3>Compare your options</h3><p>Review homes, compatibility scores and lifestyle fit before reaching out.</p></motion.div>
          <motion.div className="feature-card process-card" whileHover={{ y: -6 }}><span className="step-number">03</span><h3>Make it real</h3><p>Connect with a flatmate, schedule a visit and move forward with confidence.</p></motion.div>
        </div>
      </section>

      <motion.section className="about-values" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
        <div>
          <span className="eyebrow subtle">Built around student life</span>
          <h2>Less guesswork. More belonging.</h2>
        </div>
        <p>Every part of the experience is designed to make housing decisions feel simpler: honest details, useful filters and people who fit your routine.</p>
      </motion.section>
    </div>
  )
}

function NotFoundPage() {
  return (
    <div className="container page-inner">
      <div className="empty-state"><h1>Page not found</h1><p>The page you are looking for does not exist.</p><Link to="/" className="button button-dark">Back home</Link></div>
    </div>
  )
}

export default App
