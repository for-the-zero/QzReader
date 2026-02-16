import { TopBar } from "./sub/filter";
import Post from "./sub/post";
import { useGlbState } from "../utils/glbState";
import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

export default function Browse({}) {
    const [glbState] = useGlbState();
    const [posts, setPosts] = useState<postType[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [total, setTotal] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const isFirstLoad = useRef(true);

    const fetchPosts = useCallback(async () => {
        if (!glbState.serverUrl || !glbState.usable) return;
        const isFirst = isFirstLoad.current;
        if (isFirst) {
            setLoading(true);
        }
        const reqBody: reqListType = {
            filter: glbState.filter,
            range: [page * pageSize, (page + 1) * pageSize - 1],
        };
        const fetchPromise = fetch(glbState.serverUrl + '/api/get', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reqBody),
        }).then(async (req) => {
            if (!req.ok) throw new Error('请求失败');
            const res = await req.json();
            setPosts(res.list || []);
            setTotal(res.total || 0);
            if (isFirst) {
                isFirstLoad.current = false;
            }
        });
        if (isFirst) {
            try {
                await fetchPromise;
            } catch (e) {
                console.error(e);
                toast.error('加载失败', { position: 'top-center' });
            } finally {
                setLoading(false);
            }
        } else {
            toast.promise(fetchPromise, {
                loading: '加载中...',
                error: '加载失败',
                position: 'top-center',
            });
        }
    }, [glbState.serverUrl, glbState.usable, glbState.filter, page, pageSize]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    useEffect(() => {
        setPage(0);
    }, [glbState.filter, pageSize]);

    const totalPages = Math.ceil(total / pageSize);

    return (
        <div className='flex flex-col justify-center gap-3'>
            <TopBar />
            <div className="flex flex-col gap-4 w-[80%] m-auto">
                {loading ? (
                    <div className="text-center text-muted-foreground py-8">加载中...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">暂无数据</div>
                ) : (
                    posts.map((post) => <Post post={post} />)
                )}
            </div>
            {total > 0 && (
                <div className="flex items-center justify-center gap-4 py-4">
                    <div className="flex items-center gap-2">
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page === 0}
                            onClick={() => setPage(p => Math.max(0, p - 1))}
                        >
                            <ChevronLeft className="size-4" />
                        </Button>
                        <input
                            type="number"
                            min={1}
                            max={totalPages || 1}
                            value={page + 1}
                            onChange={(e) => {
                                const v = parseInt(e.target.value);
                                if (!isNaN(v) && v >= 1 && v <= totalPages) {
                                    setPage(v - 1);
                                }
                            }}
                            className="w-12 h-8 text-center text-sm border rounded-md bg-background"
                        />
                        <span className="text-sm text-muted-foreground">/ {totalPages || 1}</span>
                        <Button
                            variant="outline"
                            size="icon"
                            disabled={page >= totalPages - 1}
                            onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                        >
                            <ChevronRight className="size-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-muted-foreground">每页</span>
                        <Select value={String(pageSize)} onValueChange={(v) => setPageSize(Number(v))}>
                            <SelectTrigger className="w-16 h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {PAGE_SIZE_OPTIONS.map(opt => (
                                    <SelectItem key={opt} value={String(opt)}>{opt}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <span className="text-sm text-muted-foreground">条</span>
                    </div>
                </div>
            )}
        </div>
    );
};