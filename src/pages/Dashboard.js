import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DatabaseService } from '../services/database';
import { 
  BriefcaseIcon, 
  UsersIcon, 
  ClipboardDocumentListIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  PlusIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';
import { STAGE_LABELS } from '../types';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card.jsx';
import { Badge } from '../components/ui/badge.jsx';
import { Button } from '../components/ui/button.jsx';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '../components/ui/chart.jsx';
import { CartesianGrid, Line, LineChart, XAxis } from 'recharts';
import { motion } from 'framer-motion';

const pageFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: 'easeOut' } },
};

const list = {
  hidden: { opacity: 1 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.04 },
  },
};

const item = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
};

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    totalCandidates: 0,
    recentCandidates: [],
    stageDistribution: {},
  });
  const [loading, setLoading] = useState(true);

  const workforceData = [
    { month: "Jan", applications: 186, hires: 12 },
    { month: "Feb", applications: 305, hires: 18 },
    { month: "Mar", applications: 237, hires: 15 },
    { month: "Apr", applications: 273, hires: 22 },
    { month: "May", applications: 209, hires: 16 },
    { month: "Jun", applications: 314, hires: 28 },
  ];

  const chartConfig = {
    applications: {
      label: "Applications",
      color: "#3b82f6",
    },
    hires: {
      label: "Hires",
      color: "#10b981",
    },
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [jobStats, candidateStats, recentCandidates] = await Promise.all([
        DatabaseService.getStats(),
        DatabaseService.getCandidates({}),
        DatabaseService.getCandidates({}).then(candidates => 
          candidates.slice(0, 5)
        ),
      ]);

      const stageDistribution = candidateStats.reduce((acc, candidate) => {
        acc[candidate.stage] = (acc[candidate.stage] || 0) + 1;
        return acc;
      }, {});

      const activeJobs = await DatabaseService.getJobs({ status: 'active' });

      setStats({
        totalJobs: jobStats.jobs,
        activeJobs: activeJobs.length,
        totalCandidates: jobStats.candidates,
        recentCandidates,
        stageDistribution,
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      name: 'Total Jobs',
      value: stats.totalJobs,
      icon: BriefcaseIcon,
      href: '/jobs',
      description: 'All posted positions',
      trend: '+12%',
    },
    {
      name: 'Active Jobs',
      value: stats.activeJobs,
      icon: ArrowTrendingUpIcon,
      href: '/jobs?status=active',
      description: 'Currently hiring',
      trend: '+8%',
    },
    {
      name: 'Total Candidates',
      value: stats.totalCandidates,
      icon: UsersIcon,
      href: '/candidates',
      description: 'In pipeline',
      trend: '+24%',
    },
    {
      name: 'Assessments',
      value: stats.totalCandidates > 0 ? Math.floor(stats.totalCandidates / 3) : 0,
      icon: ClipboardDocumentListIcon,
      href: '/assessments',
      description: 'Completed this week',
      trend: '+16%',
    },
    {
      name: 'Reports',
      value: stats.totalJobs + stats.totalCandidates,
      icon: ChartBarIcon,
      href: '/candidates',
      description: 'Analytics generated',
      trend: '+5%',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <motion.div
      className="h-full flex flex-col"
      initial={pageFade.initial}
      animate={pageFade.animate}
    >
      {/* Header with Buttons */}
      <div className="flex justify-between items-center mb-2">
        <div className="flex-1">
          {/* Breadcrumb */}
          <div className="flex items-center text-sm text-muted-foreground mb-2">
            <span>Dashboard</span>
            <span className="mx-2">/</span>
            <span>Overview</span>
          </div>
        </div>
        <div className="flex items-center space-x-1.5">
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button asChild variant="outline" size="sm" className="h-7 px-2 text-xs border-border">
              <Link to="/candidates" className="flex items-center">
                <UserPlusIcon className="h-3 w-3 mr-1" />
                Add Candidate
              </Link>
            </Button>
          </motion.div>
          <motion.div whileTap={{ scale: 0.98 }}>
            <Button asChild size="sm" className="h-7 px-1 text-xs bg-[#1f1687] hover:bg-[#161357]">
              <Link to="/jobs" className="flex items-center text-white">
                <PlusIcon className="h-3 w-3 mr-1" />
                <span className='mr-2'>Create Job</span> 
              </Link>
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Separator Line-Full Width */}
      <hr className="border-t border-border mb-6 -mx-6" />
      
      {/* Title Section */}
      <motion.div variants={item} initial="hidden" animate="show" className="mb-6 text-left">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-left">Dashboard</h1>
        <p className="text-muted-foreground text-left">
          Overview of your hiring pipeline and recent activity
        </p>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        className="grid gap-4 md:grid-cols-3 lg:grid-cols-5 mb-8"
        variants={list}
        initial="hidden"
        animate="show"
      >
        {statCards.map((stat) => (
          <motion.div
            key={stat.name}
            variants={item}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.995 }}
          >
            <Card className="relative overflow-hidden border-l-2 border-r-2 border-b-2 border-t border-gray-300 rounded-lg h-32">
              {/* Header section with bg */}
              <div className="bg-gray-50 px-3 py-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-gray-700">
                    {stat.name}
                  </CardTitle>
                  <stat.icon className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              
              {/* Content section */}
              <CardContent className="p-3">
                <div className="text-xl font-bold text-gray-900 mb-1">{stat.value.toLocaleString()}</div>
                <p className="text-xs text-gray-500 mb-1">
                  {stat.description}
                </p>
                <p className="text-xs text-gray-500">
                  <span className="text-green-600 font-medium">{stat.trend}</span> vs last month
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid gap-8 lg:grid-cols-3 flex-1">
        {/* Workforce Overview - Left side, takes 2 columns */}
        <motion.div variants={item} initial="hidden" animate="show" className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div className="text-left">
                <CardTitle className="text-left">Workforce Overview</CardTitle>
                <p className="text-sm text-muted-foreground text-left">Track employee growth and attrition trends over time.</p>
              </div>
              <div className="flex space-x-2">
                <button className="px-3 py-1 text-sm bg-gray-100 text-foreground rounded-md border">Monthly</button>
                <button className="px-3 py-1 text-sm text-muted-foreground rounded-md hover:bg-gray-100 transition-colors">Yearly</button>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div style={{ width: '100%', height: '160px', marginTop: '29px' }}>
                <ChartContainer config={chartConfig}>
                  <LineChart
                    accessibilityLayer
                    data={workforceData}
                    margin={{
                      left: 12,
                      right: 12,
                      top: 12,
                      bottom: 12,
                    }}
                  >
                    <CartesianGrid vertical={false} />
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tickFormatter={(value) => value.slice(0, 3)}
                    />
                    <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                    <Line
                      dataKey="applications"
                      type="monotone"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      dataKey="hires"
                      type="monotone"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </div>
              <div className="flex w-full items-start gap-2 text-sm mt-10">
                <div className="grid gap-2">
                  <div className="flex items-center gap-2 leading-none font-medium">
                    Trending up by 12% this month <ArrowTrendingUpIcon className="h-4 w-4" />
                  </div>
                  <div className="text-muted-foreground flex items-center gap-2 leading-none">
                    Showing hiring trends for the last 6 months
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Side Pipeline Overview */}
        <motion.div variants={item} initial="hidden" animate="show" className="h-fit">
          <Card className="h-fit">
            <CardHeader className="pb-3 text-left">
              <CardTitle className="text-lg text-left">Pipeline Overview</CardTitle>
              <p className="text-sm text-muted-foreground text-left">Distribution of employees by status and department.</p>
            </CardHeader>
            <CardContent className="space-y-5 pb-4">
              {/* Color indicators */}
              <div className="flex gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#1f1687]"></div>
                <div className="w-10 h-10 rounded-lg bg-blue-500"></div>
                <div className="w-10 h-10 rounded-lg bg-blue-300"></div>
                <div className="w-10 h-10 rounded-lg bg-gray-500"></div>
                <div className="w-10 h-10 rounded-lg bg-gray-300"></div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center border-b pb-2">
                  <span className="text-sm font-semibold">Details</span>
                  <span className="text-sm text-muted-foreground font-medium">6 Month</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-[#1f1687]"></div>
                      <span className="text-sm font-medium">Rejected</span>
                    </div>
                    <span className="text-sm font-semibold">4232</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-sm font-medium">Phone Screen</span>
                    </div>
                    <span className="text-sm font-semibold">300</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-blue-300"></div>
                      <span className="text-sm font-medium">Technical Interview</span>
                    </div>
                    <span className="text-sm font-semibold">180</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-500"></div>
                      <span className="text-sm font-medium">Applied</span>
                    </div>
                    <span className="text-sm font-semibold">90</span>
                  </div>
                  
                  <div className="flex justify-between items-center py-1">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                      <span className="text-sm font-medium">Offer Extended</span>
                    </div>
                    <span className="text-sm font-semibold">65</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Candidates Section */}
      <div className="mt-8">
        <motion.div variants={item} initial="hidden" animate="show" className="shadow-sm">
          <Card className="shadow-sm">
            <CardHeader className="pb-4 text-left">
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <CardTitle className="text-xl font-semibold text-left">Recent Candidates</CardTitle>
                  <p className="text-sm text-muted-foreground mt-1 text-left">Latest candidate applications and updates</p>
                </div>
                <motion.div whileTap={{ scale: 0.98 }}>
                  <Button variant="outline" size="sm" asChild className="border-border">
                    <Link to="/candidates">View All</Link>
                  </Button>
                </motion.div>
              </div>
            </CardHeader>
            <CardContent>
              {stats.recentCandidates.length > 0 ? (
                <motion.div
                  className="space-y-3"
                  variants={list}
                  initial="hidden"
                  animate="show"
                >
                  {stats.recentCandidates.map((candidate) => (
                    <motion.div
                      key={candidate.id}
                      variants={item}
                      whileHover={{ y: -1 }}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-[#1f1687] flex items-center justify-center">
                          <span className="text-white font-medium text-sm">
                            {candidate.name?.charAt(0)?.toUpperCase() || 'N'}
                          </span>
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-medium text-foreground text-left text-sm">{candidate.name}</h4>
                          <p className="text-xs text-muted-foreground text-left">{candidate.email}</p>
                          <p className="text-xs text-muted-foreground text-left mt-0.5">Applied for {candidate.jobTitle}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <Badge 
                            variant="outline"
                            className={`text-xs border-0 ${
                              candidate.stage === 'hired' ? 'bg-emerald-100 text-emerald-800' :
                              candidate.stage === 'tech' ? 'bg-purple-100 text-purple-800' :
                              candidate.stage === 'offer' ? 'bg-green-100 text-green-800' :
                              candidate.stage === 'rejected' ? 'bg-red-100 text-red-800' :
                              candidate.stage === 'screen' ? 'bg-yellow-100 text-yellow-800' :
                              candidate.stage === 'applied' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {STAGE_LABELS[candidate.stage] || candidate.stage}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date().toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">No recent candidates</h3>
                  <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                    Get started by adding candidates to your recruitment pipeline and track their progress.
                  </p>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button asChild className="bg-blue-600 hover:bg-blue-700">
                      <Link to="/candidates">
                        <UserPlusIcon className="h-4 w-4 mr-2" />
                        Add First Candidate
                      </Link>
                    </Button>
                  </motion.div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
