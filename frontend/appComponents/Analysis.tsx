import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, AreaChart, Area } from "recharts";
import { useGlbState } from "@/frontend/utils/glbState";
import { MessageSquare, Heart, Share2, Image, Video, FileText, TrendingUp, Lock, Link, AtSign, Award, Zap, MapPin, Sparkles, Text, Trophy, Flame, BarChart3 } from "lucide-react";

interface StatsData {
    shuoshuoCount: number;
    shareCount: number;
    totalLikes: number;
    totalComments: number;
    totalFwds: number;
    totalImages: number;
    totalVideos: number;
    monthData: { [key: number]: number };
    yearData: { [key: number]: number };
    avgLikes: number;
    avgComments: number;
    avgFwds: number;
    secretCount: number;
    withLbsCount: number;
    withLinkCount: number;
    withAtCount: number;
    mostActiveYear: number;
    mostActiveMonth: string;
    mostActiveHour: number;
    mostActiveWeekday: string;
    totalDays: number;
    firstPostDate: string;
    lastPostDate: string;
    topShareSources: { name: string; count: number }[];
    likesDistribution: { range: string; count: number }[];
    hourlyDistribution: { hour: number; count: number }[];
    weekdayDistribution: { day: string; count: number }[];
    yearlyComparison: { year: number; shuoshuo: number; share: number }[];
    contentTypeDist: { type: string; count: number; percentage: number }[];
    avgContentLength: number;
    longestPost: { content: string; length: number; date: string } | null;
    avgImagesPerPost: number;
    avgVideosPerPost: number;
    longestStreak: number;
    currentStreak: number;
    topLikedPosts: { content: string; likes: number; date: string }[];
    topCommentedPosts: { content: string; comments: number; date: string }[];
    yearlyGrowth: { year: number; growth: number }[];
    monthlyTopList: { month: string; count: number }[];
    emojiStats: { emoji: string; count: number }[];
};

const defaultStats: StatsData = {
    shuoshuoCount: 0,
    shareCount: 0,
    totalLikes: 0,
    totalComments: 0,
    totalFwds: 0,
    totalImages: 0,
    totalVideos: 0,
    monthData: {},
    yearData: {},
    avgLikes: 0,
    avgComments: 0,
    avgFwds: 0,
    secretCount: 0,
    withLbsCount: 0,
    withLinkCount: 0,
    withAtCount: 0,
    mostActiveYear: 0,
    mostActiveMonth: '',
    mostActiveHour: -1,
    mostActiveWeekday: '',
    totalDays: 0,
    firstPostDate: '',
    lastPostDate: '',
    topShareSources: [],
    likesDistribution: [],
    hourlyDistribution: [],
    weekdayDistribution: [],
    yearlyComparison: [],
    contentTypeDist: [],
    avgContentLength: 0,
    longestPost: null,
    avgImagesPerPost: 0,
    avgVideosPerPost: 0,
    longestStreak: 0,
    currentStreak: 0,
    topLikedPosts: [],
    topCommentedPosts: [],
    yearlyGrowth: [],
    monthlyTopList: [],
    emojiStats: [],
};

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

const chartConfig = {
    count: { label: '数量', color: '#3b82f6' },
    shuoshuo: { label: '说说', color: '#3b82f6' },
    share: { label: '分享', color: '#10b981' },
} satisfies ChartConfig;

function StatCard({ title, value, icon: Icon, color }: { title: string; value: number | string; icon: React.ElementType; color: string }) {
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="flex items-center gap-3 py-3 px-4">
                            <div className={`p-2 rounded-lg ${color}`}>
                                <Icon className="size-4" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-xs text-muted-foreground">{title}</p>
                                <p className="text-xl font-semibold truncate">{typeof value === 'number' ? value.toLocaleString() : value}</p>
                            </div>
                        </CardContent>
                    </Card>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                    <p>{title}: {typeof value === 'number' ? value.toLocaleString() : value}</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
};

function LoadingSkeleton() {
    return (
        <div className="flex flex-col gap-4 overflow-x-hidden">
            <div className="flex items-center justify-between">
                <Skeleton className="h-7 w-24" />
                <Skeleton className="h-4 w-40" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[60px]" />
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className="h-[60px]" />
                ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Skeleton key={i} className="h-[60px]" />
                ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <Skeleton className="h-[250px]" />
                <Skeleton className="h-[250px]" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-[200px]" />
                ))}
            </div>
        </div>
    );
};

function formatMonthKey(key: number): string {
    const year = Math.floor(key / 100);
    const month = key % 100;
    return `${year}/${month.toString().padStart(2, '0')}`;
};

export default function Analysis() {
    const [glbState] = useGlbState();
    const [stats, setStats] = useState<StatsData>(defaultStats);
    const [loading, setLoading] = useState(true);
    const [timeView, setTimeView] = useState<'month' | 'year'>('month');
    const serverUrl = glbState.serverUrl;

    const fetchData = useCallback(async () => {
        if (!serverUrl) {
            setLoading(false);
            return;
        }
        setLoading(true);
        try {
            const baseFilter = { type: 'both' as const, secret: false, hasLbs: false, withLink: false, withAt: false, content: '' };
            const [shuoshuoRes, shareRes, monthDateData, shareSourcesRes] = await Promise.all([
                fetch(serverUrl + '/api/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filter: { ...baseFilter, type: 'shuoshuo' }, range: [0, 50000] }),
                }),
                fetch(serverUrl + '/api/get', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ filter: { ...baseFilter, type: 'share' }, range: [0, 50000] }),
                }),
                fetch(serverUrl + '/api/get/count', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ other: baseFilter, getRange: 'date' }),
                }),
                fetch(serverUrl + '/api/get/count', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ other: { ...baseFilter, type: 'share' }, getRange: 'shareSource' }),
                }),
            ]);
            const shuoshuoData = shuoshuoRes.ok ? await shuoshuoRes.json() : { list: [], total: 0 };
            const shareData = shareRes.ok ? await shareRes.json() : { list: [], total: 0 };
            const monthData = monthDateData.ok ? await monthDateData.json() : { count: {} };
            const shuoshuoList: shuoshuoType[] = shuoshuoData.list || [];
            const shareList: shareType[] = shareData.list || [];
            const allList = [...shuoshuoList, ...shareList];
            const totalLikes = allList.reduce((sum, p) => sum + (p.like_total || 0), 0);
            const totalComments = allList.reduce((sum, p) => sum + (p.comment_total || 0), 0);
            const totalFwds = shuoshuoList.reduce((sum, p) => sum + (p.fwd_num || 0), 0);
            const totalImages = allList.reduce((sum, p) => sum + (p.image_total || 0), 0);
            const totalVideos = shuoshuoList.reduce((sum, p) => sum + (p.video_total || 0), 0);
            const secretCount = shuoshuoList.filter(p => p.secret).length;
            const withLbsCount = shuoshuoList.filter(p => p.lbs?.name).length;
            const withLinkCount = allList.filter(p => p.content?.includes('http') || p.content?.includes('链接')).length;
            const withAtCount = allList.filter(p => p.content?.includes('@')).length;
            const totalCount = allList.length || 1;
            const yearData: { [key: number]: number } = {};
            Object.entries(monthData.count || {}).forEach(([k, v]) => {
                const year = Math.floor(Number(k) / 100);
                yearData[year] = (yearData[year] || 0) + (v as number);
            });
            const timestamps = allList.map(p => (p.created_time || 0) * 1000).filter(t => t > 0);
            const sortedTimestamps = [...timestamps].sort((a, b) => a - b);
            const firstTs = sortedTimestamps[0];
            const lastTs = sortedTimestamps.length > 0 ? sortedTimestamps[sortedTimestamps.length - 1] : null;
            const firstPostDate = firstTs ? new Date(firstTs).toLocaleDateString('zh-CN') : '';
            const lastPostDate = lastTs ? new Date(lastTs).toLocaleDateString('zh-CN') : '';
            const uniqueDays = new Set(timestamps.map(t => new Date(t).toDateString()));
            const totalDays = uniqueDays.size;
            const yearEntries = Object.entries(yearData);
            const mostActiveYearEntry = yearEntries.sort((a, b) => b[1] - a[1])[0];
            const mostActiveYear = mostActiveYearEntry ? Number(mostActiveYearEntry[0]) : 0;
            const monthEntries = Object.entries(monthData.count || {});
            const mostActiveMonthEntry = monthEntries.sort((a, b) => (b[1] as number) - (a[1] as number))[0];
            const mostActiveMonth = mostActiveMonthEntry ? formatMonthKey(Number(mostActiveMonthEntry[0])) : '';
            const sourceCounts: { [key: string]: number } = {};
            shareList.forEach(p => {
                const source = p.share_source?.from?.name || '未知';
                sourceCounts[source] = (sourceCounts[source] || 0) + 1;
            });
            const topShareSources = Object.entries(sourceCounts)
                .map(([name, count]) => ({ name, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 8);
            const likesBuckets = { '0': 0, '1-5': 0, '6-10': 0, '11-20': 0, '21-50': 0, '50+': 0 };
            allList.forEach(p => {
                const likes = p.like_total || 0;
                if (likes === 0) likesBuckets['0']++;
                else if (likes <= 5) likesBuckets['1-5']++;
                else if (likes <= 10) likesBuckets['6-10']++;
                else if (likes <= 20) likesBuckets['11-20']++;
                else if (likes <= 50) likesBuckets['21-50']++;
                else likesBuckets['50+']++;
            });
            const likesDistribution = Object.entries(likesBuckets).map(([range, count]) => ({ range, count }));
            const hourlyBuckets: number[] = Array(24).fill(0);
            allList.forEach(p => {
                const ts = p.created_time || 0;
                const hour = new Date(ts * 1000).getHours();
                hourlyBuckets[hour] = (hourlyBuckets[hour] || 0) + 1;
            });
            const hourlyDistribution = hourlyBuckets.map((count, hour) => ({ hour, count }));
            const weekdayNames = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
            const weekdayBuckets: number[] = Array(7).fill(0);
            allList.forEach(p => {
                const ts = p.created_time || 0;
                const day = new Date(ts * 1000).getDay();
                weekdayBuckets[day] = (weekdayBuckets[day] || 0) + 1;
            });
            const weekdayDistribution = weekdayBuckets.map((count, day) => ({ day: weekdayNames[day] || '未知', count }));
            const yearlyData: { [key: number]: { shuoshuo: number; share: number } } = {};
            shuoshuoList.forEach(p => {
                const ts = p.created_time || 0;
                const year = new Date(ts * 1000).getFullYear();
                if (!yearlyData[year]) yearlyData[year] = { shuoshuo: 0, share: 0 };
                const yd = yearlyData[year];
                if (yd) yd.shuoshuo++;
            });
            shareList.forEach(p => {
                const ts = p.created_time || 0;
                const year = new Date(ts * 1000).getFullYear();
                if (!yearlyData[year]) yearlyData[year] = { shuoshuo: 0, share: 0 };
                const yd = yearlyData[year];
                if (yd) yd.share++;
            });
            const yearlyComparison = Object.entries(yearlyData)
                .map(([year, data]) => ({ year: Number(year), ...data }))
                .sort((a, b) => a.year - b.year);
            const mostActiveHourEntry = hourlyBuckets.map((count, hour) => ({ hour, count })).sort((a, b) => b.count - a.count)[0];
            const mostActiveHour = mostActiveHourEntry ? mostActiveHourEntry.hour : -1;
            const mostActiveWeekdayEntry = weekdayBuckets.map((count, day) => ({ day: weekdayNames[day], count })).sort((a, b) => b.count - a.count)[0];
            const mostActiveWeekday = mostActiveWeekdayEntry ? mostActiveWeekdayEntry.day : '';
            const contentTypeDist = [
                { type: '纯文本', count: allList.filter(p => !(p.image_total || 0) && !(p.video_total || 0) && !p.content?.includes('http')).length, percentage: 0 },
                { type: '带图片', count: allList.filter(p => (p.image_total || 0) > 0).length, percentage: 0 },
                { type: '带视频', count: allList.filter(p => (p.video_total || 0) > 0).length, percentage: 0 },
                { type: '带链接', count: withLinkCount, percentage: 0 },
            ].map(item => ({ ...item, percentage: Math.round((item.count / totalCount) * 1000) / 10 }));
            const contentLengths = shuoshuoList.map(p => (p.content || '').length).filter(len => len > 0);
            const avgContentLength = contentLengths.length > 0 ? Math.round(contentLengths.reduce((a, b) => a + b, 0) / contentLengths.length) : 0;
            const longestPostEntry = shuoshuoList
                .map(p => ({ content: p.content || '', length: (p.content || '').length, date: p.created_time ? new Date(p.created_time * 1000).toLocaleDateString('zh-CN') : '' }))
                .filter(p => p.length > 0)
                .sort((a, b) => b.length - a.length)[0];
            const longestPost = longestPostEntry || null;
            const avgImagesPerPost = Math.round((totalImages / (shuoshuoList.length || 1)) * 10) / 10;
            const avgVideosPerPost = Math.round((totalVideos / (shuoshuoList.length || 1)) * 10) / 10;
            const sortedDates = [...new Set(allList.map(p => p.created_time ? new Date(p.created_time * 1000).toDateString() : '').filter(Boolean))].sort();
            let longestStreak = 0;
            let currentStreak = 0;
            let tempStreak = 0;
            let prevDate: Date | null = null;
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            sortedDates.forEach(dateStr => {
                const currDate = new Date(dateStr);
                currDate.setHours(0, 0, 0, 0);
                if (prevDate) {
                    const diffTime = currDate.getTime() - prevDate.getTime();
                    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                    if (diffDays === 1) {
                        tempStreak++;
                    } else {
                        longestStreak = Math.max(longestStreak, tempStreak);
                        tempStreak = 1;
                    }
                } else {
                    tempStreak = 1;
                }
                prevDate = currDate;
            });
            longestStreak = Math.max(longestStreak, tempStreak);
            if (sortedDates.length > 0) {
                const lastDate = new Date(sortedDates[sortedDates.length - 1]);
                lastDate.setHours(0, 0, 0, 0);
                const diffToToday = Math.round((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
                if (diffToToday <= 1) {
                    let streakCount = 1;
                    for (let i = sortedDates.length - 2; i >= 0; i--) {
                        const curr = new Date(sortedDates[i]);
                        const next = new Date(sortedDates[i + 1]);
                        curr.setHours(0, 0, 0, 0);
                        next.setHours(0, 0, 0, 0);
                        const diff = Math.round((next.getTime() - curr.getTime()) / (1000 * 60 * 60 * 24));
                        if (diff === 1) {
                            streakCount++;
                        } else {
                            break;
                        }
                    }
                    currentStreak = streakCount;
                }
            }
            const topLikedPosts = allList
                .map(p => ({ content: (p.content || '').slice(0, 50) + ((p.content || '').length > 50 ? '...' : ''), likes: p.like_total || 0, date: p.created_time ? new Date(p.created_time * 1000).toLocaleDateString('zh-CN') : '' }))
                .filter(p => p.likes > 0)
                .sort((a, b) => b.likes - a.likes)
                .slice(0, 5);
            const topCommentedPosts = allList
                .map(p => ({ content: (p.content || '').slice(0, 50) + ((p.content || '').length > 50 ? '...' : ''), comments: p.comment_total || 0, date: p.created_time ? new Date(p.created_time * 1000).toLocaleDateString('zh-CN') : '' }))
                .filter(p => p.comments > 0)
                .sort((a, b) => b.comments - a.comments)
                .slice(0, 5);
            const yearlyGrowth = yearlyComparison.map((curr, idx, arr) => {
                if (idx === 0) return { year: curr.year, growth: 0 };
                const prev = arr[idx - 1];
                const prevTotal = prev.shuoshuo + prev.share;
                const currTotal = curr.shuoshuo + curr.share;
                const growth = prevTotal > 0 ? Math.round(((currTotal - prevTotal) / prevTotal) * 1000) / 10 : 0;
                return { year: curr.year, growth };
            });
            const monthlyTopList = Object.entries(monthData.count || {})
                .map(([k, v]) => ({ month: formatMonthKey(Number(k)), count: v as number }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 6);
            const emojiRegex = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu;
            const emojiCounts: { [key: string]: number } = {};
            allList.forEach(p => {
                const matches = (p.content || '').match(emojiRegex);
                if (matches) {
                    matches.forEach(emoji => {
                        emojiCounts[emoji] = (emojiCounts[emoji] || 0) + 1;
                    });
                }
            });
            const emojiStats = Object.entries(emojiCounts)
                .map(([emoji, count]) => ({ emoji, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 10);
            setStats({
                shuoshuoCount: shuoshuoData.total || shuoshuoList.length,
                shareCount: shareData.total || shareList.length,
                totalLikes,
                totalComments,
                totalFwds,
                totalImages,
                totalVideos,
                monthData: monthData.count || {},
                yearData,
                avgLikes: Math.round(totalLikes / totalCount * 10) / 10,
                avgComments: Math.round(totalComments / totalCount * 10) / 10,
                avgFwds: Math.round(totalFwds / (shuoshuoList.length || 1) * 10) / 10,
                secretCount,
                withLbsCount,
                withLinkCount,
                withAtCount,
                mostActiveYear,
                mostActiveMonth,
                mostActiveHour,
                mostActiveWeekday,
                totalDays,
                firstPostDate,
                lastPostDate,
                topShareSources,
                likesDistribution,
                hourlyDistribution,
                weekdayDistribution,
                yearlyComparison,
                contentTypeDist,
                avgContentLength,
                longestPost,
                avgImagesPerPost,
                avgVideosPerPost,
                longestStreak,
                currentStreak,
                topLikedPosts,
                topCommentedPosts,
                yearlyGrowth,
                monthlyTopList,
                emojiStats,
            });
        } catch (e) {
            console.error(e);
            toast.error('获取统计数据失败', { position: 'top-center' });
        } finally {
            setLoading(false);
        }
    }, [serverUrl]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const chartData = useMemo(() => {
        const data = timeView === 'month' ? stats.monthData : stats.yearData;
        return Object.entries(data)
            .map(([k, v]) => ({ name: timeView === 'month' ? formatMonthKey(Number(k)) : String(k), value: v }))
            .sort((a, b) => a.name.localeCompare(b.name))
            .slice(-24);
    }, [stats.monthData, stats.yearData, timeView]);

    if (!serverUrl) {
        return (
            <div className="flex items-center justify-center h-[60vh] text-muted-foreground">
                请先连接服务器
            </div>
        );
    }

    if (loading) {
        return <LoadingSkeleton />;
    }

    const totalPosts = stats.shuoshuoCount + stats.shareCount;

    return (
        <TooltipProvider>
            <div className="flex flex-col gap-4 overflow-x-hidden">
                <div className="flex items-center justify-between flex-wrap gap-2">
                    <h1 className="text-xl font-semibold"></h1>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap py-1.5">
                        <span>共 {totalPosts.toLocaleString()} 条动态</span>
                        <span className="hidden sm:inline">|</span>
                        <span className="hidden sm:inline">跨度 {stats.totalDays} 天</span>
                        {stats.firstPostDate && (
                            <>
                                <span className="hidden sm:inline">|</span>
                                <span className="hidden sm:inline">{stats.firstPostDate} ~ {stats.lastPostDate}</span>
                            </>
                        )}
                    </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <StatCard title="说说" value={stats.shuoshuoCount} icon={FileText} color="bg-blue-500/20 text-blue-500" />
                    <StatCard title="分享" value={stats.shareCount} icon={Share2} color="bg-green-500/20 text-green-500" />
                    <StatCard title="点赞" value={stats.totalLikes} icon={Heart} color="bg-red-500/20 text-red-500" />
                    <StatCard title="评论" value={stats.totalComments} icon={MessageSquare} color="bg-yellow-500/20 text-yellow-500" />
                    <StatCard title="转发" value={stats.totalFwds} icon={TrendingUp} color="bg-purple-500/20 text-purple-500" />
                    <StatCard title="图片" value={stats.totalImages} icon={Image} color="bg-pink-500/20 text-pink-500" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <StatCard title="视频" value={stats.totalVideos} icon={Video} color="bg-cyan-500/20 text-cyan-500" />
                    <StatCard title="私密" value={stats.secretCount} icon={Lock} color="bg-gray-500/20 text-gray-500" />
                    <StatCard title="带位置" value={stats.withLbsCount} icon={MapPin} color="bg-orange-500/20 text-orange-500" />
                    <StatCard title="带链接" value={stats.withLinkCount} icon={Link} color="bg-indigo-500/20 text-indigo-500" />
                    <StatCard title="均赞" value={stats.avgLikes} icon={Heart} color="bg-red-500/20 text-red-400" />
                    <StatCard title="均评" value={stats.avgComments} icon={MessageSquare} color="bg-yellow-500/20 text-yellow-400" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
                    <StatCard title="均转" value={stats.avgFwds} icon={TrendingUp} color="bg-purple-500/20 text-purple-400" />
                    <StatCard title="带@" value={stats.withAtCount} icon={AtSign} color="bg-teal-500/20 text-teal-500" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className="p-2 rounded-lg bg-amber-500/20 text-amber-500">
                                        <Award className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">最活跃年份</p>
                                        <p className="text-xl font-semibold">{stats.mostActiveYear || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>发布动态最多的年份</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
                                        <Zap className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">最活跃月份</p>
                                        <p className="text-xl font-semibold">{stats.mostActiveMonth || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>发布动态最多的月份</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className="p-2 rounded-lg bg-rose-500/20 text-rose-500">
                                        <Flame className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">最活跃时段</p>
                                        <p className="text-xl font-semibold">{stats.mostActiveHour >= 0 ? `${stats.mostActiveHour}:00` : '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>发布动态最多的小时</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className="p-2 rounded-lg bg-violet-500/20 text-violet-500">
                                        <Sparkles className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">最活跃星期</p>
                                        <p className="text-xl font-semibold">{stats.mostActiveWeekday || '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>发布动态最多的星期几</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
                            <div>
                                <CardTitle className="text-base">发布趋势</CardTitle>
                                <CardDescription className="text-xs">按{timeView === 'month' ? '月' : '年'}统计</CardDescription>
                            </div>
                            <Select value={timeView} onValueChange={(v) => setTimeView(v as 'month' | 'year')}>
                                <SelectTrigger className="w-20 h-7 text-xs">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="month">按月</SelectItem>
                                    <SelectItem value="year">按年</SelectItem>
                                </SelectContent>
                            </Select>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {chartData.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <defs>
                                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.05} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="name" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Area type="monotone" dataKey="value" stroke="#3b82f6" fillOpacity={1} fill="url(#colorValue)" strokeWidth={2} />
                                    </AreaChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">说说/分享年度对比</CardTitle>
                            <CardDescription className="text-xs">各年份说说与分享数量对比</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.yearlyComparison.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[240px] w-full">
                                    <BarChart data={stats.yearlyComparison} margin={{ top: 5, right: 5, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                        <XAxis dataKey="year" tickLine={false} axisLine={false} tickMargin={6} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 10, fill: '#6b7280' }} />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="shuoshuo" fill="#3b82f6" radius={[3, 3, 0, 0]} name="说说" />
                                        <Bar dataKey="share" fill="#10b981" radius={[3, 3, 0, 0]} name="分享" />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[240px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">发布时间分布</CardTitle>
                            <CardDescription className="text-xs">24小时发布统计</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.hourlyDistribution.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                                    <BarChart data={stats.hourlyDistribution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                        <XAxis dataKey="hour" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} tickFormatter={(v) => `${v}时`} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} hide />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="#3b82f6" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">星期分布</CardTitle>
                            <CardDescription className="text-xs">一周内发布统计</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.weekdayDistribution.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                                    <BarChart data={stats.weekdayDistribution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                        <XAxis dataKey="day" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} hide />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="#8b5cf6" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">点赞分布</CardTitle>
                            <CardDescription className="text-xs">按点赞数区间统计</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.likesDistribution.length > 0 ? (
                                <ChartContainer config={chartConfig} className="h-[180px] w-full">
                                    <BarChart data={stats.likesDistribution} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                                        <XAxis dataKey="range" tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} />
                                        <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 9, fill: '#6b7280' }} hide />
                                        <ChartTooltip content={<ChartTooltipContent />} />
                                        <Bar dataKey="count" fill="#f59e0b" radius={[2, 2, 0, 0]} />
                                    </BarChart>
                                </ChartContainer>
                            ) : (
                                <div className="h-[180px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                    <StatCard title="平均字数" value={stats.avgContentLength} icon={Text} color="bg-slate-500/20 text-slate-500" />
                    <StatCard title="均图/条" value={stats.avgImagesPerPost} icon={Image} color="bg-pink-500/20 text-pink-400" />
                    <StatCard title="均视频/条" value={stats.avgVideosPerPost} icon={Video} color="bg-cyan-500/20 text-cyan-400" />
                    <StatCard title="最长连续" value={`${stats.longestStreak}天`} icon={Trophy} color="bg-yellow-500/20 text-yellow-600" />
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className={`p-2 rounded-lg ${stats.currentStreak > 0 ? 'bg-orange-500/20 text-orange-500' : 'bg-gray-500/20 text-gray-500'}`}>
                                        <Flame className="size-4" />
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">当前连续</p>
                                        <p className="text-xl font-semibold">{stats.currentStreak > 0 ? `${stats.currentStreak}天` : '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>当前连续发布天数（最近1天内有发布）</p>
                        </TooltipContent>
                    </Tooltip>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Card className="cursor-pointer hover:shadow-md transition-shadow">
                                <CardContent className="flex items-center gap-2 py-3 px-4">
                                    <div className="p-2 rounded-lg bg-lime-500/20 text-lime-600">
                                        <BarChart3 className="size-4" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-muted-foreground">最长说说</p>
                                        <p className="text-xl font-semibold truncate">{stats.longestPost ? `${stats.longestPost.length}字` : '-'}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TooltipTrigger>
                        <TooltipContent side="bottom">
                            <p>{stats.longestPost ? stats.longestPost.content.slice(0, 100) : '无数据'}</p>
                        </TooltipContent>
                    </Tooltip>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">内容类型分布</CardTitle>
                            <CardDescription className="text-xs">各类内容占比</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.contentTypeDist.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.contentTypeDist.map((item, idx) => (
                                        <div key={item.type} className="flex items-center gap-2">
                                            <div className="w-16 text-xs text-muted-foreground">{item.type}</div>
                                            <div className="flex-1 h-4 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all"
                                                    style={{ width: `${item.percentage}%`, backgroundColor: COLORS[idx % COLORS.length] }}
                                                />
                                            </div>
                                            <div className="w-12 text-xs text-right">{item.percentage}%</div>
                                            <div className="w-10 text-xs text-muted-foreground text-right">{item.count}</div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">月度活跃度排行</CardTitle>
                            <CardDescription className="text-xs">发布最多的月份TOP6</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.monthlyTopList.length > 0 ? (
                                <div className="space-y-1.5">
                                    {stats.monthlyTopList.map((item, idx) => (
                                        <div key={item.month} className="flex items-center gap-2 text-sm">
                                            <div
                                                className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-medium shrink-0"
                                                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                            >
                                                {idx + 1}
                                            </div>
                                            <span className="flex-1">{item.month}</span>
                                            <span className="text-muted-foreground text-xs">{item.count}条</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">年度增长率</CardTitle>
                            <CardDescription className="text-xs">相比上一年的增长情况</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.yearlyGrowth.length > 0 ? (
                                <div className="space-y-1.5">
                                    {stats.yearlyGrowth.map((item) => (
                                        <div key={item.year} className="flex items-center justify-between text-sm">
                                            <span>{item.year}年</span>
                                            <span className={item.growth > 0 ? 'text-green-500' : item.growth < 0 ? 'text-red-500' : 'text-muted-foreground'}>
                                                {item.growth === 0 && item.year === stats.yearlyGrowth[0]?.year ? '-' : `${item.growth > 0 ? '+' : ''}${item.growth}%`}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">点赞TOP5</CardTitle>
                            <CardDescription className="text-xs">获赞最多的动态</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.topLikedPosts.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.topLikedPosts.map((post, idx) => (
                                        <Tooltip key={idx}>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                                    <div
                                                        className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm truncate">{post.content || '(无内容)'}</p>
                                                        <p className="text-xs text-muted-foreground">{post.date}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-red-500 text-xs shrink-0">
                                                        <Heart className="size-3" />
                                                        {post.likes}
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-xs">
                                                <p>{post.content}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">评论TOP5</CardTitle>
                            <CardDescription className="text-xs">评论最多的动态</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            {stats.topCommentedPosts.length > 0 ? (
                                <div className="space-y-2">
                                    {stats.topCommentedPosts.map((post, idx) => (
                                        <Tooltip key={idx}>
                                            <TooltipTrigger asChild>
                                                <div className="flex items-start gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                                    <div
                                                        className="w-5 h-5 rounded flex items-center justify-center text-white text-xs font-medium shrink-0 mt-0.5"
                                                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                                                    >
                                                        {idx + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm truncate">{post.content || '(无内容)'}</p>
                                                        <p className="text-xs text-muted-foreground">{post.date}</p>
                                                    </div>
                                                    <div className="flex items-center gap-1 text-yellow-500 text-xs shrink-0">
                                                        <MessageSquare className="size-3" />
                                                        {post.comments}
                                                    </div>
                                                </div>
                                            </TooltipTrigger>
                                            <TooltipContent side="bottom" className="max-w-xs">
                                                <p>{post.content}</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    ))}
                                </div>
                            ) : (
                                <div className="h-[120px] flex items-center justify-center text-muted-foreground text-sm">暂无数据</div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                {stats.emojiStats.length > 0 && (
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">常用表情TOP10</CardTitle>
                            <CardDescription className="text-xs">使用频率最高的表情</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="flex flex-wrap gap-2">
                                {stats.emojiStats.map((item, idx) => (
                                    <Tooltip key={item.emoji}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/70 cursor-pointer hover:bg-muted transition-colors"
                                                style={{ borderLeft: `3px solid ${COLORS[idx % COLORS.length]}` }}
                                            >
                                                <span className="text-lg">{item.emoji}</span>
                                                <span className="text-xs text-muted-foreground">{item.count}</span>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <p>使用 {item.count} 次</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
                {stats.topShareSources.length > 0 && (
                    <Card>
                        <CardHeader className="py-3 px-4">
                            <CardTitle className="text-base">分享来源排行</CardTitle>
                            <CardDescription className="text-xs">分享内容来源平台统计</CardDescription>
                        </CardHeader>
                        <CardContent className="px-4 pb-4">
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                                {stats.topShareSources.map((source, index) => (
                                    <Tooltip key={source.name}>
                                        <TooltipTrigger asChild>
                                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 cursor-pointer hover:bg-muted transition-colors">
                                                <div
                                                    className="w-6 h-6 rounded flex items-center justify-center text-white text-xs font-medium shrink-0"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                >
                                                    {index + 1}
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <p className="text-sm font-medium truncate">{source.name}</p>
                                                    <p className="text-xs text-muted-foreground">{source.count.toLocaleString()} 次</p>
                                                </div>
                                            </div>
                                        </TooltipTrigger>
                                        <TooltipContent side="bottom">
                                            <p>{source.name}: {source.count.toLocaleString()} 次分享</p>
                                        </TooltipContent>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </TooltipProvider>
    );
};
