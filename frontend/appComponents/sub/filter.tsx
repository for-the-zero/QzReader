import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Funnel, RotateCcw, CalendarIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/frontend/lib/utils";
import { type DayButton, getDefaultClassNames } from "react-day-picker";

import { useGlbState } from "@/frontend/utils/glbState";
import { useState, useEffect, useMemo, useCallback, useRef, memo } from "react";
import { toast } from "sonner";

interface numFilterState {
    enabled: boolean,
    isRange: boolean,
    exact: number,
    rangeMin: number,
    rangeMax: number,
    max: number,
};

const defaultNumState: numFilterState = { enabled: false, isRange: false, exact: 0, rangeMin: 0, rangeMax: 100, max: 100 };

function NumFilter({ label, value, onChange, range }: { label: string, value: numFilterState, onChange: (v: numFilterState) => void, range?: [number, number] }) {
    const maxVal = range ? range[1] : 100;
    useEffect(() => {
        if (range && (value.max !== range[1] || value.rangeMax > range[1])) {
            onChange({ ...value, max: range[1], rangeMax: Math.min(value.rangeMax, range[1]) });
        }
    }, [range, value, onChange]);
    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <Label>{label}</Label>
                <Switch
                    checked={value.enabled}
                    onCheckedChange={(checked) => onChange({ ...value, enabled: checked })}
                />
            </div>
            {value.enabled && (
                <div className="flex flex-col gap-2 pl-1">
                    <div className="flex items-center gap-2">
                        <Select value={value.isRange ? 'range' : 'exact'} onValueChange={(v) => onChange({ ...value, isRange: v === 'range' })}>
                            <SelectTrigger className="w-20">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="exact">精确</SelectItem>
                                <SelectItem value="range">范围</SelectItem>
                            </SelectContent>
                        </Select>
                        {value.isRange ? (
                            <div className="flex items-center gap-2 flex-1">
                                <span className="text-sm w-8 text-right">{value.rangeMin}</span>
                                <Slider
                                    value={[value.rangeMin, value.rangeMax]}
                                    min={0}
                                    max={maxVal}
                                    onValueChange={(v) => onChange({ ...value, rangeMin: v[0]!, rangeMax: v[1]! })}
                                    className="flex-1"
                                />
                                <span className="text-sm w-8">{value.rangeMax}</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 flex-1">
                                <Slider
                                    value={[value.exact]}
                                    min={0}
                                    max={maxVal}
                                    onValueChange={(v) => onChange({ ...value, exact: v[0]! })}
                                    className="flex-1"
                                />
                                <span className="text-sm w-8">{value.exact}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

interface DateFilterValue {
    mode: 'single' | 'range',
    single: Date | null,
    rangeStart: Date | null,
    rangeEnd: Date | null,
};

const defaultDateValue: DateFilterValue = { mode: 'single', single: null, rangeStart: null, rangeEnd: null };

function DateDayButton({ className, day, modifiers, dayCounts, ...props }: React.ComponentProps<typeof DayButton> & { dayCounts: { [key: number]: number } }) {
    const defaultClassNames = getDefaultClassNames();
    const ref = useRef<HTMLButtonElement>(null);
    useEffect(() => {
        if (modifiers.focused) ref.current?.focus();
    }, [modifiers.focused]);
    const dateKey = day.date.getFullYear() * 10000 + (day.date.getMonth() + 1) * 100 + day.date.getDate();
    const count = dayCounts[dateKey] || 0;
    return (
        <Button
            ref={ref}
            variant="ghost"
            size="icon"
            data-day={day.date.toLocaleDateString()}
            data-selected-single={
                modifiers.selected &&
                !modifiers.range_start &&
                !modifiers.range_end &&
                !modifiers.range_middle
            }
            data-range-start={modifiers.range_start}
            data-range-end={modifiers.range_end}
            data-range-middle={modifiers.range_middle}
            className={cn(
                "data-[selected-single=true]:bg-primary data-[selected-single=true]:text-primary-foreground data-[range-middle=true]:bg-accent data-[range-middle=true]:text-accent-foreground data-[range-start=true]:bg-primary data-[range-start=true]:text-primary-foreground data-[range-end=true]:bg-primary data-[range-end=true]:text-primary-foreground group-data-[focused=true]/day:border-ring group-data-[focused=true]/day:ring-ring/50 dark:hover:text-accent-foreground flex aspect-square size-auto w-full min-w-(--cell-size) flex-col gap-0.5 leading-none font-normal group-data-[focused=true]/day:relative group-data-[focused=true]/day:z-10 group-data-[focused=true]/day:ring-[3px] data-[range-end=true]:rounded-md data-[range-end=true]:rounded-r-md data-[range-middle=true]:rounded-none data-[range-start=true]:rounded-md data-[range-start=true]:rounded-l-md",
                defaultClassNames.day,
                className,
            )}
            {...props}
        >
            <span>{day.date.getDate()}</span>
            {count > 0 && <span className="text-[10px] text-primary font-medium">{count}</span>}
        </Button>
    );
};

function DateFilter({ value, onChange, serverUrl, filterBase }: { value: DateFilterValue, onChange: (v: DateFilterValue) => void, serverUrl: string, filterBase: filterRangeReqType['other'] }) {
    const [dayCounts, setDayCounts] = useState<{ [key: number]: number }>({});
    const [displayMonth, setDisplayMonth] = useState<Date>(new Date());
    const fetchDayCounts = useCallback(async (year: number, month: number) => {
        if (!serverUrl) return;
        try {
            const startDate = new Date(year, month - 1, 1);
            const lastDay = new Date(year, month, 0).getDate();
            const endDate = new Date(year, month - 1, lastDay, 23, 59, 59);
            console.log('fetchDayCounts:', { year, month, startDate, endDate, filterBase });
            const req = await fetch(serverUrl + '/api/get/count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    other: filterBase,
                    getRange: 'date',
                    dateViewableRange: [startDate.getTime(), endDate.getTime()],
                }),
            });
            if (req.ok) {
                const res = await req.json();
                setDayCounts(res.count || {});
            }
        } catch (e) {
            console.error(e);
            toast.error('获取日期数据失败', { position: 'top-center' });
        }
    }, [serverUrl, filterBase]);
    useEffect(() => {
        fetchDayCounts(displayMonth.getFullYear(), displayMonth.getMonth() + 1);
    }, [displayMonth, fetchDayCounts]);
    const displayText = useMemo(() => {
        if (value.mode === 'single' && value.single) {
            return `${value.single.getFullYear()}/${value.single.getMonth() + 1}/${value.single.getDate()}`;
        }
        if (value.mode === 'range' && value.rangeStart) {
            const start = `${value.rangeStart.getFullYear()}/${value.rangeStart.getMonth() + 1}/${value.rangeStart.getDate()}`;
            const end = value.rangeEnd ? `${value.rangeEnd.getFullYear()}/${value.rangeEnd.getMonth() + 1}/${value.rangeEnd.getDate()}` : '?';
            return `${start} - ${end}`;
        }
        return '选择日期';
    }, [value]);
    const handleSingleSelect = (date: Date | undefined) => {
        if (date) {
            onChange({ ...value, single: date });
        }
    };
    const handleRangeSelect = (range: { from?: Date; to?: Date } | undefined) => {
        if (range) {
            onChange({ ...value, rangeStart: range.from || null, rangeEnd: range.to || null });
        }
    };
    return (
        <div className="flex items-center justify-between">
            <Label>日期</Label>
            <div className="flex items-center gap-2">
                <Select value={value.mode} onValueChange={(v) => onChange({ ...value, mode: v as 'single' | 'range', single: null, rangeStart: null, rangeEnd: null })}>
                    <SelectTrigger className="w-20">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="single">单日</SelectItem>
                        <SelectItem value="range">区间</SelectItem>
                    </SelectContent>
                </Select>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" size="sm" className="w-36 justify-start">
                            <CalendarIcon className="size-4 mr-1" />
                            {displayText}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        {(() => {
                            if (value.mode === 'single') {
                                return (
                                    <Calendar
                                        mode="single"
                                        selected={value.single ?? undefined}
                                        onSelect={handleSingleSelect}
                                        month={displayMonth}
                                        onMonthChange={setDisplayMonth}
                                        components={{
                                            DayButton: (props) => <DateDayButton {...props} dayCounts={dayCounts} />,
                                        }}
                                        captionLayout="dropdown"
                                    />
                                );
                            }
                            return (
                                <Calendar
                                    mode="range"
                                    selected={{ from: value.rangeStart ?? undefined, to: value.rangeEnd ?? undefined }}
                                    onSelect={handleRangeSelect}
                                    month={displayMonth}
                                    onMonthChange={setDisplayMonth}
                                    components={{
                                        DayButton: (props) => <DateDayButton {...props} dayCounts={dayCounts} />,
                                    }}
                                    captionLayout="dropdown"
                                />
                            );
                        })()}
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    );
};

export const TopBar = memo(()=>{
    const [glbState, setGlbState] = useGlbState();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [localFilter, setLocalFilter] = useState<filterType>(glbState.filter);
    const [picTotal, setPicTotal] = useState<numFilterState>(defaultNumState);
    const [mediaTotal, setMediaTotal] = useState<numFilterState>(defaultNumState);
    const [likes, setLikes] = useState<numFilterState>(defaultNumState);
    const [comments, setComments] = useState<numFilterState>(defaultNumState);
    const [fwds, setFwds] = useState<numFilterState>(defaultNumState);
    const [dateFilter, setDateFilter] = useState<DateFilterValue>(defaultDateValue);
    const [content, setContent] = useState<string>('');
    const [shareSource, setShareSource] = useState<string>('');
    const [shareSources, setShareSources] = useState<string[]>([]);
    const [ranges, setRanges] = useState<{ pic?: [number, number], media?: [number, number], likes?: [number, number], comments?: [number, number], fwds?: [number, number] }>({});
    const [filteredCount, setFilteredCount] = useState<number | null>(null);
    const initializedRef = useRef(false);
    const serverUrl = glbState.serverUrl;
    const isShuoshuo = localFilter.type === 'shuoshuo' || localFilter.type === 'both';
    const isShare = localFilter.type === 'share' || localFilter.type === 'both';
    const filterBase: filterRangeReqType['other'] = useMemo(() => ({
        type: localFilter.type,
        secret: localFilter.secret,
        hasLbs: localFilter.hasLbs,
        withLink: localFilter.withLink,
        withAt: localFilter.withAt,
        content: content || '',
    }), [localFilter.type, localFilter.secret, localFilter.hasLbs, localFilter.withLink, localFilter.withAt, content]);
    const fetchRanges = useCallback(async () => {
        if (!serverUrl) return;
        try {
            const rangeTypes = ['pic', 'media', 'likes', 'comments', 'fwds'] as const;
            const newRanges: typeof ranges = {};
            for (const r of rangeTypes) {
                const req = await fetch(serverUrl + '/api/get/count', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ other: { type: localFilter.type, secret: false, hasLbs: false, withLink: false, withAt: false, content: '' }, getRange: r }),
                });
                if (req.ok) {
                    const res = await req.json();
                    newRanges[r] = res.count as [number, number];
                }
            }
            setRanges(newRanges);
        } catch (e) {
            console.error(e);
            toast.error('获取范围数据失败', { position: 'top-center' });
        }
    }, [serverUrl, localFilter.type]);
    const fetchShareSources = useCallback(async () => {
        if (!serverUrl || localFilter.type === 'shuoshuo') return;
        try {
            const req = await fetch(serverUrl + '/api/get/count', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ other: { type: 'share', secret: false, hasLbs: false, withLink: false, withAt: false, content: '' }, getRange: 'shareSource' }),
            });
            if (req.ok) {
                const res = await req.json();
                setShareSources(res.count || []);
            }
        } catch (e) {
            console.error(e);
            toast.error('获取分享来源失败', { position: 'top-center' });
        }
    }, [serverUrl, localFilter.type]);
    const fetchFilteredCount = useCallback(async () => {
        if (!serverUrl) return;
        const reqBody: filterType = {
            type: localFilter.type,
            secret: localFilter.secret,
            hasLbs: localFilter.hasLbs,
            withLink: localFilter.withLink,
            withAt: localFilter.withAt,
            content: content || null,
        };
        if (dateFilter.mode === 'single' && dateFilter.single) {
            reqBody.date = { year: dateFilter.single.getFullYear(), month: dateFilter.single.getMonth() + 1, day: dateFilter.single.getDate() };
        } else if (dateFilter.mode === 'range' && dateFilter.rangeStart && dateFilter.rangeEnd) {
            const startTs = new Date(dateFilter.rangeStart.getFullYear(), dateFilter.rangeStart.getMonth(), dateFilter.rangeStart.getDate()).getTime();
            const endTs = new Date(dateFilter.rangeEnd.getFullYear(), dateFilter.rangeEnd.getMonth(), dateFilter.rangeEnd.getDate(), 23, 59, 59).getTime();
            reqBody.date = [startTs, endTs];
        }
        console.log('fetchFilteredCount reqBody:', JSON.stringify(reqBody, null, 2));
        if (isShuoshuo) {
            if (picTotal.enabled) reqBody.picTotal = picTotal.isRange ? [picTotal.rangeMin, picTotal.rangeMax] : picTotal.exact;
            if (mediaTotal.enabled) reqBody.mediaTotal = [1, 'inf'];
        }
        if (isShare && shareSource) {
            reqBody.shareSource = shareSource;
        }
        if (likes.enabled) reqBody.likes = likes.isRange ? [likes.rangeMin, likes.rangeMax] : likes.exact;
        if (comments.enabled) reqBody.comments = comments.isRange ? [comments.rangeMin, comments.rangeMax] : comments.exact;
        if (fwds.enabled) reqBody.fwds = fwds.isRange ? [fwds.rangeMin, fwds.rangeMax] : fwds.exact;
        try {
            const req = await fetch(serverUrl + '/api/get', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ filter: reqBody }),
            });
            if (req.ok) {
                const res = await req.json();
                setFilteredCount(res.list?.length || 0);
            }
        } catch (e) {
            console.error(e);
            toast.error('获取筛选结果失败', { position: 'top-center' });
        }
    }, [serverUrl, localFilter, content, dateFilter, picTotal, mediaTotal, likes, comments, fwds, shareSource, isShuoshuo, isShare]);
    useEffect(() => {
        if (dialogOpen && !initializedRef.current) {
            initializedRef.current = true;
            setLocalFilter(glbState.filter);
            if (glbState.filter.picTotal != null) {
                if (typeof glbState.filter.picTotal === 'number') {
                    setPicTotal({ ...defaultNumState, enabled: true, exact: glbState.filter.picTotal });
                } else {
                    setPicTotal({ ...defaultNumState, enabled: true, isRange: true, rangeMin: glbState.filter.picTotal[0], rangeMax: typeof glbState.filter.picTotal[1] === 'number' ? glbState.filter.picTotal[1] : 100 });
                }
            } else {
                setPicTotal(defaultNumState);
            }
            setMediaTotal(glbState.filter.mediaTotal != null ? { ...defaultNumState, enabled: true } : defaultNumState);
            if (glbState.filter.likes != null) {
                if (typeof glbState.filter.likes === 'number') {
                    setLikes({ ...defaultNumState, enabled: true, exact: glbState.filter.likes });
                } else {
                    setLikes({ ...defaultNumState, enabled: true, isRange: true, rangeMin: glbState.filter.likes[0], rangeMax: typeof glbState.filter.likes[1] === 'number' ? glbState.filter.likes[1] : 100 });
                }
            } else {
                setLikes(defaultNumState);
            }
            if (glbState.filter.comments != null) {
                if (typeof glbState.filter.comments === 'number') {
                    setComments({ ...defaultNumState, enabled: true, exact: glbState.filter.comments });
                } else {
                    setComments({ ...defaultNumState, enabled: true, isRange: true, rangeMin: glbState.filter.comments[0], rangeMax: typeof glbState.filter.comments[1] === 'number' ? glbState.filter.comments[1] : 100 });
                }
            } else {
                setComments(defaultNumState);
            }
            if (glbState.filter.fwds != null) {
                if (typeof glbState.filter.fwds === 'number') {
                    setFwds({ ...defaultNumState, enabled: true, exact: glbState.filter.fwds });
                } else {
                    setFwds({ ...defaultNumState, enabled: true, isRange: true, rangeMin: glbState.filter.fwds[0], rangeMax: typeof glbState.filter.fwds[1] === 'number' ? glbState.filter.fwds[1] : 100 });
                }
            } else {
                setFwds(defaultNumState);
            }
            if (glbState.filter.date) {
                const d = glbState.filter.date;
                if (Array.isArray(d)) {
                    setDateFilter({ ...defaultDateValue, mode: 'range', rangeStart: new Date(d[0]), rangeEnd: new Date(d[1]) });
                } else {
                    setDateFilter({ ...defaultDateValue, mode: 'single', single: new Date(d.year, d.month - 1, d.day) });
                }
            } else {
                setDateFilter(defaultDateValue);
            }
            setContent(glbState.filter.content || '');
            setShareSource(glbState.filter.shareSource || '');
            fetchRanges();
            fetchShareSources();
        }
        if (!dialogOpen) {
            initializedRef.current = false;
        }
    }, [dialogOpen]);
    useEffect(() => {
        if (dialogOpen) {
            fetchFilteredCount();
        }
    }, [dialogOpen, fetchFilteredCount]);
    const handleApply = () => {
        const newFilter: filterType = {
            type: localFilter.type,
            secret: localFilter.secret,
            hasLbs: localFilter.hasLbs,
            withLink: localFilter.withLink,
            withAt: localFilter.withAt,
            content: content || null,
        };
        if (dateFilter.mode === 'single' && dateFilter.single) {
            newFilter.date = { year: dateFilter.single.getFullYear(), month: dateFilter.single.getMonth() + 1, day: dateFilter.single.getDate() };
        } else if (dateFilter.mode === 'range' && dateFilter.rangeStart && dateFilter.rangeEnd) {
            const startTs = new Date(dateFilter.rangeStart.getFullYear(), dateFilter.rangeStart.getMonth(), dateFilter.rangeStart.getDate()).getTime();
            const endTs = new Date(dateFilter.rangeEnd.getFullYear(), dateFilter.rangeEnd.getMonth(), dateFilter.rangeEnd.getDate(), 23, 59, 59).getTime();
            newFilter.date = [startTs, endTs];
        }
        if (isShuoshuo) {
            if (picTotal.enabled) newFilter.picTotal = picTotal.isRange ? [picTotal.rangeMin, picTotal.rangeMax] : picTotal.exact;
            if (mediaTotal.enabled) newFilter.mediaTotal = [1, 'inf'];
        }
        if (isShare && shareSource) {
            newFilter.shareSource = shareSource;
        }
        if (likes.enabled) newFilter.likes = likes.isRange ? [likes.rangeMin, likes.rangeMax] : likes.exact;
        if (comments.enabled) newFilter.comments = comments.isRange ? [comments.rangeMin, comments.rangeMax] : comments.exact;
        if (fwds.enabled) newFilter.fwds = fwds.isRange ? [fwds.rangeMin, fwds.rangeMax] : fwds.exact;
        setGlbState({ ...glbState, filter: newFilter });
        setDialogOpen(false);
    };
    const handleReset = () => {
        setPicTotal(defaultNumState);
        setMediaTotal(defaultNumState);
        setLikes(defaultNumState);
        setComments(defaultNumState);
        setFwds(defaultNumState);
        setDateFilter(defaultDateValue);
        setContent('');
        setShareSource('');
        setLocalFilter({
            type: 'both',
            secret: false,
            hasLbs: false,
            withLink: false,
            withAt: false,
        });
    };
    return (
        <div className="flex flex-row justify-between items-center gap-4">
            <h1 className="text-2xl text-foreground"></h1>
            <div className="flex-1 max-w-md">
                <Input
                    className="w-full"
                    placeholder="搜索"
                    value={glbState.filter.content || ''}
                    onChange={(e) => {
                        setGlbState({ ...glbState, filter: { ...glbState.filter, content: e.target.value || null } });
                    }}
                />
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger>
                    <Tooltip>
                        <TooltipTrigger>
                            <Button variant="outline" size="icon"><Funnel /></Button>
                        </TooltipTrigger>
                        <TooltipContent>筛选</TooltipContent>
                    </Tooltip>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto" showCloseButton={false}>
                    <DialogHeader className="flex flex-row items-center justify-between">
                        <DialogTitle>筛选</DialogTitle>
                        <Button variant="ghost" size="sm" onClick={handleReset}>
                            <RotateCcw className="size-4 mr-1" />重置
                        </Button>
                    </DialogHeader>
                    <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] no-scrollbar">
                        <div className="flex items-center justify-between">
                            <Label>类型</Label>
                            <Select
                                value={localFilter.type}
                                onValueChange={(v) => setLocalFilter({ ...localFilter, type: v as 'shuoshuo' | 'share' | 'both' })}
                            >
                                <SelectTrigger className="w-28">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="both">全部</SelectItem>
                                    <SelectItem value="shuoshuo">说说</SelectItem>
                                    <SelectItem value="share">分享</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>有链接</Label>
                            <Switch
                                checked={localFilter.withLink}
                                onCheckedChange={(v) => setLocalFilter({ ...localFilter, withLink: v })}
                            />
                        </div>
                        <div className="flex items-center justify-between">
                            <Label>有@</Label>
                            <Switch
                                checked={localFilter.withAt}
                                onCheckedChange={(v) => setLocalFilter({ ...localFilter, withAt: v })}
                            />
                        </div>
                        <NumFilter label="点赞数" value={likes} onChange={setLikes} range={ranges.likes} />
                        <NumFilter label="评论数" value={comments} onChange={setComments} range={ranges.comments} />
                        <NumFilter label="转发数" value={fwds} onChange={setFwds} range={ranges.fwds} />
                        {isShuoshuo && (
                            <>
                                <Separator />
                                <div className="text-sm font-medium text-muted-foreground">说说专属</div>
                                <NumFilter label="图片数量" value={picTotal} onChange={setPicTotal} range={ranges.pic} />
                                <div className="flex items-center justify-between">
                                    <Label>有视频</Label>
                                    <Switch
                                        checked={mediaTotal.enabled}
                                        onCheckedChange={(v) => setMediaTotal({ ...mediaTotal, enabled: v })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>仅私密</Label>
                                    <Switch
                                        checked={localFilter.secret}
                                        onCheckedChange={(v) => setLocalFilter({ ...localFilter, secret: v })}
                                    />
                                </div>
                                <div className="flex items-center justify-between">
                                    <Label>有位置</Label>
                                    <Switch
                                        checked={localFilter.hasLbs}
                                        onCheckedChange={(v) => setLocalFilter({ ...localFilter, hasLbs: v })}
                                    />
                                </div>
                            </>
                        )}
                        {isShare && (
                            <>
                                <Separator />
                                <div className="text-sm font-medium text-muted-foreground">分享专属</div>
                                <div className="flex items-center justify-between">
                                    <Label>分享来源</Label>
                                    <Select value={shareSource || '__all__'} onValueChange={(v) => setShareSource(v === '__all__' ? '' : v)}>
                                        <SelectTrigger className="w-40">
                                            <SelectValue placeholder="选择来源" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="__all__">全部</SelectItem>
                                            {shareSources.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </>
                        )}
                        <Separator />
                        <DateFilter value={dateFilter} onChange={setDateFilter} serverUrl={serverUrl} filterBase={filterBase} />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDialogOpen(false)}>取消</Button>
                        <Button onClick={handleApply}>
                            应用{filteredCount !== null ? ` (${filteredCount} 条)` : ''}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
});
