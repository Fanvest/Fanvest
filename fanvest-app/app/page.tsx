'use client'

import { useState } from 'react'
import { 
  Home as HomeIcon, 
  Search, 
  Info, 
  Mail, 
  Menu, 
  X,
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Shield,
  Wallet
} from 'lucide-react'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    { name: 'Accueil', href: '/', icon: HomeIcon },
    { name: 'Découvrir', href: '/discover', icon: Search },
    { name: 'À propos', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Mail },
  ]

  const features = [
    {
      icon: TrendingUp,
      title: "Investissement Intelligent",
      description: "Découvrez les meilleures opportunités d'investissement"
    },
    {
      icon: Shield,
      title: "Sécurisé & Fiable",
      description: "Vos investissements sont protégés par la blockchain"
    },
    {
      icon: Sparkles,
      title: "Interface Moderne",
      description: "Une expérience utilisateur exceptionnelle"
    }
  ]

  return (
    <div className="gradient-bg min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#16001D]/95 backdrop-blur-xl border-b border-[#330051]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <img 
                src="/logo.svg" 
                alt="Fanvest" 
                className="h-8 w-auto"
              />
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-1">
                {navItems.map((item) => {
                  const Icon = item.icon
                  return (
                    <a
                      key={item.name}
                      href={item.href}
                      className="group relative px-4 py-2 rounded-full text-white/80 hover:text-white transition-all duration-200"
                    >
                      <div className="flex items-center space-x-2">
                        <Icon size={16} className="group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-medium">{item.name}</span>
                      </div>
                    </a>
                  )
                })}
              </div>
            </div>

            {/* Auth Button */}
            <div className="hidden md:flex items-center space-x-4">
              <button className="bg-gradient-to-r from-[#FA0089] to-[#330051] text-white px-6 py-2 rounded-full font-medium shadow-lg hover:shadow-xl transition-all duration-200 flex items-center space-x-2">
                <Wallet size={16} />
                <span>Se connecter</span>
              </button>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="text-white p-2 rounded-full hover:bg-white/10 transition-colors"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-[#16001D]/95 backdrop-blur-xl border-t border-[#330051]/30">
            <div className="px-4 py-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <Icon size={20} />
                    <span className="font-medium">{item.name}</span>
                  </a>
                )
              })}
              
              <div className="pt-4 border-t border-[#330051]/30">
                <button className="flex items-center justify-center space-x-2 w-full bg-gradient-to-r from-[#FA0089] to-[#330051] text-white px-6 py-3 rounded-lg font-medium shadow-lg">
                  <Wallet size={20} />
                  <span>Se connecter</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <div className="max-w-6xl mx-auto text-center">
          {/* Main Hero Content */}
          <div className="mb-16">
            <div className="mb-8">
              <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-[#FA0089]/20 to-[#330051]/20 backdrop-blur-lg rounded-full px-6 py-3 border border-[#FA0089]/30 mb-8">
                <Sparkles size={16} className="text-[#FA0089]" />
                <span className="text-white/90 text-sm font-medium">
                  Plateforme d'investissement nouvelle génération
                </span>
              </div>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              Investissez dans
              <br />
              <span className="bg-gradient-to-r from-[#FA0089] to-[#330051] bg-clip-text text-transparent">
                l'avenir
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Découvrez une nouvelle façon d'investir avec Fanvest. 
              Sécurisé, moderne et accessible à tous.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <button className="bg-gradient-to-r from-[#FA0089] to-[#330051] text-white px-8 py-4 rounded-full font-semibold text-lg shadow-2xl hover:shadow-[#FA0089]/25 transition-all duration-300 flex items-center space-x-2 group">
                <span>Commencer maintenant</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button className="border-2 border-white/30 text-white px-8 py-4 rounded-full font-semibold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm">
                En savoir plus
              </button>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-[#FA0089]/30 transition-all duration-300 group hover:-translate-y-2"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-[#FA0089] to-[#330051] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <Icon size={28} className="text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-white/70 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
