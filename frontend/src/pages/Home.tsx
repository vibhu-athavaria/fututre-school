import React from 'react';
import {
  BookOpen,
  Users,
  Trophy,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Award,
  Star,
  CheckCircle2,
  ArrowRight,
  Play,
  Zap,
  Brain,
  Heart,
  ClipboardList
} from 'lucide-react';

export const Home: React.FC = () => {
  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Learning',
      description: 'Smart lessons that adapt to your child\'s unique learning style and pace.',
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
    },
    {
      icon: Target,
      title: 'Diagnostic Assessments',
      description: 'Find strengths and areas to improve with detailed performance insights.',
      color: 'from-purple-500 to-pink-500',
      bgColor: 'bg-purple-50',
      borderColor: 'border-purple-200',
    },
    {
      icon: Trophy,
      title: 'Gamified Experience',
      description: 'Earn rewards, unlock achievements, and make learning an adventure!',
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-200',
    },
    {
      icon: Users,
      title: 'Parent Dashboard',
      description: 'Track progress, view reports, and support your child\'s journey.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
    },
  ];

  const subjects = [
    { name: 'Math', icon: '📐', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { name: 'Science', icon: '🔬', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { name: 'English', icon: '📚', color: 'bg-green-100 text-green-700 border-green-300' },
    { name: 'Humanities', icon: '🌍', color: 'bg-orange-100 text-orange-700 border-orange-300' },
  ];

  const stats = [
    { number: '10,000+', label: 'Happy Students', icon: Users },
    { number: '95%', label: 'Success Rate', icon: TrendingUp },
    { number: '50+', label: 'Learning Paths', icon: Target },
    { number: '4.9/5', label: 'Parent Rating', icon: Star },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Take Diagnostic Test',
      description: 'Quick assessment to find your current level',
      icon: ClipboardList,
      color: 'blue',
    },
    {
      step: 2,
      title: 'Get Personalized Plan',
      description: 'AI creates a custom learning path just for you',
      icon: Sparkles,
      color: 'purple',
    },
    {
      step: 3,
      title: 'Learn & Practice',
      description: 'Watch videos, solve problems, and master topics',
      icon: BookOpen,
      color: 'green',
    },
    {
      step: 4,
      title: 'Track Progress',
      description: 'See your growth and celebrate achievements',
      icon: Award,
      color: 'orange',
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-blue-600 pt-20 pb-32 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-60 h-60 bg-purple-300/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/4 w-32 h-32 bg-blue-300/20 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-white font-medium">AI-Powered Personalized Learning</span>
            </div>

            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
              Every Child Deserves to
              <br />
              <span className="inline-block bg-white text-transparent bg-clip-text">
                Learn, Grow & Succeed
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
              Future School makes learning fun for students ages <strong className="text-white">7-14</strong> with
              personalized lessons, engaging videos, and smart assessments.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <a
                href="/signup"
                className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
              >
                Start Learning Free
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/demo"
                className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-2 border-white/30 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg flex items-center justify-center gap-2"
              >
                <Play className="w-5 h-5" />
                Watch Demo
              </a>
            </div>

            {/* Subject Badges */}
            <div className="flex flex-wrap justify-center gap-3">
              {subjects.map((subject) => (
                <div
                  key={subject.name}
                  className={`${subject.color} px-4 py-2 rounded-lg font-semibold border-2 backdrop-blur-sm shadow-lg`}
                >
                  <span className="mr-2">{subject.icon}</span>
                  {subject.name}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave Divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#EFF6FF"
            />
          </svg>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg transition-all text-center"
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1">{stat.number}</div>
                  <div className="text-sm text-gray-600">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-blue-100 px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-blue-600" />
              <span className="text-blue-600 font-semibold">Powerful Features</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Everything Your Child Needs to Excel
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our comprehensive platform combines cutting-edge AI with proven teaching methods
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={index}
                  className={`${feature.bgColor} border-2 ${feature.borderColor} rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group`}
                >
                  <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-full mb-4">
              <Target className="w-4 h-4 text-purple-600" />
              <span className="text-purple-600 font-semibold">Simple Process</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              How Future School Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes and watch your child thrive
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
            {howItWorks.map((item, index) => {
              const Icon = item.icon;
              const colorClasses = {
                blue: { bg: 'bg-blue-500', light: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
                purple: { bg: 'bg-purple-500', light: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-600' },
                green: { bg: 'bg-green-500', light: 'bg-green-50', border: 'border-green-200', text: 'text-green-600' },
                orange: { bg: 'bg-orange-500', light: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
              }[item.color];

              return (
                <div key={index} className="relative">
                  {/* Connector Line */}
                  {index < howItWorks.length - 1 && (
                    <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gray-200 -z-10"></div>
                  )}

                  <div className={`${colorClasses.light} border-2 ${colorClasses.border} rounded-2xl p-6 text-center hover:shadow-xl transition-all`}>
                    <div className={`w-12 h-12 ${colorClasses.bg} rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                      <span className="text-white font-bold text-lg">{item.step}</span>
                    </div>
                    <div className={`w-16 h-16 ${colorClasses.light} rounded-xl flex items-center justify-center mx-auto mb-4 border-2 ${colorClasses.border}`}>
                      <Icon className={`w-8 h-8 ${colorClasses.text}`} />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                    <p className="text-gray-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-green-100 px-4 py-2 rounded-full mb-4">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-green-600 font-semibold">Why Parents Love Us</span>
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Built for Success, Designed for Joy
              </h2>
              <ul className="space-y-4">
                {[
                  'Personalized learning paths for every student',
                  'Detailed progress reports and analytics',
                  'Safe, monitored learning environment',
                  'Expert-designed curriculum aligned with standards',
                  'Engaging video lessons and interactive quizzes',
                  'Real-time parent notifications and insights',
                ].map((benefit, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700 text-lg">{benefit}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-500 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-xl p-6 mb-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full"></div>
                    <div>
                      <div className="font-bold text-gray-900">Sarah M.</div>
                      <div className="text-sm text-gray-600">Parent of 2 students</div>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    ))}
                  </div>
                  <p className="text-gray-700 italic">
                    &ldquo;My kids actually look forward to learning now! The progress reports
                    help me support them better. Best investment we&apos;ve made.&rdquo;
                  </p>
                </div>
                <div className="grid grid-cols-3 gap-4 text-white text-center">
                  <div>
                    <div className="text-3xl font-bold">98%</div>
                    <div className="text-sm opacity-90">Improvement</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">45min</div>
                    <div className="text-sm opacity-90">Avg. Daily</div>
                  </div>
                  <div>
                    <div className="text-3xl font-bold">A+</div>
                    <div className="text-sm opacity-90">Results</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-20"></div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Transform Your Child&apos;s Learning?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of families already learning smarter with Future School.
            Start your free trial today – no credit card required!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="group bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl text-lg font-bold transition-all duration-200 transform hover:scale-105 shadow-2xl flex items-center justify-center gap-2"
            >
              Start Free Trial
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
            </a>
            <a
              href="/contact"
              className="bg-white/10 backdrop-blur-sm text-white hover:bg-white/20 border-2 border-white/30 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-200 shadow-lg"
            >
              Talk to Our Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};